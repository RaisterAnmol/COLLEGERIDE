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
    college: 'Uttaranchal University (UU)',
    collegeShort: 'UU',
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
      number: 'UK 07 AK 4920',
      type: 'car',
      color: 'White',
      seats: 4,
    },
    commuteRoute: {
      origin: 'Premnagar Chowk Market',
      destination: 'Campus Gate 1 (Uttaranchal University Main Entrance)',
      departureTime: '08:15 AM',
      returnTime: '05:30 PM',
      detourMins: 3,
      fare: 25,
    },
    bio: 'Mechanical senior commuting daily. Courteous driving, always play lo-fi morning tunes, no smoking.',
    quote: 'CampusRide eliminated my daily Vikram auto hassle. I travel with classmates from my own department and cover my fuel cost with zero hassle.',
  },
  ananya: {
    id: 'usr_ananya_2',
    name: 'Ananya Verma',
    college: 'Graphic Era University (GEU)',
    collegeShort: 'GEU',
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
      number: 'UK 07 BV 8112',
      type: 'car',
      color: 'Titan Grey',
      seats: 3,
    },
    commuteRoute: {
      origin: 'Selaqui Industrial Hub (Chakrata Road)',
      destination: 'Uttaranchal University / UIT Transit Corridor',
      departureTime: '08:30 AM',
      returnTime: '04:45 PM',
      detourMins: 2,
      fare: 35,
    },
    bio: 'Campus ride anchor. Verified female-only carpools on Tuesdays & Thursdays. Safe, punctual, clean vehicle.',
    quote: 'As a woman commuting across Dehradun, safety is non-negotiable. Knowing every passenger has an authenticated university ID gives 100% peace of mind.',
  },
  rahul: {
    id: 'usr_rahul_3',
    name: 'Rahul Sharma',
    college: 'Uttaranchal University (UU)',
    collegeShort: 'UU',
    department: 'B.Tech Information Technology',
    batch: 'Class of 2026',
    avatar: '/test_uploads/profile_photo.jpg',
    role: 'passenger',
    rating: 4.9,
    totalRides: 28,
    punctualityRate: 99,
    verifiedEdu: true,
    commuteRoute: {
      origin: 'Suddhowala Chowk (Student PG Hub)',
      destination: 'UIT Building Portico',
      departureTime: '08:20 AM',
      returnTime: '05:15 PM',
      detourMins: 4,
      fare: 25,
    },
    bio: 'IT sophomore. Punctual, respectful, splits fuel instantly.',
    quote: 'I used to wait for crowded Vikram autos and change tempos every morning. Now I hop into a direct car with Aditya, pay ₹25, and reach 25 minutes earlier.',
  },
  priya: {
    id: 'usr_priya_4',
    name: 'Priya Singh',
    college: 'Graphic Era Hill University (GEHU)',
    collegeShort: 'GEHU',
    department: 'B.Sc Physics Honours',
    batch: 'Class of 2025',
    avatar: '/test_uploads/profile_photo.jpg',
    role: 'passenger',
    rating: 5.0,
    totalRides: 34,
    punctualityRate: 100,
    verifiedEdu: true,
    commuteRoute: {
      origin: 'Ballupur Chowk (Chakrata Road)',
      destination: 'Uttaranchal University Campus Library',
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
    college: 'UPES (University of Petroleum and Energy Studies)',
    collegeShort: 'UPES',
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
      number: 'UK 07 SR 7721',
      type: 'car',
      color: 'Midnight Blue',
      seats: 3,
    },
    commuteRoute: {
      origin: 'Clock Tower (Ghanta Ghar / Paltan Bazaar)',
      destination: 'Uttaranchal University Administration Block',
      departureTime: '08:15 AM',
      returnTime: '05:00 PM',
      detourMins: 3,
      fare: 35,
    },
    bio: 'Senior year electrical engineer. Regular commuter across Premnagar and Selaqui corridors. Luggage space available.',
    quote: 'Instead of burning empty seats in traffic, I carpool with junior batchmates. We split toll and fuel transparently.',
  }
};

export const DEMO_CORRIDORS: DemoCorridor[] = [
  {
    id: 'corridor-selaqui',
    name: 'Selaqui Industrial Corridor (NH 72)',
    code: 'COR-01',
    origin: 'Selaqui Industrial & Institutional Hub',
    destination: 'Campus Gate 1 (Uttaranchal University Main Entrance)',
    viaPoints: ['Selaqui Pharma Hub', 'Suddhowala PG Hub', 'Arcadia Grant Blvd'],
    distanceKm: 11.5,
    avgDurationMins: 18,
    activeCarsCount: 16,
    fareEstimate: 40,
    co2SavedKg: 130,
    polyline: 'M 50 140 C 220 80, 440 180, 720 120',
  },
  {
    id: 'corridor-premnagar',
    name: 'Premnagar - Nanda Ki Chowki Bridge Artery',
    code: 'COR-02',
    origin: 'Premnagar Chowk Market',
    destination: 'Campus Gate 1 (Uttaranchal University Main Entrance)',
    viaPoints: ['Premnagar Market', 'Nanda Ki Chowki Bridge', 'Arcadia Grant Blvd'],
    distanceKm: 3.0,
    avgDurationMins: 6,
    activeCarsCount: 22,
    fareEstimate: 25,
    co2SavedKg: 75,
    polyline: 'M 60 380 C 280 340, 500 240, 720 120',
  },
  {
    id: 'corridor-city',
    name: 'Clock Tower & Ballupur City Artery',
    code: 'COR-03',
    origin: 'Clock Tower (Ghanta Ghar / Paltan Bazaar)',
    destination: 'Campus Gate 1 (Uttaranchal University Main Entrance)',
    viaPoints: ['Ballupur Flyover', 'Premnagar Market', 'Nanda Ki Chowki Bridge'],
    distanceKm: 10.8,
    avgDurationMins: 24,
    activeCarsCount: 14,
    fareEstimate: 50,
    co2SavedKg: 155,
    polyline: 'M 820 420 C 760 320, 680 220, 720 120',
  }
];

export const DEMO_FEATURED_RIDES: DemoRideCard[] = [
  {
    id: 'ride-101',
    driver: DEMO_STUDENTS.aditya,
    departureTime: '08:15 AM',
    origin: 'Selaqui Industrial & Institutional Hub',
    destination: 'Campus Gate 1 (Uttaranchal University Main Entrance)',
    fare: 40,
    availableSeats: 3,
    genderPref: 'all',
    status: 'active',
    recurringDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  },
  {
    id: 'ride-102',
    driver: DEMO_STUDENTS.ananya,
    departureTime: '08:30 AM',
    origin: 'Suddhowala Chowk (Student PG Hub)',
    destination: 'USCS Building (School of Computing Sciences)',
    fare: 25,
    availableSeats: 2,
    genderPref: 'women_only',
    status: 'active',
    recurringDays: ['TUE', 'THU'],
  },
  {
    id: 'ride-103',
    driver: DEMO_STUDENTS.siddharth,
    departureTime: '08:20 AM',
    origin: 'Premnagar Chowk Market',
    destination: 'UIT Building (Uttaranchal Institute of Technology)',
    fare: 25,
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
  { name: 'Uttaranchal University (UU)', activeStudents: 1850, hub: 'Premnagar Hub' },
  { name: 'Graphic Era University (GEU)', activeStudents: 1420, hub: 'Bell Road Hub' },
  { name: 'UPES Dehradun', activeStudents: 1180, hub: 'Bidholi / Kandoli Hub' },
  { name: 'DIT University Dehradun', activeStudents: 890, hub: 'Mussoorie Diversion Hub' },
];

