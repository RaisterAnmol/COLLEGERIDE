import { Router, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { EmergencyIncident } from "../models/EmergencyIncident";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { EmergencyService } from "../services/emergencyService";
import { logAuditEvent } from "../services/auditService";
import { getSocketIO } from "../sockets/socketHandler";
import { logger } from "../utils/logger";

const router = Router();

const triggerSosSchema = z.object({
  tripId: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  accuracy: z.coerce.number().optional(),
  address: z.string().optional(),
  notes: z.string().max(1000).optional(),
  phone: z.string().optional(),
});

const updateIncidentStatusSchema = z.object({
  status: z.enum(["ACKNOWLEDGED", "RESPONDING", "RESOLVED", "FALSE_ALARM"]),
  securityNotes: z.string().max(1000).optional(),
});

// POST /api/emergency/sos (Trigger SOS Incident)
router.post(
  "/sos",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parseResult = triggerSosSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: parseResult.error.issues.map((i) => i.message).join(", "),
        });
        return;
      }

      const { tripId, latitude, longitude, accuracy, address, notes, phone } = parseResult.data;

      const result = await EmergencyService.triggerSos({
        userId: req.user!.id,
        tripId,
        location: {
          latitude,
          longitude,
          accuracy,
          address,
        },
        notes,
        phone,
      });

      res.status(result.isExisting ? 200 : 201).json({
        message: result.isExisting
          ? "Active emergency incident already exists for your ride"
          : "Emergency incident created. Campus security and contacts alerted.",
        incident: result.incident,
        isExisting: result.isExisting,
        emergencyHelplineAction: "112",
        dispatchSummary: result.dispatchSummary,
      });
    } catch (err: any) {
      logger.error({ err }, "[Emergency SOS Error]");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to process emergency SOS" });
    }
  }
);

// GET /api/emergency/incidents (Security Operations Center / Admin View)
router.get(
  "/incidents",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const isAdmin = ["campus_admin", "super_admin", "moderator"].includes(req.user?.role || "");

      let filter: any = {};
      if (!isAdmin) {
        // Regular student can only view their own incidents
        filter.triggeredBy = req.user!.id;
      } else {
        const { status, campusId } = req.query;
        if (status) filter.status = status;
        if (campusId) filter.campusId = campusId;
      }

      const incidents = await EmergencyIncident.find(filter)
        .populate("triggeredBy", "name email phone college avatarURL emergencyContacts")
        .populate("tripId")
        .sort({ createdAt: -1 })
        .limit(50);

      res.status(200).json({ incidents });
    } catch (err: any) {
      logger.error({ err }, "[Fetch Incidents Error]");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch incidents" });
    }
  }
);

// POST /api/emergency/incidents/resolve-mine (Student clears/resolves their own active SOS incidents)
router.post(
  "/incidents/resolve-mine",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = await EmergencyIncident.updateMany(
        {
          triggeredBy: req.user!.id,
          status: { $in: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING"] },
        },
        {
          $set: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            securityNotes: "Resolved by student from Safety & Protection Hub",
          },
        }
      );
      res.status(200).json({
        message: "Active emergency incidents marked as RESOLVED",
        modifiedCount: result.modifiedCount,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to resolve active incidents" });
    }
  }
);

// PATCH /api/emergency/incidents/:id/status (Security team acknowledges / resolves incident)
router.patch(
  "/incidents/:id/status",
  requireAuth,
  requireRole("campus_admin", "super_admin", "moderator"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Invalid incident ID" });
        return;
      }

      const parseResult = updateIncidentStatusSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: parseResult.error.issues.map((i) => i.message).join(", "),
        });
        return;
      }

      const { status, securityNotes } = parseResult.data;

      const updateData: any = { status };
      if (securityNotes) updateData.securityNotes = securityNotes;

      if (status === "ACKNOWLEDGED") {
        updateData.acknowledgedBy = req.user!.id;
        updateData.acknowledgedAt = new Date();
      } else if (status === "RESOLVED" || status === "FALSE_ALARM") {
        updateData.resolvedBy = req.user!.id;
        updateData.resolvedAt = new Date();
      }

      const incident = await EmergencyIncident.findByIdAndUpdate(id, updateData, { new: true })
        .populate("triggeredBy", "name email phone college");

      if (!incident) {
        res.status(404).json({ code: "NOT_FOUND", message: "Incident not found" });
        return;
      }

      const io = getSocketIO();
      if (io) {
        io.to("security_operations_room").emit("emergency:incident:updated", {
          incidentId: incident._id,
          status: incident.status,
          updatedBy: req.user!.name,
        });
      }

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: `SOS_${status}`,
        resourceType: "EmergencyIncident",
        resourceId: id,
        metadata: { status, securityNotes },
        req,
      });

      res.status(200).json({ message: `Incident marked as ${status}`, incident });
    } catch (err: any) {
      logger.error({ err }, "[Update Incident Status Error]");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to update incident status" });
    }
  }
);

export default router;
