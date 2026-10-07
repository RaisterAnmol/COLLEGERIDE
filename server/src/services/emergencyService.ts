import mongoose from "mongoose";
import { EmergencyIncident, IEmergencyIncident } from "../models/EmergencyIncident";
import { User, IUser } from "../models/User";
import { Trip } from "../models/Trip";
import { NotificationService } from "./notificationService";
import { getSocketIO } from "../sockets/socketHandler";
import { logAuditEvent } from "./auditService";

export interface TriggerSosInput {
  userId: string;
  tripId?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  notes?: string;
}

export class EmergencyService {
  /**
   * Idempotently triggers an emergency incident (Guardrails #13 & #14)
   */
  public static async triggerSos(input: TriggerSosInput): Promise<{
    incident: IEmergencyIncident;
    isExisting: boolean;
    dispatchSummary: {
      contactsAttempted: number;
      contactsSucceeded: number;
      securityNotified: boolean;
      smsMode: string;
    };
  }> {
    const user = await User.findById(input.userId);
    if (!user) {
      throw new Error("User not found for SOS trigger");
    }

    // 1. Idempotency Check: Verify if user already has an active emergency
    const query: any = {
      triggeredBy: input.userId,
      status: { $in: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING"] },
    };
    if (input.tripId) {
      query.tripId = input.tripId;
    }

    let existingIncident = await EmergencyIncident.findOne(query)
      .populate("triggeredBy", "name email phone emergencyContacts")
      .populate("tripId");

    if (existingIncident) {
      // Idempotent: return existing active incident
      return {
        incident: existingIncident,
        isExisting: true,
        dispatchSummary: {
          contactsAttempted: existingIncident.emergencyContactsNotified.length,
          contactsSucceeded: existingIncident.emergencyContactsNotified.filter(
            (c) => c.dispatchStatus === "SENT" || c.dispatchStatus === "MOCK_DEV_DISPATCHED"
          ).length,
          securityNotified: existingIncident.campusSecurityNotified,
          smsMode: NotificationService.getSmsMode(),
        },
      };
    }

    // 2. Generate Human-Readable Unique Incident ID (INC-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const incidentNumber = `INC-${dateStr}-${randomSuffix}`;

    // 3. Primary Source of Truth: Create Database Record FIRST
    const incident = await EmergencyIncident.create({
      incidentNumber,
      tripId: input.tripId ? new mongoose.Types.ObjectId(input.tripId) : undefined,
      triggeredBy: user._id,
      institutionId: user.institutionId,
      campusId: user.campusId,
      location: {
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        accuracy: input.location.accuracy,
        address: input.location.address || "Campus Perimeter",
      },
      status: "ACTIVE",
      emergencyContactsNotified: [],
      campusSecurityNotified: true,
      securityNotes: input.notes,
    });

    // 4. Dispatch Notifications to User's Registered Emergency Contacts
    const contacts =
      (user.emergencyContacts && user.emergencyContacts.length > 0)
        ? user.emergencyContacts
        : user.emergencyContact?.phone
        ? [user.emergencyContact]
        : [];
    const contactResults: any[] = [];
    let successCount = 0;

    for (const contact of contacts) {
      if (!contact.phone) continue;
      const dispatch = await NotificationService.sendSosAlert(contact.phone, {
        studentName: user.name,
        studentPhone: user.phone,
        college: user.college,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        address: input.location.address,
        notes: input.notes,
        incidentNumber,
      });
      const isOk = dispatch.success;
      if (isOk) successCount++;

      contactResults.push({
        name: contact.name || "Emergency Contact",
        phone: contact.phone,
        relationship: (contact as any).relation || (contact as any).relationship || "Emergency Contact",
        dispatchStatus: isOk ? (dispatch.mode === "MOCK_DEV" ? "MOCK_DEV_DISPATCHED" : "SENT") : "FAILED",
        sentAt: new Date(),
        error: dispatch.error,
      });
    }

    incident.emergencyContactsNotified = contactResults;
    await incident.save();

    // 5. Broadcast to Campus Security Operations Room via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to("security_operations_room").emit("emergency:incident:new", {
        incidentId: incident._id,
        incidentNumber: incident.incidentNumber,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          college: user.college,
        },
        location: incident.location,
        status: incident.status,
        createdAt: incident.createdAt,
      });

      if (input.tripId) {
        io.to(`trip_${input.tripId}`).emit("trip:emergency:alert", {
          incidentId: incident._id,
          incidentNumber: incident.incidentNumber,
          triggeredBy: user.name,
          location: incident.location,
        });
      }
    }

    // 6. Record Immutable Audit Log
    await logAuditEvent({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: "SOS_TRIGGERED",
      resourceType: "EmergencyIncident",
      resourceId: incident._id.toString(),
      metadata: {
        incidentNumber,
        tripId: input.tripId,
        coords: [input.location.latitude, input.location.longitude],
        contactsCount: contacts.length,
      },
    });

    return {
      incident,
      isExisting: false,
      dispatchSummary: {
        contactsAttempted: contacts.length,
        contactsSucceeded: successCount,
        securityNotified: true,
        smsMode: NotificationService.getSmsMode(),
      },
    };
  }
}
