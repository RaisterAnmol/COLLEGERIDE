import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { IdentityDocumentUpload } from "../components/verification/IdentityDocumentUpload";
import { SelfieCapture } from "../components/verification/SelfieCapture";
import {
  ShieldCheck,
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
  Info,
  Camera,
  Lock,
  Sparkles,
  Check,
  Calendar,
} from "lucide-react";
import { DailyDriverIdCheckModal } from "../components/verification/DailyDriverIdCheckModal";
import { PageHeroBanner } from "../components/common/PageHeroBanner";
import verificationHeroImg from "../assets/illustrations/verification-hero.jpg";

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
    localStorage.getItem('campusride_driver_id_card_' + (user?.email || '')) ||
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
      if (driverId.trim()) formData.append("driverIdentifier", driverId.trim());
      formData.append("accountType", user?.accountType || (isDriver ? "DRIVER" : "PASSENGER"));
      formData.append("idDocument", idFile);
      if (licenseFile) formData.append("drivingLicense", licenseFile);
      formData.append("selfie", selfieData.file);

      await api.submitVerificationRequest(formData);

      // Enroll face embedding if captured
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

      // Refresh current request status
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
        <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Sign in to Access Verification</h2>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Identity verification ensures only genuine university students and verified drivers join rides.
        </p>
        <Link
          to="/auth"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const currentStatus = user.verificationStatus;
  const showForm =
    currentStatus === "unverified" ||
    (currentStatus === "rejected" && resubmitting) ||
    (!existingRequest && currentStatus !== "verified");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Verification Header Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE1DE] shadow-xs mb-8">
        <div className="lg:col-span-7 space-y-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">Student Verification</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campus ID & Driver Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Verified credentials for {user?.college || "University"} commuters and drivers.
          </p>
          <div className="pt-2">
            {currentStatus === "verified" ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Verified Campus Member</span>
              </div>
            ) : currentStatus === "pending" ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Under Review</span>
              </div>
            ) : currentStatus === "rejected" ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Action Needed</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Not Verified</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-2xl overflow-hidden border border-[#DDE1DE] shadow-md group">
            <img
              src={verificationHeroImg}
              alt="Student scanning ID on phone for campus verification"
              className="w-full h-48 sm:h-56 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#143D32]/70 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#143D32]/85 backdrop-blur-sm border border-emerald-400/30 text-emerald-50 text-xs font-mono">
              CAMPUS VERIFICATION
            </span>
          </div>
        </div>
      </div>

      {/* State View */}
      {currentStatus === "verified" ? (
        <div className="space-y-6">
          {/* Member Profile Summary Strip */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#143D32] text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "CR"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {user.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user.college || "Uttaranchal University"} · {user.department || "B.Tech Computer Science"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>Roll: <strong className="text-slate-700 font-mono">{user.studentId || user.institutionId || "UU-2024-DRV-842"}</strong></span>
                  <span>•</span>
                  <span>Role: <strong className="text-slate-700">{isDriver ? "Driver & Passenger" : "Passenger"}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
              >
                Dashboard
              </Link>
              {isDriver && (
                <Link
                  to="/post"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#143D32] hover:bg-[#0d2820] rounded-xl transition-colors shadow-xs text-center"
                >
                  Offer a Ride
                </Link>
              )}
            </div>
          </div>

          {/* Section Grid: Enrolled Baseline ID Card & Daily Pre-Ride Verification */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Official University ID Card on File */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <GraduationCap className="w-4 h-4 text-[#143D32]" />
                    <span>Official University Student ID</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                    Enrolled Baseline
                  </span>
                </div>

                {/* Tangible Physical ID Card Mockup */}
                <div className="relative rounded-2xl bg-white border border-slate-300 shadow-md overflow-hidden max-w-sm mx-auto">
                  {/* Lanyard Hole Cutout */}
                  <div className="pt-2 pb-1 bg-white flex justify-center">
                    <div className="w-10 h-2.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner" />
                  </div>

                  {/* University Header Stripe */}
                  <div className="bg-[#143D32] text-white px-4 py-2.5 border-b-2 border-amber-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center flex-shrink-0">
                        <Building className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-extrabold uppercase tracking-wide truncate text-white leading-tight">
                          {user.college || "UTTARANCHAL UNIVERSITY"}
                        </h3>
                        <p className="text-[9px] text-emerald-200 font-medium tracking-tight">
                          STUDENT IDENTITY CARD · 2024–2026
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body with Passport Photo & Details */}
                  <div className="p-3.5 bg-[#FAF9F6]">
                    <div className="flex gap-3">
                      {/* Photo column with official seal stamp */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-24 rounded border border-slate-300 overflow-hidden bg-slate-200 shadow-2xs">
                          <img
                            src={enrolledIdCardUrl}
                            alt="Student ID"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Realistic round stamp mark */}
                        <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full border border-indigo-700/60 bg-indigo-50/40 text-[7px] font-extrabold text-indigo-900/80 flex items-center justify-center text-center leading-none p-0.5 rotate-[-12deg] pointer-events-none select-none">
                          OFFICE SEAL
                        </div>
                      </div>

                      {/* Details Column */}
                      <div className="min-w-0 flex-1 space-y-1 text-[11px]">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                            Student Name
                          </span>
                          <span className="font-bold text-slate-900 text-xs truncate block">
                            {user.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                            Roll / Enrollment No
                          </span>
                          <span className="font-mono font-bold text-slate-800 text-xs">
                            {user.studentId || user.institutionId || "UU-2024-DRV-842"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                            Program / Course
                          </span>
                          <span className="text-slate-700 truncate block font-medium">
                            {user.department || "B.Tech (CSE)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 pt-0.5 text-[10px] text-slate-500">
                          <span>Blood: <strong>O+</strong></span>
                          <span>•</span>
                          <span>Batch: <strong>2024–26</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Barcode & Signature Strip */}
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-end justify-between">
                      {/* Realistic Barcode */}
                      <div>
                        <div className="font-mono tracking-widest text-slate-800 text-[10px] select-none h-4 flex items-center">
                          |||| | ||| || |||| | ||| ||| |
                        </div>
                        <span className="text-[8px] font-mono text-slate-400 block tracking-tight">
                          *{user.studentId || user.institutionId || "UU2024DRV842"}*
                        </span>
                      </div>
                      {/* Signature */}
                      <div className="text-right">
                        <span className="font-serif italic text-xs text-indigo-900 font-medium block">
                          Registrar
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold block">
                          Auth. Signatory
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Enrolled as baseline student ID record.
                </span>
                <label className="text-[#143D32] hover:text-emerald-700 font-semibold cursor-pointer underline text-[11px]">
                  Update ID Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const url = reader.result as string;
                          localStorage.setItem('campusride_driver_id_card_' + (user?.email || ''), url);
                          alert('Updated baseline ID card saved.');
                          window.location.reload();
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Card 2: Daily Pre-Ride Driver Check-in */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Camera className="w-4 h-4 text-slate-700" />
                    <span>Daily Driver Check-in</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      isDailyVerified
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isDailyVerified ? "Cleared for Today" : "Check Required"}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <p className="text-slate-600 leading-relaxed text-xs">
                    Drivers take a quick photo of their physical student ID card before starting their <strong>first ride of each day</strong>. This confirms you have your ID card with you and prevents account sharing.
                  </p>

                  {isDailyVerified ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Driver ID Checked for Today ({todayStr})</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Physical card confirmed against baseline record. Ride publishing and passenger pickup QR codes are active.
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-700 pt-1">
                        <span>Status: <strong>Active</strong></span>
                        <span>•</span>
                        <span>Valid until: <strong>Tonight 11:59 PM</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Pre-Ride Check Required</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        You haven't snapped your physical ID card yet today ({todayStr}). Snap or upload a photo before starting trips.
                      </p>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1.5">
                    <span className="font-semibold text-slate-800 block">How check-in works:</span>
                    <ul className="space-y-1 text-slate-500">
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Snap front of your physical university card
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Takes 10 seconds using phone or laptop camera
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Grants 24-hour driver clearance for all rides today
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDailyModal(true)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isDailyVerified
                      ? "bg-[#143D32] hover:bg-[#0E2C24] shadow-xs"
                      : "bg-[#143D32] hover:bg-[#0d2820] shadow-sm"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{isDailyVerified ? "Re-take Daily ID Photo" : "Start Daily Check-in"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : currentStatus === "pending" && !resubmitting ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Verification Documents Under Review
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Your submitted credentials have been received by the {user.college || "University"} Transit Office.
                Reviews are typically completed within 2 hours during university sessions.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-semibold">{user.name} ({user.email})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Applied Account:</span>
              <span className="font-semibold text-slate-900">{user.accountType || (isDriver ? "DRIVER" : "PASSENGER")}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Student ID / Roll:</span>
              <span className="font-mono font-bold">{existingRequest?.studentIdentifier || "Submitted"}</span>
            </div>
            {isDriver && existingRequest?.driverIdentifier && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Driving License:</span>
                <span className="font-mono font-bold text-slate-900">{existingRequest.driverIdentifier}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Need to update your submitted files?
            </span>
            <button
              type="button"
              onClick={() => setResubmitting(true)}
              className="text-xs font-semibold text-[#143D32] hover:underline cursor-pointer"
            >
              Update Submission
            </button>
          </div>
        </div>
      ) : currentStatus === "rejected" && !resubmitting ? (
        <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Application Needs Revision
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                The verification team was unable to verify your submitted documents. Please check the feedback below and upload a clear, legible photo.
              </p>
            </div>
          </div>

          {existingRequest?.rejectionReason && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">
                Review Feedback:
              </span>
              <p className="text-xs text-rose-900 font-medium mt-1">
                "{existingRequest.rejectionReason}"
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setResubmitting(true)}
            className="w-full py-2.5 bg-[#143D32] hover:bg-[#0d2820] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Resubmit Documents
          </button>
        </div>
      ) : (
        /* Form View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">
              Submit Verification Documents
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Provide your university enrollment proof to unlock ride booking and carpooling.
            </p>
          </div>

          {submitError && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitVerification} className="space-y-6">
            {/* Step 1: Identifier Numbers */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <GraduationCap className="w-4 h-4 text-[#143D32]" />
                1. Institutional Identifiers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Roll / Enrollment Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UU2023CS0142"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#143D32] focus:outline-none uppercase font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Found on your physical student ID card or portal.
                  </p>
                </div>

                {isDriver && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Driving License Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UK07-20220014821"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#143D32] focus:outline-none uppercase font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Required by campus safety guidelines to offer rides.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Document Uploads */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-[#143D32]" />
                2. Document Proof
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IdentityDocumentUpload
                  label="Student ID Card"
                  description="Front photo of your valid university student ID card."
                  required
                  file={idFile}
                  onFileSelect={setIdFile}
                />

                {isDriver && (
                  <IdentityDocumentUpload
                    label="Valid Driving License"
                    description="Front photo of government-issued driving license."
                    required
                    file={licenseFile}
                    onFileSelect={setLicenseFile}
                  />
                )}
              </div>
            </div>

            {/* Step 3: Selfie Check */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#143D32]" />
                3. Face Photo Verification
              </h3>

              <SelfieCapture onCapture={setSelfieData} />
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {resubmitting ? (
                <button
                  type="button"
                  onClick={() => setResubmitting(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel and view current status
                </button>
              ) : (
                <span className="text-xs text-slate-400">
                  Data processed in accordance with campus safety bylaws.
                </span>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#143D32] hover:bg-[#0d2820] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Submit for Verification
              </button>
            </div>
          </form>
        </div>
      )}

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
