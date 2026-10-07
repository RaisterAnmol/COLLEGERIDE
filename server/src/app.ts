import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { logger } from "./utils/logger";
import authRoutes from "./routes/authRoutes";
import rideRoutes from "./routes/rideRoutes";
import requestRoutes from "./routes/requestRoutes";
import tripRoutes from "./routes/tripRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import placeRoutes from "./routes/placeRoutes";
import emergencyRoutes from "./routes/emergencyRoutes";
import mongoose from "mongoose";
import verificationRoutes from "./routes/verificationRoutes";
import faceRoutes from "./routes/faceRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import auditRoutes from "./routes/auditRoutes";
import adminRoutes from "./routes/adminRoutes";
import metricsRoutes from "./routes/metricsRoutes";
import { seedDemoData } from "./seed";
import { correlationIdMiddleware } from "./middleware/correlationId";
import { errorHandler } from "./middleware/errorHandler";
import { telemetryMiddleware } from "./middleware/telemetry";

const app: Express = express();

// Request correlation ID tracking & Prometheus metrics observation
app.use(correlationIdMiddleware);
app.use(telemetryMiddleware);
app.use(metricsRoutes);

// §2.5 Baseline hardening middlewares with explicit CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          env.CLIENT_URL,
          "ws:",
          "wss:",
          "https://maps.googleapis.com",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://maps.googleapis.com",
          "https://*.tile.openstreetmap.org",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(compression());
app.use(cookieParser());
app.use(hpp());

// CORS configuration from env & cloud providers (Vercel, Replit)
const configuredOrigins = (env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // Mobile apps, curl, or same-origin
  if (configuredOrigins.includes(origin)) return true;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) return true;
  if (origin.includes("192.168.") || origin.includes("10.") || origin.includes("172.")) return true;
  if (origin.endsWith(".vercel.app") || origin.endsWith(".replit.app") || origin.endsWith(".repl.co")) return true;
  return false;
};

// CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "Blocked CORS origin request");
        callback(new Error("CORS policy violation: origin not allowed"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// §2.5 Rate limiting
// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "TOO_MANY_REQUESTS",
    message: "Too many requests, please try again later.",
  },
  skip: () => env.NODE_ENV === "test" || env.NODE_ENV === "development",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 10 : 5000,
  keyGenerator: (req) => `${req.ip}_${req.body?.email || ""}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "AUTH_RATE_LIMITED",
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  validate: { keyGeneratorIpFallback: false },
  skip: () => env.NODE_ENV === "test" || env.NODE_ENV === "development",
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 5 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "OTP_RATE_LIMITED",
    message: "Too many OTP verification attempts. Please try again after 15 minutes.",
  },
  skip: () => env.NODE_ENV === "test",
});

const sosLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "TOO_MANY_SOS_REQUESTS",
    message:
      "Rate limit reached for SOS requests. Call 112 directly if in immediate danger.",
  },
  skip: () => env.NODE_ENV === "test",
});

app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/trips/:id/verify-pickup", otpLimiter);
app.use("/api/auth/phone/verify", otpLimiter);
app.use("/api/auth/verify-email", otpLimiter);
app.use("/api/emergency/sos", sosLimiter);

// Root healthcheck (Process Liveness)
app.get("/api/health", (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "ok", service: "CampusRide API", timestamp: new Date(), uptime: process.uptime() });
});

// Readiness endpoint (Dependency Connectivity)
app.get("/api/ready", (_req: Request, res: Response) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    res.status(200).json({ status: "ready", database: "connected", timestamp: new Date() });
  } else {
    res.status(503).json({ status: "degraded", database: "disconnected", timestamp: new Date() });
  }
});

// §2.2 Guarded destructive seed endpoint (gated by NODE_ENV !== production and admin secret)
// Guarded destructive seed endpoint (gated by NODE_ENV !== production and admin secret)
app.post("/api/seed", async (req: Request, res: Response): Promise<void> => {
  if (env.NODE_ENV === "production") {
    res.status(403).json({
      code: "FORBIDDEN",
      message: "Database seeding is disabled in production",
    });
    res.status(403).json({
      code: "FORBIDDEN",
      message: "Database seeding is disabled in production",
    });
    return;
  }

  const adminKey = req.headers["x-admin-key"];
  if (!adminKey || adminKey !== env.ADMIN_SECRET) {
    res.status(403).json({
      code: "FORBIDDEN",
      message: "Admin authentication required to trigger database seed",
    });
    return;
  }

  try {
    await seedDemoData();
    res.status(200).json({ message: "Demo data successfully re-seeded!" });
  } catch (err: any) {
    logger.error({ err }, "Failed to seed demo data");
    res
      .status(500)
      .json({ code: "SERVER_ERROR", message: "Failed to seed demo data" });
  }
});

// REST API Routes
app.use("/api/auth", authRoutes);
app.use("/api", authRoutes); // for /api/users/:id/verify
app.use("/api/rides", rideRoutes);
app.use("/api", requestRoutes); // for /api/rides/:id/request, /api/requests/:reqId
app.use("/api/trips", tripRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", reviewRoutes); // for /api/users/:id/reviews
app.use("/api/analytics", analyticsRoutes);
app.use("/api/places", placeRoutes);
app.use("/api", placeRoutes); // for /api/routes/calculate
app.use("/api/emergency", emergencyRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/face", faceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/admin", adminRoutes);

// Production & Unified Client Asset Serving
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    // Exclude API routes, WebSockets, and any request that has a file extension (e.g. .js, .css, .webp)
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io") || path.extname(req.path)) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// §2.5 Central 404 handler
app.use((_req: Request, res: Response) => {
  res
    .status(404)
    .json({ code: "NOT_FOUND", message: "Requested endpoint does not exist" });
});

// Central error handler
app.use(errorHandler);

export default app;
