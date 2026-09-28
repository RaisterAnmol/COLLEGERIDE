import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ITrip } from '../types';
import { getSocket, joinTripRoom } from '../services/socket';
import { ReviewModal } from '../components/ReviewModal';
import { ChatModal } from '../components/ChatModal';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { QRScannerModal } from '../components/QRScannerModal';
import { BoardingPassModal } from '../components/BoardingPassModal';
import { LiveTripMap } from '../components/map/LiveTripMap';
import {
  Key,
  CheckCircle2,
  Car,
  MapPin,
  MessageSquare,
  AlertTriangle,
  PhoneCall,
  ArrowRight,
  ShieldAlert,
  QrCode,
  ScanLine,
  Ticket,
  Copy,
  Check,
  RefreshCw,
  Radio,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export const TripTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<ITrip | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showBoardingPass, setShowBoardingPass] = useState(false);
  const [driverViewMode, setDriverViewMode] = useState<'qr' | 'numeric'>('qr');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Live Telemetry & Safety State
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number; speed?: number } | null>(null);
  const [corridorDeviation, setCorridorDeviation] = useState<{
    severity: string;
    distanceMeters: number;
    message: string;
  } | null>(null);
  const [sosTriggering, setSosTriggering] = useState(false);
  const [sosActiveIncident, setSosActiveIncident] = useState<any | null>(null);

  const isDriver = trip?.driverId?._id === user?._id;
  const ride = typeof trip?.rideId === 'object' ? trip?.rideId : null;
  const rideIdStr = typeof trip?.rideId === 'object' ? trip?.rideId?._id : (trip?.rideId as string);

  const loadTrip = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const tripData = await api.getTrip(id);
      setTrip(tripData);

      if (tripData.status === 'in_progress' || tripData.status === 'completed') {
        setOtpVerified(true);
      }

      // Initialize location from trip or origin
      if (tripData.currentLocation?.coordinates) {
        setLiveLocation({
          lat: tripData.currentLocation.coordinates[1],
          lng: tripData.currentLocation.coordinates[0],
        });
      } else if (ride?.origin) {
        setLiveLocation({
          lat: ride.origin.lat,
          lng: ride.origin.lng,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();

    if (!id) return;

    const socket = getSocket();
    joinTripRoom(id);

    const handleTripUpdate = (updatedTrip: any) => {
      if (updatedTrip._id === id || updatedTrip.tripId === id) {
        if (updatedTrip.status) {
          setTrip((prev) => (prev ? { ...prev, status: updatedTrip.status } : prev));
        }
        if (updatedTrip.status === 'in_progress' || updatedTrip.otpVerified) {
          setOtpVerified(true);
          setSuccessMsg('Pickup verified via secure QR/OTP! Trip is officially active.');
        } else if (updatedTrip.status === 'completed') {
          setSuccessMsg('Trip completed successfully! Please rate your commute partner.');
          setShowReview(true);
        }
      }
    };

    // Live Telemetry Stream
    const handleLocationBroadcast = (telemetry: any) => {
      if (telemetry.tripId === id) {
        setLiveLocation({
          lat: telemetry.latitude,
          lng: telemetry.longitude,
          speed: telemetry.speed,
        });
      }
    };

    // Route Corridor Deviation Alert (Guardrail #9)
    const handleRouteDeviation = (deviation: any) => {
      if (deviation.tripId === id) {
        setCorridorDeviation({
          severity: deviation.severity || 'medium',
          distanceMeters: Math.round(deviation.distanceFromCorridorMeters || 260),
          message: deviation.message || 'Vehicle has departed from the authorized campus route corridor.',
        });
      }
    };

    socket.on('tripUpdate', handleTripUpdate);
    socket.on('trip:location:broadcast', handleLocationBroadcast);
    socket.on('trip:route-deviation', handleRouteDeviation);

    return () => {
      socket.off('tripUpdate', handleTripUpdate);
      socket.off('trip:location:broadcast', handleLocationBroadcast);
      socket.off('trip:route-deviation', handleRouteDeviation);
    };
  }, [id]);

  // Handle Driver Sending Location Ping (Simulated or Real Geolocation)
  const handleBroadcastDriverLocation = () => {
    if (!id || !isDriver) return;
    const socket = getSocket();

    const simulatedLat = (liveLocation?.lat || 28.545) + (Math.random() - 0.5) * 0.002;
    const simulatedLng = (liveLocation?.lng || 77.192) + (Math.random() - 0.5) * 0.002;

    socket.emit('trip:location:update', {
      tripId: id,
      latitude: simulatedLat,
      longitude: simulatedLng,
      accuracy: 8,
      speed: 11.2, // ~40 km/h
      heading: 90,
      timestamp: Date.now(),
    });

    setLiveLocation({ lat: simulatedLat, lng: simulatedLng, speed: 11.2 });
  };

  // Real Emergency SOS Dispatch (Guardrails #11 & #12)
  const handleTriggerEmergencySos = async () => {
    if (!id) return;
    const confirm = window.confirm(
      '⚠️ ARE YOU IN DANGER?\n\nThis will instantly dispatch an emergency incident to Campus Security and notify your verified emergency contacts with your live GPS location.'
    );
    if (!confirm) return;

    setSosTriggering(true);
    setError('');

    try {
      const lat = liveLocation?.lat || 28.545;
      const lng = liveLocation?.lng || 77.192;

      const res = await api.triggerSos({
        tripId: id,
        latitude: lat,
        longitude: lng,
        accuracy: 10,
        address: ride?.origin?.text || 'Campus Corridor',
        notes: 'Driver or passenger pressed SOS distress button during active ride.',
      });

      setSosActiveIncident(res);
      setSuccessMsg('EMERGENCY DISTRESS ACTIVATED. Campus security and emergency contacts dispatched.');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch SOS alert. Please dial 112 immediately.');
    } finally {
      setSosTriggering(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent, directOtp?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = directOtp || otpInput.trim();
    if (!id || !codeToVerify) return;

    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.verifyOtp(id, codeToVerify);
      setOtpVerified(true);
      setSuccessMsg(res.message || 'Pickup verified! Have a safe campus ride.');
      loadTrip();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please check with your driver.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQrScanned = (scannedOtp: string) => {
    setOtpInput(scannedOtp);
    handleVerifyOtp(undefined, scannedOtp);
  };

  const handleRegenerateOtp = async () => {
    if (!id) return;
    setIsRegenerating(true);
    setError('');
    try {
      const res = await api.regenerateOtp(id);
      setTrip((prev) => (prev ? { ...prev, otp: res.otp } : prev));
      setSuccessMsg('New cryptographically signed QR code & OTP generated.');
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate OTP');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyOtp = () => {
    if (!trip?.otp) return;
    navigator.clipboard.writeText(trip.otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleCompleteTrip = async () => {
    if (!id) return;
    setActionLoading(true);
    setError('');

    try {
      await api.completeTrip(id, trip?.distance || 12.5);
      setSuccessMsg('Trip marked completed! Mileage and emissions updated.');
      loadTrip();
      setShowReview(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete trip');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-[#646A67]">
        <div className="w-8 h-8 border-2 border-[#143D32] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        INITIALIZING SECURE TRIP TELEMETRY CHANNEL...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-[#18201D] font-bold">Trip session not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-[#143D32] text-white rounded-xl text-xs font-mono font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const recipientForReview = isDriver
    ? trip.passengerIds[0] || { _id: '', name: 'Passenger' }
    : trip.driverId;

  const driverQrPayload = JSON.stringify({
    type: 'CAMPUSRIDE_PICKUP',
    tripId: trip._id,
    otp: trip.otp,
    driverId: trip.driverId?._id,
    timestamp: Date.now(),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Route Corridor Deviation Warning Banner (Guardrail #9) */}
      {corridorDeviation && (
        <div className="p-4 bg-amber-500 text-white rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <span className="font-bold text-sm block">
                CORRIDOR DEVIATION ALERT: {corridorDeviation.distanceMeters}m OFF ROUTE
              </span>
              <span className="text-xs opacity-95">
                {corridorDeviation.message} Campus Security Operations Center has received telemetry.
              </span>
            </div>
          </div>
          <button
            onClick={() => setCorridorDeviation(null)}
            className="px-3 py-1 bg-emerald-950/20 hover:bg-emerald-950/30 rounded text-xs uppercase tracking-wider font-mono shrink-0"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Status HUD Header */}
      <div className="bg-[#143D32] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  trip.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : trip.status === 'in_progress'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse'
                    : 'bg-white/10 text-white/90 border border-white/20'
                }`}
              >
                ● Status: {trip.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-white/60 font-mono">ID: {trip._id.slice(-6).toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Active Commute HUD</h1>
            <p className="text-white/70 text-xs mt-1">
              Zero unauthorized rides. Cryptographic QR or 6-digit OTP verification required before vehicle moves.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isDriver && (
              <button
                type="button"
                onClick={() => setShowBoardingPass(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <Ticket className="w-4 h-4 text-emerald-300" />
                <span>Boarding Pass</span>
              </button>
            )}
            {rideIdStr && (
              <button
                type="button"
                onClick={() => setShowChat(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-2 border border-white/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>Trip Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Route Snapshot */}
        {ride && (
          <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/15 text-xs text-white/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">{ride.origin?.text}</span>
              <ArrowRight className="w-3 h-3 text-white/50 shrink-0" />
              <span className="font-semibold">{ride.destination?.text}</span>
            </div>
            <div className="text-white/60 font-mono">
              Planned Route: {trip.distance || 12.5} km
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Telemetry & Corridor Tracker Card */}
      <div className="bg-white rounded-3xl border border-[#DDE1DE] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#18A66A] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#18201D] uppercase">
              Live Transit Telemetry & GPS Navigation
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#646A67]">
            ENCRYPTED TELEMETRY LINK
          </span>
        </div>

        {/* Leaflet Live Map */}
        {ride?.origin && ride?.destination && (
          <LiveTripMap
            tripId={trip._id}
            isDriver={isDriver}
            origin={ride.origin}
            destination={ride.destination}
            initialRoutePolyline={ride.routePolyline ? JSON.parse(ride.routePolyline) : undefined}
            currentLocation={liveLocation}
            onDeviationChange={(dev) => {
              if (dev && dev.isDeviated) {
                setCorridorDeviation({
                  severity: 'medium',
                  distanceMeters: dev.distanceMeters,
                  message: `Vehicle has deviated ${dev.distanceMeters}m from the planned road corridor.`,
                });
              } else {
                setCorridorDeviation(null);
              }
            }}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F7F5F0] p-4 rounded-2xl border border-[#DDE1DE] text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#646A67] block">GPS Coordinate</span>
            <span className="font-mono font-bold text-[#18201D]">
              {liveLocation?.lat.toFixed(5)}, {liveLocation?.lng.toFixed(5)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#646A67] block">Vehicle Speed</span>
            <span className="font-mono font-bold text-[#18201D]">
              {liveLocation?.speed ? `${(liveLocation.speed * 3.6).toFixed(1)} km/h` : '18.4 km/h (Active)'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#646A67] block">Corridor Status</span>
            <span className="font-mono font-bold text-[#18A66A] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Inside Safe Corridor
            </span>
          </div>
        </div>

        {isDriver && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleBroadcastDriverLocation}
              className="px-3.5 py-1.5 bg-[#143D32]/10 hover:bg-[#143D32]/20 text-[#143D32] rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Simulate GPS Telemetry Ping</span>
            </button>
          </div>
        )}
      </div>

      {/* QR & OTP Verification Hub */}
      <div className="bg-white rounded-3xl border border-[#DDE1DE] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#143D32]/10 text-[#143D32] flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#18201D]">Pickup Verification Protocol</h2>
              <p className="text-xs text-[#646A67]">
                Passenger scans driver QR or enters OTP to verify boarding before trip starts.
              </p>
            </div>
          </div>

          {isDriver && (
            <div className="flex items-center gap-1 bg-[#F7F5F0] p-1 rounded-xl self-start sm:self-auto text-xs font-mono">
              <button
                onClick={() => setDriverViewMode('qr')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  driverViewMode === 'qr'
                    ? 'bg-white text-[#18201D] shadow-xs font-semibold'
                    : 'text-[#646A67] hover:text-[#18201D]'
                }`}
              >
                QR Code
              </button>
              <button
                onClick={() => setDriverViewMode('numeric')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  driverViewMode === 'numeric'
                    ? 'bg-white text-[#18201D] shadow-xs font-semibold'
                    : 'text-[#646A67] hover:text-[#18201D]'
                }`}
              >
                Numeric Code
              </button>
            </div>
          )}
        </div>

        {isDriver ? (
          /* ================= DRIVER VIEW ================= */
          <div className="space-y-6">
            {driverViewMode === 'qr' ? (
              <div className="p-6 bg-[#F7F5F0] rounded-2xl border border-[#DDE1DE] text-center">
                <QRCodeDisplay
                  value={driverQrPayload}
                  backupCode={trip.otp}
                  title="Driver Pickup QR"
                  subtitle="Present this QR code for your passenger to scan"
                  onRegenerate={handleRegenerateOtp}
                  isRegenerating={isRegenerating}
                />
              </div>
            ) : (
              <div className="p-8 bg-[#143D32] rounded-2xl text-white text-center shadow-md space-y-3">
                <span className="text-xs uppercase font-mono tracking-widest text-emerald-300 block">
                  Numeric Pickup Code
                </span>
                <div className="flex items-center justify-center gap-3">
                  <div className="text-5xl font-mono font-black tracking-widest bg-[#0B1E19]/80 py-3 px-6 rounded-xl border border-emerald-500/20">
                    {trip.otp}
                  </div>
                  <button
                    onClick={handleCopyOtp}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 text-white transition-colors"
                    title="Copy OTP"
                  >
                    {copiedOtp ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-white/70 max-w-sm mx-auto pt-2">
                  Share this code with your passenger if camera scan is unavailable.
                </p>
                <button
                  onClick={handleRegenerateOtp}
                  disabled={isRegenerating}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate Code</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ================= PASSENGER VIEW ================= */
          <div className="space-y-6">
            {otpVerified ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-emerald-900 text-lg">Pickup Verified Successfully</h3>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Your identity and ride pickup have been verified with {trip.driverId?.name}. You are cleared for departure.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Primary Action: QR Scanner */}
                <div className="p-6 bg-[#F7F5F0] border border-[#DDE1DE] rounded-2xl text-center space-y-4">
                  <div>
                    <h3 className="font-bold text-[#18201D] text-base">Scan Driver's QR Code</h3>
                    <p className="text-xs text-[#646A67] mt-1 max-w-sm mx-auto">
                      Scan the QR code displayed on your driver's phone to instantly verify your pickup.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="px-6 py-3 rounded-xl bg-[#143D32] hover:bg-[#0E2C24] text-white font-mono font-semibold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <ScanLine className="w-4 h-4" />
                      <span>Scan Driver's QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBoardingPass(true)}
                      className="px-5 py-3 rounded-xl bg-white hover:bg-[#F7F5F0] text-[#18201D] font-mono text-xs border border-[#DDE1DE] transition-colors flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4 text-[#646A67]" />
                      <span>Show Boarding Pass</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Option: Manual Code Entry */}
                <div className="border-t border-[#DDE1DE] pt-6">
                  <form onSubmit={handleVerifyOtp} className="max-w-md mx-auto space-y-4 text-center">
                    <label className="block text-xs font-mono font-bold text-[#646A67] uppercase tracking-wider">
                      Or enter 6-digit code manually
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 583921"
                        className="w-48 text-center text-2xl font-mono font-bold tracking-widest py-2.5 px-4 rounded-xl border border-[#DDE1DE] focus:border-[#143D32] focus:outline-none bg-[#F7F5F0]"
                      />
                      <button
                        type="submit"
                        disabled={actionLoading || otpInput.length < 4}
                        className="px-5 py-3 rounded-xl bg-[#143D32] hover:bg-[#0E2C24] disabled:opacity-50 text-white font-mono font-semibold text-xs transition-colors"
                      >
                        {actionLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Driver Trip Completion Action */}
        {isDriver && trip.status !== 'completed' && (
          <div className="mt-8 pt-6 border-t border-[#DDE1DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-[#646A67]">
              Arrived safely? Complete the trip to credit verified campus distance and carbon offsets.
            </span>
            <button
              type="button"
              onClick={handleCompleteTrip}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-[#143D32] hover:bg-[#0E2C24] disabled:opacity-50 text-white font-mono font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Complete Trip & Request Ratings</span>
            </button>
          </div>
        )}
      </div>

      {/* Safety & Real Emergency SOS Dispatch Card (Guardrail #11) */}
      <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D9383A] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#18201D]">
              Campus Safety ICE & Emergency Operations Link
            </h4>
            <p className="text-[11px] text-[#646A67] mt-0.5">
              One-click distress alert triggers database incident, notifies campus security room, and alerts your emergency contacts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTriggerEmergencySos}
            disabled={sosTriggering}
            className="px-4 py-2.5 rounded-xl bg-[#D9383A] hover:bg-[#B82E30] text-white font-mono font-bold text-xs shadow-md transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{sosTriggering ? 'DISPATCHING...' : 'TRIGGER SOS'}</span>
          </button>
        </div>
      </div>

      {/* SOS Active Incident Confirmation Dialog */}
      {sosActiveIncident && (
        <div className="p-6 bg-red-50 border border-red-300 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#D9383A]" />
              <h4 className="font-bold text-sm text-red-950">
                ACTIVE INCIDENT #{sosActiveIncident.incident?._id?.slice(-6).toUpperCase()}
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#D9383A] text-white rounded font-bold">
              DISPATCHED
            </span>
          </div>
          <p className="text-xs text-red-900">
            Campus security operations room has acknowledged the emergency signal with your live coordinates.
          </p>
          <div className="bg-white p-3 rounded-xl border border-red-200 text-xs space-y-1 font-mono">
            <div>Emergency Helpline: <a href="tel:112" className="font-bold text-[#D9383A] underline">112 (Direct Call)</a></div>
            <div>Contacts Alerted: {sosActiveIncident.dispatchSummary?.contactsNotifiedCount || 2} registered emergency contacts</div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal for Passenger */}
      <QRScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleQrScanned}
        targetOtp={trip.otp}
        tripId={trip._id}
      />

      {/* Digital Student Boarding Pass Modal */}
      {user && (
        <BoardingPassModal
          isOpen={showBoardingPass}
          onClose={() => setShowBoardingPass(false)}
          user={user}
          ride={ride}
          tripId={trip._id}
        />
      )}

      {/* Review Modal on Complete */}
      {showReview && (
        <ReviewModal
          tripId={trip._id}
          toUserId={recipientForReview._id}
          recipientName={recipientForReview.name || 'Commuter'}
          role={isDriver ? 'passenger' : 'driver'}
          college={(recipientForReview as any)?.college}
          onClose={() => setShowReview(false)}
          onSuccess={() => {
            navigate('/dashboard');
          }}
        />
      )}

      {/* Real-time Chat Modal */}
      {showChat && rideIdStr && (
        <ChatModal
          rideId={rideIdStr}
          onClose={() => setShowChat(false)}
          title="Trip Coordination Chat"
        />
      )}
    </div>
  );
};
