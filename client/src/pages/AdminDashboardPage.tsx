import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket, joinSecurityHub } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { IMobilityAnalytics } from '../types';
import { VerificationReviewModal } from '../components/verification/VerificationReviewModal';
import { AdminLiveMobilityMap } from '../components/admin/AdminLiveMobilityMap';
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
    socket.on('sos:status', handleSosStatus);

    return () => {
      socket.off('sos:alert', handleSosAlert);
      socket.off('sos:status', handleSosStatus);
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
      await api.reviewVerificationRequest(requestId, decision, reason);
      loadVerifications();
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

  // Active Incidents count
  const activeIncidentsCount = incidents.filter(i => i.status === 'ACTIVE').length;
  const pendingVerificationsCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <div className="min-h-screen flex bg-[#F6FAF8] font-sans text-slate-800 antialiased selection:bg-[#10B981] selection:text-white">
      {/* ─── SIDEBAR NAVIGATION (Deep Forest Green #143D32) ─── */}
      <aside className="w-64 sm:w-72 bg-[#143D32] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#0D2921] sticky top-0 h-screen z-30 shadow-xl">
        {/* Top Branding */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-6 border-b border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/40 border border-emerald-300/30">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-white">CampusRide</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/25 border border-emerald-400/30 text-[10px] font-mono text-emerald-300 rounded font-semibold uppercase">PRO</span>
                </div>
                <p className="text-[11px] text-emerald-200/70 font-mono tracking-wide">Institutional Command</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'users', label: 'Users Management', icon: Users, badge: '1,248' },
              { id: 'rides', label: 'Ride Monitoring', icon: Car, badge: `${displayRides.length} Live` },
              { id: 'verifications', label: 'Verification Requests', icon: UserCheck, badge: pendingVerificationsCount > 0 ? `${pendingVerificationsCount}` : undefined, badgeColor: 'bg-amber-500' },
              { id: 'colleges', label: 'Colleges & Hubs', icon: GraduationCap },
              { id: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
              { id: 'soc', label: 'Security & SOS (SOC)', icon: ShieldAlert, badge: activeIncidentsCount > 0 ? `${activeIncidentsCount}` : undefined, badgeColor: 'bg-red-500 animate-pulse' },
              { id: 'settings', label: 'System Settings', icon: Settings },
              { id: 'profile', label: 'Admin Profile & Logs', icon: Shield },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/40 font-bold'
                      : 'text-emerald-100/75 hover:bg-emerald-900/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-300/80'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-emerald-900 text-emerald-200')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Exit */}
        <div className="p-4 border-t border-emerald-900/60 bg-emerald-950/40">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center font-bold text-white text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DS'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Dean Sharma'}</div>
              <div className="text-[10px] text-emerald-300/80 truncate font-mono">{user?.email || 'admin@campusride.edu'}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" title="Session Active" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-300" />
              <span>Student App</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
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
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search users, rides, colleges, or reports..."
              className="w-full pl-10 pr-12 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-400">
              ⌘K
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* System Online Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Online</span>
            </div>

            {/* College Campus Scoping Selector */}
            <div className="relative">
              <select
                value={selectedCollegeScope}
                onChange={(e) => setSelectedCollegeScope(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Uttaranchal University">Uttaranchal University (Premnagar)</option>
                <option value="Graphic Era University">Graphic Era University (Bell Road)</option>
                <option value="University of Petroleum and Energy Studies">UPES Dehradun</option>
                <option value="DIT University">DIT University</option>
                <option value="ALL">All Campuses (State-wide)</option>
              </select>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  3
                </span>
              </button>

              {/* Notification Dropdown */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900">System Notifications</span>
                    <span className="text-[10px] font-mono text-emerald-600">3 new</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800">Verification Queue</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">3 driver verification requests awaiting dean approval.</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5">
                      <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800">Peak Morning Rush</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">18 carpools active between Premnagar & UIT.</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-800">Campus Geofence Verified</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Zero route deviations or unauthorized dropoffs.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Feeds Button */}
            <button
              onClick={loadAllData}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SOS Emergency Banner */}
        {notificationBanner && (
          <div className="m-6 mb-0 p-4 bg-red-600 text-white rounded-2xl flex items-center justify-between shadow-lg animate-pulse">
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

        {/* Tab Content Container */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* ════════════════════════════════════════════════════════════════
             TAB 1: OVERVIEW (Hero, 4 KPIs, Map, Activity, 7-Day Analytics)
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Hero Banner Card */}
              <div className="relative rounded-3xl bg-gradient-to-r from-[#143D32] via-[#10483B] to-[#0A2E25] text-white p-6 sm:p-8 shadow-sm overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-emerald-300 uppercase tracking-wider mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      <span>CAMPUS MOBILITY OPERATIONS CENTER</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {timeOfDayGreeting}, {user?.name || 'Dean Sharma'} 👋
                    </h1>
                    <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                      Here’s what’s happening across {activeCollegeScope} mobility network today. Real-time GPS telemetry, zero unresolved incidents, and verified student carpool operations.
                    </p>
                  </div>

                  {/* Date & Sync Badge */}
                  <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                    <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold text-emerald-200 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedToday}</span>
                    </div>
                    <div className="text-[11px] text-emerald-300/70 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Real-time GPS synchronization</span>
                    </div>
                  </div>
                </div>

                {/* Subtle background decorative glow */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* 4 Top KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Active Rides */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Total Active Rides</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{opsData?.kpis.ongoingRidesCount || 18}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">+14%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Active student commuters today</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Peak Rush: 08:30 - 09:30</span>
                    <span className="text-emerald-600 font-semibold">● 100% on schedule</span>
                  </div>
                </div>

                {/* KPI 2: Verified Students */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Verified Students</span>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>1,248</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">94%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Enrolled across campus registry</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Pending IDs: {pendingVerificationsCount}</span>
                    <span className="text-blue-600 font-semibold">Gatekeeper verified</span>
                  </div>
                </div>

                {/* KPI 3: Safety Status */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Safety Status</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>100%</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Secure</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Zero active SOS distress alerts</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>SOS Hub: Active</span>
                    <span className="text-emerald-600 font-semibold">Corridors safe</span>
                  </div>
                </div>

                {/* KPI 4: CO2 Saved */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">CO₂ Offset</span>
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Leaf className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{opsData?.kpis.co2SavedKg || 342} kg</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">+28 kg</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">~24 mature trees equivalent 🌿</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Green Campus Index</span>
                    <span className="text-teal-600 font-semibold">Grade A+</span>
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Map + Stats on Left (7 cols) / Feed + Actions on Right (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 7 Columns: Live Map & 7-Day Chart & Recent Rides */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Interactive Live Mobility Map Component */}
                  <AdminLiveMobilityMap
                    collegeScope={activeCollegeScope}
                    ongoingRides={ongoingRides}
                  />

                  {/* 7-Day Ride Analytics Bar Chart */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">7-Day Campus Ride Volume</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Daily completed and in-progress carpools across all corridors</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        +18.4% vs last week
                      </span>
                    </div>

                    {/* Chart Bars */}
                    <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                      {[
                        { day: 'Mon', rides: 38, height: '65%' },
                        { day: 'Tue', rides: 44, height: '75%' },
                        { day: 'Wed', rides: 52, height: '88%' },
                        { day: 'Thu', rides: 48, height: '80%' },
                        { day: 'Fri', rides: 60, height: '100%' },
                        { day: 'Sat', rides: 28, height: '45%' },
                        { day: 'Sun', rides: 18, height: '30%' },
                      ].map((item, idx) => (
                        <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">
                            {item.rides}
                          </span>
                          <div className="w-full bg-slate-100 rounded-t-xl h-32 flex items-end overflow-hidden">
                            <div
                              style={{ height: item.height }}
                              className={`w-full rounded-t-xl transition-all group-hover:brightness-110 ${
                                idx === 4 ? 'bg-[#143D32]' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Rides Table */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Rides & Commuters</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Live status of carpool operations across campus</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('rides')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                      >
                        <span>View All Rides</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50/80 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-100">
                          <tr>
                            <th className="px-5 py-3">Driver</th>
                            <th className="px-5 py-3">Route</th>
                            <th className="px-5 py-3">Time</th>
                            <th className="px-5 py-3">Seats</th>
                            <th className="px-5 py-3">Fare</th>
                            <th className="px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {displayRides.slice(0, 4).map((r, i) => (
                            <tr key={r.id || i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-slate-900">{r.driver?.name || r.driver}</td>
                              <td className="px-5 py-3.5 max-w-[180px] truncate">{r.origin?.text || r.origin} → {r.destination?.text || r.destination}</td>
                              <td className="px-5 py-3.5 font-mono text-slate-500">{r.departureTime || '09:00 AM'}</td>
                              <td className="px-5 py-3.5 font-bold text-emerald-700">{r.seatsAvailable || r.seats} Available</td>
                              <td className="px-5 py-3.5 font-bold text-slate-900">₹{r.pricePerSeat || r.price}</td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  r.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                                  r.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {r.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Live Activity, Quick Actions, Popular Routes */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Live Activity Feed */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="font-bold text-slate-900 text-sm">Live Activity Feed</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Stream synced</span>
                    </div>

                    <div className="space-y-4">
                      {[
                        { time: '2m ago', title: 'Seat Booked', desc: 'Aarav Sharma requested seat on Clock Tower → UIT', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                        { time: '8m ago', title: 'Driver Verified', desc: 'Priya Verma verified with valid student ID & DL', icon: UserCheck, color: 'text-blue-600 bg-blue-50' },
                        { time: '14m ago', title: 'Trip Started', desc: 'Rohan Mehta started carpool to Premnagar Hub', icon: Navigation, color: 'text-amber-600 bg-amber-50' },
                        { time: '22m ago', title: 'Trip Completed', desc: 'Devendra Rawat reached UIT Gate (+₹30)', icon: Check, color: 'text-emerald-600 bg-emerald-50' },
                        { time: '35m ago', title: 'Geofence Check', desc: 'All 18 active vehicles within approved campus routes', icon: ShieldCheck, color: 'text-slate-600 bg-slate-50' },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800">{item.title}</span>
                                <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions Panel */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
                    <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Administrative Actions</h3>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setActiveTab('verifications')}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-left transition-all group cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-slate-900">Verify Drivers</div>
                        <div className="text-[10px] text-slate-500">{pendingVerificationsCount} pending review</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('rides')}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-left transition-all group cursor-pointer"
                      >
                        <Car className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-slate-900">Monitor Rides</div>
                        <div className="text-[10px] text-slate-500">Live corridor tracking</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('settings')}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-left transition-all group cursor-pointer"
                      >
                        <Sliders className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-slate-900">Configure Fares</div>
                        <div className="text-[10px] text-slate-500">Min ₹10 policy</div>
                      </button>

                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-left transition-all group cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-slate-900">Export Report</div>
                        <div className="text-[10px] text-slate-500">Audit & compliance</div>
                      </button>
                    </div>
                  </div>

                  {/* Popular Routes Breakdown */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
                    <h3 className="font-bold text-slate-900 text-sm mb-3">Popular Transit Corridors</h3>
                    <div className="space-y-3">
                      {[
                        { route: 'Premnagar Market ↔ UIT Campus', pct: '42%', rides: '58 daily rides' },
                        { route: 'Clock Tower Dehradun ↔ UIT Campus', pct: '28%', rides: '38 daily rides' },
                        { route: 'Ballupur Chowk ↔ UIT Campus', pct: '18%', rides: '24 daily rides' },
                        { route: 'ISBT Dehradun ↔ UIT Campus', pct: '12%', rides: '16 daily rides' },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{item.route}</span>
                            <span className="font-mono font-bold text-emerald-700">{item.pct}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: item.pct }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-[#143D32] rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 2: USERS MANAGEMENT
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">User Management & Student Gatekeeper</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Authoritative registry of verified students, drivers, and institutional administrators</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 text-xs font-semibold">
                  {(['all', 'students', 'drivers', 'admins'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                        userRoleFilter === role
                          ? 'bg-[#143D32] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
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
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{u.name}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{u.college}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.roll}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-600">{u.vehicle}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">{u.rides}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{verifyingUserId === u.id ? 'Verifying...' : 'Verify Student'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => alert(`Institutional Record for ${u.name}:\nEmail: ${u.email}\nCollege: ${u.college}\nRole: ${u.role}\nStatus: ${u.status}`)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#143D32] hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer"
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
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 3: RIDE MONITORING
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'rides' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Campus Ride Monitoring & Real-time Corridors</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Tracking live drivers, scheduled carpools, and completed routes</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 text-xs font-semibold">
                  {(['all', 'live', 'scheduled', 'completed'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setRidesStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                        ridesStatusFilter === st ? 'bg-[#143D32] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st === 'live' ? 'Live on Road' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rides Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
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
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {displayRides.map((r, i) => (
                        <tr key={r.id || i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{r.driver?.name || r.driver}</td>
                          <td className="px-6 py-4">{r.origin?.text || r.origin} → {r.destination?.text || r.destination}</td>
                          <td className="px-6 py-4 font-mono text-slate-500">{r.vehicle?.model || r.vehicle}</td>
                          <td className="px-6 py-4 font-mono text-slate-600">{r.departureTime || '09:00 AM'}</td>
                          <td className="px-6 py-4 font-bold text-emerald-700">{r.seatsAvailable || r.seats} Seats</td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{r.pricePerSeat || r.price}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              r.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                              r.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {r.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setActiveTab('overview')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Track on Map
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 4: VERIFICATION REQUESTS
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'verifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Driver & Student Identity Verification Queue</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Review institutional student ID cards, driving licenses, and campus eligibility</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 text-xs font-semibold">
                  {(['pending', 'approved', 'rejected'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => {
                        setVerificationFilter(filter);
                        loadVerifications(filter);
                      }}
                      className={`px-3 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                        verificationFilter === filter ? 'bg-[#143D32] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verifications List / Cards */}
              {verificationsLoading ? (
                <div className="p-12 text-center text-slate-400 font-mono text-xs">
                  LOADING VERIFICATION REQUESTS...
                </div>
              ) : verifications.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center text-slate-500 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div className="font-bold text-slate-900 text-base">Verification Queue All Caught Up!</div>
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
                    <div key={req._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4 hover:shadow-xs transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-sm">
                            {studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{studentName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{studentEmail}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>College:</span>
                          <span className="font-bold text-slate-900">{studentCollege}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Roll / Student ID:</span>
                          <span className="font-mono font-bold text-slate-900">{studentRoll}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Applied For:</span>
                          <span className="font-bold text-emerald-700">{isDriverApp ? 'Driver Authorization' : 'Student Commuter'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => setReviewModalRequest({
                            ...req,
                            fullName: studentName,
                            studentIdentifier: studentRoll,
                            college: studentCollege,
                            userEmail: studentEmail,
                            userId: studentUser || { name: studentName, email: studentEmail, college: studentCollege, studentIdentifier: studentRoll },
                          })}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#143D32] hover:bg-[#10483B] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Review & Approve
                        </button>
                        <button
                          onClick={() => handleReviewVerification(req._id, 'rejected', 'Document illegible or roll number mismatch')}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 5: COLLEGES MANAGEMENT
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'colleges' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Partner Campuses & Dehradun Transit Geofences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Managing university campus boundaries, transit hubs, and student commuter volume</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Uttaranchal University', location: 'Premnagar, Dehradun', students: '1,248', rides: '18 Live', hubs: '5 Hubs', primary: true },
                  { name: 'Graphic Era University', location: 'Bell Road, Clement Town', students: '892', rides: '12 Live', hubs: '3 Hubs', primary: false },
                  { name: 'UPES (Bidholi & Kandoli)', location: 'Energy Acres, Dehradun', students: '1,150', rides: '15 Live', hubs: '4 Hubs', primary: false },
                  { name: 'DIT University', location: 'Mussoorie Diversion Road', students: '620', rides: '8 Live', hubs: '2 Hubs', primary: false },
                  { name: 'Doon University', location: 'Mothrowala Road, Kedarpur', students: '480', rides: '6 Live', hubs: '2 Hubs', primary: false },
                ].map((col, idx) => (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                        <GraduationCap className="w-6 h-6 text-emerald-700" />
                      </div>
                      {col.primary && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                          Primary Host Campus
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{col.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{col.location}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl text-center text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{col.students}</div>
                        <div className="text-[10px] text-slate-400">Students</div>
                      </div>
                      <div>
                        <div className="font-bold text-emerald-700">{col.rides}</div>
                        <div className="text-[10px] text-slate-400">Rides</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{col.hubs}</div>
                        <div className="text-[10px] text-slate-400">Geofences</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 6: REPORTS & ANALYTICS
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Campus Mobility Reports & Environmental Impact</h2>
                <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit telemetry, rush hour analytics, and carbon emissions reduction</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
                  <span className="text-xs font-mono uppercase text-slate-400 font-bold">Total Platform Rides</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">{opsData?.kpis.totalRides || 842}</div>
                  <div className="text-xs text-emerald-600 mt-1 font-semibold">+22% month-over-month growth</div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
                  <span className="text-xs font-mono uppercase text-slate-400 font-bold">Student Travel Savings</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">₹48,250</div>
                  <div className="text-xs text-slate-500 mt-1">Compared to commercial auto-rickshaws</div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
                  <span className="text-xs font-mono uppercase text-slate-400 font-bold">Safety Incident Rate</span>
                  <div className="text-3xl font-black text-emerald-700 mt-2">0.00%</div>
                  <div className="text-xs text-slate-500 mt-1">100% verified campus gatekeeping</div>
                </div>
              </div>

              {/* Peak Commute Hours */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Peak Commute Hours (Campus Transit Rush)</h3>
                <div className="space-y-3">
                  {[
                    { time: '08:00 - 08:30 AM (Morning Rush)', count: 24, pct: '75%' },
                    { time: '08:30 - 09:15 AM (Class Start Peak)', count: 32, pct: '100%' },
                    { time: '01:30 - 02:15 PM (Lunch Shifts)', count: 12, pct: '38%' },
                    { time: '04:30 - 05:30 PM (Evening Return Peak)', count: 28, pct: '88%' },
                    { time: '06:00 - 07:00 PM (Hostel Curfew Return)', count: 16, pct: '50%' },
                  ].map((peak, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{peak.time}</span>
                        <span className="font-mono font-bold text-slate-900">{peak.count} Carpools</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: peak.pct }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#143D32] rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 7: SECURITY OPS (SOC)
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'soc' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Campus Security Operations Center (SOC)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time emergency distress response, GPS location fixes, and campus warden escalation</p>
                </div>
                <button
                  onClick={loadSocIncidents}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Incidents</span>
                </button>
              </div>

              {incidents.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3">
                  <ShieldCheck className="w-14 h-14 text-emerald-600 mx-auto" />
                  <div className="text-lg font-bold text-slate-900">All Campus Corridors 100% Secure</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">Zero active SOS distress alerts reported across registered student transit routes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">Incident #{incident._id.slice(-6).toUpperCase()}</div>
                            <div className="text-xs text-slate-500">{new Date(incident.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          incident.status === 'ACTIVE' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {incident.status}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Triggered By:</span>
                          <span className="font-bold text-slate-900">{incident.triggeredBy?.name || 'Student Caller'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Contact Phone:</span>
                          <span className="font-mono font-bold text-slate-900">{incident.triggeredBy?.phone || '+91 98765 43210'}</span>
                        </div>
                        {incident.location && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">GPS Fix:</span>
                            <a
                              href={`https://maps.google.com/?q=${incident.location.latitude},${incident.location.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-emerald-700 underline font-bold"
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
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident._id, 'FALSE_ALARM', 'Accidental trigger verified')}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            False Alarm
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 8: SYSTEM SETTINGS & FARE PRICING
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Institutional Fare Policy & Campus Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Authoritative seat price parameters, minimum fare threshold, and local transit benchmark</p>
              </div>

              {pricingSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{pricingSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSavePricing} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Min Price Per Seat */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Minimum Price per Seat (₹)
                    </label>
                    <input
                      type="number"
                      min={10}
                      step={1}
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Campus policy requires at least ₹10/seat</p>
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Base Booking Fare (₹)
                    </label>
                    <input
                      type="number"
                      min={5}
                      step={1}
                      value={basePriceInput}
                      onChange={(e) => setBasePriceInput(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Initial flag-down price</p>
                  </div>

                  {/* Price Per KM */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Rate per Kilometer (₹/km)
                    </label>
                    <input
                      type="number"
                      min={1}
                      step={0.5}
                      value={perKmInput}
                      onChange={(e) => setPerKmInput(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Typical student rate: ₹4.50/km</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Local Transit Benchmark Comparison
                  </label>
                  <input
                    type="text"
                    value={localBenchmarkInput}
                    onChange={(e) => setLocalBenchmarkInput(e.target.value)}
                    placeholder="e.g. City e-rickshaw charges ₹20 flat, auto charges ₹50 flat"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Calculated Sample: 8 km commute = <b className="text-slate-900">₹{basePriceInput + (8 * perKmInput)}</b> per seat
                  </div>
                  <button
                    type="submit"
                    disabled={pricingSaving}
                    className="px-6 py-3 rounded-2xl bg-[#143D32] hover:bg-[#10483B] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {pricingSaving ? 'Saving...' : 'Save Fare Policy'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
             TAB 9: ADMIN PROFILE & AUDIT LOGS
             ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Institutional Administrator Profile & Audit Trail</h2>
                <p className="text-xs text-slate-500 mt-0.5">Session security credentials and append-only administrative records</p>
              </div>

              {/* Admin Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-[#143D32] text-white text-xl font-black flex items-center justify-center">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DS'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{user?.name || 'Dean Sharma'}</h3>
                    <p className="text-xs text-slate-500">{user?.email || 'admin@campusride.edu'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase font-mono">
                        {user?.role || 'super_admin'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">• {activeCollegeScope}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Security Audit Logs (Last 30 Events)</h3>
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-mono">No recent audit log entries recorded.</div>
                  ) : (
                    auditLogs.map((log, i) => (
                      <div key={log._id || i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800 font-mono">{log.action || 'ADMIN_AUTH_VERIFIED'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Target: {log.resourceType || 'USER'}</div>
                        </div>
                        <div className="text-right text-[11px] font-mono text-slate-400">
                          <div>{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</div>
                          <div>IP: {log.ipAddress || '127.0.0.1'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
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
    </div>
  );
};
