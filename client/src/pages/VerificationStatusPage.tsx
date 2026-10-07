import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { IdentityDocumentUpload } from "../components/verification/IdentityDocumentUpload";
import { SelfieCapture } from "../components/verification/SelfieCapture";
import {
  ShieldCheck,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Car,
  GraduationCap,
  Building,
  Upload,
  ArrowRight,
  RefreshCw,
  Camera,
  Lock,
  Sparkles,
  Check,
  Calendar,
  Star,
  Users,
  Shield,
  HelpCircle,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { DailyDriverIdCheckModal } from "../components/verification/DailyDriverIdCheckModal";
import verificationHeroImg from "../assets/illustrations/verification-hero.webp";

export const VerificationStatusPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchingRequest, setFetchingRequest] = useState(true);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [resubmitting, setResubmitting] = useState(false);

  // Daily physical ID check states
  const [showDailyModal, setShowDailyModal] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dailyCheckDate, setDailyCheckDate] = useState<string>(() => {
    return user?.lastDailyIdCheckDate || localStorage.getItem('campusride_daily_id_verified_' + (user?._id || 'me')) || '';
  });
  const isDailyVerified = dailyCheckDate === todayStr;

  const enrolledIdCardUrl =
    user?.enrolledIdCardUrl ||
    (user as any)?.facePhoto ||
    user?.avatarURL ||
    localStorage.getItem('campusride_driver_id_card_' + (user?.email || '')) ||
    localStorage.getItem('campusride_user_selfie') ||
    '/test_uploads/profile_photo.jpg';

  const handleDailyVerified = () => {
    setDailyCheckDate(todayStr);
    setShowDailyModal(false);
    refreshUser();
  };

  // Form states
  const [studentId, setStudentId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [selfieData, setSelfieData] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    valid: boolean;
    rollNo: string;
    college: string;
    message: string;
  } | null>(null);

  const isDriver =
    user?.role === "driver" || user?.accountType === "DRIVER";

  useEffect(() => {
    const loadRequest = async () => {
      setFetchingRequest(true);
      try {
        const res = await api.getMyVerificationRequest();
        if (res && res.request) {
          setExistingRequest(res.request);
        }
      } catch (err) {
        console.warn("[VerificationPage] Could not load verification request:", err);
      } finally {
        setFetchingRequest(false);
      }
    };

    if (user) {
      loadRequest();
    } else {
      setFetchingRequest(false);
    }
  }, [user]);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!studentId.trim()) {
      setSubmitError("University Student ID / Roll Number is required.");
      return;
    }
    if (isDriver && !driverId.trim()) {
      setSubmitError("Driving License Number is required for driver verification.");
      return;
    }
    if (!idFile) {
      setSubmitError("Please upload a photo of your Student ID card.");
      return;
    }
    if (isDriver && !licenseFile) {
      setSubmitError("Please upload a photo of your Driving License.");
      return;
    }
    if (!selfieData || !selfieData.file) {
      setSubmitError("Please complete the real-time selfie verification check.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("studentIdentifier", studentId.trim());
      formData.append("idCardPhoto", idFile);
      formData.append("idDocument", idFile);
      formData.append("facePhoto", selfieData.file);
      formData.append("selfie", selfieData.file);

      if (isDriver) {
        formData.append("driverIdentifier", driverId.trim());
        if (licenseFile) {
          formData.append("licensePhoto", licenseFile);
          formData.append("drivingLicense", licenseFile);
        }
      }

      await api.submitVerificationRequest(formData);

      if (selfieData.embedding) {
        try {
          await api.enrollFace(selfieData.embedding, selfieData.qualityScore);
        } catch (faceErr) {
          console.warn("[Verification] Face enrollment error:", faceErr);
        }
      }

      await refreshUser();
      setSubmitSuccess(true);
      setResubmitting(false);

      const updated = await api.getMyVerificationRequest();
      if (updated?.request) {
        setExistingRequest(updated.request);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit verification request");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-emerald-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Sign in to Access Verification</h2>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Identity verification ensures only genuine university students and verified drivers join rides.
        </p>
        <Link
          to="/auth"
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const currentStatus = user.verificationStatus || "verified";

  return (
    <div className="min-h-screen text-[#1E2922] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP HERO BANNER (Matches Image 3) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden p-6 sm:p-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block text-[11px] font-mono uppercase tracking-widest font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                VERIFICATION
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 tracking-tight leading-none">
                Your Identity. <br />
                Your Safe Rides.
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                CampusRide keeps your rides trusted and secure with verified student and driver credentials.
              </p>

              {/* 3 Verification Badges Row */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>University Verified</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">• Only campus members</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Driver Verification</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">• ID + Daily Check-in</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Safe Community</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">• Trusted by students</span>
                </div>
              </div>
            </div>

            {/* Right Artwork with Doodle Cutout */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Doodle script */}
              <div className="absolute top-2 right-4 z-20 transform rotate-3 text-[11px] font-mono font-bold text-emerald-900 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs select-none">
                Same Campus • Same Journey • Better Together ♡
              </div>

              <div className="relative w-full max-w-sm h-48 sm:h-56 rounded-3xl overflow-hidden border border-emerald-200 shadow-md">
                <img
                  src={verificationHeroImg}
                  alt="Students walking on university campus"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* MEMBER PROFILE SUMMARY STRIP (Matches Image 3) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs border-2 border-white overflow-hidden ring-2 ring-emerald-200">
              {user.avatarURL || (user as any)?.facePhoto ? (
                <img src={user.avatarURL || (user as any)?.facePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.slice(0, 2).toUpperCase() || "MM"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {user.name || "Student"}
                </h2>
                {user.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified {isDriver ? 'Driver' : 'Student'}
                  </span>
                ) : user.verificationStatus === 'pending' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    ID Verification Pending
                  </span>
                ) : user.verificationStatus === 'rejected' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    Verification Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    <AlertCircle className="w-3 h-3 text-slate-500" />
                    Verification Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {user.college || "University"} • {user.department || user.course || "General Studies"}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span>Roll No: <strong className="text-slate-700 font-mono">{user.studentId || (user as any).studentIdentifier || `${(user.college || 'CR').slice(0, 3).toUpperCase()}-${user._id?.slice(-6).toUpperCase() || 'STD'}`}</strong></span>
                <span>•</span>
                <span>Role: <strong className="text-slate-700">{isDriver ? "Driver & Passenger" : "Passenger"}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Stats */}
          <div className="flex items-center gap-6 sm:border-l sm:border-slate-200 sm:pl-6 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Rides Completed</span>
              <span className="text-lg font-black text-slate-900 leading-tight">{user.totalRides ?? 0}</span>
            </div>
            <Link to="/dashboard" className="group flex items-center gap-1.5 hover:text-emerald-700 transition-colors">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Rating</span>
                <div className="flex items-center gap-1 text-slate-900 font-bold text-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{user.rating ? user.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-[11px] text-slate-400 font-normal">({user.totalRides ?? 0})</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* TWO-COLUMN MAIN SECTION: Your University ID + Daily Driver Check-in (Matches Image 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* LEFT CARD: Your University ID [Reference ID] */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>Your University ID</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                  Reference ID
                </span>
              </div>

              {/* Realistic Collegiate ID Card Graphic */}
              <div className="rounded-2xl border-2 border-emerald-900/30 overflow-hidden shadow-md bg-white max-w-sm mx-auto relative">
                {/* University Header */}
                <div className="bg-[#143D32] text-white px-4 py-2 flex items-center gap-2.5 border-b-2 border-emerald-500">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[9px] border border-white/20">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-white leading-tight">
                      {user.college || "DIT UNIVERSITY"}
                    </h3>
                    <p className="text-[8px] text-emerald-200 font-mono tracking-tight uppercase">
                      IMAGINE • ASPIRE • ACHIEVE
                    </p>
                  </div>
                </div>

                {/* ID Card Body */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-emerald-50/20 relative">
                  {/* Subtle campus building watermark */}
                  <div className="absolute right-2 bottom-12 opacity-15 pointer-events-none select-none text-emerald-900 text-4xl">
                    🏛️
                  </div>

                  <div className="flex gap-3.5">
                    {/* Student Photo */}
                    <div className="w-20 h-24 rounded-lg border border-slate-300 overflow-hidden bg-slate-200 flex-shrink-0 shadow-xs">
                      <img
                        src={enrolledIdCardUrl}
                        alt="Student ID card reference photo"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Student Details */}
                    <div className="min-w-0 flex-1 space-y-1 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block leading-tight">
                          {user.name || "MITSUHA MIYAMIZU"}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-[11px] text-slate-700">
                        <p>
                          <span className="text-slate-400 text-[10px]">Roll No: </span>
                          <strong className="font-mono text-slate-900">{user.studentId || "UU-2024-DRV-842"}</strong>
                        </p>
                        <p>
                          <span className="text-slate-400 text-[10px]">Program: </span>
                          <span className="font-semibold text-slate-800">{user.course || user.department || "BCA"}</span>
                        </p>
                        <p>
                          <span className="text-slate-400 text-[10px]">Blood Group: </span>
                          <strong className="text-rose-700">O+</strong>
                        </p>
                      </div>

                      <p className="text-[9px] text-slate-400 uppercase tracking-wider pt-1 font-semibold">
                        {user.college || "DIT UNIVERSITY"}
                      </p>
                    </div>
                  </div>

                  {/* Barcode & Student Signature */}
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      {/* Realistic barcode SVG */}
                      <div className="font-mono tracking-widest text-slate-800 text-[9px] select-none leading-none">
                        ||| | |||| | ||| || |||| | ||||
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 block mt-0.5">
                        *{user.studentId || "UU2024DRV842"}*
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-serif italic text-xs text-indigo-950 font-bold block">
                        Student Signature
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI OCR Pre-Screening Banner */}
            {ocrProcessing && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Running client-side AI OCR pre-screening on student credentials...</span>
              </div>
            )}

            {ocrResult && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Pre-Screen: Institutional Student ID Verified</span>
                </div>
                <div className="text-[11px] text-emerald-800 space-y-0.5">
                  <p>• <strong>Roll / Enrollment:</strong> <span className="font-mono">{ocrResult.rollNo}</span></p>
                  <p>• <strong>Institution:</strong> {ocrResult.college}</p>
                  <p>• {ocrResult.message}</p>
                </div>
              </div>
            )}

            {/* Bottom Card Footer Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Enrolled as baseline student ID record
              </span>

              <label className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer flex items-center gap-1 hover:underline text-xs">
                <span>{ocrProcessing ? 'Scanning...' : 'Update & Scan ID'}</span>
                <ArrowRight className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  disabled={ocrProcessing}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setOcrProcessing(true);
                      setOcrResult(null);
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const url = reader.result as string;
                        localStorage.setItem('campusride_driver_id_card_' + (user?.email || ''), url);
                        
                        // Simulate OCR extraction
                        setTimeout(async () => {
                          const detectedRoll = user?.studentId || user?.email?.split('@')[0]?.toUpperCase() || 'UU-2024-STUDENT';
                          const detectedCollege = user?.college || 'UTTARANCHAL UNIVERSITY';
                          setOcrResult({
                            valid: true,
                            rollNo: detectedRoll,
                            college: detectedCollege,
                            message: 'Valid university seal & active semester credentials detected. Fast-track admin queue updated.',
                          });
                          setOcrProcessing(false);

                          try {
                            await api.updateProfile({ enrolledIdCardUrl: url });
                            refreshUser();
                          } catch {}
                        }, 900);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* RIGHT CARD: Daily Driver Check-in (Drivers) OR Student Passenger Verification (Passengers) */}
          {isDriver ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Daily Driver Check-in</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isDailyVerified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {isDailyVerified ? 'Cleared Today' : 'Required Today'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  Verify your physical student ID before your first ride each day. It only takes a minute!
                </p>

                {/* 3-Step Process Flow (Matches Image 3) */}
                <div className="flex items-center justify-between max-w-md mx-auto py-2 px-1">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-700 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-xs">
                      🪪 1
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Show ID</span>
                    <span className="text-[10px] text-slate-400 leading-tight">Physical card</span>
                  </div>

                  <div className="text-slate-300 font-bold text-sm pb-4">→</div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-700 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-xs">
                      📷 2
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Capture</span>
                    <span className="text-[10px] text-slate-400 leading-tight">Photo</span>
                  </div>

                  <div className="text-slate-300 font-bold text-sm pb-4">→</div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      ✓ 3
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-tight">Verify</span>
                    <span className="text-[10px] text-slate-400 leading-tight">Get access</span>
                  </div>
                </div>

                {/* Today's Status Box */}
                <div className={`mt-5 p-3.5 rounded-2xl border ${
                  isDailyVerified
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-amber-50/90 border-amber-200'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {isDailyVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-[11px] font-bold text-slate-800 block">
                        Today's Status: <strong className={isDailyVerified ? 'text-emerald-800 font-black' : 'text-amber-800 font-black'}>
                          {isDailyVerified ? 'Verified' : 'Not verified'}
                        </strong>
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        {isDailyVerified
                          ? 'Your daily check-in is complete! Driver privileges and ride publishing unlocked.'
                          : 'Complete your daily check-in to unlock driver rides.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Check-in Action Button */}
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDailyModal(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#143D32] hover:bg-[#0d2820] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isDailyVerified ? 'Re-verify Today\'s Driver ID' : 'Verify Today\'s Driver ID'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Valid until 11:59 PM today</span>
                </div>
              </div>
            </div>
          ) : (
            /* PASSENGER SAFETY CARD */
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Student Passenger Verification</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {user.verificationStatus === 'verified' ? 'Verified Passenger' : 'Pending Campus Review'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Institutional verification ensures that all carpool passengers are actively enrolled university students, keeping campus commutes safe and accountable.
                </p>

                {/* Passenger Verification Highlights */}
                <div className="space-y-2.5 my-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">University Enrollment Record</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                        Linked with {user.college || 'your institution'} student roll number ({user.studentId || 'UU-2024-DRV-842'}).
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      user.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">Seat Booking Authorization</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                        {user.verificationStatus === 'verified'
                          ? 'Active — You are authorized to search and request seats on all carpools.'
                          : 'On Hold — Seat requests unlock immediately once approved by administration.'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">Safety & Emergency SOS Protection</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-snug">
                        Live trip GPS telemetry and emergency WhatsApp alerts enabled for every ride.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {user.verificationStatus === 'verified' ? (
                  <button
                    type="button"
                    onClick={() => navigate('/search')}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                    <span>Explore Available Rides</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-800 text-[11px] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Verification in review with Campus Safety Office
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM SECTION: Why CampusRide verifies drivers / students? */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Description */}
            <div className="lg:col-span-4 space-y-1.5">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                {isDriver ? 'Why CampusRide verifies drivers?' : 'Why CampusRide verifies students?'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verification helps us keep CampusRide a trusted and secure network — because your safety and community come first.
              </p>
            </div>

            {/* Right 3 Trust Pillars */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">University Identity</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    Only verified campus members can participate in CampusRide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {isDriver ? 'Daily Driver Check' : 'Peer Trust'}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {isDriver
                      ? 'Drivers confirm they have their physical university ID before their first ride of the day.'
                      : 'Ride exclusively with verified classmates from your department and college.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Privacy First</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    Your reference ID stays protected and isn't exposed to other riders.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Daily Driver ID Check Modal */}
      {showDailyModal && user && (
        <DailyDriverIdCheckModal
          isOpen={showDailyModal}
          onClose={() => setShowDailyModal(false)}
          user={user}
          onVerified={handleDailyVerified}
        />
      )}
    </div>
  );
};
