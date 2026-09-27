import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { z } from "zod";
import { User, Vehicle, Ride, RideRequest } from "../models";
import {
  requireAuth,
  requireRole,
  signToken,
  signRefreshToken,
  verifyRefreshToken,
  AuthenticatedRequest,
} from "../middleware/auth";
import {
  generateSecureOtp,
  generateSalt,
  hashOtp,
  generateSecureToken,
  hashToken,
} from "../utils/security";
import { logAuditEvent } from "../services/auditService";
import { NotificationService } from "../services/notificationService";
import { logger } from "../utils/logger";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  college: z.string().trim().min(2, "College name is required"),
  year: z
    .number()
    .int()
    .min(1)
    .max(6)
    .or(z.string().transform((v) => parseInt(v, 10)))
    .default(1),
  department: z.string().trim().optional().default("General"),
  course: z.string().trim().optional().default("Degree"),
  semester: z
    .number()
    .int()
    .min(1)
    .max(12)
    .or(z.string().transform((v) => parseInt(v, 10)))
    .optional()
    .default(1),
  phone: z.string().trim().optional(),
  gender: z.enum(["male", "female", "other"]).default("other"),
  accountType: z
    .enum(["PASSENGER", "WOMEN_PASSENGER", "DRIVER", "ADMIN"])
    .default("PASSENGER"),
  studentIdentifier: z.string().trim().optional(),
  driverIdentifier: z.string().trim().optional(),
  enrolledIdCardUrl: z.string().optional(),
  avatarURL: z.string().optional(),
  facePhoto: z.string().optional(),
  faceDescriptor: z.array(z.number()).optional(),
  adminInvitationToken: z.string().trim().optional(),
  vehicle: z
    .object({
      type: z.enum(["car", "motorcycle", "scooter", "ev", "bike"]).default("car"),
      model: z.string().default(""),
      capacity: z.number().int().min(1).max(8).default(4),
      plateLast4: z.string().default(""),
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/register
router.post("/register", async (req, res): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: parseResult.error.issues.map((e: any) => e.message).join(", "),
      });
      return;
    }

    const {
      name,
      email,
      password,
      college,
      year,
      department,
      course,
      semester,
      phone,
      gender,
      accountType,
      studentIdentifier,
      driverIdentifier,
      enrolledIdCardUrl,
      avatarURL,
      facePhoto,
      faceDescriptor,
      adminInvitationToken,
      vehicle,
    } = parseResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        code: "CONFLICT",
        message: "A user with this email already exists.",
      });
      return;
    }

    let assignedRole: "student" | "driver" | "campus_admin" = "student";
    if (accountType === "DRIVER") {
      assignedRole = "driver";
    } else if (accountType === "ADMIN") {
      // Validate admin invitation code or token (never create admin via ordinary registration)
      const validAdminKey =
        process.env.ADMIN_INVITATION_CODE ||
        process.env.ADMIN_SECRET ||
        "CAMPUS_ADMIN_INVITE_2025";
      if (!adminInvitationToken || adminInvitationToken !== validAdminKey) {
        res.status(403).json({
          code: "ADMIN_INVITATION_REQUIRED",
          message:
            "Administrator accounts are issued by CampusRide. Valid invitation token required.",
        });
        return;
      }
      assignedRole = "campus_admin";
    }

    // Cost factor raised to 12 (§2.6)
    const passwordHash = await bcrypt.hash(password, 12);

    const initialAvatar = avatarURL || facePhoto || "";
    const hasFace = !!initialAvatar;

    // Initial state is pending verification for all new accounts (§4.1)
    const user = await User.create({
      name,
      email,
      passwordHash,
      college,
      year: Number(year),
      department,
      course,
      semester: Number(semester),
      phone,
      gender,
      role: assignedRole,
      accountType,
      avatarURL: initialAvatar,
      verificationStatus: "pending",
      enrolledIdCardUrl: enrolledIdCardUrl || "",
      lastDailyIdCheckDate: "",
      faceEnrollmentStatus: hasFace ? "ENROLLED" : "NOT_STARTED",
      faceVerificationEnabled: hasFace,
      faceEmbedding: faceDescriptor && faceDescriptor.length >= 64 ? faceDescriptor : undefined,
      rating: 5.0,
      totalRides: 0,
      tokenVersion: 0,
    });

    if (vehicle && (vehicle.model || vehicle.plateLast4)) {
      await Vehicle.create({
        ownerUserId: user._id,
        type: vehicle.type || "car",
        model: vehicle.model || "Standard Vehicle",
        capacity: Number(vehicle.capacity) || 4,
        plateLast4: vehicle.plateLast4 || "0000",
      });
    }

    await logAuditEvent({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: "ACCOUNT_CREATED",
      resourceType: "User",
      resourceId: user._id.toString(),
      metadata: { accountType: user.accountType, role: user.role },
      req,
    });

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      college: user.college,
      verificationStatus: user.verificationStatus,
      role: user.role,
      accountType: user.accountType,
      institutionId: user.institutionId?.toString(),
      campusId: user.campusId?.toString(),
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = signRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      refreshToken,
      user,
    });
  } catch (err: any) {
    logger.error({ err }, "Register error");
    res
      .status(500)
      .json({ code: "SERVER_ERROR", message: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: parseResult.error.issues.map((e: any) => e.message).join(", "),
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || "");
    if (!isMatch) {
      res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
      return;
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      college: user.college,
      verificationStatus: user.verificationStatus,
      role: user.role,
      accountType: user.accountType,
      institutionId: user.institutionId?.toString(),
      campusId: user.campusId?.toString(),
      tokenVersion: user.tokenVersion ?? 0,
    });

    const refreshToken = signRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion ?? 0,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const vehicle = await Vehicle.findOne({ ownerUserId: user._id });

    res.status(200).json({
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        year: user.year,
        department: user.department,
        course: user.course,
        semester: user.semester,
        avatarURL: user.avatarURL,
        rating: user.rating,
        totalRides: user.totalRides,
        verificationStatus: user.verificationStatus,
        accountType: user.accountType,
        role: user.role,
        faceEnrollmentStatus: user.faceEnrollmentStatus,
        faceVerificationEnabled: user.faceVerificationEnabled,
        institutionId: user.institutionId,
        campusId: user.campusId,
        enrolledIdCardUrl: user.enrolledIdCardUrl || "",
        lastDailyIdCheckDate: user.lastDailyIdCheckDate || "",
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      vehicle,
    });
  } catch (err: any) {
    logger.error({ err }, "Login error");
    res.status(500).json({ code: "SERVER_ERROR", message: "Login failed" });
  }
});

