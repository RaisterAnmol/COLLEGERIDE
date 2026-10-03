import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { IRide } from '../types';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import {
  Search,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Star,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Car,
  GraduationCap,
  BookOpen,
  School,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Map,
} from 'lucide-react';
import { PickupAndRouteNavigationMap } from '../components/map/PickupAndRouteNavigationMap';
import { PageHeroBanner } from '../components/common/PageHeroBanner';
import findRideImg from '../assets/illustrations/find-ride.jpg';
import { UTTARAKHAND_UNIVERSITIES } from '../data/csvDataLoader';
import { sanitizeLocationText } from '../utils/sanitizeLocation';
import RideRequestSuccessModal from '../components/RideRequestSuccessModal';

export interface PresetLocation {
  text: string;
  lat: number;
  lng: number;
  category: 'Campus Buildings' | 'Dehradun & Surrounding';
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  // Dehradun - Uttaranchal University Campus Buildings
  { text: 'UIT Building (Uttaranchal Institute of Technology)', lat: 30.3400, lng: 77.9515, category: 'Campus Buildings' },
  { text: 'USCS Building (School of Computing Sciences)', lat: 30.3395, lng: 77.9518, category: 'Campus Buildings' },
  { text: 'BBA Building (Uttaranchal Institute of Management)', lat: 30.3392, lng: 77.9520, category: 'Campus Buildings' },
  { text: 'Central Academic Library & Law Block', lat: 30.3396, lng: 77.9517, category: 'Campus Buildings' },
  { text: 'Campus Gate 1 (Uttaranchal University Main Entrance)', lat: 30.3400, lng: 77.9515, category: 'Campus Buildings' },

  // Dehradun Regional Transit & Student Hubs
  { text: 'Premnagar Chowk Market', lat: 30.3340, lng: 77.9620, category: 'Dehradun & Surrounding' },
  { text: 'Suddhowala Chowk (Student PG Hub)', lat: 30.3475, lng: 77.9320, category: 'Dehradun & Surrounding' },
  { text: 'Selaqui Industrial & Institutional Hub', lat: 30.3685, lng: 77.8540, category: 'Dehradun & Surrounding' },
  { text: 'Vikasnagar Bus Terminal', lat: 30.4350, lng: 77.7710, category: 'Dehradun & Surrounding' },
  { text: 'ISBT Dehradun (Inter-State Bus Terminal)', lat: 30.2885, lng: 78.0080, category: 'Dehradun & Surrounding' },
  { text: 'Ballupur Chowk (City Entrance)', lat: 30.3395, lng: 78.0125, category: 'Dehradun & Surrounding' },
  { text: 'Clock Tower (Ghanta Ghar / Paltan Bazaar)', lat: 30.3256, lng: 78.0437, category: 'Dehradun & Surrounding' },
];

