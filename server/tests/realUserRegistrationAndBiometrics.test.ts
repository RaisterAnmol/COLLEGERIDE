import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { connectDB, disconnectDB } from "../src/utils/db";
import { User } from "../src/models/User";

jest.setTimeout(45000);

describe("Real User Academic Details, Searchable Combobox & Biometrics", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  let authToken = "";
  let userId = "";

  it("1. Registers a real user with custom college, department, course, and avatar", async () => {
    const timestamp = Date.now();
    const email = `student_${timestamp}@uu.ac.in`;
    const payload = {
      name: "Tanya Bisht",
      email,
      password: "Password123!",
      college: "Uttaranchal University",
      department: "Computer Science & Engineering",
      course: "B.Tech - AI & Machine Learning",
      year: 2,
      semester: 3,
      phone: "+91 9876543210",
      gender: "female",
      accountType: "WOMEN_PASSENGER",
      avatarURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...",
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe("Tanya Bisht");
    expect(res.body.user.college).toBe("Uttaranchal University");
    expect(res.body.user.department).toBe("Computer Science & Engineering");
    expect(res.body.user.course).toBe("B.Tech - AI & Machine Learning");
    expect(res.body.user.avatarURL).toContain("data:image/jpeg;base64");

    authToken = res.body.token;
    userId = res.body.user._id || res.body.user.id;
  });

  it("2. GET /api/auth/me returns the registered real user and verified academic details", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.college).toBe("Uttaranchal University");
    expect(res.body.user.department).toBe("Computer Science & Engineering");
    expect(res.body.user.course).toBe("B.Tech - AI & Machine Learning");
    expect(res.body.user.role).toBe("student");
  });

  it("3. PUT /api/auth/profile updates academic details (college, branch, department) in MongoDB", async () => {
    const updatePayload = {
      college: "Graphic Era University",
      department: "Information Technology",
      course: "B.Tech - Information Technology",
      year: 3,
      semester: 5,
    };

    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.college).toBe("Graphic Era University");
    expect(res.body.user.department).toBe("Information Technology");
    expect(res.body.user.course).toBe("B.Tech - Information Technology");
    expect(res.body.user.year).toBe(3);
    expect(res.body.user.semester).toBe(5);

    // Verify in database directly
    const dbUser = await User.findById(userId);
    expect(dbUser).not.toBeNull();
    expect(dbUser!.college).toBe("Graphic Era University");
    expect(dbUser!.department).toBe("Information Technology");
    expect(dbUser!.course).toBe("B.Tech - Information Technology");
  });

  it("4. PUT /api/auth/profile-photo updates driver's photo in MongoDB", async () => {
    const newAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const res = await request(app)
      .put("/api/auth/profile-photo")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ avatarURL: newAvatar });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.avatarURL).toBe(newAvatar);

    const dbUser = await User.findById(userId);
    expect(dbUser!.avatarURL).toBe(newAvatar);
  });
});
