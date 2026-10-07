import { Router, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Conversation, Ride, RideRequest } from "../models";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { getSocketIO } from "../sockets/socketHandler";
import { logger } from "../utils/logger";

const router = Router();

const sendMessageSchema = z.object({
  text: z.string().trim().min(1).max(1000).optional(),
  content: z.string().trim().min(1).max(1000).optional(),
}).refine((data) => !!(data.text || data.content), {
  message: "Message cannot be empty",
});

// GET /api/conversations?rideId=
router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.query;
    const userId = req.user!.id;

    if (rideId && mongoose.Types.ObjectId.isValid(rideId as string)) {
      let conversation = await Conversation.findOne({ rideId })
        .populate("participants", "name email avatarURL phone college")
        .populate("messages.senderId", "name email avatarURL");

      if (!conversation) {
        // If ride exists and user is creator, auto-initialize conversation
        const ride = await Ride.findById(rideId);
        if (ride) {
          conversation = await Conversation.create({
            rideId: ride._id,
            participants: [ride.creator],
            messages: [],
          });
          conversation = await Conversation.findById(conversation._id)
            .populate("participants", "name email avatarURL phone college")
            .populate("messages.senderId", "name email avatarURL");
        }
      }

      if (!conversation) {
        res.status(404).json({ code: "NOT_FOUND", message: "Conversation not found" });
        return;
      }

      // Check if user is participant or creator
      const isParticipant = conversation.participants.some(
        (p: any) => (p._id || p).toString() === userId
      );

      if (!isParticipant) {
        // If passenger has an accepted or pending request, is driver, admin, or authenticated student
        const ride = await Ride.findById(rideId);
        const isDriver = ride && ride.creator.toString() === userId;
        const hasRequest = await RideRequest.findOne({
          rideId,
          passengerId: userId,
        });
        const isAdmin = ["campus_admin", "super_admin"].includes(req.user!.role || "");

        if (!isDriver && !hasRequest && !isAdmin && !req.user) {
          res.status(403).json({
            code: "FORBIDDEN",
            message: "Unauthorized: You are not a confirmed participant of this ride conversation",
          });
          return;
        }

        conversation.participants.push(new mongoose.Types.ObjectId(userId) as any);
        await conversation.save();
      }

      res.status(200).json(conversation);
      return;
    }

    // List all conversations user is a part of
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("rideId")
      .populate("participants", "name email avatarURL phone college")
      .populate("messages.senderId", "name email avatarURL")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (err: any) {
    logger.error({ err }, "Fetch conversation error");
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch conversation" });
  }
});

// POST /api/conversations/:id/messages
router.post("/:id/messages", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ code: "BAD_REQUEST", message: "Invalid conversation ID" });
      return;
    }

    const parseResult = sendMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        code: "VALIDATION_ERROR",
        message: parseResult.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    const text = (parseResult.data.text || parseResult.data.content)!.trim();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      res.status(404).json({ code: "NOT_FOUND", message: "Conversation not found" });
      return;
    }

    // Participant verification
    const userId = req.user!.id;
    const isParticipant = conversation.participants.some(
      (p: any) => (p._id || p).toString() === userId
    );

    if (!isParticipant) {
      conversation.participants.push(new mongoose.Types.ObjectId(userId) as any);
      await conversation.save();
    }

    const newMessage = {
      senderId: new mongoose.Types.ObjectId(userId),
      text: text.trim(),
      time: new Date(),
    };

    conversation.messages.push(newMessage as any);
    await conversation.save();

    const populatedConv = await Conversation.findById(id)
      .populate("participants", "name email avatarURL phone college")
      .populate("messages.senderId", "name email avatarURL");

    const createdMsg = populatedConv!.messages[populatedConv!.messages.length - 1];

    // Real-time socket event: chatMessage
    const io = getSocketIO();
    if (io) {
      io.to(`conv_${id}`).emit("chatMessage", {
        conversationId: id,
        rideId: conversation.rideId,
        message: createdMsg,
      });
      io.to(`ride_${conversation.rideId.toString()}`).emit("chatMessage", {
        conversationId: id,
        rideId: conversation.rideId,
        message: createdMsg,
      });
    }

    res.status(201).json(createdMsg);
  } catch (err: any) {
    logger.error({ err }, "Send message error");
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to send message" });
  }
});

// GET /api/conversations/:id/messages
router.get("/:id/messages", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ code: "BAD_REQUEST", message: "Invalid conversation ID" });
      return;
    }

    const conversation = await Conversation.findById(id)
      .populate("messages.senderId", "name email avatarURL");

    if (!conversation) {
      res.status(404).json({ code: "NOT_FOUND", message: "Conversation not found" });
      return;
    }

    // Check ownership/participation
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user!.id
    );

    if (!isParticipant) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: "Unauthorized: You are not a participant in this conversation",
      });
      return;
    }

    res.status(200).json(conversation.messages);
  } catch (err: any) {
    logger.error({ err }, "Fetch messages error");
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch messages" });
  }
});

export default router;
