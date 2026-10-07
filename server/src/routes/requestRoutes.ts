import { Router, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { RideRequest, Ride, Conversation, User } from "../models";
import { requireAuth, requireVerificationApproved, AuthenticatedRequest } from "../middleware/auth";
import { isVerificationApproved } from "../models/User";
import { getSocketIO } from "../sockets/socketHandler";
import { logger } from "../utils/logger";

const router = Router();

const updateRequestStatusSchema = z.object({
  status: z.enum(["accepted", "declined", "cancelled"]),
});

// POST /api/rides/:id/request
router.post(
  "/rides/:id/request",
  requireAuth,
  requireVerificationApproved,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Invalid ride ID" });
        return;
      }

      const ride = await Ride.findById(id);
      if (!ride) {
        res.status(404).json({ code: "NOT_FOUND", message: "Ride not found" });
        return;
      }

      if (ride.creator.toString() === req.user!.id) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Cannot request your own ride" });
        return;
      }

      if (ride.availableSeats < 1) {
        res.status(400).json({ code: "NO_SEATS", message: "No seats available on this ride" });
        return;
      }

      // Check for existing request
      const existingReq = await RideRequest.findOne({
        rideId: ride._id,
        passengerId: req.user!.id,
        status: { $in: ["pending", "accepted"] },
      });

      if (existingReq) {
        res.status(409).json({
          code: "DUPLICATE_REQUEST",
          message: "You already have an active request for this ride",
        });
        return;
      }

      try {
        const rideRequest = await RideRequest.create({
          rideId: ride._id,
          passengerId: req.user!.id,
          status: "pending",
        });

        const populatedReq = await RideRequest.findById(rideRequest._id)
          .populate("passengerId", "name email college year avatarURL rating totalRides phone")
          .populate("rideId");

        // Real-time socket notification to driver
        const io = getSocketIO();
        if (io) {
          io.to(`user_${ride.creator.toString()}`).emit("newRequest", {
            request: populatedReq,
            rideId: ride._id,
          });
        }

        res.status(201).json(populatedReq);
      } catch (err: any) {
        // MongoDB duplicate key error on compound index { rideId, passengerId }
        if (err.code === 11000) {
          res.status(409).json({
            code: "DUPLICATE_REQUEST",
            message: "Duplicate ride request detected",
          });
          return;
        }
        throw err;
      }
    } catch (err: any) {
      logger.error({ err }, "Create request error");
      res.status(500).json({ code: "SERVER_ERROR", message: err.message || "Failed to submit ride request" });
    }
  }
);

// GET /api/requests (fetch incoming requests for driver or outgoing for passenger)
router.get(
  "/requests",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { role, rideId } = req.query;
      const userId = req.user!.id;

      if (rideId && mongoose.Types.ObjectId.isValid(rideId as string)) {
        const requests = await RideRequest.find({ rideId })
          .populate("passengerId", "name email college year avatarURL rating totalRides phone")
          .populate("rideId")
          .sort({ createdAt: -1 });
        res.status(200).json(requests);
        return;
      }

      if (role === "driver") {
        const userRides = await Ride.find({ creator: userId }).select("_id");
        const rideIds = userRides.map((r) => r._id);
        const requests = await RideRequest.find({ rideId: { $in: rideIds } })
          .populate("passengerId", "name email college year avatarURL rating totalRides phone")
          .populate("rideId")
          .sort({ createdAt: -1 });
        res.status(200).json(requests);
        return;
      }

      const requests = await RideRequest.find({ passengerId: userId })
        .populate("rideId")
        .populate("passengerId", "name email college year avatarURL rating totalRides phone")
        .sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (err: any) {
      logger.error({ err }, "Fetch requests error");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch ride requests" });
    }
  }
);

