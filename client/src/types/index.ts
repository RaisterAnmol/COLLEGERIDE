export interface IUserPreferences {
  womenOnlyDriver?: boolean;
  musicAllowed?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  college: string;
  year: number;
  department?: string;
  course?: string;
  semester?: number;
  phone?: string;
  avatarURL?: string;
  role?: 'student' | 'driver' | 'moderator' | 'campus_admin' | 'super_admin';
  accountType?: 'PASSENGER' | 'WOMEN_PASSENGER' | 'DRIVER' | 'ADMIN';
  institutionId?: string;
  studentId?: string;
  campusId?: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  enrolledIdCardUrl?: string;
  lastDailyIdCheckDate?: string;
  faceEnrollmentStatus?: 'NOT_STARTED' | 'PENDING' | 'ENROLLED' | 'DISABLED';
  faceVerificationEnabled?: boolean;
  rating: number;
  totalRides: number;
  gender?: 'male' | 'female' | 'other';
  preferences?: IUserPreferences;
  emergencyContact?: IEmergencyContact;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
    isVerified?: boolean;
  }>;
}

export interface IVehicle {
  _id: string;
  ownerUserId: string;
  type: 'car' | 'bike';
  model?: string;
  capacity: number;
  plateLast4: string;
}

export interface ILocation {
  text: string;
  lat: number;
  lng: number;
  coordinates?: [number, number];
}

export interface IMatchBreakdown {
  routeOverlap: number;
  timeMatch: number;
  pickupProximity: number;
  seatBonus: number;
  detourDistanceKm: number;
  pickupDistanceKm: number;
  driverDetourMinutes?: number;
  driverReliability?: number;
  academicTier?: 'course_semester' | 'department' | 'university' | 'none';
  academicBonus?: number;
  academicPriorityRank?: number;
  academicCompatibilityLabel?: string;
  sameCourseAndSemester?: boolean;
  sameDepartment?: boolean;
  sameCollege?: boolean;
}

export interface IMatchResult {
  isMatch: boolean;
  matchScore: number;
  percentage: number;
  disqualificationReason?: string;
  breakdown: IMatchBreakdown;
}

export interface IRide {
  _id: string;
  creator: IUser;
  origin: ILocation;
  destination: ILocation;
  departureTime: string;
  availableSeats: number;
  vehicleId?: IVehicle;
  status: 'active' | 'cancelled' | 'completed';
  match?: IMatchResult;
  routePolyline?: string;
  createdAt: string;
}

export interface IRideRequest {
  _id: string;
  rideId: IRide | string;
  passengerId: IUser;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}

export interface ITrip {
  _id: string;
  rideId: IRide | string;
  driverId: IUser;
  passengerIds: IUser[];
  startTime?: string;
  endTime?: string;
  distance: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  otp: string;
  routePolyline?: string;
  currentLocation?: {
    coordinates?: [number, number];
  };
  createdAt: string;
}

export interface IMessage {
  _id?: string;
  senderId: IUser | string;
  content: string;
  type?: string;
  createdAt: string;
  // Fallbacks for backwards compatibility
  text?: string;
  time?: string;
}

export interface IConversation {
  _id: string;
  rideId: string;
  participants: IUser[];
  messages: IMessage[];
  updatedAt: string;
}

export interface IReview {
  _id: string;
  tripId: string;
  fromUserId: IUser;
  toUserId: IUser;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IMobilityAnalytics {
  summary: {
    totalUsers: number;
    verifiedStudents: number;
    verificationRate: number;
    activeRides: number;
    completedTrips: number;
    totalKmShared: number;
    co2SavedKg: number;
  };
  peakHours: { hour: string; rides: number }[];
  popularRoutes: { route: string; count: number }[];
}