// POST /api/auth/refresh (Rotation + tokenVersion validation)
router.post("/refresh", async (req, res): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      res
        .status(401)
        .json({ code: "UNAUTHORIZED", message: "No refresh token provided" });
      return;
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      res.status(401).json({
        code: "TOKEN_REVOKED",
        message: "Refresh token expired or revoked",
      });
      res.status(401).json({
        code: "TOKEN_REVOKED",
        message: "Refresh token expired or revoked",
      });
      return;
    }

    // Rotate refresh token
    const newAccessToken = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      college: user.college,
      verificationStatus: user.verificationStatus,
      role: user.role,
      institutionId: user.institutionId?.toString(),
      campusId: user.campusId?.toString(),
      tokenVersion: user.tokenVersion,
    });

    const newRefreshToken = signRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    res.status(401).json({
      code: "INVALID_REFRESH_TOKEN",
      message: "Invalid or expired refresh token",
    });
    res.status(401).json({
      code: "INVALID_REFRESH_TOKEN",
      message: "Invalid or expired refresh token",
    });
  }
});

// POST /api/auth/logout (Instant invalidation via tokenVersion increment)
router.post(
  "/logout",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (req.user?.id) {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { tokenVersion: 1 },
        });
      }
      res.clearCookie("refreshToken");
      res.status(200).json({ message: "Logged out successfully" });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Logout failed" });
    }
  },
);

