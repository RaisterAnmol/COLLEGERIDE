import {
  DEMO_FALLBACK_USERS,
  DEMO_FALLBACK_RIDES,
  DEMO_FALLBACK_OPERATIONS,
  DEMO_FALLBACK_INCIDENTS,
  DEMO_FALLBACK_VERIFICATIONS,
  DEMO_FALLBACK_ANALYTICS,
  DEMO_FALLBACK_HUBS,
  DEMO_FALLBACK_AUDIT_LOGS,
} from "./demoFallback";

const isStandaloneVercel =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  !import.meta.env.VITE_API_URL;

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "");

function getLocalDemoFallback<T>(endpoint: string, options: RequestInit): T | undefined {
  try {
    const url = new URL(endpoint, "http://localhost");
    const path = url.pathname;

    if (path === "/api/auth/register") {
      let parsed: any = {};
      try {
        if (options.body) parsed = JSON.parse(options.body as string);
      } catch {}
      const email = parsed.email || "student@university.edu";
      const customUser = {
        _id: "user_" + Date.now(),
        name: parsed.name || "Student User",
        email,
        college: parsed.college || "University",
        department: parsed.department || "General",
        course: parsed.course || "Degree",
        year: Number(parsed.year) || 1,
        semester: Number(parsed.semester) || 1,
        phone: parsed.phone || "",
        gender: parsed.gender || "other",
        role: parsed.accountType === "DRIVER" ? "driver" : parsed.accountType === "ADMIN" ? "campus_admin" : "student",
        accountType: parsed.accountType || "PASSENGER",
        avatarURL: parsed.avatarURL || parsed.facePhoto || "",
        verificationStatus: "pending",
        rating: 5.0,
        totalRides: 0,
      };
      localStorage.setItem("campusride_user_email", email);
      localStorage.setItem("campusride_custom_user", JSON.stringify(customUser));
      return { token: "token_" + customUser._id, user: customUser } as T;
    }

    if (path === "/api/auth/login") {
      let email = "";
      try {
        if (options.body) {
          const parsed = JSON.parse(options.body as string);
          email = parsed.email || "";
        }
      } catch {}
      const customUserStr = localStorage.getItem("campusride_custom_user");
      if (customUserStr) {
        try {
          const customUser = JSON.parse(customUserStr);
          if (email && customUser.email?.toLowerCase() === email.toLowerCase()) {
            localStorage.setItem("campusride_user_email", email);
            return { token: "token_" + customUser._id, user: customUser } as T;
          }
        } catch {}
      }
      const user = (email && DEMO_FALLBACK_USERS[email]) || DEMO_FALLBACK_USERS["aditya.kumar@college.edu"];
      localStorage.setItem("campusride_user_email", user.email);
      return { token: "demo_jwt_token_" + user._id, user } as T;
    }

    if (path === "/api/auth/me") {
      const savedEmail = localStorage.getItem("campusride_user_email") || "";
      const customUserStr = localStorage.getItem("campusride_custom_user");
      if (customUserStr) {
        try {
          const customUser = JSON.parse(customUserStr);
          if (!savedEmail || customUser.email?.toLowerCase() === savedEmail.toLowerCase()) {
            return { user: customUser, vehicle: null } as T;
          }
        } catch {}
      }
      const user = (savedEmail && DEMO_FALLBACK_USERS[savedEmail]) || DEMO_FALLBACK_USERS["aditya.kumar@college.edu"];
      return { user, vehicle: { model: "Honda City", plateLast4: "4821" } } as T;
    }

    // 1. Single Ride Details (fixes View Details not opening on Vercel)
    const singleRideMatch = path.match(/^\/api\/rides\/([^/?]+)$/);
    if (singleRideMatch && (!options.method || options.method === "GET") && singleRideMatch[1] !== "requests") {
      const targetId = singleRideMatch[1];
      const customRides = JSON.parse(localStorage.getItem("campusride_local_rides") || "[]");
      const allRides = [...customRides, ...DEMO_FALLBACK_RIDES];
      const found = allRides.find((r: any) => String(r._id) === targetId || String(r.id) === targetId);
      if (found) return found as T;
      if (allRides.length > 0) return { ...allRides[0], _id: targetId } as T;
      return null as unknown as T;
    }

    // 2. Request Ride / Seat Requests (fixes Request Sent on Vercel)
    const isRideRequestPost =
      (path.match(/^\/api\/rides\/([^/]+)\/request/) || path === "/api/rides/requests") &&
      options.method === "POST";
    if (isRideRequestPost) {
      let targetRideId = "";
      const pathParamMatch = path.match(/^\/api\/rides\/([^/]+)\/request/);
      if (pathParamMatch) {
        targetRideId = pathParamMatch[1];
      } else {
        try {
          const b = JSON.parse(options.body as string);
          targetRideId = b.rideId || "";
        } catch {}
      }

      const savedEmail = localStorage.getItem("campusride_user_email") || "rahul.sharma@college.edu";
      const passenger = DEMO_FALLBACK_USERS[savedEmail] || DEMO_FALLBACK_USERS["rahul.sharma@college.edu"];
      const existingReqs = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
      const newReq = {
        _id: "req_" + Date.now(),
        rideId: targetRideId,
        passengerId: passenger,
        seatsRequested: 1,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      const updated = [newReq, ...existingReqs.filter((r: any) => !(r.rideId === targetRideId && r.passengerId?._id === passenger._id))];
      localStorage.setItem("campusride_local_requests", JSON.stringify(updated));
      return {
        success: true,
        message: "Seat requested successfully! Driver notified in real time.",
        request: newReq,
      } as T;
    }

    // 3. Fetch Ride Requests
    if (path.includes("/requests") && (!options.method || options.method === "GET")) {
      const savedEmail = localStorage.getItem("campusride_user_email") || "rahul.sharma@college.edu";
      const passenger = DEMO_FALLBACK_USERS[savedEmail] || DEMO_FALLBACK_USERS["rahul.sharma@college.edu"];
      const localReqs = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
      const rideIdParam = url.searchParams.get("rideId");
      if (rideIdParam) {
        return localReqs.filter((r: any) => r.rideId === rideIdParam) as T;
      }
      return localReqs as T;
    }

    // 4. Trip Details (active trip fallback)
    const tripMatch = path.match(/^\/api\/trips\/([^/?]+)$/);
    if (tripMatch && (!options.method || options.method === "GET")) {
      const tripId = tripMatch[1];
      return {
        _id: tripId,
        rideId: tripId,
        status: "scheduled",
        otp: "4821",
        startLocation: { lat: 30.3432, lng: 77.9448 },
      } as T;
    }

    // 5. Query Active Matching Rides (Strict Corridor Matching - No Irregular Data)
    if (path === "/api/rides" && (!options.method || options.method === "GET")) {
      const customRides = JSON.parse(localStorage.getItem("campusride_local_rides") || "[]");
      let allRides = [...customRides, ...DEMO_FALLBACK_RIDES];

      const originLat = url.searchParams.get("originLat") ? parseFloat(url.searchParams.get("originLat")!) : null;
      const originLng = url.searchParams.get("originLng") ? parseFloat(url.searchParams.get("originLng")!) : null;
      const destLat = url.searchParams.get("destLat") ? parseFloat(url.searchParams.get("destLat")!) : null;
      const destLng = url.searchParams.get("destLng") ? parseFloat(url.searchParams.get("destLng")!) : null;
      const seats = url.searchParams.get("seats") ? parseInt(url.searchParams.get("seats")!, 10) : 1;
      const womenOnly = url.searchParams.get("womenOnlyDriver") === "true";
      const college = url.searchParams.get("college");
      const department = url.searchParams.get("department");
      const course = url.searchParams.get("course");
      const year = url.searchParams.get("year");
      const semester = url.searchParams.get("semester");
      const verifiedOnly = url.searchParams.get("verifiedOnly") === "true";
      const maxFare = url.searchParams.get("maxFare") ? parseFloat(url.searchParams.get("maxFare")!) : null;
      const minRating = url.searchParams.get("minRating") ? parseFloat(url.searchParams.get("minRating")!) : null;
      const date = url.searchParams.get("date");

      const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const getLat = (loc: any) =>
        loc?.lat !== undefined ? Number(loc.lat) : Array.isArray(loc?.coordinates) ? Number(loc.coordinates[1]) : null;
      const getLng = (loc: any) =>
        loc?.lng !== undefined ? Number(loc.lng) : Array.isArray(loc?.coordinates) ? Number(loc.coordinates[0]) : null;

      const filtered = allRides.filter((r: any) => {
        const driver = r.creator || {};

        // Seats filter
        if (r.availableSeats !== undefined && r.availableSeats < seats) return false;

        // Women only driver
        if (womenOnly && driver.gender !== "female" && !r.preferences?.womenOnlyDriver) return false;

        // College filter
        if (college && college !== "Any" && college !== "all") {
          const cF = college.toLowerCase().trim();
          const dC = (driver.college || "").toLowerCase();
          if (!dC.includes(cF) && !cF.includes(dC)) return false;
        }

        // Department filter
        if (department && department !== "Any" && department !== "all") {
          const dF = department.toLowerCase().trim();
          const dD = (driver.department || "").toLowerCase();
          if (!dD.includes(dF) && !dF.includes(dD)) return false;
        }

        // Course filter
        if (course && course !== "Any" && course !== "all") {
          const crsF = course.toLowerCase().trim();
          const dCrs = (driver.course || "").toLowerCase();
          if (!dCrs.includes(crsF) && !crsF.includes(dCrs)) return false;
        }

        // Year filter
        if (year && year !== "Any" && year !== "all") {
          const yNum = parseInt(year, 10);
          if (!isNaN(yNum) && driver.year !== yNum) return false;
        }

        // Semester filter
        if (semester && semester !== "Any" && semester !== "all") {
          const sNum = parseInt(semester, 10);
          if (!isNaN(sNum) && driver.semester !== sNum) return false;
        }

        // Verified filter
        if (verifiedOnly && driver.verificationStatus !== "verified") return false;

        // Rating filter
        if (minRating !== null && !isNaN(minRating) && (driver.rating || 0) < minRating) return false;

        // Fare filter
        const cost = r.pricing?.costPerSeat ?? r.pricePerSeat ?? 0;
        if (maxFare !== null && !isNaN(maxFare) && cost > maxFare) return false;

        // Date filter
        if (date && !r.recurring) {
          const rideDateStr = (r.departureTime || "").slice(0, 10);
          let targetDateStr = date.trim();
          if (targetDateStr.includes("-")) {
            const parts = targetDateStr.split("-");
            if (parts[0].length === 2 && parts[2].length === 4) {
              targetDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
          if (rideDateStr && targetDateStr && rideDateStr !== targetDateStr) {
            if (!r.recurringSchedule?.daysOfWeek?.length) return false;
          }
        }

        // Strict Geographic Proximity Match:
        // Threshold is 1.2 km to ensure distinct campus stops and NO irregular/distant corridors (e.g. Selaqui vs Premnagar)
        if (originLat !== null && originLng !== null && r.origin) {
          const rLat = getLat(r.origin);
          const rLng = getLng(r.origin);
          if (rLat === null || rLng === null) return false;
          const origDist = haversine(originLat, originLng, rLat, rLng);
          if (isNaN(origDist) || origDist > 1.2) return false;
        }

        if (destLat !== null && destLng !== null && r.destination) {
          const rLat = getLat(r.destination);
          const rLng = getLng(r.destination);
          if (rLat === null || rLng === null) return false;
          const destDist = haversine(destLat, destLng, rLat, rLng);
          if (isNaN(destDist) || destDist > 1.2) return false;
        }

        return true;
      });

      return filtered as T;
    }

    // 6. Post a Ride (Persists to local storage & immediately visible in search)
    if (path === "/api/rides" && options.method === "POST") {
      try {
        const body = JSON.parse(options.body as string);
        const savedEmail = localStorage.getItem("campusride_user_email") || "aditya.kumar@college.edu";
        const currentUser = DEMO_FALLBACK_USERS[savedEmail] || DEMO_FALLBACK_USERS["aditya.kumar@college.edu"];

        const origLat = body.origin?.lat ?? (body.origin?.coordinates ? body.origin.coordinates[1] : 30.3432);
        const origLng = body.origin?.lng ?? (body.origin?.coordinates ? body.origin.coordinates[0] : 77.9448);
        const destLat = body.destination?.lat ?? (body.destination?.coordinates ? body.destination.coordinates[1] : 30.3340);
        const destLng = body.destination?.lng ?? (body.destination?.coordinates ? body.destination.coordinates[0] : 77.9620);
        const seatCost = body.pricePerSeat || 20;

        const newRide = {
          _id: "ride_local_" + Date.now(),
          creator: {
            ...currentUser,
            verificationStatus: "verified",
          },
          ...body,
          origin: {
            text: body.origin?.text || "Campus Pickup Bay",
            lat: origLat,
            lng: origLng,
            coordinates: [origLng, origLat],
          },
          destination: {
            text: body.destination?.text || "Campus Drop Bay",
            lat: destLat,
            lng: destLng,
            coordinates: [destLng, destLat],
          },
          pricing: {
            costPerSeat: seatCost,
          },
          pricePerSeat: seatCost,
          availableSeats: body.availableSeats || 3,
          departureTime: body.departureTime || new Date(Date.now() + 3600000).toISOString(),
          recurring: true,
          status: "active",
          matchScore: 99,
          match: {
            isMatch: true,
            matchScore: 0.99,
            percentage: 99,
            breakdown: {
              routeOverlap: 1,
              timeMatch: 1,
              pickupProximity: 1,
              seatBonus: 1,
              detourDistanceKm: 0,
              pickupDistanceKm: 0,
              academicTier: "university",
              academicPriorityRank: 1,
              academicCompatibilityLabel: "🎓 Verified Student Commuter",
              sameCourseAndSemester: true,
              sameDepartment: true,
              sameCollege: true,
            },
          },
        };
        const customRides = JSON.parse(localStorage.getItem("campusride_local_rides") || "[]");
        localStorage.setItem("campusride_local_rides", JSON.stringify([newRide, ...customRides]));
        return newRide as T;
      } catch (err) {
        console.error("[api] Error creating ride fallback:", err);
      }
    }

    // 7. Admin Operations Telemetry (Scoped to Admin College)
    if (path === "/api/admin/operations") {
      const savedEmail = localStorage.getItem("campusride_user_email") || "admin@campusride.edu";
      const currentUser = DEMO_FALLBACK_USERS[savedEmail] || DEMO_FALLBACK_USERS["admin@campusride.edu"];
      const adminCollege = currentUser?.college;
      const isSuper = false;

      let filteredOngoing = DEMO_FALLBACK_OPERATIONS.ongoingRides;
      if (adminCollege) {
        filteredOngoing = DEMO_FALLBACK_OPERATIONS.ongoingRides.filter((r: any) => {
          const dColl = (r.driver?.college || "").toLowerCase();
          const target = adminCollege.toLowerCase();
          return dColl.includes(target) || target.includes(dColl);
        });
      }

      return {
        ...DEMO_FALLBACK_OPERATIONS,
        ongoingRides: filteredOngoing,
        adminCollege: adminCollege || "Uttaranchal University",
        kpis: {
          ...DEMO_FALLBACK_OPERATIONS.kpis,
          ongoingRidesCount: filteredOngoing.length,
          totalRides: filteredOngoing.length > 0 ? filteredOngoing.length * 4 : 8,
        },
      } as T;
    }

    if (path === "/api/admin/pricing") {
      if (options.method === "PUT") {
        try {
          const body = JSON.parse(options.body as string);
          const updated = { ...DEMO_FALLBACK_OPERATIONS.pricingConfig, ...body };
          localStorage.setItem("campusride_pricing", JSON.stringify(updated));
          return updated as T;
        } catch {}
      }
      const saved = localStorage.getItem("campusride_pricing");
      return (saved ? JSON.parse(saved) : DEMO_FALLBACK_OPERATIONS.pricingConfig) as T;
    }

    if (path.includes("/emergency/incidents")) {
      return DEMO_FALLBACK_INCIDENTS as T;
    }

    // 8. Verification Queue (Scoped to Admin College)
    if (path.includes("/verification/queue")) {
      const savedEmail = localStorage.getItem("campusride_user_email") || "admin@campusride.edu";
      const currentUser = DEMO_FALLBACK_USERS[savedEmail] || DEMO_FALLBACK_USERS["admin@campusride.edu"];
      const adminCollege = currentUser?.college;
      const isSuper = currentUser?.role === "super_admin";

      const rawList = Array.isArray(DEMO_FALLBACK_VERIFICATIONS)
        ? DEMO_FALLBACK_VERIFICATIONS
        : (DEMO_FALLBACK_VERIFICATIONS as any).requests || [];

      let list = rawList;
      if (adminCollege && !isSuper) {
        list = list.filter((req: any) => {
          const col = (req.college || req.user?.college || req.userId?.college || "").toLowerCase();
          const target = adminCollege.toLowerCase();
          return col.includes(target) || target.includes(col);
        });
      }
      return { requests: list } as T;
    }

    if (path.includes("/analytics/mobility")) {
      return DEMO_FALLBACK_ANALYTICS as T;
    }

    if (path.includes("/places/hubs")) {
      return DEMO_FALLBACK_HUBS as T;
    }

    if (path.includes("/daily-driver-check") && options.method === "POST") {
      const today = new Date().toISOString().slice(0, 10);
      const savedEmail = localStorage.getItem("campusride_user_email") || "aditya.kumar@college.edu";
      const user = DEMO_FALLBACK_USERS[savedEmail] || DEMO_FALLBACK_USERS["aditya.kumar@college.edu"];
      localStorage.setItem("campusride_daily_id_verified_" + user._id, today);
      localStorage.setItem("campusride_driver_verified_date", today);
      return {
        success: true,
        verified: true,
        date: today,
        matchScore: 98.4,
        message: `Driver ID card authenticated for today's campus carpools!`,
      } as T;
    }

    // Default safe empty array / object for any unknown endpoint
    return [] as unknown as T;
  } catch (e) {
    console.warn("[DemoFallback] Error resolving fallback:", e);
  }

  return undefined;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem("campusride_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // If on Vercel without a configured backend URL, serve local demo fallback directly without loopback attempt
    if (isStandaloneVercel || !API_BASE) {
      const fallback = getLocalDemoFallback<T>(endpoint, options);
      if (fallback !== undefined) return fallback;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("campusride_token");
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          (Array.isArray(errorData.issues)
            ? errorData.issues.map((i: any) => i.message).join(", ")
            : "") ||
          `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (err: any) {
      // If this is a real error response thrown from above, never swallow it with fallback
      if (err instanceof Error && err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
        throw err;
      }

      // If network is completely unreachable (or on Vercel preview without API)
      if (isStandaloneVercel || !API_BASE) {
        const fallback = getLocalDemoFallback<T>(endpoint, options);
        if (fallback !== undefined) {
          return fallback;
        }
      }
      throw err;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: any) {
    return this.request<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async getMe() {
    return this.request<{ user: any; vehicle?: any }>("/api/auth/me");
  }

  async getMyVehicle() {
    const me = await this.getMe();
    return { vehicle: me?.vehicle || null };
  }

  async verifyUser(id: string) {
    return this.request<{ message: string; user: any }>(
      `/api/users/${id}/verify`,
      {
        method: "POST",
      },
    );
  }

  // Rides
  async getRides(
    params: {
      originLat?: number;
      originLng?: number;
      destLat?: number;
      destLng?: number;
      date?: string;
      seats?: number;
      womenOnlyDriver?: boolean;
      creatorId?: string;
      status?: string;
      college?: string;
      department?: string;
      course?: string;
      year?: number | string;
      semester?: number | string;
      sameCourseSemOnly?: boolean;
      sameDepartmentOnly?: boolean;
      sameCollegeOnly?: boolean;
      verifiedOnly?: boolean;
      maxFare?: number | string;
      minRating?: number | string;
    } = {},
  ) {
    const query = new URLSearchParams();
    if (params.originLat !== undefined)
      query.set("originLat", params.originLat.toString());
    if (params.originLng !== undefined)
      query.set("originLng", params.originLng.toString());
    if (params.destLat !== undefined)
      query.set("destLat", params.destLat.toString());
    if (params.destLng !== undefined)
      query.set("destLng", params.destLng.toString());
    if (params.date) query.set("date", params.date);
    if (params.seats) query.set("seats", params.seats.toString());
    if (params.womenOnlyDriver) query.set("womenOnlyDriver", "true");
    if (params.creatorId) query.set("creatorId", params.creatorId);
    if (params.status) query.set("status", params.status);
    if (params.college && params.college !== "Any") query.set("college", params.college);
    if (params.department && params.department !== "Any") query.set("department", params.department);
    if (params.course && params.course !== "Any") query.set("course", params.course);
    if (params.year && params.year !== "Any") query.set("year", params.year.toString());
    if (params.semester && params.semester !== "Any") query.set("semester", params.semester.toString());
    if (params.sameCourseSemOnly) query.set("sameCourseSemOnly", "true");
    if (params.sameDepartmentOnly) query.set("sameDepartmentOnly", "true");
    if (params.sameCollegeOnly) query.set("sameCollegeOnly", "true");
    if (params.verifiedOnly) query.set("verifiedOnly", "true");
    if (params.maxFare) query.set("maxFare", params.maxFare.toString());
    if (params.minRating) query.set("minRating", params.minRating.toString());

    const queryString = query.toString();
    return this.request<any[]>(
      `/api/rides${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getRideById(id: string) {
    return this.request<any>(`/api/rides/${id}`);
  }

  async createRide(rideData: any) {
    return this.request<any>("/api/rides", {
      method: "POST",
      body: JSON.stringify(rideData),
    });
  }

  async updateRide(id: string, updateData: any) {
    return this.request<any>(`/api/rides/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    });
  }

  async cancelRide(id: string) {
    return this.request<any>(`/api/rides/${id}`, {
      method: "DELETE",
    });
  }

  // Requests
  async requestRide(rideId: string) {
    return this.request<any>(`/api/rides/${rideId}/request`, {
      method: "POST",
    });
  }

  async getRequests(role?: "driver" | "passenger", rideId?: string) {
    const query = new URLSearchParams();
    if (role) query.set("role", role);
    if (rideId) query.set("rideId", rideId);
    const qs = query.toString();
    return this.request<any[]>(`/api/requests${qs ? `?${qs}` : ""}`);
  }

  async updateRequestStatus(
    reqId: string,
    status: "accepted" | "declined" | "cancelled",
  ) {
    return this.request<any>(`/api/requests/${reqId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Trips & OTP
  async startTrip(rideId: string) {
    return this.request<any>("/api/trips", {
      method: "POST",
      body: JSON.stringify({ rideId }),
    });
  }

  async getTrip(tripId: string) {
    return this.request<any>(`/api/trips/${tripId}`);
  }

  async verifyOtp(tripId: string, otp: string) {
    return this.request<{ message: string; verified: boolean }>(
      `/api/trips/${tripId}/verify-otp`,
      {
        method: "POST",
        body: JSON.stringify({ otp }),
      },
    );
  }

  async regenerateOtp(tripId: string) {
    return this.request<{ message: string; otp: string; expiresAt: string }>(
      `/api/trips/${tripId}/regenerate-otp`,
      {
        method: "POST",
      },
    );
  }

  async completeTrip(tripId: string, distance?: number) {
    return this.request<any>(`/api/trips/${tripId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed", distance }),
    });
  }

  // Chat / Conversations
  async getConversation(rideId?: string) {
    return this.request<any>(
      `/api/conversations${rideId ? `?rideId=${rideId}` : ""}`,
    );
  }

  async sendMessage(conversationId: string, text: string) {
    return this.request<any>(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Reviews
  async submitReview(data: {
    tripId: string;
    toUserId: string;
    rating: number;
    comment?: string;
  }) {
    return this.request<any>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserReviews(userId: string) {
    return this.request<any[]>(`/api/users/${userId}/reviews`);
  }

  // Mobility Analytics
  async getMobilityAnalytics() {
    return this.request<any>("/api/analytics/mobility");
  }

  // Emergency SOS & SOC Operations
  async triggerSos(data: {
    tripId?: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    notes?: string;
  }) {
    return this.request<any>("/api/emergency/sos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getEmergencyIncidents(params: { status?: string; campusId?: string } = {}) {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.campusId) q.set("campusId", params.campusId);
    const qs = q.toString();
    return this.request<{ incidents: any[] }>(`/api/emergency/incidents${qs ? `?${qs}` : ""}`);
  }

  async updateIncidentStatus(id: string, status: string, securityNotes?: string) {
    return this.request<any>(`/api/emergency/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, securityNotes }),
    });
  }

  // Student & Institutional Verification
  async submitVerificationRequest(data: FormData | Record<string, any>) {
    return this.request<any>("/api/verification/request", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async getMyVerificationRequest() {
    return this.request<{ request: any }>("/api/verification/my-request");
  }

  async getVerificationQueue(params: string | { status?: string; role?: string; search?: string } = {}) {
    const p = typeof params === "string" ? { status: params } : params;
    const q = new URLSearchParams();
    if (p.status) q.set("status", p.status);
    if (p.role) q.set("role", p.role);
    if (p.search) q.set("search", p.search);
    const qs = q.toString();
    return this.request<{ requests: any[] }>(`/api/verification/queue${qs ? `?${qs}` : ""}`);
  }

  async getVerificationRequestById(id: string) {
    return this.request<{ request: any }>(`/api/verification/requests/${id}`);
  }

  async approveVerification(id: string) {
    return this.request<{ message: string; request: any }>(`/api/verification/requests/${id}/approve`, {
      method: "POST",
    });
  }

  async rejectVerification(id: string, rejectionReason: string) {
    return this.request<{ message: string; request: any }>(`/api/verification/requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async reviewVerificationRequest(
    id: string,
    decision: "approved" | "rejected",
    rejectionReason?: string
  ) {
    if (decision === "approved") {
      return this.approveVerification(id);
    }
    return this.rejectVerification(id, rejectionReason || "Rejected by institutional review");
  }

  async getDocumentBlobUrl(requestId: string, type: "idDocument" | "drivingLicense" | "selfie"): Promise<string> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/api/verification/requests/${requestId}/document/${type}`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to load document (${res.status})`);
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  // Face Enrollment & Verification
  async enrollFace(embedding: number[], qualityScore?: number) {
    return this.request<{ message: string; faceEnrollmentStatus: string }>("/api/face/enroll", {
      method: "POST",
      body: JSON.stringify({ embedding, qualityScore }),
    });
  }

  async verifyFace(embedding: number[], tripId?: string) {
    return this.request<{ verified: boolean; confidence: number; message: string }>("/api/face/verify", {
      method: "POST",
      body: JSON.stringify({ embedding, tripId }),
    });
  }

  // Daily Driver Physical ID Card Verification
  async verifyDailyDriverId(payload: { capturedImageBase64?: string; capturedImage?: File; rideId?: string }) {
    if (payload.capturedImage) {
      const fd = new FormData();
      fd.append("capturedImage", payload.capturedImage);
      if (payload.rideId) fd.append("rideId", payload.rideId);
      return this.request<{ success: boolean; verified: boolean; date: string; matchScore: number; message: string }>(
        "/api/verification/daily-driver-check",
        {
          method: "POST",
          body: fd,
        }
      );
    }
    return this.request<{ success: boolean; verified: boolean; date: string; matchScore: number; message: string }>(
      "/api/verification/daily-driver-check",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  // Maps, Routes & Pickup Hubs
  async getPlacesConfig() {
    return this.request<{ mapsMode: "LIVE" | "MOCK_DEV"; isLive: boolean }>("/api/places/config");
  }

  async searchPlaces(query: string) {
    return this.request<{ mode: string; places: any[] }>(`/api/places/search?q=${encodeURIComponent(query)}`);
  }

  async calculateRoadRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    intermediates: Array<{ lat: number; lng: number }> = []
  ) {
    return this.request<{
      mode: "LIVE" | "MOCK_DEV";
      provider: "OSRM" | "GOOGLE" | "MOCK";
      calculatedAt: string;
      distanceMeters: number;
      durationSeconds: number;
      encodedPolyline: string;
      decodedPath: Array<[number, number]>;
      alternatives: Array<{
        summary: string;
        distanceMeters: number;
        durationSeconds: number;
        encodedPolyline: string;
        decodedPath: Array<[number, number]>;
      }>;
      steps?: Array<{
        instruction: string;
        distanceMeters: number;
        durationSeconds: number;
      }>;
      warnings?: string[];
    }>("/api/routes/calculate", {
      method: "POST",
      body: JSON.stringify({ origin, destination, intermediates }),
    });
  }

  async getCampusHubs() {
    return this.request<{ hubs: any[] }>("/api/places/hubs");
  }

  // Audit Trails
  async getAuditLogs(limit = 40) {
    return this.request<{ logs: any[] }>(`/api/audit/logs?limit=${limit}`);
  }

  // Admin Telemetry, Operations & Pricing
  async getAdminOperations() {
    return this.request<{
      kpis: {
        totalRevenue: number;
        totalRides: number;
        co2SavedKg: number;
        ongoingRidesCount: number;
      };
      ongoingRides: any[];
      pricingConfig: {
        minPricePerSeat: number;
        basePrice: number;
        pricePerKm: number;
        localTransitComparison: string;
        updatedBy?: string;
        updatedAt?: string;
      };
    }>("/api/admin/operations");
  }

  async getAdminPricing() {
    return this.request<{
      minPricePerSeat: number;
      basePrice: number;
      pricePerKm: number;
      localTransitComparison: string;
      updatedBy?: string;
      updatedAt?: string;
    }>("/api/admin/pricing");
  }

  async updateAdminPricing(data: {
    minPricePerSeat: number;
    basePrice: number;
    pricePerKm: number;
    localTransitComparison?: string;
  }) {
    return this.request<any>("/api/admin/pricing", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
