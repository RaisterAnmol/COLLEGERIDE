import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
import {
  User,
  Vehicle,
  Ride,
  Trip,
  Review,
  RideRequest,
  Conversation,
  Institution,
  Campus,
  PickupHub,
  Geofence,
  VerificationRequest,
  EmergencyIncident,
  Notification,
} from "./models";
import { connectDB, disconnectDB } from "./utils/db";

function makeHashedOtp(code: string) {
  const otpSalt = crypto.randomBytes(16).toString("hex");
  const otpHash = crypto
    .createHash("sha256")
    .update(code + otpSalt)
    .digest("hex");
  return {
    otp: code,
    otpHash,
    otpSalt,
    otpExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for demo data
    otpAttempts: 0,
    isLocked: false,
  };
}

export async function seedDemoData() {
  console.log("[Seed] Populating rich campus demo data across all entities...");

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Ride.deleteMany({}),
    RideRequest.deleteMany({}),
    Trip.deleteMany({}),
    Conversation.deleteMany({}),
    Review.deleteMany({}),
    Institution.deleteMany({}),
    Campus.deleteMany({}),
    PickupHub.deleteMany({}),
    Geofence.deleteMany({}),
    VerificationRequest.deleteMany({}),
    EmergencyIncident.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const DEFAULT_SEED_PASSWORD = process.env.DEMO_USER_PASSWORD || "CampusRide2025!";
  const passwordHash = await bcrypt.hash(DEFAULT_SEED_PASSWORD, 10);

  // ==========================================
  // 0. MULTI-INSTITUTION INFRASTRUCTURE
  // ==========================================
  const geuInstitution = await Institution.create({
    name: "Graphic Era University",
    code: "GEU",
    domain: "geu.ac.in",
    allowedDomains: ["geu.ac.in", "college.edu"],
    active: true,
  });

  const iitInstitution = await Institution.create({
    name: "UPES Dehradun",
    code: "UPES",
    domain: "upes.ac.in",
    allowedDomains: ["upes.ac.in", "college.edu"],
    active: true,
  });

  const geuCampus = await Campus.create({
    institutionId: geuInstitution._id,
    name: "Graphic Era Main Campus - Bell Road",
    code: "GEU-MAIN",
    location: {
      type: "Point",
      coordinates: [77.9947, 30.2687],
    },
    address: "566/6, Bell Road, Society Area, Clement Town, Dehradun 248002",
    active: true,
  });

  const hubGate1 = await PickupHub.create({
    institutionId: geuInstitution._id,
    campusId: geuCampus._id,
    name: "Graphic Era Main Gate 1 (Bell Road)",
    code: "GEU-GATE1",
    location: {
      type: "Point",
      coordinates: [77.9945, 30.2685],
    },
    address: "Main Entrance Gate 1, Bell Road, Clement Town, Dehradun",
    radiusMeters: 50,
    description: "Designated shelter with CCTV and 24/7 campus security booth",
    active: true,
  });

  const hubLibrary = await PickupHub.create({
    institutionId: geuInstitution._id,
    campusId: geuCampus._id,
    name: "Graphic Era Central Library Quad",
    code: "GEU-LIB",
    location: {
      type: "Point",
      coordinates: [77.9950, 30.2690],
    },
    address: "Knowledge Square, Central Campus Circle, Dehradun",
    radiusMeters: 40,
    description: "Well-lit passenger waiting area near CS & IT Block",
    active: true,
  });

  const hubHostel = await PickupHub.create({
    institutionId: geuInstitution._id,
    campusId: geuCampus._id,
    name: "Clement Town Transit Bay",
    code: "GEU-HOSTEL",
    location: {
      type: "Point",
      coordinates: [77.9955, 30.2695],
    },
    address: "Clement Town Student Residential Corridor, Dehradun",
    radiusMeters: 60,
    description: "Designated carpool bay with solar streetlighting",
    active: true,
  });

  const geuGeofence = await Geofence.create({
    institutionId: geuInstitution._id,
    campusId: geuCampus._id,
    name: "Graphic Era Perimeter Safe Zone",
    type: "campus_boundary",
    center: {
      latitude: 30.2687,
      longitude: 77.9947,
    },
    radiusMeters: 1800,
    active: true,
  });

  // ==========================================
  // 0.2 UTTARANCHAL UNIVERSITY CAMPUS & HUBS (Dehradun)
  // ==========================================
  const uuInstitution = await Institution.create({
    name: "Uttaranchal University",
    code: "UU",
    domain: "uuofficial.edu.in",
    allowedDomains: ["uuofficial.edu.in", "college.edu"],
    active: true,
  });

  const uuCampus = await Campus.create({
    institutionId: uuInstitution._id,
    name: "Main Campus - Arcadia Grant, Premnagar",
    code: "UU-MAIN",
    location: {
      type: "Point",
      coordinates: [77.9452, 30.3426],
    },
    address: "Arcadia Grant, P.O. Chandanwari, Premnagar, Dehradun 248007",
    active: true,
  });

  // Designated Uttaranchal University Campus Pickup Hubs
  const hubUit = await PickupHub.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "UIT Building (Uttaranchal Institute of Technology)",
    code: "UU-UIT",
    location: {
      type: "Point",
      coordinates: [77.9515, 30.3400],
    },
    address: "Engineering & Tech Block North Porch, Dehradun",
    radiusMeters: 50,
    description: "Designated carpool bay with EV charging, passenger bench, and 24/7 CCTV surveillance",
    active: true,
  });

  const hubUscs = await PickupHub.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "USCS Building (School of Computing Sciences)",
    code: "UU-USCS",
    location: {
      type: "Point",
      coordinates: [77.9456, 30.3428],
    },
    address: "Computing Sciences Quad Walkway, Dehradun",
    radiusMeters: 45,
    description: "Covered passenger waiting shelter with student safety help point and security post",
    active: true,
  });

  const hubBba = await PickupHub.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "BBA Building (Uttaranchal Institute of Management)",
    code: "UU-BBA",
    location: {
      type: "Point",
      coordinates: [77.9461, 30.3420],
    },
    address: "Management & Commerce Circle, Dehradun",
    radiusMeters: 40,
    description: "Well-lit carpool pickup circle with campus security desk and covered bus bay",
    active: true,
  });

  const hubLibraryUU = await PickupHub.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "Central Academic Library & Law Block",
    code: "UU-LIB",
    location: {
      type: "Point",
      coordinates: [77.9450, 30.3425],
    },
    address: "Knowledge Square, Central University Campus, Dehradun",
    radiusMeters: 40,
    description: "Pedestrian plaza waiting zone near Law College Dehradun (LCD)",
    active: true,
  });

  const hubGate1UU = await PickupHub.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "Campus Gate 1 (Main Entrance, Premnagar Road)",
    code: "UU-GATE1",
    location: {
      type: "Point",
      coordinates: [77.9440, 30.3415],
    },
    address: "Main Security Gate 1, Premnagar Road, Dehradun",
    radiusMeters: 60,
    description: "Main security checkpost with automated barrier, illuminated waiting bay, and CCTV",
    active: true,
  });

  // Regional Dehradun Corridor Hubs
  const hubPremnagar = await PickupHub.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "Premnagar Chowk Transit Bay",
    code: "PREMNAGAR",
    location: {
      type: "Point",
      coordinates: [77.9620, 30.3340],
    },
    address: "Premnagar Main Bazaar, Chakrata Road, Dehradun",
    radiusMeters: 75,
    description: "Major suburban carpool connection point for university students and faculty",
    active: true,
  });

  const hubSuddhowala = await PickupHub.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "Suddhowala Chowk (Student PG Hub)",
    code: "SUDDHOWALA",
    location: {
      type: "Point",
      coordinates: [77.9320, 30.3475],
    },
    address: "Suddhowala Junction, Chakrata Road, Dehradun",
    radiusMeters: 70,
    description: "Direct transit point connecting surrounding student hostels, cafes, and PGs",
    active: true,
  });

  const hubSelaqui = await PickupHub.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "Selaqui Industrial & Institutional Bay",
    code: "SELAQUI",
    location: {
      type: "Point",
      coordinates: [77.8540, 30.3685],
    },
    address: "Selaqui Industrial Hub, Chakrata Highway, Dehradun",
    radiusMeters: 80,
    description: "Western corridor commuter hub connecting industrial and college parks",
    active: true,
  });

  const uuGeofence = await Geofence.create({
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    name: "Uttaranchal University Premnagar Safe Zone",
    type: "campus_boundary",
    center: {
      latitude: 30.3426,
      longitude: 77.9452,
    },
    radiusMeters: 2200,
    active: true,
  });

  // ==========================================
  // 0.1 ADMINISTRATORS & MODERATORS
  // ==========================================
  const adminUser = await User.create({
    name: "Dean of Student Safety",
    email: "admin@campusride.edu",
    passwordHash,
    role: "campus_admin",
    accountType: "ADMIN",
    avatarURL: "/test_uploads/admin_nanami.jpg",
    enrolledIdCardUrl: "/test_uploads/admin_nanami.jpg",
    college: "Uttaranchal University",
    year: 5,
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    phone: "+91 99999 00001",
    verificationStatus: "verified",
    isEmailVerified: true,
    isPhoneVerified: true,
    rating: 5.0,
    totalRides: 0,
    reliabilityScore: 100,
  });

  const moderatorUser = await User.create({
    name: "Campus Security Desk Lead",
    email: "moderator@campusride.edu",
    passwordHash,
    role: "moderator",
    accountType: "ADMIN",
    avatarURL: "/test_uploads/driver_male_ichigo.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_male_ichigo_id.jpg",
    college: "Graphic Era University",
    year: 4,
    institutionId: geuInstitution._id,
    campusId: geuCampus._id,
    phone: "+91 99999 00002",
    verificationStatus: "verified",
    isEmailVerified: true,
    isPhoneVerified: true,
    rating: 5.0,
    totalRides: 0,
    reliabilityScore: 100,
  });

  // ==========================================
  // 1. UNIVERSITY STUDENTS & DRIVERS (Users)
  // ==========================================

  // 1. Aditya Kumar (Driver - Honda City)
  const aditya = await User.create({
    name: "Aditya Kumar",
    email: "aditya.kumar@college.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2022-004821",
    college: "Uttaranchal University",
    course: "B.Tech",
    department: "CSE",
    year: 3,
    semester: 5,
    phone: "+91 98765 43210",
    avatarURL: "/test_uploads/profile_photo.jpg",
    enrolledIdCardUrl: "/test_uploads/id_card.jpg",
    verificationStatus: "verified",
    rating: 4.8,
    totalRides: 16,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
    emergencyContact: {
      name: "Ramesh Kumar (Father)",
      phone: "+91 98111 22233",
      relation: "Father",
    },
  });

  // 2. Rahul Sharma (Passenger)
  const rahul = await User.create({
    name: "Rahul Sharma",
    email: "rahul.sharma@college.edu",
    passwordHash,
    role: "student",
    accountType: "PASSENGER",
    college: "Uttaranchal University",
    course: "B.Tech",
    department: "CSE",
    year: 3,
    semester: 5,
    phone: "+91 98765 11223",
    avatarURL: "/test_uploads/driver_male_ichigo.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_male_ichigo_id.jpg",
    verificationStatus: "verified",
    rating: 4.9,
    totalRides: 9,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: true,
    },
    emergencyContact: {
      name: "Sunita Sharma (Mother)",
      phone: "+91 98222 33344",
      relation: "Mother",
    },
  });

  // 3. Priya Singh (Passenger - Women-only preference)
  const priya = await User.create({
    name: "Priya Singh",
    email: "priya.singh@college.edu",
    passwordHash,
    role: "student",
    accountType: "WOMEN_PASSENGER",
    college: "Uttaranchal University",
    course: "B.Tech",
    department: "CSE",
    year: 2,
    semester: 3,
    phone: "+91 98765 99887",
    avatarURL: "/test_uploads/driver_female_mitsuha.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_mitsuha_id.jpg",
    verificationStatus: "verified",
    rating: 5.0,
    totalRides: 5,
    gender: "female",
    preferences: {
      womenOnlyDriver: true, // Filters male drivers
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
    emergencyContact: {
      name: "Dr. A.K. Singh (Father)",
      phone: "+91 98333 44455",
      relation: "Father",
    },
  });

  // 4. Ananya Verma (Driver - Hyundai i20 EV, Women-only)
  const ananya = await User.create({
    name: "Ananya Verma",
    email: "ananya.verma@college.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2023-009104",
    college: "Uttaranchal University",
    course: "MBA",
    department: "Management",
    year: 1,
    semester: 1,
    phone: "+91 98765 66778",
    avatarURL: "/test_uploads/driver_female_makima.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_makima_id.jpg",
    verificationStatus: "verified",
    rating: 4.9,
    totalRides: 21,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: true,
    },
    emergencyContact: {
      name: "Suman Verma (Mother)",
      phone: "+91 98444 55566",
      relation: "Mother",
    },
  });

  // 5. Rohan Mehta (Driver - Royal Enfield Himalayan)
  const rohan = await User.create({
    name: "Rohan Mehta",
    email: "rohan.mehta@college.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2021-003218",
    college: "Graphic Era University",
    course: "B.Tech",
    department: "CSE",
    year: 3,
    semester: 5,
    phone: "+91 98765 77889",
    avatarURL: "/test_uploads/driver_male_zoro.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_male_zoro_id.jpg",
    verificationStatus: "verified",
    rating: 4.7,
    totalRides: 14,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: false,
      smokingAllowed: false,
      petsAllowed: false,
    },
    emergencyContact: {
      name: "Rajesh Mehta (Uncle)",
      phone: "+91 98555 66677",
      relation: "Uncle",
    },
  });

  // 6. Sneha Patel (Passenger)
  const sneha = await User.create({
    name: "Sneha Patel",
    email: "sneha.patel@college.edu",
    passwordHash,
    role: "student",
    accountType: "PASSENGER",
    college: "Graphic Era University",
    course: "BCA",
    department: "Computer Applications",
    year: 2,
    semester: 3,
    phone: "+91 98765 22334",
    avatarURL: "/test_uploads/driver_female_mitsuha.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_mitsuha_id.jpg",
    verificationStatus: "verified",
    rating: 4.9,
    totalRides: 8,
    gender: "female",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
    emergencyContact: {
      name: "Manoj Patel (Father)",
      phone: "+91 98666 77788",
      relation: "Father",
    },
  });

  // 7. Vikram Malhotra (Driver - Maruti Baleno)
  const vikram = await User.create({
    name: "Vikram Malhotra",
    email: "vikram.malhotra@college.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2020-007752",
    college: "UPES",
    course: "B.Tech",
    department: "Mechanical",
    year: 4,
    semester: 7,
    phone: "+91 98765 33445",
    avatarURL: "/test_uploads/driver_male_ichigo.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_male_ichigo_id.jpg",
    verificationStatus: "verified",
    rating: 4.6,
    totalRides: 11,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
    emergencyContact: {
      name: "Alok Malhotra (Father)",
      phone: "+91 98777 88899",
      relation: "Father",
    },
  });

  // 8. Tanvi Sharma (Passenger)
  const tanvi = await User.create({
    name: "Tanvi Sharma",
    email: "tanvi.sharma@college.edu",
    passwordHash,
    role: "student",
    accountType: "PASSENGER",
    college: "UPES",
    course: "B.Tech",
    department: "ECE",
    year: 3,
    semester: 5,
    phone: "+91 98765 88990",
    avatarURL: "/test_uploads/driver_female_makima.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_makima_id.jpg",
    verificationStatus: "verified",
    rating: 5.0,
    totalRides: 6,
    gender: "female",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // 9. Kabir Sharma (Driver - Tata Nexon EV)
  const kabir = await User.create({
    name: "Kabir Sharma",
    email: "kabir.sharma@college.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2021-005019",
    college: "Uttaranchal University",
    course: "B.Tech",
    department: "Civil",
    year: 4,
    semester: 8,
    phone: "+91 98123 45678",
    avatarURL: "/test_uploads/driver_male_zoro.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_male_zoro_id.jpg",
    verificationStatus: "verified",
    rating: 4.95,
    totalRides: 28,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: true,
    },
    emergencyContact: {
      name: "Col. Sanjeev Sharma (Father)",
      phone: "+91 98111 55566",
      relation: "Father",
    },
  });

  // 10. Meera Nair (Driver - Kia Sonet)
  const meera = await User.create({
    name: "Meera Nair",
    email: "meera.nair@college.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2023-006640",
    college: "Graphic Era University",
    course: "B.Tech",
    department: "CSE",
    year: 3,
    semester: 5,
    phone: "+91 98234 56789",
    avatarURL: "/test_uploads/driver_female_mitsuha.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_mitsuha_id.jpg",
    verificationStatus: "verified",
    rating: 4.88,
    totalRides: 15,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // 11. Arjun Singh (Passenger - Pending Verification)
  const arjun = await User.create({
    name: "Arjun Singh",
    email: "arjun.singh@college.edu",
    passwordHash,
    role: "student",
    accountType: "PASSENGER",
    college: "Uttaranchal University",
    course: "BCA",
    department: "Computer Applications",
    year: 3,
    semester: 5,
    phone: "+91 98345 67890",
    avatarURL: "/test_uploads/profile_photo.jpg",
    enrolledIdCardUrl: "/test_uploads/id_card.jpg",
    verificationStatus: "pending",
    rating: 4.85,
    totalRides: 12,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // 12. Zoya Khan (Passenger - Rejected Verification for re-try)
  const zoya = await User.create({
    name: "Zoya Khan",
    email: "zoya.khan@college.edu",
    passwordHash,
    role: "student",
    accountType: "WOMEN_PASSENGER",
    college: "Graphic Era University",
    course: "BBA",
    department: "Management",
    year: 2,
    semester: 4,
    phone: "+91 98456 78901",
    avatarURL: "/test_uploads/driver_female_makima.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_makima_id.jpg",
    verificationStatus: "rejected",
    rating: 4.95,
    totalRides: 10,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // 13. Riya Rawat (Graphic Era University - Female Driver)
  const riya = await User.create({
    name: "Riya Rawat",
    email: "riya.rawat@geu.ac.in",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2022-001045",
    college: "Graphic Era University",
    department: "CSE",
    course: "B.Tech",
    year: 3,
    semester: 6,
    phone: "+91 98765 11001",
    avatarURL: "/test_uploads/driver_female_mitsuha.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_mitsuha_id.jpg",
    verificationStatus: "verified",
    rating: 4.9,
    totalRides: 31,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // 14. Pooja Negi (Graphic Era Hill University - Female Driver)
  const pooja = await User.create({
    name: "Pooja Negi",
    email: "pooja.negi@gehu.ac.in",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2023-002231",
    college: "Graphic Era Hill University",
    department: "Management",
    course: "MBA",
    year: 1,
    semester: 2,
    phone: "+91 98765 11002",
    avatarURL: "/test_uploads/driver_female_makima.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_makima_id.jpg",
    verificationStatus: "verified",
    rating: 4.85,
    totalRides: 19,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // 15. Kavita Joshi (UPES - Female Driver)
  const kavita = await User.create({
    name: "Kavita Joshi",
    email: "kavita.joshi@upes.ac.in",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2022-003341",
    college: "UPES (University of Petroleum and Energy Studies)",
    department: "School of Computer Science",
    course: "B.Tech",
    year: 4,
    semester: 7,
    phone: "+91 98765 11003",
    avatarURL: "/test_uploads/driver_female_makima.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_makima_id.jpg",
    verificationStatus: "verified",
    rating: 4.95,
    totalRides: 27,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // 16. Megha Chauhan (DIT University - Female Driver)
  const megha = await User.create({
    name: "Megha Chauhan",
    email: "megha.chauhan@dit.ac.in",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2023-004892",
    college: "DIT University",
    department: "Engineering",
    course: "B.Tech",
    year: 2,
    semester: 4,
    phone: "+91 98765 11004",
    avatarURL: "/test_uploads/driver_female_mitsuha.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_mitsuha_id.jpg",
    verificationStatus: "verified",
    rating: 4.8,
    totalRides: 16,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // 17. Aarav Bhatnagar (Graphic Era University - Driver)
  const aarav = await User.create({
    name: "Aarav Bhatnagar",
    email: "aarav.bhatnagar@geu.ac.in",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2021-009021",
    college: "Graphic Era University",
    department: "CSE",
    course: "B.Tech",
    year: 4,
    semester: 7,
    phone: "+91 98765 11005",
    avatarURL: "/test_uploads/driver_male_zoro.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_male_zoro_id.jpg",
    verificationStatus: "verified",
    rating: 4.9,
    totalRides: 22,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });


  // ==========================================
  // 1.1 CUSTOM BLEACH & DEMO DRIVERS & ADMINS
  // ==========================================

  // Ichigo Kurosaki (Male Driver 1 - Uttaranchal University)
  const ichigo = await User.create({
    name: "Ichigo Kurosaki",
    email: "ichigo.driver@uu.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2022-001524",
    college: "Uttaranchal University",
    department: "Computer Science & Engineering",
    course: "B.Tech - Computer Science & Engineering",
    year: 3,
    semester: 5,
    phone: "+91 98765 43211",
    avatarURL: "/test_uploads/driver_male_ichigo.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_male_ichigo_id.jpg",
    verificationStatus: "verified",
    isEmailVerified: true,
    isPhoneVerified: true,
    rating: 4.95,
    totalRides: 24,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
    emergencyContact: {
      name: "Isshin Kurosaki (Father)",
      phone: "+91 98111 99001",
      relation: "Father",
    },
  });

  // Makima San (Female Driver 1 - UPES)
  const makima = await User.create({
    name: "Makima San",
    email: "makima.driver@upes.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2023-009901",
    college: "University of Petroleum and Energy Studies (UPES)",
    department: "School of Computer Science",
    course: "B.Tech - Artificial Intelligence & Data Science",
    year: 4,
    semester: 7,
    phone: "+91 98765 43222",
    avatarURL: "/test_uploads/driver_female_makima.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_makima_id.jpg",
    verificationStatus: "verified",
    isEmailVerified: true,
    isPhoneVerified: true,
    rating: 5.0,
    totalRides: 38,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
    emergencyContact: {
      name: "Public Safety Division HQ",
      phone: "+91 98111 99002",
      relation: "Guardian",
    },
  });

  // Roronoa Zoro (Male Driver 2 - Graphic Era)
  const zoro = await User.create({
    name: "Roronoa Zoro",
    email: "zoro.driver@geu.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2021-003321",
    college: "Graphic Era University",
    department: "Mechanical Engineering",
    course: "B.Tech - Mechanical Engineering",
    year: 2,
    semester: 3,
    phone: "+91 98765 43233",
    avatarURL: "/test_uploads/driver_male_zoro.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_male_zoro_id.jpg",
    verificationStatus: "verified",
    isEmailVerified: true,
    isPhoneVerified: true,
    rating: 4.88,
    totalRides: 19,
    gender: "male",
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: true,
    },
    emergencyContact: {
      name: "Koushirou Sensei (Teacher)",
      phone: "+91 98111 99003",
      relation: "Teacher",
    },
  });

  // Mitsuha Miyamizu (Female Driver 2 - DIT University)
  const mitsuha = await User.create({
    name: "Mitsuha Miyamizu",
    email: "mitsuha.driver@dit.edu",
    passwordHash,
    role: "driver",
    accountType: "DRIVER",
    driverIdentifier: "UK-07-2023-008877",
    college: "DIT University",
    department: "Computer Applications",
    course: "BCA - Information Technology",
    year: 2,
    semester: 4,
    phone: "+91 98765 43244",
    avatarURL: "/test_uploads/driver_female_mitsuha.jpg",
    enrolledIdCardUrl: "/test_uploads/driver_female_mitsuha_id.jpg",
    verificationStatus: "verified",
    isEmailVerified: true,
    isPhoneVerified: true,
    rating: 4.92,
    totalRides: 15,
    gender: "female",
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
    emergencyContact: {
      name: "Toshiki Miyamizu (Father)",
      phone: "+91 98111 99004",
      relation: "Father",
    },
  });

  // Dean Kento Nanami (Admin Profile)
  const nanami = await User.create({
    name: "Dean Kento Nanami",
    email: "admin.nanami@uu.edu",
    passwordHash,
    role: "campus_admin",
    accountType: "ADMIN",
    college: "Uttaranchal University",
    department: "Campus Safety & Student Welfare Division",
    year: 5,
    phone: "+91 98765 43200",
    avatarURL: "/test_uploads/admin_nanami.jpg",
    enrolledIdCardUrl: "/test_uploads/admin_nanami.jpg",
    verificationStatus: "verified",
    isEmailVerified: true,
    isPhoneVerified: true,
    rating: 5.0,
    totalRides: 0,
    reliabilityScore: 100,
  });

  // ==========================================
  // 2. VEHICLES
  // ==========================================
  const adityaVehicle = await Vehicle.create({
    ownerUserId: aditya._id,
    type: "car",
    model: "Honda City i-VTEC (Silver)",
    capacity: 4,
    plateLast4: "4821",
  });

  const ananyaVehicle = await Vehicle.create({
    ownerUserId: ananya._id,
    type: "car",
    model: "Hyundai i20 Sportz (Polar White)",
    capacity: 4,
    plateLast4: "9104",
  });

  const rohanVehicle = await Vehicle.create({
    ownerUserId: rohan._id,
    type: "bike",
    model: "Royal Enfield Himalayan (Gravel Grey)",
    capacity: 1,
    plateLast4: "3218",
  });

  const vikramVehicle = await Vehicle.create({
    ownerUserId: vikram._id,
    type: "car",
    model: "Maruti Suzuki Baleno (Nexa Blue)",
    capacity: 4,
    plateLast4: "7752",
  });

  const kabirVehicle = await Vehicle.create({
    ownerUserId: kabir._id,
    type: "car",
    model: "Tata Nexon EV Max (Intensi Teal)",
    capacity: 4,
    plateLast4: "5019",
  });

  const meeraVehicle = await Vehicle.create({
    ownerUserId: meera._id,
    type: "car",
    model: "Kia Sonet Turbo (Gravity Grey)",
    capacity: 4,
    plateLast4: "6640",
  });

  const snehaVehicle = await Vehicle.create({
    ownerUserId: sneha._id,
    type: "car",
    model: "Maruti Suzuki Swift (Fire Red)",
    capacity: 4,
    plateLast4: "5512",
  });

  const tanviVehicle = await Vehicle.create({
    ownerUserId: tanvi._id,
    type: "car",
    model: "Tata Punch EV (Empowered Oxide)",
    capacity: 4,
    plateLast4: "8890",
  });

  const riyaVehicle = await Vehicle.create({
    ownerUserId: riya._id,
    type: "car",
    model: "Maruti Suzuki Baleno Alpha (Pearl White)",
    capacity: 4,
    plateLast4: "1045",
  });

  const poojaVehicle = await Vehicle.create({
    ownerUserId: pooja._id,
    type: "car",
    model: "Tata Punch EV (Teal Blue)",
    capacity: 4,
    plateLast4: "2198",
  });

  const kavitaVehicle = await Vehicle.create({
    ownerUserId: kavita._id,
    type: "car",
    model: "Honda Amaze VX (Urban Silver)",
    capacity: 4,
    plateLast4: "3341",
  });

  const meghaVehicle = await Vehicle.create({
    ownerUserId: megha._id,
    type: "car",
    model: "Hyundai Venue SX (Denim Blue)",
    capacity: 4,
    plateLast4: "4892",
  });

  const aaravVehicle = await Vehicle.create({
    ownerUserId: aarav._id,
    type: "car",
    model: "Hyundai Creta SX (Phantom Black)",
    capacity: 4,
    plateLast4: "9021",
  });


  const ichigoVehicle = await Vehicle.create({
    ownerUserId: ichigo._id,
    type: "car",
    model: "Hyundai Creta SX (Petrol)",
    capacity: 4,
    plateLast4: "1524",
  });

  const makimaVehicle = await Vehicle.create({
    ownerUserId: makima._id,
    type: "car",
    model: "Tata Nexon EV Max",
    capacity: 4,
    plateLast4: "9901",
  });

  const zoroVehicle = await Vehicle.create({
    ownerUserId: zoro._id,
    type: "car",
    model: "Tata Harrier Dark Edition",
    capacity: 4,
    plateLast4: "3321",
  });

  const mitsuhaVehicle = await Vehicle.create({
    ownerUserId: mitsuha._id,
    type: "car",
    model: "Maruti Suzuki Swift ZXi",
    capacity: 4,
    plateLast4: "8877",
  });

  // ==========================================
  // 3. ACTIVE COMMUTE RIDES
  // ==========================================
  const now = new Date();

  // Ichigo's UU Campus Express (Clock Tower -> UIT Building)
  await Ride.create({
    creator: ichigo._id,
    origin: {
      text: "Clock Tower, Dehradun",
      lat: 30.3256,
      lng: 78.0437,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: new Date(now.getTime() + 1.5 * 60 * 60 * 1000),
    availableSeats: 3,
    vehicleId: ichigoVehicle._id,
    status: "active",
    costShare: 45,
  });

  // Ichigo's Campus Route (UIT Building -> Premnagar Chowk Market)
  await Ride.create({
    creator: ichigo._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    departureTime: new Date(now.getTime() + 5.5 * 60 * 60 * 1000),
    availableSeats: 3,
    vehicleId: ichigoVehicle._id,
    status: "active",
    costShare: 30,
  });

  // Makima's UPES Express (ISBT Dehradun -> UPES Bidholi) - Women-Friendly
  await Ride.create({
    creator: makima._id,
    origin: {
      text: "ISBT Dehradun, Haridwar Bypass",
      lat: 30.2882,
      lng: 78.0076,
    },
    destination: {
      text: "UPES Bidholi Campus, Energy Acres",
      lat: 30.4158,
      lng: 77.9664,
    },
    departureTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    availableSeats: 3,
    vehicleId: makimaVehicle._id,
    status: "active",
    costShare: 95,
  });

  // Makima's Campus Route (UIT Building -> Premnagar Chowk Market) - Women-Friendly
  await Ride.create({
    creator: makima._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    departureTime: new Date(now.getTime() + 6.2 * 60 * 60 * 1000),
    availableSeats: 3,
    vehicleId: makimaVehicle._id,
    status: "active",
    costShare: 30,
  });

  // Zoro's GEU Route (Rispana Bridge -> Graphic Era Clement Town)
  await Ride.create({
    creator: zoro._id,
    origin: {
      text: "Rispana Bridge, Haridwar Road",
      lat: 30.3015,
      lng: 78.0512,
    },
    destination: {
      text: "Graphic Era University, Clement Town",
      lat: 30.2687,
      lng: 78.0078,
    },
    departureTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
    availableSeats: 3,
    vehicleId: zoroVehicle._id,
    status: "active",
    costShare: 35,
  });

  // Mitsuha's DIT Route (Rajpur Road Jakhan -> DIT University) - Women-Friendly
  await Ride.create({
    creator: mitsuha._id,
    origin: {
      text: "Rajpur Road, Jakhan",
      lat: 30.3642,
      lng: 78.0701,
    },
    destination: {
      text: "DIT University, Mussoorie Diversion Road",
      lat: 30.3835,
      lng: 78.0784,
    },
    departureTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    availableSeats: 3,
    vehicleId: mitsuhaVehicle._id,
    status: "active",
    costShare: 30,
  });


  // Ride 1: Aditya's Morning Express Commute (Premnagar Chowk -> UIT Building)
  const adityaDepTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const adityaRide = await Ride.create({
    creator: aditya._id,
    origin: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: adityaDepTime,
    availableSeats: 3,
    vehicleId: adityaVehicle._id,
    status: "active",
  });

  // Ride 1b: Aditya's Evening Return Route (UIT Building -> Premnagar Chowk)
  const adityaReturnDepTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const adityaReturnRide = await Ride.create({
    creator: aditya._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    departureTime: adityaReturnDepTime,
    availableSeats: 2, // 1 seat reserved by Rahul
    vehicleId: adityaVehicle._id,
    status: "active",
  });

  // Ride 2: Ananya's Women-Friendly Route (Selaqui Hub -> USCS Building)
  const ananyaDepTime = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);
  const ananyaRide = await Ride.create({
    creator: ananya._id,
    origin: {
      text: "Selaqui Industrial Hub (Chakrata Road)",
      lat: 30.3685,
      lng: 77.8540,
    },
    destination: {
      text: "USCS Building (School of Computing Sciences)",
      lat: 30.3428,
      lng: 77.9456,
    },
    departureTime: ananyaDepTime,
    availableSeats: 2,
    vehicleId: ananyaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "09:00",
    },
  });

  // Ride 3: Rohan's Student Hostel Bike Commute (Suddhowala -> Selaqui Tech Corridor)
  const rohanDepTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const rohanRide = await Ride.create({
    creator: rohan._id,
    origin: {
      text: "Suddhowala Student Hostel Corridor",
      lat: 30.3475,
      lng: 77.9320,
    },
    destination: {
      text: "Selaqui Pharma & Tech Corridor",
      lat: 30.3685,
      lng: 77.8540,
    },
    departureTime: rohanDepTime,
    availableSeats: 1,
    vehicleId: rohanVehicle._id,
    status: "active",
  });

  // Ride 4: Vikram's Central Station Route (Campus Gate 1 -> Dehradun Railway Station)
  const vikramDepTime = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const vikramRide = await Ride.create({
    creator: vikram._id,
    origin: {
      text: "Campus Gate 1 (Main Entrance, Premnagar Road)",
      lat: 30.3415,
      lng: 77.9440,
    },
    destination: {
      text: "Dehradun Railway Station",
      lat: 30.3165,
      lng: 78.0322,
    },
    departureTime: vikramDepTime,
    availableSeats: 3,
    vehicleId: vikramVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "17:30",
    },
  });

  // Ride 5: Kabir's Green EV Commute (ISBT Dehradun -> Clock Tower Paltan Bazaar)
  const kabirDepTime = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
  const kabirRide = await Ride.create({
    creator: kabir._id,
    origin: {
      text: "ISBT Dehradun Inter-State Terminal",
      lat: 30.2885,
      lng: 78.0080,
    },
    destination: {
      text: "Clock Tower (Ghanta Ghar / Paltan Bazaar)",
      lat: 30.3256,
      lng: 78.0437,
    },
    departureTime: kabirDepTime,
    availableSeats: 3,
    vehicleId: kabirVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:30",
    },
  });

  // Ride 6: Meera's Women-Only Commute (Ballupur Chowk -> Central Academic Library)
  const meeraDepTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const meeraRide = await Ride.create({
    creator: meera._id,
    origin: {
      text: "Ballupur Chowk (Chakrata Road)",
      lat: 30.3395,
      lng: 78.0125,
    },
    destination: {
      text: "Central Academic Library & Law Block",
      lat: 30.3425,
      lng: 77.9450,
    },
    departureTime: meeraDepTime,
    availableSeats: 3,
    vehicleId: meeraVehicle._id,
    status: "active",
  });

  // Ride 7: Aditya's Vikasnagar Commute (Vikasnagar Bus Terminal -> Campus Gate 1)
  const tomorrowMorning = new Date(now);
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(8, 0, 0, 0);
  const airportRide = await Ride.create({
    creator: aditya._id,
    origin: {
      text: "Vikasnagar Bus Terminal",
      lat: 30.4350,
      lng: 77.7710,
    },
    destination: {
      text: "Campus Gate 1 (Main Entrance, Premnagar Road)",
      lat: 30.3415,
      lng: 77.9440,
    },
    departureTime: tomorrowMorning,
    availableSeats: 2,
    vehicleId: adityaVehicle._id,
    status: "active",
  });

  // ==========================================
  // 3.1 DEHRADUN & CAMPUS HUBS ACTIVE COMMUTE RIDES
  // ==========================================

  // Ride 8: Aditya's Morning Dehradun Commute (Premnagar Chowk -> UIT Building)
  const dehradunDepTime1 = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const premnagarToUitRide = await Ride.create({
    creator: aditya._id,
    origin: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: dehradunDepTime1,
    availableSeats: 3,
    vehicleId: adityaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:45",
    },
  });

  // Ride 9: Ananya's Campus Shuttle (Selaqui Industrial Hub -> USCS Building)
  const dehradunDepTime2 = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
  const selaquiToUscsRide = await Ride.create({
    creator: ananya._id,
    origin: {
      text: "Selaqui Industrial & Institutional Hub",
      lat: 30.3685,
      lng: 77.8540,
    },
    destination: {
      text: "USCS Building (School of Computing Sciences)",
      lat: 30.3428,
      lng: 77.9456,
    },
    departureTime: dehradunDepTime2,
    availableSeats: 3,
    vehicleId: ananyaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "09:15",
    },
  });

  // Ride 10: Rohan's Student Express (Suddhowala Chowk -> BBA Building)
  const dehradunDepTime3 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const suddhowalaToBbaRide = await Ride.create({
    creator: rohan._id,
    origin: {
      text: "Suddhowala Chowk (Student PG Hub)",
      lat: 30.3475,
      lng: 77.9320,
    },
    destination: {
      text: "BBA Building (Uttaranchal Institute of Management)",
      lat: 30.3420,
      lng: 77.9461,
    },
    departureTime: dehradunDepTime3,
    availableSeats: 1,
    vehicleId: rohanVehicle._id,
    status: "active",
  });

  // Ride 11: Vikram's West Corridor Route (Vikasnagar Bus Terminal -> UIT Building)
  const dehradunDepTime4 = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);
  const vikasnagarToUitRide = await Ride.create({
    creator: vikram._id,
    origin: {
      text: "Vikasnagar Bus Terminal",
      lat: 30.4350,
      lng: 77.7710,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: dehradunDepTime4,
    availableSeats: 3,
    vehicleId: vikramVehicle._id,
    status: "active",
  });

  // Ride 12: Kabir's Inter-City Highway Express (ISBT Dehradun -> Campus Gate 1)
  const dehradunDepTime5 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const isbtToUuGateRide = await Ride.create({
    creator: kabir._id,
    origin: {
      text: "ISBT Dehradun (Inter-State Bus Terminal)",
      lat: 30.2885,
      lng: 78.0080,
    },
    destination: {
      text: "Campus Gate 1 (Main Entrance, Premnagar Road)",
      lat: 30.3415,
      lng: 77.9440,
    },
    departureTime: dehradunDepTime5,
    availableSeats: 3,
    vehicleId: kabirVehicle._id,
    status: "active",
  });

  // Ride 13: Meera's Evening Return Commute (Central Library -> Clock Tower Paltan Bazaar)
  const dehradunDepTime6 = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const libraryToClockTowerRide = await Ride.create({
    creator: meera._id,
    origin: {
      text: "Central Academic Library & Law Block",
      lat: 30.3425,
      lng: 77.9450,
    },
    destination: {
      text: "Clock Tower (Ghanta Ghar / Paltan Bazaar)",
      lat: 30.3256,
      lng: 78.0437,
    },
    departureTime: dehradunDepTime6,
    availableSeats: 3,
    vehicleId: meeraVehicle._id,
    status: "active",
  });

  // Ride 14: Ananya's Campus Shuttle (UIT Building -> USCS Building) - Women-Friendly Intra-Campus Ride
  const ananyaUitToUscsRide = await Ride.create({
    creator: ananya._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "USCS Building (School of Computing Sciences)",
      lat: 30.3428,
      lng: 77.9456,
    },
    departureTime: new Date(now.getTime() + 1 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 15,
    vehicleId: ananyaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:30",
    },
  });

  // Ride 15: Meera's PG Hub Express (Suddhowala Chowk -> UIT Building) - Women-Friendly
  const meeraSuddhowalaToUitRide = await Ride.create({
    creator: meera._id,
    origin: {
      text: "Suddhowala Chowk (Student PG Hub)",
      lat: 30.3475,
      lng: 77.9320,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: new Date(now.getTime() + 1.2 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 20,
    vehicleId: meeraVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:45",
    },
  });

  // Ride 16: Sneha's City Connect (Ballupur Chowk -> Campus Gate 1) - Women-Friendly
  const snehaBallupurToGate1Ride = await Ride.create({
    creator: sneha._id,
    origin: {
      text: "Ballupur Chowk (City Entrance)",
      lat: 30.3395,
      lng: 78.0125,
    },
    destination: {
      text: "Campus Gate 1 (Main Entrance, Premnagar Road)",
      lat: 30.3415,
      lng: 77.9440,
    },
    departureTime: new Date(now.getTime() + 1.4 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 35,
    vehicleId: snehaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:15",
    },
  });

  // Ride 17: Ananya's Clock Tower Commute (Clock Tower -> USCS Building) - Women-Friendly
  const ananyaClockTowerToUscsRide = await Ride.create({
    creator: ananya._id,
    origin: {
      text: "Clock Tower (Ghanta Ghar / Paltan Bazaar)",
      lat: 30.3256,
      lng: 78.0437,
    },
    destination: {
      text: "USCS Building (School of Computing Sciences)",
      lat: 30.3428,
      lng: 77.9456,
    },
    departureTime: new Date(now.getTime() + 1.6 * 60 * 60 * 1000),
    availableSeats: 2,
    pricePerSeat: 45,
    vehicleId: ananyaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:20",
    },
  });

  // Ride 18: Tanvi's Management Shuttle (Premnagar Chowk -> BBA Building) - Women-Friendly
  const tanviPremnagarToBbaRide = await Ride.create({
    creator: tanvi._id,
    origin: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    destination: {
      text: "BBA Building (Uttaranchal Institute of Management)",
      lat: 30.3420,
      lng: 77.9461,
    },
    departureTime: new Date(now.getTime() + 1.8 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 20,
    vehicleId: tanviVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:50",
    },
  });

  // Ride 19: Meera's Intra-Campus Research Shuttle (UIT Building -> Central Academic Library) - Women-Friendly
  const meeraUitToLibRide = await Ride.create({
    creator: meera._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Central Academic Library & Law Block",
      lat: 30.3425,
      lng: 77.9450,
    },
    departureTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 15,
    vehicleId: meeraVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "09:30",
    },
  });

  // Ride 20: Aditya's Campus Intra-Connector (UIT Building -> USCS Building)
  const adityaUitToUscsRide = await Ride.create({
    creator: aditya._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "USCS Building (School of Computing Sciences)",
      lat: 30.3428,
      lng: 77.9456,
    },
    departureTime: new Date(now.getTime() + 2.2 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 15,
    vehicleId: adityaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "09:00",
    },
  });

  // Ride 21: Rohan's Student Corridor (Premnagar Chowk -> USCS Building)
  const rohanPremnagarToUscsRide = await Ride.create({
    creator: rohan._id,
    origin: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    destination: {
      text: "USCS Building (School of Computing Sciences)",
      lat: 30.3428,
      lng: 77.9456,
    },
    departureTime: new Date(now.getTime() + 2.4 * 60 * 60 * 1000),
    availableSeats: 1,
    pricePerSeat: 20,
    vehicleId: rohanVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "09:10",
    },
  });

  // Ride 22: Aditya's East Corridor Express (Ballupur Chowk -> UIT Building)
  const adityaBallupurToUitRide = await Ride.create({
    creator: aditya._id,
    origin: {
      text: "Ballupur Chowk (City Entrance)",
      lat: 30.3395,
      lng: 78.0125,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: new Date(now.getTime() + 2.6 * 60 * 60 * 1000),
    availableSeats: 2,
    pricePerSeat: 40,
    vehicleId: adityaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:10",
    },
  });

  // Ride 23: Kabir's City Center Link (Clock Tower -> UIT Building)
  const kabirClockTowerToUitRide = await Ride.create({
    creator: kabir._id,
    origin: {
      text: "Clock Tower (Ghanta Ghar / Paltan Bazaar)",
      lat: 30.3256,
      lng: 78.0437,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: new Date(now.getTime() + 2.8 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 50,
    vehicleId: kabirVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:00",
    },
  });

  // Ride 24: Aditya's Terminal Express (ISBT Dehradun -> Campus Gate 1)
  const adityaIsbtToGate1Ride = await Ride.create({
    creator: aditya._id,
    origin: {
      text: "ISBT Dehradun (Inter-State Bus Terminal)",
      lat: 30.2885,
      lng: 78.0080,
    },
    destination: {
      text: "Campus Gate 1 (Main Entrance, Premnagar Road)",
      lat: 30.3415,
      lng: 77.9440,
    },
    departureTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 55,
    vehicleId: adityaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "07:45",
    },
  });

  // Ride 25: Vikram's Industrial Route (Selaqui Hub -> UIT Building)
  const vikramSelaquiToUitRide = await Ride.create({
    creator: vikram._id,
    origin: {
      text: "Selaqui Industrial & Institutional Hub",
      lat: 30.3685,
      lng: 77.8540,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: new Date(now.getTime() + 3.2 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 35,
    vehicleId: vikramVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:30",
    },
  });

  // Ride 26: Tanvi's Transit Link (ISBT Dehradun -> BBA Building) - Women-Friendly
  const tanviIsbtToBbaRide = await Ride.create({
    creator: tanvi._id,
    origin: {
      text: "ISBT Dehradun (Inter-State Bus Terminal)",
      lat: 30.2885,
      lng: 78.0080,
    },
    destination: {
      text: "BBA Building (Uttaranchal Institute of Management)",
      lat: 30.3420,
      lng: 77.9461,
    },
    departureTime: new Date(now.getTime() + 3.4 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 55,
    vehicleId: tanviVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:00",
    },
  });

  // Ride 27: Sneha's Evening Campus Ride (UIT Building -> Clock Tower) - Women-Friendly
  const snehaUitToClockTowerRide = await Ride.create({
    creator: sneha._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Clock Tower (Ghanta Ghar / Paltan Bazaar)",
      lat: 30.3256,
      lng: 78.0437,
    },
    departureTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 45,
    vehicleId: snehaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "17:15",
    },
  });

  // Ride 28: Ananya's Main Route (Premnagar Chowk -> UIT Building) - Women-Friendly
  const ananyaPremnagarToUitRide = await Ride.create({
    creator: ananya._id,
    origin: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: new Date(now.getTime() + 1.1 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 20,
    vehicleId: ananyaVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:15",
    },
  });

  // Ride 29: Aditya's Evening Campus Return (UIT Building -> Premnagar Chowk Market)
  // TOP CLASSMATE MATCH for Rahul & Priya returning to Premnagar
  const adityaUitToPremnagarRide = await Ride.create({
    creator: aditya._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    departureTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 20,
    vehicleId: adityaVehicle._id,
    status: "active",
    recurring: true,
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "17:15",
    },
  });

  // Ride 30: Ananya's Women-Friendly Return (UIT Building -> Premnagar Chowk Market)
  const ananyaUitToPremnagarRide = await Ride.create({
    creator: ananya._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    departureTime: new Date(now.getTime() + 2.7 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 20,
    vehicleId: ananyaVehicle._id,
    status: "active",
    recurring: true,
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
    },
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "17:30",
    },
  });

  // Ride 31: Sneha's PG Return Shuttle (UIT Building -> Premnagar Chowk Market) - Women-Friendly
  const snehaUitToPremnagarRide = await Ride.create({
    creator: sneha._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    departureTime: new Date(now.getTime() + 3.0 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 20,
    vehicleId: snehaVehicle._id,
    status: "active",
    recurring: true,
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
    },
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "17:00",
    },
  });

  // Ride 32: Rohan's PG Express (UIT Building -> Suddhowala Chowk)
  const rohanUitToSuddhowalaRide = await Ride.create({
    creator: rohan._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Suddhowala Chowk (Student PG Hub)",
      lat: 30.3475,
      lng: 77.9320,
    },
    departureTime: new Date(now.getTime() + 2.8 * 60 * 60 * 1000),
    availableSeats: 1,
    pricePerSeat: 15,
    vehicleId: rohanVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "16:45",
    },
  });

  // Ride 33: Vikram's West Highway Return (UIT Building -> Selaqui Industrial & Institutional Hub)
  const vikramUitToSelaquiRide = await Ride.create({
    creator: vikram._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Selaqui Industrial & Institutional Hub",
      lat: 30.3685,
      lng: 77.8540,
    },
    departureTime: new Date(now.getTime() + 3.5 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 35,
    vehicleId: vikramVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "17:45",
    },
  });

  // Ride 34: Tanvi's Return Route (BBA Building -> Premnagar Chowk Market) - Women-Friendly
  const tanviBbaToPremnagarRide = await Ride.create({
    creator: tanvi._id,
    origin: {
      text: "BBA Building (Uttaranchal Institute of Management)",
      lat: 30.3420,
      lng: 77.9461,
    },
    destination: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    departureTime: new Date(now.getTime() + 2.9 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 20,
    vehicleId: tanviVehicle._id,
    status: "active",
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "16:30",
    },
  });



  // Ride 34d: Tanvi Sharma (UIT Building -> Premnagar Chowk Market) - UPES Female Driver
  const tanviUitToPremnagarRide = await Ride.create({
    creator: tanvi._id,
    origin: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    destination: {
      text: "Premnagar Chowk Market",
      lat: 30.3340,
      lng: 77.9620,
    },
    departureTime: new Date(now.getTime() + 4.0 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 15,
    vehicleId: tanviVehicle._id,
    status: "active",
    recurring: true,
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
    },
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "17:00",
    },
  });

  // Ride 35: Riya Rawat (Selaqui Hub -> ISBT Dehradun) - Graphic Era University Female Driver
  const riyaSelaquiToIsbt = await Ride.create({
    creator: riya._id,
    origin: {
      text: "Selaqui Industrial & Institutional Hub",
      lat: 30.3685,
      lng: 77.8540,
    },
    destination: {
      text: "ISBT Dehradun (Inter-State Bus Terminal)",
      lat: 30.2868,
      lng: 78.0081,
    },
    departureTime: new Date(now.getTime() + 1.5 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 40,
    vehicleId: riyaVehicle._id,
    status: "active",
    recurring: true,
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:15",
    },
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // Ride 36: Pooja Negi (Selaqui Hub -> ISBT Dehradun) - Graphic Era Hill University Female Driver
  const poojaSelaquiToIsbt = await Ride.create({
    creator: pooja._id,
    origin: {
      text: "Selaqui Industrial & Institutional Hub",
      lat: 30.3685,
      lng: 77.8540,
    },
    destination: {
      text: "ISBT Dehradun (Inter-State Bus Terminal)",
      lat: 30.2868,
      lng: 78.0081,
    },
    departureTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 45,
    vehicleId: poojaVehicle._id,
    status: "active",
    recurring: true,
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:45",
    },
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // Ride 37: Aarav Bhatnagar (Selaqui Hub -> ISBT Dehradun) - Graphic Era University Driver
  const aaravSelaquiToIsbt = await Ride.create({
    creator: aarav._id,
    origin: {
      text: "Selaqui Industrial & Institutional Hub",
      lat: 30.3685,
      lng: 77.8540,
    },
    destination: {
      text: "ISBT Dehradun (Inter-State Bus Terminal)",
      lat: 30.2868,
      lng: 78.0081,
    },
    departureTime: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 40,
    vehicleId: aaravVehicle._id,
    status: "active",
    recurring: true,
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "09:00",
    },
    preferences: {
      womenOnlyDriver: false,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // Ride 38: Kavita Joshi (ISBT Dehradun -> Selaqui Hub) - UPES Female Driver
  const kavitaIsbtToSelaqui = await Ride.create({
    creator: kavita._id,
    origin: {
      text: "ISBT Dehradun (Inter-State Bus Terminal)",
      lat: 30.2868,
      lng: 78.0081,
    },
    destination: {
      text: "Selaqui Industrial & Institutional Hub",
      lat: 30.3685,
      lng: 77.8540,
    },
    departureTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    availableSeats: 3,
    pricePerSeat: 45,
    vehicleId: kavitaVehicle._id,
    status: "active",
    recurring: true,
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "17:15",
    },
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // Ride 39: Megha Chauhan (Selaqui Hub -> UIT Building) - DIT Female Driver
  const meghaSelaquiToUit = await Ride.create({
    creator: megha._id,
    origin: {
      text: "Selaqui Industrial & Institutional Hub",
      lat: 30.3685,
      lng: 77.8540,
    },
    destination: {
      text: "UIT Building (Uttaranchal Institute of Technology)",
      lat: 30.3400,
      lng: 77.9515,
    },
    departureTime: new Date(now.getTime() + 1.2 * 60 * 60 * 1000),
    availableSeats: 4,
    pricePerSeat: 30,
    vehicleId: meghaVehicle._id,
    status: "active",
    recurring: true,
    recurringSchedule: {
      daysOfWeek: [1, 2, 3, 4, 5],
      time: "08:00",
    },
    preferences: {
      womenOnlyDriver: true,
      musicAllowed: true,
      smokingAllowed: false,
      petsAllowed: false,
    },
  });

  // ==========================================
  // 4. RIDE REQUESTS (Incoming & Bookings)
  // ==========================================

  // Request 1: Rahul requested and was accepted on Aditya's return ride (Trip is scheduled with live QR/OTP!)
  const rahulAdityaReq = await RideRequest.create({
    rideId: adityaReturnRide._id,
    passengerId: rahul._id,
    status: "accepted",
    requestedAt: new Date(now.getTime() - 45 * 60 * 1000),
  });

  // Request 2: Priya requested and was accepted on Ananya's women-friendly ride
  const priyaAnanyaReq = await RideRequest.create({
    rideId: ananyaRide._id,
    passengerId: priya._id,
    status: "accepted",
    requestedAt: new Date(now.getTime() - 40 * 60 * 1000),
  });

  // Request 3: Tanvi requested a seat on Aditya's ride (Pending review)
  const tanviAdityaReq = await RideRequest.create({
    rideId: adityaRide._id,
    passengerId: tanvi._id,
    status: "pending",
    requestedAt: new Date(now.getTime() - 10 * 60 * 1000),
  });

  // Request 4: Sneha requested a seat on Vikram's evening ride (Pending)
  const snehaVikramReq = await RideRequest.create({
    rideId: vikramRide._id,
    passengerId: sneha._id,
    status: "pending",
    requestedAt: new Date(now.getTime() - 15 * 60 * 1000),
  });

  // Request 5: Arjun requested and was accepted on Kabir's EV ride
  const arjunKabirReq = await RideRequest.create({
    rideId: kabirRide._id,
    passengerId: arjun._id,
    status: "accepted",
    requestedAt: new Date(now.getTime() - 30 * 60 * 1000),
  });

  // Request 6: Zoya requested a seat on Meera's ride (Pending)
  const zoyaMeeraReq = await RideRequest.create({
    rideId: meeraRide._id,
    passengerId: zoya._id,
    status: "pending",
    requestedAt: new Date(now.getTime() - 5 * 60 * 1000),
  });

  // ==========================================
  // 5. IN-APP CONVERSATIONS & CHAT HISTORIES
  // ==========================================

  // Conversation 1a: Aditya & Rahul's Evening Return Commute Chat
  await Conversation.create({
    rideId: adityaReturnRide._id,
    participants: [aditya._id, rahul._id],
    messages: [
      {
        senderId: aditya._id,
        text: "Hey Rahul! Departing from Premnagar Chowk back towards campus at scheduled time.",
        time: new Date(now.getTime() - 25 * 60 * 1000),
      },
      {
        senderId: rahul._id,
        text: "Great! I'm standing right near the Premnagar Chowk Bus Bay in a blue hoodie.",
        time: new Date(now.getTime() - 20 * 60 * 1000),
      },
      {
        senderId: aditya._id,
        text: "Got it. Silver Honda City (plate 4821). I'll have the pickup QR code ready on my screen.",
        time: new Date(now.getTime() - 15 * 60 * 1000),
      },
      {
        senderId: rahul._id,
        text: "Perfect, I'll scan your QR as soon as I hop in!",
        time: new Date(now.getTime() - 12 * 60 * 1000),
      },
    ],
  });

  // Conversation 1b: Aditya's Morning Ride Discussion
  await Conversation.create({
    rideId: adityaRide._id,
    participants: [aditya._id, tanvi._id],
    messages: [
      {
        senderId: tanvi._id,
        text: "Hi Aditya, just requested a seat on your morning ride if you still have room!",
        time: new Date(now.getTime() - 8 * 60 * 1000),
      },
      {
        senderId: aditya._id,
        text: "Hi Tanvi, yes plenty of seats available. Let me review and accept!",
        time: new Date(now.getTime() - 5 * 60 * 1000),
      },
    ],
  });

  // Conversation 2: Ananya & Priya's Women-Only Commute Chat
  await Conversation.create({
    rideId: ananyaRide._id,
    participants: [ananya._id, priya._id],
    messages: [
      {
        senderId: ananya._id,
        text: "Hi Priya! Glad to connect on CampusRide. Will pick you up right at Gate 1 portico.",
        time: new Date(now.getTime() - 35 * 60 * 1000),
      },
      {
        senderId: priya._id,
        text: "Thanks so much Ananya! Really appreciate the verified women-only carpool option.",
        time: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        senderId: ananya._id,
        text: "Anytime! Safe campus commutes for all of us. See you in the white i20.",
        time: new Date(now.getTime() - 25 * 60 * 1000),
      },
    ],
  });

  // Conversation 3: Kabir & Arjun's EV Ride Chat
  await Conversation.create({
    rideId: kabirRide._id,
    participants: [kabir._id, arjun._id],
    messages: [
      {
        senderId: kabir._id,
        text: "Hey Arjun, heading out from Clock Tower Paltan Bazaar. Tata Nexon EV ready to roll.",
        time: new Date(now.getTime() - 20 * 60 * 1000),
      },
      {
        senderId: arjun._id,
        text: "Super clean! I'll be at the flyover bus stop in 5 minutes.",
        time: new Date(now.getTime() - 15 * 60 * 1000),
      },
    ],
  });

  // ==========================================
  // 6. LIVE & COMPLETED TRIPS (With Working QR/OTPs)
  // ==========================================

  // Trip 1: ADITYA (Driver) + RAHUL (Passenger) SCHEDULED TRIP FOR INSTANT QR TESTING!
  // Both driver and passenger can test QR scanning and verification right now!
  const adityaRahulTrip = await Trip.create({
    rideId: adityaReturnRide._id,
    driverId: aditya._id,
    passengerIds: [rahul._id],
    startTime: new Date(now.getTime() + 10 * 60 * 1000),
    distance: 14.2,
    status: "scheduled",
    ...makeHashedOtp("482109"),
  });

  // Trip 2: ANANYA & PRIYA LIVE in-progress trip with OTP!
  const ananyaPriyaTrip = await Trip.create({
    rideId: ananyaRide._id,
    driverId: ananya._id,
    passengerIds: [priya._id],
    startTime: new Date(now.getTime() - 10 * 60 * 1000),
    distance: 12.8,
    status: "in_progress",
    ...makeHashedOtp("681245"),
  });

  // Trip 3: KABIR & ARJUN SCHEDULED TRIP
  const kabirArjunTrip = await Trip.create({
    rideId: kabirRide._id,
    driverId: kabir._id,
    passengerIds: [arjun._id],
    startTime: new Date(now.getTime() + 25 * 60 * 1000),
    distance: 16.5,
    status: "scheduled",
    ...makeHashedOtp("719302"),
  });

  // Trip 4: Aditya & Rahul completed trip (Yesterday)
  const trip4 = await Trip.create({
    rideId: adityaReturnRide._id,
    driverId: aditya._id,
    passengerIds: [rahul._id],
    startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 23.3 * 60 * 60 * 1000),
    distance: 14.5,
    status: "completed",
    ...makeHashedOtp("429183"),
  });

  // Trip 5: Vikram & Sneha completed trip (2 days ago)
  const trip5 = await Trip.create({
    rideId: vikramRide._id,
    driverId: vikram._id,
    passengerIds: [sneha._id],
    startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 47.4 * 60 * 60 * 1000),
    distance: 15.2,
    status: "completed",
    ...makeHashedOtp("731920"),
  });

  // Trip 6: Rohan & Rahul completed bike trip (3 days ago)
  const trip6 = await Trip.create({
    rideId: rohanRide._id,
    driverId: rohan._id,
    passengerIds: [rahul._id],
    startTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 71.5 * 60 * 60 * 1000),
    distance: 18.2,
    status: "completed",
    ...makeHashedOtp("895412"),
  });

  // Trip 7: Aditya & Tanvi completed trip (4 days ago)
  const trip7 = await Trip.create({
    rideId: airportRide._id,
    driverId: aditya._id,
    passengerIds: [tanvi._id],
    startTime: new Date(now.getTime() - 96 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 95.2 * 60 * 60 * 1000),
    distance: 16.0,
    status: "completed",
    ...makeHashedOtp("314567"),
  });

  // ==========================================
  // 7. VERIFIED STUDENT REVIEWS & RATINGS
  // ==========================================
  await Review.create([
    {
      tripId: trip4._id,
      fromUserId: rahul._id,
      toUserId: aditya._id,
      rating: 5,
      role: 'driver',
      tags: ['Safe & Smooth Driving 🚗', 'Punctual Arrival ⏱️', 'Clean Vehicle ✨'],
      comment:
        "Super punctual! Silver Honda City was very clean and great AC on a hot commute.",
      createdAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
    },
    {
      tripId: trip4._id,
      fromUserId: aditya._id,
      toUserId: rahul._id,
      rating: 5,
      role: 'passenger',
      tags: ['Ready at Pickup Bay ⏱️', 'Respectful & Polite 🙌', 'Great Classmate 👍'],
      comment:
        "Rahul was right on time at Gate 1 ATM. Great classmate to carpool with!",
      createdAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
    },
    {
      tripId: trip5._id,
      fromUserId: sneha._id,
      toUserId: vikram._id,
      rating: 5,
      role: 'driver',
      tags: ['Safe & Smooth Driving 🚗', 'Careful Hill Driving 🏔️', 'Fair Cost Split 💳'],
      comment:
        "Smooth and careful driving to the Central Station. Saved me from heavy auto rickshaw surge!",
      createdAt: new Date(now.getTime() - 47 * 60 * 60 * 1000),
    },
    {
      tripId: trip6._id,
      fromUserId: rahul._id,
      toUserId: rohan._id,
      rating: 5,
      role: 'driver',
      tags: ['Safe & Smooth Driving 🚗', 'Punctual Arrival ⏱️', 'Courteous & Friendly 😊'],
      comment:
        "Rohan gave an extra helmet and drove super safely on the highway. Quick bike commute!",
      createdAt: new Date(now.getTime() - 71 * 60 * 60 * 1000),
    },
    {
      tripId: trip7._id,
      fromUserId: tanvi._id,
      toUserId: aditya._id,
      rating: 5,
      role: 'driver',
      tags: ['Great Conversation 💬', 'Punctual Arrival ⏱️', 'Clean Vehicle ✨'],
      comment:
        "Airport pickup was flawless. Shared great tips for 1st-year engineering classes!",
      createdAt: new Date(now.getTime() - 95 * 60 * 60 * 1000),
    },
    {
      tripId: ananyaPriyaTrip._id,
      fromUserId: priya._id,
      toUserId: ananya._id,
      rating: 5,
      role: 'driver',
      tags: ['Safe & Smooth Driving 🚗', 'Clean Vehicle ✨', 'Courteous & Friendly 😊'],
      comment:
        "Best carpool experience ever! Loved the women-only verified safety and quiet EV ride.",
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
  ]);

  // ==========================================
  // 6. VERIFICATION REQUESTS (Admin Review Queue)
  // ==========================================
  await VerificationRequest.create([
    {
      userId: arjun._id,
      institutionId: uuInstitution._id,
      campusId: uuCampus._id,
      accountType: "PASSENGER",
      role: "student",
      studentIdentifier: "2023UU-CS-104",
      documentType: "student_id",
      idDocumentStorageKey: "sample_student_id.png",
      selfieStorageKey: "sample_selfie.png",
      documentMimeType: "image/png",
      documentSizeBytes: 420000,
      status: "pending",
      submittedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      userId: aditya._id,
      institutionId: uuInstitution._id,
      campusId: uuCampus._id,
      accountType: "DRIVER",
      role: "driver",
      studentIdentifier: "2022UU-ME-019",
      driverIdentifier: "UK-07-2022-004821",
      documentType: "driving_license",
      idDocumentStorageKey: "sample_student_id.png",
      drivingLicenseStorageKey: "sample_license.png",
      selfieStorageKey: "sample_selfie.png",
      documentMimeType: "image/png",
      documentSizeBytes: 380000,
      status: "approved",
      reviewedBy: adminUser._id,
      reviewedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      submittedAt: new Date(now.getTime() - 50 * 60 * 60 * 1000),
    },
    {
      userId: zoya._id,
      institutionId: geuInstitution._id,
      campusId: geuCampus._id,
      accountType: "WOMEN_PASSENGER",
      role: "student",
      studentIdentifier: "2024GEU-EE-082",
      documentType: "student_id",
      idDocumentStorageKey: "sample_student_id.png",
      selfieStorageKey: "sample_selfie.png",
      documentMimeType: "image/jpeg",
      documentSizeBytes: 180000,
      status: "rejected",
      rejectionReason:
        "ID photo was blurry. Please re-upload with clear name and roll number.",
      reviewedBy: adminUser._id,
      reviewedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      submittedAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
    },
  ]);

  // ==========================================
  // 7. ACTIVE EMERGENCY INCIDENT (SOC Live Alert)
  // ==========================================
  await EmergencyIncident.create({
    incidentNumber: `INC-${now.toISOString().slice(0, 10).replace(/-/g, "")}-7K2L`,
    triggeredBy: rahul._id,
    tripId: adityaRahulTrip._id,
    institutionId: uuInstitution._id,
    campusId: uuCampus._id,
    location: {
      latitude: 30.3426,
      longitude: 77.9452,
      accuracy: 12,
      address: "Near Gate 1 Roundabout, Premnagar Road",
    },
    status: "ACTIVE",
    campusSecurityNotified: true,
    emergencyContactsNotified: [
      {
        name: "Suresh Sharma (Father)",
        phone: "+91 98111 22233",
        relationship: "Father",
        dispatchStatus: "MOCK_DEV_DISPATCHED",
        sentAt: now,
      },
    ],
    securityNotes:
      "Student pressed in-ride emergency button. Control room dispatch initiated.",
  });

  // ==========================================
  // 8. PERSISTENT NOTIFICATIONS
  // ==========================================
  await Notification.create([
    {
      userId: rahul._id,
      type: "TRIP_UPDATE",
      title: "Ride Confirmed with Aditya",
      body: "Your ride from Premnagar Chowk Market to UIT Campus is scheduled for 8:45 AM. Your pickup OTP will be verified by Aditya at boarding.",
      deliveryChannels: ["in_app", "socket"],
      deliveryStatus: { in_app: "sent" },
    },
    {
      userId: aditya._id,
      type: "VERIFICATION_STATUS",
      title: "Vehicle & Student ID Approved",
      body: "Your Uttaranchal University Student ID and Honda City documents have been verified by Campus Administration.",
      deliveryChannels: ["in_app", "socket"],
      deliveryStatus: { in_app: "sent" },
    },
  ]);

  console.log("[Seed] Demo database fully hydrated with:");
  console.log("  - 12 Verified University Students across 4 institutions");
  console.log("  - 2 Campus Security & Administrative accounts");
  console.log(
    "  - 3 Universities (UU, GEU, UPES) with 2 Campuses, 11 Pickup Hubs, and 2 Geofences",
  );
  console.log("  - 6 Registered Vehicles (Sedans, EVs, Bikes)");
  console.log("  - 13 Active Campus Commute Offers (including Premnagar, Selaqui, Suddhowala, Vikasnagar & Campus Buildings)");
  console.log("  - 6 Ride Requests (Pending & Accepted)");
  console.log("  - 3 Real-Time Group Conversations with chat history");
  console.log("  - 7 Trips (Live Scheduled & In-Progress with QR/OTPs, plus Completed)");
  console.log("  - 6 Peer Reviews with 5-star ratings & feedback");
  console.log("  - 3 Verification Requests (Pending, Approved, Rejected)");
  console.log(
    "  - 1 Active Security Incident with Emergency Contact dispatches",
  );

  return {
    aditya,
    rahul,
    priya,
    ananya,
    rohan,
    sneha,
    vikram,
    tanvi,
    kabir,
    meera,
    arjun,
    zoya,
    adityaRide,
    adityaReturnRide,
    ananyaRide,
    rohanRide,
    vikramRide,
    kabirRide,
    meeraRide,
    premnagarToUitRide,
    selaquiToUscsRide,
    suddhowalaToBbaRide,
    vikasnagarToUitRide,
    isbtToUuGateRide,
    libraryToClockTowerRide,
    uuInstitution,
    uuCampus,
    hubUit,
    hubUscs,
    hubBba,
    hubGate1UU,
    hubPremnagar,
    hubSuddhowala,
    hubSelaqui,
    adityaRahulTrip,
    ananyaPriyaTrip,
  };
}

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDemoData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error("[Seed] Error during seeding:", err);
      process.exit(1);
    }
  })();
}
