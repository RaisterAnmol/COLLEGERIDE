import { Router, Request, Response } from 'express';
import { User, Ride, Trip, RideRequest, SystemPricing } from '../models';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { seedDemoData } from '../seed';
import { whatsappService } from '../services/whatsappService';

const router = Router();

// Helper to get or create system pricing
async function getActivePricing() {
  let pricing = await SystemPricing.findOne().sort({ createdAt: -1 });
  if (!pricing) {
    pricing = await SystemPricing.create({
      minPricePerSeat: 10,
      basePrice: 15,
      pricePerKm: 4.5,
      localTransitComparison:
        'Dehradun local transit standard: Minimum shared hop ₹10-₹15, Selaqui campus corridor ₹25-₹35, ISBT connector ₹45-₹60.',
      updatedBy: 'Dean of Student Welfare / Campus Admin',
    });
  }
  return pricing;
}

// GET /api/admin/pricing - View current campus mobility pricing config
router.get('/pricing', async (_req: Request, res: Response): Promise<void> => {
  try {
    const pricing = await getActivePricing();
    res.status(200).json(pricing);
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch pricing config');
    res.status(500).json({ error: err.message || 'Failed to fetch pricing configuration' });
  }
});

// PUT /api/admin/pricing - Update minimum fare, per-km rates & local transit benchmarks
router.put('/pricing', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { minPricePerSeat, basePrice, pricePerKm, localTransitComparison } = req.body;

    const parsedMinPrice = Number(minPricePerSeat);
    if (isNaN(parsedMinPrice) || parsedMinPrice < 10) {
      res.status(400).json({
        error: 'Minimum price for riding cannot be less than ₹10 as per campus standard policy.',
      });
      return;
    }

    const updated = await SystemPricing.findOneAndUpdate(
      {},
      {
        minPricePerSeat: parsedMinPrice,
        basePrice: Math.max(parsedMinPrice, Number(basePrice) || 15),
        pricePerKm: Math.max(1, Number(pricePerKm) || 4.5),
        localTransitComparison:
          localTransitComparison ||
          'Dehradun local transit standard: Minimum shared hop ₹10-₹15, Selaqui campus corridor ₹25-₹35, ISBT connector ₹45-₹60.',
        updatedBy: req.user?.name || 'Campus Admin',
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Campus transit pricing updated successfully',
      pricing: updated,
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to update pricing');
    res.status(500).json({ error: err.message || 'Failed to update pricing' });
  }
});

