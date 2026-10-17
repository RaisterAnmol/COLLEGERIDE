import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { IRide, IRideRequest } from '../types';
import {
  Car,
  Search,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
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
  Compass,
  Mail,
  Zap,
  XCircle,
  Trash2,
} from 'lucide-react';
import { SearchableInput } from '../components/common/SearchableInput';
import { ReviewModal } from '../components/ReviewModal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { CustomSelect } from '../components/common/CustomSelect';
import { motion } from 'framer-motion';
import {
  POPULAR_COLLEGES,
  POPULAR_DEPARTMENTS,
  POPULAR_BRANCHES_COURSES,
} from '../data/academicData';
import { sanitizeLocationText } from '../utils/sanitizeLocation';
import { GoogleOnboardingModal } from '../components/auth/GoogleOnboardingModal';
import {
  ProfileSkeleton,
  ReviewCardSkeleton,
  RideTicketSkeleton,
  TableRowSkeleton,
} from '../components/common/Skeletons';

export const DashboardPage: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [myOfferedRides, setMyOfferedRides] = useState<IRide[]>([]);
  const [myRequests, setMyRequests] = useState<IRideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return Boolean(user && user.college === 'CampusRide Partner University');
  });

  useEffect(() => {
    if (user && user.college === 'CampusRide Partner University') {
      setIsOnboardingOpen(true);
    }
  }, [user?.college]);

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
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState('Parent/Guardian');
  const [editUpiId, setEditUpiId] = useState('');
  const [editAccountType, setEditAccountType] = useState<string>('PASSENGER');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // WhatsApp OTP Verification State
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpErrorMsg, setOtpErrorMsg] = useState<string | null>(null);

  const handleSendPhoneOtp = async () => {
    if (!editPhone || editPhone.trim().length < 10) {
      setOtpErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsSendingOtp(true);
    setOtpErrorMsg(null);
    setOtpSuccessMsg(null);
    try {
      const formatted = `+91 ${editPhone.trim()}`;
      const res: any = await api.sendPhoneOtp(formatted);
      setOtpSent(true);
      setOtpInput('');
      if (res?.devOtpHint) {
        setDevOtpHint(res.devOtpHint);
      } else {
        setDevOtpHint(null);
      }
      setOtpSuccessMsg(res.message || 'Verification code sent to your WhatsApp!');
    } catch (err: any) {
      setOtpErrorMsg(err?.message || 'Failed to dispatch WhatsApp OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!otpInput || otpInput.trim().length !== 6) {
      setOtpErrorMsg('Please enter the 6-digit OTP received on WhatsApp');
      return;
    }
    setIsVerifyingOtp(true);
    setOtpErrorMsg(null);
    try {
      await api.verifyPhoneOtp(otpInput.trim());
      setOtpSuccessMsg('Phone verified successfully via WhatsApp!');
      setOtpSent(false);
      setOtpInput('');
      if (refreshUser) await refreshUser();
    } catch (err: any) {
      setOtpErrorMsg(err?.message || 'Invalid or expired verification code');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const openEditModal = () => {
    if (user) {
      setEditCollege(user.college || '');
      setEditDepartment(user.department || '');
      setEditCourse(user.course || '');
      setEditYear(user.year || 1);
      setEditSemester(user.semester || 1);
      setEditAccountType(user.accountType || (user.role === 'driver' ? 'DRIVER' : 'PASSENGER'));
      const rawPhone = (user.phone || '').replace(/^\+91\s*/, '').replace(/\D/g, '').slice(0, 10);
      setEditPhone(rawPhone);
      const ec = user.emergencyContact || (user.emergencyContacts && user.emergencyContacts[0]);
      setEditEmergencyName(ec?.name || '');
      setEditEmergencyPhone((ec?.phone || '').replace(/^\+91\s*/, '').replace(/\D/g, '').slice(0, 10));
      setEditEmergencyRelation((ec as any)?.relation || (ec as any)?.relationship || 'Parent/Guardian');
      setEditUpiId((user as any)?.upiId || '');
      setProfileMsg(null);
      setOtpSent(false);
      setOtpInput('');
      setOtpSuccessMsg(null);
      setOtpErrorMsg(null);
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const formattedPhone = editPhone.trim() ? `+91 ${editPhone.trim()}` : '';
      const formattedEmergencyPhone = editEmergencyPhone.trim() ? `+91 ${editEmergencyPhone.trim()}` : '';
      const payload: any = {
        college: editCollege.trim(),
        department: editDepartment.trim(),
        course: editCourse.trim(),
        year: Number(editYear),
        semester: Number(editSemester),
        phone: formattedPhone,
        upiId: editUpiId.trim(),
        accountType: editAccountType,
      };

      if (editEmergencyPhone.trim()) {
        payload.emergencyContact = {
          name: editEmergencyName.trim() || 'Emergency Contact',
          phone: formattedEmergencyPhone,
          relation: editEmergencyRelation.trim() || 'Parent/Guardian',
        };
        payload.emergencyContacts = [payload.emergencyContact];
      }

      if (updateProfile) {
        await updateProfile(payload);
      } else {
        await api.updateProfile(payload);
      }
      setProfileMsg({ type: 'success', text: 'Profile & Emergency Contact updated successfully!' });
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
    setDashboardError(null);
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
        if (user?.verificationStatus !== 'verified') {
          setMyRequests([]);
          try {
            localStorage.removeItem("campusride_local_requests");
          } catch {}
        } else {
          setMyRequests(reqsRes.value || []);
        }
      }
      if (ridesRes.status === 'rejected' && reqsRes.status === 'rejected') {
        setDashboardError('Failed to load rides and requests. Please check your connection.');
      }
    } catch (err: any) {
      console.error('[Dashboard] Error loading rides/requests:', err);
      setDashboardError(err.message || 'Failed to load dashboard data');
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
  const [cancellingReqId, setCancellingReqId] = useState<string | null>(null);
  const [cancellingRideId, setCancellingRideId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleCancelPassengerRequest = async (e: React.MouseEvent, reqId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this seat request?")) return;
    try {
      setCancellingReqId(reqId);
      await api.updateRequestStatus(reqId, 'cancelled');
      try {
        const local = JSON.parse(localStorage.getItem("campusride_local_requests") || "[]");
        const filtered = local.filter((r: any) => r._id !== reqId && r.rideId?._id !== reqId);
        localStorage.setItem("campusride_local_requests", JSON.stringify(filtered));
      } catch {}
      setActionFeedback("Seat request successfully cancelled.");
      setTimeout(() => setActionFeedback(null), 4000);
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel request");
    } finally {
      setCancellingReqId(null);
    }
  };

  const handleCancelDriverRide = async (e: React.MouseEvent, rideId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this offered ride? All seat bookings will be notified.")) return;
    try {
      setCancellingRideId(rideId);
      await api.cancelRide(rideId);
      setActionFeedback("Offered ride cancelled successfully.");
      setTimeout(() => setActionFeedback(null), 4000);
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel ride");
    } finally {
      setCancellingRideId(null);
    }
  };

  const handleDriverUpdateRequest = async (e: React.MouseEvent, reqId: string, status: 'accepted' | 'declined') => {
    e.stopPropagation();
    try {
      await api.updateRequestStatus(reqId, status);
      setActionFeedback(status === 'accepted' ? "Passenger request accepted!" : "Passenger request declined/removed.");
      setTimeout(() => setActionFeedback(null), 4000);
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || `Failed to update request status to ${status}`);
    }
  };

  // Role & derived calculations
  const isDriver = (user as any)?.role === 'driver' || (user as any)?.accountType === 'DRIVER';
  const isPassenger = !isDriver;
  const isUserVerified = user?.verificationStatus === 'verified';
  const upcomingRequests = isUserVerified
    ? myRequests.filter((r) => r.status === 'pending' || r.status === 'accepted')
    : [];
  const previousRequests = isUserVerified
    ? myRequests.filter((r) => r.status === 'declined' || r.status === 'cancelled' || (r as any).status === 'completed')
    : [];

  // Derived review calculations
  const driverReviews = reviews.filter((r) => (r.role || '').toLowerCase() === 'driver');
  const passengerReviews = reviews.filter((r) => {
    const role = (r.role || '').toLowerCase();
    if (role === 'passenger') return true;
    if (!role) return isPassenger;
    return false;
  });
  const roleReviews = isPassenger ? passengerReviews : driverReviews;

  const userAvatar =
    user?.avatarURL ||
    (user as any)?.facePhoto ||
    (user?.email ? localStorage.getItem('campusride_user_avatar_' + user.email.toLowerCase().trim()) : null) ||
    localStorage.getItem('campusride_user_selfie') ||
    '';

  // Next upcoming ride for driver
  const nextOfferedRide = myOfferedRides.length > 0 ? myOfferedRides[0] : null;

  if (loading && !user) {
    return (
      <div className="min-h-screen text-[#1E2922] pb-16 relative font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#1E2922] pb-16 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {dashboardError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{dashboardError}</span>
            </div>
            <button
              onClick={() => loadDashboardData()}
              className="px-3 py-1 bg-rose-600 text-white font-medium rounded-lg text-xs hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Unverified Email Warning with Dev Quick Verify Bypass */}
        {user && !user.isEmailVerified && (
          <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-900">
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Your university email (<strong>{user.email}</strong>) is unverified.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/verify-email"
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold transition-colors"
              >
                Enter Token
              </Link>
              {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.devVerifyEmail(user.email, user._id);
                      if (refreshUser) refreshUser();
                    } catch (e: any) {
                      alert('Dev verify error: ' + (e.message || 'Failed'));
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Dev Quick Verify</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Institutional ID Verification Status Banner */}
        {user && user.verificationStatus !== 'verified' && (
          <div className="bg-amber-50 border border-amber-300 px-5 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="flex items-start sm:items-center gap-3 text-amber-950">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <span>Student ID Verification Under Review</span>
                  <span className="text-[10px] font-mono uppercase bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold whitespace-nowrap shrink-0 shadow-2xs">
                    {user.verificationStatus || 'Pending'}
                  </span>
                </p>
                <p className="text-amber-800 text-xs mt-0.5 max-w-2xl leading-relaxed">
                  {isDriver
                    ? 'Your driver license and vehicle documents are currently being processed by the Campus Safety Office. Once verified, you will be authorized to post rides.'
                    : 'Your institutional ID credentials have been submitted for campus security review. Once verified, carpool seat bookings will be unlocked.'}
                </p>
              </div>
            </div>
            <Link
              to="/verification"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Check Verification Status</span>
            </Link>
          </div>
        )}

        {/* Onboarding Setup Progress Card (Matches Image 2 design styled in Atlas UI) */}
        {user && (!user.isPhoneVerified || !user.emergencyContact?.phone) && (() => {
          const isEmailDone = Boolean(user.email);
          const isPhoneDone = Boolean(user.isPhoneVerified);
          const isEmergencyDone = Boolean(user.emergencyContact?.phone || (user.emergencyContacts && user.emergencyContacts.length > 0));
          const completedSteps = (isEmailDone ? 1 : 0) + (isPhoneDone ? 1 : 0) + (isEmergencyDone ? 1 : 0);
          const remainingSteps = 3 - completedSteps;

          return (
            <div className="bg-paper border border-[#E2DDD3] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden text-left space-y-4 animate-in fade-in duration-200">
              {/* Header with Circular Progress Ring */}
              <div className="flex items-center gap-3.5 pb-3 border-b border-[#E2DDD3]/70">
                <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                  <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#EAE5DA]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-600 transition-all duration-500 ease-out"
                      strokeDasharray={`${(completedSteps / 3) * 100}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute font-mono text-xs font-bold text-[#143D32]">
                    {completedSteps}/3
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold font-display text-[#143D32] tracking-tight">
                    Finish setup to book rides
                  </h3>
                  <p className="text-xs text-[#5C716A]">
                    {remainingSteps === 1 ? 'One step left' : `${remainingSteps} steps left`}
                  </p>
                </div>
              </div>

              {/* 3 Setup Steps Rows */}
              <div className="space-y-2.5">
                {/* Step 1: University Email */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F8F6F1] border border-[#E2DDD3]/70">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      <Check className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#143D32]">University email</div>
                      <div className="text-[11px] text-[#5C716A] font-mono truncate">{user.email || 'aditya.kumar@college.edu'}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono shrink-0">
                    Done
                  </span>
                </div>

                {/* Step 2: Verify Phone */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F8F6F1] border border-[#E2DDD3]/70">
                  <div className="flex items-center gap-3 min-w-0">
                    {isPhoneDone ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                        <Check className="w-4 h-4 text-emerald-700" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#EAE5DA] text-[#143D32] flex items-center justify-center shrink-0 font-bold text-xs font-mono">
                        2
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#143D32]">Verify phone</div>
                      <div className="text-[11px] text-[#5C716A] font-mono truncate">{user.phone || '+91 98765 43210'}</div>
                    </div>
                  </div>
                  {isPhoneDone ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono shrink-0">
                      Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="px-4 py-1.5 rounded-xl bg-[#143D32] hover:bg-[#0E2C24] text-white text-xs font-bold shadow-2xs transition-all active:translate-y-0.5 cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>Send OTP</span>
                    </button>
                  )}
                </div>

                {/* Step 3: Emergency Contact */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F8F6F1] border border-[#E2DDD3]/70">
                  <div className="flex items-center gap-3 min-w-0">
                    {isEmergencyDone ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                        <Check className="w-4 h-4 text-emerald-700" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#EAE5DA] text-[#143D32] flex items-center justify-center shrink-0 font-bold text-xs font-mono">
                        3
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#143D32]">Emergency contact</div>
                      <div className="text-[11px] text-[#5C716A] truncate">
                        {isEmergencyDone ? (user.emergencyContact?.phone || 'Configured for live SOS') : 'Gets your live location on SOS'}
                      </div>
                    </div>
                  </div>
                  {isEmergencyDone ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono shrink-0">
                      Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="px-4 py-1.5 rounded-xl border border-[#E2DDD3] bg-paper hover:bg-[#F5F2EB] text-[#143D32] text-xs font-bold shadow-2xs transition-all active:translate-y-0.5 cursor-pointer shrink-0"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* DRIVER DASHBOARD VIEW (Strictly Matches Image 2)              */}
        {/* ============================================================== */}
        {isDriver ? (
          <>
            {/* TOP ROW: Driver Welcome Card, Next Ride & Hero Cutout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column (lg:col-span-4): Greeting Card + Quick Actions */}
              <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
                
                {/* Driver Greeting Card */}
                <div className="bg-white rounded-card border border-slate-200/90 p-6 sm:p-7 shadow-xs relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    {/* Driver Avatar */}
                    <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-emerald-400 to-teal-600 shadow-sm shrink-0 overflow-hidden ring-2 ring-emerald-100">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={user?.name || 'Driver'}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      ) : (
                        <div className="w-full h-full rounded-[14px] bg-[#143D32] text-white font-black text-xl flex items-center justify-center uppercase">
                          {user?.name?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>

                    {/* Greeting & Identity */}
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Good Morning,
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
                        {user?.name ? `${user.name.split(' ')[0]}!` : 'Driver!'}
                      </h1>
                      <p className="text-xs text-emerald-800 font-semibold mt-0.5 flex items-center gap-1">
                        <span>Keep the campus moving</span>
                        <span>🌱</span>
                      </p>
                    </div>
                  </div>

                  {/* 3 Metric Chips */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center gap-1 font-black text-slate-900 text-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <AnimatedCounter value={user?.rating || 4.9} decimals={1} duration={1.0} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Rating</span>
                    </div>

                    <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center gap-1 font-black text-slate-900 text-xs">
                        <Car className="w-3 h-3 text-emerald-600" />
                        <AnimatedCounter value={myOfferedRides.length > 0 ? myOfferedRides.length : 15} duration={1.2} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Rides</span>
                    </div>

                    <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center gap-1 font-black text-emerald-700 text-xs">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <AnimatedCounter value={100} suffix="%" duration={0.9} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Verified</span>
                    </div>
                  </div>

                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions Toolbar */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block mb-2 px-1">
                    Quick Actions
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <a
                      href="#offered-rides"
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/60 transition-all flex flex-col items-center gap-1 text-[10px] font-bold"
                    >
                      <Car className="w-3.5 h-3.5 text-emerald-700" />
                      <span>View Rides</span>
                    </a>

                    <Link
                      to="/post"
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/60 transition-all flex flex-col items-center gap-1 text-[10px] font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Post a Ride</span>
                    </Link>

                    <Link
                      to="/safety"
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/60 transition-all flex flex-col items-center gap-1 text-[10px] font-bold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Safety</span>
                    </Link>

                    <Link
                      to="/colleges"
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/60 transition-all flex flex-col items-center gap-1 text-[10px] font-bold"
                    >
                      <Compass className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Campus Map</span>
                    </Link>
                  </div>
                </div>

              </div>

              {/* Center Column (lg:col-span-3): "Your Next Ride" Card */}
              <div className="lg:col-span-3 bg-white rounded-card border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Car className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Your Next Ride
                    </h3>
                  </div>

                  {nextOfferedRide ? (
                    <div
                      onClick={() => navigate(`/rides/${nextOfferedRide._id}`)}
                      className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 cursor-pointer hover:bg-emerald-50 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {sanitizeLocationText(nextOfferedRide.origin?.text) || 'UIT Building (UIT)'}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            → {sanitizeLocationText(nextOfferedRide.destination?.text) || 'Premnagar Chowk'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-700" />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-200/60 text-slate-600">
                        <span>
                          {nextOfferedRide.departureTime
                            ? new Date(nextOfferedRide.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '07:20 AM'}
                        </span>
                        <span>•</span>
                        <span>{nextOfferedRide.availableSeats || 3} seats left</span>
                        <span>•</span>
                        <span className="font-extrabold text-emerald-800">
                          ₹{(nextOfferedRide as any).pricing?.costPerSeat ?? (nextOfferedRide as any).pricePerSeat ?? 25}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <Car className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">UIT Building (UIT)</h4>
                      <p className="text-[11px] text-slate-500">
                        07:20 AM • 3 seats left • <strong className="text-emerald-700">₹25</strong>
                      </p>
                      <Link
                        to="/post"
                        className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-[10px] font-bold hover:bg-emerald-800 transition-colors shadow-xs"
                      >
                        Publish Today's Commute →
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Carpool schedule</span>
                  <Link to="/post" className="font-bold text-emerald-700 hover:underline">
                    Offer New Route →
                  </Link>
                </div>
              </div>

              {/* Right Column (lg:col-span-5): Campus Quad Photorealistic Commute with Signpost */}
              <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-[#E2DDD3] shadow-xs group">
                <img
                  src="/dashboard-students-real.jpg"
                  alt="Verified students commuting and carpooling together on university campus"
                  className="w-full h-full min-h-[240px] max-h-[290px] object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Chalkboard Signpost Graphic Overlay */}
                <div className="absolute bottom-4 right-4 z-20 max-w-[210px] bg-[#143D32]/95 backdrop-blur-xs border border-emerald-400/40 rounded-2xl p-3 text-white shadow-lg transform rotate-1 select-none">
                  <p className="text-[10px] font-mono tracking-wider uppercase text-emerald-200 font-bold mb-0.5">
                    COLLEGE TRANSIT
                  </p>
                  <p className="text-xs font-bold tracking-tight leading-snug">
                    Same Campus <br />
                    Same Goals <br />
                    <span className="text-emerald-300">Better Rides ☺</span>
                  </p>
                </div>
              </div>

            </div>

            {/* SUSTAINABILITY & DEPARTMENT LEADERBOARD ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Eco & Green Impact (lg:col-span-5) - Warm Paper Atlas Style */}
              <div className="lg:col-span-5 bg-paper rounded-card border border-[#E2DDD3] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold">
                      Campus Green Impact
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-[#143D32] tracking-tight">
                    Together for Cleaner Air 🌱
                  </h3>
                  <p className="text-xs text-[#5C716A] leading-relaxed">
                    By carpooling together, students from {user?.college || 'our campus'} are directly curbing campus traffic and Dehradun air pollution.
                  </p>
                </div>

                {/* 3 Green Metrics */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#E2DDD3] text-center">
                  <div className="p-2.5 rounded-xl bg-[#F8F6F1] border border-[#E2DDD3]">
                    <span className="text-lg font-black text-emerald-800 block">48.6 kg</span>
                    <span className="text-[10px] text-[#5C716A] font-semibold block mt-0.5">CO₂ Avoided</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8F6F1] border border-[#E2DDD3]">
                    <span className="text-lg font-black text-emerald-800 block">₹4,200</span>
                    <span className="text-[10px] text-[#5C716A] font-semibold block mt-0.5">Fuel Saved</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8F6F1] border border-[#E2DDD3]">
                    <span className="text-lg font-black text-emerald-800 block">16 Cars</span>
                    <span className="text-[10px] text-[#5C716A] font-semibold block mt-0.5">Off Roadways</span>
                  </div>
                </div>
              </div>

              {/* Right: Department Carpool Leaderboard (lg:col-span-7) with Staggered Entrance & Animated Bars */}
              <div className="lg:col-span-7 bg-paper rounded-card border border-[#E2DDD3] p-6 sm:p-7 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2DDD3]/70">
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.15 }}
                      transition={{ duration: 0.5 }}
                      className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shadow-2xs cursor-default select-none"
                    >
                      🏆
                    </motion.div>
                    <div>
                      <h3 className="text-xs font-bold text-[#143D32] uppercase tracking-wide">
                        Department Carpool Leaderboard
                      </h3>
                      <p className="text-[10px] text-[#5C716A]">Weekly Top Green Commute Batches</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F8F6F1] border border-[#E2DDD3] text-[#5C716A] rounded-full font-bold whitespace-nowrap shrink-0">
                    This Week
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    { rank: '🥇', dept: 'Computer Science & Engineering (UIT)', rides: 184, percent: 92 },
                    { rank: '🥈', dept: 'Management Studies (UIM / BBA)', rides: 136, percent: 68 },
                    { rank: '🥉', dept: 'Civil & Mechanical Engineering', rides: 112, percent: 56 },
                    { rank: '4', dept: 'Law College Dehradun (LCD)', rides: 88, percent: 44 },
                  ].map((entry, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.08 * idx, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ x: 3 }}
                      className="space-y-1.5 p-1 rounded-xl transition-all"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="font-mono text-xs w-4 shrink-0">{entry.rank}</span>
                          <span className="truncate text-[#143D32] font-bold">{entry.dept}</span>
                        </span>
                        <span className="font-mono text-emerald-800 text-xs shrink-0 font-bold">
                          <AnimatedCounter value={entry.rides} suffix=" rides" duration={1.1} />
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#EAE5DA]/70 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${entry.percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.12 + 0.08 * idx }}
                          className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION: Campus Peer Reviews & Trust [Mutual Ratings] (Matches Image 2) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900 tracking-tight">
                        Campus Peer Reviews & Trust
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold whitespace-nowrap shrink-0">
                        Mutual Ratings
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Verified feedback from student drivers and passengers across Uttarakhand universities
                    </p>
                  </div>
                </div>

                <div className="text-[11px] font-mono font-bold text-emerald-800 select-none hidden sm:block whitespace-nowrap">
                  Real Students • Real Reviews • True Safety ♡
                </div>
              </div>

              {/* 3-Column Reviews Showcase Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                
                {/* Left: Big Rating Box (md:col-span-3) */}
                <div className="md:col-span-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-slate-900">
                    <span>{user?.rating?.toFixed(1) || '4.9'}</span>
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Based on verified campus commutes
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-200">
                    ✓ 100% University Verified
                  </span>
                </div>

                {/* Center: Reviews Banner Real Photography */}
                <div className="md:col-span-5 relative h-28 rounded-2xl overflow-hidden border border-[#E2DDD3] shadow-xs">
                  <img
                    src="/carpool-commute.jpg"
                    alt="University students carpooling and commuting together on campus"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-3 text-white text-[11px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="ml-1 text-[10px] text-emerald-200 font-medium">Peer Endorsed • Verified Commutes</span>
                  </div>
                </div>

                {/* Right: Badges & Commendations (md:col-span-4) */}
                <div className="md:col-span-4 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                    TOP PEER BADGES & COMMENDATIONS
                  </span>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Badges appear automatically as drivers and passengers exchange compliments upon ride completion.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold whitespace-nowrap shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Safe Driver
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold whitespace-nowrap shrink-0">
                      <Heart className="w-3 h-3 text-blue-600" />
                      Friendly
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold whitespace-nowrap shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      Top Rated
                    </span>
                  </div>
                </div>

              </div>

              {/* Reviews List or Clean Empty State (Matches Image 2) */}
              <div className="pt-2">
                {reviewsLoading ? (
                  <ReviewCardSkeleton count={2} />
                ) : reviews.length === 0 ? (
                  <div className="py-6 px-4 rounded-2xl bg-slate-50/80 border border-dashed border-slate-200 text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-sm">
                      👥
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">No reviews yet</h3>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                      Completed Commutes automatically unlock mutual reviews. Both the driver and passengers rate each other to ensure a safe, high-trust campus carpool community.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reviews.slice(0, 4).map((r, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{r.fromUserId?.name || 'Classmate'}</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(r.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="text-[11px] text-slate-600 italic">"{r.comment}"</p>}
                        {Array.isArray(r.tags) && r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 text-[9px] text-emerald-800 font-semibold">
                            {r.tags.map((t: string, i: number) => (
                              <span key={i} className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* LOWER SECTION: Two Columns (Your Offered Rides + Incoming Bookings) (Matches Image 2) */}
            <div id="offered-rides" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column (lg:col-span-6): Your Offered Rides */}
              <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        🚗
                      </div>
                      <h2 className="text-sm font-bold text-slate-900">Your Offered Rides</h2>
                    </div>
                    <Link to="/post" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline">
                      + Post New Ride
                    </Link>
                  </div>

                  {loading ? (
                    <RideTicketSkeleton count={2} />
                  ) : myOfferedRides.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <Car className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">No active commute rides posted</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Share empty seats on your daily university route to split fuel costs and commute together.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myOfferedRides.map((ride) => (
                        <div
                          key={ride._id}
                          onClick={() => navigate(`/rides/${ride._id}`)}
                          className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-white transition-all cursor-pointer shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 truncate">
                                <span className="truncate">{sanitizeLocationText(ride.origin?.text) || 'Campus'}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{sanitizeLocationText(ride.destination?.text) || 'City'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span>{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <span>{ride.availableSeats} seats left</span>
                                <span>•</span>
                                <span className="font-bold text-emerald-700">
                                  ₹{(ride as any).pricing?.costPerSeat ?? (ride as any).pricePerSeat ?? 25}
                                </span>
                                {ride.status === 'cancelled' && (
                                  <>
                                    <span>•</span>
                                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase text-[9px]">
                                      Cancelled
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                                <button
                                  type="button"
                                  disabled={cancellingRideId === ride._id}
                                  onClick={(e) => handleCancelDriverRide(e, ride._id)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Cancel this offered ride"
                                >
                                  {cancellingRideId === ride._id ? 'Cancelling...' : 'Cancel Ride'}
                                </button>
                              )}
                              <span className="text-xs font-bold text-slate-400 hover:text-emerald-700">
                                Details →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    to="/post"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#143D32] hover:bg-[#0d2820] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Car className="w-4 h-4" />
                    <span>Offer a Ride</span>
                  </Link>
                </div>
              </div>

              {/* Right Column (lg:col-span-6): Incoming Seat Bookings */}
              <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        🎒
                      </div>
                      <h2 className="text-sm font-bold text-slate-900">Incoming Seat Bookings</h2>
                    </div>
                    <Link to="/search" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline">
                      Browse Matches →
                    </Link>
                  </div>

                  {loading ? (
                    <TableRowSkeleton rows={3} />
                  ) : myRequests.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-700">No active bookings yet</h3>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
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
                            className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-white transition-all cursor-pointer shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 truncate">
                                  <span className="truncate">{sanitizeLocationText(ride?.origin?.text) || 'Origin'}</span>
                                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{sanitizeLocationText(ride?.destination?.text) || 'Destination'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                  <span>Rider: {(req as any).passengerName || 'Classmate'}</span>
                                  <span>•</span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {req.status}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {req.status === 'pending' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDriverUpdateRequest(e, req._id, 'accepted')}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                                      title="Accept passenger & reserve seat"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDriverUpdateRequest(e, req._id, 'declined')}
                                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                      title="Decline request"
                                    >
                                      Decline
                                    </button>
                                  </>
                                ) : req.status === 'accepted' ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => handleDriverUpdateRequest(e, req._id, 'declined')}
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                      title="Remove Passenger / Mark No-show"
                                    >
                                      Remove
                                    </button>
                                    <span className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs">
                                      Trip Ready →
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs font-bold text-slate-400 hover:text-blue-600">
                                    Details →
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    to="/search"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Search className="w-4 h-4 text-emerald-700" />
                    <span>Search Campus Corridors</span>
                  </Link>
                </div>
              </div>

            </div>
          </>
        ) : (
          /* ============================================================== */
          /* PASSENGER COMMUTE HUB VIEW                                     */
          /* ============================================================== */
          <div className="space-y-6">
            
            {/* Passenger Profile Strip */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-400 to-indigo-600 shadow-sm shrink-0 overflow-hidden ring-2 ring-blue-100">
                  {userAvatar ? (
                    <img src={userAvatar} alt={user?.name || 'Passenger'} className="w-full h-full object-cover rounded-[14px]" />
                  ) : (
                    <div className="w-full h-full rounded-[14px] bg-[#143D32] text-white font-black text-xl flex items-center justify-center uppercase">
                      {user?.name?.charAt(0) || 'P'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {user?.name}
                    </h1>
                    {user?.verificationStatus === 'verified' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified {isDriver ? 'Driver' : 'Passenger'}
                      </span>
                    ) : user?.verificationStatus === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Verification Pending
                      </span>
                    ) : user?.verificationStatus === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 whitespace-nowrap shrink-0">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Verification Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 whitespace-nowrap shrink-0">
                        <AlertCircle className="w-3 h-3 text-slate-500" />
                        Unverified Student
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {user?.college || 'University'} • {user?.department || user?.course || 'Student'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>Rating: <strong className="text-slate-800 font-bold">★ <AnimatedCounter value={user?.rating || 5.0} decimals={1} duration={1.0} /></strong></span>
                    <span>•</span>
                    <span>Shared Commutes: <strong className="text-slate-800 font-bold"><AnimatedCounter value={myRequests.length} duration={1.1} /></strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openEditModal}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
                <Link
                  to="/search"
                  className="px-5 py-2.5 bg-[#143D32] hover:bg-[#0d2820] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Find a Ride</span>
                </Link>
              </div>
            </div>

            {/* Passenger Bookings Container */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg">
                    🎒
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-tight">Your Campus Commutes & Bookings</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Track upcoming ride bookings, view driver arrival, and review your previous university carpools
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPassengerCommuteTab('upcoming')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      passengerCommuteTab === 'upcoming' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upcoming ({upcomingRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassengerCommuteTab('previous')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      passengerCommuteTab === 'previous' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Previous ({previousRequests.length})
                  </button>
                </div>
              </div>

              {/* Bookings List */}
              {loading ? (
                <RideTicketSkeleton count={2} />
              ) : !isUserVerified ? (
                <div className="py-10 text-center border-2 border-dashed border-amber-200/80 rounded-2xl p-8 bg-amber-50/40 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Commutes Locked — Student ID Verification Pending</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your institutional student profile is currently undergoing verification. Once verified by campus administration, you'll be able to reserve seats, view upcoming commutes, and coordinate with verified drivers.
                  </p>
                  <Link
                    to="/verification"
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Check Verification Status</span>
                  </Link>
                </div>
              ) : passengerCommuteTab === 'upcoming' ? (
                upcomingRequests.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50 space-y-2">
                    <Search className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">No active bookings or upcoming rides</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Search campus routes to get matched with verified student drivers commuting to your college.
                    </p>
                    <Link
                      to="/search"
                      className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143D32] hover:bg-[#0d2820] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Search className="w-4 h-4" />
                      <span>Explore Available Rides</span>
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
                          className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white transition-all cursor-pointer shadow-xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
                                ROUTE ITINERARY
                              </span>
                              <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 mt-0.5">
                                <span>{sanitizeLocationText(ride?.origin?.text) || 'Origin'}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                <span>{sanitizeLocationText(ride?.destination?.text) || 'Destination'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {isAccepted ? 'Confirmed' : 'Pending'}
                              </span>
                              <button
                                type="button"
                                disabled={cancellingReqId === req._id}
                                onClick={(e) => handleCancelPassengerRequest(e, req._id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                                title="Cancel this seat reservation"
                              >
                                {cancellingReqId === req._id ? 'Cancelling...' : 'Cancel Request'}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                            <div>
                              <span className="text-[9px] text-slate-400 block">DRIVER</span>
                              <span className="font-bold text-slate-800">{ride?.creator?.name || 'Classmate'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">DEPARTURE</span>
                              <span className="font-bold text-slate-800">
                                {ride?.departureTime
                                  ? new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : 'Scheduled'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">FARE</span>
                              <span className="font-black text-emerald-700">
                                ₹{(ride as any)?.pricing?.costPerSeat ?? (ride as any)?.pricePerSeat ?? 25}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">No previous ride history.</div>
              )}
            </div>

            {/* Passenger Reviews & Mutual Trust Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Your Commute Feedback</h3>
                  <p className="text-xs text-slate-500">Peer reviews received from student drivers</p>
                </div>
              </div>

              {reviewsLoading ? (
                <ReviewCardSkeleton count={2} />
              ) : reviews.length === 0 ? (
                <p className="text-xs text-slate-400">No reviews received yet. Reviews unlock after completed rides.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {reviews.map((r, i) => (
                    <div key={i} className="h-full p-6 sm:p-7 rounded-2xl bg-[#F8F6F1] border border-[#E2DDD3] text-xs space-y-3.5 flex flex-col justify-between shadow-2xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-sm text-[#143D32]">{r.fromUserId?.name || 'Student Driver'}</span>
                        <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-mono text-xs whitespace-nowrap shrink-0">
                          ★ {r.rating}
                        </span>
                      </div>
                      {r.comment && <p className="text-[#5C716A] italic leading-relaxed">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <School className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Edit Academic Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
                {profileMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {profileMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{profileMsg.text}</span>
                  </div>
                )}
              {/* Role / Account Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Campus Mobility Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAccountType('PASSENGER')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      editAccountType === 'PASSENGER' || editAccountType === 'WOMEN_PASSENGER'
                        ? 'border-[#143D32] bg-emerald-50 text-[#143D32] font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Passenger</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Find and book campus rides</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditAccountType('DRIVER')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      editAccountType === 'DRIVER'
                        ? 'border-[#143D32] bg-emerald-50 text-[#143D32] font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Driver</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Offer rides & share fuel</div>
                  </button>
                </div>
              </div>

              <div>
                <SearchableInput
                  label="University / College"
                  value={editCollege}
                  onChange={setEditCollege}
                  options={POPULAR_COLLEGES}
                  placeholder="Select or enter your university"
                  required
                />
              </div>

              <div>
                <SearchableInput
                  label="Department / School"
                  value={editDepartment}
                  onChange={setEditDepartment}
                  options={POPULAR_DEPARTMENTS}
                  placeholder="e.g. UIT (Uttaranchal Institute of Technology)"
                  required
                />
              </div>

              <div>
                <SearchableInput
                  label="Course / Program"
                  value={editCourse}
                  onChange={setEditCourse}
                  options={POPULAR_BRANCHES_COURSES}
                  placeholder="e.g. B.Tech Computer Science"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <CustomSelect
                    value={editYear}
                    onChange={(val) => setEditYear(Number(val))}
                    options={[1, 2, 3, 4, 5].map((y) => ({ value: y, label: `Year ${y}` }))}
                    placeholder="Select Year"
                    ariaLabel="Academic Year"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <CustomSelect
                    value={editSemester}
                    onChange={(val) => setEditSemester(Number(val))}
                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => ({ value: s, label: `Semester ${s}` }))}
                    placeholder="Select Semester"
                    ariaLabel="Semester"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mobile Number
                  </label>
                  {user?.isPhoneVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified on WhatsApp
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Unverified
                    </span>
                  )}
                </div>
                <div className="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden bg-white shadow-xs">
                  <div className="px-3 py-2 bg-slate-100 border-r border-slate-300 text-slate-800 text-xs font-bold shrink-0">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setEditPhone(digits);
                    }}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full text-xs px-3 py-2 focus:outline-none bg-transparent font-medium text-slate-900"
                  />
                </div>

                {/* WhatsApp OTP Action Area */}
                {!user?.isPhoneVerified && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    {!otpSent ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-600">
                          Receive verification code directly on your WhatsApp:
                        </span>
                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={isSendingOtp || editPhone.length < 10}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-[#143D32] hover:bg-[#0d2820] text-white text-[11px] font-bold transition-all disabled:opacity-50 flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span>{isSendingOtp ? 'Sending...' : 'Send WhatsApp OTP'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-800">
                            Enter the 6-digit code sent to WhatsApp:
                          </span>
                          <button
                            type="button"
                            onClick={handleSendPhoneOtp}
                            disabled={isSendingOtp}
                            className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Resend Code
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold tracking-widest text-center"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyPhoneOtp}
                            disabled={isVerifyingOtp || otpInput.length !== 6}
                            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>

                        {devOtpHint && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                            <span>
                              💡 <strong>Setup Mode Code:</strong> <strong className="font-mono text-sm tracking-widest bg-amber-200/80 px-2 py-0.5 rounded text-amber-950">{devOtpHint}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => setOtpInput(devOtpHint)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                            >
                              Auto-Fill
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {otpSuccessMsg && (
                      <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{otpSuccessMsg}</span>
                      </div>
                    )}
                    {otpErrorMsg && (
                      <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{otpErrorMsg}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Emergency Contact Setup Section (Prominently placed directly after Mobile Number) */}
              <div className="p-4 rounded-2xl bg-rose-50/80 border-2 border-rose-200 space-y-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                    🚨
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                      <span>24/7 SOS Emergency Contact</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-900 font-bold">Recommended</span>
                    </h4>
                    <p className="text-[11px] text-rose-800/90 leading-tight mt-0.5">
                      When you trigger Emergency SOS, live Google Maps coordinates and SOS alerts will be automatically dispatched to this WhatsApp contact.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={editEmergencyName}
                      onChange={(e) => setEditEmergencyName(e.target.value)}
                      placeholder="e.g. Dad / Mom / Guardian"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relationship
                    </label>
                    <CustomSelect
                      value={editEmergencyRelation}
                      onChange={(val) => setEditEmergencyRelation(String(val))}
                      options={[
                        { value: 'Parent/Guardian', label: 'Parent / Guardian' },
                        { value: 'Sibling', label: 'Brother / Sister' },
                        { value: 'Campus Friend', label: 'Campus Friend / Roommate' },
                        { value: 'Relative', label: 'Relative' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      placeholder="Select Relationship"
                      ariaLabel="Emergency Contact Relationship"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Emergency Contact Mobile Number
                  </label>
                  <div className="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-rose-500 overflow-hidden bg-white shadow-2xs">
                    <div className="inline-flex items-center gap-1 px-3.5 py-2.5 bg-slate-100 border-r border-slate-300 text-slate-800 text-xs font-bold shrink-0">
                      <span className="text-sm leading-none" role="img" aria-label="India flag">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={editEmergencyPhone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setEditEmergencyPhone(digits);
                      }}
                      placeholder="98765 43210"
                      maxLength={10}
                      className="w-full text-xs px-3 py-2.5 focus:outline-none bg-transparent font-medium text-slate-900"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter 10-digit phone (+91 added automatically).
                  </p>
                </div>
              </div>

              {/* Direct UPI Fare ID Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI ID for Direct Fare Settlement (Optional)
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden bg-white shadow-xs">
                  <div className="px-3 py-2 bg-slate-100 border-r border-slate-300 text-slate-700 text-xs font-bold shrink-0">
                    UPI
                  </div>
                  <input
                    type="text"
                    value={editUpiId}
                    onChange={(e) => setEditUpiId(e.target.value)}
                    placeholder="e.g. driver@oksbi or 9876543210@paytm"
                    className="w-full text-xs px-3 py-2 focus:outline-none bg-transparent font-medium text-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Enables passengers to pay you directly via Google Pay, PhonePe, or Paytm with ₹0 platform deductions.
                </p>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3 shrink-0 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2 rounded-xl bg-[#143D32] hover:bg-[#0d2820] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )}

      {/* Review Modal Dialog */}
      {activeReviewModal && typeof document !== 'undefined' && createPortal(
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
        />,
        document.body
      )}

      {/* Google Onboarding Modal for First-Time Google Users */}
      <GoogleOnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};
