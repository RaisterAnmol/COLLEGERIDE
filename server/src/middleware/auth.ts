import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, UserRole, AccountType, isVerificationApproved } from "../models/User";

export { UserRole, AccountType };

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  college: string;
  verificationStatus: string;
  role?: UserRole;
  accountType?: AccountType;
  institutionId?: string;
  campusId?: string;
  tokenVersion?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || env.JWT_SECRET;

// Extended access token for seamless development & campus commute operations
export function signToken(payload: AuthUserPayload): string {
  const safePayload = {
    ...payload,
    role: payload.role || "student",
    accountType: payload.accountType || "PASSENGER",
  };
  return jwt.sign(safePayload, JWT_SECRET, { expiresIn: "30d" });
}

// 7-day refresh token with tokenVersion tracking (§2.6)
export function signRefreshToken(payload: {
  id: string;
  tokenVersion: number;
}): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyRefreshToken(token: string): {
  id: string;
  tokenVersion: number;
} {
  return jwt.verify(token, JWT_REFRESH_SECRET) as {
    id: string;
    tokenVersion: number;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Authentication required. No token provided.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;

    // Optional instant revocation check if tokenVersion is present
    if (typeof decoded.tokenVersion === "number") {
      const user = await User.findById(decoded.id)
        .select("tokenVersion")
        .lean();
      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        res.status(401).json({
          code: "TOKEN_REVOKED",
          message: "Token has been revoked. Please log in again.",
        });
        return;
      }
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Access token expired. Please refresh.",
      });
      return;
    }
    res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Invalid authentication token.",
    });
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.accessToken;

  let token: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
  } catch {
    // Continue as guest
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      });
      return;
    }

    const userRole = req.user.role || "student";
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        code: "FORBIDDEN",
        message: `Insufficient privileges. Role '${userRole}' is not authorized.`,
      });
      return;
    }

    next();
  };
}

export function requireOwnership(paramKey: string = "id") {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      });
      return;
    }

    const resourceOwnerId = req.params[paramKey];
    const isOwner = req.user.id === resourceOwnerId;
    const isAdmin = ["campus_admin", "super_admin"].includes(
      req.user.role || "",
    );

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        code: "FORBIDDEN",
        message:
          "Access denied. You can only access or modify your own resource.",
      });
      return;
    }

    next();
  };
}

export async function requireVerificationApproved(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
    return;
  }

  try {
    const user = await User.findById(req.user.id).select("verificationStatus role").lean();
    if (!user || !isVerificationApproved(user)) {
      res.status(403).json({
        code: "VERIFICATION_REQUIRED",
        message:
          "Approved verification required to perform this action. Current status: " +
          (user?.verificationStatus || "unverified"),
      });
      return;
    }
    next();
  } catch (err) {
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Failed to verify account authorization.",
    });
  }
}