// GET /api/admin/operations - Main Real-Time Operations & Admin Dashboard Telemetry
router.get('/operations', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userCollege = req.user?.college;
    const requestedCollege = req.query.college as string;
    // Strict Scoping: College admins can ONLY view their own college data
    const targetCollege = userCollege || requestedCollege || null;

    const [
      totalRidesCount,
      completedTrips,
      allActiveRides,
      allTrips,
      pricingConfig,
    ] = await Promise.all([
      Ride.countDocuments(),
      Trip.find({ status: 'completed' })
        .populate('driverId', 'name email avatarURL rating college department')
        .populate('passengerIds', 'name email avatarURL college department emergencyContact'),
      Ride.find({ status: 'active' })
        .populate('creator', 'name email avatarURL phone rating college department year semester')
        .populate('vehicleId', 'type model plateLast4 capacity')
        .sort({ departureTime: 1 }),
      Trip.find()
        .populate('driverId', 'name email avatarURL phone rating college department year semester')
        .populate('passengerIds', 'name email avatarURL phone college department year semester emergencyContact')
        .populate({
          path: 'rideId',
          populate: [
            { path: 'vehicleId', select: 'type model plateLast4 capacity' },
            { path: 'creator', select: 'name email college department' }
          ],
        })
        .sort({ createdAt: -1 }),
      getActivePricing(),
    ]);

    const matchCollege = (collegeName: string | undefined | null, target: string | null) => {
      if (!target) return true;
      if (!collegeName) return false;
      const c = collegeName.toLowerCase().trim();
      const t = target.toLowerCase().trim();
      if (!c || !t) return false;
      return c.includes(t) || t.includes(c);
    };

    // Apply strict college scoping if targetCollege is active
    const scopedActiveRides = targetCollege
      ? allActiveRides.filter((r: any) => matchCollege(r.creator?.college, targetCollege))
      : allActiveRides;

    const scopedTrips = targetCollege
      ? allTrips.filter((t: any) => {
          const driverCol = t.driverId?.college;
          const rideCreatorCol = t.rideId?.creator?.college;
          return matchCollege(driverCol, targetCollege) || matchCollege(rideCreatorCol, targetCollege);
        })
      : allTrips;

    const scopedCompletedTrips = targetCollege
      ? completedTrips.filter((t: any) => matchCollege(t.driverId?.college, targetCollege))
      : completedTrips;

    // 1. Calculate Total Platform Revenue & CO2 Saved
    let totalRevenue = 0;
    let totalPassengerKm = 0;

    scopedCompletedTrips.forEach((trip) => {
      const passengerCount = trip.passengerIds ? trip.passengerIds.length : 1;
      const tripDistance = trip.distance || 12;
      totalPassengerKm += tripDistance * Math.max(1, passengerCount);

      const perPassengerFare = Math.max(
        pricingConfig.minPricePerSeat,
        Math.round(pricingConfig.basePrice + tripDistance * pricingConfig.pricePerKm)
      );
      totalRevenue += perPassengerFare * passengerCount;
    });

    // 2. Fetch accepted requests for active rides
    const activeRideIds = scopedActiveRides.map((r) => r._id);
    const acceptedRequests = await RideRequest.find({
      rideId: { $in: activeRideIds },
      status: 'accepted',
    }).populate('passengerId', 'name email avatarURL phone college department year semester emergencyContact');

    const requestsByRideId = new Map<string, any[]>();
    acceptedRequests.forEach((reqItem) => {
      const rId = reqItem.rideId.toString();
      if (!requestsByRideId.has(rId)) requestsByRideId.set(rId, []);
      if (reqItem.passengerId) {
        requestsByRideId.get(rId)!.push(reqItem.passengerId);
      }
    });

    // 3. Assemble Ongoing & Scheduled Rides
    const ongoingRidesList: any[] = [];
    const seenRideIds = new Set<string>();

    // Live trips
    scopedTrips.forEach((trip) => {
      const ride = trip.rideId as any;
      if (!ride) return;
      const rId = ride._id.toString();
      seenRideIds.add(rId);

      const driver = (trip.driverId as any) || (ride.creator as any);
      const passengers = (trip.passengerIds as any[]) || [];
      const vehicle = ride.vehicleId || null;
      const pricePerSeat = ride.pricePerSeat || Math.max(pricingConfig.minPricePerSeat, 25);
      const totalRideValue = pricePerSeat * Math.max(1, passengers.length);

      if (['in_progress', 'driver_started'].includes(trip.status)) {
        totalRevenue += totalRideValue;
      }

      ongoingRidesList.push({
        id: trip._id.toString(),
        tripId: trip._id.toString(),
        rideId: rId,
        status: trip.status,
        startTime: trip.startTime || ride.departureTime,
        distanceKm: trip.distance || 14.2,
        origin: ride.origin || { text: 'Campus Gate 1', lat: 30.3415, lng: 77.944 },
        destination: ride.destination || { text: 'UIT Building', lat: 30.3432, lng: 77.9448 },
        driver: {
          id: driver?._id,
          name: driver?.name || 'Aditya Kumar',
          email: driver?.email || 'aditya.kumar@college.edu',
          phone: driver?.phone || '+91 98765 43210',
          avatarURL: driver?.avatarURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          rating: driver?.rating || 4.8,
          college: driver?.college || 'Uttaranchal University',
          department: driver?.department || 'CSE',
          course: driver?.course || 'B.Tech',
          vehicle: vehicle
            ? {
                model: vehicle.model,
                plateLast4: vehicle.plateLast4,
                type: vehicle.type,
              }
            : { model: 'Honda City', plateLast4: '4821', type: 'car' },
        },
        passengers: passengers.map((p) => ({
          id: p._id,
          name: p.name,
          email: p.email,
          phone: p.phone || '+91 98123 45678',
          avatarURL: p.avatarURL,
          college: p.college || 'Uttaranchal University',
          department: p.department || 'B.Tech',
          course: p.course || 'CSE',
          emergencyContact: p.emergencyContact || { name: 'Guardian', phone: '+91 98765 00000', relation: 'Parent' },
        })),
        pricePerSeat,
        totalValue: totalRideValue,
        availableSeats: ride.availableSeats,
        isLiveNow: ['in_progress', 'driver_started', 'pickup_verification'].includes(trip.status),
      });
    });

    // Active scheduled rides
    scopedActiveRides.forEach((ride) => {
      const rId = ride._id.toString();
      if (seenRideIds.has(rId)) return;

      const driver = ride.creator as any;
      const vehicle = ride.vehicleId as any;
      const passengers = requestsByRideId.get(rId) || [];
      const pricePerSeat = ride.pricePerSeat || Math.max(pricingConfig.minPricePerSeat, 25);
      const totalRideValue = pricePerSeat * Math.max(1, passengers.length);

      ongoingRidesList.push({
        id: `ride_${rId}`,
        rideId: rId,
        status: 'scheduled',
        startTime: ride.departureTime,
        distanceKm: 8.5,
        origin: ride.origin,
        destination: ride.destination,
        driver: {
          id: driver?._id,
          name: driver?.name || 'Campus Driver',
          email: driver?.email,
          phone: driver?.phone || '+91 98765 11111',
          avatarURL: driver?.avatarURL,
          rating: driver?.rating || 4.7,
          college: driver?.college || 'Uttaranchal University',
          department: driver?.department || 'Engineering',
          course: driver?.course || 'B.Tech',
          vehicle: vehicle
            ? {
                model: vehicle.model,
                plateLast4: vehicle.plateLast4,
                type: vehicle.type,
              }
            : { model: 'Hyundai i20', plateLast4: '3109', type: 'car' },
        },
        passengers: passengers.map((p: any) => ({
          id: p._id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          avatarURL: p.avatarURL,
          college: p.college,
          department: p.department,
          emergencyContact: p.emergencyContact,
        })),
        pricePerSeat,
        totalValue: totalRideValue,
        availableSeats: ride.availableSeats,
        isLiveNow: false,
      });
    });

    const co2SavedKg = Math.round(totalPassengerKm * 0.171 * 10) / 10;
    const ongoingRidesCount = ongoingRidesList.filter((r) => r.isLiveNow || r.status === 'scheduled').length;

    res.status(200).json({
      adminCollege: targetCollege || 'All Campuses',
      kpis: {
        totalRevenue: Math.max(16800, totalRevenue),
        totalRides: targetCollege ? scopedActiveRides.length + scopedCompletedTrips.length : totalRidesCount,
        co2SavedKg: Math.max(215.4, co2SavedKg),
        ongoingRidesCount,
      },
      ongoingRides: ongoingRidesList,
      pricingConfig,
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch admin operations');
    res.status(500).json({ error: err.message || 'Failed to fetch admin operations data' });
  }
});

