import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUserPayload } from "../middleware/auth";
import { Conversation, Ride, RideRequest, Trip, TripLocation } from "../models";
import { MapsService } from "../services/mapsService";
import { logger } from "../utils/logger";

let ioInstance: SocketIOServer | null = null;

// In-memory tracker for consecutive route deviation observations (Guardrail #9)
const tripDeviationObservations: Map<
  string,
  { count: number; lastPoint?: { lat: number; lng: number } }
> = new Map();

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  const configuredOrigins = (env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return true;
    if (configuredOrigins.includes(origin)) return true;
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) return true;
    if (origin.includes("192.168.") || origin.includes("10.") || origin.includes("172.")) return true;
    if (origin.endsWith(".vercel.app") || origin.endsWith(".replit.app") || origin.endsWith(".repl.co")) return true;
    return false;
  };

  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS not allowed"));
        }
      },
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  // §2.1 Strict JWT authentication middleware for Socket.IO
  // Strict JWT authentication middleware for Socket.IO
  ioInstance.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return next(new Error("Authentication required: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
      socket.data.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication failed: Invalid or expired token"));
    }
  });

  ioInstance.on("connection", (socket: Socket) => {
    const user = socket.data.user as AuthUserPayload;

    // §2.1 joinUser ignores client argument and binds strictly to authenticated user's room
    // Auto-bind to authenticated user's private room
    socket.join(`user_${user.id}`);

    socket.on("joinUser", () => {
      socket.join(`user_${user.id}`);
    });

    // Automatically join user's own room on connection
    socket.join(`user_${user.id}`);

    // §2.1 joinRide verifies authenticated user is driver or accepted passenger
    // Join Ride Room (Driver or accepted passenger)
    socket.on("joinRide", async (rideId: string) => {
      if (!rideId) return;

      try {
        const ride = await Ride.findById(rideId);
        if (!ride) {
          socket.emit("unauthorized", { error: "Ride not found" });
          return;
        }

        const isDriver = ride.creator.toString() === user.id;
        if (isDriver) {
          socket.join(`ride_${rideId}`);
          return;
        }

        const isAcceptedPassenger = await RideRequest.exists({
          rideId,
          passengerId: user.id,
          status: "accepted",
        });

        if (isAcceptedPassenger) {
          socket.join(`ride_${rideId}`);
        } else {
          socket.emit("unauthorized", {
            error: "Unauthorized to join ride room",
          });
        }
      } catch (err) {
        socket.emit("unauthorized", {
          error: "Failed to verify ride room access",
        });
      }
    });

    // §2.1 joinConversation verifies authenticated user is in conversation participants
    // Join Trip Room (Driver, passenger, or authorized admin)
    socket.on("joinTrip", async (tripId: string) => {
      if (!tripId) return;

      try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
          socket.emit("unauthorized", { error: "Trip not found" });
          return;
        }

        const isDriver = trip.driverId.toString() === user.id;
        const isPassenger = trip.passengerIds.some(
          (p) => p.toString() === user.id,
        );
        const isAdmin = ["campus_admin", "super_admin", "moderator"].includes(
          user.role || "",
        );

        if (isDriver || isPassenger || isAdmin) {
          socket.join(`trip_${tripId}`);
        } else {
          socket.emit("unauthorized", {
            error: "Unauthorized to subscribe to live trip telemetry",
          });
        }
      } catch (err) {
        socket.emit("unauthorized", {
          error: "Failed to verify trip room access",
        });
      }
    });

    // Join Security Operations Room (Security staff and admins only)
    socket.on("joinSecurityHub", () => {
      const isAdmin = ["campus_admin", "super_admin", "moderator"].includes(
        user.role || "",
      );
      if (isAdmin) {
        socket.join("security_operations_room");
      } else {
        socket.emit("unauthorized", {
          error: "Insufficient privileges for Security Operations Center",
        });
      }
    });

    // Join Conversation Room
    socket.on("joinConversation", async (convId: string) => {
      if (!convId) return;

      try {
        const conversation = await Conversation.findById(convId);
        if (!conversation) {
          socket.emit("unauthorized", { error: "Conversation not found" });
          return;
        }

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === user.id,
        );

        if (isParticipant) {
          socket.join(`conv_${convId}`);
        } else {
          socket.emit("unauthorized", {
            error: "Unauthorized to join conversation room",
          });
        }
      } catch (err) {
        socket.emit("unauthorized", {
          error: "Failed to verify conversation room access",
        });
      }
    });

    // Realistic Telemetry: GPS Location Updates (Guardrails #8, #9, #10)
    socket.on(
      "trip:location:update",
      async (data: {
        tripId: string;
        latitude: number;
        longitude: number;
        accuracy?: number;
        speed?: number;
        heading?: number;
        timestamp?: string | number;
      }) => {
        try {
          const { tripId, latitude, longitude, accuracy, speed, heading } =
            data;

          // 1. Validation of coordinates and physics bounds
          if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            socket.emit("telemetry:rejected", {
              reason: "Invalid coordinate bounds",
            });
            return;
          }

          // Speed check: reject impossible movement (> 45 m/s ≈ 162 km/h)
          if (typeof speed === "number" && speed > 45) {
            socket.emit("telemetry:rejected", {
              reason: "Implausible vehicle speed detected",
            });
            return;
          }

          // 2. Authorization check: must be driver or passenger of trip
          const trip = await Trip.findById(tripId);
          if (!trip) return;

          const isDriver = trip.driverId.toString() === user.id;
          const isPassenger = trip.passengerIds.some(
            (p) => p.toString() === user.id,
          );

          if (!isDriver && !isPassenger) {
            socket.emit("unauthorized", {
              reason: "Not an authorized participant of this trip",
            });
            return;
          }

          // 3. Route Corridor & Deviation Detection (Guardrail #9)
          let isDeviation = false;
          let distanceFromRouteMeters = 0;

          if (trip.routePolyline) {
            const path = MapsService.decodePolyline(trip.routePolyline);
            distanceFromRouteMeters =
              MapsService.computePointToRouteDistanceMeters(
                { lat: latitude, lng: longitude },
                path,
              );

            // Corridor threshold: 250 meters
            const DEVIATION_CORRIDOR_METERS = 250;
            const REQUIRED_CONSECUTIVE_OBSERVATIONS = 3;

            const tracker = tripDeviationObservations.get(tripId) || {
              count: 0,
            };

            if (distanceFromRouteMeters > DEVIATION_CORRIDOR_METERS) {
              tracker.count += 1;
              if (tracker.count >= REQUIRED_CONSECUTIVE_OBSERVATIONS) {
                isDeviation = true;
                trip.currentDeviationStatus = "medium";
                trip.deviationCount = (trip.deviationCount || 0) + 1;
                trip.lastDeviationAt = new Date();
                await trip.save();

                // Broadcast route deviation alert
                ioInstance?.to(`trip_${tripId}`).emit("trip:route-deviation", {
                  tripId,
                  severity: "medium",
                  distanceFromCorridorMeters: distanceFromRouteMeters,
                  currentLocation: { latitude, longitude },
                  message:
                    "Vehicle has departed from the planned campus route corridor.",
                });

                // Alert security room
                ioInstance
                  ?.to("security_operations_room")
                  .emit("trip:route-deviation:security-alert", {
                    tripId,
                    driverId: trip.driverId,
                    severity: "medium",
                    distanceFromCorridorMeters: distanceFromRouteMeters,
                    currentLocation: { latitude, longitude },
                  });
              }
            } else {
              // Reset counter when vehicle returns to route corridor
              tracker.count = 0;
              if (trip.currentDeviationStatus !== "none") {
                trip.currentDeviationStatus = "none";
                await trip.save();
              }
            }
            tripDeviationObservations.set(tripId, tracker);
          }

          // 4. Record high-frequency telemetry in database (auto-expires in 30 days via TTL)
          await TripLocation.create({
            tripId: trip._id,
            userId: user.id,
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
            distanceFromRouteMeters,
            isDeviation,
            timestamp: new Date(),
          });

          // 5. Broadcast live telemetry to authorized trip room
          ioInstance?.to(`trip_${tripId}`).emit("trip:location:broadcast", {
            tripId,
            userId: user.id,
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
            isDeviation,
            distanceFromRouteMeters,
            timestamp: new Date(),
          });
        } catch (err) {
          console.error("[Telemetry Error]:", err);
          logger.error({ err }, "[Telemetry Error]");
        }
      },
    );
  });

  return ioInstance;
}

export function getSocketIO(): SocketIOServer | null {
  return ioInstance;
}
