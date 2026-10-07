import { Notification } from "../models/Notification";
import { PushDevice } from "../models/PushDevice";
import { env } from "../config/env";
import { logger } from "../utils/logger";

import { whatsappService } from "./whatsappService";

export type DeliveryMode = "LIVE" | "MOCK_DEV" | "UNAVAILABLE";

export interface DeliveryResult {
  mode: DeliveryMode;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ISmsProvider {
  sendSms(to: string, message: string): Promise<DeliveryResult>;
}

export interface IPushProvider {
  sendPush(
    token: string,
    payload: { title: string; body: string; data?: any },
  ): Promise<DeliveryResult>;
}

class MockSmsProvider implements ISmsProvider {
  async sendSms(to: string, message: string): Promise<DeliveryResult> {
    const isDev =
      env.NODE_ENV !== "production" || process.env.SMS_MODE === "mock";
    if (isDev) {
      // In dev mode, log delivery metadata but NOT raw sensitive OTP if possible
      console.log(
        `[SMS Provider: MOCK_DEV] Dispatched SMS to ${to.slice(-4).padStart(to.length, "*")}`,
      );
      logger.info(
        { recipient: to.slice(-4).padStart(to.length, "*") },
        "[SMS Provider: MOCK_DEV] Dispatched SMS",
      );
      return {
        mode: "MOCK_DEV",
        success: true,
        messageId: `mock_sms_${Date.now()}`,
      };
    }
    return {
      mode: "UNAVAILABLE",
      success: false,
      error:
        "Live SMS provider not configured (missing SMS_PROVIDER_KEY or Twilio credentials)",
    };
  }
}

class LiveTwilioSmsProvider implements ISmsProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendSms(to: string, message: string): Promise<DeliveryResult> {
    try {
      // Basic HTTP request to Twilio API without heavy extra dependencies
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
        "base64",
      );
      const body = new URLSearchParams({
        To: to,
        From: this.fromNumber,
        Body: message,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          mode: "LIVE",
          success: false,
          error: `Twilio HTTP error ${response.status}: ${errText}`,
        };
      }

      const data: any = await response.json();
      return {
        mode: "LIVE",
        success: true,
        messageId: data.sid,
      };
    } catch (err: any) {
      return {
        mode: "LIVE",
        success: false,
        error: err.message || "Failed to deliver SMS via Twilio",
      };
    }
  }
}

class MockPushProvider implements IPushProvider {
  async sendPush(
    token: string,
    payload: { title: string; body: string; data?: any },
  ): Promise<DeliveryResult> {
    const isDev =
      env.NODE_ENV !== "production" || process.env.PUSH_MODE === "mock";
    if (isDev) {
      return {
        mode: "MOCK_DEV",
        success: true,
        messageId: `mock_push_${Date.now()}`,
      };
    }
    return {
      mode: "UNAVAILABLE",
      success: false,
      error: "Live push provider not configured",
    };
  }
}

// Select active providers based on environment
const smsProvider: ISmsProvider =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_FROM_NUMBER
    ? new LiveTwilioSmsProvider(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
        process.env.TWILIO_FROM_NUMBER,
      )
    : new MockSmsProvider();

const pushProvider: IPushProvider = new MockPushProvider();

export class NotificationService {
  static getSmsMode(): DeliveryMode {
    if (process.env.TWILIO_ACCOUNT_SID) return "LIVE";
    if (env.NODE_ENV !== "production" || process.env.SMS_MODE === "mock")
      return "MOCK_DEV";
    return "UNAVAILABLE";
  }

  static getPushMode(): DeliveryMode {
    if (process.env.FIREBASE_PROJECT_ID) return "LIVE";
    if (env.NODE_ENV !== "production" || process.env.PUSH_MODE === "mock")
      return "MOCK_DEV";
    return "UNAVAILABLE";
  }

  static async sendPhoneOtp(
    toPhone: string,
    otp: string,
  ): Promise<DeliveryResult & { viaWhatsApp?: boolean }> {
    // 1. Prioritize real-time WhatsApp delivery via Baileys bot
    try {
      const waResult = await whatsappService.sendOtp(toPhone, otp);
      if (waResult.success && waResult.mode === "LIVE_WHATSAPP") {
        return {
          mode: "LIVE",
          success: true,
          messageId: waResult.messageId,
          viaWhatsApp: true,
        };
      }
    } catch (waErr) {
      logger.warn({ waErr }, "WhatsApp delivery failed, falling back to SMS provider");
    }

    // 2. Fallback to SMS provider
    const message = `Your CampusRide verification code is: ${otp}. Valid for 10 minutes. Never share this code.`;
    const res = await smsProvider.sendSms(toPhone, message);
    return { ...res, viaWhatsApp: false };
  }

  static async sendSosAlert(
    toPhone: string,
    data: {
      studentName: string;
      studentPhone?: string;
      college?: string;
      latitude: number;
      longitude: number;
      address?: string;
      notes?: string;
      incidentNumber: string;
    }
  ): Promise<DeliveryResult & { viaWhatsApp?: boolean }> {
    // 1. Dispatch via high-priority WhatsApp message first (with Google Maps link & live coordinates)
    try {
      const waResult = await whatsappService.sendSosAlert(toPhone, data);
      if (waResult.success && waResult.mode === "LIVE_WHATSAPP") {
        return {
          mode: "LIVE",
          success: true,
          messageId: waResult.messageId,
          viaWhatsApp: true,
        };
      }
    } catch (waErr) {
      logger.warn({ waErr }, "WhatsApp SOS delivery failed, falling back to SMS provider");
    }

    // 2. Fallback to SMS provider
    const mapsUrl = `https://maps.google.com/?q=${data.latitude},${data.longitude}`;
    const smsMessage = `EMERGENCY SOS: ${data.studentName} triggered CampusRide SOS at (${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}). Map: ${mapsUrl}. Ref: ${data.incidentNumber}.`;
    const res = await smsProvider.sendSms(toPhone, smsMessage);
    return { ...res, viaWhatsApp: false };
  }

  static async createPersistentNotification(params: {
    userId: string;
    type:
      | "TRIP_UPDATE"
      | "EMERGENCY_SOS"
      | "RIDE_REQUEST"
      | "VERIFICATION_STATUS"
      | "CHAT_MESSAGE"
      | "SECURITY_ALERT"
      | "SYSTEM";
    title: string;
    body: string;
    data?: Record<string, any>;
    channels?: Array<"in_app" | "socket" | "fcm" | "sms">;
  }) {
    const channels = params.channels || ["in_app", "socket"];
    const deliveryStatus: Record<string, string> = {
      in_app: "sent",
    };

    const notification = await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data,
      deliveryChannels: channels,
      deliveryStatus,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day retention
    });

    // Attempt push notification if registered
    if (channels.includes("fcm")) {
      const devices = await PushDevice.find({
        userId: params.userId,
        active: true,
      });
      for (const dev of devices) {
        const res = await pushProvider.sendPush(dev.token, {
          title: params.title,
          body: params.body,
          data: params.data,
        });
        deliveryStatus[`push_${dev.token.slice(-6)}`] = res.success
          ? res.mode === "MOCK_DEV"
            ? "mock_delivered"
            : "sent"
          : "failed";
      }
      notification.deliveryStatus = deliveryStatus as any;
      await notification.save();
    }

    return notification;
  }
}
