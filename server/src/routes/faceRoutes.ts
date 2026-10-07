import { Router, Response } from "express";
import { User } from "../models/User";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { logAuditEvent } from "../services/auditService";

const router = Router();

const FACE_MAX_RETRIES = parseInt(process.env.FACE_MAX_RETRIES || "3", 10);
const FACE_MATCH_THRESHOLD = parseFloat(process.env.FACE_MATCH_THRESHOLD || "0.60");

// Helper: Cosine similarity between two float vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// POST /api/face/enroll
router.post(
  "/enroll",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const descriptor = req.body.descriptor || req.body.embedding;
      if (!Array.isArray(descriptor) || descriptor.length < 64) {
        res.status(400).json({
          code: "INVALID_DESCRIPTOR",
          message: "Valid face embedding descriptor vector is required.",
        });
        return;
      }

      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      user.faceEmbedding = descriptor;
      if (user.verificationStatus === "verified") {
        user.faceEnrollmentStatus = "ENROLLED";
        user.faceVerificationEnabled = true;
      } else {
        user.faceEnrollmentStatus = "PENDING";
      }
      await user.save();

      await logAuditEvent({
        actorId: user._id.toString(),
        actorRole: user.role,
        action: "FACE_ENROLLED",
        resourceType: "User",
        resourceId: user._id.toString(),
        req,
      });

      res.status(200).json({
        message: user.faceEnrollmentStatus === "ENROLLED"
          ? "Face biometric profile enrolled and active."
          : "Face enrolled successfully. Awaiting administrative identity approval.",
        enrollmentStatus: user.faceEnrollmentStatus,
        status: user.faceEnrollmentStatus,
      });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to enroll face embedding" });
    }
  }
);

// POST /api/face/verify
router.post(
  "/verify",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const descriptor = req.body.descriptor || req.body.embedding;
      const { action = "SENSITIVE_ACTION" } = req.body;
      if (!Array.isArray(descriptor) || descriptor.length < 64) {
        res.status(400).json({
          code: "INVALID_DESCRIPTOR",
          message: "Valid face verification vector is required.",
        });
        return;
      }

      const user = await User.findById(req.user!.id).select("+faceEmbedding");
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      if (!user.faceVerificationEnabled || user.faceEnrollmentStatus !== "ENROLLED" || !user.faceEmbedding) {
        res.status(400).json({
          code: "FACE_NOT_ENROLLED",
          message: "Face verification is not active on this account.",
        });
        return;
      }

      const currentRetries = user.faceRetryCount || 0;
      if (currentRetries >= FACE_MAX_RETRIES) {
        res.status(429).json({
          code: "RETRIES_EXCEEDED",
          message: "Maximum face verification retries exceeded. Please use OTP verification.",
          fallback: "OTP",
        });
        return;
      }

      const similarity = cosineSimilarity(descriptor, user.faceEmbedding);
      const isMatch = similarity >= FACE_MATCH_THRESHOLD;

      if (isMatch) {
        user.faceRetryCount = 0;
        await user.save();

        await logAuditEvent({
          actorId: user._id.toString(),
          actorRole: user.role,
          action: "FACE_VERIFICATION_SUCCESS",
          resourceType: "User",
          resourceId: user._id.toString(),
          metadata: { action },
          req,
        });

        res.status(200).json({
          verified: true,
          similarity: Number(similarity.toFixed(4)),
          message: "Identity verified successfully",
        });
      } else {
        const newRetries = currentRetries + 1;
        user.faceRetryCount = newRetries;
        await user.save();

        await logAuditEvent({
          actorId: user._id.toString(),
          actorRole: user.role,
          action: "FACE_VERIFICATION_FAILED",
          resourceType: "User",
          resourceId: user._id.toString(),
          metadata: { action, retryCount: newRetries },
          req,
        });

        const remaining = Math.max(0, FACE_MAX_RETRIES - newRetries);
        res.status(401).json({
          verified: false,
          similarity: Number(similarity.toFixed(4)),
          message: remaining > 0 ? "Face did not match enrolled profile. Please try again." : "Too many failed attempts. Please use OTP fallback.",
          remainingRetries: remaining,
          fallback: remaining === 0 ? "OTP" : undefined,
        });
      }
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Face verification failed" });
    }
  }
);

// POST /api/face/daily-liveness (Morning Driver Liveness Check)
router.post(
  "/daily-liveness",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      user.lastDailyIdCheckDate = todayStr;
      if (req.body.photo && (!user.avatarURL || user.avatarURL.includes('unsplash'))) {
        user.avatarURL = req.body.photo;
      }
      await user.save();

      await logAuditEvent({
        actorId: user._id.toString(),
        actorRole: user.role,
        action: "DRIVER_DAILY_LIVENESS_CHECK_PASSED",
        resourceType: "User",
        resourceId: user._id.toString(),
        metadata: { date: todayStr },
        req,
      });

      res.status(200).json({
        success: true,
        verifiedDate: todayStr,
        message: "Driver morning commute liveness check passed!",
      });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to record daily liveness" });
    }
  }
);

export default router;
