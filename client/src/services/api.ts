const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1" ||
   window.location.hostname.startsWith("192.168.") ||
   window.location.hostname.startsWith("10.") ||
   window.location.hostname.startsWith("172."));

const rawApiUrl = import.meta.env.VITE_API_URL;
const isLocalhostUrl = Boolean(rawApiUrl && (rawApiUrl.includes("localhost") || rawApiUrl.includes("127.0.0.1")));

const API_BASE =
  (rawApiUrl && (!isLocalhostUrl || isLocal))
    ? rawApiUrl
    : (isLocal ? `${window.location.protocol}//${window.location.hostname}:5000` : "");

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

  async googleLogin(credential: string, accountType?: string) {
    return this.request<{ token: string; refreshToken?: string; user: any }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential, accountType }),
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

  async verifyEmail(token: string) {
    return this.request<{ message: string; isEmailVerified: boolean; accountStatus?: string }>(
      "/api/auth/email/verify",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      }
    );
  }

  async sendEmailVerification() {
    return this.request<{ message: string; devVerificationToken?: string }>(
      "/api/auth/email/send-verification",
      {
        method: "POST",
      }
    );
  }

  async devVerifyEmail(email?: string, userId?: string) {
    return this.request<{ message: string; isEmailVerified: boolean; user?: any }>(
      "/api/auth/dev-verify-email",
      {
        method: "POST",
        body: JSON.stringify({ email, userId }),
      }
    );
  }

  async sendPhoneOtp(phone: string) {
    return this.request<{
      message: string;
      dispatchMode: string;
      expiresInSeconds: number;
      devOtpHint?: string;
    }>("/api/auth/phone/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  async verifyPhoneOtp(otp: string) {
    return this.request<{
      message: string;
      isPhoneVerified: boolean;
    }>("/api/auth/phone/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  }

  async sendRegistrationPhoneOtp(phone: string) {
    return this.request<{
      success: boolean;
      message: string;
      formattedPhone: string;
      dispatchMode: string;
      expiresInSeconds: number;
      devOtpHint?: string;
    }>("/api/auth/phone/send-registration-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  async verifyRegistrationPhoneOtp(phone: string, otp: string) {
    return this.request<{
      success: boolean;
      message: string;
      formattedPhone: string;
      phoneVerificationToken: string;
      isPhoneVerified: boolean;
    }>("/api/auth/phone/verify-registration-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    });
  }

  async getMe() {
    return this.request<{ user: any; vehicle?: any }>("/api/auth/me");
  }

  async updateProfile(data: {
    name?: string;
    college?: string;
    department?: string;
    course?: string;
    year?: number;
    semester?: number;
    phone?: string;
    upiId?: string;
    accountType?: string;
    vehicle?: any;
    avatarURL?: string;
    facePhoto?: string;
    faceEmbedding?: number[];
    enrolledIdCardUrl?: string;
  }) {
    return this.request<{ success: boolean; message: string; user: any }>(
      "/api/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
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

  async cancelTrip(tripId: string, reason?: string) {
    return this.request<any>(`/api/trips/${tripId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled", reason }),
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
      body: JSON.stringify({ text, content: text }),
    });
  }

  // Reviews
  async submitReview(data: {
    tripId: string;
    toUserId: string;
    rating: number;
    comment?: string;
    role?: "driver" | "passenger";
    tags?: string[];
  }) {
    return this.request<any>("/api/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserReviews(userId: string, role?: "driver" | "passenger") {
    const qs = role ? `?role=${role}` : "";
    return this.request<any[]>(`/api/users/${userId}/reviews${qs}`);
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
    phone?: string;
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

  async resolveMyEmergencyIncidents() {
    return this.request<{ message: string; modifiedCount: number }>("/api/emergency/incidents/resolve-mine", {
      method: "POST",
    });
  }

  // Student & Institutional Verification
  async getNotifications() {
    return this.request<{ notifications: any[]; unreadCount: number }>("/api/notifications");
  }

  async markNotificationRead(id: string) {
    return this.request<{ notification: any }>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean; message: string }>("/api/notifications/mark-all-read", {
      method: "PATCH",
    });
  }

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
      noRouteFound?: boolean;
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

  async recordDailyDriverLiveness(data: { photo?: string; descriptor?: number[] } = {}) {
    return this.request<{
      success: boolean;
      verifiedDate: string;
      message: string;
    }>("/api/face/daily-liveness", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAdminUsers(role?: string, status?: string, search?: string) {
    const params = new URLSearchParams();
    if (role && role !== "all") params.set("role", role);
    if (status && status !== "all") params.set("status", status);
    if (search) params.set("search", search);
    const qs = params.toString();
    return this.request<{ users: any[] }>(`/api/admin/users${qs ? `?${qs}` : ""}`);
  }

  async adminVerifyUser(userId: string) {
    return this.request<{ message: string; user: any }>(`/api/admin/users/${userId}/verify`, {
      method: "PATCH",
    });
  }
}

export const api = new ApiService();
