import { logger } from "./logger";

// Cloudflare official always-passing testing secret key
const CLOUDFLARE_TEST_SECRET = "1x0000000000000000000000000000000AA";

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
  hostname?: string;
}

/**
 * Validates Cloudflare Turnstile token server-side.
 * If TURNSTILE_SECRET_KEY is not configured, it fails open in dev/staging.
 */
export async function verifyTurnstileToken(
  token?: string,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If Turnstile secret is not set, fail open so the app runs without mandatory setup
  if (!secretKey) {
    return { success: true };
  }

  // In test mode with dummy secret
  if (secretKey === CLOUDFLARE_TEST_SECRET) {
    return { success: true };
  }

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return {
      success: false,
      error: "Cloudflare Turnstile verification token missing",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token.trim());
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      logger.warn(
        { status: response.status },
        "[Turnstile] Non-200 response from Cloudflare siteverify"
      );
      return {
        success: false,
        error: `Cloudflare verify returned HTTP ${response.status}`,
      };
    }

    const data: any = await response.json();

    if (data.success) {
      return {
        success: true,
        hostname: data.hostname,
      };
    } else {
      logger.warn(
        { errorCodes: data["error-codes"] },
        "[Turnstile] Verification failed"
      );
      return {
        success: false,
        error:
          data["error-codes"]?.join(", ") ||
          "Cloudflare verification challenge failed",
      };
    }
  } catch (err: any) {
    logger.error({ err }, "[Turnstile] Network error during token verification");
    // Fail safe in unexpected network dropouts if needed, or report error
    return {
      success: false,
      error: err.message || "Failed to contact Cloudflare verification service",
    };
  }
}

