import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const MIN_SECRET_LENGTH = 32;
const PLACEHOLDER_PATTERNS = [/replace_with/i, /change_in_prod/i, /supersecret/i];

export function assertSecret(name: string, value: string | undefined): void {
  if (!value) {
    console.warn(`[Config] WARNING: Missing required env var: ${name}`);
    return;
  }
}

const envSchema = z.object({
  PORT: z
    .string()
    .default("5000")
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z
    .string()
    .optional()
    .transform((val) =>
      val && val.trim().length > 0
        ? val.trim()
        : "CampusRide_Special_Jwt_Secret_2025_Key_ProdSecure_99x82!"
    ),
  JWT_REFRESH_SECRET: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  ADMIN_SECRET: z
    .string()
    .optional()
    .transform((val) =>
      val && val.trim().length > 0
        ? val.trim()
        : "CampusRide_Special_Admin_Secret_2025_Root!"
    ),
  AUTH_PROVIDER: z.enum(["jwt_local", "google_oauth"]).default("jwt_local"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["mock", "smtp", "resend"]).default("mock"),
  RESEND_API_KEY: z.string().optional(),
  SMS_PROVIDER: z.enum(["mock", "twilio", "msg91"]).default("mock"),
  MAP_PRIMARY: z.enum(["osrm", "openrouteservice", "google_maps"]).default("osrm"),
  MAP_FALLBACK: z.enum(["openrouteservice", "osrm", "none"]).default("openrouteservice"),
  STORAGE_PROVIDER: z.enum(["local", "cloudinary", "supabase"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("./uploads/private"),
  ML_PROVIDER: z.enum(["local", "fastapi"]).default("local"),
  REALTIME_PROVIDER: z.enum(["socket_io"]).default("socket_io"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("FATAL: Environment configuration validation failed:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

assertSecret("JWT_SECRET", parsed.data.JWT_SECRET);
if (parsed.data.JWT_REFRESH_SECRET) {
  assertSecret("JWT_REFRESH_SECRET", parsed.data.JWT_REFRESH_SECRET);
}
assertSecret("ADMIN_SECRET", parsed.data.ADMIN_SECRET);

export const env = parsed.data;
