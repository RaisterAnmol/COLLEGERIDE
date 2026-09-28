import { Router, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Review, User, Trip } from "../models";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = Router();

const createReviewSchema = z.object({
  tripId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), "Invalid trip ID"),
  toUserId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), "Invalid toUserId"),
  rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().trim().max(1000).optional().default(""),
  role: z.enum(["driver", "passenger"]).optional(),
  tags: z.array(z.string().trim().max(50)).optional().default([]),
});

// POST /api/reviews
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        code: "BAD_REQUEST",
        error: parseResult.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    const { tripId, toUserId, rating, comment, role, tags } = parseResult.data;
    const fromUserId = req.user!.id;

    if (fromUserId === toUserId) {
      res.status(400).json({ code: "BAD_REQUEST", error: "Cannot review yourself" });
      return;
    }

    // Verify trip existence
    const trip = await Trip.findById(tripId);
    if (!trip) {
      res.status(404).json({ code: "NOT_FOUND", error: "Trip not found" });
      return;
    }

    // Verify both users were part of this trip
    const driverMatch = trip.driverId.toString();
    const isFromParticipant = driverMatch === fromUserId || trip.passengerIds.some((p) => p.toString() === fromUserId);
    const isToParticipant = driverMatch === toUserId || trip.passengerIds.some((p) => p.toString() === toUserId);

    if (!isFromParticipant || !isToParticipant) {
      res.status(403).json({
        code: "FORBIDDEN",
        error: "Both users must be participants of this trip to exchange reviews",
      });
      return;
    }

    // Check for existing review
    const existingReview = await Review.findOne({ tripId, fromUserId, toUserId });
    if (existingReview) {
      res.status(409).json({ code: "CONFLICT", error: "You have already reviewed this user for this trip" });
      return;
    }

    const computedRole = role || (driverMatch === toUserId ? "driver" : "passenger");

    const review = await Review.create({
      tripId,
      fromUserId,
      toUserId,
      rating,
      comment: comment || "",
      role: computedRole,
      tags: tags || [],
    });

    // Recompute recipient's average rating
    const allReviews = await Review.find({ toUserId });
    const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalScore / allReviews.length) * 10) / 10;

    await User.findByIdAndUpdate(toUserId, { rating: avgRating });

    const populatedReview = await Review.findById(review._id)
      .populate("fromUserId", "name avatarURL college year department")
      .populate("toUserId", "name avatarURL college year department");

    res.status(201).json({
      review: populatedReview,
      updatedRating: avgRating,
    });
  } catch (err: any) {
    logger.error({ err }, "Create review error");
    res.status(500).json({ code: "SERVER_ERROR", error: err.message || "Failed to submit review" });
  }
});

// GET /api/users/:id/reviews
router.get("/users/:id/reviews", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.query;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ code: "BAD_REQUEST", error: "Invalid user ID" });
      return;
    }

    const filter: any = { toUserId: id };
    if (role && (role === "driver" || role === "passenger")) {
      filter.role = role;
    }

    const reviews = await Review.find(filter)
      .populate("fromUserId", "name avatarURL college year department")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err: any) {
    logger.error({ err }, "Fetch reviews error");
    res.status(500).json({ code: "SERVER_ERROR", error: "Failed to fetch reviews" });
  }
});

export default router;
