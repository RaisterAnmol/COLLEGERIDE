import crypto from "crypto";

export function generateSecureOtp(length: number = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashOtp(otp: string, salt: string): string {
  return crypto.pbkdf2Sync(otp, salt, 10000, 32, "sha256").toString("hex");
}

export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

let argon2Module: any = null;
try {
  argon2Module = require("@node-rs/argon2");
} catch {
  argon2Module = null;
}

let bcryptModule: any = null;
try {
  bcryptModule = require("bcryptjs");
} catch {
  bcryptModule = null;
}

/**
 * Hashes password using Argon2id with recommended parameters.
 */
export async function hashPassword(password: string): Promise<string> {
  if (argon2Module?.hash) {
    return argon2Module.hash(password);
  }
  if (bcryptModule?.hash) {
    return bcryptModule.hash(password, 12);
  }
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verifies password against hash (supports both Argon2id and legacy Bcrypt hashes).
 */
export async function verifyPassword(
  hash: string,
  plainText: string
): Promise<boolean> {
  if (!hash || !plainText) return false;

  // Argon2id hash format
  if (hash.startsWith("$argon2") && argon2Module?.verify) {
    try {
      return await argon2Module.verify(hash, plainText);
    } catch {
      return false;
    }
  }

  // Bcrypt hash format
  if ((hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) && bcryptModule?.compare) {
    try {
      return await bcryptModule.compare(plainText, hash);
    } catch {
      return false;
    }
  }

  return false;
}

