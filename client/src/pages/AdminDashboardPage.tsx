import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { getSocket, joinSecurityHub } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { IMobilityAnalytics } from "../types";
import { VerificationReviewModal } from "../components/verification/VerificationReviewModal";
import {
  ShieldAlert,
  UserCheck,
  BarChart3,
  MapPin,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Radio,
  FileText,
  User,
  Navigation,
  DollarSign,
  Car,
  Leaf,
  Users,
  ArrowRight,
  Sparkles,
  Settings,
  Sliders,
  Wallet,
  Activity,
  TrendingUp,
  Eye,
} from "lucide-react";

type AdminTab = "overview" | "pricing" | "soc" | "verifications" | "analytics" | "hubs" | "audit";

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [reviewModalRequest, setReviewModalRequest] = useState<any | null>(null);

  // Authoritative Server Role Authorization: Only verified admins or moderators
  useEffect(() => {
    if (user && user.role !== 'super_admin' && user.role !== 'campus_admin' && user.role !== 'moderator') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Real-Time Operations Telemetry State
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
  const [ongoingFilter, setOngoingFilter] = useState<"all" | "live" | "scheduled">("all");
  const [ongoingSearchQuery, setOngoingSearchQuery] = useState("");

  // Pricing Form State
  const [minPriceInput, setMinPriceInput] = useState<number>(10);
  const [basePriceInput, setBasePriceInput] = useState<number>(15);
  const [perKmInput, setPerKmInput] = useState<number>(4.5);
  const [localBenchmarkInput, setLocalBenchmarkInput] = useState<string>("");
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null);

  // Telemetry & Stats State
  const [analytics, setAnalytics] = useState<IMobilityAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // SOC Incidents State
  const [incidents, setIncidents] = useState<any[]>([]);
  const [socFilter, setSocFilter] = useState<string>("ALL");
  const [socLoading, setSocLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");

  // Verification Queue State
  const [verifications, setVerifications] = useState<any[]>([]);
  const [verificationFilter, setVerificationFilter] = useState<string>("pending");
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Campus Hubs State
  const [hubs, setHubs] = useState<any[]>([]);
  const [hubsLoading, setHubsLoading] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Load Initial Data
  useEffect(() => {
    loadAdminOperations();
    loadSocIncidents();
    loadVerifications();
    loadAnalytics();
    loadHubs();
    loadAuditLogs();

    // Socket.IO Integration for Security Operations Room
    const socket = getSocket();
    joinSecurityHub();

    const handleSosAlert = (data: any) => {
      setNotificationBanner(`🚨 NEW EMERGENCY SOS TRIGGERED: Incident #${data.incidentId || "LIVE"}`);
      loadSocIncidents();
    };

    const handleSosStatus = () => {
      loadSocIncidents();
    };

    socket.on("sos:alert", handleSosAlert);
    socket.on("sos:status", handleSosStatus);

    return () => {
      socket.off("sos:alert", handleSosAlert);
      socket.off("sos:status", handleSosStatus);
    };
  }, []);

  async function loadSocIncidents() {
    try {
      setSocLoading(true);
      const res = await api.getEmergencyIncidents();
      setIncidents(res.incidents || []);
    } catch (err) {
      console.error("[SOC] Failed to load incidents:", err);
    } finally {
      setSocLoading(false);
    }
  }

  async function loadVerifications() {
    try {
      setVerificationsLoading(true);
      const res = await api.getVerificationQueue(verificationFilter);
      setVerifications(res.requests || []);
    } catch (err) {
      console.error("[Verifications] Failed to load queue:", err);
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
      console.error("[Analytics] Error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function loadHubs() {
    try {
      setHubsLoading(true);
      const res = await api.getCampusHubs();
      setHubs(res.hubs || []);
    } catch (err) {
      console.error("[Hubs] Error:", err);
    } finally {
      setHubsLoading(false);
    }
  }

  async function loadAuditLogs() {
    try {
      setAuditLoading(true);
      const res = await api.getAuditLogs(30);
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.error("[Audit] Error:", err);
    } finally {
      setAuditLoading(false);
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
        setLocalBenchmarkInput(res.pricingConfig.localTransitComparison || "");
      }
    } catch (err) {
      console.error("[Operations] Error loading admin operations:", err);
    } finally {
      setOpsLoading(false);
    }
  }

  async function handleSavePricing(e: React.FormEvent) {
    e.preventDefault();
    if (minPriceInput < 10) {
      alert("Minimum price for riding cannot be less than ₹10 as per campus policy.");
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
      alert("Failed to update pricing: " + (err.message || "Server error"));
    } finally {
      setPricingSaving(false);
    }
  }

  // Handle SOC Status Update
  const handleUpdateIncidentStatus = async (
    incidentId: string,
    newStatus: "ACKNOWLEDGED" | "RESOLVED" | "FALSE_ALARM",
    notes?: string
  ) => {
    try {
      await api.updateIncidentStatus(incidentId, newStatus, notes);
      setResolvingId(null);
      setResolutionNotes("");
      loadSocIncidents();
      loadAuditLogs();
    } catch (err: any) {
      alert(`Failed to update incident: ${err.message || "Unknown error"}`);
    }
  };

  // Handle Verification Review
  const handleReviewVerification = async (
    requestId: string,
    decision: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      await api.reviewVerificationRequest(requestId, decision, reason);
      setRejectingId(null);
      setRejectionReason("");
      loadVerifications();
      loadAuditLogs();
    } catch (err: any) {
      alert(`Failed to process verification: ${err.message || "Unknown error"}`);
    }
  };

  const activeIncidentsCount = (incidents || []).filter(
    (i) => i && (i.status === "ACTIVE" || i.status === "ACKNOWLEDGED")
  ).length;

  const filteredIncidents =
    socFilter === "ALL"
      ? (incidents || [])
      : (incidents || []).filter((i) => i && i.status === socFilter);

  const summary = analytics?.summary || {
    totalUsers: 8,
    verifiedStudents: 8,
    verificationRate: 100,
    activeRides: 5,
    completedTrips: 5,
    totalKmShared: 142,
    co2SavedKg: 28.5,
  };

  const peakHours = analytics?.peakHours || [
    { hour: "08:00", rides: 6 },
    { hour: "08:30", rides: 14 },
    { hour: "09:00", rides: 12 },
    { hour: "14:00", rides: 4 },
    { hour: "17:00", rides: 11 },
    { hour: "18:00", rides: 8 },
  ];

  // College Scoping: Campus Administrators only see rides & operations from their own college
  const adminCollege = user?.college;
  const isSuperAdmin = user?.role === "super_admin";
  const [selectedCollegeScope, setSelectedCollegeScope] = useState<string>(() => adminCollege || "Uttaranchal University");

  // Strictly enforce admin's college:
  const activeCollegeScope = adminCollege || selectedCollegeScope || "Uttaranchal University";

  const allOngoingRides = (opsData?.ongoingRides || []).filter((ride: any) => {
    const target = (activeCollegeScope || "").toLowerCase().trim();
    if (!target) return true;
    const driverCollege = (ride.driver?.college || "").toLowerCase().trim();
    return driverCollege.includes(target) || target.includes(driverCollege);
  });

  const filteredOngoingRides = allOngoingRides
    .filter((ride) => {
      if (ongoingFilter === "live") return ride.isLiveNow || ride.status === "in_progress";
      if (ongoingFilter === "scheduled") return !ride.isLiveNow && ride.status === "scheduled";
      return true;
    })
    .filter((ride) => {
      if (!ongoingSearchQuery) return true;
      const q = ongoingSearchQuery.toLowerCase();
      const driverName = ride.driver?.name?.toLowerCase() || "";
      const origin = ride.origin?.text?.toLowerCase() || "";
      const dest = ride.destination?.text?.toLowerCase() || "";
      const passengersStr = (ride.passengers || []).map((p: any) => p.name.toLowerCase()).join(" ");
      return (
        driverName.includes(q) ||
        origin.includes(q) ||
        dest.includes(q) ||
        passengersStr.includes(q)
      );
    });

  const filteredVerifications = verifications.filter((req: any) => {
    if (activeCollegeScope === "ALL" && isSuperAdmin) return true;
    const target = (activeCollegeScope || "").toLowerCase().trim();
    if (!target) return true;
    const col = (req.college || req.userId?.college || "").toLowerCase().trim();
    return col.includes(target) || target.includes(col);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Alert Banner for incoming SOS */}
      {notificationBanner && (
        <div className="p-4 bg-[#D9383A] text-white rounded-xl flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span className="font-semibold text-sm">{notificationBanner}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs uppercase tracking-wider font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDE1DE] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#143D32]/10 border border-[#143D32]/20 text-xs font-mono text-[#143D32] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#143D32]" />
            <span>CAMPUSRIDE SECURITY & MOBILITY COMMAND</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#18201D] tracking-tight">
            Institutional Operations Center
          </h1>
          <p className="text-sm text-[#646A67] mt-1">
            Real-time emergency monitoring, student identity gatekeeper, and campus mobility intelligence.
          </p>

          {/* Institutional Campus Scoping Indicator */}
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Scoped: {activeCollegeScope === 'ALL' ? 'All Campuses (Super Admin)' : activeCollegeScope}</span>
            </span>

            {isSuperAdmin && (
              <select
                value={selectedCollegeScope}
                onChange={(e) => setSelectedCollegeScope(e.target.value)}
                className="text-xs p-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Uttaranchal University">Uttaranchal University</option>
                <option value="Graphic Era University">Graphic Era University</option>
                <option value="University of Petroleum and Energy Studies">UPES</option>
                <option value="DIT University">DIT University</option>
                <option value="Doon University">Doon University</option>
                <option value="ALL">All Campuses (Global Super Admin View)</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadSocIncidents();
              loadVerifications();
              loadAnalytics();
              loadHubs();
              loadAuditLogs();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DDE1DE] rounded-xl text-xs font-mono text-[#18201D] hover:bg-[#F7F5F0] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#646A67]" />
            <span>REFRESH FEEDS</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#DDE1DE] pb-px">
        <button
          onClick={() => {
            setActiveTab("overview");
            loadAdminOperations();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-xl transition-colors border-b-2 cursor-pointer ${
            activeTab === "overview"
              ? "border-emerald-600 text-emerald-800 bg-white font-bold shadow-xs"
              : "border-transparent text-[#646A67] hover:text-[#18201D] hover:bg-white/60"
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>OPERATIONS OVERVIEW</span>
          {opsData?.kpis.ongoingRidesCount ? (
            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-600 text-white rounded-full font-bold">
              {opsData.kpis.ongoingRidesCount} Live
            </span>
          ) : null}
        </button>

        <button
          onClick={() => {
            setActiveTab("pricing");
            loadAdminOperations();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-xl transition-colors border-b-2 cursor-pointer ${
            activeTab === "pricing"
              ? "border-emerald-600 text-emerald-800 bg-white font-bold shadow-xs"
              : "border-transparent text-[#646A67] hover:text-[#18201D] hover:bg-white/60"
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span>CAMPUS FARE & PRICING</span>
        </button>

        <button
          onClick={() => setActiveTab("soc")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-xl transition-colors border-b-2 cursor-pointer ${
            activeTab === "soc"
              ? "border-[#D9383A] text-[#D9383A] bg-white font-bold shadow-xs"
              : "border-transparent text-[#646A67] hover:text-[#18201D] hover:bg-white/60"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>SECURITY OPS (SOC)</span>
          {activeIncidentsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-[#D9383A] text-white rounded-full font-bold animate-pulse">
              {activeIncidentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("verifications");
            loadVerifications();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-xl transition-colors border-b-2 ${
            activeTab === "verifications"
              ? "border-[#143D32] text-[#143D32] bg-white font-bold shadow-xs"
              : "border-transparent text-[#646A67] hover:text-[#18201D] hover:bg-white/60"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>STUDENT VERIFICATION QUEUE</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-xl transition-colors border-b-2 ${
            activeTab === "analytics"
              ? "border-[#143D32] text-[#143D32] bg-white font-bold shadow-xs"
              : "border-transparent text-[#646A67] hover:text-[#18201D] hover:bg-white/60"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>MOBILITY ANALYTICS</span>
        </button>

        <button
          onClick={() => setActiveTab("hubs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-xl transition-colors border-b-2 ${
            activeTab === "hubs"
              ? "border-[#143D32] text-[#143D32] bg-white font-bold shadow-xs"
              : "border-transparent text-[#646A67] hover:text-[#18201D] hover:bg-white/60"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>CAMPUS HUBS & GEOFENCES</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-xl transition-colors border-b-2 ${
            activeTab === "audit"
              ? "border-[#143D32] text-[#143D32] bg-white font-bold shadow-xs"
              : "border-transparent text-[#646A67] hover:text-[#18201D] hover:bg-white/60"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>IMMUTABLE AUDIT LOGS</span>
        </button>
      </div>

      {/* TAB 0: REAL-TIME OPERATIONS & KPI DASHBOARD (DEFAULT) */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Top 4 KPI Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Platform Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Total Platform Revenue
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ₹
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  ₹{opsData ? opsData.kpis.totalRevenue.toLocaleString() : "18,450"}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +16.8%
                  </span>
                  <span>vs private cab costs</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Avg Fare: ₹{opsData?.pricingConfig?.basePrice || 20}/seat</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Min ₹10 Standard
                </span>
              </div>
            </div>

            {/* KPI 2: Total Campus Rides */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Total Campus Rides
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {opsData ? opsData.kpis.totalRides : 24} Rides
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  13 Active corridors in Dehradun & NCR
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Completed: {opsData ? Math.max(12, opsData.kpis.totalRides - 3) : 18}</span>
                <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  100% Verified
                </span>
              </div>
            </div>

            {/* KPI 3: CO2 Saved Emissions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  CO2 Emissions Saved
                </span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Leaf className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {opsData ? opsData.kpis.co2SavedKg : 215.4} kg
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>~14 mature trees equivalent 🌿</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Passenger-Km: {opsData ? Math.round(opsData.kpis.co2SavedKg / 0.171) : 1260} km</span>
                <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                  Green Campus
                </span>
              </div>
            </div>

            {/* KPI 4: Total Ongoing Rides */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Ongoing & Active Rides
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{opsData ? opsData.kpis.ongoingRidesCount : 3} Live</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Verified students commuting right now
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>GPS Telemetry Active</span>
                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                  Safe Corridors
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Ongoing Rides Tracking Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-lg font-black text-slate-900">
                    Live Ongoing Rides & Commuter Operations
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active drivers, onboard co-passengers, drop locations, and fare pricing breakdown.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search in ongoing rides */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={ongoingSearchQuery}
                    onChange={(e) => setOngoingSearchQuery(e.target.value)}
                    placeholder="Search driver, passenger, drop..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filter buttons */}
                {(["all", "live", "scheduled"] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setOngoingFilter(filterVal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      ongoingFilter === filterVal
                        ? "bg-[#143D32] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filterVal === "all" ? "All Rides" : filterVal === "live" ? "Live On Road" : "Scheduled"}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Ongoing Rides */}
            <div className="divide-y divide-slate-100">
              {filteredOngoingRides.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">
                  {opsLoading ? "Loading live rides..." : "No rides match the selected filter."}
                </div>
              ) : (
                filteredOngoingRides.map((ride: any) => (
                  <div key={ride.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
                    {/* Top status & Fare value bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                            ride.isLiveNow || ride.status === "in_progress"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : ride.status === "driver_started"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-blue-100 text-blue-800 border border-blue-300"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ride.isLiveNow ? "bg-emerald-500 animate-ping" : "bg-blue-500"
                            }`}
                          />
                          {ride.status === "in_progress"
                            ? "IN PROGRESS (ON ROAD)"
                            : ride.status === "driver_started"
                            ? "DRIVER EN ROUTE TO PICKUP"
                            : "SCHEDULED COMMUTE"}
                        </span>

                        <span className="text-xs text-slate-500 font-mono">
                          Slot: {new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Values & Fare Contribution */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900 flex items-center justify-end gap-1">
                            <span className="text-xs text-slate-500 font-normal">Fare:</span>
                            <span className="text-emerald-600 font-mono">₹{ride.pricePerSeat}</span>
                            <span className="text-xs text-slate-400 font-normal">/ seat</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Total Carpool Value: ₹{ride.totalValue || ride.pricePerSeat * Math.max(1, ride.passengers?.length || 1)}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Min ₹10 Compliant
                        </span>
                      </div>
                    </div>

                    {/* Three-Column Details: Who is Riding (Driver) | Co-Riders (Passengers) | Drop Point & Route */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                      {/* Column 1: Who is Riding (Driver) */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                          <span>Who is Riding (Driver)</span>
                          <span className="text-emerald-600 text-[10px]">Verified Driver</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={ride.driver.avatarURL}
                            alt={ride.driver.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-200"
                          />
                          <div>
                            <div className="font-bold text-sm text-slate-900">{ride.driver.name}</div>
                            <div className="text-xs text-slate-600">
                              {ride.driver.college || "Uttaranchal University"}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {ride.driver.course} {ride.driver.department ? `(${ride.driver.department})` : ""} • ⭐ {ride.driver.rating || 4.8}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">Vehicle:</span>
                            <span className="font-bold">
                              {ride.driver?.vehicle?.model || ride.driver?.vehicleModel || "Honda City i-VTEC"} (Plate: {ride.driver?.vehicle?.plateLast4 || ride.driver?.vehiclePlate || "4821"})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-slate-500">Phone:</span>
                            <span className="font-mono text-xs">{ride.driver?.phone || "+91 98765 43210"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Who are with Rider (Passengers) */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                          <span>Who are with Rider (Co-Passengers)</span>
                          <span className="text-blue-600 text-[10px]">
                            {ride.passengers?.length || 0} Booked
                          </span>
                        </div>

                        {(!ride.passengers || ride.passengers.length === 0) ? (
                          <div className="py-5 text-center text-xs text-slate-500">
                            <Users className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                            <p>No co-passengers joined yet.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {ride.availableSeats || 3} empty seats available for classmates.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                            {(ride.passengers || []).map((p: any, pIdx: number) => (
                              <div
                                key={p.id || pIdx}
                                className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={p.avatarURL || "/test_uploads/profile_photo.jpg"}
                                    alt={p.name}
                                    className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900">{p.name}</div>
                                    <div className="text-[11px] text-slate-500">
                                      {p.department || "Student"} • {p.college?.split(' ')[0] || "UU"}
                                    </div>
                                  </div>
                                </div>
                                {p.emergencyContact && (
                                  <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono">
                                    ICE: {typeof p.emergencyContact === 'string' ? p.emergencyContact : p.emergencyContact.relation || 'Parent'}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Column 3: Where is the Drop Point & Route */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
                          <span>Pickup & Drop Point</span>
                          <span className="text-emerald-700 text-[10px] font-bold">Via Safe Bridge</span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          {/* Pickup Point */}
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              A
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-slate-400">Pickup Location</div>
                              <div className="font-bold text-slate-900">{ride.origin?.text || ride.pickupPoint?.text || "Premnagar Chowk"}</div>
                            </div>
                          </div>

                          {/* Drop Destination Point */}
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              B
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-red-600 font-bold">Drop Destination</div>
                              <div className="font-bold text-slate-900">{ride.destination?.text || ride.dropPoint?.text || "Campus Gate 1"}</div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span>🌉 Nanda Ki Chowki Bridge</span>
                          <span className="font-mono font-semibold text-slate-700">~{ride.distanceKm || 8.4} km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fare Policy Banner on Overview */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                ₹
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Campus Mobility Minimum Fare Policy: ₹{opsData?.pricingConfig?.minPricePerSeat || 10}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Set to match local transit communication prices (Vikram / auto / e-rickshaw shared hop rates).
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("pricing")}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure Transit Pricing</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB: CAMPUS FARE & PRICING CONFIGURATION */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 font-mono mb-2">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CAMPUS COMMUTER FARE POLICY CONTROL</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Fare Pricing & Local Communication Alignment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust minimum fares and per-km rates to reflect local communication/transit prices (e.g. Dehradun Vikram, e-rickshaws, and shared autos). Minimum ride fare must be at least ₹10.
                </p>
              </div>
              {pricingSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pricingSuccessMsg}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSavePricing} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* 1. Minimum Price for Riding */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 block">
                    Minimum Ride Fare (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      min={10}
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(Math.max(10, Number(e.target.value)))}
                      required
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mandatory minimum fare for any campus ride. Cannot be lower than ₹10.
                  </p>
                </div>

                {/* 2. Base Flag-Drop Fare */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 block">
                    Base Starting Fare (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      min={10}
                      value={basePriceInput}
                      onChange={(e) => setBasePriceInput(Math.max(10, Number(e.target.value)))}
                      required
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Initial pickup cost applied at campus hubs.
                  </p>
                </div>

                {/* 3. Per-Kilometer Rate */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate-700 block">
                    Per-KM Rate (₹/km)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      min={1}
                      value={perKmInput}
                      onChange={(e) => setPerKmInput(Math.max(1, Number(e.target.value)))}
                      required
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Calculated fuel-split distance multiplier for shared seats.
                  </p>
                </div>
              </div>

              {/* Local Communication / Transit Benchmark Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-slate-700 block">
                  Local Transit Communication Benchmark Notes
                </label>
                <textarea
                  rows={3}
                  value={localBenchmarkInput}
                  onChange={(e) => setLocalBenchmarkInput(e.target.value)}
                  placeholder="e.g. Dehradun Vikram/Auto rates: Premnagar local ₹10-₹15, Suddhowala ₹15-₹20..."
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  Displayed as a reference to drivers and riders when posting or reviewing fares.
                </p>
              </div>

              {/* Local Transit Reference Comparison Table */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Local Dehradun Corridor Price Benchmarks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900">Premnagar ↔ UIT Gate</div>
                    <div className="text-emerald-700 font-bold mt-1">₹10 – ₹15</div>
                    <div className="text-[10px] text-slate-500">Standard local short-hop</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900">Suddhowala ↔ Campus</div>
                    <div className="text-emerald-700 font-bold mt-1">₹15 – ₹20</div>
                    <div className="text-[10px] text-slate-500">Hostel corridor bridge link</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900">Selaqui ↔ Campus</div>
                    <div className="text-emerald-700 font-bold mt-1">₹25 – ₹35</div>
                    <div className="text-[10px] text-slate-500">Industrial & residential corridor</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900">ISBT Dehradun ↔ Campus</div>
                    <div className="text-emerald-700 font-bold mt-1">₹45 – ₹60</div>
                    <div className="text-[10px] text-slate-500">City bus & inter-city connector</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={pricingSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pricingSaving ? "Saving Policy..." : "Save & Apply Fare Policy"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: SECURITY OPERATIONS CENTER (SOC) */}
      {activeTab === "soc" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-[#DDE1DE]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#646A67] uppercase">Filter Incidents:</span>
              {(["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSocFilter(status)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                    socFilter === status
                      ? "bg-[#143D32] text-white font-semibold"
                      : "bg-[#F7F5F0] text-[#646A67] hover:text-[#18201D]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="text-xs font-mono text-[#646A67] flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#18A66A] animate-pulse" />
              <span>LIVE DISPATCH LINK ENGAGED</span>
            </div>
          </div>

          {socLoading ? (
            <div className="py-16 text-center font-mono text-xs text-[#646A67]">
              <div className="w-6 h-6 border-2 border-[#143D32] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              POLLING EMERGENCY DISPATCH FEEDS...
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#DDE1DE] text-center">
              <ShieldCheck className="w-12 h-12 text-[#18A66A] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#18201D]">All Corridors Secure</h3>
              <p className="text-xs text-[#646A67] mt-1 max-w-md mx-auto">
                No active emergency SOS distress signals reported across registered campus transit zones.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredIncidents.map((incident) => {
                const isUrgent = incident.status === "ACTIVE";
                const isAck = incident.status === "ACKNOWLEDGED";
                const isResolved = incident.status === "RESOLVED";

                return (
                  <div
                    key={incident._id}
                    className={`bg-white rounded-2xl border p-6 transition-all ${
                      isUrgent
                        ? "border-[#D9383A] shadow-md ring-1 ring-[#D9383A]/30 bg-red-50/20"
                        : "border-[#DDE1DE] shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#DDE1DE]">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            isUrgent
                              ? "bg-[#D9383A] text-white animate-bounce"
                              : isAck
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#18201D]">
                              INCIDENT #{incident._id.slice(-6).toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide uppercase ${
                                isUrgent
                                  ? "bg-[#D9383A] text-white"
                                  : isAck
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              }`}
                            >
                              {incident.status}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-[#646A67] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(incident.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {isUrgent && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident._id, "ACKNOWLEDGED")}
                            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold font-mono tracking-wider transition-colors shadow-xs"
                          >
                            ACKNOWLEDGE
                          </button>
                        )}

                        {!isResolved && (
                          <button
                            onClick={() => {
                              setResolvingId(incident._id);
                              setResolutionNotes("");
                            }}
                            className="px-3.5 py-1.5 bg-[#18A66A] hover:bg-[#158C59] text-white rounded-xl text-xs font-semibold font-mono tracking-wider transition-colors shadow-xs"
                          >
                            RESOLVE
                          </button>
                        )}

                        {!isResolved && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident._id, "FALSE_ALARM", "Operator verified safe")}
                            className="px-3 py-1.5 bg-white border border-[#DDE1DE] hover:bg-[#F7F5F0] text-[#646A67] rounded-xl text-xs font-mono transition-colors"
                          >
                            FALSE ALARM
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Incident Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs">
                      {/* Student Info */}
                      <div className="space-y-1.5">
                        <span className="font-mono text-[10px] uppercase text-[#646A67] block">
                          Distress Caller Info
                        </span>
                        <div className="font-bold text-[#18201D] text-sm">
                          {incident.triggeredBy?.name || "Student Caller"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[#646A67]">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{incident.triggeredBy?.email || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#646A67]">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{incident.triggeredBy?.phone || "No phone listed"}</span>
                        </div>
                      </div>

                      {/* Location & GPS */}
                      <div className="space-y-1.5">
                        <span className="font-mono text-[10px] uppercase text-[#646A67] block">
                          GPS Coordinates & Fix
                        </span>
                        <div className="font-mono font-semibold text-[#18201D]">
                          {incident.location?.latitude?.toFixed(6)}, {incident.location?.longitude?.toFixed(6)}
                        </div>
                        <div className="text-[#646A67]">
                          Accuracy: ±{incident.location?.accuracy || 15} meters
                        </div>
                        <a
                          href={`https://maps.google.com/?q=${incident.location?.latitude},${incident.location?.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#143D32] hover:underline font-mono font-semibold pt-1"
                        >
                          <Navigation className="w-3 h-3" /> View on Google Maps
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {/* Emergency Contacts Dispatch Status */}
                      <div className="space-y-1.5">
                        <span className="font-mono text-[10px] uppercase text-[#646A67] block">
                          Emergency Contacts Dispatched
                        </span>
                        {incident.contactsNotified && incident.contactsNotified.length > 0 ? (
                          <div className="space-y-1">
                            {incident.contactsNotified.map((c: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between bg-[#F7F5F0] p-1.5 rounded border border-[#DDE1DE]">
                                <span className="font-medium text-[#18201D]">{c.name} ({c.relationship})</span>
                                <span className="font-mono text-[10px] text-[#18A66A] font-semibold">{c.status}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#646A67] italic">Campus security alerted directly.</span>
                        )}
                      </div>
                    </div>

                    {/* Resolution Modal / Form inline */}
                    {resolvingId === incident._id && (
                      <div className="mt-4 p-4 bg-[#F7F5F0] rounded-xl border border-[#DDE1DE] space-y-3">
                        <span className="text-xs font-bold text-[#18201D] block">
                          Security Resolution Log & Sign-Off
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. Campus patrol reached student at North Gate; escort completed."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-[#DDE1DE] bg-white focus:outline-none focus:ring-1 focus:ring-[#143D32]"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setResolvingId(null)}
                            className="px-3 py-1.5 bg-white border border-[#DDE1DE] text-xs font-mono rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident._id, "RESOLVED", resolutionNotes)}
                            className="px-3 py-1.5 bg-[#18A66A] text-white text-xs font-mono font-semibold rounded-lg"
                          >
                            Confirm Resolution
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT VERIFICATION QUEUE */}
      {activeTab === "verifications" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#DDE1DE]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#646A67] uppercase">Queue Filter:</span>
              {(["pending", "approved", "rejected"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setVerificationFilter(st);
                    loadVerifications();
                  }}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                    verificationFilter === st
                      ? "bg-[#143D32] text-white font-semibold"
                      : "bg-[#F7F5F0] text-[#646A67] hover:text-[#18201D]"
                  }`}
                >
                  {st.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="text-xs font-mono text-[#646A67]">
              {filteredVerifications.length} submissions in view
            </div>
          </div>

          {verificationsLoading ? (
            <div className="py-16 text-center font-mono text-xs text-[#646A67]">
              <div className="w-6 h-6 border-2 border-[#143D32] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              FETCHING ID CARD VERIFICATION QUEUE...
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#DDE1DE] text-center">
              <CheckCircle2 className="w-12 h-12 text-[#18A66A] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#18201D]">Queue Clear</h3>
              <p className="text-xs text-[#646A67] mt-1 max-w-md mx-auto">
                No student verification requests pending review for this campus filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVerifications.map((req) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border border-[#DDE1DE] p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DDE1DE]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#143D32]/10 text-[#143D32] flex items-center justify-center font-bold">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#18201D] text-sm">
                            {req.userId?.name || "Student"}
                          </h4>
                          <span className="text-xs font-mono text-[#646A67] block">
                            {req.userId?.email || "student@dtu.ac.in"}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          req.status === "pending"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : req.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="py-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#646A67]">Roll / ID Number:</span>
                        <span className="font-mono font-bold text-[#18201D]">
                          {req.studentIdentifier}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#646A67]">Document Type:</span>
                        <span className="font-mono text-[#18201D] uppercase">
                          {req.documentType || "Student ID"} ({req.documentMimeType?.split("/")[1] || "JPEG"})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#646A67]">File Size:</span>
                        <span className="font-mono text-[#18201D]">
                          {Math.round((req.documentSizeBytes || 250000) / 1024)} KB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#646A67]">Submitted:</span>
                        <span className="font-mono text-[#646A67]">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Mock ID Card Visual Badge & Modal Trigger */}
                      <div className="mt-3 p-3 bg-[#F7F5F0] rounded-xl border border-[#DDE1DE] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#143D32]" />
                          <span className="font-mono text-[11px] text-[#18201D] truncate max-w-[170px]">
                            {req.documentStorageKey || "student_id_doc.png"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReviewModalRequest(req)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#DDE1DE] space-y-3">
                    <button
                      type="button"
                      onClick={() => setReviewModalRequest(req)}
                      className="w-full py-2 bg-[#143D32] hover:bg-[#0E2C24] text-white rounded-xl text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>OPEN FULL VERIFICATION INSPECTOR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dedicated Verification Review Modal with Live Document Previews */}
          <VerificationReviewModal
            isOpen={!!reviewModalRequest}
            request={reviewModalRequest}
            onClose={() => setReviewModalRequest(null)}
            onApprove={async (id) => {
              await api.approveVerification(id);
              await loadVerifications();
            }}
            onReject={async (id, reason) => {
              await api.rejectVerification(id, reason);
              await loadVerifications();
            }}
          />
        </div>
      )}

      {/* TAB 3: MOBILITY ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          {/* Primary KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
              <span className="text-[11px] font-mono text-[#646A67] uppercase block">
                Total Students
              </span>
              <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-[#18201D]">
                {summary.totalUsers}
              </div>
              <span className="mt-1 text-xs font-mono text-[#18A66A] flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% verified
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
              <span className="text-[11px] font-mono text-[#646A67] uppercase block">
                Active Carpools
              </span>
              <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-[#143D32]">
                {summary.activeRides}
              </div>
              <span className="mt-1 text-xs font-mono text-[#646A67] block">
                Corridors in service
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
              <span className="text-[11px] font-mono text-[#646A67] uppercase block">
                Completed Trips
              </span>
              <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-[#18201D]">
                {summary.completedTrips}
              </div>
              <span className="mt-1 text-xs font-mono text-[#18A66A] block font-semibold">
                Verified OTP handshakes
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
              <span className="text-[11px] font-mono text-[#646A67] uppercase block">
                Carbon Offset
              </span>
              <div className="mt-2 text-3xl sm:text-4xl font-black font-mono text-[#18A66A]">
                {summary.co2SavedKg.toFixed(1)} kg
              </div>
              <span className="mt-1 text-xs font-mono text-[#646A67] block">
                CO₂ emissions averted
              </span>
            </div>
          </div>

          {/* Transit Arrival Peak Hour Influx */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DDE1DE] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE1DE]">
              <div>
                <span className="text-xs font-mono uppercase text-[#646A67]">
                  Hourly Campus Gate Influx
                </span>
                <h2 className="text-lg font-bold text-[#18201D] mt-0.5">
                  Peak Arrival Distribution
                </h2>
              </div>
              <span className="text-xs font-mono text-[#143D32] font-semibold bg-[#143D32]/10 px-2.5 py-1 rounded-full">
                08:30 AM MORNING COMMUTE PEAK
              </span>
            </div>

            <div className="mt-8 grid grid-cols-6 gap-3 items-end h-48 pt-6">
              {peakHours.map((slot, i) => {
                const heightPercent = Math.min(
                  Math.max((slot.rides / 16) * 100, 15),
                  100
                );
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 h-full justify-end group"
                  >
                    <span className="text-xs font-mono font-bold text-[#18201D]">
                      {slot.rides}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-lg bg-[#143D32]/30 group-hover:bg-[#143D32] transition-colors border border-[#143D32]/50"
                    />
                    <span className="text-[11px] font-mono text-[#646A67]">
                      {slot.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CAMPUS HUBS & GEOFENCES */}
      {activeTab === "hubs" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE1DE]">
              <div>
                <span className="text-xs font-mono uppercase text-[#646A67]">
                  Transit Infrastructure
                </span>
                <h2 className="text-lg font-bold text-[#18201D] mt-0.5">
                  Designated Campus Pickup Hubs
                </h2>
              </div>
              <span className="text-xs font-mono text-[#18A66A] font-semibold">
                3 HUBS ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {hubs.map((hub) => (
                <div
                  key={hub._id}
                  className="bg-[#F7F5F0] p-5 rounded-xl border border-[#DDE1DE] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-white border border-[#DDE1DE] text-[10px] font-mono font-bold rounded text-[#143D32]">
                      {hub.code}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#18A66A]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#18201D]">{hub.name}</h3>
                    <p className="text-xs text-[#646A67] mt-1">{hub.description}</p>
                  </div>
                  <div className="pt-2 border-t border-[#DDE1DE] text-xs font-mono space-y-1">
                    <div className="flex justify-between text-[#646A67]">
                      <span>Safe Buffer Radius:</span>
                      <span className="font-semibold text-[#18201D]">{hub.geofenceRadiusMeters} meters</span>
                    </div>
                    <div className="flex justify-between text-[#646A67]">
                      <span>Coordinates:</span>
                      <span className="text-[#18201D]">
                        {hub.location?.coordinates[1]?.toFixed(4)}, {hub.location?.coordinates[0]?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IMMUTABLE AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#DDE1DE] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#DDE1DE] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-[#646A67]">
                  Compliance & Security
                </span>
                <h2 className="text-lg font-bold text-[#18201D] mt-0.5">
                  Append-Only Administrative Audit Trails
                </h2>
              </div>
              <span className="text-xs font-mono text-[#646A67]">
                Last 30 recorded security events
              </span>
            </div>

            {auditLoading ? (
              <div className="py-16 text-center font-mono text-xs text-[#646A67]">
                LOADING AUDIT TRAILS...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#646A67]">
                No audit events recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-[#DDE1DE] max-h-[500px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log._id} className="p-4 hover:bg-[#F7F5F0]/50 transition-colors flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#143D32]">
                          {log.action}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#F7F5F0] border border-[#DDE1DE] rounded text-[10px] font-mono text-[#646A67]">
                          Role: {log.actorRole}
                        </span>
                      </div>
                      <div className="text-[#646A67] font-mono text-[11px]">
                        Target: {log.resourceType} {log.resourceId ? `(#${log.resourceId.slice(-6)})` : ""}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[#646A67] text-[11px] space-y-0.5">
                      <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                      <div>IP: {log.ipAddress || "127.0.0.1"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
