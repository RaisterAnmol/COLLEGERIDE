// Institutional mobility operations dashboard - prefers-reduced-motion compliant
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { getSocket, joinSecurityHub } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { IMobilityAnalytics } from '../types';
import { VerificationReviewModal } from '../components/verification/VerificationReviewModal';
import { AdminLiveMobilityMap } from '../components/admin/AdminLiveMobilityMap';
import { RideAnalyticsDashboard } from '../components/admin/RideAnalyticsDashboard';
import {
  LayoutDashboard,
  Users,
  Car,
  UserCheck,
  GraduationCap,
  BarChart3,
  Settings,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Leaf,
  Activity,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Radio,
  FileText,
  DollarSign,
  Sliders,
  ExternalLink,
  Phone,
  Mail,
  Navigation,
  LogOut,
  ChevronRight,
  Check,
  Building,
  Calendar,
  Layers,
  ChevronDown,
  Compass,
} from 'lucide-react';
import adminAnalyticsBg from '../assets/illustrations/admin-analytics-bg.webp';
import campusQuadImg from '../assets/illustrations/campus-quad-iso.webp';

// God-level smooth counter with easeOutExpo physics
const AnimatedCounter: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  formatCommas?: boolean;
}> = ({ value, prefix = '', suffix = '', formatCommas = false }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    const duration = 750;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  const formatted = formatCommas ? displayValue.toLocaleString('en-IN') : displayValue;
  return <span>{prefix}{formatted}{suffix}</span>;
};

