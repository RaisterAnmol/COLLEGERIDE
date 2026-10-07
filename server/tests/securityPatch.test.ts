import request from "supertest";
import { createServer } from "http";
import {
  io as ClientSocket,
  Socket as ClientSocketType,
} from "socket.io-client";
import app from "../src/app";
import { initSocketIO } from "../src/sockets/socketHandler";
import { connectDB, disconnectDB } from "../src/utils/db";
import { seedDemoData } from "../src/seed";
import { User, Ride, RideRequest, Trip, Conversation } from "../src/models";
import { signToken } from "../src/middleware/auth";
import { env } from "../src/config/env";

describe("Checkpoint 1: Security Patch & Core Invariants (§2, §3.1, §3.2)", () => {
  let server: any;
  let serverUrl: string;
  let adityaToken: string;
  let rahulToken: string;
  let strangerToken: string;
  let adityaUser: any;
  let rahulUser: any;
  let strangerUser: any;
  let rideWithOneSeat: any;

  beforeAll(async () => {
    await connectDB();
    const seed = await seedDemoData();
    adityaUser = seed.aditya;
    rahulUser = seed.rahul;

    // Create stranger user for unauthorized access tests
    strangerUser = await User.create({
      name: "Sneaky Stranger",
      email: "stranger@othercollege.edu",
      passwordHash: "dummyhash123",
      college: "Other College",
      year: 2,
      verificationStatus: "unverified",
    });

    adityaToken = signToken({
      id: adityaUser._id.toString(),
      email: adityaUser.email,
      name: adityaUser.name,
      college: adityaUser.college,
      verificationStatus: adityaUser.verificationStatus,
      role: adityaUser.role,
    });

    rahulToken = signToken({
      id: rahulUser._id.toString(),
      email: rahulUser.email,
      name: rahulUser.name,
      college: rahulUser.college,
      verificationStatus: rahulUser.verificationStatus,
      role: rahulUser.role,
    });

    strangerToken = signToken({
      id: strangerUser._id.toString(),
      email: strangerUser.email,
      name: strangerUser.name,
      college: strangerUser.college,
      verificationStatus: strangerUser.verificationStatus,
    });

    // Start ephemeral HTTP & Socket server for socket tests
    server = createServer(app);
    initSocketIO(server);
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr: any = server.address();
        serverUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  }, 30000);

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectDB();
  });

  describe("§2.1 Socket.IO Authentication & Room Authorization", () => {
    test("1. Unauthenticated Socket connection is rejected", (done) => {
      const socket = ClientSocket(serverUrl, {
        transports: ["websocket"],
        reconnection: false,
      });

      socket.on("connect_error", (err: any) => {
        expect(err.message).toMatch(/authentication required/i);
        socket.close();
        done();
      });

      socket.on("connect", () => {
        socket.close();
        done(new Error("Unauthenticated socket should not have connected"));
      });
    });

    test("2. Authenticated Socket connects successfully", (done) => {
      const socket = ClientSocket(serverUrl, {
        transports: ["websocket"],
        reconnection: false,
        auth: { token: rahulToken },
      });

      socket.on("connect", () => {
        expect(socket.connected).toBe(true);
        socket.close();
        done();
      });

      socket.on("connect_error", (err: any) => {
        socket.close();
        done(err);
      });
    });

    test("3. Unauthorized room joining is blocked with unauthorized event", async () => {
      // Find a private conversation between Aditya & Rahul
      const conversation = await Conversation.findOne({
        participants: { $all: [adityaUser._id, rahulUser._id] },
      });
      expect(conversation).toBeDefined();

      const strangerSocket = ClientSocket(serverUrl, {
        transports: ["websocket"],
        reconnection: false,
        auth: { token: strangerToken },
      });

      await new Promise<void>((resolve, reject) => {
        strangerSocket.on("connect", () => resolve());
        strangerSocket.on("connect_error", reject);
      });

      const unauthorizedPromise = new Promise<void>((resolve) => {
        strangerSocket.on("unauthorized", (data: any) => {
          expect(data.error).toMatch(/unauthorized/i);
          resolve();
        });
      });

      strangerSocket.emit("joinConversation", conversation!._id.toString());
      await unauthorizedPromise;
      strangerSocket.close();
    });
  });

  describe("§2.2 Destructive /api/seed Protection", () => {
    test("1. Seed endpoint without x-admin-key is rejected (403 Forbidden)", async () => {
      const res = await request(app).post("/api/seed");
      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    test("2. Seed endpoint with valid x-admin-key succeeds", async () => {
      const res = await request(app)
        .post("/api/seed")
        .set("x-admin-key", env.ADMIN_SECRET);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("re-seeded");

      // Refresh user records and tokens after database re-seed
      adityaUser = await User.findOne({ email: "aditya.kumar@college.edu" });
      rahulUser = await User.findOne({ email: "rahul.sharma@college.edu" });
      strangerUser = await User.create({
        name: "Sneaky Stranger",
        email: "stranger@othercollege.edu",
        passwordHash: "dummyhash123",
        college: "Other College",
        year: 2,
        verificationStatus: "unverified",
      });

      adityaToken = signToken({
        id: adityaUser._id.toString(),
        email: adityaUser.email,
        name: adityaUser.name,
        college: adityaUser.college,
        verificationStatus: adityaUser.verificationStatus,
        role: adityaUser.role,
      });

      rahulToken = signToken({
        id: rahulUser._id.toString(),
        email: rahulUser.email,
        name: rahulUser.name,
        college: rahulUser.college,
        verificationStatus: rahulUser.verificationStatus,
        role: rahulUser.role,
      });

      strangerToken = signToken({
        id: strangerUser._id.toString(),
        email: strangerUser.email,
        name: strangerUser.name,
        college: strangerUser.college,
        verificationStatus: strangerUser.verificationStatus,
      });
    }, 35000);
  });

  describe("§2.4 PII Protection & Scoped Public Projections", () => {
    test("1. Unauthenticated GET /api/rides is rejected (401 Unauthorized)", async () => {
      const res = await request(app).get("/api/rides");
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("UNAUTHORIZED");
    });

    test("2. Authenticated GET /api/rides sanitizes creator fields", async () => {
      const res = await request(app)
        .get("/api/rides")
        .set("Authorization", `Bearer ${rahulToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const sampleRide = res.body[0];
      expect(sampleRide.creator).toBeDefined();
      expect(sampleRide.creator.name).toBeDefined();

      // PII must NEVER be leaked in public list
      expect(sampleRide.creator.email).toBeUndefined();
      expect(sampleRide.creator.phone).toBeUndefined();
      expect(sampleRide.creator.emergencyContact).toBeUndefined();
      expect(sampleRide.creator.gender).toBeUndefined();
    });
  });

  describe("§3.1 Atomic Seat Oversell Race & Compound Index", () => {
    test("1. Compound unique index blocks duplicate ride requests from same passenger", async () => {
      // Create an isolated active ride
      const activeRide = await Ride.create({
        creator: adityaUser._id,
        origin: { text: "Hostel Gate", lat: 28.545, lng: 77.192 },
        destination: { text: "Admin Block", lat: 28.55, lng: 77.2 },
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        availableSeats: 3,
        status: "active",
      });

      // Unverified stranger must be blocked from requesting seats
      const blocked = await request(app)
        .post(`/api/rides/${activeRide!._id}/request`)
        .set("Authorization", `Bearer ${strangerToken}`);
      expect(blocked.status).toBe(403);
      expect(blocked.body.code).toBe("VERIFICATION_REQUIRED");

      // First request from verified passenger
      const res1 = await request(app)
        .post(`/api/rides/${activeRide!._id}/request`)
        .set("Authorization", `Bearer ${rahulToken}`);
      expect(res1.status).toBe(201);

      // Duplicate request attempt from same passenger
      const res2 = await request(app)
        .post(`/api/rides/${activeRide!._id}/request`)
        .set("Authorization", `Bearer ${rahulToken}`);
      expect(res2.status).toBe(409);
      expect(res2.body.code).toBe("DUPLICATE_REQUEST");
    });

    test("2. Concurrent accept requests cannot oversell seats", async () => {
      // Create a test ride with exactly 1 available seat
      rideWithOneSeat = await Ride.create({
        creator: adityaUser._id,
        origin: { text: "Hostel Block A", lat: 28.545, lng: 77.192 },
        destination: { text: "Main Auditorium", lat: 28.55, lng: 77.2 },
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        availableSeats: 1,
        status: "active",
      });

      // Create two distinct passengers with requests
      const passenger1 = await User.create({
        name: "Rider One",
        email: "rider1@college.edu",
        passwordHash: "dummy",
        college: "Engineering College",
        year: 2,
        verificationStatus: "verified",
      });

      const passenger2 = await User.create({
        name: "Rider Two",
        email: "rider2@college.edu",
        passwordHash: "dummy",
        college: "Engineering College",
        year: 2,
        verificationStatus: "verified",
      });

      const req1 = await RideRequest.create({
        rideId: rideWithOneSeat._id,
        passengerId: passenger1._id,
        status: "pending",
      });

      const req2 = await RideRequest.create({
        rideId: rideWithOneSeat._id,
        passengerId: passenger2._id,
        status: "pending",
      });

      // Fire concurrent driver accepts simultaneously
      const [res1, res2] = await Promise.all([
        request(app)
          .patch(`/api/requests/${req1._id}`)
          .set("Authorization", `Bearer ${adityaToken}`)
          .send({ status: "accepted" }),
        request(app)
          .patch(`/api/requests/${req2._id}`)
          .set("Authorization", `Bearer ${adityaToken}`)
          .send({ status: "accepted" }),
      ]);

      const statuses = [res1.status, res2.status];
      expect(statuses).toContain(200);
      expect(statuses).toContain(409); // Exactly one request must be rejected with 409

      // Check ride state: availableSeats must be exactly 0, never negative
      const updatedRide = await Ride.findById(rideWithOneSeat._id);
      expect(updatedRide!.availableSeats).toBe(0);
    });
  });

  describe("§3.2 Cryptographic OTP & Lockout Overhaul", () => {
    let testTripId: string;
    let correctOtp: string;

    test("1. Starting trip generates 6-digit CSPRNG OTP given to driver only", async () => {
      // Create fresh ride and start trip
      const newRide = await Ride.create({
        creator: adityaUser._id,
        origin: { text: "Lab Complex", lat: 28.545, lng: 77.192 },
        destination: { text: "Library", lat: 28.55, lng: 77.2 },
        departureTime: new Date(Date.now() + 60 * 60 * 1000),
        availableSeats: 2,
        status: "active",
      });

      // Create accepted request for Rahul so he is a legitimate trip passenger
      await RideRequest.create({
        rideId: newRide._id,
        passengerId: rahulUser._id,
        status: "accepted",
      });

      const startRes = await request(app)
        .post("/api/trips")
        .set("Authorization", `Bearer ${adityaToken}`)
        .send({ rideId: newRide._id });

      expect(startRes.status).toBe(201);
      testTripId = startRes.body._id;
      correctOtp = startRes.body.otp;

      // Must be 6 digits (§3.2)
      expect(correctOtp).toMatch(/^\d{6}$/);

      // Passenger cannot see OTP on GET
      const passengerGet = await request(app)
        .get(`/api/trips/${testTripId}`)
        .set("Authorization", `Bearer ${rahulToken}`);

      expect(passengerGet.status).toBe(200);
      expect(passengerGet.body.otp).toBeUndefined();
      expect(passengerGet.body.otpHash).toBeUndefined();
      expect(passengerGet.body.otpSalt).toBeUndefined();
    });

    test("2. 5 incorrect OTP attempts lock out the trip", async () => {
      // 4 incorrect attempts
      for (let i = 0; i < 4; i++) {
        const failRes = await request(app)
          .post(`/api/trips/${testTripId}/verify-otp`)
          .set("Authorization", `Bearer ${rahulToken}`)
          .send({ otp: "000000" });

        expect(failRes.status).toBe(400);
        expect(failRes.body.code).toBe("INVALID_OTP");
      }

      // 5th incorrect attempt triggers lockout
      const fifthRes = await request(app)
        .post(`/api/trips/${testTripId}/verify-otp`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ otp: "000000" });

      expect(fifthRes.status).toBe(400);

      // Subsequent attempt must return 429 OTP_LOCKED even with correct OTP!
      const lockedRes = await request(app)
        .post(`/api/trips/${testTripId}/verify-otp`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ otp: correctOtp });

      expect(lockedRes.status).toBe(429);
      expect(lockedRes.body.code).toBe("OTP_LOCKED");
    });

    test("3. Driver can regenerate locked OTP and passenger can verify new OTP", async () => {
      const regenRes = await request(app)
        .post(`/api/trips/${testTripId}/regenerate-otp`)
        .set("Authorization", `Bearer ${adityaToken}`);

      expect(regenRes.status).toBe(200);
      const newOtp = regenRes.body.otp;
      expect(newOtp).toMatch(/^\d{6}$/);
      expect(newOtp).not.toBe(correctOtp);

      // Passenger successfully verifies with new OTP
      const verifySuccess = await request(app)
        .post(`/api/trips/${testTripId}/verify-otp`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ otp: newOtp });

      expect(verifySuccess.status).toBe(200);
      expect(verifySuccess.body.verified).toBe(true);
    });

    test("4. Passenger scans Driver's QR payload JSON string and successfully verifies trip pickup", async () => {
      const qrRide = await Ride.create({
        creator: adityaUser._id,
        origin: { text: "Sports Complex", lat: 28.545, lng: 77.192 },
        destination: { text: "Lecture Hall", lat: 28.55, lng: 77.2 },
        departureTime: new Date(Date.now() + 60 * 60 * 1000),
        availableSeats: 2,
        status: "active",
      });

      await RideRequest.create({
        rideId: qrRide._id,
        passengerId: rahulUser._id,
        status: "accepted",
      });

      // Driver starts a fresh trip
      const startRes = await request(app)
        .post("/api/trips")
        .set("Authorization", `Bearer ${adityaToken}`)
        .send({ rideId: qrRide._id });

      const freshTripId = startRes.body._id;
      const driverOtp = startRes.body.otp;

      // The QR code displayed on driver's phone encodes this exact JSON payload:
      const driverQrPayloadString = JSON.stringify({
        type: "CAMPUSRIDE_PICKUP",
        tripId: freshTripId,
        otp: driverOtp,
        driverId: adityaUser._id,
        timestamp: Date.now(),
      });

      // Passenger camera scanner decodes QR code string and extracts OTP
      const decodedData = JSON.parse(driverQrPayloadString);
      expect(decodedData.type).toBe("CAMPUSRIDE_PICKUP");
      expect(decodedData.tripId).toBe(freshTripId);
      expect(decodedData.otp).toBe(driverOtp);

      // Passenger verifies using the scanned OTP
      const qrVerifyRes = await request(app)
        .post(`/api/trips/${freshTripId}/verify-otp`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ otp: decodedData.otp });

      expect(qrVerifyRes.status).toBe(200);
      expect(qrVerifyRes.body.verified).toBe(true);
      expect(qrVerifyRes.body.message).toContain("Boarding confirmed");
    });
  });
});
