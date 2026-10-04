export interface GeoPoint {
  lat: number;
  lng: number;
}

export type AcademicTier = "course_semester" | "department" | "university" | "none";

export interface AcademicProfile {
  college?: string;
  department?: string;
  course?: string;
  year?: number;
  semester?: number;
}

export interface DriverRideInput {
  origin: GeoPoint;
  destination: GeoPoint;
  departureTime: Date | string;
  availableSeats: number;
  driverGender?: "male" | "female" | "other";
  driverReliabilityScore?: number;
  academicProfile?: AcademicProfile;
  preferences?: {
    womenOnlyDriver?: boolean;
    musicAllowed?: boolean;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
  };
}

export interface PassengerQueryInput {
  origin: GeoPoint;
  destination?: GeoPoint; // defaults to same destination if omitted
  departureTime: Date | string;
  requestedSeats?: number;
  academicProfile?: AcademicProfile;
  preferences?: {
    womenOnlyDriver?: boolean;
    musicAllowed?: boolean;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
  };
}

export interface MatchScoreResult {
  isMatch: boolean;
  matchScore: number; // 0 to 1
  percentage: number; // 0 to 100
  disqualificationReason?: string;
  breakdown: {
    routeOverlap: number; // 0 to 1
    timeMatch: number; // 0 to 1
    pickupProximity: number; // 0 to 1
    seatBonus: number; // 0 or 1 (scaled by 0.05 in total)
    detourDistanceKm: number;
    pickupDistanceKm: number;
    driverDetourMinutes?: number;
    driverReliability?: number;
    academicTier?: AcademicTier;
    academicBonus?: number;
    academicPriorityRank?: number; // 1 = Course/Sem, 2 = Dept, 3 = College, 4 = None
    academicCompatibilityLabel?: string;
    sameCourseAndSemester?: boolean;
    sameDepartment?: boolean;
    sameCollege?: boolean;
  };
}

/**
 * Calculates great-circle distance between two points using the Haversine formula (in km).
 */
