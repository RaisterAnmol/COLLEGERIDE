import { Router, Response } from "express";
import { Notification } from "../models/Notification";
import { PushDevice } from "../models/PushDevice";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/notifications (User's notifications)
router.get(
  "/",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const notifications = await Notification.find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .limit(40);

      const unreadCount = await Notification.countDocuments({
        userId: req.user!.id,
        readAt: { $exists: false },
      });

      res.status(200).json({ notifications, unreadCount });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch notifications" });
    }
  }
);

// PATCH /api/notifications/:id/read
router.patch(
  "/:id/read",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const notification = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user!.id },
        { readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ code: "NOT_FOUND", message: "Notification not found" });
        return;
      }

      res.status(200).json({ notification });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to mark notification read" });
    }
  }
);

// PATCH /api/notifications/mark-all-read
router.patch(
  "/mark-all-read",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await Notification.updateMany(
        { userId: req.user!.id, readAt: { $exists: false } },
        { readAt: new Date() }
      );
      res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to mark all as read" });
    }
  }
);

// POST /api/notifications/devices (Register device for Web Push / FCM)
router.post(
  "/devices",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { token, platform, endpoint, authSecret, p256dhKey } = req.body;
      if (!token || typeof token !== "string") {
        res.status(400).json({ code: "BAD_REQUEST", message: "Device token is required" });
        return;
      }

      const device = await PushDevice.findOneAndUpdate(
        { token },
        {
          userId: req.user!.id,
          platform: platform || "web",
          endpoint,
          authSecret,
          p256dhKey,
          active: true,
          lastActiveAt: new Date(),
        },
        { upsert: true, new: true }
      );

      res.status(200).json({ message: "Device registered for notifications", device });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to register push device" });
    }
  }
);

export default router;

