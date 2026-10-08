import { Router, Response } from "express";
import { Notification } from "../models/Notification";
import { PushDevice } from "../models/PushDevice";
import { User } from "../models/User";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/notifications (User's notifications)
router.get(
  "/",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Ensure emergency setup advisory notification exists if user is missing phone or emergency contact
      const user = await User.findById(req.user!.id);
      if (user && (!user.phone || !user.emergencyContact?.phone)) {
        const existingAdvisory = await Notification.findOne({
          userId: user._id,
          type: "SECURITY_ALERT",
          title: { $regex: /Emergency Contact/i },
        });
        if (!existingAdvisory) {
          await Notification.create({
            userId: user._id,
            type: "SECURITY_ALERT",
            title: "🚨 Action Required: Add Emergency Contact & WhatsApp Number",
            body: "CampusRide Safety Notice: Please add your emergency contact and WhatsApp mobile number to enable 24/7 instant SOS distress dispatch with live Google Maps tracking during university commutes.\n\nHow to add in 10 seconds:\n1. Click 'Edit Profile' on your Dashboard.\n2. Enter your 10-digit mobile number for WhatsApp SOS confirmation.\n3. Enter your Emergency Contact Name, Phone & Relationship (Parent / Guardian).\n4. Click 'Save Changes' — your SOS protection is immediately active 24/7!",
            data: {
              action: "EDIT_PROFILE",
              url: "/dashboard",
            },
            deliveryChannels: ["in_app", "socket"],
            deliveryStatus: { in_app: "sent" },
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }
      }

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

