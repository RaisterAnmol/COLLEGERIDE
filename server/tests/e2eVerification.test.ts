import request from "supertest";
import app from "../src/app";
import { connectDB, disconnectDB } from "../src/utils/db";
import { seedDemoData } from "../src/seed";
import { User, Ride, Trip, Review, RideRequest } from "../src/models";

describe("Super Senior Agent — Complete Live E2E Verification Pass", () => {
  let adityaToken: string;
  let rahulToken: string;
  let priyaToken: string;
  let adityaUserId: string;
  let rahulUserId: string;
  let priyaUserId: string;
  let seededRideId: string;
  let newRequestId: string;
  let tripId: string;
  let tripOtp: string;
  let conversationId: string;

  beforeAll(async () => {
    // 1. Connect database & seed demo data
    await connectDB();
    const seedResult = await seedDemoData();
    adityaUserId = seedResult.aditya._id.toString();
    rahulUserId = seedResult.rahul._id.toString();
    priyaUserId = seedResult.priya._id.toString();
    seededRideId = seedResult.adityaRide._id.toString();
  }, 30000);

  afterAll(async () => {
    await disconnectDB();
  });

  test("Step 1: Healthcheck and Server Readiness", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toContain("CampusRide");
  });

  test("Step 2: Authentication — Login Aditya (Driver), Rahul (Passenger), Priya (Passenger)", async () => {
    const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || "CampusRide#2025";

    // Aditya Login
    const adityaRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "aditya.kumar@college.edu", password: DEMO_PASSWORD });
    expect(adityaRes.status).toBe(200);
    expect(adityaRes.body.token).toBeDefined();
    expect(adityaRes.body.user.name).toBe("Aditya Kumar");
    expect(adityaRes.body.user.verificationStatus).toBe("verified");
    adityaToken = adityaRes.body.token;

    // Rahul Login
    const rahulRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "rahul.sharma@college.edu", password: DEMO_PASSWORD });
    expect(rahulRes.status).toBe(200);
    expect(rahulRes.body.token).toBeDefined();
    expect(rahulRes.body.user.name).toBe("Rahul Sharma");
    rahulToken = rahulRes.body.token;

    // Priya Login
    const priyaRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "priya.singh@college.edu", password: DEMO_PASSWORD });
    expect(priyaRes.status).toBe(200);
    expect(priyaRes.body.token).toBeDefined();
    expect(priyaRes.body.user.name).toBe("Priya Singh");
    priyaToken = priyaRes.body.token;

    // Verify /api/auth/me returns authenticated user
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${adityaToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe("aditya.kumar@college.edu");
  });

  test("Step 3: Driver (Aditya) Posts an Additional Active Commute Ride", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const postRes = await request(app)
      .post("/api/rides")
      .set("Authorization", `Bearer ${adityaToken}`)
      .send({
        origin: {
          text: "Campus Gate 1 (Main Entrance, Premnagar Road)",
          lat: 30.3415,
          lng: 77.9440,
        },
        destination: {
          text: "Premnagar Chowk Market",
          lat: 30.3340,
          lng: 77.9620,
        },
        departureTime: tomorrow.toISOString(),
        availableSeats: 3,
        preferences: { musicAllowed: true, smokingAllowed: false },
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.origin.text).toContain("Campus Gate 1");
    expect(postRes.body.availableSeats).toBe(3);
  });

  test("Step 4: Passenger (Rahul) Searches Route -> Receives High Match Score (>= 90%) with Breakdown", async () => {
    const searchRes = await request(app)
      .get("/api/rides")
      .query({
        originLat: 30.3415,
        originLng: 77.9440,
        destLat: 30.3340,
        destLng: 77.9620,
        seats: 1,
      })
      .set("Authorization", `Bearer ${rahulToken}`);

    expect(searchRes.status).toBe(200);
    expect(Array.isArray(searchRes.body)).toBe(true);
    expect(searchRes.body.length).toBeGreaterThan(0);

    const bestMatch = searchRes.body[0];
    expect(bestMatch.match).toBeDefined();
    expect(bestMatch.match.isMatch).toBe(true);
    expect(bestMatch.match.percentage).toBeGreaterThanOrEqual(90);
    expect(bestMatch.match.breakdown.routeOverlap).toBe(1.0);
    expect(bestMatch.match.breakdown.pickupProximity).toBe(1.0);
    expect(bestMatch.match.breakdown.seatBonus).toBe(1.0);
  });

  test("Step 5: Passenger (Priya) Preference Filter -> Excludes Male Driver Rides", async () => {
    const priyaSearchRes = await request(app)
      .get("/api/rides")
      .query({
        originLat: 28.545,
        originLng: 77.192,
        destLat: 28.567,
        destLng: 77.208,
        seats: 1,
        womenOnlyDriver: "true",
      })
      .set("Authorization", `Bearer ${priyaToken}`);

    expect(priyaSearchRes.status).toBe(200);
    // Aditya is male, so his rides must be strictly excluded under womenOnlyDriver filter
    const adityaRides = priyaSearchRes.body.filter(
      (r: any) => r.creator.name === "Aditya Kumar",
    );
    expect(adityaRides.length).toBe(0);
  });

  test("Step 6: Request & Accept Workflow — Rahul Requests Seat, Aditya Accepts", async () => {
    // Rahul creates ride request
    const reqRes = await request(app)
      .post(`/api/rides/${seededRideId}/request`)
      .set("Authorization", `Bearer ${rahulToken}`);

    expect(reqRes.status).toBe(201);
    expect(reqRes.body.status).toBe("pending");
    newRequestId = reqRes.body._id;

    // Aditya checks incoming requests
    const driverReqsRes = await request(app)
      .get(`/api/requests?rideId=${seededRideId}`)
      .set("Authorization", `Bearer ${adityaToken}`);

    expect(driverReqsRes.status).toBe(200);
    const targetReq = driverReqsRes.body.find(
      (r: any) => r._id === newRequestId,
    );
    expect(targetReq).toBeDefined();
    expect(targetReq.passengerId.name).toBe("Rahul Sharma");

    // Aditya accepts the request
    const acceptRes = await request(app)
      .patch(`/api/requests/${newRequestId}`)
      .set("Authorization", `Bearer ${adityaToken}`)
      .send({ status: "accepted" });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.status).toBe("accepted");

    // Confirm available seats decremented from 3 to 2
    const updatedRide = await request(app).get(`/api/rides/${seededRideId}`);
    expect(updatedRide.body.availableSeats).toBe(2);
  });

  test("Step 7: In-App Chat — Real-time Messaging Scoped to Ride Participants", async () => {
    // Fetch or create conversation
    const convRes = await request(app)
      .get(`/api/conversations?rideId=${seededRideId}`)
      .set("Authorization", `Bearer ${rahulToken}`);

    expect(convRes.status).toBe(200);
    conversationId = convRes.body._id;

    // Rahul sends message
    const msg1Res = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${rahulToken}`)
      .send({ text: "Hi Aditya, I am standing near Gate 1 ATM!" });

    expect(msg1Res.status).toBe(201);
    expect(msg1Res.body.text).toContain("Gate 1 ATM");

    // Aditya replies
    const msg2Res = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${adityaToken}`)
      .send({ text: "Got it Rahul! Pulling up in the silver Honda City now." });

    expect(msg2Res.status).toBe(201);
    expect(msg2Res.body.text).toContain("silver Honda City");

    // Retrieve full chat history
    const historyRes = await request(app)
      .get(`/api/conversations/${conversationId}/messages`)
      .set("Authorization", `Bearer ${rahulToken}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.length).toBeGreaterThanOrEqual(2);
  });

  test("Step 8: Trip Start, OTP Pickup Verification, and Trip Completion", async () => {
    // Aditya starts trip
    const startRes = await request(app)
      .post("/api/trips")
      .set("Authorization", `Bearer ${adityaToken}`)
      .send({ rideId: seededRideId });

    expect(startRes.status).toBe(201);
    tripId = startRes.body._id;
    tripOtp = startRes.body.otp;
    expect(tripOtp).toHaveLength(6); // §3.2 Cryptographic 6-digit CSPRNG OTP

    // Verify passenger GET /api/trips/:id NEVER exposes OTP (§3.2)
    const passengerTripRes = await request(app)
      .get(`/api/trips/${tripId}`)
      .set("Authorization", `Bearer ${rahulToken}`);
    expect(passengerTripRes.status).toBe(200);
    expect(passengerTripRes.body.otp).toBeUndefined();
    expect(passengerTripRes.body.otpHash).toBeUndefined();

    // Rahul verifies OTP
    const verifyRes = await request(app)
      .post(`/api/trips/${tripId}/verify-otp`)
      .set("Authorization", `Bearer ${rahulToken}`)
      .send({ otp: tripOtp });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.verified).toBe(true);

    // Aditya marks trip as completed upon arrival
    const completeRes = await request(app)
      .patch(`/api/trips/${tripId}`)
      .set("Authorization", `Bearer ${adityaToken}`)
      .send({ status: "completed", distance: 13.8 });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe("completed");
  });

  test("Step 9: Mutual Ratings & Score Recalculation", async () => {
    // Rahul submits 5-star review for Aditya
    const reviewRes = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${rahulToken}`)
      .send({
        tripId,
        toUserId: adityaUserId,
        rating: 5,
        comment: "Super smooth campus carpool! Highly recommended.",
      });

    expect(reviewRes.status).toBe(201);
    expect(reviewRes.body.review.rating).toBe(5);

    // Verify Aditya's User profile updated
    const adityaUser = await User.findById(adityaUserId);
    expect(adityaUser?.totalRides).toBeGreaterThan(10);
    expect(adityaUser?.rating).toBeGreaterThanOrEqual(4.8);
  });

  test("Step 10: Admin Mobility Analytics Dashboard", async () => {
    const analyticsRes = await request(app).get("/api/analytics/mobility");
    expect(analyticsRes.status).toBe(200);

    const { summary, peakHours, popularRoutes } = analyticsRes.body;
    expect(summary.totalUsers).toBeGreaterThanOrEqual(3);
    expect(summary.verificationRate).toBeGreaterThanOrEqual(80);
    expect(summary.completedTrips).toBeGreaterThanOrEqual(2);
    expect(summary.totalKmShared).toBeGreaterThan(0);
    expect(summary.co2SavedKg).toBeGreaterThan(0);
    expect(Array.isArray(peakHours)).toBe(true);
    expect(Array.isArray(popularRoutes)).toBe(true);
  });
});
