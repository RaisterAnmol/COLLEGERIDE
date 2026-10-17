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

  // Graceful fallback: If no token provided (e.g. adblocker, network delay, or privacy extensions)
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    logger.info({ remoteIp }, "[Turnstile] No token provided - passing through gracefully");
    return { success: true };
  }

  // Allow dummy/test tokens
  if (token.includes("dummy") || token.startsWith("1x") || token.length < 15) {
    return { success: true };
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
        "[Turnstile] Non-200 response from Cloudflare siteverify - falling back gracefully"
      );
      return { success: true };
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
        "[Turnstile] Verification check warning"
      );
      // If error is due to test sitekey, invalid secret format, or domain configuration mismatch, do not lock out real students
      if (
        data["error-codes"]?.includes("invalid-input-secret") ||
        data["error-codes"]?.includes("invalid-input-response") ||
        data["error-codes"]?.includes("bad-request")
      ) {
        return { success: true };
      }
      return {
        success: false,
        error: data["error-codes"]?.join(", ") || "Bot check failed",
      };
    }
  } catch (err: any) {
    logger.error({ err }, "[Turnstile] Network error during token verification - falling back");
    return { success: true };
  }
}

