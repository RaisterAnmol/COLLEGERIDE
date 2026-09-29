import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { IRide, IRideRequest, ITrip } from '../types';
import {
  Car,
  Search,
  PlusCircle,
  ShieldCheck,
  Star,
  Users,
  MapPin,
  Clock,
  Navigation,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  School,
  ArrowUpRight,
  Shield,
  Key,
  Edit3,
  X,
  BookOpen,
  Phone,
  Award,
  MessageSquare,
  ThumbsUp,
  Heart,
  Check,
  UserCheck,
} from 'lucide-react';
import { SearchableInput } from '../components/common/SearchableInput';
import { ReviewModal } from '../components/ReviewModal';
import dashboardHeroImg from '../assets/illustrations/dashboard-hero.jpg';
import reviewsTrustImg from '../assets/illustrations/campus-reviews-trust.jpg';
import {
  POPULAR_COLLEGES,
  POPULAR_DEPARTMENTS,
  POPULAR_BRANCHES_COURSES,
} from '../data/academicData';
import { sanitizeLocationText } from '../utils/sanitizeLocation';

export const DashboardPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [myOfferedRides, setMyOfferedRides] = useState<IRide[]>([]);
  const [myRequests, setMyRequests] = useState<IRideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'driver' | 'passenger'>('all');
  const [activeReviewModal, setActiveReviewModal] = useState<{
    tripId: string;
    toUserId: string;
    recipientName: string;
    role: 'driver' | 'passenger';
    college?: string;
  } | null>(null);

  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editCollege, setEditCollege] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editYear, setEditYear] = useState(1);
  const [editSemester, setEditSemester] = useState(1);
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openEditModal = () => {
    if (user) {
      setEditCollege(user.college || '');
      setEditDepartment(user.department || '');
      setEditCourse(user.course || '');
      setEditYear(user.year || 1);
      setEditSemester(user.semester || 1);
      const rawPhone = (user.phone || '').replace(/^\+91\s*/, '').replace(/\D/g, '').slice(0, 10);
      setEditPhone(rawPhone);
      setProfileMsg(null);
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const formattedPhone = editPhone.trim() ? `+91 ${editPhone.trim()}` : '';
      if (updateProfile) {
        await updateProfile({
          college: editCollege.trim(),
          department: editDepartment.trim(),
          course: editCourse.trim(),
          year: Number(editYear),
          semester: Number(editSemester),
          phone: formattedPhone,
        });
      } else {
        await api.updateProfile({
          college: editCollege.trim(),
          department: editDepartment.trim(),
          course: editCourse.trim(),
          year: Number(editYear),
          semester: Number(editSemester),
          phone: formattedPhone,
        });
      }
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditingProfile(false);
      }, 900);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const loadReviews = async (userId: string) => {
    try {
      setReviewsLoading(true);
      const res = await api.getUserReviews(userId);
      setReviews(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('[Dashboard] Could not load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    const userId = user._id || (user as any).id;

    try {
      const [ridesRes, reqsRes] = await Promise.allSettled([
        api.getRides({ creatorId: userId }),
        api.getRequests('passenger'),
      ]);

      if (ridesRes.status === 'fulfilled') {
        setMyOfferedRides(ridesRes.value || []);
      }
      if (reqsRes.status === 'fulfilled') {
        setMyRequests(reqsRes.value || []);
      }
    } catch (err) {
      console.error('[Dashboard] Error loading rides/requests:', err);
    }

    if (userId) {
      await loadReviews(userId);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const [passengerCommuteTab, setPassengerCommuteTab] = useState<'upcoming' | 'previous'>('upcoming');

  // Role & derived calculations
  const isPassenger = user?.accountType === 'PASSENGER' || user?.accountType === 'WOMEN_PASSENGER' || (user?.role !== 'driver' && myOfferedRides.length === 0);
  const upcomingRequests = myRequests.filter((r) => r.status === 'pending' || r.status === 'accepted');
  const previousRequests = myRequests.filter((r) => r.status === 'declined' || r.status === 'cancelled' || (r as any).status === 'completed');

  // Derived review calculations
  const driverReviews = reviews.filter((r) => (r.role || '').toLowerCase() === 'driver');
  const passengerReviews = reviews.filter((r) => {
    const role = (r.role || '').toLowerCase();
    if (role === 'passenger') return true;
    if (!role) return isPassenger;
    return false;
  });
  const displayedReviews =
    reviewFilter === 'driver'
      ? driverReviews
      : reviewFilter === 'passenger'
      ? passengerReviews
      : reviews;

  // Aggregate compliment tags
  const tagCounts: Record<string, number> = {};
  for (const r of reviews) {
    if (Array.isArray(r.tags)) {
      for (const t of r.tags) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    }
  }
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const userAvatar =
    user?.avatarURL ||
    (user?.email ? localStorage.getItem('campusride_user_avatar_' + user.email.toLowerCase().trim()) : null) ||
    localStorage.getItem('campusride_user_selfie') ||
    '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 relative">
      {/* Background Ambient Radial Tech Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Modern Student Profile Card & Mobility Banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/60 border border-emerald-200/70 shadow-[0_15px_35px_-10px_rgba(16,185,129,0.12),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Subtle Tech / Campus Matrix Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.15)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />

          {/* Ambient Glowing Aurora Mesh Orbs */}
          <div className="absolute -top-20 -right-16 w-96 h-96 bg-emerald-400/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-16 right-1/3 w-80 h-80 bg-teal-300/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-emerald-300/15 rounded-full blur-[70px] pointer-events-none" />

          {/* Main Content Area */}
          <div className="relative z-10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar & Identity Header */}
            <div className="flex items-start sm:items-center gap-5">
              {/* Avatar Container with Clean Glowing Ring */}
              <div className="relative shrink-0 select-none">
                <div className="w-20 h-20 sm:w-24 sm:h-24 max-w-[80px] max-h-[80px] sm:max-w-[96px] sm:max-h-[96px] min-w-[80px] min-h-[80px] sm:min-w-[96px] sm:min-h-[96px] rounded-2xl p-1 bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20 flex items-center justify-center overflow-hidden shrink-0">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={user?.name || 'Student'}
                      className="w-full h-full max-w-[72px] max-h-[72px] sm:max-w-[88px] sm:max-h-[88px] aspect-square rounded-[14px] object-cover bg-slate-100 block"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full rounded-[14px] bg-gradient-to-br from-[#143D32] to-[#10b981] text-white font-black text-2xl sm:text-3xl flex items-center justify-center uppercase select-none';
                          fallback.innerText = (user?.name ? user.name.trim().charAt(0) : 'U');
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#143D32] to-[#10b981] text-white font-black text-2xl sm:text-3xl flex items-center justify-center uppercase select-none">
                      {user?.name ? user.name.trim().charAt(0) : 'U'}
                    </div>
                  )}
                </div>
                {/* Active Verified Status Badge */}
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-white flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Name, Verified Status & Academic Tags */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {user?.name}
                  </h1>
                  {user?.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified .edu Student
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                      Pending Verification
                    </span>
                  )}
                  {(user as any)?.role === 'driver' || (user as any)?.accountType === 'DRIVER' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold border border-blue-200">
                      🚗 Campus Driver
                    </span>
                  ) : null}
                </div>

                {/* Academic Chips Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-700 border border-slate-200/90 shadow-xs font-medium backdrop-blur-sm">
                    <School className="w-3.5 h-3.5 text-emerald-600" />
                    {user?.college || 'Not specified'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-700 border border-slate-200/90 shadow-xs font-medium backdrop-blur-sm">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    {user?.course || 'Not specified'} {user?.department ? `(${user.department})` : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-600 border border-slate-200/90 shadow-xs backdrop-blur-sm font-medium">
                    <span>Year {user?.year || '-'}</span>
                    <span className="text-slate-400">•</span>
                    <span>Sem {user?.semester || '-'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 shadow-xs font-semibold text-xs transition-colors cursor-pointer"
                    title="Edit academic details and phone number"
                  >
                    <Edit3 className="w-3 h-3 text-emerald-600" />
                    <span>Edit Info</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: High-Impact Action CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <Link
                to="/search"
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Find a Ride</span>
              </Link>
              <Link
                to="/post"
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Offer a Ride</span>
              </Link>
            </div>
          </div>

          {/* Bottom Frosted Stats & Safety Ribbon */}
          <div className="pt-5 border-t border-emerald-100/90 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Stat 1: Rating */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 backdrop-blur-md flex items-center gap-3 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  {user?.rating?.toFixed(1) || '5.0'} / 5.0
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Student Rating</div>
              </div>
            </div>

            {/* Stat 2: Total Rides */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 backdrop-blur-md flex items-center gap-3 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  {user?.totalRides || 0} Rides
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Shared Commutes</div>
              </div>
            </div>

            {/* Stat 3: Trust & Safety */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 backdrop-blur-md flex items-center gap-3 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  100% Verified
                </div>
                <div className="text-[11px] text-slate-500 font-medium">ID & Campus Safe</div>
              </div>
            </div>

            {/* Stat 4: ICE Emergency Contact */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 backdrop-blur-md flex items-center gap-3 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center font-bold">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-sm font-black text-slate-900 leading-tight truncate">
                  {user?.emergencyContact?.name || 'Not set'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  ICE: {user?.emergencyContact?.relation || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Commute Hub Illustrated Banner */}
        <div className="bg-white rounded-3xl border border-[#DDE1DE] p-6 sm:p-7 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#143D32] font-semibold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block">
                DAILY COMMUTE OVERVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
                Your Campus Commute, <br />
                <span className="text-[#143D32]">Always In Sync.</span>
              </h2>
              <p className="text-sm text-[#646A67] leading-relaxed max-w-lg">
                Manage your active ride offers, review incoming seat bookings from university peers, and track your daily travel savings all in one place.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/search"
                  className="px-5 py-2.5 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Explore Live Corridors</span>
                </Link>
                <Link
                  to="/safety"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Safety Guidelines</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 w-full">
              <div className="relative rounded-2xl overflow-hidden border border-[#DDE1DE] shadow-md group">
                <img
                  src={dashboardHeroImg}
                  alt="Student checking commute schedule on campus bench"
                  className="w-full h-48 sm:h-56 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#143D32]/70 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#143D32]/85 backdrop-blur-sm border border-emerald-400/30 text-emerald-50 text-xs font-mono">
                  CAMPUS COMMUTER HUB
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content: Role-Adaptive for Passenger vs Driver */}
      {isPassenger ? (
        /* Dedicated Passenger Commute & Bookings Hub */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-2xs shrink-0">
                🎒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Campus Commutes & Bookings</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
                    Passenger Hub
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track upcoming ride bookings, view driver arrival, and review your previous university carpools
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* Tab Selector: Upcoming vs Previous */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPassengerCommuteTab('upcoming')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    passengerCommuteTab === 'upcoming'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming ({upcomingRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPassengerCommuteTab('previous')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    passengerCommuteTab === 'previous'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Previous ({previousRequests.length})
                </button>
              </div>

              <Link
                to="/search"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Find a Ride
              </Link>
            </div>
          </div>

          {/* Commutes Tab Content */}
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading your commutes...
            </div>
          ) : passengerCommuteTab === 'upcoming' ? (
            upcomingRequests.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No active bookings or upcoming rides</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Search campus routes to get matched with verified student drivers commuting to your college.
                </p>
                <Link
                  to="/search"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  Explore Available Rides
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingRequests.map((req) => {
                  const ride = typeof req.rideId === 'object' ? req.rideId : null;
                  const isAccepted = req.status === 'accepted';
                  return (
                    <div
                      key={req._id}
                      onClick={() => ride && navigate(`/rides/${ride._id}`)}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white transition-all cursor-pointer shadow-xs space-y-4 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Route Itinerary
                          </span>
                          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                            <span>{sanitizeLocationText(ride?.origin?.text) || 'Origin'}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sanitizeLocationText(ride?.destination?.text) || 'Destination'}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isAccepted ? 'Confirmed • Trip Ready' : 'Pending Confirmation'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">DRIVER</span>
                          <span className="font-bold text-slate-800">{ride?.creator?.name || 'Classmate Driver'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">DEPARTURE</span>
                          <span className="font-bold text-slate-800">
                            {ride?.departureTime
                              ? new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Scheduled'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-medium">FARE SHARE</span>
                          <span className="font-black text-emerald-600">
                            ₹{(ride as any)?.pricing?.costPerSeat ?? (ride as any)?.pricePerSeat ?? 25}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-400 font-medium">
                          {isAccepted ? 'Pickup Bay OTP Ready' : 'Waiting for Driver'}
                        </span>
                        <div className="flex items-center gap-2">
                          {isAccepted && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/tracking');
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                              Track Trip →
                            </button>
                          )}
                          <span className="text-xs font-bold text-slate-500 hover:text-blue-600">
                            Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Previous Commutes Tab */
            previousRequests.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No previous commutes yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Completed campus carpools will be listed here. You will also be able to review and rate student drivers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previousRequests.map((req) => {
                  const ride = typeof req.rideId === 'object' ? req.rideId : null;
                  return (
                    <div
                      key={req._id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white transition-all shadow-xs space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                            <span>{sanitizeLocationText(ride?.origin?.text) || 'Origin'}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sanitizeLocationText(ride?.destination?.text) || 'Destination'}</span>
                          </div>
                          <span className="text-xs text-slate-500 block">
                            Driver: <span className="font-semibold text-slate-700">{ride?.creator?.name || 'Peer Driver'}</span>
                          </span>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                          Completed Commute
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                          {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : 'Past Ride'}
                        </span>

                        {ride?.creator && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReviewModal({
                                tripId: req._id,
                                toUserId: ride.creator._id || (ride.creator as any).id,
                                recipientName: ride.creator.name || 'Student Driver',
                                role: 'driver',
                                college: ride.creator.college,
                              });
                            }}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            Review Driver
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      ) : (
        /* Driver Main Grid Content */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Offered Rides (Driver Lane) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  🚗
                </div>
                <h2 className="text-lg font-bold text-slate-900">Your Offered Rides</h2>
              </div>
              <Link to="/post" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                + Post New Ride
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading rides...</div>
            ) : myOfferedRides.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Car className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">No commute rides posted yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Share empty seats on your daily university route and split fuel costs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myOfferedRides.map((ride) => (
                  <div
                    key={ride._id}
                    onClick={() => navigate(`/rides/${ride._id}`)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-white transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                          <span>{sanitizeLocationText(ride.origin?.text) || 'Origin'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{sanitizeLocationText(ride.destination?.text) || 'Destination'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{ride.availableSeats} seats left</span>
                          <span>•</span>
                          <span className="font-bold text-emerald-600">₹{(ride as any).pricing?.costPerSeat ?? (ride as any).pricePerSeat ?? 0}</span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-400 hover:text-emerald-600">
                        View Details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booked Rides & Requests (Passenger Lane for Driver) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  🎒
                </div>
                <h2 className="text-lg font-bold text-slate-900">Incoming Seat Bookings</h2>
              </div>
              <Link to="/search" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Browse Matches →
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading requests...</div>
            ) : myRequests.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">No active bookings yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  When students request seats on your ride, they will appear here for confirmation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => {
                  const ride = typeof req.rideId === 'object' ? req.rideId : null;
                  return (
                    <div
                      key={req._id}
                      onClick={() => ride && navigate(`/rides/${ride._id}`)}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-white transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                            <span>{sanitizeLocationText(ride?.origin?.text) || 'Origin'}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span>{sanitizeLocationText(ride?.destination?.text) || 'Destination'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Rider: {(req as any).passengerName || (req as any).passengerId?.name || 'Classmate'}</span>
                            <span>•</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                req.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                                  : req.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                        </div>

                        {req.status === 'accepted' && (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm">
                              Trip Ready →
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campus Peer Reviews & Mutual Trust Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Campus Peer Reviews & Trust</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  Mutual Ratings
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified feedback from student drivers and passengers across Uttarakhand universities
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reviewFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('driver')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                reviewFilter === 'driver'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3 h-3" />
              As Driver ({driverReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('passenger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                reviewFilter === 'passenger'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              As Passenger ({passengerReviews.length})
            </button>
          </div>
        </div>

        {/* Reputation Visual Banner & Top Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 border border-emerald-100/90 rounded-2xl p-5 sm:p-6">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-emerald-100 shadow-xs text-center">
            <div className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{user?.rating?.toFixed(1) || '5.0'}</span>
              <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            </div>
            <div className="flex items-center gap-1 text-amber-400 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">
              Based on {reviews.length} verified campus commutes
            </p>
            <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              100% University Verified
            </span>
          </div>

          <div className="md:col-span-8 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-emerald-200/80 shrink-0 shadow-xs relative">
              <img
                src={reviewsTrustImg}
                alt="Verified Campus Peer Trust"
                className="w-full h-full object-cover object-center scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-bold text-white bg-emerald-600/90 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  Campus Trust Network
                </span>
              </div>
            </div>

            <div className="space-y-2.5 w-full">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Top Peer Badges & Commendations
              </h4>
              {topTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {topTags.map(([tag, count]) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      <span>{tag}</span>
                      <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
                        {count}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Badges appear automatically as drivers and passengers exchange compliments upon ride completion.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Feed */}
        {reviewsLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading verified reviews...
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No {reviewFilter !== 'all' ? reviewFilter : ''} reviews yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Completed commutes automatically unlock mutual reviews. Both the driver and passengers rate each other to ensure a safe, high-trust campus carpool community.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReviews.map((rev, idx) => {
              const reviewer = rev.fromUserId || {};
              const reviewerName = reviewer.name || 'Campus Commuter';
              const reviewerCollege = reviewer.college || user?.college || 'University Peer';
              const isDriverRev = rev.role === 'driver';

              return (
                <div
                  key={rev._id || idx}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-white transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shrink-0 uppercase shadow-xs">
                        {reviewer.avatarURL ? (
                          <img
                            src={reviewer.avatarURL}
                            alt={reviewerName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          reviewerName.charAt(0)
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {isDriverRev ? 'Passenger Commuter' : 'Student Driver'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {reviewerName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {reviewerCollege} {reviewer.year ? `• Year ${reviewer.year}` : ''}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                        isDriverRev
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {isDriverRev ? <Car className="w-3.5 h-3.5 text-emerald-600" /> : <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                      {isDriverRev ? 'Feedback on Driver Service' : 'Feedback on Passenger Rider'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (rev.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {rev.rating ? `${rev.rating}.0` : '5.0'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Commute'}
                    </span>
                  </div>

                  {Array.isArray(rev.tags) && rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rev.tags.map((t: string) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{rev.comment || 'Smooth, punctual and courteous campus commute!'}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Edit Academic Profile Modal Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-[#143D32]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Edit Academic Profile</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Update your university, department, branch, or contact number
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* College Searchable Input */}
              <SearchableInput
                label="College / University"
                value={editCollege}
                onChange={setEditCollege}
                options={POPULAR_COLLEGES}
                placeholder="Search or type college (e.g. Uttaranchal, GEU, UPES, DTU)"
                icon={<School className="w-4 h-4" />}
                helperText="Search presets or write your institution"
                required
              />

              {/* Department & Course Searchable Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableInput
                  label="Department"
                  value={editDepartment}
                  onChange={setEditDepartment}
                  options={POPULAR_DEPARTMENTS}
                  placeholder="e.g. Computer Science, Mechanical"
                  icon={<BookOpen className="w-4 h-4" />}
                  helperText="Search or type custom"
                />

                <SearchableInput
                  label="Course / Branch / Degree"
                  value={editCourse}
                  onChange={setEditCourse}
                  options={POPULAR_BRANCHES_COURSES}
                  placeholder="e.g. B.Tech CSE, BCA, MBA"
                  icon={<GraduationCap className="w-4 h-4" />}
                  helperText="Search or type custom"
                />
              </div>

              {/* Year & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                    <option value={5}>Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile Number with Static +91 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden bg-white shadow-xs transition-all">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 border-r border-slate-300 text-slate-800 select-none text-xs font-bold shrink-0">
                    <span className="text-sm leading-none" role="img" aria-label="India flag">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setEditPhone(digits);
                    }}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full text-sm px-3 py-2.5 focus:outline-none bg-transparent font-medium text-slate-900 tracking-wide placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  10-digit mobile number (+91 prefix automatically applied)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal Dialog */}
      {activeReviewModal && (
        <ReviewModal
          tripId={activeReviewModal.tripId}
          toUserId={activeReviewModal.toUserId}
          recipientName={activeReviewModal.recipientName}
          role={activeReviewModal.role}
          college={activeReviewModal.college}
          onClose={() => setActiveReviewModal(null)}
          onSuccess={() => {
            if (user) loadReviews(user._id);
            setActiveReviewModal(null);
          }}
        />
      )}
    </div>
  );
};