export function haversineDistanceKm(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Pure function implementing the Section 7.3 matching engine algorithm.
 *
 * MatchScore = 0.5 * RouteOverlap + 0.3 * TimeMatch + 0.15 * PickupProximity + 0.05 * SeatBonus
 *
 * - RouteOverlap = 1 - (DetourDistance / DriverRouteDistance)
 * - TimeMatch = max(0, 1 - |driverTime - passengerTime| / MaxWaitMinutes), MaxWaitMinutes = 15
 * - PickupProximity = normalized inverse of detour distance for pickup (closer = higher, cap at ~2km = 0)
 * - SeatBonus = 1.0 (weight 0.05) if seats available >= requested, else disqualify
 * - Preference filter: e.g. "women-only driver" mismatch disqualifies entirely
 */
export function calculateMatchScore(
  driverRide: DriverRideInput,
  passengerQuery: PassengerQueryInput,
): MatchScoreResult {
  const requestedSeats = passengerQuery.requestedSeats ?? 1;

  // 1. Preference Filter Check (Hard Filter)
  if (passengerQuery.preferences?.womenOnlyDriver) {
    if (driverRide.driverGender !== "female") {
      return {
        isMatch: false,
        matchScore: 0,
        percentage: 0,
        disqualificationReason: "Driver does not match women-only preference",
        breakdown: {
          routeOverlap: 0,
          timeMatch: 0,
          pickupProximity: 0,
          seatBonus: 0,
          detourDistanceKm: 0,
          pickupDistanceKm: 0,
        },
      };
    }
  }

  // 2. Seat Capacity Check (Hard Filter)
  if (driverRide.availableSeats < requestedSeats) {
    return {
      isMatch: false,
      matchScore: 0,
      percentage: 0,
      disqualificationReason: `Insufficient seats: ${driverRide.availableSeats} available, ${requestedSeats} requested`,
      breakdown: {
        routeOverlap: 0,
        timeMatch: 0,
        pickupProximity: 0,
        seatBonus: 0,
        detourDistanceKm: 0,
        pickupDistanceKm: 0,
      },
    };
  }

  // 3. Distance & Route Overlap Calculation
  const dest = passengerQuery.destination || driverRide.destination;
  const driverRouteDist = Math.max(
    0.05,
    haversineDistanceKm(driverRide.origin, driverRide.destination),
  );

  const pickupDist = haversineDistanceKm(
    driverRide.origin,
    passengerQuery.origin,
  );
  const passengerTripDist = haversineDistanceKm(passengerQuery.origin, dest);
  const destToDriverDestDist = haversineDistanceKm(dest, driverRide.destination);

  // True Carpool Detour: driverOrigin -> passengerOrigin -> passengerDest -> driverDest vs direct driverOrigin -> driverDest
  const totalTripWithPassenger = pickupDist + passengerTripDist + destToDriverDestDist;
  const rawDetour = totalTripWithPassenger - driverRouteDist;
  const detourDist = Math.max(0, rawDetour);

  // RouteOverlap = 1 - (DetourDistance / DriverRouteDistance)
  // Clamp between 0 and 1
  let routeOverlap = 1 - (detourDist / Math.max(driverRouteDist, 1.0));
  if (routeOverlap < 0) routeOverlap = 0;
  if (routeOverlap > 1) routeOverlap = 1;

  // 4. Time Match Calculation
  const driverTime = new Date(driverRide.departureTime).getTime();
  const passengerTime = new Date(passengerQuery.departureTime).getTime();
  const diffMinutes = Math.abs(driverTime - passengerTime) / (60 * 1000);
  const MAX_WAIT_MINUTES = 15;

  let timeMatch = Math.max(0, 1 - diffMinutes / MAX_WAIT_MINUTES);
  if (timeMatch < 0) timeMatch = 0;
  if (timeMatch > 1) timeMatch = 1;

  // 5. Pickup & Destination Proximity Calculation (cap at ~2km = 0)
  const MAX_PICKUP_KM = 2.0;
  let pickupProximity = Math.max(0, 1 - pickupDist / MAX_PICKUP_KM);
  if (pickupProximity < 0) pickupProximity = 0;

  const destDist = passengerQuery.destination
    ? haversineDistanceKm(driverRide.destination, passengerQuery.destination)
    : 0;

  // Strict Corridor Match: If driver pickup or destination is > 0.9 km from passenger points, strictly disqualify
  if (pickupDist > 0.9 || (passengerQuery.destination && destDist > 0.9)) {
    return {
      isMatch: false,
      matchScore: 0,
      percentage: 0,
      disqualificationReason: `Route points do not match: pickup is ${pickupDist.toFixed(1)} km away, drop-off is ${destDist.toFixed(1)} km away`,
      breakdown: {
        routeOverlap: 0,
        timeMatch: Math.round(timeMatch * 100) / 100,
        pickupProximity: 0,
        seatBonus: 0,
        detourDistanceKm: Math.round(detourDist * 100) / 100,
        pickupDistanceKm: Math.round(pickupDist * 100) / 100,
      },
    };
  }

  // Directional Vector Check: Disqualify opposite-direction commutes (e.g. Premnagar -> Campus when searching Campus -> Premnagar)
  if (passengerQuery.destination) {
    const pDeltaLat = passengerQuery.destination.lat - passengerQuery.origin.lat;
    const pDeltaLng = passengerQuery.destination.lng - passengerQuery.origin.lng;
    const dDeltaLat = driverRide.destination.lat - driverRide.origin.lat;
    const dDeltaLng = driverRide.destination.lng - driverRide.origin.lng;
    const pMag = Math.sqrt(pDeltaLat * pDeltaLat + pDeltaLng * pDeltaLng);
    const dMag = Math.sqrt(dDeltaLat * dDeltaLat + dDeltaLng * dDeltaLng);
    if (pMag > 0.0001 && dMag > 0.0001) {
      const cosSim = (pDeltaLat * dDeltaLat + pDeltaLng * dDeltaLng) / (pMag * dMag);
      if (cosSim < 0.5) {
        return {
          isMatch: false,
          matchScore: 0,
          percentage: 0,
          disqualificationReason: "Driver is traveling in opposite or divergent direction",
          breakdown: {
            routeOverlap: 0,
            timeMatch: Math.round(timeMatch * 100) / 100,
            pickupProximity: 0,
            seatBonus: 0,
            detourDistanceKm: Math.round(detourDist * 100) / 100,
            pickupDistanceKm: Math.round(pickupDist * 100) / 100,
          },
        };
      }
    }
  }

  // If routes are completely divergent (zero route overlap), disqualify
  if (routeOverlap <= 0) {
    return {
      isMatch: false,
      matchScore: 0,
      percentage: 0,
      disqualificationReason: "Routes are completely divergent (zero route overlap)",
      breakdown: {
        routeOverlap: 0,
        timeMatch: Math.round(timeMatch * 100) / 100,
        pickupProximity: Math.round(pickupProximity * 100) / 100,
        seatBonus: 0,
        detourDistanceKm: Math.round(detourDist * 100) / 100,
        pickupDistanceKm: Math.round(pickupDist * 100) / 100,
      },
    };
  }

  // 6. Seat Bonus
  const seatBonus = driverRide.availableSeats >= requestedSeats ? 1.0 : 0.0;

  // 7. Academic Affinity & Priority Calculation
  const dAcad = driverRide.academicProfile;
  const pAcad = passengerQuery.academicProfile;

  let academicTier: AcademicTier = "none";
  let academicPriorityRank = 4; // 1 = Course/Sem, 2 = Dept, 3 = University, 4 = None
  let academicBonus = 0;
  let academicCompatibilityLabel = "🌐 Open University Network";
  let sameCourseAndSemester = false;
  let sameDepartment = false;
  let sameCollege = false;

  if (dAcad && pAcad) {
    const norm = (s?: string) =>
      (s || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    const dCourse = norm(dAcad.course);
    const pCourse = norm(pAcad.course);
    const dDept = norm(dAcad.department);
    const pDept = norm(pAcad.department);
    const dColl = norm(dAcad.college);
    const pColl = norm(pAcad.college);

    const isSameCourse = Boolean(
      dCourse &&
        pCourse &&
        (dCourse === pCourse ||
          dCourse.includes(pCourse) ||
          pCourse.includes(dCourse)),
    );
    const isSameSem =
      dAcad.semester !== undefined &&
      pAcad.semester !== undefined &&
      Number(dAcad.semester) === Number(pAcad.semester);
    sameCourseAndSemester = isSameCourse && isSameSem;

    sameDepartment = Boolean(
      dDept &&
        pDept &&
        (dDept === pDept || dDept.includes(pDept) || pDept.includes(dDept)),
    );
    sameCollege = Boolean(
      dColl &&
        pColl &&
        (dColl === pColl || dColl.includes(pColl) || pColl.includes(dColl)),
    );

    if (sameCourseAndSemester) {
      // Tier 1: Same Course & Semester (Highest Priority!)
      academicTier = "course_semester";
      academicPriorityRank = 1;
      academicBonus = 0.12;
      academicCompatibilityLabel = `🎓 Same Course & Semester (${dAcad.course || "Classmate"} Sem ${dAcad.semester})`;
    } else if (sameDepartment) {
      // Tier 2: Same Department / Branch
      academicTier = "department";
      academicPriorityRank = 2;
      academicBonus = 0.08;
      academicCompatibilityLabel = `📚 Same Department (${dAcad.department || "Branch"})`;
    } else if (sameCollege) {
      // Tier 3: Same College / University
      academicTier = "university";
      academicPriorityRank = 3;
      academicBonus = 0.04;
      academicCompatibilityLabel = `🏛️ Same University (${dAcad.college})`;
    }
  }

  // 8. Combined Weighted Match Score
  // MatchScore = BaseScore + AcademicBonus
  const baseScore =
    0.5 * routeOverlap +
    0.3 * timeMatch +
    0.15 * pickupProximity +
    0.05 * seatBonus;

  const totalScore = Math.min(1.0, baseScore + academicBonus);

  const roundedScore = Math.min(
    1.0,
    Math.max(0.0, Math.round(totalScore * 1000) / 1000),
  );
  const percentage = Math.round(roundedScore * 100);

  // Must have both meaningful route overlap (>= 40%) and overall match score >= 50%
  const isMatch = roundedScore >= 0.50 && routeOverlap >= 0.40;

  return {
    isMatch,
    matchScore: roundedScore,
    percentage,
    breakdown: {
      routeOverlap: Math.round(routeOverlap * 100) / 100,
      timeMatch: Math.round(timeMatch * 100) / 100,
      pickupProximity: Math.round(pickupProximity * 100) / 100,
      seatBonus,
      detourDistanceKm: Math.round(detourDist * 100) / 100,
      pickupDistanceKm: Math.round(pickupDist * 100) / 100,
      driverDetourMinutes: Math.round((detourDist / 25) * 60),
      academicTier,
      academicBonus: Math.round(academicBonus * 100) / 100,
      academicPriorityRank,
      academicCompatibilityLabel,
      sameCourseAndSemester,
      sameDepartment,
      sameCollege,
    },
  };
}
