export interface DemoStudent {
  id: string;
  name: string;
  college: string;
  collegeShort: string;
  department: string;
  batch: string;
  avatar: string;
  role: 'driver' | 'passenger' | 'anchor';
  rating: number;
  totalRides: number;
  punctualityRate: number;
  verifiedEdu: boolean;
  vehicle?: {
    model: string;
    number: string;
    type: 'car' | 'ev' | 'bike';
    color: string;
    seats: number;
  };
  commuteRoute: {
    origin: string;
    destination: string;
    departureTime: string;
    returnTime: string;
    detourMins: number;
    fare: number;
  };
  bio: string;
  quote: string;
}

export interface DemoCorridor {
  id: string;
  name: string;
  code: string;
  origin: string;
  destination: string;
  viaPoints: string[];
  distanceKm: number;
  avgDurationMins: number;
  activeCarsCount: number;
  fareEstimate: number;
  co2SavedKg: number;
  polyline: string; // SVG path
}

export interface DemoRideCard {
  id: string;
  driver: DemoStudent;
  departureTime: string;
  origin: string;
  destination: string;
  fare: number;
  availableSeats: number;
  genderPref: 'all' | 'women_only';
  status: 'active' | 'full' | 'departing';
  recurringDays: string[];
}

export const DEMO_STUDENTS: Record<string, DemoStudent> = {
  aditya: {
    id: 'usr_aditya_1',
    name: 'Aditya Kumar',
    college: 'Delhi Technological University (DTU)',
    collegeShort: 'DTU',
    department: 'B.Tech Mechanical Engineering',
    batch: 'Class of 2025',
    avatar: '/test_uploads/profile_photo.jpg',
    role: 'driver',
    rating: 4.8,
    totalRides: 48,
    punctualityRate: 98,
    verifiedEdu: true,
    vehicle: {
      model: 'Honda City i-VTEC',
      number: 'DL 8C AK 4920',
      type: 'car',
      color: 'White',
      seats: 4,
    },
    commuteRoute: {
      origin: 'Rohini Sector 14 (Near Metro)',
      destination: 'DTU Main Campus Gate 1',
      departureTime: '08:15 AM',
      returnTime: '05:30 PM',
      detourMins: 3,
      fare: 40,
    },
    bio: 'Mechanical senior commuting daily. Courteous driving, always play lo-fi morning tunes, no smoking.',
    quote: 'CampusRide eliminated my daily cab search. I travel with classmates from my own department and cover my fuel cost with zero hassle.',
  },
  ananya: {
    id: 'usr_ananya_2',
    name: 'Ananya Verma',
    college: 'Indira Gandhi Delhi Technical University (IGDTUW)',
    collegeShort: 'IGDTUW',
    department: 'B.Tech Computer Science & AI',
    batch: 'Class of 2024',
    avatar: '/test_uploads/profile_photo.jpg',
    role: 'anchor',
    rating: 4.9,
    totalRides: 62,
    punctualityRate: 100,
    verifiedEdu: true,
    vehicle: {
      model: 'Hyundai i20 Asta',
      number: 'DL 3C BV 8112',
      type: 'car',
      color: 'Titan Grey',
      seats: 3,
    },
    commuteRoute: {
      origin: 'Pitampura Metro Interchange',
      destination: 'IGDTUW / DTU Transit Corridor',
      departureTime: '08:30 AM',
      returnTime: '04:45 PM',
      detourMins: 2,
      fare: 35,
    },
    bio: 'Campus ride anchor. Verified female-only carpools on Tuesdays & Thursdays. Safe, punctual, clean vehicle.',
    quote: 'As a woman commuting across Delhi, safety is non-negotiable. Knowing every passenger has an authenticated university ID gives 100% peace of mind.',
  },
  rahul: {
    id: 'usr_rahul_3',
    name: 'Rahul Sharma',
    college: 'Delhi Technological University (DTU)',
    collegeShort: 'DTU',
    department: 'B.Tech Information Technology',
    batch: 'Class of 2026',
    avatar: '/test_uploads/profile_photo.jpg',
    role: 'passenger',
    rating: 4.9,
    totalRides: 28,
    punctualityRate: 99,
    verifiedEdu: true,
    commuteRoute: {
      origin: 'Janakpuri West District Centre',
      destination: 'DTU Campus Portico',
      departureTime: '08:20 AM',
      returnTime: '05:15 PM',
      detourMins: 4,
      fare: 45,
    },
    bio: 'IT sophomore. Punctual, respectful, splits fuel instantly.',
    quote: 'I used to take two crowded metro lines and an e-rickshaw every morning. Now I hop into a direct car with Aditya, pay ₹40, and reach 30 minutes earlier.',
  },
  priya: {
    id: 'usr_priya_4',
    name: 'Priya Singh',
    college: 'Delhi University North Campus (Hansraj College)',
    collegeShort: 'DU North',
    department: 'B.Sc Physics Honours',
    batch: 'Class of 2025',
    avatar: '/test_uploads/profile_photo.jpg',
    role: 'passenger',
    rating: 5.0,
    totalRides: 34,
    punctualityRate: 100,
    verifiedEdu: true,
    commuteRoute: {
      origin: 'Civil Lines Heritage Lane',
      destination: 'North Campus Faculty of Science',
      departureTime: '08:40 AM',
      returnTime: '04:30 PM',
      detourMins: 2,
      fare: 30,
    },
    bio: 'Physics researcher. Rides exclusively with verified university students. Women-only preference active.',
    quote: 'The 4-digit departure OTP and emergency SOS guarantee that informal hitchhiking never happens. It is a genuine institutional transport network.',
  },
  siddharth: {
    id: 'usr_siddharth_5',
    name: 'Siddharth Rao',
    college: 'Netaji Subhas University of Technology (NSUT)',
    collegeShort: 'NSUT',
    department: 'B.Tech Electrical Engineering',
    batch: 'Class of 2024',
    avatar: '/test_uploads/profile_photo.jpg',
    role: 'driver',
    rating: 4.8,
    totalRides: 39,
    punctualityRate: 97,
    verifiedEdu: true,
    vehicle: {
      model: 'Maruti Suzuki Baleno Alpha',
      number: 'DL 1Z SR 7721',
      type: 'car',
      color: 'Midnight Blue',
      seats: 3,
    },
    commuteRoute: {
      origin: 'Dwarka Sector 10 Metro',
      destination: 'NSUT Main Administration Block',
      departureTime: '08:15 AM',
      returnTime: '05:00 PM',
      detourMins: 3,
      fare: 40,
    },
    bio: 'Senior year electrical engineer. Regular commuter across West Delhi. Luggage space available.',
    quote: 'Instead of burning empty seats in traffic, I carpool with junior batchmates. We split toll and fuel transparently.',
  }
};

