import { Router, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Ride, User, Vehicle } from "../models";
import { requireAuth, optionalAuth, requireRole, requireVerificationApproved, AuthenticatedRequest } from "../middleware/auth";
import { calculateMatchScore, haversineDistanceKm } from "../services/matchingEngine";
import { logger } from "../utils/logger";

const router = Router();

// Sanitizer for PublicUser projection (§2.4)
const createRideSchema = z.object({
  origin: z.object({
    text: z.string().trim().min(1, "Origin text is required"),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
  destination: z.object({
    text: z.string().trim().min(1, "Destination text is required"),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
  departureTime: z.union([
    z.string().datetime(),
    z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid departure date/time"),
  ]),
  availableSeats: z.coerce.number().int().min(1, "At least 1 seat required").max(8, "Maximum 8 seats allowed").default(4),
  pricePerSeat: z.coerce.number().min(10, "Minimum price for riding must be at least ₹10").default(25).optional(),
  routePolyline: z.string().optional(),
  routeDistanceMeters: z.coerce.number().optional(),
  routeDurationSeconds: z.coerce.number().optional(),
  routeSummary: z.string().optional(),
  recurring: z.boolean().optional(),
  recurringSchedule: z.any().optional(),
  vehicle: z.any().optional(),
  preferences: z.any().optional(),
});

const updateRideSchema = z.object({
  origin: z
    .object({
      text: z.string().trim().min(1),
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
    })
    .optional(),
  destination: z
    .object({
      text: z.string().trim().min(1),
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
    })
    .optional(),
  departureTime: z
    .union([
      z.string().datetime(),
      z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid departure date/time"),
    ])
    .optional(),
  availableSeats: z.coerce.number().int().min(1).max(8).optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  recurringSchedule: z.any().optional(),
});

export function sanitizePublicUser(user: any) {
  if (!user) return user;
  const userObj = user.toObject ? user.toObject() : { ...user };
  return {
    _id: userObj._id,
    name: userObj.name,
    college: userObj.college,
    year: userObj.year,
    department: userObj.department || "General",
    course: userObj.course || "Degree",
    semester: userObj.semester || 1,
    rating: userObj.rating,
    totalRides: userObj.totalRides,
    avatarURL: userObj.avatarURL,
    verificationStatus: userObj.verificationStatus,
    preferences: userObj.preferences,
  };
}

// GET /api/rides?origin=&dest=&date= (§2.4 Authenticated & Sanitized)
router.get(
  "/",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        originLat,
        originLng,
        destLat,
        destLng,
        date,
        seats,
        womenOnlyDriver,
        creatorId,
        status,
        // Academic Filters
        college,
        department,
        course,
        year,
        semester,
        sameCourseSemOnly,
        sameDepartmentOnly,
        sameCollegeOnly,
        verifiedOnly,
        maxFare,
        minRating,
      } = req.query;

      const query: any = {};

      if (creatorId) {
        query.creator = creatorId;
      }

      if (status) {
        query.status = status;
      } else if (!creatorId) {
        query.status = "active";
      }

      if (date) {
        let searchDate: Date | null = null;
        const dStr = (date as string).trim();
        if (dStr.includes("-")) {
          const parts = dStr.split("-");
          if (parts[0].length === 4) {
            searchDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          } else if (parts[2].length === 4) {
            searchDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          }
        }
        if (!searchDate || isNaN(searchDate.getTime())) {
          searchDate = new Date(dStr);
        }
        if (!isNaN(searchDate.getTime())) {
          const startOfDay = new Date(searchDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(searchDate);
          endOfDay.setHours(23, 59, 59, 999);
          query.$or = [
            { departureTime: { $gte: startOfDay, $lte: endOfDay } },
            { recurring: true },
            { "recurringSchedule.daysOfWeek": { $exists: true, $ne: [] } },
          ];
        }
      }

      const rides = await Ride.find(query)
        .populate(
          "creator",
          "name college year department course semester rating totalRides avatarURL verificationStatus gender preferences",
        )
        .populate("vehicleId", "type model capacity plateLast4")
        .sort({ departureTime: 1 });

      // Fetch passenger's profile for academic affinity matching
      let passengerUser: any = null;
      if (req.user?.id) {
        passengerUser = await User.findById(req.user.id)
          .select("college department course year semester gender preferences")
          .lean();
      }

      const passengerAcademicProfile = {
        college:
          college && college !== "Any" && college !== "all"
            ? (college as string)
            : passengerUser?.college,
        department:
          department && department !== "Any" && department !== "all"
            ? (department as string)
            : passengerUser?.department,
        course:
          course && course !== "Any" && course !== "all"
            ? (course as string)
            : passengerUser?.course,
        year:
          year && year !== "Any" && year !== "all"
            ? parseInt(year as string, 10)
            : passengerUser?.year,
        semester:
          semester && semester !== "Any" && semester !== "all"
            ? parseInt(semester as string, 10)
            : passengerUser?.semester,
      };

      // Helper function to apply academic & secondary filters
      const passesFilters = (rideObj: any, matchBreakdown?: any) => {
        const driver = rideObj.creator as any;
        if (!driver) return false;

        // Women-only driver preference filter
        if (womenOnlyDriver === "true" && driver.gender !== "female") {
          return false;
        }

        // College filter
        if (college && college !== "Any" && college !== "all") {
          const cFilter = (college as string).toLowerCase().trim();
          const dColl = (driver.college || "").toLowerCase();
          if (!dColl.includes(cFilter)) return false;
        }

        // Department filter
        if (department && department !== "Any" && department !== "all") {
          const dFilter = (department as string).toLowerCase().trim();
          const dDept = (driver.department || "").toLowerCase();
          if (!dDept.includes(dFilter) && !dFilter.includes(dDept)) return false;
        }

        // Course filter
        if (course && course !== "Any" && course !== "all") {
          const crsFilter = (course as string).toLowerCase().trim();
          const dCrs = (driver.course || "").toLowerCase();
          if (!dCrs.includes(crsFilter) && !crsFilter.includes(dCrs)) return false;
        }

        // Year filter
        if (year && year !== "Any" && year !== "all") {
          const yr = parseInt(year as string, 10);
          if (!isNaN(yr) && driver.year !== yr) return false;
        }

        // Semester filter
        if (semester && semester !== "Any" && semester !== "all") {
          const sem = parseInt(semester as string, 10);
          if (!isNaN(sem) && driver.semester !== sem) return false;
        }

        // Quick affinity toggles
        if (sameCourseSemOnly === "true" && !matchBreakdown?.sameCourseAndSemester) {
          return false;
        }
        if (
          sameDepartmentOnly === "true" &&
          !matchBreakdown?.sameDepartment &&
          !matchBreakdown?.sameCourseAndSemester
        ) {
          return false;
        }
        if (sameCollegeOnly === "true" && !matchBreakdown?.sameCollege) {
          return false;
        }

        // Verified students only
        if (verifiedOnly === "true" && driver.verificationStatus !== "verified") {
          return false;
        }

        // Minimum rating
        if (minRating) {
          const r = parseFloat(minRating as string);
          if (!isNaN(r) && (driver.rating || 0) < r) return false;
        }

        // Maximum fare
        if (maxFare) {
          const f = parseFloat(maxFare as string);
          const rideFare = rideObj.pricing?.costPerSeat || 0;
          if (!isNaN(f) && rideFare > f) return false;
        }

        return true;
      };

      if (originLat && originLng) {
        const pLat = parseFloat(originLat as string);
        const pLng = parseFloat(originLng as string);
        const dLat = destLat ? parseFloat(destLat as string) : undefined;
        const dLng = destLng ? parseFloat(destLng as string) : undefined;
        const requestedSeats = seats ? parseInt(seats as string, 10) : 1;
        const timeQuery = req.query.time as string;

        let defaultTargetTime: Date;
        if (date && (date as string).length > 10) {
          defaultTargetTime = new Date(date as string);
        } else if (date && timeQuery) {
          defaultTargetTime = new Date(`${date}T${timeQuery}:00`);
        } else {
          defaultTargetTime = new Date();
        }

        const rankedRides = rides
          .map((ride) => {
            const rideObj = ride.toObject();
            const driverUser = rideObj.creator as any;

            const departureTarget =
              !date || (date && (date as string).length === 10 && !timeQuery)
                ? new Date(ride.departureTime)
                : defaultTargetTime;

            const matchResult = calculateMatchScore(
              {
                origin: { lat: ride.origin.lat, lng: ride.origin.lng },
                destination: { lat: ride.destination.lat, lng: ride.destination.lng },
                departureTime: ride.departureTime,
                availableSeats: ride.availableSeats,
                driverGender: driverUser?.gender,
                driverReliabilityScore: driverUser?.rating,
                academicProfile: {
                  college: driverUser?.college,
                  department: driverUser?.department,
                  course: driverUser?.course,
                  year: driverUser?.year,
                  semester: driverUser?.semester,
                },
                preferences: driverUser?.preferences,
              },
              {
                origin: { lat: pLat, lng: pLng },
                destination:
                  dLat !== undefined && dLng !== undefined
                    ? { lat: dLat, lng: dLng }
                    : undefined,
                departureTime: departureTarget,
                requestedSeats,
                academicProfile: passengerAcademicProfile,
                preferences: {
                  womenOnlyDriver: womenOnlyDriver === "true",
                },
              },
            );

            rideObj.creator = sanitizePublicUser(driverUser);

            return {
              ...rideObj,
              match: matchResult,
              matchScore: Math.round(matchResult.matchScore * 100),
              matchBreakdown: matchResult.breakdown,
            };
          })
          .filter((r) => {
            if (!passesFilters(r, r.matchBreakdown)) return false;
            return r.match.isMatch && r.match.matchScore >= 0.50;
          })
          .sort((a, b) => {
            // USER DIRECTIVE: Route corridor proximity FIRST, then Academic Affinity!
            // 1. First priority: Route Proximity & Detour Distance (closer corridor first)
            const detourA = a.matchBreakdown?.detourDistanceKm ?? 99;
            const detourB = b.matchBreakdown?.detourDistanceKm ?? 99;
            if (Math.abs(detourA - detourB) > 0.05) {
              return detourA - detourB;
            }

            // 2. Second priority: Academic Priority Rank among corridor-aligned rides
            // Rank 1: Same Course & Semester
            // Rank 2: Same Department
            // Rank 3: Same University
            // Rank 4: General
            const rankA = a.matchBreakdown?.academicPriorityRank ?? 4;
            const rankB = b.matchBreakdown?.academicPriorityRank ?? 4;
            if (rankA !== rankB) {
              return rankA - rankB; // 1 before 2, 2 before 3, etc.
            }

            // 3. Third priority: Combined Match Score
            return b.match.matchScore - a.match.matchScore;
          });

        // Return strictly the matched rides (no distant un-matched data padding)
        res.status(200).json(rankedRides);
        return;
      }

      // If no coordinates provided (Browse All), also score academic affinity and sort
      const sanitizedRides = rides
        .map((r) => {
          const obj = r.toObject();
          const driverUser = obj.creator as any;

          const matchResult = calculateMatchScore(
            {
              origin: { lat: r.origin.lat, lng: r.origin.lng },
              destination: { lat: r.destination.lat, lng: r.destination.lng },
              departureTime: r.departureTime,
              availableSeats: r.availableSeats,
              driverGender: driverUser?.gender,
              driverReliabilityScore: driverUser?.rating,
              academicProfile: {
                college: driverUser?.college,
                department: driverUser?.department,
                course: driverUser?.course,
                year: driverUser?.year,
                semester: driverUser?.semester,
              },
            },
            {
              origin: { lat: r.origin.lat, lng: r.origin.lng },
              departureTime: r.departureTime,
              requestedSeats: 1,
              academicProfile: passengerAcademicProfile,
            },
          );

          obj.creator = sanitizePublicUser(driverUser);
          return {
            ...obj,
            match: matchResult,
            matchScore: Math.round(matchResult.matchScore * 100),
            matchBreakdown: matchResult.breakdown,
          };
        })
        .filter((r) => passesFilters(r, r.matchBreakdown))
        .sort((a, b) => {
          const rankA = a.matchBreakdown?.academicPriorityRank ?? 4;
          const rankB = b.matchBreakdown?.academicPriorityRank ?? 4;
          if (rankA !== rankB) {
            return rankA - rankB;
          }
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        });

      res.status(200).json(sanitizedRides);
    } catch (err: any) {
      logger.error({ err }, "Fetch rides error");
      res.status(500).json({
        code: "SERVER_ERROR",
        message: err.message || "Failed to fetch rides",
      });
    }
  },
);

// POST /api/rides (Driver creates a ride offer §31, §4.1)
router.post(
  "/",
  requireAuth,
  requireRole("driver", "campus_admin", "super_admin"),
  requireVerificationApproved,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parseResult = createRideSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: parseResult.error.issues.map((i) => i.message).join(", "),
        });
        return;
      }

      const {
        origin,
        destination,
        departureTime,
        availableSeats,
        pricePerSeat,
        routePolyline,
        routeDistanceMeters,
        routeDurationSeconds,
        routeSummary,
        recurring,
        recurringSchedule,
      } = parseResult.data;

      let vehicle = await Vehicle.findOne({ ownerUserId: req.user!.id });
      if (!vehicle) {
        const vData = req.body.vehicle || {};
        vehicle = await Vehicle.create({
          ownerUserId: req.user!.id,
          type: vData.type || "car",
          model: vData.model || "Campus Vehicle",
          plateLast4: vData.plateLast4 || "4821",
          capacity: vData.capacity || (availableSeats + 1),
          isVerified: true,
        });
      }

      // Upgrade user to driver account type if not already
      await User.findByIdAndUpdate(req.user!.id, {
        role: "driver",
        accountType: "DRIVER",
      });

      const ride = await Ride.create({
        creator: req.user!.id,
        origin: {
          text: origin.text.trim(),
          lat: Number(origin.lat),
          lng: Number(origin.lng),
        },
        destination: {
          text: destination.text.trim(),
          lat: Number(destination.lat),
          lng: Number(destination.lng),
        },
        departureTime: new Date(departureTime),
        availableSeats,
        pricePerSeat: Math.max(10, pricePerSeat || 25),
        vehicleId: vehicle._id,
        status: "active",
        recurring: Boolean(recurring),
        routePolyline,
        routeDistanceMeters,
        routeDurationSeconds,
        routeSummary,
        recurringSchedule: recurring
          ? (typeof recurringSchedule === 'object' && Array.isArray(recurringSchedule?.daysOfWeek)
              ? {
                  daysOfWeek: recurringSchedule.daysOfWeek,
                  time: recurringSchedule.time || new Date(departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              : {
                  daysOfWeek: [1, 2, 3, 4, 5],
                  time: new Date(departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                })
          : undefined,
      });

      const populatedRide = await Ride.findById(ride._id)
        .populate(
          "creator",
          "name college year department course semester rating totalRides avatarURL verificationStatus gender preferences",
        )
        .populate("vehicleId");

      const result = populatedRide!.toObject();
      result.creator = sanitizePublicUser(result.creator);

      res.status(201).json(result);
    } catch (err: any) {
      logger.error({ err }, "Create ride error");
      res.status(500).json({
        code: "SERVER_ERROR",
        message: err.message || "Failed to create ride",
      });
    }
  },
);

