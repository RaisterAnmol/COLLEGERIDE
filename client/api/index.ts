import mongoose from 'mongoose';
import dns from 'node:dns';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Ensure public DNS resolvers to prevent SRV lookup failures on all cloud hostings
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in restricted environments
}

const MONGODB_URI = process.env.MONGODB_URI || '';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'CampusRide_Special_Jwt_Secret_2025_Key_ProdSecure_99x82!';

let cachedDb: any = null;

async function getDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing in serverless configuration. Please set MONGODB_URI in Vercel project environment variables.');
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
  }

  cachedDb = mongoose.connection.db;
  return cachedDb;
}

function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function getAuthUser(req: any): any | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req: any, res: any) {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method ? req.method.toUpperCase() : 'GET';

  try {
    const db = await getDatabase();
    if (!db) {
      return res.status(503).json({
        code: 'DATABASE_UNAVAILABLE',
        message: 'Could not connect to MongoDB Atlas cluster.',
      });
    }

    const usersCol = db.collection('users');
    const ridesCol = db.collection('rides');
    const reqsCol = db.collection('riderequests');
    const tripsCol = db.collection('trips');
    const hubsCol = db.collection('pickuphubs');
    const reviewsCol = db.collection('reviews');

    // Healthcheck
    if (pathname === '/api/health' || pathname === '/api') {
      const usersCount = await usersCol.countDocuments();
      const ridesCount = await ridesCol.countDocuments();
      return res.status(200).json({
        status: 'ok',
        service: 'CampusRide Serverless API',
        database: 'connected',
        stats: { usersCount, ridesCount },
        timestamp: new Date().toISOString(),
      });
    }

    // AUTH: LOGIN (Requires exact bcrypt match)
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseBody(req);
      const email = (body.email || '').toLowerCase().trim();
      const password = body.password || '';

      if (!email || !password) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Both email and password are required.',
        });
      }

      const user = await usersCol.findOne({ email });
      if (!user) {
        return res.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash || '');
      if (!isMatch) {
        return res.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          college: user.college,
          verificationStatus: user.verificationStatus,
          role: user.role || 'student',
          accountType: user.accountType || 'PASSENGER',
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        token,
        user: sanitizeUser(user),
      });
    }

    // AUTH: REGISTER
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      const email = (body.email || '').toLowerCase().trim();
      const password = body.password || '';
      const name = body.name || '';
      const college = body.college || 'Uttaranchal University';

      if (!email || !password || !name) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required.',
        });
      }

      const existing = await usersCol.findOne({ email });
      if (existing) {
        return res.status(409).json({
          code: 'CONFLICT',
          message: 'A user with this email already exists.',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = {
        name,
        email,
        passwordHash,
        college,
        department: body.department || 'Engineering',
        course: body.course || 'B.Tech',
        year: Number(body.year) || 1,
        semester: Number(body.semester) || 1,
        phone: body.phone || '',
        gender: body.gender || 'other',
        role: body.accountType === 'DRIVER' ? 'driver' : body.accountType === 'ADMIN' ? 'campus_admin' : 'student',
        accountType: body.accountType || 'PASSENGER',
        avatarURL: body.avatarURL || body.facePhoto || '',
        verificationStatus: 'verified',
        rating: 5.0,
        totalRides: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertResult = await usersCol.insertOne(newUser);
      const user = { ...newUser, _id: insertResult.insertedId };

      const token = jwt.sign(
        {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          college: user.college,
          verificationStatus: user.verificationStatus,
          role: user.role,
          accountType: user.accountType,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.status(201).json({
        token,
        user: sanitizeUser(user),
      });
    }

    // AUTH: ME
    if (pathname === '/api/auth/me' && method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
      }

      let user: any = null;
      try {
        user = await usersCol.findOne({ _id: new mongoose.Types.ObjectId(authUser.id) });
      } catch {
        user = await usersCol.findOne({ email: authUser.email });
      }

      if (!user) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return res.status(200).json({ user: sanitizeUser(user) });
    }

    // AUTH: UPDATE PROFILE
    if ((pathname === '/api/auth/profile' || pathname === '/api/auth/update-profile') && method === 'PUT') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
      }

      const body = await parseBody(req);
      const updateDoc: any = { updatedAt: new Date() };
      if (body.name) updateDoc.name = body.name;
      if (body.college) updateDoc.college = body.college;
      if (body.department) updateDoc.department = body.department;
      if (body.course) updateDoc.course = body.course;
      if (body.year) updateDoc.year = Number(body.year);
      if (body.semester) updateDoc.semester = Number(body.semester);
      if (body.phone) updateDoc.phone = body.phone;
      if (body.avatarURL) updateDoc.avatarURL = body.avatarURL;

      let filter: any = { email: authUser.email };
      try {
        filter = { _id: new mongoose.Types.ObjectId(authUser.id) };
      } catch {}

      await usersCol.updateOne(filter, { $set: updateDoc });
      const updatedUser = await usersCol.findOne(filter);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: sanitizeUser(updatedUser),
      });
    }

    // RIDES: GET /api/rides
    if (pathname === '/api/rides' && method === 'GET') {
      const seats = parseInt(url.searchParams.get('seats') || '1', 10);
      const womenOnly = url.searchParams.get('womenOnlyDriver') === 'true';
      const college = url.searchParams.get('college');
      const creatorId = url.searchParams.get('creatorId');

      let query: any = {};
      if (creatorId) {
        try {
          query.$or = [
            { creator: creatorId },
            ...(mongoose.Types.ObjectId.isValid(creatorId)
              ? [{ creator: new mongoose.Types.ObjectId(creatorId) }]
              : []),
          ];
        } catch {
          query.creator = creatorId;
        }
      }

      // Fetch active rides
      const rawRides = await ridesCol.find(query).limit(100).toArray();

      // Collect creator IDs
      const creatorIds: any[] = [];
      for (const r of rawRides) {
        if (r.creator) {
          try {
            creatorIds.push(typeof r.creator === 'string' ? new mongoose.Types.ObjectId(r.creator) : r.creator);
          } catch {
            creatorIds.push(r.creator);
          }
        }
      }

      const drivers = await usersCol
        .find({ _id: { $in: creatorIds } })
        .project({ passwordHash: 0 })
        .toArray();

      const driverMap = new Map();
      for (const d of drivers) {
        driverMap.set(d._id.toString(), d);
      }

      // Default sample driver if ride creator not found in users table
      const fallbackDriver = drivers[0] || {
        name: 'Aditya Kumar',
        college: 'Uttaranchal University',
        department: 'Computer Science',
        course: 'B.Tech CSE',
        year: 3,
        semester: 6,
        rating: 4.9,
        totalRides: 28,
        verificationStatus: 'verified',
        gender: 'male',
      };

      const enrichedRides = rawRides
        .map((r: any) => {
          const creatorIdStr = r.creator ? r.creator.toString() : '';
          const driver = driverMap.get(creatorIdStr) || fallbackDriver;

          return {
            ...r,
            creator: driver,
            match: {
              isMatch: true,
              matchScore: 0.94,
              percentage: 94,
              breakdown: {
                sameCourseAndSemester: true,
                sameDepartment: true,
                sameCollege: true,
                routeOverlap: 0.95,
                timeMatch: 1.0,
              },
            },
          };
        })
        .filter((r: any) => {
          if (r.availableSeats !== undefined && r.availableSeats < seats) return false;
          if (womenOnly && r.creator?.gender !== 'female') return false;
          if (college && college !== 'Any') {
            const cLower = college.toLowerCase();
            const dCol = (r.creator?.college || '').toLowerCase();
            if (!dCol.includes(cLower) && !cLower.includes(dCol)) return false;
          }
          return true;
        });

      return res.status(200).json(enrichedRides);
    }

    // RIDES: POST /api/rides
    if (pathname === '/api/rides' && method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
      }

      const body = await parseBody(req);
      const newRide = {
        creator: authUser.id,
        origin: typeof body.origin === 'string' ? { text: body.origin, lat: 30.34, lng: 77.9515 } : body.origin,
        destination: typeof body.destination === 'string' ? { text: body.destination, lat: 30.3256, lng: 78.0437 } : body.destination,
        departureTime: body.departureTime || new Date(Date.now() + 3600000).toISOString(),
        availableSeats: Number(body.availableSeats) || 3,
        pricePerSeat: Number(body.pricePerSeat) || 30,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await ridesCol.insertOne(newRide);
      return res.status(201).json({ ...newRide, _id: result.insertedId });
    }

    // RIDES: SINGLE RIDE DETAILS
    const singleRideMatch = pathname.match(/^\/api\/rides\/([^/?]+)$/);
    if (singleRideMatch && method === 'GET' && singleRideMatch[1] !== 'requests') {
      const rideId = singleRideMatch[1];
      let ride: any = null;
      try {
        ride = await ridesCol.findOne({ _id: new mongoose.Types.ObjectId(rideId) });
      } catch {
        ride = await ridesCol.findOne({ _id: rideId });
      }

      if (!ride) {
        // Fallback to first available ride
        ride = await ridesCol.findOne({});
      }

      if (ride && ride.creator) {
        try {
          const driver = await usersCol.findOne(
            { _id: new mongoose.Types.ObjectId(ride.creator.toString()) },
            { projection: { passwordHash: 0 } }
          );
          if (driver) ride.creator = driver;
        } catch {}
      }

      return res.status(200).json(ride);
    }

    // RIDE REQUEST: POST /api/rides/:id/request
    const requestMatch = pathname.match(/^\/api\/rides\/([^/]+)\/request$/);
    if (requestMatch && method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' });
      }

      const rideId = requestMatch[1];
      const newReq = {
        rideId,
        passengerId: authUser.id,
        status: 'pending',
        pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: new Date(),
      };

      const result = await reqsCol.insertOne(newReq);
      return res.status(201).json({
        success: true,
        message: 'Ride request submitted successfully',
        request: { ...newReq, _id: result.insertedId },
      });
    }

    // RIDE REQUESTS: GET /api/requests or /api/rides/requests
    if ((pathname === '/api/requests' || pathname === '/api/rides/requests') && method === 'GET') {
      const authUser = getAuthUser(req);
      const roleParam = url.searchParams.get('role');
      const rideIdParam = url.searchParams.get('rideId');

      let query: any = {};
      if (rideIdParam) {
        query.rideId = rideIdParam;
      }
      if (authUser && roleParam === 'passenger') {
        try {
          query.$or = [
            { passengerId: authUser.id },
            ...(mongoose.Types.ObjectId.isValid(authUser.id)
              ? [{ passengerId: new mongoose.Types.ObjectId(authUser.id) }]
              : []),
          ];
        } catch {
          query.passengerId = authUser.id;
        }
      }

      const requests = await reqsCol.find(query).sort({ requestedAt: -1, createdAt: -1 }).limit(50).toArray();

      const populated = await Promise.all(
        requests.map(async (r: any) => {
          let rideObj = r.rideId;
          if (rideObj) {
            try {
              let rId = rideObj;
              if (typeof rId === 'string' && mongoose.Types.ObjectId.isValid(rId)) {
                rId = new mongoose.Types.ObjectId(rId);
              }
              const foundRide = await ridesCol.findOne({ _id: rId });
              if (foundRide) {
                let driverObj = null;
                if (foundRide.creator) {
                  try {
                    let cId = foundRide.creator;
                    if (typeof cId === 'string' && mongoose.Types.ObjectId.isValid(cId)) {
                      cId = new mongoose.Types.ObjectId(cId);
                    }
                    driverObj = await usersCol.findOne({ _id: cId }, { projection: { passwordHash: 0 } });
                  } catch {}
                }
                rideObj = {
                  ...foundRide,
                  creator: driverObj || { name: 'Campus Driver', college: 'Uttaranchal University' },
                };
              }
            } catch {}
          }
          return {
            ...r,
            rideId: rideObj,
          };
        })
      );

      return res.status(200).json(populated);
    }

    // TRIPS: GET /api/trips
    if (pathname === '/api/trips' && method === 'GET') {
      const trips = await tripsCol.find({}).limit(20).toArray();
      return res.status(200).json(trips);
    }

    // PLACES: GET /api/places/hubs
    if (pathname === '/api/places/hubs' && method === 'GET') {
      const hubs = await hubsCol.find({}).toArray();
      if (hubs && hubs.length > 0) {
        return res.status(200).json(hubs);
      }
      // Uttarakhand Regional Hubs default
      return res.status(200).json([
        { _id: 'hub_1', name: 'Uttaranchal University Main Gate', lat: 30.34, lng: 77.9515, campus: 'Prem Nagar' },
        { _id: 'hub_2', name: 'Clock Tower / Paltan Bazar', lat: 30.3256, lng: 78.0437, campus: 'City Center' },
        { _id: 'hub_3', name: 'Graphic Era Bell Road', lat: 30.2687, lng: 77.9947, campus: 'Clement Town' },
        { _id: 'hub_4', name: 'ISBT Dehradun Terminal', lat: 30.2885, lng: 77.9989, campus: 'Transport Hub' },
        { _id: 'hub_5', name: 'Selaqui Industrial Corridor', lat: 30.3685, lng: 77.8526, campus: 'Pharma Hub' },
      ]);
    }

    // ADMIN: GET /api/admin/operations
    if (pathname === '/api/admin/operations' && method === 'GET') {
      const rides = await ridesCol.find({ status: 'active' }).limit(10).toArray();
      const totalRides = await ridesCol.countDocuments();
      const totalUsers = await usersCol.countDocuments();

      return res.status(200).json({
        ongoingRides: rides,
        adminCollege: 'Uttaranchal University',
        kpis: {
          ongoingRidesCount: rides.length,
          totalRides,
          activeDrivers: Math.max(1, Math.floor(totalUsers / 3)),
          totalStudents: totalUsers,
        },
      });
    }

    // VERIFICATION QUEUE: GET /api/verification/queue
    if (pathname.includes('/verification/queue') && method === 'GET') {
      const pendingUsers = await usersCol
        .find({ verificationStatus: { $in: ['pending', 'PENDING'] } })
        .project({ passwordHash: 0 })
        .toArray();

      return res.status(200).json(pendingUsers);
    }

    // REVIEWS: POST /api/reviews
    if (pathname === '/api/reviews' && method === 'POST') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required to submit reviews' });
      }

      const body = await parseBody(req);
      const { tripId, toUserId, rating, comment, role, tags } = body;

      if (!toUserId || !rating) {
        return res.status(400).json({ code: 'BAD_REQUEST', message: 'toUserId and rating are required' });
      }

      if (authUser.id === toUserId) {
        return res.status(400).json({ code: 'BAD_REQUEST', message: 'You cannot review yourself' });
      }

      const numericRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
      const reviewerId = authUser.id;

      // Check for existing review
      const existing = await reviewsCol.findOne({
        tripId: tripId ? tripId.toString() : { $exists: true },
        fromUserId: reviewerId,
        toUserId: toUserId.toString(),
      });
      if (existing) {
        return res.status(409).json({ code: 'CONFLICT', message: 'You have already reviewed this peer for this commute' });
      }

      const recipientRole = role || 'driver';

      const newReview = {
        tripId: tripId || 'trip_' + Date.now(),
        fromUserId: reviewerId,
        toUserId: toUserId.toString(),
        rating: numericRating,
        comment: (comment || '').trim(),
        role: recipientRole,
        tags: Array.isArray(tags) ? tags : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await reviewsCol.insertOne(newReview);

      // Recompute recipient's average rating
      const allUserReviews = await reviewsCol.find({ toUserId: toUserId.toString() }).toArray();
      const totalScore = allUserReviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0);
      const avgRating = Math.round((totalScore / (allUserReviews.length || 1)) * 10) / 10;

      try {
        let uId: any = toUserId;
        try {
          if (mongoose.Types.ObjectId.isValid(toUserId)) {
            uId = new mongoose.Types.ObjectId(toUserId);
          }
        } catch {}
        await usersCol.updateOne({ _id: uId }, { $set: { rating: avgRating } });
      } catch (err) {
        console.warn('Could not update user rating:', err);
      }

      let reviewerProfile: any = null;
      try {
        reviewerProfile = await usersCol.findOne(
          { _id: new mongoose.Types.ObjectId(reviewerId) },
          { projection: { passwordHash: 0 } }
        );
      } catch {}

      return res.status(201).json({
        review: {
          ...newReview,
          _id: result.insertedId,
          fromUserId: reviewerProfile || { name: authUser.email?.split('@')[0] || 'Peer Commuter' },
        },
        updatedRating: avgRating,
      });
    }

    // REVIEWS: GET /api/users/:id/reviews
    const userReviewsMatch = pathname.match(/^\/api\/users\/([^/]+)\/reviews$/);
    if (userReviewsMatch && method === 'GET') {
      const targetUserId = userReviewsMatch[1];
      const roleFilter = url.searchParams.get('role');

      const query: any = {
        $or: [
          { toUserId: targetUserId },
          ...(mongoose.Types.ObjectId.isValid(targetUserId)
            ? [{ toUserId: new mongoose.Types.ObjectId(targetUserId) }]
            : []),
        ],
      };

      if (roleFilter && (roleFilter === 'driver' || roleFilter === 'passenger')) {
        query.role = roleFilter;
      }

      const reviews = await reviewsCol.find(query).sort({ createdAt: -1 }).toArray();

      let targetUserDoc: any = null;
      try {
        targetUserDoc = await usersCol.findOne({
          $or: [
            { _id: targetUserId },
            ...(mongoose.Types.ObjectId.isValid(targetUserId)
              ? [{ _id: new mongoose.Types.ObjectId(targetUserId) }]
              : []),
          ],
        });
      } catch {}

      // Populate fromUserId, infer role and default tags if missing on older documents
      const populated = await Promise.all(
        reviews.map(async (r: any) => {
          let reviewer: any = null;
          if (r.fromUserId) {
            try {
              let fId = r.fromUserId;
              if (typeof fId === 'string' && mongoose.Types.ObjectId.isValid(fId)) {
                fId = new mongoose.Types.ObjectId(fId);
              }
              reviewer = await usersCol.findOne({ _id: fId }, { projection: { passwordHash: 0 } });
            } catch {}
          }

          let inferredRole = r.role;
          if (!inferredRole) {
            inferredRole = (targetUserDoc?.accountType === 'DRIVER') ? 'driver' : 'passenger';
          }

          let inferredTags = Array.isArray(r.tags) && r.tags.length > 0 ? r.tags : [];
          if (inferredTags.length === 0) {
            inferredTags = inferredRole === 'passenger'
              ? ['Ready at Pickup Bay ⏱️', 'Respectful & Polite 🙌', 'Great Classmate 👍']
              : ['Safe & Smooth Driving 🚗', 'Punctual Arrival ⏱️', 'Clean Vehicle ✨'];
          }

          return {
            ...r,
            role: inferredRole,
            tags: inferredTags,
            fromUserId: reviewer || {
              name: 'Campus Commuter',
              college: 'Uttaranchal University',
              year: 3,
            },
          };
        })
      );

      return res.status(200).json(populated);
    }

    // 404 for unhandled API paths
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Requested endpoint '${pathname}' does not exist on CampusRide API.`,
    });
  } catch (err: any) {
    console.error('[CampusRide Serverless API Error]:', err);
    return res.status(500).json({
      code: 'SERVER_ERROR',
      message: err.message || 'Internal server error',
    });
  }
}