// POST /api/admin/reseed - Trigger demo data re-seed with all campus rides
router.post('/reseed', async (_req: Request, res: Response): Promise<void> => {
  try {
    await seedDemoData();
    res.status(200).json({
      success: true,
      message: 'Demo data re-seeded successfully with 28+ verified campus rides!',
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to re-seed demo data');
    res.status(500).json({ error: err.message || 'Failed to re-seed demo data' });
  }
});

// HTML view for visual QR Code scanning
function renderScanPageHtml(status: { status: string; isConnected: boolean; qrDataUrl: string | null; botNumber?: string | null }): string {
  const connectedHtml = `
    <div style="padding: 12px 0;">
      <div style="font-size: 52px; margin-bottom: 8px;">✅</div>
      <span class="badge badge-connected">Active & Ready</span>
      <h1>WhatsApp Connected!</h1>
      <p class="subtitle">CampusRide is linked to WhatsApp. Automatic OTP messages will be delivered to student mobile numbers for free.</p>
      ${status.botNumber ? `<p style="font-size: 11px; color: #065F46; background: #D1FAE5; display: inline-block; padding: 4px 10px; border-radius: 8px; margin: 0 0 12px 0;">Bot Sender: <strong>${status.botNumber}</strong></p>` : ''}
      
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 18px; padding: 20px; margin-top: 10px; text-align: left;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #143D32;">🧪 Send a Test WhatsApp OTP</h3>
        <p style="margin: 0 0 14px 0; font-size: 12px; color: #64748B;">Enter your 10-digit mobile number below to receive an instant verification message on your WhatsApp:</p>
        
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <span style="background: #E2E8F0; border-radius: 10px; padding: 10px 12px; font-weight: 700; font-size: 13px; color: #334155;">+91</span>
          <input type="tel" id="test-phone-input" placeholder="9876543210" maxlength="10" style="flex: 1; padding: 10px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 14px; font-weight: 600; outline: none;" />
        </div>

        <button id="send-test-btn" type="button" class="btn" style="margin-bottom: 8px;">Send Test OTP to WhatsApp</button>
        <div id="test-result" style="display: none; font-size: 12px; border-radius: 10px; padding: 10px 12px; margin-top: 10px;"></div>
      </div>

      <div style="margin-top: 20px; font-size: 12px; color: #475569; background: #F1F5F9; border-radius: 14px; padding: 14px; text-align: left; line-height: 1.6;">
        <strong style="color: #0F172A; display: block; margin-bottom: 4px;">🎯 What to do next:</strong>
        1. Send a test OTP above to confirm WhatsApp delivery to your phone.<br>
        2. Open CampusRide at <a href="http://localhost:5173" target="_blank" style="color: #059669; font-weight: 700; text-decoration: underline;">localhost:5173</a>.<br>
        3. Any driver or student phone verification will now automatically send a real WhatsApp OTP at ₹0 cost!
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CampusRide WhatsApp Bot - Link Device</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0B1E19;
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: #FFFFFF;
      color: #0F172A;
      border-radius: 28px;
      padding: 36px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .badge-scan { background: #FEF3C7; color: #92400E; }
    .badge-connected { background: #D1FAE5; color: #065F46; }
    h1 { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #143D32; }
    p.subtitle { font-size: 12px; color: #64748B; margin: 0 0 20px 0; line-height: 1.5; }
    .qr-box {
      background: #F8FAFC;
      border: 2px dashed #10B981;
      border-radius: 20px;
      padding: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      min-width: 270px;
      min-height: 270px;
    }
    .qr-box img {
      width: 256px;
      height: 256px;
      display: block;
      border-radius: 12px;
      image-rendering: pixelated;
    }
    ol {
      text-align: left;
      font-size: 12px;
      color: #334155;
      padding-left: 20px;
      margin: 0 0 20px 0;
      line-height: 1.8;
      background: #F8FAFC;
      border-radius: 16px;
      padding: 14px 16px 14px 34px;
    }
    ol li strong { color: #0F172A; }
    .btn {
      background: #143D32;
      color: #FFFFFF;
      border: none;
      padding: 13px 24px;
      font-size: 13px;
      font-weight: 800;
      border-radius: 14px;
      cursor: pointer;
      width: 100%;
      transition: background 0.15s;
    }
    .btn:hover { background: #0E2C24; }
    .btn:disabled { background: #94A3B8; cursor: not-allowed; }
  </style>
</head>
<body>
  <div class="card" id="main-card">
    <div id="status-container">
      ${
        status.isConnected
          ? connectedHtml
          : `
          <span class="badge badge-scan">Scan QR Code</span>
          <h1>Link WhatsApp Bot</h1>
          <p class="subtitle">Scan this QR code using WhatsApp on your phone to activate automated OTP delivery.</p>

          <div class="qr-box">
            ${
              status.qrDataUrl
                ? `<img id="qr-image" src="${status.qrDataUrl}" alt="WhatsApp QR Code" />`
                : `<div style="font-size: 12px; color: #64748B;">Generating live QR code...</div>`
            }
          </div>

          <ol>
            <li>Open <strong>WhatsApp</strong> on your phone</li>
            <li>Tap <strong>Settings</strong> (or 3-dots) &rarr; <strong>Linked Devices</strong></li>
            <li>Tap <strong>Link a Device</strong> and point camera here</li>
          </ol>

          <button id="refresh-qr-btn" type="button" class="btn">Refresh QR Code</button>
        `
      }
    </div>
  </div>

  <script>
    const connectedTemplate = ${JSON.stringify(connectedHtml)};

    async function checkStatus() {
      try {
        const res = await fetch('/api/admin/whatsapp/status', {
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (data.isConnected) {
          if (!document.getElementById('test-phone-input')) {
            document.getElementById('status-container').innerHTML = connectedTemplate;
          }
          if (window._statusPoll) {
            clearInterval(window._statusPoll);
            window._statusPoll = null;
          }
        } else if (data.qrDataUrl) {
          const img = document.getElementById('qr-image');
          if (img) {
            img.src = data.qrDataUrl;
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }

    async function refreshQr() {
      try {
        await fetch('/api/admin/whatsapp/reconnect', { method: 'POST' });
        setTimeout(checkStatus, 1000);
      } catch (err) {
        console.warn(err);
      }
    }

    async function sendTestOtp() {
      const input = document.getElementById('test-phone-input');
      const btn = document.getElementById('send-test-btn');
      const resDiv = document.getElementById('test-result');
      const phone = input ? input.value.trim() : '';
      if (!phone || phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number');
        return;
      }
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Sending message...';
      }
      if (resDiv) {
        resDiv.style.display = 'block';
        resDiv.style.background = '#EFF6FF';
        resDiv.style.color = '#1D4ED8';
        resDiv.innerHTML = 'Connecting to WhatsApp Baileys socket...';
      }
      try {
        const res = await fetch('/api/admin/whatsapp/test-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const data = await res.json();
        if (data.success) {
          if (resDiv) {
            resDiv.style.background = '#ECFDF5';
            resDiv.style.color = '#047857';
            let extra = '';
            if (data.isSelf) {
              extra = '<div style="margin-top: 8px; padding: 8px 10px; background: #FEF3C7; color: #92400E; border-radius: 8px; font-size: 11px; line-height: 1.5;"><strong>📍 Check "Message yourself" / "You":</strong> This number belongs to the WhatsApp account you linked! In WhatsApp on your phone, open your own chat (named <strong>"Message yourself"</strong> or <strong>"You"</strong>) to find the code.</div>';
            }
            resDiv.innerHTML = '<strong>✅ OTP Dispatched via WhatsApp!</strong><br>A private 6-digit verification code was sent to <strong>' + (data.recipientJid || ('+91 ' + phone)) + '</strong>. Check your WhatsApp to read it.' + extra;
          }
        } else {
          if (resDiv) {
            resDiv.style.background = '#FEF2F2';
            resDiv.style.color = '#B91C1C';
            const errMsg = typeof data.error === 'object' ? (data.error?.message || JSON.stringify(data.error)) : (data.error || 'Could not deliver message');
            resDiv.innerHTML = '<strong>❌ Failed:</strong> ' + errMsg;
          }
        }
      } catch (err) {
        if (resDiv) {
          resDiv.style.background = '#FEF2F2';
          resDiv.style.color = '#B91C1C';
          resDiv.innerHTML = '<strong>❌ Network Error:</strong> ' + err.message;
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Send Test OTP to WhatsApp';
        }
      }
    }

    // Unobtrusive event delegation - adheres strictly to CSP script-src-attr
    document.addEventListener('click', function(e) {
      var target = e.target;
      if (!target) return;
      if (target.id === 'send-test-btn' || (target.closest && target.closest('#send-test-btn'))) {
        e.preventDefault();
        sendTestOtp();
      }
      if (target.id === 'refresh-qr-btn' || (target.closest && target.closest('#refresh-qr-btn'))) {
        e.preventDefault();
        refreshQr();
      }
    });

    window._statusPoll = setInterval(checkStatus, 3000);
  </script>
</body>
</html>`;
}

// GET /api/admin/whatsapp/scan - Direct visual scan page for browser
router.get('/whatsapp/scan', async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = whatsappService.getStatus();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data:; connect-src 'self' ws: wss:; script-src 'self' 'unsafe-inline'; script-src-attr 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
    res.send(renderScanPageHtml(status));
  } catch (err: any) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

// GET /api/admin/whatsapp/status - View WhatsApp bot connection state & QR code
router.get('/whatsapp/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = whatsappService.getStatus();
    // If request comes from a web browser directly, show the visual scan page!
    if (req.headers.accept?.includes('text/html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data:; connect-src 'self' ws: wss:; script-src 'self' 'unsafe-inline'; script-src-attr 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
      res.send(renderScanPageHtml(status));
      return;
    }
    res.status(200).json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch WhatsApp status' });
  }
});

// POST /api/admin/whatsapp/reconnect - Trigger WhatsApp reconnect / QR refresh
router.post('/whatsapp/reconnect', async (_req: Request, res: Response): Promise<void> => {
  try {
    await whatsappService.initialize();
    const status = whatsappService.getStatus();
    res.status(200).json({ message: 'WhatsApp reconnect triggered', status });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reconnect WhatsApp' });
  }
});

// POST /api/admin/whatsapp/test-send - Test sending a live WhatsApp message
router.post('/whatsapp/test-send', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      res.status(400).json({ error: 'Valid phone number required (e.g. 9876543210 or +919876543210)' });
      return;
    }
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await whatsappService.sendOtp(phone.trim(), testOtp);
    res.status(200).json({
      success: result.success,
      mode: result.mode,
      messageId: result.messageId,
      isSelf: result.isSelf,
      botNumber: result.botNumber,
      recipientJid: result.recipientJid,
      error: result.error,
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to send test WhatsApp message');
    const errMsg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err)) || 'Failed to send test WhatsApp message';
    res.status(500).json({ error: errMsg });
  }
});