// GET /api/auth/me
router.get(
  "/me",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }
      const vehicle = await Vehicle.findOne({ ownerUserId: user._id });
      res.status(200).json({ user, vehicle });
    } catch (err: any) {
      res
        .status(500)
        .json({ code: "SERVER_ERROR", message: "Failed to fetch user" });
    }
  },
);

// POST /api/auth/forgot-password (§33)
router.post("/forgot-password", async (req, res): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ code: "BAD_REQUEST", message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Do not reveal email existence to prevent user enumeration
      res.status(200).json({
        message: "If that email is registered, password reset instructions have been sent.",
      });
      return;
    }

    const resetOtp = generateSecureOtp(6);
    const salt = generateSalt();
    const tokenHash = hashOtp(resetOtp, salt);

    user.passwordResetTokenHash = `${tokenHash}:${salt}`;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await logAuditEvent({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: "PASSWORD_RESET_REQUESTED",
      resourceType: "User",
      resourceId: user._id.toString(),
      req,
    });

    const isDev = process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "true";
    res.status(200).json({
      message: "Password reset instructions sent.",
      ...(isDev ? { devResetOtp: resetOtp } : {}),
    });
  } catch (err) {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to process password reset" });
  }
});

// POST /api/auth/reset-password (§33)
router.post("/reset-password", async (req, res): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email, OTP and new password are required",
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+passwordResetTokenHash +passwordResetExpires",
    );

    if (!user || !user.passwordResetTokenHash || !user.passwordResetExpires) {
      res.status(400).json({
        code: "INVALID_OTP",
        message: "Invalid or expired reset token",
      });
      return;
    }

    if (user.passwordResetExpires.getTime() < Date.now()) {
      res.status(400).json({
        code: "EXPIRED_OTP",
        message: "Reset token has expired. Please request a new one.",
      });
      return;
    }

    const [storedHash, salt] = user.passwordResetTokenHash.split(":");
    const computedHash = hashOtp(otp.trim(), salt);
    if (computedHash !== storedHash) {
      res.status(400).json({
        code: "INVALID_OTP",
        message: "Invalid reset token",
      });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await logAuditEvent({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: "PASSWORD_RESET_COMPLETED",
      resourceType: "User",
      resourceId: user._id.toString(),
      req,
    });

    res.status(200).json({
      message: "Password has been successfully updated. You may now log in.",
    });
  } catch (err) {
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Failed to reset password",
    });
  }
});

// POST /api/users/:id/verify
// POST /api/users/:id/verify (Admin-only verification)
router.post(
  "/users/:id/verify",
  requireAuth,
  requireRole("campus_admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res
          .status(400)
          .json({ code: "BAD_REQUEST", message: "Invalid user ID" });
        return;
      }

      const user = await User.findByIdAndUpdate(
        id,
        { verificationStatus: "verified" },
        { new: true },
      );

      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: "ADMIN_VERIFIED_USER",
        resourceType: "User",
        resourceId: id,
        req,
      });

      res.status(200).json({ message: "User successfully verified", user });
    } catch (err: any) {
      res
        .status(500)
        .json({ code: "SERVER_ERROR", message: "Verification update failed" });
    }
  },
);

// POST /api/auth/phone/send-otp
router.post(
  "/phone/send-otp",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { phone } = req.body;
      if (!phone || typeof phone !== "string" || phone.trim().length < 8) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: "Valid phone number required",
        });
        return;
      }

      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      const otp = generateSecureOtp(6);
      const salt = generateSalt();
      const hash = hashOtp(otp, salt);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      user.phone = phone.trim();
      user.phoneOtpHash = hash;
      user.phoneOtpSalt = salt;
      user.phoneOtpExpires = expiresAt;
      user.phoneOtpAttempts = 0;
      await user.save();

      const dispatchResult = await NotificationService.sendPhoneOtp(
        phone.trim(),
        otp,
      );

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: "PHONE_OTP_DISPATCHED",
        resourceType: "User",
        resourceId: req.user!.id,
        metadata: { mode: dispatchResult.mode },
        req,
      });

      res.status(200).json({
        message: "Phone verification code sent successfully",
        dispatchMode: dispatchResult.mode,
        expiresInSeconds: 600,
        ...(process.env.NODE_ENV !== "production" ? { devOtpHint: otp } : {}),
      });
    } catch (err: any) {
      res.status(500).json({
        code: "SERVER_ERROR",
        message: "Failed to dispatch phone OTP",
      });
    }
  },
);