export function findPresetIndex(paramText: string | null | undefined, defaultIdx: number): number {
  if (!paramText) return defaultIdx;
  const lower = paramText.toLowerCase().trim();

  // 1. Direct or strong substring match
  const directIdx = PRESET_LOCATIONS.findIndex(
    (p) => p.text.toLowerCase().includes(lower) || lower.includes(p.text.toLowerCase())
  );
  if (directIdx !== -1) return directIdx;

  // 2. Specific geographic keywords (Campus takes absolute precedence before regional city terms)
  if (lower.includes('uit') || lower.includes('tech')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('UIT Building'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('uscs') || lower.includes('computing') || lower.includes('cs')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('USCS Building'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('bba') || lower.includes('management') || lower.includes('uim') || lower.includes('mba')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('BBA Building'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('library') || lower.includes('law')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('Central Academic Library'));
    if (idx !== -1) return idx;
  }
  if (
    lower.includes('gate 1') ||
    lower.includes('gate-1') ||
    lower.includes('gate1') ||
    lower.includes('main gate') ||
    lower.includes('campus gate') ||
    lower.includes('uttaranchal') ||
    lower.includes('university') ||
    lower.includes('campus') ||
    /\buu\b/.test(lower)
  ) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('Campus Gate 1'));
    if (idx !== -1) return idx;
  }

  // 3. Dehradun regional student & transit hubs
  if (lower.includes('selaqui') || lower.includes('selaquie') || lower.includes('pharma')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('Selaqui'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('suddhowala') || lower.includes('sudhowala')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('Suddhowala'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('premnagar') || lower.includes('prem nagar')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('Premnagar'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('ballupur')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('Ballupur'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('clock tower') || lower.includes('ghanta ghar') || lower.includes('paltan')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('Clock Tower'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('vikasnagar')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('Vikasnagar'));
    if (idx !== -1) return idx;
  }
  if (lower.includes('isbt')) {
    const idx = PRESET_LOCATIONS.findIndex((p) => p.text.includes('ISBT'));
    if (idx !== -1) return idx;
  }

  return defaultIdx;
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const UNIVERSITIES = [
  'Any',
  ...UTTARAKHAND_UNIVERSITIES.map((u) => u.name),
];

const COURSES = [
  'Any',
  'B.Tech',
  'BCA',
  'MBA',
  'BBA',
  'MCA',
];

const DEPARTMENTS = [
  'Any',
  'CSE',
  'ECE',
  'Mechanical',
  'Civil',
  'Management',
  'Computer Applications',
];

const YEARS = ['Any', '1', '2', '3', '4'];
const SEMESTERS = ['Any', '1', '2', '3', '4', '5', '6', '7', '8'];

export const SearchRidesPage: React.FC = () => {
  const { user, activePersona } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialFromParam = searchParams.get('from');
  const initialToParam = searchParams.get('to');
  const initialDateParam = searchParams.get('date');
  const initialSeatsParam = searchParams.get('seats');

  // Basic Route State (initialized dynamically from URL searchParams)
  const [originIndex, setOriginIndex] = useState(() =>
    findPresetIndex(initialFromParam, 0)
  );
  const [destIndex, setDestIndex] = useState(() =>
    findPresetIndex(initialToParam, initialFromParam ? (findPresetIndex(initialFromParam, 0) === 4 ? 5 : 4) : 5)
  );
  const [date, setDate] = useState(() => initialDateParam || new Date().toISOString().slice(0, 10));
  const [seats, setSeats] = useState(() => (initialSeatsParam ? Math.max(1, Number(initialSeatsParam)) : 1));
  const [womenOnlyDriver, setWomenOnlyDriver] = useState(() => !!user?.preferences?.womenOnlyDriver);

  // Sync state whenever URL query params change
  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const dateParam = searchParams.get('date');
    const seatsParam = searchParams.get('seats');

    if (fromParam !== null) {
      setOriginIndex(findPresetIndex(fromParam, 0));
    }
    if (toParam !== null) {
      setDestIndex(findPresetIndex(toParam, 4));
    }
    if (dateParam) {
      setDate(dateParam);
    }
    if (seatsParam) {
      setSeats(Math.max(1, Number(seatsParam)));
    }
  }, [searchParams]);

  // Academic Hierarchical Filters (Optional / 'Any' supported)
  const [college, setCollege] = useState('Any');
  const [department, setDepartment] = useState('Any');
  const [course, setCourse] = useState('Any');
  const [year, setYear] = useState('Any');
  const [semester, setSemester] = useState('Any');

  // Quick Affinity Toggles
  const [sameCourseSemOnly, setSameCourseSemOnly] = useState(false);
  const [sameDepartmentOnly, setSameDepartmentOnly] = useState(false);
  const [sameCollegeOnly, setSameCollegeOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // UI state
  const [showAcademicFilters, setShowAcademicFilters] = useState(true);
  const [showOverviewMap, setShowOverviewMap] = useState(true);
  const [expandedMapRideId, setExpandedMapRideId] = useState<string | null>(null);

  const [rides, setRides] = useState<IRide[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRideName, setSuccessRideName] = useState('');

  // Track seat requests to immediately and persistently display "Request Sent"
  const [requestedRideIds, setRequestedRideIds] = useState<Set<string>>(() => {
    try {
      const local = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
      return new Set(local.map((r: any) => String(r.rideId)));
    } catch {
      return new Set();
    }
  });

  // Sync requested ride IDs from API + local storage
  useEffect(() => {
    async function syncRequests() {
      try {
        const reqs = await api.getRequests("passenger");
        const local = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
        const set = new Set<string>();
        (reqs || []).forEach((r: any) => {
          if (r.rideId) set.add(String(typeof r.rideId === 'object' ? r.rideId._id || r.rideId.id : r.rideId));
        });
        (local || []).forEach((r: any) => {
          if (r.rideId) set.add(String(r.rideId));
        });
        setRequestedRideIds(set);
      } catch {}
    }
    syncRequests();
  }, [user]);

  // Sync preference if user switches to Priya
  useEffect(() => {
    if (user?.preferences?.womenOnlyDriver !== undefined) {
      setWomenOnlyDriver(!!user.preferences.womenOnlyDriver);
    }
  }, [user]);

  const resetAcademicFilters = () => {
    setCollege('Any');
    setDepartment('Any');
    setCourse('Any');
    setYear('Any');
    setSemester('Any');
    setSameCourseSemOnly(false);
    setSameDepartmentOnly(false);
    setSameCollegeOnly(false);
    setVerifiedOnly(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setRequestSuccess(null);
    setRequestError(null);

    try {
      const origin = PRESET_LOCATIONS[originIndex];
      const dest = PRESET_LOCATIONS[destIndex];

      const res = await api.getRides({
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: dest.lat,
        destLng: dest.lng,
        date,
        seats,
        womenOnlyDriver,
        college: college !== 'Any' ? college : undefined,
        department: department !== 'Any' ? department : undefined,
        course: course !== 'Any' ? course : undefined,
        year: year !== 'Any' ? year : undefined,
        semester: semester !== 'Any' ? semester : undefined,
        sameCourseSemOnly,
        sameDepartmentOnly,
        sameCollegeOnly,
        verifiedOnly,
      });

      // Sort: Corridor proximity FIRST, then academic affinity
      const sortRidesByCorridor = (list: IRide[]) => {
        return [...list].sort((a: any, b: any) => {
          // 1. Proximity to search corridor (pickup + dropoff)
          const aOrig = a.origin?.coordinates || (a.origin?.lat !== undefined ? [a.origin.lng, a.origin.lat] : []);
          const aDest = a.destination?.coordinates || (a.destination?.lat !== undefined ? [a.destination.lng, a.destination.lat] : []);
          const bOrig = b.origin?.coordinates || (b.origin?.lat !== undefined ? [b.origin.lng, b.origin.lat] : []);
          const bDest = b.destination?.coordinates || (b.destination?.lat !== undefined ? [b.destination.lng, b.destination.lat] : []);

          const aPickupDist = (aOrig.length === 2 && origin)
            ? haversineDistanceKm(origin.lat, origin.lng, aOrig[1], aOrig[0])
            : 99;
          const aDestDist = (aDest.length === 2 && dest)
            ? haversineDistanceKm(dest.lat, dest.lng, aDest[1], aDest[0])
            : 99;
          const aTotalDist = a.totalCorridorDist ?? (aPickupDist + aDestDist);

          const bPickupDist = (bOrig.length === 2 && origin)
            ? haversineDistanceKm(origin.lat, origin.lng, bOrig[1], bOrig[0])
            : 99;
          const bDestDist = (bDest.length === 2 && dest)
            ? haversineDistanceKm(dest.lat, dest.lng, bDest[1], bDest[0])
            : 99;
          const bTotalDist = b.totalCorridorDist ?? (bPickupDist + bDestDist);

          // If route distances differ by more than 0.8 km, closer corridor takes absolute priority
          if (Math.abs(aTotalDist - bTotalDist) > 0.8) {
            return aTotalDist - bTotalDist;
          }

          // 2. Academic Affinity priority rank (Rank 1: Course & Sem, Rank 2: Dept, Rank 3: College, Rank 4: None)
          const rankA = a.match?.breakdown?.academicPriorityRank ?? 4;
          const rankB = b.match?.breakdown?.academicPriorityRank ?? 4;
          if (rankA !== rankB) {
            return rankA - rankB;
          }

          // 3. Match score percentage
          const pctA = a.match?.percentage ?? 0;
          const pctB = b.match?.percentage ?? 0;
          return pctB - pctA;
        });
      };

      if (!res || res.length === 0) {
        // If exact coordinate corridor has no match, fetch all active rides so user always sees available rides
        const allActive = await api.getRides({ womenOnlyDriver, status: 'active' });
        setRides(sortRidesByCorridor(allActive || []));
      } else {
        setRides(sortRidesByCorridor(res));
      }
      setSearched(true);
    } catch (err: any) {
      console.error('[Search] Error searching rides:', err);
      setRequestError(err.message || 'Failed to search rides. Please ensure you are logged in.');
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = async () => {
    setLoading(true);
    setRequestError(null);

    try {
      const origin = PRESET_LOCATIONS[originIndex];
      const dest = PRESET_LOCATIONS[destIndex];

      const res = await api.getRides({
        womenOnlyDriver,
        status: 'active',
        college: college !== 'Any' ? college : undefined,
        department: department !== 'Any' ? department : undefined,
        course: course !== 'Any' ? course : undefined,
        year: year !== 'Any' ? year : undefined,
        semester: semester !== 'Any' ? semester : undefined,
        sameCourseSemOnly,
        sameDepartmentOnly,
        sameCollegeOnly,
        verifiedOnly,
      });

      const sorted = [...(res || [])].sort((a: any, b: any) => {
        const aOrig = a.origin?.coordinates || (a.origin?.lat !== undefined ? [a.origin.lng, a.origin.lat] : []);
        const aDest = a.destination?.coordinates || (a.destination?.lat !== undefined ? [a.destination.lng, a.destination.lat] : []);
        const bOrig = b.origin?.coordinates || (b.origin?.lat !== undefined ? [b.origin.lng, b.origin.lat] : []);
        const bDest = b.destination?.coordinates || (b.destination?.lat !== undefined ? [b.destination.lng, b.destination.lat] : []);

        const aPickupDist = (aOrig.length === 2 && origin) ? haversineDistanceKm(origin.lat, origin.lng, aOrig[1], aOrig[0]) : 99;
        const aDestDist = (aDest.length === 2 && dest) ? haversineDistanceKm(dest.lat, dest.lng, aDest[1], aDest[0]) : 99;
        const aTotalDist = a.totalCorridorDist ?? (aPickupDist + aDestDist);

        const bPickupDist = (bOrig.length === 2 && origin) ? haversineDistanceKm(origin.lat, origin.lng, bOrig[1], bOrig[0]) : 99;
        const bDestDist = (bDest.length === 2 && dest) ? haversineDistanceKm(dest.lat, dest.lng, bDest[1], bDest[0]) : 99;
        const bTotalDist = b.totalCorridorDist ?? (bPickupDist + bDestDist);

        if (Math.abs(aTotalDist - bTotalDist) > 0.8) {
          return aTotalDist - bTotalDist;
        }

        const rankA = a.match?.breakdown?.academicPriorityRank ?? 4;
        const rankB = b.match?.breakdown?.academicPriorityRank ?? 4;
        if (rankA !== rankB) return rankA - rankB;

        return (b.match?.percentage ?? 0) - (a.match?.percentage ?? 0);
      });

      setRides(sorted);
      setSearched(true);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to fetch rides.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial search when route or filter changes
  useEffect(() => {
    handleSearch();
  }, [user, originIndex, destIndex, womenOnlyDriver]);

  const handleRequestRide = async (rideId: string) => {
    if (!user) {
      navigate('/login?redirect=/search');
      return;
    }
    setRequestingId(rideId);
    setRequestSuccess(null);
    setRequestError(null);
    try {
      await api.requestRide(rideId);
      // Immediately reflect requested state in UI
      setRequestedRideIds((prev) => {
        const next = new Set(prev);
        next.add(rideId);
        return next;
      });
      // Persist in localStorage for instant offline & standalone Vercel persistence
      const local = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
      const newReq = {
        _id: "req_" + Date.now(),
        rideId,
        passengerId: user,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("campusride_local_requests", JSON.stringify([newReq, ...local]));
      setRequestSuccess('Seat requested! Driver has been notified in real time.');

      // Find the ride name for the modal
      const ride = rides.find(r => r._id === rideId);
      const rideName = ride ? `${ride.origin?.text || 'Pickup'} → ${ride.destination?.text || 'Drop'}` : '';
      setSuccessRideName(rideName);
      setShowSuccessModal(true);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to request seat');
    } finally {
      setRequestingId(null);
    }
  };

  const isDriver = user?.role === 'driver' || user?.accountType === 'DRIVER';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Route Explorer Side-by-Side Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE1DE] shadow-xs mb-8">
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#143D32] font-semibold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block">
            CAMPUSRIDE ROUTE EXPLORER
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-[1.1]">
            Find A Ride.<br />
            <span className="text-[#143D32]">Travel With Peers.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#646A67] leading-relaxed">
            Search active student carpools across Uttarakhand campuses. Filter by corridor, gender preference, and departure timing.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">✓ Verified Student IDs</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">✓ Zero Cab Surges</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">✓ Real-time Route Match</span>
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-2xl overflow-hidden border border-[#DDE1DE] shadow-md group">
            <img
              src={findRideImg}
              alt="Student at campus pickup point with CampusRide car approaching"
              className="w-full h-52 sm:h-60 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#143D32]/70 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#143D32]/85 backdrop-blur-sm border border-emerald-400/30 text-emerald-50 text-xs font-mono">
              FIND A RIDE
            </span>
          </div>
        </div>
      </div>

      {/* Driver notice banner */}
      {isDriver && (
        <div className="bg-[#143D32] text-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Offering a ride as a verified driver?</p>
              <p className="text-xs text-emerald-100/90">Publish your daily commute route and let classmates book open seats along your way.</p>
            </div>
          </div>
          <Link
            to="/post"
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#143D32] text-xs font-extrabold transition-all text-center shrink-0 cursor-pointer shadow-sm"
          >
            Post a Ride Now
          </Link>
        </div>
      )}

      {/* Guest Sign-In Notice if not logged in */}
      {!user && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 text-emerald-950 text-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold">Browsing Campus Commutes</p>
              <p className="text-xs text-emerald-800">You can browse verified student routes freely. Sign in to request seats or verify your college ID.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login?redirect=/search"
              className="px-4 py-2 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Sign In / Register
            </Link>
          </div>
        </div>
      )}

      {/* Header & Search Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Search className="w-3.5 h-3.5" />
              Automated Route & Time Commute Matcher
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Find a Classmate Ride</h1>
            <p className="text-slate-500 text-sm mt-1">
              Rides are scored and ranked using great-circle detour, 15-minute time alignment, and pickup proximity.
            </p>
          </div>


        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Pickup Location
              </label>
              <select
                value={originIndex}
                onChange={(e) => setOriginIndex(Number(e.target.value))}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-medium"
              >
                <optgroup label="🏫 Campus Buildings (Uttaranchal University)">
                  {PRESET_LOCATIONS.filter((l) => l.category === 'Campus Buildings').map((loc) => {
                    const idx = PRESET_LOCATIONS.indexOf(loc);
                    return (
                      <option key={idx} value={idx}>
                        {loc.text}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="📍 Dehradun & Surrounding Hubs">
                  {PRESET_LOCATIONS.filter((l) => l.category === 'Dehradun & Surrounding').map((loc) => {
                    const idx = PRESET_LOCATIONS.indexOf(loc);
                    return (
                      <option key={idx} value={idx}>
                        {loc.text}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Drop-off Destination
              </label>
              <select
                value={destIndex}
                onChange={(e) => setDestIndex(Number(e.target.value))}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-medium"
              >
                <optgroup label="🏫 Campus Buildings (Uttaranchal University)">
                  {PRESET_LOCATIONS.filter((l) => l.category === 'Campus Buildings').map((loc) => {
                    const idx = PRESET_LOCATIONS.indexOf(loc);
                    return (
                      <option key={idx} value={idx}>
                        {loc.text}
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="📍 Dehradun & Surrounding Hubs">
                  {PRESET_LOCATIONS.filter((l) => l.category === 'Dehradun & Surrounding').map((loc) => {
                    const idx = PRESET_LOCATIONS.indexOf(loc);
                    return (
                      <option key={idx} value={idx}>
                        {loc.text}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-600" />
                Seats Needed
              </label>
              <select
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                <option value={1}>1 Seat</option>
                <option value={2}>2 Seats</option>
                <option value={3}>3 Seats</option>
              </select>
            </div>
          </div>

          {/* Academic & University Affinity Filter Accordion */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAcademicFilters(!showAcademicFilters)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-emerald-700 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>🎓 Academic & Student Community Filters</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold lowercase">
                  optional
                </span>
                {showAcademicFilters ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {(college !== 'Any' ||
                department !== 'Any' ||
                course !== 'Any' ||
                year !== 'Any' ||
                semester !== 'Any' ||
                sameCourseSemOnly ||
                sameDepartmentOnly ||
                sameCollegeOnly ||
                verifiedOnly) && (
                <button
                  type="button"
                  onClick={resetAcademicFilters}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filters
                </button>
              )}
            </div>

            {showAcademicFilters && (
              <div className="space-y-3 pt-2">
                {/* 5 Academic Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      College / University
                    </label>
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                    >
                      {UNIVERSITIES.map((u) => (
                        <option key={u} value={u}>
                          {u === 'Any' ? 'Any University' : u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Course
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                    >
                      {COURSES.map((c) => (
                        <option key={c} value={c}>
                          {c === 'Any' ? 'Any Course' : c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Department / Branch
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d === 'Any' ? 'Any Department' : d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y === 'Any' ? 'Any Year' : `${y} Year`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Semester
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s} value={s}>
                          {s === 'Any' ? 'Any Semester' : `${s} Sem`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Affinity Toggles */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Priority Toggles:
                  </span>

                  <button
                    type="button"
                    onClick={() => setSameCourseSemOnly(!sameCourseSemOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      sameCourseSemOnly
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    🎓 Same Course & Sem Only
                  </button>

                  <button
                    type="button"
                    onClick={() => setSameDepartmentOnly(!sameDepartmentOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      sameDepartmentOnly
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    📚 Same Department Only
                  </button>

                  <button
                    type="button"
                    onClick={() => setSameCollegeOnly(!sameCollegeOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      sameCollegeOnly
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    🏛️ Same College Only
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      verifiedOnly
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    🛡️ Verified Students Only
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={womenOnlyDriver}
                onChange={(e) => setWomenOnlyDriver(e.target.checked)}
                className="rounded text-pink-600 focus:ring-pink-500 w-4 h-4"
              />
              <span className="flex items-center gap-1 text-pink-800">
                🛡️ Women-Only Driver Filter (Hard Filter)
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowOverviewMap(!showOverviewMap)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showOverviewMap
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Map className="w-4 h-4 text-blue-600" />
                <span>{showOverviewMap ? 'Hide Route & Pickup Map' : '🗺️ Interactive Campus & Route Map'}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Matching...' : 'Search Matching Rides'}
              </button>
            </div>
          </div>
        </form>

        {/* Interactive Route & Pickup Navigation Map Panel */}
        {showOverviewMap && (
          <div className="pt-6 mt-6 border-t border-slate-100">
            <PickupAndRouteNavigationMap
              originText={PRESET_LOCATIONS[originIndex]?.text}
              destinationText={PRESET_LOCATIONS[destIndex]?.text}
              onOriginChange={(newOrig) => {
                const idx = PRESET_LOCATIONS.findIndex(
                  (p) =>
                    p.text.toLowerCase().includes(newOrig.toLowerCase()) ||
                    newOrig.toLowerCase().includes(p.text.toLowerCase())
                );
                if (idx !== -1) {
                  setOriginIndex(idx);
                }
              }}
              onDestinationChange={(newDest) => {
                const idx = PRESET_LOCATIONS.findIndex(
                  (p) =>
                    p.text.toLowerCase().includes(newDest.toLowerCase()) ||
                    newDest.toLowerCase().includes(p.text.toLowerCase())
                );
                if (idx !== -1) {
                  setDestIndex(idx);
                }
              }}
              onSelectRoute={(corridor) => {
                console.log('[Search] User selected driving route:', corridor.name);
              }}
            />
          </div>
        )}
      </div>

      {/* Global Notifications */}
      {requestSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{requestSuccess}</span>
        </div>
      )}
      {requestError && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm font-medium">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{requestError}</span>
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Available Matching Rides</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
            {rides.length}
          </span>
        </h2>
        <span className="text-xs text-slate-500">Sorted by Route Proximity First, then Academic Affinity</span>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Calculating academic affinity, detour distances & time overlaps...</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching rides found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {womenOnlyDriver
              ? 'Zero rides match the women-only driver filter for this route/time. Try unchecking the filter or browsing all available campus commutes!'
              : 'No rides match the selected route and academic filters. Try resetting the academic filters to "Any" or browse all active university carpools.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleShowAll}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-all"
            >
              Browse All Active Campus Rides
            </button>
            <button
              type="button"
              onClick={resetAcademicFilters}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              Reset Academic Filters to "Any"
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rides.map((ride) => {
            const isCreator = ride.creator?._id === user?._id;
            const isTier1 = ride.match?.breakdown?.sameCourseAndSemester;
            const isTier2 = !isTier1 && ride.match?.breakdown?.sameDepartment;
            const isTier3 = !isTier1 && !isTier2 && ride.match?.breakdown?.sameCollege;

            return (
              <div
                key={ride._id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4 ${
                  isTier1
                    ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-50/30 via-white to-white'
                    : 'border-slate-200 hover:border-emerald-500/60'
                }`}
              >
                {/* Tier Priority Banner */}
                {isTier1 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-sm">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Classmate Match — Same Course & Semester</span>
                      <span className="font-semibold text-emerald-800">
                        ({ride.creator?.course || 'B.Tech'} Sem {ride.creator?.semester || 5})
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] uppercase font-extrabold tracking-wider">
                      Top Priority #1
                    </span>
                  </div>
                )}

                {isTier2 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Same Department ({ride.creator?.department})</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] uppercase font-extrabold tracking-wider">
                      Priority #2
                    </span>
                  </div>
                )}

                {isTier3 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-purple-600" />
                      <span>Same University ({ride.creator?.college})</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] uppercase font-extrabold tracking-wider">
                      Priority #3
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Driver Information */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        ride.creator?.avatarURL ||
                        '/test_uploads/profile_photo.jpg'
                      }
                      alt={ride.creator?.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{ride.creator?.name}</span>
                        {ride.creator?.verificationStatus === 'verified' && (
                          <span
                            className="inline-flex items-center text-emerald-600"
                            title="Verified College Student"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </span>
                        )}
                        <span className="text-xs text-slate-400 capitalize">({ride.creator?.gender || 'Student'})</span>
                      </div>

                      {/* Academic & Rating Line */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-500" />
                          {ride.creator?.rating?.toFixed(1) || '5.0'}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <School className="w-3 h-3 text-emerald-600" />
                          {ride.creator?.college}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-slate-400" />
                          {ride.creator?.course || 'B.Tech'} {ride.creator?.department ? `(${ride.creator.department})` : ''} • Sem {ride.creator?.semester || 5}
                        </span>
                        {ride.vehicleId && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">
                              🚗 {ride.vehicleId.model || 'Car'} ({ride.vehicleId.plateLast4})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="flex items-center gap-3">
                    <MatchScoreBadge match={ride.match} />
                  </div>
                </div>

                {/* Route Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">From</span>
                      <span className="font-bold text-slate-800">{sanitizeLocationText(ride.origin.text)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">To</span>
                      <span className="font-bold text-slate-800">{sanitizeLocationText(ride.destination.text)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action & Timing */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {new Date(ride.departureTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      {ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} available
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (Estimated cost-share: ₹0 — student community)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMapRideId(
                          expandedMapRideId === ride._id ? null : ride._id
                        )
                      }
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        expandedMapRideId === ride._id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Map className="w-3.5 h-3.5" />
                      <span>{expandedMapRideId === ride._id ? 'Close Map' : '🗺️ Map & Walk Guide'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/rides/${ride._id}`)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    {!isCreator && (
                      requestedRideIds.has(ride._id) ? (
                        <span className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Request Sent</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={requestingId === ride._id || ride.availableSeats <= 0}
                          onClick={() => handleRequestRide(ride._id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {requestingId === ride._id ? 'Requesting...' : 'Request Seat'}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Inline Expandable Pickup & Route Map */}
                {expandedMapRideId === ride._id && (
                  <div className="pt-3 border-t border-slate-200">
                    <PickupAndRouteNavigationMap
                      originText={ride.origin.text}
                      destinationText={ride.destination.text}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RideRequestSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        rideName={successRideName}
      />
    </div>
  );
};

