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
  phone?: string;
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

    // 1. Check if user already has an active emergency incident
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

    let incident: any;
    let incidentNumber: string;
    let isExisting = false;

    if (existingIncident) {
      // Re-triggering or updating location of active incident
      isExisting = true;
      incident = existingIncident;
      incidentNumber = existingIncident.incidentNumber;
      // Update location and append security notes
      incident.location = {
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        accuracy: input.location.accuracy || 10,
        address: input.location.address || incident.location?.address || "Campus Perimeter",
      };
      if (input.notes) {
        incident.securityNotes = incident.securityNotes
          ? `${incident.securityNotes} | [Re-triggered]: ${input.notes}`
          : input.notes;
      }
    } else {
      // Generate Human-Readable Unique Incident ID (INC-YYYYMMDD-XXXX)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      incidentNumber = `INC-${dateStr}-${randomSuffix}`;

      incident = new EmergencyIncident({
        incidentNumber,
        tripId: input.tripId ? new mongoose.Types.ObjectId(input.tripId) : undefined,
        triggeredBy: user._id,
        institutionId: user.institutionId,
        campusId: user.campusId,
        location: {
          latitude: input.location.latitude,
          longitude: input.location.longitude,
          accuracy: input.location.accuracy || 10,
          address: input.location.address || "Campus Perimeter",
        },
        status: "ACTIVE",
        emergencyContactsNotified: [],
        campusSecurityNotified: true,
        securityNotes: input.notes,
      });
    }

    // 2. Build complete list of recipients to notify:
    // ALWAYS notify:
    // a) The student themselves (immediate confirmation on student's WhatsApp)
    // b) All registered emergency contacts (parents, guardians, friends)
    interface RecipientTarget {
      name: string;
      phone: string;
      relationship: string;
    }
    const recipients: RecipientTarget[] = [];
    const seenPhones = new Set<string>();

    const normalizePhone = (p?: string): string => {
      if (!p) return "";
      return p.replace(/\D/g, "");
    };

    // If phone was supplied in input and user.phone was missing, save it permanently
    const effectivePhone = (input.phone && input.phone.trim()) || user.phone;
    if (input.phone && input.phone.trim() && !user.phone) {
      user.phone = input.phone.trim();
      user.isPhoneVerified = true;
      await user.save();
    }

    // a) Student's own registered phone (self confirmation)
    if (effectivePhone && effectivePhone.trim()) {
      const cleanPhone = normalizePhone(effectivePhone);
      if (cleanPhone.length >= 10) {
        recipients.push({
          name: user.name || "Student",
          phone: effectivePhone.trim(),
          relationship: "Student (Self Alert Confirmation)",
        });
        seenPhones.add(cleanPhone.slice(-10));
      }
    }

    // b) Registered Emergency Contacts array
    if (Array.isArray(user.emergencyContacts)) {
      for (const contact of user.emergencyContacts) {
        if (!contact || !contact.phone) continue;
        const clean = normalizePhone(contact.phone);
        if (clean.length >= 10 && !seenPhones.has(clean.slice(-10))) {
          seenPhones.add(clean.slice(-10));
          recipients.push({
            name: contact.name || "Emergency Contact",
            phone: contact.phone.trim(),
            relationship: (contact as any).relation || (contact as any).relationship || "Emergency Contact",
          });
        }
      }
    }

    // c) Legacy single emergencyContact object
    if (user.emergencyContact && user.emergencyContact.phone) {
      const clean = normalizePhone(user.emergencyContact.phone);
      if (clean.length >= 10 && !seenPhones.has(clean.slice(-10))) {
        seenPhones.add(clean.slice(-10));
        recipients.push({
          name: user.emergencyContact.name || "Primary Contact",
          phone: user.emergencyContact.phone.trim(),
          relationship: (user.emergencyContact as any).relation || (user.emergencyContact as any).relationship || "Parent/Guardian",
        });
      }
    }

    // 3. Dispatch Live Notifications to ALL recipients
    const contactResults: any[] = [];
    let successCount = 0;

    for (const target of recipients) {
      try {
        const dispatch = await NotificationService.sendSosAlert(target.phone, {
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
          name: target.name,
          phone: target.phone,
          relationship: target.relationship,
          dispatchStatus: isOk ? (dispatch.mode === "MOCK_DEV" ? "MOCK_DEV_DISPATCHED" : "SENT") : "FAILED",
          sentAt: new Date(),
          error: dispatch.error,
        });
      } catch (err: any) {
        contactResults.push({
          name: target.name,
          phone: target.phone,
          relationship: target.relationship,
          dispatchStatus: "FAILED",
          sentAt: new Date(),
          error: err?.message || "Delivery error",
        });
      }
    }

    // Update incident emergency contacts notified record
    incident.emergencyContactsNotified = contactResults;
    await incident.save();

    // 4. Broadcast to Campus Security Operations Room via Socket.IO
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
        isExisting,
      });

      // Emit sos:alert and sos:status for admin compatibility
      io.to("security_operations_room").emit("sos:alert", {
        incidentId: incident.incidentNumber || incident._id,
        incidentNumber: incident.incidentNumber,
        isExisting,
      });
      io.to("security_operations_room").emit("sos:status", {
        incidentId: incident._id,
        status: incident.status,
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

    // 5. Record Immutable Audit Log
    await logAuditEvent({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: isExisting ? "SOS_RETRIGGERED" : "SOS_TRIGGERED",
      resourceType: "EmergencyIncident",
      resourceId: incident._id.toString(),
      metadata: {
        incidentNumber,
        tripId: input.tripId,
        coords: [input.location.latitude, input.location.longitude],
        recipientsCount: recipients.length,
        isExisting,
      },
    });

    return {
      incident,
      isExisting,
      dispatchSummary: {
        contactsAttempted: recipients.length,
        contactsSucceeded: successCount,
        securityNotified: true,
        smsMode: NotificationService.getSmsMode(),
      },
    };
  }
}
