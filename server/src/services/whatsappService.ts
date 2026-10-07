import qrcodeTerminal from "qrcode-terminal";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import pino from "pino";
import { logger } from "../utils/logger";

export type WhatsAppConnectionStatus =
  | "DISABLED"
  | "SCAN_QR_REQUIRED"
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED";

export interface WhatsAppSendResult {
  success: boolean;
  mode: "LIVE_WHATSAPP" | "MOCK_DEV" | "FAILED";
  messageId?: string;
  error?: string;
  isSelf?: boolean;
  recipientJid?: string;
  botNumber?: string;
}

class WhatsAppService {
  private sock: any = null;
  private status: WhatsAppConnectionStatus = "DISCONNECTED";
  private rawQr: string | null = null;
  private qrDataUrl: string | null = null;
  private authDir: string;
  private isInitializing: boolean = false;
  private reconnectAttempts: number = 0;

  constructor() {
    this.authDir = path.join(process.cwd(), "data", "whatsapp_auth");
  }

  public getStatus(): {
    status: WhatsAppConnectionStatus;
    qr: string | null;
    qrDataUrl: string | null;
    isConnected: boolean;
    botNumber: string | null;
  } {
    let botNumber: string | null = null;
    if (this.sock?.user?.id) {
      const rawId = this.sock.user.id.split(':')[0].replace(/\D/g, '');
      botNumber = rawId ? `+${rawId}` : null;
    }
    return {
      status: this.status,
      qr: this.rawQr,
      qrDataUrl: this.qrDataUrl,
      isConnected: this.isConnected(),
      botNumber,
    };
  }

  public isConnected(): boolean {
    return this.status === "CONNECTED" && this.sock !== null;
  }