// POST /api/auth/phone/verify-otp
router.post(
  "/phone/verify-otp",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { otp } = req.body;
      if (!otp || typeof otp !== "string" || otp.length !== 6) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: "6-digit OTP code is required",
        });
        return;
      }

      const user = await User.findById(req.user!.id);
      if (
        !user ||
        !user.phoneOtpHash ||
        !user.phoneOtpSalt ||
        !user.phoneOtpExpires
      ) {
        res.status(400).json({
          code: "NO_ACTIVE_OTP",
          message:
            "No active verification code found. Please request a new code.",
        });
        return;
      }

      if (new Date() > user.phoneOtpExpires) {
        res.status(400).json({
          code: "OTP_EXPIRED",
          message: "Verification code has expired. Please request a new code.",
        });
        return;
      }

      if ((user.phoneOtpAttempts || 0) >= 5) {
        res.status(429).json({
          code: "OTP_MAX_ATTEMPTS",
          message: "Too many failed attempts. Please request a new code.",
        });
        return;
      }

      const computedHash = hashOtp(otp, user.phoneOtpSalt);
      if (computedHash !== user.phoneOtpHash) {
        user.phoneOtpAttempts = (user.phoneOtpAttempts || 0) + 1;
        await user.save();
        res.status(400).json({
          code: "INVALID_OTP",
          message: "Incorrect verification code.",
          attemptsRemaining: 5 - user.phoneOtpAttempts,
        });
        return;
      }

      user.isPhoneVerified = true;
      user.phoneOtpHash = undefined;
      user.phoneOtpSalt = undefined;
      user.phoneOtpExpires = undefined;
      user.phoneOtpAttempts = 0;
      await user.save();

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: "PHONE_VERIFIED",
        resourceType: "User",
        resourceId: req.user!.id,
        req,
      });

      res.status(200).json({
        message: "Phone number verified successfully",
        isPhoneVerified: true,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ code: "SERVER_ERROR", message: "Failed to verify phone OTP" });
    }
  },
);

// POST /api/auth/email/send-verification
router.post(
  "/email/send-verification",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      const rawToken = generateSecureToken(32);
      user.emailVerificationTokenHash = hashToken(rawToken);
      user.emailVerificationExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ); // 24 hours
      await user.save();

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: "EMAIL_VERIFICATION_SENT",
        resourceType: "User",
        resourceId: req.user!.id,
        req,
      });

      res.status(200).json({
        message: "Email verification link sent successfully",
        ...(process.env.NODE_ENV !== "production"
          ? { devVerificationToken: rawToken }
          : {}),
      });
    } catch (err: any) {
      res.status(500).json({
        code: "SERVER_ERROR",
        message: "Failed to send email verification",
      });
    }
  },
);

// POST /api/auth/email/verify
router.post("/email/verify", async (req, res): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      res.status(400).json({
        code: "BAD_REQUEST",
        message: "Verification token is required",
      });
      return;
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        code: "INVALID_OR_EXPIRED_TOKEN",
        message: "Verification link is invalid or has expired.",
      });
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await logAuditEvent({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: "EMAIL_VERIFIED",
      resourceType: "User",
      resourceId: user._id.toString(),
    });

    res.status(200).json({
      message: "Email address verified successfully",
      isEmailVerified: true,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ code: "SERVER_ERROR", message: "Failed to verify email token" });
  }
});