// PATCH /api/requests/:reqId (Driver accepts/declines, Passenger cancels)
router.patch(
  "/requests/:reqId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reqId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(reqId)) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Invalid request ID" });
        return;
      }

      const parseResult = updateRequestStatusSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: parseResult.error.issues.map((i) => i.message).join(", "),
        });
        return;
      }

      const { status } = parseResult.data;

      const rideRequest = await RideRequest.findById(reqId);
      if (!rideRequest) {
        res.status(404).json({ code: "NOT_FOUND", message: "Request not found" });
        return;
      }

      const ride = await Ride.findById(rideRequest.rideId);
      if (!ride) {
        res.status(404).json({ code: "NOT_FOUND", message: "Associated ride not found" });
        return;
      }

      // Only the driver can accept or decline; passenger can cancel
      if (status === "cancelled") {
        if (rideRequest.passengerId.toString() !== req.user!.id) {
          res.status(403).json({
            code: "FORBIDDEN",
            message: "Unauthorized: Only the passenger can cancel this request",
          });
          return;
        }
      } else {
        if (ride.creator.toString() !== req.user!.id) {
          res.status(403).json({
            code: "FORBIDDEN",
            message: "Unauthorized: Only the ride driver can accept or decline requests",
          });
          return;
        }

        const driverUser = await User.findById(req.user!.id).select("verificationStatus");
        if (!driverUser || !isVerificationApproved(driverUser)) {
          res.status(403).json({
            code: "VERIFICATION_REQUIRED",
            message: "Institutional verification required to accept or decline ride requests.",
          });
          return;
        }
      }

      if (status === "accepted" && rideRequest.status !== "accepted") {
        // §3.1 Atomic guarded seat decrement (prevents oversell race condition)
        const updatedRide = await Ride.findOneAndUpdate(
          { _id: ride._id, status: "active", availableSeats: { $gte: 1 } },
          { $inc: { availableSeats: -1 } },
          { new: true }
        );

        if (!updatedRide) {
          res.status(409).json({
            code: "SEATS_UNAVAILABLE",
            message: "No available seats left on this ride",
          });
          return;
        }
      }

      if (
        rideRequest.status === "accepted" &&
        (status === "declined" || status === "cancelled")
      ) {
        await Ride.findByIdAndUpdate(ride._id, { $inc: { availableSeats: 1 } });
      }

      rideRequest.status = status;
      await rideRequest.save();

      if (status === "accepted") {
        // Ensure conversation exists for in-app chat
        let conversation = await Conversation.findOne({ rideId: ride._id });
        if (!conversation) {
          conversation = await Conversation.create({
            rideId: ride._id,
            participants: [ride.creator, rideRequest.passengerId],
            messages: [],
          });
        } else {
          const pStr = conversation.participants.map((p) => p.toString());
          if (!pStr.includes(rideRequest.passengerId.toString())) {
            conversation.participants.push(rideRequest.passengerId);
            await conversation.save();
          }
        }
      }

      const populatedReq = await RideRequest.findById(reqId)
        .populate("passengerId", "name email college year avatarURL rating totalRides phone")
        .populate("rideId");

      // Real-time socket notification to passenger
      const io = getSocketIO();
      if (io) {
        io.to(`user_${rideRequest.passengerId.toString()}`).emit(
          "requestResponse",
          {
            request: populatedReq,
            status,
            rideId: ride._id,
          }
        );
      }

      res.status(200).json(populatedReq);
    } catch (err: any) {
      logger.error({ err }, "Update request error");
      res.status(500).json({ code: "SERVER_ERROR", message: err.message || "Failed to update request" });
    }
  }
);

// DELETE /api/requests/:reqId
router.delete(
  "/requests/:reqId",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reqId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(reqId)) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Invalid request ID" });
        return;
      }

      const rideRequest = await RideRequest.findById(reqId);
      if (!rideRequest) {
        res.status(404).json({ code: "NOT_FOUND", message: "Request not found" });
        return;
      }

      if (rideRequest.passengerId.toString() !== req.user!.id) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Unauthorized: Only the passenger can delete this request",
        });
        return;
      }

      if (rideRequest.status === "accepted") {
        await Ride.findByIdAndUpdate(rideRequest.rideId, { $inc: { availableSeats: 1 } });
      }

      await RideRequest.findByIdAndDelete(reqId);
      res.status(200).json({ message: "Request deleted successfully" });
    } catch (err: any) {
      logger.error({ err }, "Delete request error");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to delete request" });
    }
  }
);

export default router;
