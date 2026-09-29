import request from "supertest";
import http from "http";
import app from "../src/app";
import { connectDB, disconnectDB } from "../src/utils/db";
import { seedDemoData } from "../src/seed";
import {
  User,
  Trip,
  EmergencyIncident,
  VerificationRequest,
} from "../src/models";
import { signToken } from "../src/middleware/auth";
import { calculateMatchScore } from "../src/services/matchingEngine";

describe("CampusRide Comprehensive Security, RBAC & Integrations Test Suite", () => {
  let server: http.Server;
  let studentToken: string;
  let studentUser: any;
  let adminToken: string;
  let adminUser: any;
  let driverUser: any;
  let passengerUser: any;
  let activeTrip: any;

  beforeAll(async () => {
    await connectDB();
    const seed = await seedDemoData();
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));

    driverUser = seed.aditya;
    passengerUser = seed.rahul;
    activeTrip = seed.adityaRahulTrip;

    // Create an unverified student for security testing
    studentUser = await User.create({
      name: "Aryan Gupta",
      email: "aryan.gupta.security@college.edu",
      passwordHash: "passwordHash123",
      college: "Uttaranchal University",
      year: 2,
      verificationStatus: "unverified",
      role: "student",
    });

    adminUser = await User.findOne({ email: "admin@campusride.edu" });

    studentToken = signToken({
      id: studentUser._id.toString(),
      email: studentUser.email,
      name: studentUser.name,
      college: studentUser.college,
      verificationStatus: "unverified",
      role: "student",
    });

    adminToken = signToken({
      id: adminUser._id.toString(),
      email: adminUser.email,
      name: adminUser.name,
      college: adminUser.college,
      verificationStatus: adminUser.verificationStatus,
      role: adminUser.role,
    });
  }, 35000);

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectDB();
  });

  describe("Guardrail #6 & #22: Prevention of Self-Verification and RBAC Enforcement", () => {
    test("1. Regular student attempting self-verification is strictly blocked with 403 Forbidden", async () => {
      const res = await request(server)
        .post(`/api/users/${studentUser._id}/verify`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send();

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");

      // Verify DB state was NOT modified
      const userInDb = await User.findById(studentUser._id);
      expect(userInDb?.verificationStatus).not.toBe("verified");
    });

    test("2. Authorized campus administrator can verify student accounts", async () => {
      const res = await request(server)
        .post(`/api/users/${studentUser._id}/verify`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.user.verificationStatus).toBe("verified");

      const userInDb = await User.findById(studentUser._id);
      expect(userInDb?.verificationStatus).toBe("verified");
    });

    test("3. Student blocked from accessing administrative audit logs (403 Forbidden)", async () => {
      const res = await request(server)
        .get("/api/audit/logs")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    test("4. Administrator can access audit logs", async () => {
      const res = await request(server)
        .get("/api/audit/logs")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.logs)).toBe(true);
    });
  });

  describe("Guardrail #13 & #14: SOS Incident Creation and Idempotency", () => {
    test("1. Triggering SOS creates EmergencyIncident database record first and dispatches alert", async () => {
      const res = await request(server)
        .post("/api/emergency/sos")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          tripId: activeTrip._id.toString(),
          latitude: 28.7495,
          longitude: 77.1165,
          accuracy: 10,
          address: "North Gate Entrance",
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.incident).toBeDefined();
      expect(res.body.emergencyHelplineAction).toBe("112");
      expect(res.body.incident.incidentNumber).toMatch(/^INC-/);

      // Verify database record is the primary source of truth
      const dbIncident = await EmergencyIncident.findById(
        res.body.incident._id,
      );
      expect(dbIncident).not.toBeNull();
      expect(dbIncident?.status).toBe("ACTIVE");
      expect(dbIncident?.campusSecurityNotified).toBe(true);
    });

    test("2. Repeated SOS trigger during active incident is idempotent (does not duplicate)", async () => {
      const initialCount = await EmergencyIncident.countDocuments({
        triggeredBy: studentUser._id,
        status: { $in: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING"] },
      });

      const res = await request(server)
        .post("/api/emergency/sos")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          tripId: activeTrip._id.toString(),
          latitude: 28.7496,
          longitude: 77.1166,
        });

      expect(res.status).toBe(200);
      expect(res.body.isExisting).toBe(true);

      const afterCount = await EmergencyIncident.countDocuments({
        triggeredBy: studentUser._id,
        status: { $in: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING"] },
      });
      expect(afterCount).toBe(initialCount); // no duplicate created!
    });
  });

  describe("Guardrail #11 & #12: Trip State Machine & Pickup Verification Safeguards", () => {
    test("1. Unrelated third party cannot verify pickup OTP for another passenger's trip", async () => {
      // studentUser (Arjun) is NOT part of adityaRahulTrip
      const res = await request(server)
        .post(`/api/trips/${activeTrip._id}/verify-otp`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ otp: "123456" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    test("2. Invalid direct transition on trip state machine is rejected", async () => {
      const driverToken = signToken({
        id: driverUser._id.toString(),
        email: driverUser.email,
        name: driverUser.name,
        college: driverUser.college,
        verificationStatus: driverUser.verificationStatus,
      });

      // Attempt impossible state transition: directly jumping from scheduled to completed
      const res = await request(server)
        .patch(`/api/trips/${activeTrip._id}`)
        .set("Authorization", `Bearer ${driverToken}`)
        .send({ status: "completed" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_TRANSITION");
    });
  });

  describe("Guardrail #3 & #4: Road-Aware Maps and Matching Engine", () => {
    test("1. Client-safe configuration endpoint does not expose server secrets", async () => {
      const res = await request(server).get("/api/places/config");
      expect(res.status).toBe(200);
      expect(res.body.mapsMode).toBeDefined();
      expect(res.body.apiKey).toBeUndefined();
      expect(res.body.GOOGLE_MAPS_API_KEY).toBeUndefined();
    });

    test("2. Matching engine computes detour minutes and reliability in breakdown", () => {
      const result = calculateMatchScore(
        {
          origin: { lat: 28.545, lng: 77.192 },
          destination: { lat: 28.567, lng: 77.208 },
          departureTime: new Date(),
          availableSeats: 3,
          driverReliabilityScore: 95,
        },
        {
          origin: { lat: 28.545, lng: 77.192 },
          destination: { lat: 28.567, lng: 77.208 },
          departureTime: new Date(),
          requestedSeats: 1,
        }
      );

      expect(result.isMatch).toBe(true);
      expect(result.breakdown.driverDetourMinutes).toBeDefined();
      expect(result.breakdown.detourDistanceKm).toBe(0);
    });
  });

  describe("Guardrail #6 & #24: Student Verification Queue & Document Submission", () => {
    test("1. Student can submit verification request with student identifier", async () => {
      // Create a fresh unverified student
      const unverifiedStudent = await User.create({
        name: "Rohit Verma",
        email: "rohit.verma@college.edu",
        passwordHash: "passwordHash123",
        college: "Uttaranchal University",
        year: 2,
        verificationStatus: "unverified",
      });

      const rohitToken = signToken({
        id: unverifiedStudent._id.toString(),
        email: unverifiedStudent.email,
        name: unverifiedStudent.name,
        college: unverifiedStudent.college,
        verificationStatus: "unverified",
      });

      const res = await request(server)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${rohitToken}`)
        .send({
          studentIdentifier: "2024DTU-EE-099",
          documentType: "student_id",
          documentMimeType: "image/png",
          documentSizeBytes: 350000,
        });

      expect(res.status).toBe(201);
      expect(res.body.request.status).toBe("pending");
      expect(res.body.request.documentStorageKey).toMatch(/^docs\//);

      // Admin reviews and approves
      const reviewRes = await request(server)
        .patch(`/api/verification/requests/${res.body.request._id}/review`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ decision: "approved" });

      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.request.status).toBe("approved");

      const studentInDb = await User.findById(unverifiedStudent._id);
      expect(studentInDb?.verificationStatus).toBe("verified");
    });
  });
});