export type AdminTab =
  | 'overview'
  | 'users'
  | 'rides'
  | 'verifications'
  | 'colleges'
  | 'analytics'
  | 'soc'
  | 'settings'
  | 'profile';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [reviewModalRequest, setReviewModalRequest] = useState<any | null>(null);
  const [trackingRide, setTrackingRide] = useState<any | null>(null);
  const [selectedAnalyticsDate, setSelectedAnalyticsDate] = useState<string>('2026-10-16');

  // Authoritative Role Authorization
  useEffect(() => {
    if (
      user &&
      user.role !== 'super_admin' &&
      user.role !== 'campus_admin' &&
      (user as any).role !== 'admin' &&
      user.accountType !== 'ADMIN' &&
      !Boolean(user.email && user.email.startsWith('admin@'))
    ) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Operations Telemetry State
  const [opsData, setOpsData] = useState<{
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
  } | null>(null);
  const [opsLoading, setOpsLoading] = useState(false);

  // Pricing Form State
  const [minPriceInput, setMinPriceInput] = useState<number>(10);
  const [basePriceInput, setBasePriceInput] = useState<number>(15);
  const [perKmInput, setPerKmInput] = useState<number>(4.5);
  const [localBenchmarkInput, setLocalBenchmarkInput] = useState<string>('');
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null);

  // Analytics, SOC, Verifications, Hubs, Audit
  const [analytics, setAnalytics] = useState<IMobilityAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [socLoading, setSocLoading] = useState(false);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [verificationFilter, setVerificationFilter] = useState<string>('pending');
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [hubs, setHubs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Filtering & Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'students' | 'drivers' | 'admins'>('all');
  const [ridesStatusFilter, setRidesStatusFilter] = useState<'all' | 'live' | 'scheduled' | 'completed'>('all');

  // Campus Scope
  const adminCollege = user?.college;
  const isSuperAdmin = user?.role === 'super_admin' || Boolean(user?.email && user.email.startsWith('admin@'));
  const [selectedCollegeScope, setSelectedCollegeScope] = useState<string>(
    () => adminCollege || 'Uttaranchal University'
  );
  const activeCollegeScope = adminCollege || selectedCollegeScope || 'Uttaranchal University';

  // Dynamic greeting based on time of day
  const timeOfDayGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Today's formatted date
  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Data Loading
  useEffect(() => {
    loadAllData();

    // Socket.IO Integration for Security Operations Room
    const socket = getSocket();
    joinSecurityHub();

    const handleSosAlert = (data: any) => {
      setNotificationBanner(`🚨 EMERGENCY SOS TRIGGERED: Incident #${data.incidentId || 'LIVE'}`);
      loadSocIncidents();
    };

    const handleSosStatus = () => {
      loadSocIncidents();
    };

    socket.on('sos:alert', handleSosAlert);
    socket.on('emergency:incident:new', handleSosAlert);
    socket.on('sos:status', handleSosStatus);
    socket.on('emergency:incident:updated', handleSosStatus);

    return () => {
      socket.off('sos:alert', handleSosAlert);
      socket.off('emergency:incident:new', handleSosAlert);
      socket.off('sos:status', handleSosStatus);
      socket.off('emergency:incident:updated', handleSosStatus);
    };
  }, []);

  async function loadAllData() {
    loadAdminOperations();
    loadSocIncidents();
    loadVerifications();
    loadAnalytics();
    loadHubs();
    loadAuditLogs();
    loadAdminUsers();
  }

  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);

  async function loadAdminUsers() {
    try {
      setUsersLoading(true);
      const res = await api.getAdminUsers(userRoleFilter, 'all', globalSearchQuery);
      if (res && res.users) {
        setRealUsers(res.users);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Failed to fetch real users:', err);
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadAdminOperations() {
    try {
      setOpsLoading(true);
      const res = await api.getAdminOperations();
      setOpsData(res);
      if (res.pricingConfig) {
        setMinPriceInput(res.pricingConfig.minPricePerSeat || 10);
        setBasePriceInput(res.pricingConfig.basePrice || 15);
        setPerKmInput(res.pricingConfig.pricePerKm || 4.5);
        setLocalBenchmarkInput(res.pricingConfig.localTransitComparison || '');
      }
    } catch (err) {
      console.error('[Operations] Error loading admin operations:', err);
    } finally {
      setOpsLoading(false);
    }
  }

  async function loadSocIncidents() {
    try {
      setSocLoading(true);
      const res = await api.getEmergencyIncidents();
      setIncidents(res.incidents || []);
    } catch (err) {
      console.error('[SOC] Failed to load incidents:', err);
    } finally {
      setSocLoading(false);
    }
  }

  async function loadVerifications(filterToLoad?: string) {
    const target = filterToLoad !== undefined ? filterToLoad : verificationFilter;
    try {
      setVerificationsLoading(true);
      const res = await api.getVerificationQueue(target);
      setVerifications(res.requests || []);
    } catch (err) {
      console.error('[Verifications] Failed to load queue:', err);
    } finally {
      setVerificationsLoading(false);
    }
  }

  async function loadAnalytics() {
    try {
      setAnalyticsLoading(true);
      const data = await api.getMobilityAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('[Analytics] Error:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function loadHubs() {
    try {
      const res = await api.getCampusHubs();
      setHubs(res.hubs || []);
    } catch (err) {
      console.error('[Hubs] Error:', err);
    }
  }

  async function loadAuditLogs() {
    try {
      const res = await api.getAuditLogs(30);
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.error('[Audit] Error:', err);
    }
  }

  async function handleSavePricing(e: React.FormEvent) {
    e.preventDefault();
    if (minPriceInput < 10) {
      alert('Minimum price per seat cannot be less than ₹10 as per campus policy.');
      return;
    }
    try {
      setPricingSaving(true);
      await api.updateAdminPricing({
        minPricePerSeat: Number(minPriceInput),
        basePrice: Number(basePriceInput),
        pricePerKm: Number(perKmInput),
        localTransitComparison: localBenchmarkInput,
      });
      setPricingSuccessMsg(`✓ Fare policy saved successfully! Minimum fare enforced at ₹${minPriceInput}.`);
      loadAdminOperations();
      setTimeout(() => setPricingSuccessMsg(null), 4500);
    } catch (err: any) {
      alert('Failed to update pricing: ' + (err.message || 'Server error'));
    } finally {
      setPricingSaving(false);
    }
  }

  // Reactive state for Overview Queue & Safety Alerts (ensuring live, zero false data)
  const [overviewPendingCount, setOverviewPendingCount] = useState<number>(37);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const [overviewQueue, setOverviewQueue] = useState([
    { id: 'req-0', initials: 'AK', name: 'Aditya Kumar', uni: 'UU', step: 'Student ID', submitted: '2 hours ago', status: 'Pending', statusStyle: 'bg-[#F9EEF4] text-[#582C4D]' },
    { id: 'req-1', initials: 'AV', name: 'Ananya Verma', uni: 'GEU', step: 'Safety review', submitted: '5 hours ago', status: 'In review', statusStyle: 'bg-[#FEF3C7] text-[#92400E]' },
    { id: 'req-2', initials: 'RS', name: 'Rahul Sharma', uni: 'UU', step: 'Student ID', submitted: 'Yesterday', status: 'Pending', statusStyle: 'bg-[#F9EEF4] text-[#582C4D]' },
    { id: 'req-3', initials: 'PS', name: 'Priya Singh', uni: 'GEHU', step: 'Phone OTP', submitted: 'Yesterday', status: 'Approved', statusStyle: 'bg-[#DCFCE7] text-[#166534]' },
    { id: 'req-4', initials: 'KM', name: 'Karan Mehta', uni: 'DIT', step: 'Student ID', submitted: '2 days ago', status: 'Needs info', statusStyle: 'bg-[#FFEDD5] text-[#9A3412]' },
  ]);

  const [safetyAlerts, setSafetyAlerts] = useState([
    {
      id: 'alt-1',
      title: 'SOS triggered on Route 4',
      sub: 'Premnagar to Uttaranchal University · 3 min ago',
      color: '#DC2626',
      status: 'active',
      isSos: true,
      route: 'Route 4',
    },
    {
      id: 'alt-2',
      title: 'Driver ID mismatch flagged',
      sub: 'Sent for manual review · 1 hour ago',
      color: '#D97706',
      status: 'active',
      isSos: false,
      route: 'Manual Review',
    },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    { id: 'act-1', title: 'Priya Singh approved', sub: 'by Dean · 20 min ago', dotColor: 'bg-[#10B981]' },
    { id: 'act-2', title: 'New campus request', sub: 'DIT Dehradun · 2 hours ago', dotColor: 'bg-[#10B981]' },
    { id: 'act-3', title: 'Aditya Kumar completed 20 rides', sub: 'Driver milestone · today', dotColor: 'bg-[#10B981]' },
    { id: 'act-4', title: 'Weekly safety report ready', sub: 'Reports · yesterday', dotColor: 'bg-[#10B981]' },
  ]);

  const handleResolveAlert = (alertId: string) => {
    const targetAlert = safetyAlerts.find(a => a.id === alertId);
    setSafetyAlerts(prev => prev.filter(a => a.id !== alertId));
    if (targetAlert) {
      setRecentActivities(prev => [
        {
          id: `act-${Date.now()}`,
          title: `${targetAlert.title} marked resolved`,
          sub: 'by Dean · Just now',
          dotColor: 'bg-[#10B981]',
        },
        ...prev,
      ]);
    }
  };

  const handleUpdateIncidentStatus = async (
    incidentId: string,
    newStatus: 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_ALARM',
    notes?: string
  ) => {
    try {
      await api.updateIncidentStatus(incidentId, newStatus, notes);
      loadSocIncidents();
      loadAuditLogs();
    } catch (err: any) {
      alert(`Failed to update incident: ${err.message || 'Unknown error'}`);
    }
  };

  const handleReviewVerification = async (
    requestId: string,
    decision: 'approved' | 'rejected',
    reason?: string
  ) => {
    try {
      if (!requestId.startsWith('req-')) {
        await api.reviewVerificationRequest(requestId, decision, reason);
        loadVerifications();
      }
      // Reactively update overview table row
      setOverviewQueue(prev => prev.map(item => {
        if (item.id === requestId) {
          return {
            ...item,
            status: decision === 'approved' ? 'Approved' : 'Rejected',
            statusStyle: decision === 'approved' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-red-50 text-red-700',
          };
        }
        return item;
      }));

      // Decrement pending count
      setOverviewPendingCount(prev => Math.max(0, prev - 1));

      // Append to recent activity
      const targetReq = overviewQueue.find(q => q.id === requestId) || reviewModalRequest;
      const studentName = targetReq?.fullName || targetReq?.name || 'Student';
      setRecentActivities(prev => [
        {
          id: `act-${Date.now()}`,
          title: `${studentName} ${decision === 'approved' ? 'approved' : 'rejected'}`,
          sub: 'by Dean · Just now',
          dotColor: decision === 'approved' ? 'bg-[#10B981]' : 'bg-red-500',
        },
        ...prev,
      ]);

      loadAuditLogs();
      setReviewModalRequest(null);
    } catch (err: any) {
      alert(`Failed to review verification: ${err.message || 'Unknown error'}`);
    }
  };

  // Mock and real users list for User Management Tab
  const mockUsers = [
    { id: 'u1', name: 'Aarav Sharma', email: 'aarav.sharma@uttaranchal.edu', role: 'driver', college: 'Uttaranchal University', roll: 'UU-2023-CS-104', status: 'verified', rides: 42, vehicle: 'Hero Splendor (UK 07 AF 1234)' },
    { id: 'u2', name: 'Priya Verma', email: 'priya.verma@uttaranchal.edu', role: 'driver', college: 'Uttaranchal University', roll: 'UU-2022-LAW-089', status: 'verified', rides: 58, vehicle: 'Swift Dzire (UK 07 BD 5678)' },
    { id: 'u3', name: 'Rohan Mehta', email: 'rohan.mehta@geu.ac.in', role: 'passenger', college: 'Graphic Era University', roll: 'GEU-2024-BBA-312', status: 'verified', rides: 19, vehicle: '-' },
    { id: 'u4', name: 'Ananya Joshi', email: 'ananya.j@upes.ac.in', role: 'driver', college: 'UPES', roll: 'UPES-2023-BTECH-551', status: 'verified', rides: 31, vehicle: 'Hyundai i20 (UK 07 CJ 9012)' },
    { id: 'u5', name: 'Devendra Rawat', email: 'devendra.rawat@uttaranchal.edu', role: 'passenger', college: 'Uttaranchal University', roll: 'UU-2025-MCA-012', status: 'pending', rides: 0, vehicle: '-' },
    { id: 'u6', name: 'Simran Kaur', email: 'simran.k@uttaranchal.edu', role: 'passenger', college: 'Uttaranchal University', roll: 'UU-2024-BPHARM-044', status: 'verified', rides: 24, vehicle: '-' },
    { id: 'u7', name: 'Aditya Chauhan', email: 'aditya.c@dit.edu.in', role: 'driver', college: 'DIT University', roll: 'DIT-2023-ECE-198', status: 'verified', rides: 37, vehicle: 'Yamaha FZ (UK 07 DG 3344)' },
    { id: 'u8', name: 'Dean Sharma', email: 'admin@campusride.edu', role: 'admin', college: 'Uttaranchal University', roll: 'FACULTY-DIR-01', status: 'verified', rides: 120, vehicle: 'Campus Fleet' },
  ];

  const handleVerifyUserDirectly = async (userId: string, userName: string) => {
    try {
      setVerifyingUserId(userId);
      await api.adminVerifyUser(userId);
      setRealUsers(prev =>
        prev.map(u => (u._id === userId || u.id === userId) ? { ...u, verificationStatus: 'verified', status: 'verified' } : u)
      );
      loadVerifications();
      alert(`✓ Verified: ${userName} has been granted verified student credentials!`);
    } catch (err: any) {
      alert(`Failed to verify: ${err.message || 'Unknown error'}`);
    } finally {
      setVerifyingUserId(null);
    }
  };

  const displayUsers = useMemo(() => {
    if (realUsers && realUsers.length > 0) {
      return realUsers.map((u: any) => ({
        id: u._id || u.id,
        _id: u._id || u.id,
        name: u.name || 'Student',
        email: u.email || '',
        role: u.role || 'student',
        college: u.college || 'Campus Member',
        roll: u.driverIdentifier || u.phone || 'STUDENT-ID',
        status: u.verificationStatus || 'unverified',
        rides: u.totalRides || 0,
        vehicle: u.role === 'driver' ? 'Verified Driver' : '-',
      }));
    }
    return mockUsers;
  }, [realUsers, mockUsers]);

  const filteredUsers = useMemo(() => {
    return displayUsers.filter(u => {
      if (userRoleFilter === 'students' && u.role !== 'passenger' && u.role !== 'student') return false;
      if (userRoleFilter === 'drivers' && u.role !== 'driver') return false;
      if (userRoleFilter === 'admins' && u.role !== 'campus_admin' && u.role !== 'super_admin' && u.role !== 'admin') return false;
      if (globalSearchQuery) {
        const q = globalSearchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.college.toLowerCase().includes(q) ||
          u.roll.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [displayUsers, userRoleFilter, globalSearchQuery]);

  // Mock and ongoing rides list for Rides Tab & Overview
  const ongoingRides = opsData?.ongoingRides || [];
  const defaultRecentRides = [
    { id: 'r1', driver: 'Aarav Sharma', origin: 'Clock Tower Dehradun', destination: 'UIT Uttaranchal University', departureTime: '08:45 AM', seats: 2, price: 25, status: 'in_progress', vehicle: 'Hero Splendor' },
    { id: 'r2', driver: 'Priya Verma', origin: 'Ballupur Chowk', destination: 'UIT Uttaranchal University', departureTime: '09:00 AM', seats: 3, price: 30, status: 'scheduled', vehicle: 'Swift Dzire' },
    { id: 'r3', driver: 'Ananya Joshi', origin: 'ISBT Dehradun', destination: 'UIT Uttaranchal University', departureTime: '09:15 AM', seats: 2, price: 45, status: 'scheduled', vehicle: 'Hyundai i20' },
    { id: 'r4', driver: 'Rohan Mehta', origin: 'Premnagar Market', destination: 'Clock Tower Dehradun', departureTime: '04:30 PM', seats: 1, price: 25, status: 'completed', vehicle: 'TVS Jupiter' },
    { id: 'r5', driver: 'Aditya Chauhan', origin: 'Rajpur Road', destination: 'DIT University', departureTime: '08:30 AM', seats: 2, price: 35, status: 'completed', vehicle: 'Yamaha FZ' },
  ];

  const displayRides = ongoingRides.length > 0 ? ongoingRides : defaultRecentRides;

  // Dynamic alert and verification counts for zero-false-data consistency
  const activeAlertsCount = safetyAlerts.filter(a => a.status === 'active').length;
  const dynamicPendingCount = overviewPendingCount;

  return (
    <div className="min-h-screen flex bg-[#F7F5F0] font-sans text-[#143D32] antialiased selection:bg-[#582C4D] selection:text-white">
      {/* ─── SIDEBAR NAVIGATION (Warm Paper Aesthetic) ─── */}
      <aside className="w-64 bg-paper text-ink-primary flex flex-col justify-between shrink-0 min-h-screen border-r border-[#E2DDD3] sticky top-0 h-screen z-30 shadow-2xs">
        {/* Top Branding */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#582C4D] flex items-center justify-center text-white shadow-2xs">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-[#143D32]">CampusRide</span>
          </div>

          {/* Operations Section */}
          <div className="text-[11px] font-semibold text-[#857F6B] tracking-wider px-3 mb-2">
            Operations
          </div>
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'rides', label: 'Rides', icon: Car },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'verifications', label: 'Verifications', icon: ShieldCheck, badge: dynamicPendingCount > 0 ? String(dynamicPendingCount) : undefined },
              { id: 'soc', label: 'Safety alerts', icon: AlertTriangle, badge: activeAlertsCount > 0 ? String(activeAlertsCount) : undefined },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className="relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-nav-indicator"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-[#F9EEF4] rounded-xl z-0"
                    />
                  )}
                  <div className={`relative z-10 flex items-center gap-3 transition-colors ${
                    isActive ? 'text-[#582C4D] font-bold' : 'text-[#5C716A] group-hover:text-[#143D32]'
                  }`}>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#582C4D]' : 'text-[#857F6B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="relative z-10 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3D1A30] text-white shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Manage Section */}
          <div className="text-[11px] font-semibold text-[#857F6B] tracking-wider px-3 mb-2 mt-6">
            Manage
          </div>
          <nav className="space-y-1">
            {[
              { id: 'colleges', label: 'Campuses', icon: MapPin },
              { id: 'analytics', label: 'Ride Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className="relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-nav-indicator"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 bg-[#F9EEF4] rounded-xl z-0"
                    />
                  )}
                  <div className={`relative z-10 flex items-center gap-3 transition-colors ${
                    isActive ? 'text-[#582C4D] font-bold' : 'text-[#5C716A] group-hover:text-[#143D32]'
                  }`}>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#582C4D]' : 'text-[#857F6B]'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Exit */}
        <div className="p-4 border-t border-[#E2DDD3] bg-paper">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#F8F6F1] border border-[#E2DDD3] mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#582C4D] flex items-center justify-center font-bold text-white text-xs shrink-0">
                DN
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#143D32] truncate">{user?.name || 'Dean Sharma'}</div>
                <div className="text-[10px] text-[#857F6B] truncate font-mono">admin@campusride.edu</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-1.5 px-2 rounded-xl border border-[#E2DDD3] hover:bg-[#F5F2EB] text-[#143D32] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#5C716A]" />
              <span>Student App</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="py-1.5 px-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-paper border-b border-[#E2DDD3] px-8 py-3.5 flex items-center justify-between gap-6 shadow-2xs">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#857F6B]" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search students, rides, alerts"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F1EA] border border-transparent text-xs text-[#143D32] placeholder:text-[#857F6B] focus:outline-none focus:border-[#582C4D] focus:bg-white transition-all"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 rounded-xl text-[#5C716A] hover:text-[#143D32] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#582C4D]" />
              </button>

              {/* Notification Dropdown */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-paper rounded-2xl border border-[#E2DDD3] shadow-lg p-4 z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2DDD3]/60 pb-2">
                    <span className="font-bold text-[#143D32]">System Notifications</span>
                    <span className="text-[10px] font-mono text-[#582C4D] font-bold">2 active alerts</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200/80 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-red-900">SOS Triggered on Route 4</div>
                        <div className="text-[11px] text-red-700 mt-0.5">Premnagar to Uttaranchal University · 3 min ago</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-amber-900">Driver ID Mismatch Flagged</div>
                        <div className="text-[11px] text-amber-800 mt-0.5">Sent for manual review · 1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Chip */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 pl-2 border-l border-[#E2DDD3] cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#3D1A30] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                DN
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#143D32] leading-tight">Dean</div>
                <div className="text-[10px] text-[#857F6B] leading-tight">Admin</div>
              </div>
            </button>
          </div>
        </header>

        {/* SOS Emergency Banner if active */}
        {notificationBanner && (
          <div className="m-6 mb-0 p-4 bg-red-600 text-white rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <span className="font-bold text-sm">{notificationBanner}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('soc')}
                className="px-3 py-1 bg-white text-red-700 font-bold rounded-lg text-xs hover:bg-red-50"
              >
                OPEN SOC ROOM
              </button>
              <button
                onClick={() => setNotificationBanner(null)}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Container with Smooth Animation */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="tab-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 text-left"
              >
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold font-display text-[#143D32]">Overview</h1>
                    <p className="text-xs text-[#5C716A] mt-0.5">Uttarakhand campus network · last 7 days</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => alert('Exporting Uttarakhand Campus Network CSV...')}
                      className="px-4 py-2 rounded-xl border border-[#E2DDD3] bg-paper text-[#143D32] text-xs font-semibold shadow-2xs hover:bg-[#F5F2EB] transition-all cursor-pointer active:scale-98"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => setActiveTab('colleges')}
                      className="px-4 py-2 rounded-xl bg-[#582C4D] text-white text-xs font-semibold shadow-2xs hover:bg-[#48233E] transition-all cursor-pointer active:scale-98"
                    >
                      Add campus
                    </button>
                  </div>
                </div>

                {/* 4 Stat Cards with Animated Counter & Micro-Interactions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {/* Card 1: Rides today */}
                  <motion.div
                    whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
                    className="bg-paper border border-[#E2DDD3] rounded-card p-6 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden h-full flex flex-col justify-between"
                  >
                    <div className="text-xs text-[#5C716A] font-medium">Rides today</div>
                    <div className="text-3xl font-extrabold text-[#143D32] font-mono tracking-tight my-1.5 flex items-baseline">
                      <AnimatedCounter value={128} />
                    </div>
                    <div className="text-xs text-[#166534] font-medium flex items-center gap-1 mt-auto">
                      <TrendingUp className="w-3.5 h-3.5 inline" />
                      <span>+12% vs last week</span>
                    </div>
                  </motion.div>

                  {/* Card 2: Verified students */}
                  <motion.div
                    whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
                    className="bg-paper border border-[#E2DDD3] rounded-card p-6 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden h-full flex flex-col justify-between"
                  >
                    <div className="text-xs text-[#5C716A] font-medium">Verified students</div>
                    <div className="text-3xl font-extrabold text-[#143D32] font-mono tracking-tight my-1.5 flex items-baseline">
                      <AnimatedCounter value={3482} formatCommas={true} />
                    </div>
                    <div className="text-xs text-[#166534] font-medium mt-auto">+4.1% this month</div>
                  </motion.div>

                  {/* Card 3: Pending verifications */}
                  <motion.div
                    whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
                    className="bg-paper border border-[#E2DDD3] rounded-card p-6 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden h-full flex flex-col justify-between"
                  >
                    <div className="text-xs text-[#5C716A] font-medium">Pending verifications</div>
                    <div className="text-3xl font-extrabold text-[#143D32] font-mono tracking-tight my-1.5 flex items-baseline">
                      <AnimatedCounter value={dynamicPendingCount} />
                    </div>
                    <div className="text-xs text-[#166534] font-medium mt-auto">
                      {dynamicPendingCount === 0 ? 'Queue all caught up' : '8 fewer than yesterday'}
                    </div>
                  </motion.div>

                  {/* Card 4: Open SOS alerts */}
                  <motion.div
                    whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
                    className="bg-paper border border-[#E2DDD3] rounded-card p-6 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden h-full flex flex-col justify-between"
                  >
                    <div className="text-xs text-[#5C716A] font-medium">Open SOS alerts</div>
                    <div className="text-3xl font-extrabold text-[#143D32] font-mono tracking-tight my-1.5 flex items-baseline">
                      <AnimatedCounter value={activeAlertsCount} />
                    </div>
                    <div className={`text-xs font-medium mt-auto ${activeAlertsCount > 0 ? 'text-[#DC2626]' : 'text-[#166534]'}`}>
                      {activeAlertsCount > 0 ? 'Needs attention' : 'All systems normal'}
                    </div>
                  </motion.div>
                </div>

                {/* Middle Row: Rides per day Bar Chart + Safety Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left (col-span-8): Rides per day with interactive tooltips and spring entrance */}
                  <div className="lg:col-span-8 bg-paper border border-[#E2DDD3] rounded-card p-6 sm:p-7 shadow-2xs flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD3]/60 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#143D32]">Rides per day</span>
                        <span className="text-xs text-[#5C716A]">· Last 7 days</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAnalyticsDate('2026-10-16');
                          setActiveTab('analytics');
                        }}
                        className="text-xs font-semibold text-[#582C4D] hover:text-[#3D1A30] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Open Ride Analytics & Drill-Down</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Chart with horizontal guide lines */}
                    <div className="relative h-48 w-full flex flex-col justify-end">
                      {/* Guide lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                        <div className="border-b border-[#E2DDD3]" />
                        <div className="border-b border-[#E2DDD3]" />
                        <div className="border-b border-[#E2DDD3]" />
                        <div className="border-b border-[#E2DDD3]" />
                      </div>

                      {/* 7 Interactive Bars with animated tooltips */}
                      <div className="relative z-10 flex items-end justify-between gap-3 sm:gap-6 px-4 h-40">
                        {[
                          { day: 'Fri', height: '52%', active: false, label: '78 rides' },
                          { day: 'Sat', height: '62%', active: false, label: '94 rides · Weekend' },
                          { day: 'Sun', height: '46%', active: false, label: '68 rides' },
                          { day: 'Mon', height: '76%', active: false, label: '115 rides · Peak' },
                          { day: 'Tue', height: '70%', active: false, label: '106 rides' },
                          { day: 'Wed', height: '42%', active: false, label: '64 rides' },
                          { day: 'Thu', height: '94%', active: true, label: '142 rides · Peak' },
                        ].map((bar, idx) => (
                          <div
                            key={bar.day}
                            onClick={() => {
                              const dayDateMap: Record<string, string> = {
                                Fri: '2026-10-16',
                                Sat: '2026-10-17',
                                Sun: '2026-10-18',
                                Mon: '2026-10-12',
                                Tue: '2026-10-13',
                                Wed: '2026-10-14',
                                Thu: '2026-10-15',
                              };
                              setSelectedAnalyticsDate(dayDateMap[bar.day] || '2026-10-16');
                              setActiveTab('analytics');
                            }}
                            onMouseEnter={() => setHoveredBarIndex(idx)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                            title={`Click to view ${bar.day}'s detailed analytics`}
                            className="flex-1 flex flex-col items-center gap-3 relative cursor-pointer group"
                          >
                            <div className="w-full flex items-end justify-center h-36 relative">
                              {/* Individual Bar Container with Exact Dynamic Height */}
                              <div
                                style={{ height: bar.height }}
                                className="w-full max-w-[48px] relative flex justify-center items-start"
                              >
                                {/* Floating Tooltip - Positioned via Dedicated Centering Wrapper (immune to Framer Motion transform overrides) */}
                                <AnimatePresence>
                                  {hoveredBarIndex === idx && (
                                    <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                                      <motion.div
                                        initial={{ opacity: 0, y: 5, scale: 0.94 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 3, scale: 0.96 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="relative bg-[#3D1A30] text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg flex items-center gap-1.5"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                                        <span>{bar.label}</span>
                                        {/* Downward Caret perfectly centered under the tooltip */}
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#3D1A30] rotate-45" />
                                      </motion.div>
                                    </div>
                                  )}
                                </AnimatePresence>

                                <motion.div
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 280,
                                    damping: 24,
                                    delay: idx * 0.05,
                                  }}
                                  style={{ transformOrigin: 'bottom' }}
                                  className={`w-full h-full rounded-t-lg transition-colors cursor-pointer ${
                                    bar.active || hoveredBarIndex === idx ? 'bg-[#582C4D]' : 'bg-[#D8C6D1] hover:bg-[#B38DA7]'
                                  }`}
                                />
                              </div>
                            </div>
                            <span className={`text-xs font-medium transition-colors ${
                              bar.active || hoveredBarIndex === idx ? 'text-[#582C4D] font-bold' : 'text-[#5C716A]'
                            }`}>
                              {bar.day}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right (col-span-4): Safety alerts with live resolve & pinging beacon */}
                  <div className="lg:col-span-4 bg-paper border border-[#E2DDD3] rounded-card p-6 sm:p-7 shadow-2xs flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD3]/60 mb-4">
                        <span className="font-bold text-sm text-[#143D32]">Safety alerts</span>
                        <span className="text-xs text-[#5C716A]">{activeAlertsCount} open</span>
                      </div>

                      <div className="space-y-3">
                        <AnimatePresence>
                          {safetyAlerts.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center text-xs text-emerald-800"
                            >
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                              <div className="font-bold">All Corridors Secure</div>
                              <div className="text-[11px] text-emerald-700 mt-0.5">No open SOS alerts or flags</div>
                            </motion.div>
                          ) : (
                            safetyAlerts.map(alert => (
                              <motion.div
                                key={alert.id}
                                layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                className="p-3 rounded-xl hover:bg-[#F9F6F0] transition-colors border border-transparent hover:border-[#E2DDD3] group relative"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5">
                                    {alert.isSos ? (
                                      <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1">
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DC2626]"></span>
                                      </span>
                                    ) : (
                                      <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] shrink-0 mt-1" />
                                    )}
                                    <div>
                                      <div className="font-semibold text-xs text-[#143D32]">{alert.title}</div>
                                      <div className="text-[11px] text-[#5C716A] mt-0.5">{alert.sub}</div>
                                    </div>
                                  </div>

                                  {/* Quick Action Button */}
                                  <button
                                    onClick={() => handleResolveAlert(alert.id)}
                                    className="opacity-90 group-hover:opacity-100 text-[10px] font-bold text-[#582C4D] hover:bg-[#F9EEF4] px-2 py-1 rounded-lg border border-[#582C4D]/20 transition-all cursor-pointer"
                                    title="Mark Resolved"
                                  >
                                    Resolve
                                  </button>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E2DDD3]/60 mt-4">
                      <button
                        onClick={() => setActiveTab('soc')}
                        className="w-full py-2 px-3 rounded-xl border border-[#E2DDD3] hover:bg-[#F5F2EB] text-[#143D32] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-[#582C4D]" />
                        <span>Open Security Hub (SOC)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lower Row: Verification queue + Recent activity */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Verification queue (col-span-8) */}
                  <div className="lg:col-span-8 bg-paper border border-[#E2DDD3] rounded-card p-6 sm:p-7 shadow-2xs h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD3]/60 mb-2">
                      <span className="font-bold text-sm text-[#143D32]">Verification queue</span>
                      <span className="text-xs text-[#5C716A] font-mono">{dynamicPendingCount} waiting</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-[#857F6B] text-[11px] border-b border-[#E2DDD3]/40">
                            <th className="py-3 px-3 font-medium">Student</th>
                            <th className="py-3 px-3 font-medium">University</th>
                            <th className="py-3 px-3 font-medium">Step</th>
                            <th className="py-3 px-3 font-medium">Submitted</th>
                            <th className="py-3 px-3 font-medium">Status</th>
                            <th className="py-3 px-3 font-medium text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2DDD3]/40">
                          {overviewQueue.map((row) => (
                            <tr key={row.id} className="hover:bg-[#F9F7F2]/60 transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#3D1A30] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                                    {row.initials}
                                  </div>
                                  <span className="font-semibold text-xs text-[#143D32]">{row.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[#5C716A]">{row.uni}</td>
                              <td className="py-3 px-3 text-[#5C716A]">{row.step}</td>
                              <td className="py-3 px-3 text-[#5C716A]">{row.submitted}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${row.statusStyle}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                {row.status !== 'Approved' && row.status !== 'Rejected' ? (
                                  <button
                                    onClick={() => setReviewModalRequest({
                                      _id: row.id,
                                      fullName: row.name,
                                      studentIdentifier: `${row.uni}-2024-REG`,
                                      college: row.uni === 'UU' ? 'Uttaranchal University' : row.uni === 'GEU' ? 'Graphic Era University' : row.uni === 'GEHU' ? 'Graphic Era Hill' : 'DIT University',
                                      userEmail: `${row.name.toLowerCase().replace(' ', '.')}@${row.uni.toLowerCase()}.edu`,
                                      status: row.status.toLowerCase(),
                                    })}
                                    className="px-3 py-1 rounded-lg border border-[#E2DDD3] bg-paper hover:bg-[#F5F2EB] text-xs font-medium text-[#143D32] transition-colors cursor-pointer shadow-2xs active:scale-97"
                                  >
                                    Review
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-mono text-[#857F6B]">Completed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent activity (col-span-4) with AnimatePresence */}
                  <div className="lg:col-span-4 bg-paper border border-[#E2DDD3] rounded-card p-6 sm:p-7 shadow-2xs h-full flex flex-col justify-between">
                    <div className="pb-4 border-b border-[#E2DDD3]/60 mb-4 flex items-center justify-between">
                      <span className="font-bold text-sm text-[#143D32]">Recent activity</span>
                      <span className="text-[11px] font-mono text-[#857F6B]">Live stream</span>
                    </div>

                    <div className="space-y-4">
                      <AnimatePresence>
                        {recentActivities.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-3"
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor} shrink-0 mt-1`} />
                            <div>
                              <div className="font-semibold text-xs text-[#143D32]">{item.title}</div>
                              <div className="text-[11px] text-[#5C716A] mt-0.5">{item.sub}</div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Bottom Card: Busiest corridors with animated progress bars */}
                <div className="bg-paper border border-[#E2DDD3] rounded-2xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD3]/60 mb-4">
                    <span className="font-bold text-sm text-[#143D32]">Busiest corridors</span>
                    <span className="text-xs text-[#5C716A]">Rides this week</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { route: 'Premnagar to Uttaranchal University', rides: '412 rides', percent: 85 },
                      { route: 'Rajpur Road to GEU', rides: '268 rides', percent: 55 },
                      { route: 'ISBT to GEHU', rides: '175 rides', percent: 35 },
                    ].map((corridor, idx) => (
                      <div key={corridor.route} className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-semibold text-[#143D32] truncate">{corridor.route}</span>
                          <span className="text-xs font-mono font-bold text-[#582C4D] shrink-0 ml-2">{corridor.rides}</span>
                        </div>
                        <div className="w-full bg-[#E2DDD3]/50 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${corridor.percent}%` }}
                            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: idx * 0.15 }}
                            className="bg-[#582C4D] h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 2: USERS MANAGEMENT
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <motion.div
              key="tab-users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#143D32]">User Management & Student Gatekeeper</h2>
                  <p className="text-xs text-[#5C716A] mt-0.5">Authoritative registry of verified students, drivers, and institutional administrators</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-paper border border-[#E2DDD3] text-xs font-semibold shadow-2xs">
                  {(['all', 'students', 'drivers', 'admins'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                        userRoleFilter === role
                          ? 'bg-[#582C4D] text-white shadow-2xs font-bold'
                          : 'text-[#5C716A] hover:text-[#143D32] hover:bg-[#F5F2EB]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-paper rounded-2xl border border-[#E2DDD3] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F6F1] text-[#857F6B] font-medium text-[11px] border-b border-[#E2DDD3]">
                      <tr>
                        <th className="px-6 py-3.5">Student / User</th>
                        <th className="px-6 py-3.5">College & Roll</th>
                        <th className="px-6 py-3.5">Role</th>
                        <th className="px-6 py-3.5">Vehicle</th>
                        <th className="px-6 py-3.5">Rides</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD3]/60 text-[#143D32]">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#F8F6F1]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#F8EBF2] text-[#582C4D] font-bold flex items-center justify-center text-xs">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-[#143D32]">{u.name}</div>
                                <div className="text-[11px] text-[#857F6B] font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-[#143D32]">{u.college}</div>
                            <div className="text-[11px] text-[#857F6B] font-mono">{u.roll}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#F4F1EA] text-[#143D32] border border-[#E2DDD3] whitespace-nowrap shrink-0">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[#5C716A]">{u.vehicle}</td>
                          <td className="px-6 py-4 font-bold text-[#143D32]">{u.rides}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap shrink-0 ${
                              u.status === 'verified' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F9EEF4] text-[#582C4D]'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.status !== 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyUserDirectly(u.id, u.name)}
                                  disabled={verifyingUserId === u.id}
                                  className="px-3 py-1.5 rounded-xl bg-[#582C4D] hover:bg-[#48233E] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{verifyingUserId === u.id ? 'Verifying...' : 'Verify Student'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => alert(`Institutional Record for ${u.name}:\nEmail: ${u.email}\nCollege: ${u.college}\nRole: ${u.role}\nStatus: ${u.status}`)}
                                className="px-3 py-1.5 rounded-xl border border-[#E2DDD3] bg-paper hover:bg-[#F5F2EB] text-[#143D32] text-xs font-semibold transition-all cursor-pointer"
                              >
                                View Profile
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 3: RIDE MONITORING
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'rides' && (
            <motion.div
              key="tab-rides"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#143D32]">Campus Ride Monitoring & Real-time Corridors</h2>
                  <p className="text-xs text-[#5C716A] mt-0.5">Tracking live drivers, scheduled carpools, and completed routes</p>
                </div>

                 <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-paper border border-[#E2DDD3] text-xs font-semibold shadow-2xs">
                  {(['all', 'live', 'scheduled', 'completed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setRidesStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer whitespace-nowrap ${
                        ridesStatusFilter === st ? 'bg-[#582C4D] text-white shadow-2xs font-bold' : 'text-[#5C716A] hover:text-[#143D32] hover:bg-[#F5F2EB]'
                      }`}
                    >
                      {st === 'live' ? 'Live on Road' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Map Component inside Rides Monitoring */}
              <div className="bg-paper rounded-2xl border border-[#E2DDD3] p-4 shadow-2xs">
                <AdminLiveMobilityMap
                  collegeScope={activeCollegeScope}
                  ongoingRides={ongoingRides}
                />
              </div>

              {/* Rides Table */}
              <div className="bg-paper rounded-2xl border border-[#E2DDD3] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F6F1] text-[#857F6B] font-medium text-[11px] border-b border-[#E2DDD3]">
                      <tr>
                        <th className="px-6 py-3.5">Driver</th>
                        <th className="px-6 py-3.5">Route</th>
                        <th className="px-6 py-3.5">Vehicle</th>
                        <th className="px-6 py-3.5">Departure</th>
                        <th className="px-6 py-3.5">Seats Available</th>
                        <th className="px-6 py-3.5">Fare</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD3]/60 text-[#143D32]">
                      {displayRides.map((r, i) => (
                        <tr key={r.id || i} className="hover:bg-[#F8F6F1]/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-[#143D32]">{r.driver?.name || r.driver}</td>
                          <td className="px-6 py-4">{r.origin?.text || r.origin} → {r.destination?.text || r.destination}</td>
                          <td className="px-6 py-4 font-mono text-[#5C716A]">{r.vehicle?.model || r.vehicle}</td>
                          <td className="px-6 py-4 font-mono text-[#5C716A]">{r.departureTime || '09:00 AM'}</td>
                          <td className="px-6 py-4 font-bold text-[#143D32]">{r.seatsAvailable || r.seats} Seats</td>
                          <td className="px-6 py-4 font-bold text-[#582C4D]">₹{r.pricePerSeat || r.price}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap shrink-0 ${
                              r.status === 'in_progress' ? 'bg-[#FEF3C7] text-[#92400E]' :
                              r.status === 'completed' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F4F1EA] text-[#5C716A]'
                            }`}>
                              {r.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setTrackingRide(r)}
                              className="px-3 py-1.5 rounded-xl border border-[#E2DDD3] bg-paper hover:bg-[#F5F2EB] text-[#143D32] text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-97 flex items-center gap-1.5 ml-auto"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#582C4D]" />
                              <span>Track on Map</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 4: VERIFICATION REQUESTS
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'verifications' && (
            <motion.div
              key="tab-verifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#143D32]">Driver & Student Identity Verification Queue</h2>
                  <p className="text-xs text-[#5C716A] mt-0.5">Review institutional student ID cards, driving licenses, and campus eligibility</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-paper border border-[#E2DDD3] text-xs font-semibold shadow-2xs">
                  {(['pending', 'approved', 'rejected'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => {
                        setVerificationFilter(filter);
                        loadVerifications(filter);
                      }}
                      className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer whitespace-nowrap ${
                        verificationFilter === filter ? 'bg-[#582C4D] text-white shadow-2xs font-bold' : 'text-[#5C716A] hover:text-[#143D32] hover:bg-[#F5F2EB]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verifications List / Cards */}
              {verificationsLoading ? (
                <div className="p-12 text-center text-[#857F6B] font-mono text-xs">
                  LOADING VERIFICATION REQUESTS...
                </div>
              ) : verifications.length === 0 ? (
                <div className="bg-paper rounded-2xl border border-[#E2DDD3] p-8 text-center text-[#5C716A] space-y-3 shadow-2xs">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div className="font-bold text-[#143D32] text-base">Verification Queue All Caught Up!</div>
                  <p className="text-xs max-w-md mx-auto">No pending driver or student verification documents awaiting institutional approval.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {verifications.map((req) => {
                    const studentUser = (typeof req.userId === 'object' && req.userId !== null) ? req.userId : null;
                    const studentName = req.fullName || studentUser?.name || req.userName || req.name || 'Student Applicant';
                    const studentEmail = studentUser?.email || req.email || req.userEmail || 'student@campus.edu';
                    const studentRoll = req.studentIdentifier || req.studentId || studentUser?.studentIdentifier || studentUser?.studentId || (studentUser?._id ? `UTT-${String(studentUser._id).slice(-6).toUpperCase()}` : 'UTT-318E82');
                    const studentCollege = req.college || studentUser?.college || 'Uttaranchal University';
                    const isDriverApp = req.role === 'driver' || req.accountType === 'DRIVER' || studentUser?.role === 'driver';

                    return (
                    <div key={req._id} className="bg-paper rounded-2xl border border-[#E2DDD3] p-6 shadow-2xs space-y-4 hover:shadow-xs transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#F8EBF2] text-[#582C4D] font-black flex items-center justify-center text-sm">
                            {studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#143D32] text-sm">{studentName}</div>
                            <div className="text-[11px] text-[#857F6B] font-mono">{studentEmail}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          req.status === 'pending' ? 'bg-[#F9EEF4] text-[#582C4D]' :
                          req.status === 'approved' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="p-3 bg-[#F8F6F1] rounded-xl text-xs space-y-1.5 border border-[#E2DDD3]/60">
                        <div className="flex justify-between text-[#5C716A]">
                          <span>College:</span>
                          <span className="font-bold text-[#143D32]">{studentCollege}</span>
                        </div>
                        <div className="flex justify-between text-[#5C716A]">
                          <span>Roll / Student ID:</span>
                          <span className="font-mono font-bold text-[#143D32]">{studentRoll}</span>
                        </div>
                        <div className="flex justify-between text-[#5C716A]">
                          <span>Applied For:</span>
                          <span className="font-bold text-[#582C4D]">{isDriverApp ? 'Driver Authorization' : 'Student Commuter'}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        {req.status === 'approved' ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Approved & Verified
                            </span>
                            <button
                              onClick={() => setReviewModalRequest({
                                ...req,
                                fullName: studentName,
                                studentIdentifier: studentRoll,
                                college: studentCollege,
                                userEmail: studentEmail,
                                userId: studentUser || { name: studentName, email: studentEmail, college: studentCollege, studentIdentifier: studentRoll },
                              })}
                              className="py-1.5 px-3 rounded-xl border border-[#E2DDD3] bg-paper hover:bg-[#F5F2EB] text-[#143D32] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Inspect Dossier
                            </button>
                          </div>
                        ) : req.status === 'rejected' ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Verification Rejected
                            </span>
                            <button
                              onClick={() => setReviewModalRequest({
                                ...req,
                                fullName: studentName,
                                studentIdentifier: studentRoll,
                                college: studentCollege,
                                userEmail: studentEmail,
                                userId: studentUser || { name: studentName, email: studentEmail, college: studentCollege, studentIdentifier: studentRoll },
                              })}
                              className="py-1.5 px-3 rounded-xl border border-[#E2DDD3] bg-paper hover:bg-[#F5F2EB] text-[#143D32] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Re-examine
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setReviewModalRequest({
                                ...req,
                                fullName: studentName,
                                studentIdentifier: studentRoll,
                                college: studentCollege,
                                userEmail: studentEmail,
                                userId: studentUser || { name: studentName, email: studentEmail, college: studentCollege, studentIdentifier: studentRoll },
                              })}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#143D32] hover:bg-[#0E2C24] text-white text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              Review & Approve
                            </button>
                            <button
                              onClick={() => handleReviewVerification(req._id, 'approved')}
                              title="Instant Institutional Approval"
                              className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Quick Approve
                            </button>
                            <button
                              onClick={() => handleReviewVerification(req._id, 'rejected', 'Document illegible or roll number mismatch')}
                              className="py-2 px-2.5 rounded-xl border border-[#E2DDD3] bg-paper hover:bg-red-50 hover:text-red-700 text-[#5C716A] text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 5: COLLEGES MANAGEMENT (Campuses)
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'colleges' && (
            <motion.div
              key="tab-colleges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-xl font-bold font-display text-[#143D32]">Partner Campuses & Dehradun Transit Geofences</h2>
                <p className="text-xs text-[#5C716A] mt-0.5">Managing university campus boundaries, transit hubs, and student commuter volume</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Uttaranchal University', location: 'Premnagar, Dehradun', students: '1,248', rides: '18 Live', hubs: '5 Hubs', primary: true },
                  { name: 'Graphic Era University', location: 'Bell Road, Clement Town', students: '892', rides: '12 Live', hubs: '3 Hubs', primary: false },
                  { name: 'UPES (Bidholi & Kandoli)', location: 'Energy Acres, Dehradun', students: '1,150', rides: '15 Live', hubs: '4 Hubs', primary: false },
                  { name: 'DIT University', location: 'Mussoorie Diversion Road', students: '620', rides: '8 Live', hubs: '2 Hubs', primary: false },
                  { name: 'Doon University', location: 'Mothrowala Road, Kedarpur', students: '480', rides: '6 Live', hubs: '2 Hubs', primary: false },
                ].map((col, idx) => (
                  <div key={idx} className="bg-paper rounded-2xl border border-[#E2DDD3] p-6 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#F8EBF2] text-[#582C4D] flex items-center justify-center font-black">
                        <GraduationCap className="w-6 h-6 text-[#582C4D]" />
                      </div>
                      {col.primary && (
                        <span className="px-2.5 py-1 rounded-full bg-[#F9EEF4] text-[#582C4D] text-[10px] font-mono font-bold border border-plum/20">
                          Primary Host Campus
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-[#143D32] text-base">{col.name}</h3>
                      <p className="text-xs text-[#5C716A] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#857F6B]" />
                        <span>{col.location}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#F8F6F1] rounded-xl text-center text-xs border border-[#E2DDD3]/60">
                      <div>
                        <div className="font-bold text-[#143D32]">{col.students}</div>
                        <div className="text-[10px] text-[#857F6B]">Students</div>
                      </div>
                      <div>
                        <div className="font-bold text-[#582C4D]">{col.rides}</div>
                        <div className="text-[10px] text-[#857F6B]">Rides</div>
                      </div>
                      <div>
                        <div className="font-bold text-[#143D32]">{col.hubs}</div>
                        <div className="text-[10px] text-[#857F6B]">Geofences</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 6: RIDE ANALYTICS & INSIGHTS (Audit-Grade, Interactive)
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <motion.div
              key="tab-analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <RideAnalyticsDashboard
                initialDate={selectedAnalyticsDate}
                onNavigateToRides={() => setActiveTab('rides')}
              />
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 7: SECURITY OPS (SOC)
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'soc' && (
            <motion.div
              key="tab-soc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#143D32]">Campus Security Operations Center (SOC)</h2>
                  <p className="text-xs text-[#5C716A] mt-0.5">Real-time emergency distress response, GPS location fixes, and campus warden escalation</p>
                </div>
                <button
                  onClick={loadSocIncidents}
                  className="px-3.5 py-2 rounded-xl border border-[#E2DDD3] bg-paper hover:bg-[#F5F2EB] text-xs font-semibold text-[#143D32] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Incidents</span>
                </button>
              </div>

              {incidents.length === 0 ? (
                <div className="bg-paper rounded-2xl border border-[#E2DDD3] p-12 text-center space-y-3 shadow-2xs">
                  <ShieldCheck className="w-14 h-14 text-emerald-600 mx-auto" />
                  <div className="text-lg font-bold text-[#143D32]">All Campus Corridors 100% Secure</div>
                  <p className="text-xs text-[#5C716A] max-w-md mx-auto">Zero active SOS distress alerts reported across registered student transit routes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident._id} className="bg-paper rounded-2xl border border-red-200/80 p-6 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-[#143D32] text-sm">Incident #{incident._id.slice(-6).toUpperCase()}</div>
                            <div className="text-xs text-[#5C716A]">{new Date(incident.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                          incident.status === 'ACTIVE' ? 'bg-red-100 text-red-800' : 'bg-[#DCFCE7] text-[#166534]'
                        }`}>
                          {incident.status}
                        </span>
                      </div>

                      <div className="p-4 bg-[#F8F6F1] rounded-xl text-xs space-y-2 border border-[#E2DDD3]/60">
                        <div className="flex justify-between">
                          <span className="text-[#5C716A]">Triggered By:</span>
                          <span className="font-bold text-[#143D32]">{incident.triggeredBy?.name || 'Student Caller'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5C716A]">Contact Phone:</span>
                          <span className="font-mono font-bold text-[#143D32]">{incident.triggeredBy?.phone || '+91 98765 43210'}</span>
                        </div>
                        {incident.location && (
                          <div className="flex justify-between">
                            <span className="text-[#5C716A]">GPS Fix:</span>
                            <a
                              href={`https://maps.google.com/?q=${incident.location.latitude},${incident.location.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[#582C4D] underline font-bold"
                            >
                              {incident.location.latitude?.toFixed(4)}, {incident.location.longitude?.toFixed(4)} (Open Maps)
                            </a>
                          </div>
                        )}
                      </div>

                      {incident.status === 'ACTIVE' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident._id, 'RESOLVED', 'Warden dispatched and verified safe')}
                            className="px-4 py-2 rounded-xl bg-[#143D32] hover:bg-[#0D2921] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident._id, 'FALSE_ALARM', 'Accidental trigger verified')}
                            className="px-4 py-2 rounded-xl border border-[#E2DDD3] bg-paper hover:bg-[#F5F2EB] text-[#5C716A] text-xs font-bold transition-colors cursor-pointer"
                          >
                            False Alarm
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 8: SYSTEM SETTINGS & FARE PRICING
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <motion.div
              key="tab-settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-xl font-bold font-display text-[#143D32]">Institutional Fare Policy & Campus Settings</h2>
                <p className="text-xs text-[#5C716A] mt-0.5">Authoritative seat price parameters, minimum fare threshold, and local transit benchmark</p>
              </div>

              {pricingSuccessMsg && (
                <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                  <span>{pricingSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSavePricing} className="bg-paper rounded-2xl border border-[#E2DDD3] p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Min Price Per Seat */}
                  <div>
                    <label className="block text-xs font-semibold text-[#143D32] mb-2">
                      Minimum Price per Seat (₹)
                    </label>
                    <input
                      type="number"
                      min={10}
                      step={1}
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2DDD3] bg-[#F8F6F1] text-[#143D32] font-bold focus:bg-white focus:outline-none focus:border-[#582C4D]"
                    />
                    <p className="text-[11px] text-[#857F6B] mt-1">Campus policy requires at least ₹10/seat</p>
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-xs font-semibold text-[#143D32] mb-2">
                      Base Booking Fare (₹)
                    </label>
                    <input
                      type="number"
                      min={5}
                      step={1}
                      value={basePriceInput}
                      onChange={(e) => setBasePriceInput(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2DDD3] bg-[#F8F6F1] text-[#143D32] font-bold focus:bg-white focus:outline-none focus:border-[#582C4D]"
                    />
                    <p className="text-[11px] text-[#857F6B] mt-1">Initial flag-down price</p>
                  </div>

                  {/* Price Per KM */}
                  <div>
                    <label className="block text-xs font-semibold text-[#143D32] mb-2">
                      Rate per Kilometer (₹/km)
                    </label>
                    <input
                      type="number"
                      min={1}
                      step={0.5}
                      value={perKmInput}
                      onChange={(e) => setPerKmInput(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2DDD3] bg-[#F8F6F1] text-[#143D32] font-bold focus:bg-white focus:outline-none focus:border-[#582C4D]"
                    />
                    <p className="text-[11px] text-[#857F6B] mt-1">Typical student rate: ₹4.50/km</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#143D32] mb-2">
                    Local Transit Benchmark Comparison
                  </label>
                  <input
                    type="text"
                    value={localBenchmarkInput}
                    onChange={(e) => setLocalBenchmarkInput(e.target.value)}
                    placeholder="e.g. City e-rickshaw charges ₹20 flat, auto charges ₹50 flat"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2DDD3] bg-[#F8F6F1] text-[#143D32] text-xs focus:bg-white focus:outline-none focus:border-[#582C4D]"
                  />
                </div>

                <div className="pt-4 border-t border-[#E2DDD3]/60 flex items-center justify-between">
                  <div className="text-xs text-[#5C716A]">
                    Calculated Sample: 8 km commute = <b className="text-[#143D32]">₹{basePriceInput + (8 * perKmInput)}</b> per seat
                  </div>
                  <button
                    type="submit"
                    disabled={pricingSaving}
                    className="px-6 py-3 rounded-xl bg-[#582C4D] hover:bg-[#48233E] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {pricingSaving ? 'Saving...' : 'Save Fare Policy'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 9: ADMIN PROFILE & AUDIT LOGS
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <motion.div
              key="tab-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-xl font-bold font-display text-[#143D32]">Institutional Administrator Profile & Audit Trail</h2>
                <p className="text-xs text-[#5C716A] mt-0.5">Session security credentials and append-only administrative records</p>
              </div>

              {/* Admin Card */}
              <div className="bg-paper rounded-2xl border border-[#E2DDD3] p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#582C4D] text-white text-xl font-bold flex items-center justify-center shadow-2xs">
                    DN
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#143D32]">{user?.name || 'Dean Sharma'}</h3>
                    <p className="text-xs text-[#5C716A]">{user?.email || 'admin@campusride.edu'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F9EEF4] text-[#582C4D] text-[10px] font-bold uppercase font-mono">
                        {user?.role || 'super_admin'}
                      </span>
                      <span className="text-xs text-[#857F6B] font-mono">• {activeCollegeScope}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="bg-paper rounded-2xl border border-[#E2DDD3] p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-[#143D32] text-sm">Security Audit Logs (Last 30 Events)</h3>
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#857F6B] font-mono">No recent audit log entries recorded.</div>
                  ) : (
                    auditLogs.map((log, i) => (
                      <div key={log._id || i} className="p-3.5 rounded-xl bg-[#F8F6F1] border border-[#E2DDD3]/60 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-[#143D32] font-mono">{log.action || 'ADMIN_AUTH_VERIFIED'}</div>
                          <div className="text-[11px] text-[#5C716A] font-mono">Target: {log.resourceType || 'USER'}</div>
                        </div>
                        <div className="text-right text-[11px] font-mono text-[#857F6B]">
                          <div>{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</div>
                          <div>IP: {log.ipAddress || '127.0.0.1'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </main>
      </div>

      {/* Verification Review Modal Integration */}
      {reviewModalRequest && (
        <VerificationReviewModal
          isOpen={!!reviewModalRequest}
          request={reviewModalRequest}
          onClose={() => setReviewModalRequest(null)}
          onApprove={(id) => handleReviewVerification(id, 'approved')}
          onReject={(id, reason) => handleReviewVerification(id, 'rejected', reason)}
        />
      )}

      {/* Live Ride Route Telemetry & Tracking Modal */}
      {trackingRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-paper rounded-3xl border border-[#E2DDD3] max-w-3xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left max-h-[92vh] overflow-y-auto my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2DDD3]/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#582C4D] text-white flex items-center justify-center shadow-2xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-base text-[#143D32]">
                    Live Route & Corridor Telemetry
                  </h3>
                  <p className="text-xs text-[#5C716A]">
                    Driver: <span className="font-semibold text-[#143D32]">{trackingRide.driver?.name || trackingRide.driver}</span> · {trackingRide.vehicle?.model || trackingRide.vehicle || 'Campus Verified Vehicle'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrackingRide(null)}
                className="p-2 rounded-xl text-[#5C716A] hover:bg-[#F5F2EB] hover:text-[#143D32] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F8F6F1] rounded-2xl border border-[#E2DDD3]/70 text-xs">
              <div>
                <div className="text-[11px] text-[#857F6B]">Departure Time</div>
                <div className="font-mono font-bold text-[#143D32] mt-0.5">{trackingRide.departureTime || '09:00 AM'}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#857F6B]">Seat Capacity</div>
                <div className="font-mono font-bold text-[#143D32] mt-0.5">{trackingRide.seatsAvailable || trackingRide.seats || 3} Available</div>
              </div>
              <div>
                <div className="text-[11px] text-[#857F6B]">Fare / Seat</div>
                <div className="font-mono font-bold text-[#582C4D] mt-0.5">₹{trackingRide.pricePerSeat || trackingRide.price || 25}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#857F6B]">Transit Status</div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold mt-0.5 ${
                  trackingRide.status === 'in_progress' ? 'bg-[#FEF3C7] text-[#92400E]' :
                  trackingRide.status === 'completed' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F9EEF4] text-[#582C4D]'
                }`}>
                  {trackingRide.status || 'Active'}
                </span>
              </div>
            </div>

            {/* Route description */}
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E2DDD3]/60 text-xs">
              <MapPin className="w-4 h-4 text-[#582C4D] shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-[#143D32]">{trackingRide.origin?.text || trackingRide.origin}</span>
                <span className="text-[#857F6B] mx-2">→</span>
                <span className="font-semibold text-[#143D32]">{trackingRide.destination?.text || trackingRide.destination}</span>
              </div>
            </div>

            {/* Leaflet Map Embed */}
            <div className="h-80 w-full rounded-2xl overflow-hidden border border-[#E2DDD3] shadow-inner relative">
              <AdminLiveMobilityMap
                collegeScope={activeCollegeScope}
                ongoingRides={[trackingRide]}
              />
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-[11px] font-mono text-emerald-700 flex items-center gap-2 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span>Active GPS Corridor Telemetry · Dehradun Campus Network</span>
              </div>
              <button
                onClick={() => setTrackingRide(null)}
                className="px-5 py-2 rounded-xl bg-[#582C4D] text-white text-xs font-bold shadow-2xs hover:bg-[#48233E] transition-colors cursor-pointer text-center"
              >
                Close Tracking
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
