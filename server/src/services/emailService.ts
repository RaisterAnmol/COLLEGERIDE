import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const { to, subject, html, text } = options;
  const resendApiKey = process.env.RESEND_API_KEY || (env as any).RESEND_API_KEY;

  if (env.EMAIL_PROVIDER === "resend" && resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CampusRide <onboarding@resend.dev>",
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, " "),
        }),
      });

      const data: any = await response.json();
      if (!response.ok) {
        logger.warn({ error: data, to }, "[Email Service: Resend] Failed to send email via Resend API");
        return { success: false, error: data?.message || "Failed to send email via Resend" };
      }

      logger.info({ id: data?.id, to }, "[Email Service: Resend] Email delivered successfully");
      return { success: true, id: data?.id };
    } catch (err: any) {
      logger.error({ err, to }, "[Email Service: Resend] Network error sending email");
      return { success: false, error: err.message };
    }
  }

  // Fallback / Mock
  logger.info({ to, subject }, "[Email Service: MOCK] Dispatched email (mock mode)");
  return { success: true, id: `mock_${Date.now()}` };
}