// PUT /api/auth/profile-photo - Updates user avatar and biometrics from camera or upload
router.put(
  "/profile-photo",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { avatarURL, facePhoto, faceEmbedding } = req.body;

      const photo = avatarURL || facePhoto;
      if (!photo) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Profile photo URL or base64 data is required.",
        });
        return;
      }

      const updateData: any = {
        avatarURL: photo,
      };

      if (faceEmbedding && Array.isArray(faceEmbedding) && faceEmbedding.length >= 64) {
        updateData.faceEmbedding = faceEmbedding;
        updateData.faceEnrollmentStatus = "ENROLLED";
        updateData.faceVerificationEnabled = true;
      }

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      await logAuditEvent({
        actorId: user._id.toString(),
        actorRole: user.role,
        action: "PROFILE_UPDATED",
        resourceType: "User",
        resourceId: user._id.toString(),
        metadata: { updatedField: "avatarURL", faceEnrolled: !!faceEmbedding },
        req,
      });

      res.status(200).json({
        success: true,
        message: "Profile photo updated successfully",
        user,
      });
    } catch (err: any) {
      logger.error({ err }, "Update profile photo error");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to update profile photo" });
    }
  }
);

// PUT /api/auth/profile - Update user academic details, department, course, phone, name
router.put(
  "/profile",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { name, college, department, course, year, semester, phone } = req.body;

      const updateData: any = {};
      if (name && typeof name === "string") updateData.name = name.trim();
      if (college && typeof college === "string") updateData.college = college.trim();
      if (department !== undefined && typeof department === "string") updateData.department = department.trim();
      if (course !== undefined && typeof course === "string") updateData.course = course.trim();
      if (year !== undefined && !isNaN(Number(year))) updateData.year = Number(year);
      if (semester !== undefined && !isNaN(Number(semester))) updateData.semester = Number(semester);
      if (phone !== undefined && typeof phone === "string") updateData.phone = phone.trim();

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      await logAuditEvent({
        actorId: user._id.toString(),
        actorRole: user.role,
        action: "PROFILE_UPDATED",
        resourceType: "User",
        resourceId: user._id.toString(),
        metadata: { updatedFields: Object.keys(updateData) },
        req,
      });

      res.status(200).json({
        success: true,
        message: "Academic profile updated successfully",
        user,
      });
    } catch (err: any) {
      logger.error({ err }, "Update profile error");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to update profile" });
    }
  }
);

// DELETE /api/auth/me/account (Right to Erasure / Account Deletion §14.3)
router.delete(
  "/me/account",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      // 1. Cancel any active rides
      await Ride.updateMany(
        { creator: userId, status: "active" },
        { $set: { status: "cancelled" } }
      );

      // 2. Cancel pending ride requests
      await RideRequest.updateMany(
        { passengerId: userId, status: "pending" },
        { $set: { status: "cancelled" } }
      );

      // 3. Remove registered vehicle
      await Vehicle.deleteMany({ ownerUserId: userId });

      // 4. Anonymize user record for referential integrity with past trips
      await User.findByIdAndUpdate(userId, {
        $set: {
          name: "Former Student",
          email: `deleted_${userId}@deleted.campusride.edu`,
          phone: undefined,
          avatarURL: "",
          passwordHash: "DELETED",
          emergencyContact: undefined,
          emergencyContacts: [],
          verificationStatus: "unverified",
          isEmailVerified: false,
          isPhoneVerified: false,
        },
      });

      await logAuditEvent({
        actorId: userId,
        actorRole: req.user!.role,
        action: "ACCOUNT_DELETED",
        resourceType: "User",
        resourceId: userId,
      });

      res.status(200).json({
        message: "Account and personal data successfully deleted.",
      });
    } catch (err: any) {
      logger.error({ err }, "Account deletion error");
      res.status(500).json({
        code: "SERVER_ERROR",
        message: "Failed to process account deletion request",
      });
    }
  }
);

export default router;