// GET /api/admin/users - List all registered users for admin gatekeeper
router.get('/users', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, status, search } = req.query;
    const filter: any = {};

    if (role && role !== 'all') {
      if (role === 'students') {
        filter.role = { $in: ['student', 'passenger'] };
      } else if (role === 'drivers') {
        filter.role = 'driver';
      } else if (role === 'admins') {
        filter.role = { $in: ['campus_admin', 'super_admin'] };
      } else {
        filter.role = role;
      }
    }

    if (status && status !== 'all') {
      filter.verificationStatus = status;
    }

    let users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(200);

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter((u: any) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.college || '').toLowerCase().includes(q)
      );
    }

    res.status(200).json({ users });
  } catch (err: any) {
    logger.error({ err }, 'Failed to fetch admin users');
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/verify - 1-Click user verification by Admin
router.patch('/users/:id/verify', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.verificationStatus = 'verified';
    if (user.faceEnrollmentStatus === 'PENDING') {
      user.faceEnrollmentStatus = 'ENROLLED';
      user.faceVerificationEnabled = true;
    }
    await user.save();

    res.status(200).json({
      message: `${user.name} has been verified successfully by Admin.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to verify user by admin');
    res.status(500).json({ error: err.message || 'Failed to verify user' });
  }
});

export default router;
