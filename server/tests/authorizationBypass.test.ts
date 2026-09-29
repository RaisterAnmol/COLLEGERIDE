import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { User, Ride, RideRequest } from "../src/models";
import { connectDB, disconnectDB } from "../src/utils/db";
import { signToken } from "../src/middleware/auth";

describe("Agent 9: Security & Authorization Bypass Test Suite", () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let userARideId: string;

  beforeAll(async () => {
    await connectDB();

    // Create User A (Driver)
    const userA = await User.create({
      name: "Student Alpha",
      email: "alpha.student@college.edu",
      passwordHash: "dummyHashedPassword123",
      college: "Uttaranchal University",
      year: 2,
      verificationStatus: "verified",
      tokenVersion: 0,
    });
    userAId = userA._id.toString();
    userAToken = signToken({
      id: userAId,
      email: userA.email,
      name: userA.name,
      college: userA.college,
      verificationStatus: userA.verificationStatus,
      tokenVersion: userA.tokenVersion,
    });

    // Create User B (Passenger)
    const userB = await User.create({
      name: "Student Beta",
      email: "beta.student@college.edu",
      passwordHash: "dummyHashedPassword123",
      college: "Uttaranchal University",
      year: 3,
      verificationStatus: "verified",
      tokenVersion: 0,
    });
    userBId = userB._id.toString();
    userBToken = signToken({
      id: userBId,
      email: userB.email,
      name: userB.name,
      college: userB.college,
      verificationStatus: userB.verificationStatus,
      tokenVersion: userB.tokenVersion,
    });

    // Create a ride owned by User A
    const ride = await Ride.create({
      creator: userA._id,
      origin: { text: "Campus Gate 1 (Premnagar Road)", lat: 30.3415, lng: 77.9440 },
      destination: { text: "Premnagar Chowk Market", lat: 30.3340, lng: 77.9620 },
      departureTime: new Date(Date.now() + 3600000),
      availableSeats: 3,
      status: "active",
    });
    userARideId = ride._id.toString();
  }, 35000);

  afterAll(async () => {
    await disconnectDB();
  });

  test("1. User B cannot cancel or delete User A's ride offer (Broken Object Level Auth blocked)", async () => {
    const res = await request(app)
      .delete(`/api/rides/${userARideId}`)
      .set("Authorization", `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  test("2. User B cannot modify User A's ride offer", async () => {
    const res = await request(app)
      .patch(`/api/rides/${userARideId}`)
      .set("Authorization", `Bearer ${userBToken}`)
      .send({ availableSeats: 1 });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  test("3. User B cannot accept seat requests on User A's ride", async () => {
    // User B creates request on User A's ride
    const reqRes = await request(app)
      .post(`/api/rides/${userARideId}/request`)
      .set("Authorization", `Bearer ${userBToken}`);

    expect(reqRes.status).toBe(201);
    const requestId = reqRes.body.request?._id || reqRes.body._id;

    // User B attempts to accept the request as if they were the driver
    const acceptRes = await request(app)
      .patch(`/api/requests/${requestId}`)
      .set("Authorization", `Bearer ${userBToken}`)
      .send({ status: "accepted" });

    expect(acceptRes.status).toBe(403);
    expect(acceptRes.body.code).toBe("FORBIDDEN");
  });

  test("4. Missing token on protected endpoint receives 401 Unauthorized", async () => {
    const res = await request(app).get("/api/rides");
    expect(res.status).toBe(401);
  });

  test("5. Tampered token signature is rejected with 401 Unauthorized", async () => {
    const tamperedToken = userAToken.slice(0, -5) + "abcde";
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
  });

  test("6. Correlation ID header (X-Request-Id) is always returned on responses", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.headers["x-request-id"]).toBeDefined();
    expect(typeof res.headers["x-request-id"]).toBe("string");
  });

  test("7. Readiness endpoint /api/ready reports live database state", async () => {
    const res = await request(app).get("/api/ready");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");
    expect(res.body.database).toBe("connected");
  });
});
