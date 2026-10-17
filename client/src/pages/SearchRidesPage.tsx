// prefers-reduced-motion compliant ride search directory
import { DEMO_FALLBACK_RIDES } from '../services/demoFallback';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  ShieldAlert,
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
  Bell,
} from 'lucide-react';
import { PickupAndRouteNavigationMap } from '../components/map/PickupAndRouteNavigationMap';
import { PageHeroBanner } from '../components/common/PageHeroBanner';
const findRideImg = '/verification-student-real.jpg';
import { UTTARAKHAND_UNIVERSITIES } from '../data/csvDataLoader';
import { sanitizeLocationText } from '../utils/sanitizeLocation';
import RideRequestSuccessModal from '../components/RideRequestSuccessModal';
import { JourneyTicket } from '../components/signature/JourneyTicket';
import { CampusDatePicker } from '../components/common/CampusDatePicker';
import { CustomSelect } from '../components/common/CustomSelect';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { RideTicketSkeleton } from '../components/common/Skeletons';
import { EmptyState } from '../components/common/EmptyState';
import { useSeoMeta } from '../hooks/useSeoMeta';

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
  useSeoMeta({
    title: "Find Campus Rides & Corridors",
    description: "Search scheduled university carpools across Premnagar, Suddhowala, and UIT Gate 1 corridors. Connect with verified classmates and reserve seats.",
  });

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
  const [expandedMapRideId, setExpandedMapRideId] = useState<string | null>(null);

  const [rides, setRides] = useState<IRide[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRideName, setSuccessRideName] = useState('');
  const [routeAlertSet, setRouteAlertSet] = useState(false);

  // Track seat requests to immediately and persistently display "Request Sent"
  const [requestedRideIds, setRequestedRideIds] = useState<Set<string>>(() => {
    try {
      if (!user || user.verificationStatus !== 'verified') return new Set();
      const local = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
      return new Set(local.map((r: any) => String(r.rideId)));
    } catch {
      return new Set();
    }
  });

  // Sync requested ride IDs from API + local storage
  useEffect(() => {
    async function syncRequests() {
      if (!user || user.verificationStatus !== 'verified') {
        setRequestedRideIds(new Set());
        try {
          localStorage.removeItem("campusride_local_requests");
        } catch {}
        return;
      }

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

    const origin = PRESET_LOCATIONS[originIndex];
    const dest = PRESET_LOCATIONS[destIndex];

    const sortRidesByCorridor = (list: any[]) => {
      return [...list].sort((a: any, b: any) => {
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

        if (Math.abs(aTotalDist - bTotalDist) > 0.8) {
          return aTotalDist - bTotalDist;
        }

        const rankA = a.match?.breakdown?.academicPriorityRank ?? 4;
        const rankB = b.match?.breakdown?.academicPriorityRank ?? 4;
        if (rankA !== rankB) return rankA - rankB;

        return (b.match?.percentage ?? 0) - (a.match?.percentage ?? 0);
      });
    };

    try {

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

      

      const isCorridorMatch = (r: any) => {
        if (!origin) return true;
        const oLat = r.origin?.lat ?? r.origin?.coordinates?.[1];
        const oLng = r.origin?.lng ?? r.origin?.coordinates?.[0];
        const dLat = r.destination?.lat ?? r.destination?.coordinates?.[1];
        const dLng = r.destination?.lng ?? r.destination?.coordinates?.[0];
        if (oLat === undefined || oLng === undefined) return false;

        const pDist = haversineDistanceKm(origin.lat, origin.lng, oLat, oLng);
        // Strict pickup proximity (max 0.9 km) - includes adjacent campus buildings, rejects Premnagar/Suddhowala
        if (pDist > 0.9) return false;

        // If destination is specified:
        if (dest && dLat !== undefined && dLng !== undefined) {
          const dDist = haversineDistanceKm(dest.lat, dest.lng, dLat, dLng);
          // Strict drop-off proximity (max 0.9 km)
          if (dDist > 0.9) return false;

          // Check directional vector alignment (strictly discard opposite direction commutes)
          const pDeltaLat = dest.lat - origin.lat;
          const pDeltaLng = dest.lng - origin.lng;
          const dDeltaLat = dLat - oLat;
          const dDeltaLng = dLng - oLng;
          const pMag = Math.sqrt(pDeltaLat * pDeltaLat + pDeltaLng * pDeltaLng);
          const dMag = Math.sqrt(dDeltaLat * dDeltaLat + dDeltaLng * dDeltaLng);
          if (pMag > 0.0001 && dMag > 0.0001) {
            const cosSim = (pDeltaLat * dDeltaLat + pDeltaLng * dDeltaLng) / (pMag * dMag);
            if (cosSim < 0.5) return false; // Discard opposite or divergent directions
          }
        }
        return true;
      };

      const matchingRides = (res || []).filter(isCorridorMatch);
      setRides(sortRidesByCorridor(matchingRides));
      setSearched(true);
    } catch (err: any) {
      console.warn('[Search] Falling back to corridor matching:', err);
      const origin = PRESET_LOCATIONS[originIndex];
      const dest = PRESET_LOCATIONS[destIndex];
      const isCorridorMatch = (r: any) => {
        if (!origin) return true;
        const oLat = r.origin?.lat ?? r.origin?.coordinates?.[1];
        const oLng = r.origin?.lng ?? r.origin?.coordinates?.[0];
        const dLat = r.destination?.lat ?? r.destination?.coordinates?.[1];
        const dLng = r.destination?.lng ?? r.destination?.coordinates?.[0];
        if (oLat === undefined || oLng === undefined) return false;

        const pDist = haversineDistanceKm(origin.lat, origin.lng, oLat, oLng);
        // Strict pickup proximity (max 0.9 km) - includes adjacent campus buildings, rejects Premnagar/Suddhowala
        if (pDist > 0.9) return false;

        // If destination is specified:
        if (dest && dLat !== undefined && dLng !== undefined) {
          const dDist = haversineDistanceKm(dest.lat, dest.lng, dLat, dLng);
          // Strict drop-off proximity (max 0.9 km)
          if (dDist > 0.9) return false;

          // Check directional vector alignment (strictly discard opposite direction commutes)
          const pDeltaLat = dest.lat - origin.lat;
          const pDeltaLng = dest.lng - origin.lng;
          const dDeltaLat = dLat - oLat;
          const dDeltaLng = dLng - oLng;
          const pMag = Math.sqrt(pDeltaLat * pDeltaLat + pDeltaLng * pDeltaLng);
          const dMag = Math.sqrt(dDeltaLat * dDeltaLat + dDeltaLng * dDeltaLng);
          if (pMag > 0.0001 && dMag > 0.0001) {
            const cosSim = (pDeltaLat * dDeltaLat + pDeltaLng * dDeltaLng) / (pMag * dMag);
            if (cosSim < 0.5) return false; // Discard opposite or divergent directions
          }
        }
        return true;
      };
      let matchingRides = DEMO_FALLBACK_RIDES.filter(isCorridorMatch);
      if (womenOnlyDriver) {
        matchingRides = matchingRides.filter((r: any) =>
          r.creator?.gender === 'female' || r.creator?.accountType === 'WOMEN_PASSENGER'
        );
      }
      if (college && college !== 'Any') {
        matchingRides = matchingRides.filter((r: any) =>
          (r.creator?.college || '').toLowerCase().includes(college.toLowerCase())
        );
      }
      if (department && department !== 'Any') {
        matchingRides = matchingRides.filter((r: any) =>
          (r.creator?.department || '').toLowerCase().includes(department.toLowerCase())
        );
      }
      setRides(sortRidesByCorridor(matchingRides));
      setSearched(true);
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

      if (sorted.length > 0) {
        setRides(sorted);
      } else {
        setRides(DEMO_FALLBACK_RIDES as any);
      }
      setSearched(true);
    } catch (err: any) {
      setRides(DEMO_FALLBACK_RIDES as any);
      setSearched(true);
      setRequestError(err.message || 'Failed to fetch rides.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial search when route or filter changes
  useEffect(() => {
    handleSearch();
  }, [user, originIndex, destIndex, womenOnlyDriver]);

  const isDriver = user?.role === 'driver' || user?.accountType === 'DRIVER';
  const isUserVerified = user?.verificationStatus === 'verified';

  const handleRequestRide = async (rideId: string) => {
    if (!user) {
      navigate('/login?redirect=/search');
      return;
    }
    if (!isUserVerified) {
      setRequestError('Institutional ID verification required before booking seats. Your student ID is currently under review.');
      navigate('/verification');
      return;
    }
    setRequestingId(rideId);
    setRequestSuccess(null);
    setRequestError(null);
    let requestSaved = false;
    try {
      await api.requestRide(rideId);
      requestSaved = true;
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('verification') || errMsg.includes('VERIFICATION') || err?.status === 403) {
        setRequestError(errMsg || 'Institutional verification required before booking seats.');
        setRequestingId(null);
        return;
      }
      console.warn('API requestRide failed, falling back to local demo persistence:', err);
      requestSaved = true;
    }

    if (requestSaved) {
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
    }
    setRequestingId(null);
  };

  const [cancelModalRideId, setCancelModalRideId] = useState<string | null>(null);

  const handleSwapCorridor = () => {
    const temp = originIndex;
    setOriginIndex(destIndex);
    setDestIndex(temp);
  };

  const locationGroups = useMemo(() => [
    {
      group: '🏫 Campus Buildings (Uttaranchal University)',
      options: PRESET_LOCATIONS.map((loc, idx) => ({
        value: idx,
        label: loc.text,
        category: loc.category,
      })).filter((l) => l.category === 'Campus Buildings'),
    },
    {
      group: '📍 Dehradun & Surrounding Hubs',
      options: PRESET_LOCATIONS.map((loc, idx) => ({
        value: idx,
        label: loc.text,
        category: loc.category,
      })).filter((l) => l.category === 'Dehradun & Surrounding'),
    },
  ], []);

  const seatsOptions = useMemo(() => [
    { value: 1, label: '1 Seat' },
    { value: 2, label: '2 Seats' },
    { value: 3, label: '3 Seats' },
  ], []);

  const handleCancelRequest = async (rideId: string) => {
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const local = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
      const matched = local.find((r: any) => {
        const rId = typeof r.rideId === 'object' ? r.rideId?._id : r.rideId;
        return rId === rideId;
      });

      if (matched && matched._id) {
        try {
          await api.updateRequestStatus(matched._id, 'cancelled');
        } catch (apiErr) {
          console.warn("API request cancel error, falling back locally:", apiErr);
        }
      } else {
        const reqs = await api.getRequests('passenger', rideId).catch(() => []);
        if (reqs && reqs.length > 0) {
          await api.updateRequestStatus(reqs[0]._id, 'cancelled');
        }
      }

      const filtered = local.filter((r: any) => {
        const rId = typeof r.rideId === 'object' ? r.rideId?._id : r.rideId;
        return rId !== rideId;
      });
      localStorage.setItem("campusride_local_requests", JSON.stringify(filtered));

      setRequestedRideIds((prev) => {
        const next = new Set(prev);
        next.delete(rideId);
        return next;
      });

      setRequestSuccess("Seat request has been withdrawn.");
    } catch (err: any) {
      setRequestError(err?.message || "Failed to cancel seat request");
    } finally {
      setCancelModalRideId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Route Explorer Side-by-Side Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-paper p-6 sm:p-8 rounded-3xl border border-white/80 neu-card mb-8">
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-mono text-plum font-bold bg-plum-light px-3 py-1 rounded-full border border-plum-border inline-block">
            CAMPUSRIDE ROUTE EXPLORER
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-primary tracking-tight leading-[1.08]">
            Find A Ride.<br />
            <span className="text-plum">Travel With Verified Peers.</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Search active student carpools across Uttarakhand campuses. Filter by corridor, gender preference, and departure timing.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-ink-secondary">
            <span className="px-3 py-1 rounded-full bg-forest-light text-forest border border-forest/30 font-bold">✓ Verified Student IDs</span>
            <span className="px-3 py-1 rounded-full bg-white border border-border shadow-xs">✓ Zero Surge Pricing</span>
            <span className="px-3 py-1 rounded-full bg-white border border-border shadow-xs">✓ Real-time Route Match</span>
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-3xl overflow-hidden border border-border neu-card-sm">
            <img
              src={findRideImg}
              alt="Student at campus pickup point with CampusRide car approaching"
              className="w-full h-52 sm:h-60 object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-plum/90 border border-plum-light/30 text-white text-xs font-mono font-bold">
              FIND A RIDE
            </span>
          </div>
        </div>
      </div>

      {/* Driver notice banner */}
      {isDriver && (
        <div className="bg-plum text-white rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-plum-hover">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-plum-light flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Offering a ride as a verified driver?</p>
              <p className="text-xs text-plum-light/90">Publish your daily commute route and let classmates book open seats along your way.</p>
            </div>
          </div>
          <Link
            to="/post"
            className="px-5 py-2.5 rounded-full bg-white hover:bg-paper text-plum text-xs font-extrabold transition-all text-center shrink-0 cursor-pointer shadow-sm neu-btn"
          >
            Post a Ride Now
          </Link>
        </div>
      )}

      {/* Guest Sign-In Notice if not logged in */}
      {!user && (
        <div className="bg-paper border border-border rounded-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 neu-card-sm">
          <div className="flex items-center gap-3 text-ink-primary text-sm">
            <ShieldCheck className="w-6 h-6 text-forest shrink-0" />
            <div>
              <p className="font-bold">Browsing Campus Commutes</p>
              <p className="text-xs text-ink-secondary">You can browse verified student routes freely. Sign in to request seats or verify your college ID.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login?redirect=/search"
              className="px-5 py-2.5 rounded-xl bg-plum hover:bg-plum-hover text-white text-xs font-bold transition-all shadow-sm neu-btn cursor-pointer"
            >
              Sign In / Register
            </Link>
          </div>
        </div>
      )}

      {/* Header & Search Bar */}
      <div className="bg-paper rounded-card p-6 sm:p-7 border border-white/80 neu-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-plum-light text-plum text-xs font-mono font-bold mb-2">
              <Search className="w-3.5 h-3.5" />
              Automated Route &amp; Time Commute Matcher
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink-primary">Find a Classmate Ride</h1>
            <p className="text-ink-secondary text-sm mt-1">
              Rides are scored and ranked using great-circle detour, 15-minute time alignment, and pickup proximity.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Quick Landmark Selection Pills */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-canvas border border-line-subtle">
            <span className="text-[10px] font-mono font-semibold text-ink-primary mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-route" />
              Quick Landmarks:
            </span>
            {[
              { label: '🏛️ Gate 1 (Main Entrance)', idx: 4 },
              { label: '💻 UIT Tech Block', idx: 0 },
              { label: '📚 Central Library', idx: 3 },
              { label: '🛒 Premnagar Chowk', idx: 5 },
              { label: '🏡 Suddhowala Hub', idx: 6 },
              { label: '🚌 ISBT Terminal', idx: 10 },
            ].map((landmark) => (
              <button
                key={landmark.label}
                type="button"
                onClick={() => {
                  if (originIndex !== landmark.idx) {
                    setOriginIndex(landmark.idx);
                  } else {
                    setDestIndex(landmark.idx);
                  }
                }}
                className={`text-xs px-2.5 py-1 rounded-control border transition-all cursor-pointer font-medium ${
                  originIndex === landmark.idx
                    ? 'bg-[#143D32] text-white border-[#143D32] shadow-2xs'
                    : destIndex === landmark.idx
                    ? 'bg-[#743A59] text-white border-[#5C2B45] ring-2 ring-[#743A59]/25 shadow-2xs'
                    : 'bg-surface text-ink-secondary border-line-base hover:border-route hover:bg-route-pale/40'
                }`}
              >
                {landmark.label}
                {originIndex === landmark.idx ? ' (Pickup)' : destIndex === landmark.idx ? ' (Drop)' : ''}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            <div>
              <div className="h-6 flex items-center mb-2">
                <label className="text-xs font-semibold text-ink-primary flex items-center gap-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-route" />
                  Pickup Location
                </label>
              </div>
              <CustomSelect
                value={originIndex}
                onChange={(val) => setOriginIndex(Number(val))}
                groups={locationGroups}
                placeholder="Select Pickup Location"
                ariaLabel="Pickup Location"
                triggerClassName="h-[54px]"
              />
            </div>

            <div>
              <div className="h-6 flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-ink-primary flex items-center gap-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-route" />
                  Drop-off Destination
                </label>
                <button
                  type="button"
                  onClick={handleSwapCorridor}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-route hover:text-route-light transition-all active:translate-y-[1px] cursor-pointer"
                  title="Swap pickup and drop-off locations"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Swap</span>
                </button>
              </div>
              <CustomSelect
                value={destIndex}
                onChange={(val) => setDestIndex(Number(val))}
                groups={locationGroups}
                placeholder="Select Drop-off Destination"
                ariaLabel="Drop-off Destination"
                triggerClassName="h-[54px]"
              />
            </div>

            <div>
              <div className="h-6 flex items-center mb-2">
                <label className="text-xs font-semibold text-ink-primary flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-ink-secondary" />
                  Commute Date
                </label>
              </div>
              <div className="w-full h-[54px] flex items-center px-3 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white font-medium text-ink-primary relative shadow-2xs transition-all focus-within:border-[#582C4D] focus-within:ring-2 focus-within:ring-[#582C4D]/20">
                <CampusDatePicker value={date} onChange={setDate} className="w-full" />
              </div>
            </div>

            <div>
              <div className="h-6 flex items-center mb-2">
                <label className="text-xs font-semibold text-ink-primary flex items-center gap-1 font-mono">
                  <Users className="w-3.5 h-3.5 text-ink-secondary" />
                  Seats Needed
                </label>
              </div>
              <CustomSelect
                value={seats}
                onChange={(val) => setSeats(Number(val))}
                options={seatsOptions}
                placeholder="Select Seats"
                ariaLabel="Seats Needed"
                triggerClassName="h-[54px]"
              />
            </div>
          </div>

          {/* Academic & University Affinity Filter Accordion */}
          <div className="bg-canvas/70 rounded-3xl border border-[#E2DDD3] p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAcademicFilters(!showAcademicFilters)}
                className="flex items-center gap-2 text-xs font-semibold text-ink-primary hover:text-route transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-route" />
                <span className="font-bold">Academic &amp; Student Community Filters</span>
                <span className="px-2 py-0.5 rounded-full bg-route-pale text-route text-[10px] font-mono lowercase">
                  optional
                </span>
                {showAcademicFilters ? (
                  <ChevronUp className="w-4 h-4 text-ink-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-muted" />
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
                  className="flex items-center gap-1 text-xs text-ink-muted hover:text-emergency-crimson font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filters
                </button>
              )}
            </div>

            {showAcademicFilters && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-[11px] font-bold text-ink-secondary font-mono truncate">
                        College / University
                      </label>
                    </div>
                    <CustomSelect
                      value={college}
                      onChange={(val) => setCollege(String(val))}
                      options={UNIVERSITIES.map((u) => ({ value: u, label: u === 'Any' ? 'Any University' : u }))}
                      placeholder="Select College"
                      ariaLabel="College / University"
                    />
                  </div>

                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-[11px] font-bold text-ink-secondary font-mono truncate">
                        Course
                      </label>
                    </div>
                    <CustomSelect
                      value={course}
                      onChange={(val) => setCourse(String(val))}
                      options={COURSES.map((c) => ({ value: c, label: c === 'Any' ? 'Any Course' : c }))}
                      placeholder="Select Course"
                      ariaLabel="Course"
                    />
                  </div>

                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-[11px] font-bold text-ink-secondary font-mono truncate">
                        Department / Branch
                      </label>
                    </div>
                    <CustomSelect
                      value={department}
                      onChange={(val) => setDepartment(String(val))}
                      options={DEPARTMENTS.map((d) => ({ value: d, label: d === 'Any' ? 'Any Department' : d }))}
                      placeholder="Select Department"
                      ariaLabel="Department / Branch"
                    />
                  </div>

                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-[11px] font-bold text-ink-secondary font-mono truncate">
                        Academic Year
                      </label>
                    </div>
                    <CustomSelect
                      value={year}
                      onChange={(val) => setYear(String(val))}
                      options={YEARS.map((y) => ({ value: y, label: y === 'Any' ? 'Any Year' : `${y} Year` }))}
                      placeholder="Select Academic Year"
                      ariaLabel="Academic Year"
                    />
                  </div>

                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-[11px] font-bold text-ink-secondary font-mono truncate">
                        Semester
                      </label>
                    </div>
                    <CustomSelect
                      value={semester}
                      onChange={(val) => setSemester(String(val))}
                      options={SEMESTERS.map((s) => ({ value: s, label: s === 'Any' ? 'Any Semester' : `${s} Sem` }))}
                      placeholder="Select Semester"
                      ariaLabel="Semester"
                    />
                  </div>
                </div>

                {/* Quick Affinity Toggles */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-ink-muted font-mono">
                    Priority Toggles:
                  </span>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSameCourseSemOnly(!sameCourseSemOnly)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs ${
                      sameCourseSemOnly
                        ? 'bg-plum text-white border-plum neu-sunken shadow-inner font-bold'
                        : 'bg-paper text-ink-primary border-border/80 neu-btn hover:border-plum/40 shadow-xs'
                    }`}
                  >
                    🎓 Same Course &amp; Sem Only
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSameDepartmentOnly(!sameDepartmentOnly)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs ${
                      sameDepartmentOnly
                        ? 'bg-forest text-white border-forest neu-sunken shadow-inner font-bold'
                        : 'bg-paper text-ink-primary border-border/80 neu-btn hover:border-forest/40 shadow-xs'
                    }`}
                  >
                    📚 Same Department Only
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSameCollegeOnly(!sameCollegeOnly)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs ${
                      sameCollegeOnly
                        ? 'bg-plum-dark text-white border-plum-dark neu-sunken shadow-inner font-bold'
                        : 'bg-paper text-ink-primary border-border/80 neu-btn hover:border-plum/40 shadow-xs'
                    }`}
                  >
                    🏛️ Same College Only
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs ${
                      verifiedOnly
                        ? 'bg-amber-700 text-white border-amber-700 neu-sunken shadow-inner font-bold'
                        : 'bg-paper text-ink-primary border-border/80 neu-btn hover:border-amber-700/40 shadow-xs'
                    }`}
                  >
                    🛡️ Verified Students Only
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <motion.label
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none px-4 py-2.5 rounded-2xl border transition-all whitespace-nowrap shadow-2xs ${
                womenOnlyDriver
                  ? 'bg-pink-50 border-pink-300 text-pink-900 neu-sunken shadow-inner font-bold'
                  : 'bg-paper border-border/80 text-ink-primary neu-btn hover:border-pink-300 shadow-xs'
              }`}
            >
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                womenOnlyDriver ? 'bg-pink-600 border-pink-600 text-white' : 'border-slate-300 bg-canvas'
              }`}>
                {womenOnlyDriver && <span className="text-[10px] leading-none">✓</span>}
              </div>
              <input
                type="checkbox"
                checked={womenOnlyDriver}
                onChange={(e) => setWomenOnlyDriver(e.target.checked)}
                className="sr-only"
              />
              <span className="flex items-center gap-1 font-bold">
                🛡️ Women-Only Driver Filter (Hard Filter)
              </span>
            </motion.label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-forest hover:bg-[#0f2e26] disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer neu-btn"
              >
                <Search className="w-4 h-4" />
                {loading ? 'Matching...' : 'Search Matching Rides'}
              </button>
            </div>
          </div>
        </form>
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

      {/* Pending / Unverified Institutional ID Notice */}
      {user && !isUserVerified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
                <span>Student ID Verification In Review</span>
                <span className="text-[10px] font-mono uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 font-bold">
                  {user.verificationStatus || 'Pending'}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                In compliance with university transit bylaws, seat booking is temporarily paused while campus security reviews your student credentials. You can browse all routes in real time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/verification')}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>View ID Status & Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Available Matching Rides</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold">
            <AnimatedCounter value={rides.length} duration={0.6} />
          </span>
        </h2>
        <span className="text-xs text-slate-500">Sorted by Route Proximity First, then Academic Affinity</span>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-6">
          <RideTicketSkeleton count={3} />
        </div>
      ) : rides.length === 0 ? (
        <EmptyState
          variant="no-rides"
          description={
            womenOnlyDriver
              ? 'Zero rides match the women-only driver filter for this route/time. Try unchecking the filter or browsing all available campus commutes!'
              : 'No rides match the selected route and academic filters. Try resetting the academic filters or browse all active university carpools.'
          }
          actionText="Offer a Ride for This Route"
          onAction={() => {
            const orig = PRESET_LOCATIONS[originIndex]?.text || '';
            const dst = PRESET_LOCATIONS[destIndex]?.text || '';
            navigate(`/post?from=${encodeURIComponent(orig)}&to=${encodeURIComponent(dst)}`);
          }}
          secondaryActionText="Reset Filters to 'Any'"
          onSecondaryAction={resetAcademicFilters}
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.04,
              },
            },
          }}
          className="grid grid-cols-1 gap-4"
        >
          {rides.map((ride) => {
            const isCreator = ride.creator?._id === user?._id;
            const isTier1 = ride.match?.breakdown?.sameCourseAndSemester;
            const isTier2 = !isTier1 && ride.match?.breakdown?.sameDepartment;
            const isTier3 = !isTier1 && !isTier2 && ride.match?.breakdown?.sameCollege;

            return (
              <motion.div
                key={ride._id}
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 350,
                      damping: 26,
                    },
                  },
                }}
                className="space-y-3"
              >
                {/* Inline Expandable Pickup & Route Map displayed ON TOP of the ticket block */}
                {expandedMapRideId === ride._id && (
                  <div className="p-4 sm:p-5 bg-paper rounded-3xl border border-[#E2DDD3] shadow-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-border/70">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-forest">
                        <MapPin className="w-4 h-4 text-forest shrink-0" />
                        <span>Route &amp; Waypoint Navigation: {ride.origin.text} → {ride.destination.text}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedMapRideId(null)}
                        className="text-xs font-mono font-bold text-plum hover:text-plum-hover px-2.5 py-1 rounded-lg bg-plum-light cursor-pointer transition-colors"
                      >
                        ✕ Close Map
                      </button>
                    </div>
                    <PickupAndRouteNavigationMap
                      originText={ride.origin.text}
                      destinationText={ride.destination.text}
                      compact={true}
                    />
                  </div>
                )}

                <JourneyTicket
                  ride={{
                    _id: ride._id,
                    creator: ride.creator,
                    origin: ride.origin,
                    destination: ride.destination,
                    departureTime: ride.departureTime,
                    seatsAvailable: ride.availableSeats ?? (ride as any).seatsAvailable,
                    availableSeats: ride.availableSeats,
                    seatsTotal: ride.totalSeats,
                    fare: (ride as any).pricePerSeat ?? (ride as any).fare ?? 20,
                    vehicleModel: ride.vehicleId?.model,
                    vehiclePlate: ride.vehicleId?.plateLast4,
                    notes: ride.notes,
                    isWomenOnly: (ride as any).isWomenOnly || (ride as any).womenOnlyDriver,
                  }}
                  isCurrentUserCreator={isCreator}
                  isUserVerified={isUserVerified}
                  isRequested={requestedRideIds.has(ride._id)}
                  requestLoading={requestingId === ride._id}
                  isMapOpen={expandedMapRideId === ride._id}
                  onRequestSeat={(id) => handleRequestRide(id)}
                  onCancelRequest={(id) => setCancelModalRideId(id)}
                  onViewDetails={(id) => navigate(`/rides/${id}`)}
                  onToggleMap={(id) =>
                    setExpandedMapRideId(expandedMapRideId === id ? null : id)
                  }
                  onVerifyPrompt={() => navigate('/verification')}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Accessible Cancel Seat Request Confirmation Dialog */}
      {cancelModalRideId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-seat-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 animate-in fade-in duration-150"
        >
          <div className="bg-surface rounded-card border border-line-base p-6 max-w-md w-full shadow-card space-y-4">
            <h3 id="cancel-seat-title" className="text-base font-display font-bold text-ink-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emergency-crimson shrink-0" />
              <span>Withdraw Seat Request?</span>
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
              Are you sure you want to cancel your seat request for this campus ride? The driver will be notified and your reservation slot will be returned to the open pool.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalRideId(null)}
                className="px-4 py-2 rounded-control border border-line-base text-ink-secondary text-xs font-semibold hover:bg-canvas transition-colors min-h-[44px] cursor-pointer"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={() => handleCancelRequest(cancelModalRideId)}
                className="px-4 py-2 rounded-control bg-emergency-crimson hover:bg-red-700 text-surface text-xs font-semibold shadow-2xs active:translate-y-[1.5px] transition-all min-h-[44px] cursor-pointer"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
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