export const DEMO_CORRIDORS: DemoCorridor[] = [
  {
    id: 'corridor-north',
    name: 'North Campus Technological Artery',
    code: 'COR-01',
    origin: 'Rohini Sector 14 Metro',
    destination: 'DTU Main Campus Gate 1',
    viaPoints: ['Pitampura Metro', 'Outer Ring Junction', 'Shahbad Daulatpur'],
    distanceKm: 14.2,
    avgDurationMins: 28,
    activeCarsCount: 18,
    fareEstimate: 40,
    co2SavedKg: 148,
    polyline: 'M 50 140 C 220 80, 440 180, 720 120',
  },
  {
    id: 'corridor-west',
    name: 'West Delhi Metro Expressway',
    code: 'COR-02',
    origin: 'Janakpuri West Interchange',
    destination: 'NSUT & DTU Link Hub',
    viaPoints: ['Subhash Nagar', 'Punjabi Bagh Ring Road', 'Britannia Chowk'],
    distanceKm: 19.8,
    avgDurationMins: 36,
    activeCarsCount: 12,
    fareEstimate: 50,
    co2SavedKg: 210,
    polyline: 'M 60 380 C 280 340, 500 240, 720 120',
  },
  {
    id: 'corridor-east',
    name: 'Civil Lines Academic Transit',
    code: 'COR-03',
    origin: 'Civil Lines University Enclave',
    destination: 'DU North Campus / DTU Express',
    viaPoints: ['Mall Road', 'Vishwa Vidyalaya Metro', 'GTB Nagar'],
    distanceKm: 11.5,
    avgDurationMins: 22,
    activeCarsCount: 9,
    fareEstimate: 35,
    co2SavedKg: 95,
    polyline: 'M 820 420 C 760 320, 680 220, 720 120',
  }
];

export const DEMO_FEATURED_RIDES: DemoRideCard[] = [
  {
    id: 'ride-101',
    driver: DEMO_STUDENTS.aditya,
    departureTime: '08:15 AM',
    origin: 'Rohini Sector 14 Metro',
    destination: 'DTU Main Campus Gate 1',
    fare: 40,
    availableSeats: 2,
    genderPref: 'all',
    status: 'active',
    recurringDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  },
  {
    id: 'ride-102',
    driver: DEMO_STUDENTS.ananya,
    departureTime: '08:30 AM',
    origin: 'Pitampura Metro Interchange',
    destination: 'DTU North Campus Portico',
    fare: 35,
    availableSeats: 2,
    genderPref: 'women_only',
    status: 'active',
    recurringDays: ['TUE', 'THU'],
  },
  {
    id: 'ride-103',
    driver: DEMO_STUDENTS.siddharth,
    departureTime: '08:20 AM',
    origin: 'Janakpuri West Metro',
    destination: 'DTU Mechanical Dept Block',
    fare: 45,
    availableSeats: 3,
    genderPref: 'all',
    status: 'active',
    recurringDays: ['MON', 'WED', 'FRI'],
  },
];

export const DEMO_STATS = {
  verifiedStudents: 3842,
  dailyCorridors: 126,
  weeklyActiveRides: 248,
  totalCo2SavedKg: 14280,
  studentFuelSavedInr: 1840000,
  averageDetourMins: 3.2,
  safetyIncidentRate: 0.0,
};

export const DEMO_COLLEGES = [
  { name: 'Delhi Technological University (DTU)', activeStudents: 1480, hub: 'North Campus' },
  { name: 'Netaji Subhas University of Technology (NSUT)', activeStudents: 920, hub: 'West Hub' },
  { name: 'Indira Gandhi Delhi Tech University (IGDTUW)', activeStudents: 640, hub: 'Central Hub' },
  { name: 'Delhi University North Campus (Hansraj / SRCC / KMC)', activeStudents: 802, hub: 'Metro Ring' },
];