// GET /api/rides/:id (Sanitized PublicUser projection)
router.get("/:id", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ code: "BAD_REQUEST", message: "Invalid ride ID" });
      return;
    }

    const ride = await Ride.findById(id)
      .populate(
        "creator",
        "name college year rating totalRides avatarURL verificationStatus preferences",
      )
      .populate("vehicleId");

    if (!ride) {
      res.status(404).json({ code: "NOT_FOUND", message: "Ride not found" });
      return;
    }

    const result = ride.toObject();
    result.creator = sanitizePublicUser(result.creator);

    res.status(200).json(result);
  } catch (err: any) {
    logger.error({ err }, "Fetch ride by ID error");
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch ride" });
  }
});

// PATCH /api/rides/:id
router.patch(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Invalid ride ID" });
        return;
      }

      const ride = await Ride.findById(id);
      if (!ride) {
        res.status(404).json({ code: "NOT_FOUND", message: "Ride not found" });
        return;
      }

      if (ride.creator.toString() !== req.user!.id) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Unauthorized: You can only edit your own rides",
        });
        return;
      }

      const parseResult = updateRideSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: parseResult.error.issues.map((i) => i.message).join(", "),
        });
        return;
      }

      const {
        origin,
        destination,
        departureTime,
        availableSeats,
        status,
        recurringSchedule,
      } = parseResult.data;

      if (origin) ride.origin = origin;
      if (destination) ride.destination = destination;
      if (departureTime) ride.departureTime = new Date(departureTime);
      if (availableSeats !== undefined) ride.availableSeats = Number(availableSeats);
      if (status) ride.status = status;
      if (recurringSchedule) ride.recurringSchedule = recurringSchedule;

      await ride.save();

      const updated = await Ride.findById(id)
        .populate(
          "creator",
          "name college year rating totalRides avatarURL verificationStatus preferences",
        )
        .populate("vehicleId");

      const result = updated!.toObject();
      result.creator = sanitizePublicUser(result.creator);

      res.status(200).json(result);
    } catch (err: any) {
      logger.error({ err }, "Failed to update ride");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to update ride" });
    }
  },
);

// DELETE /api/rides/:id
router.delete(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Invalid ride ID" });
        return;
      }

      const ride = await Ride.findById(id);
      if (!ride) {
        res.status(404).json({ code: "NOT_FOUND", message: "Ride not found" });
        return;
      }

      if (ride.creator.toString() !== req.user!.id) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Unauthorized: You can only cancel your own rides",
        });
        return;
      }

      ride.status = "cancelled";
      await ride.save();

      res.status(200).json({ message: "Ride successfully cancelled", ride });
    } catch (err: any) {
      logger.error({ err }, "Failed to delete ride");
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to delete ride" });
    }
  },
);

export default router;