  public async initialize(): Promise<void> {
    if (process.env.NODE_ENV === "test" || process.env.WHATSAPP_ENABLED === "false") {
      this.status = "DISABLED";
      return;
    }

    if (this.isInitializing || this.status === "CONNECTED") {
      return;
    }

    this.isInitializing = true;
    this.status = "CONNECTING";

    try {
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true });
      }

      // Dynamic import to prevent CommonJS/Jest test runner collisions
      const baileys = await import("@whiskeysockets/baileys");
      const makeWASocket = (baileys.default || (baileys as any).makeWASocket || baileys) as any;
      const { DisconnectReason, useMultiFileAuthState } = baileys;

      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      const silentLogger = pino({ level: "silent" });

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: silentLogger,
        browser: ["CampusRide Server", "Chrome", "1.0.0"],
        syncFullHistory: false,
      });

      this.sock.ev.on("creds.update", saveCreds);

      this.sock.ev.on("connection.update", async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.rawQr = qr;
          this.status = "SCAN_QR_REQUIRED";
          this.reconnectAttempts = 0;

          try {
            this.qrDataUrl = await QRCode.toDataURL(qr);
          } catch (_) {
            this.qrDataUrl = null;
          }

          console.log("\n===============================================================");
          console.log("   📱 [CAMPUSRIDE WHATSAPP BOT] SCAN QR CODE TO LINK WHATSAPP  ");
          console.log("   1. Open WhatsApp on your phone");
          console.log("   2. Tap Settings / 3-dots -> Linked Devices -> Link a Device");
          console.log("   3. Point your camera at this QR code:");
          console.log("===============================================================\n");

          qrcodeTerminal.generate(qr, { small: true });

          console.log("===============================================================\n");
        }

        if (connection === "close") {
          const statusCode =
            (lastDisconnect?.error as any)?.output?.statusCode ||
            (lastDisconnect?.error as any)?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason?.loggedOut;

          this.status = "DISCONNECTED";
          this.rawQr = null;
          this.qrDataUrl = null;

          logger.warn(
            { statusCode, shouldReconnect },
            "[WhatsApp Service] Connection closed"
          );

          if (shouldReconnect && this.reconnectAttempts < 5) {
            this.reconnectAttempts++;
            const delay = Math.min(3000 * this.reconnectAttempts, 15000);
            console.log(
              `[WhatsApp Service] Reconnecting to WhatsApp in ${delay / 1000}s (Attempt ${this.reconnectAttempts}/5)...`
            );
            setTimeout(() => {
              this.isInitializing = false;
              this.initialize();
            }, delay);
          } else if (!shouldReconnect) {
            console.log(
              "[WhatsApp Service] Logged out from WhatsApp. Clear data/whatsapp_auth directory to re-scan."
            );
          }
        } else if (connection === "open") {
          this.status = "CONNECTED";
          this.rawQr = null;
          this.qrDataUrl = null;
          this.reconnectAttempts = 0;

          console.log("\n===============================================================");
          console.log("   ✅ [CAMPUSRIDE WHATSAPP BOT] CONNECTED & ACTIVE!");
          console.log("   Automatic OTP messages will now be delivered via WhatsApp.");
          console.log("===============================================================\n");
          logger.info("[WhatsApp Service] Connected successfully to WhatsApp");
        }
      });
    } catch (err: any) {
      this.status = "DISCONNECTED";
      logger.error({ err }, "[WhatsApp Service] Failed to initialize Baileys");
    } finally {
      this.isInitializing = false;
    }
  }

  public async sendOtp(phone: string, otp: string): Promise<WhatsAppSendResult> {
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) {
      return {
        success: false,
        mode: "FAILED",
        error: "Invalid phone number format",
      };
    }

    const message = `🎓 *CampusRide University Transit*\n\nYour verification code is: *${otp}*\n\n⏱️ This code expires in 10 minutes.\n🔒 Never share your code with anyone.\n_Safe student carpooling across campus._`;

    if (this.isConnected() && this.sock) {
      try {
        let jid = `${formattedPhone}@s.whatsapp.net`;
        try {
          const onWa = await this.sock.onWhatsApp(jid);
          if (Array.isArray(onWa) && onWa.length > 0 && onWa[0]?.exists) {
            jid = onWa[0].jid;
          }
        } catch (_) {}

        const botRaw = this.sock.user?.id ? this.sock.user.id.split(':')[0].replace(/\D/g, '') : '';
        const targetRaw = formattedPhone.replace(/\D/g, '');
        const isSelf = Boolean(botRaw && targetRaw && (botRaw === targetRaw || targetRaw.endsWith(botRaw) || botRaw.endsWith(targetRaw)));

        const result = await this.sock.sendMessage(jid, { text: message });

        console.log(`[WhatsApp Service: LIVE] Sent OTP ${otp} via WhatsApp to ${jid} (isSelf=${isSelf}, botNumber=+${botRaw})`);
        logger.info({ recipient: formattedPhone, isSelf, botRaw }, "[WhatsApp Service] OTP sent successfully");

        return {
          success: true,
          mode: "LIVE_WHATSAPP",
          messageId: result?.key?.id || undefined,
          isSelf,
          recipientJid: jid,
          botNumber: botRaw ? `+${botRaw}` : undefined,
        };
      } catch (err: any) {
        logger.error({ err }, "[WhatsApp Service] Failed to send message via Baileys");
        return {
          success: false,
          mode: "FAILED",
          error: err.message || "Failed to deliver WhatsApp message",
        };
      }
    }

    // Dev fallback mode when phone is not paired yet
    console.log(
      `[WhatsApp Service: MOCK_DEV] (WhatsApp not paired yet) OTP ${otp} for ${formattedPhone}. Scan QR in terminal to enable real WhatsApp delivery.`
    );
    return {
      success: true,
      mode: "MOCK_DEV",
      messageId: `mock_wa_${Date.now()}`,
    };
  }

  public async sendSosAlert(phone: string, data: WhatsAppSosData): Promise<WhatsAppSendResult> {
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) {
      return {
        success: false,
        mode: "FAILED",
        error: "Invalid emergency contact phone number format",
      };
    }

    const mapsUrl = `https://maps.google.com/?q=${data.latitude},${data.longitude}`;
    const message = `🚨 *CAMPUSRIDE EMERGENCY SOS ALERT* 🚨\n\n⚠️ *${data.studentName}* has triggered an urgent SOS distress signal during campus transit!\n\n📍 *Incident Location:*\n${data.address ? `📌 Address: ${data.address}\n` : ''}🗺️ *Live Google Maps:* ${mapsUrl}\n📌 *GPS Coordinates:* ${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}\n\n🏫 *Campus:* ${data.college || 'University Campus'}\n👤 *Student Phone:* ${data.studentPhone || 'Not available'}\n🆔 *Incident ID:* ${data.incidentNumber}\n${data.notes ? `📝 *Distress Note:* "${data.notes}"\n` : ''}\n👮 University Security Command Center has received this alert and is responding.\n📞 *If immediate danger or unable to reach student, call Emergency Police (112).*`;

    if (this.isConnected() && this.sock) {
      try {
        let jid = `${formattedPhone}@s.whatsapp.net`;
        try {
          const onWa = await this.sock.onWhatsApp(jid);
          if (Array.isArray(onWa) && onWa.length > 0 && onWa[0]?.exists) {
            jid = onWa[0].jid;
          }
        } catch (_) {}

        const result = await this.sock.sendMessage(jid, { text: message });
        console.log(`[WhatsApp Service: LIVE SOS] Dispatched SOS broadcast for ${data.studentName} to ${jid}`);
        logger.info({ recipient: formattedPhone, incident: data.incidentNumber }, "[WhatsApp Service] SOS Alert dispatched successfully");

        return {
          success: true,
          mode: "LIVE_WHATSAPP",
          messageId: result?.key?.id || undefined,
          recipientJid: jid,
        };
      } catch (err: any) {
        logger.error({ err }, "[WhatsApp Service] Failed to send SOS alert via WhatsApp");
        return {
          success: false,
          mode: "FAILED",
          error: err.message || "Failed to deliver WhatsApp SOS alert",
        };
      }
    }

    console.log(
      `[WhatsApp Service: MOCK_DEV SOS] (WhatsApp not paired yet) SOS broadcast for ${data.studentName} to ${formattedPhone} with GPS (${data.latitude}, ${data.longitude}).`
    );
    return {
      success: true,
      mode: "MOCK_DEV",
      messageId: `mock_sos_${Date.now()}`,
    };
  }

  private formatPhoneNumber(rawPhone: string): string | null {
    if (!rawPhone) return null;
    let cleaned = rawPhone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned; // Standard India mobile prefix
    }
    if (cleaned.length >= 11 && cleaned.length <= 15) {
      return cleaned;
    }
    return null;
  }
}

export interface WhatsAppSosData {
  studentName: string;
  studentPhone?: string;
  college?: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  incidentNumber: string;
}

export const whatsappService = new WhatsAppService();

