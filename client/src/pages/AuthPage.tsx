import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { SelfieCapture, SelfieCaptureResult } from "../components/verification/SelfieCapture";
import { StudentCharacter } from "../components/auth/StudentCharacter";
import authStudentImg from "../assets/illustrations/auth-student.webp";
import safetyScrapbookImg from "../assets/illustrations/safety-scrapbook.webp";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building2,
  Phone,
  Car,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Sparkles,
  Key,
  X,
  Upload,
  Loader2,
  Camera,
  ScanFace,
  BookOpen,
  Zap,
} from "lucide-react";
import { SearchableInput } from "../components/common/SearchableInput";
import {
  POPULAR_COLLEGES,
  POPULAR_DEPARTMENTS,
  POPULAR_BRANCHES_COURSES,
} from "../data/academicData";

type AccountTypeOption = "PASSENGER" | "WOMEN_PASSENGER" | "DRIVER" | "ADMIN";

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isRegisterRoute =
    location.pathname === "/register" ||
    location.pathname === "/signup" ||
    searchParams.get("mode") === "register" ||
    searchParams.get("tab") === "register";

  const [isRegister, setIsRegister] = useState(isRegisterRoute);

  useEffect(() => {
    if (
      location.pathname === "/register" ||
      location.pathname === "/signup" ||
      searchParams.get("mode") === "register"
    ) {
      setIsRegister(true);
    } else if (location.pathname === "/login" || location.pathname === "/signin") {
      setIsRegister(false);
    }
  }, [location.pathname, location.search]);

  const [accountType, setAccountType] = useState<AccountTypeOption>("PASSENGER");

  // Shared credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState(1);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [phone, setPhone] = useState("");

  // Phone OTP Verification State for Registration
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneVerificationToken, setPhoneVerificationToken] = useState<string | null>(null);
  const [isSendingRegOtp, setIsSendingRegOtp] = useState(false);
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpInput, setRegOtpInput] = useState("");
  const [isVerifyingRegOtp, setIsVerifyingRegOtp] = useState(false);
  const [regOtpMsg, setRegOtpMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSendRegistrationOtp = async () => {
    if (!phone || phone.length < 10) {
      setRegOtpMsg({ text: "Please enter a complete 10-digit mobile number first.", isError: true });
      return;
    }
    setIsSendingRegOtp(true);
    setRegOtpMsg(null);
    try {
      const res = await api.sendRegistrationPhoneOtp(phone);
      setRegOtpSent(true);
      setRegOtpMsg({ text: res.message || "OTP code sent to your WhatsApp!", isError: false });
    } catch (err: any) {
      setRegOtpMsg({ text: err?.message || "Failed to dispatch WhatsApp OTP. Ensure number is valid.", isError: true });
    } finally {
      setIsSendingRegOtp(false);
    }
  };

  const handleVerifyRegistrationOtp = async () => {
    if (!regOtpInput || regOtpInput.trim().length !== 6) {
      setRegOtpMsg({ text: "Please enter the 6-digit code received on WhatsApp.", isError: true });
      return;
    }
    setIsVerifyingRegOtp(true);
    setRegOtpMsg(null);
    try {
      const res = await api.verifyRegistrationPhoneOtp(phone, regOtpInput.trim());
      setIsPhoneVerified(true);
      setPhoneVerificationToken(res.phoneVerificationToken);
      setRegOtpMsg({ text: "✓ Phone number verified successfully!", isError: false });
    } catch (err: any) {
      setRegOtpMsg({ text: err?.message || "Invalid or expired OTP code.", isError: true });
    } finally {
      setIsVerifyingRegOtp(false);
    }
  };

  // Emergency Contact fields (Safety / SOS)
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Parent/Guardian");

  // Driver-specific fields
  const [driverIdentifier, setDriverIdentifier] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "bike">("car");
  const [vehicleModel, setVehicleModel] = useState("");
  const [plateLast4, setPlateLast4] = useState("");
  const [capacity, setCapacity] = useState(3);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);

  // Face Verification Selfie
  const [selfieResult, setSelfieResult] = useState<SelfieCaptureResult | null>(null);

  const handleIdCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setIdCardPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  // Admin-specific fields
  const [adminToken, setAdminToken] = useState("");

  // Forgot password modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"REQUEST" | "RESET">("REQUEST");
  const [forgotMsg, setForgotMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);


  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const accountTypeRef = useRef<AccountTypeOption>(accountType);
  accountTypeRef.current = accountType;
  const isGoogleInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "366008999424-ea04cr6lh4tatub2f6if4rusme2nr0l2.apps.googleusercontent.com";
    if (!clientId) return;

    let isSubscribed = true;

    const handleGoogleCallback = async (response: any) => {
      if (!response.credential || !isSubscribed) return;
      setError("");
      setGoogleLoading(true);
      try {
        await loginWithGoogle(response.credential, accountTypeRef.current);
        navigate("/dashboard");
      } catch (err: any) {
        console.error("Google login failed:", err);
        setError(err.message || "Failed to sign in with Google.");
      } finally {
        if (isSubscribed) {
          setGoogleLoading(false);
        }
      }
    };

    const initGoogle = () => {
      if (!isSubscribed) return;
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          if (!isGoogleInitializedRef.current) {
            google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleCallback,
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            isGoogleInitializedRef.current = true;
          }

          const btnContainer = document.getElementById("googleSignInBtnContainer");
          if (btnContainer) {
            btnContainer.innerHTML = "";
            const containerWidth = Math.min(400, Math.max(240, btnContainer.clientWidth || 360));
            google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              width: containerWidth,
              text: isRegister ? "signup_with" : "signin_with",
              shape: "pill",
              logo_alignment: "left",
            });
          }

          // Trigger Google One Tap floating prompt with safe dismissal handler
          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Gracefully handle dismissed / skipped prompt
            }
          });
        } catch (e) {
          console.warn("Failed to render Google button:", e);
        }
      }
    };

    let interval: ReturnType<typeof setInterval> | null = null;
    if ((window as any).google?.accounts?.id) {
      initGoogle();
    } else {
      interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          if (interval) clearInterval(interval);
          initGoogle();
        }
      }, 300);
    }

    return () => {
      isSubscribed = false;
      if (interval) clearInterval(interval);
      try {
        (window as any).google?.accounts?.id?.cancel();
      } catch (_) {}
    };
  }, [isRegister]);

  const handleAccountTypeChange = (type: AccountTypeOption) => {
    setAccountType(type);
    if (type === "WOMEN_PASSENGER") {
      setGender("female");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
          setError("Password must contain at least one letter and at least one number.");
          setLoading(false);
          return;
        }

        if (phone.trim() && !isPhoneVerified) {
          setError("Mobile OTP verification is required to complete registration. Please click 'Send WhatsApp OTP' and enter your 6-digit verification code.");
          setLoading(false);
          return;
        }

        const formattedPhone = phone.trim()
          ? phone.startsWith("+91")
            ? phone.trim()
            : `+91 ${phone.trim()}`
          : "";

        const formattedEmergencyPhone = emergencyPhone.trim()
          ? emergencyPhone.startsWith("+91")
            ? emergencyPhone.trim()
            : `+91 ${emergencyPhone.trim()}`
          : "";

        const payload: any = {
          name,
          email,
          password,
          college,
          department,
          course,
          year,
          gender: accountType === "WOMEN_PASSENGER" ? "female" : gender,
          phone: formattedPhone,
          accountType,
          phoneVerificationToken: phoneVerificationToken || undefined,
        };

        if (formattedEmergencyPhone) {
          payload.emergencyContact = {
            name: emergencyName.trim() || "Emergency Contact",
            phone: formattedEmergencyPhone,
            relation: emergencyRelation || "Parent/Guardian",
          };
          payload.emergencyContacts = [payload.emergencyContact];
        }

        const finalAvatar = selfieResult?.previewUrl || idCardPreview || "";
        if (finalAvatar) {
          payload.avatarURL = finalAvatar;
          payload.facePhoto = finalAvatar;
          localStorage.setItem("campusride_user_avatar_" + email.toLowerCase().trim(), finalAvatar);
          localStorage.setItem("campusride_user_selfie", finalAvatar);
        }

        if (selfieResult?.embedding) {
          payload.faceDescriptor = selfieResult.embedding;
          localStorage.setItem("campusride_face_embedding_" + email.toLowerCase().trim(), JSON.stringify(selfieResult.embedding));
        }

        if (accountType === "DRIVER") {
          payload.driverIdentifier = driverIdentifier;
          payload.enrolledIdCardUrl = idCardPreview || "";
          payload.vehicle = {
            type: vehicleType,
            model: vehicleModel,
            capacity,
            plateLast4,
          };
          localStorage.setItem("campusride_driver_id_card_" + email.toLowerCase().trim(), payload.enrolledIdCardUrl);
        }

        if (accountType === "ADMIN") {
          payload.adminToken = adminToken;
        }

        await register(payload);
        navigate("/dashboard");
      } else {
        const loggedInUser = await login(email, password);
        // Admin roles (campus_admin, super_admin, moderator) go to the Admin Dashboard
        if (
          loggedInUser?.role === 'campus_admin' ||
          loggedInUser?.role === 'super_admin' ||
          loggedInUser?.role === 'moderator'
        ) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };


  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotLoading(true);
    try {
      const res: any = await api.forgotPassword(forgotEmail);
      setForgotMsg({ text: res.message || "Reset token generated! Enter your code below.", isError: false });
      if (res.demoToken) {
        setResetToken(res.demoToken);
      }
      setForgotStep("RESET");
    } catch (err: any) {
      setForgotMsg({ text: err.message || "Could not find account with that email.", isError: true });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotLoading(true);
    try {
      const res = await api.resetPassword(resetToken, newPassword);
      setForgotMsg({ text: res.message || "Password successfully reset! You can now log in.", isError: false });
      setTimeout(() => {
        setIsForgotOpen(false);
        setPassword(newPassword);
        setEmail(forgotEmail);
      }, 1500);
    } catch (err: any) {
      setForgotMsg({ text: err.message || "Failed to reset password.", isError: true });
    } finally {
      setForgotLoading(false);
    }
  };


  // Dynamic mascot interaction speech bubble message
  const mascotMessage = isPasswordFocused
    ? "I promise I won't peek! Keep it secret 🙈"
    : isEmailFocused
    ? "Checking for university domain (.edu / .ac.in) 📬"
    : selfieResult
    ? "Looking sharp! Face photo captured ✅"
    : idCardPreview
    ? "Great! Student ID baseline uploaded 🪪"
    : accountType === "DRIVER"
    ? "Drivers split commute costs & save fuel! 🚗"
    : accountType === "WOMEN_PASSENGER"
    ? "Women-Only: travel safely with verified peers 🌸"
    : name.trim()
    ? `Welcome, ${name.trim().split(" ")[0]}! Let's get you set up ✨`
    : isRegister
    ? "Let's craft your official CampusRide pass!"
    : "Welcome back! Ready for your campus ride today?";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Top Playful Campus Brand Header */}
      <div className="w-full max-w-5xl flex items-center justify-between pb-5 mb-6 border-b border-emerald-200/60">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-2xl sm:text-3xl font-black text-[#143D32] tracking-tight hover:opacity-90 transition-opacity">
            CampusRide
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-white/90 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
            <span>Same Campus</span>
            <span className="text-emerald-400">✦</span>
            <span>Same Dreams</span>
            <span className="text-emerald-400">✦</span>
            <span>Better Rides</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white/90 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          <span>More Friends, Less Worries</span>
          <span>😊</span>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-emerald-950/10 border border-emerald-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left Side: Dedicated Interactive Mascot & Live Story Column */}
        <div className="lg:col-span-5 bg-gradient-to-b from-emerald-50/80 via-teal-50/50 to-emerald-100/60 p-5 sm:p-7 flex flex-col justify-start items-center space-y-4 border-b lg:border-b-0 lg:border-r border-emerald-100 relative overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

          {isRegister ? (
            <>
              {/* 1. Previous person seeing the campus artwork */}
              <div className="w-full bg-white rounded-3xl overflow-hidden border border-[#DDE1DE] shadow-xs group">
                <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-100">
                  <img
                    src={authStudentImg}
                    alt="Student with backpack overlooking sunlit university campus"
                    className="w-full h-full object-cover object-[center_30%] transform transition-transform duration-700 group-hover:scale-105 select-none"
                    loading="eager"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-200/80 shadow-xs flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#143D32]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>DEHRADUN CAMPUS LIFE</span>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border-t border-emerald-100 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#143D32]">
                    Join Your Campus Commute ↗
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    Verified Hub
                  </span>
                </div>
              </div>

              {/* 2. Below the student pass / Digital Student Pass Hologram */}
              <div className="relative z-10 w-full rounded-2xl bg-gradient-to-tr from-[#143D32] via-[#16503f] to-[#10b981] p-4 text-white shadow-lg border border-emerald-400/30 overflow-hidden animate-in fade-in duration-300">
                <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-emerald-200 uppercase pb-2 border-b border-white/15">
                  <span>CAMPUSRIDE DIGITAL PASS</span>
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE HOLOGRAM
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center overflow-hidden shrink-0">
                    {selfieResult?.previewUrl || idCardPreview ? (
                      <img
                        src={selfieResult?.previewUrl || idCardPreview}
                        alt="Student Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-black text-emerald-200">
                        {name.trim() ? name.trim().charAt(0).toUpperCase() : "🎓"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-white truncate">
                      {name.trim() || "Your Student Name"}
                    </div>
                    <div className="text-[11px] text-emerald-100 truncate">
                      {college || "Select Your College"}
                    </div>
                    <div className="text-[10px] text-emerald-200/80 truncate font-mono mt-0.5">
                      {course || department || "Academic Course"} • Yr {year}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                    {accountType === "DRIVER"
                      ? "🚗 DRIVER PASS"
                      : accountType === "WOMEN_PASSENGER"
                      ? "🌸 WOMEN-ONLY"
                      : "🎒 STUDENT PASS"}
                  </span>
                  <span className="text-emerald-200">ID: DEH-{new Date().getFullYear()}</span>
                </div>
              </div>

              {/* 3. Your Safety Our Priority Scrapbook Card (Placed just above the Panda animation) */}
              <div className="w-full rounded-3xl overflow-hidden border border-[#DDE1DE] shadow-xs bg-white group hover:shadow-md transition-shadow">
                <img
                  src={safetyScrapbookImg}
                  alt="Your Safety Our Priority - CampusRide Trust Architecture"
                  className="w-full h-auto object-cover select-none"
                  loading="eager"
                />
              </div>

              {/* 4. Below that and just to the left side of Email & Password: The Panda Mascot Animation */}
              <div className="relative z-10 w-full flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-xs border border-emerald-200/90 shadow-sm text-center">
                {/* Dynamic Live Speech Bubble */}
                <div className="mb-2 max-w-[210px] px-3.5 py-1.5 rounded-2xl bg-emerald-50 text-emerald-950 text-xs font-semibold border border-emerald-200 shadow-2xs relative text-center leading-snug">
                  <span>{mascotMessage}</span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-50 border-b border-r border-emerald-200 rotate-45" />
                </div>

                {/* Bao Mascot facing right directly toward the Email & Password inputs */}
                <div className="transform transition-transform hover:scale-105 duration-300">
                  <StudentCharacter
                    isPasswordFocused={isPasswordFocused}
                    isTextFocused={isEmailFocused}
                    textValue={email}
                    passwordValue={password}
                    size={155}
                    lookDirection="right"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Sign In Page: ONLY the Panda mascot animation on the left side! (No other things) */
            <div className="relative z-10 w-full flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xs border border-emerald-200/80 shadow-xs text-center my-auto">
              <div className="mb-4 max-w-[220px] px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-950 text-xs font-semibold border border-emerald-200 shadow-2xs relative text-center leading-snug">
                <span>{mascotMessage}</span>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-50 border-b border-r border-emerald-200 rotate-45" />
              </div>

              <div className="transform transition-transform hover:scale-105 duration-300">
                <StudentCharacter
                  isPasswordFocused={isPasswordFocused}
                  isTextFocused={isEmailFocused}
                  textValue={email}
                  passwordValue={password}
                  size={190}
                  lookDirection="right"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Form Body */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-start">
          {/* Switcher Tab */}
          <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
              }}
              className={
                !isRegister
                  ? "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer bg-[#143D32] text-white shadow-md"
                  : "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
              }}
              className={
                isRegister
                  ? "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer bg-[#143D32] text-white shadow-md"
                  : "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          

          {isRegister && (
            <>
              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("PASSENGER")}
                    className={
                      accountType === "PASSENGER"
                        ? "p-3 rounded-2xl border text-left transition-all cursor-pointer border-[#143D32] bg-emerald-50/70 text-[#143D32] shadow-sm font-bold"
                        : "p-3 rounded-2xl border text-left transition-all cursor-pointer border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }
                  >
                    <Users className="w-4 h-4 mb-1 text-emerald-600" />
                    <div className="text-xs font-bold">Passenger</div>
                    <div className="text-[10px] text-slate-500">Find & book rides</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("WOMEN_PASSENGER")}
                    className={
                      accountType === "WOMEN_PASSENGER"
                        ? "p-3 rounded-2xl border text-left transition-all cursor-pointer border-pink-500 bg-pink-50 text-pink-900 shadow-sm font-bold"
                        : "p-3 rounded-2xl border text-left transition-all cursor-pointer border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }
                  >
                    <ShieldAlert className="w-4 h-4 mb-1 text-pink-600" />
                    <div className="text-xs font-bold">Women Only</div>
                    <div className="text-[10px] text-slate-500">Female-only network</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("DRIVER")}
                    className={
                      accountType === "DRIVER"
                        ? "p-3 rounded-2xl border text-left transition-all cursor-pointer border-amber-500 bg-amber-50 text-amber-900 shadow-sm font-bold"
                        : "p-3 rounded-2xl border text-left transition-all cursor-pointer border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }
                  >
                    <Car className="w-4 h-4 mb-1 text-amber-600" />
                    <div className="text-xs font-bold">Driver / Host</div>
                    <div className="text-[10px] text-slate-500">Offer commute seats</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("ADMIN")}
                    className={
                      accountType === "ADMIN"
                        ? "p-3 rounded-2xl border text-left transition-all cursor-pointer border-purple-500 bg-purple-50 text-purple-900 shadow-sm font-bold"
                        : "p-3 rounded-2xl border text-left transition-all cursor-pointer border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }
                  >
                    <KeyRound className="w-4 h-4 mb-1 text-purple-600" />
                    <div className="text-xs font-bold">University Admin</div>
                    <div className="text-[10px] text-slate-500">Campus staff verify</div>
                  </button>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchableInput
                    label="College / University"
                    required
                    value={college}
                    onChange={setCollege}
                    options={POPULAR_COLLEGES}
                    placeholder="Search or type college (e.g. Uttaranchal, GEU, UPES, DTU)"
                    icon={<Building2 className="w-4 h-4" />}
                    helperText="Search presets or write your institution"
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Year
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                        <option value={5}>Postgraduate</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchableInput
                    label="Department"
                    value={department}
                    onChange={setDepartment}
                    options={POPULAR_DEPARTMENTS}
                    placeholder="Search or type department (e.g. Computer Science, Mechanical)"
                    icon={<BookOpen className="w-4 h-4" />}
                    helperText="Search presets or enter custom"
                  />

                  <SearchableInput
                    label="Course / Branch / Degree"
                    value={course}
                    onChange={setCourse}
                    options={POPULAR_BRANCHES_COURSES}
                    placeholder="Search or type branch (e.g. B.Tech CSE, BCA, MBA)"
                    icon={<GraduationCap className="w-4 h-4" />}
                    helperText="Search presets or enter custom"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={accountType === "WOMEN_PASSENGER" ? "female" : gender}
                      disabled={accountType === "WOMEN_PASSENGER"}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white disabled:bg-slate-100"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

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
                        value={phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhone(digits);
                          if (isPhoneVerified) {
                            setIsPhoneVerified(false);
                            setPhoneVerificationToken(null);
                            setRegOtpSent(false);
                            setRegOtpInput("");
                            setRegOtpMsg(null);
                          }
                        }}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="w-full text-sm px-3 py-2.5 focus:outline-none bg-transparent font-medium text-slate-900 tracking-wide placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enter 10-digit mobile number (+91 included automatically)
                    </p>

                    {/* WhatsApp OTP Verification Box for New Account Registration */}
                    <div className="mt-2.5">
                      {isPhoneVerified ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Mobile Verified via WhatsApp OTP (+91 {phone})</span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                          {!regOtpSent ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-[11px] text-slate-500 font-medium">
                                🔐 WhatsApp OTP verification required to activate account
                              </span>
                              <button
                                type="button"
                                onClick={handleSendRegistrationOtp}
                                disabled={isSendingRegOtp || phone.length < 10}
                                className="px-3 py-1.5 rounded-lg bg-[#143D32] hover:bg-[#0d2820] text-white text-[11px] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-xs"
                              >
                                <Zap className="w-3 h-3 text-emerald-400" />
                                <span>{isSendingRegOtp ? "Sending..." : "Send WhatsApp OTP"}</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-600 font-medium">
                                  Enter 6-digit WhatsApp OTP:
                                </span>
                                <button
                                  type="button"
                                  onClick={handleSendRegistrationOtp}
                                  disabled={isSendingRegOtp}
                                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                >
                                  Resend Code
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={regOtpInput}
                                  onChange={(e) => setRegOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                  placeholder="Enter 6-digit OTP"
                                  maxLength={6}
                                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold tracking-widest text-center bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyRegistrationOtp}
                                  disabled={isVerifyingRegOtp || regOtpInput.length !== 6}
                                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                  {isVerifyingRegOtp ? "Verifying..." : "Verify"}
                                </button>
                              </div>
                            </div>
                          )}

                          {regOtpMsg && (
                            <div className={`text-[11px] font-semibold flex items-center gap-1 ${regOtpMsg.isError ? "text-rose-600" : "text-emerald-700"}`}>
                              {regOtpMsg.isError ? (
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                              <span>{regOtpMsg.text}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Block (For 24/7 SOS Distress Alerts) */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/90 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                      🚨
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                        Emergency SOS Contact (For 24/7 Campus Safety)
                      </h4>
                      <p className="text-[11px] text-rose-800/80">
                        When you trigger an Emergency SOS during a ride, live GPS coordinates & map link will be dispatched to this WhatsApp contact.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="e.g. Dad / Mom / Guardian"
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Relationship
                      </label>
                      <select
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-medium text-slate-900"
                      >
                        <option value="Parent/Guardian">Parent / Guardian</option>
                        <option value="Sibling">Brother / Sister</option>
                        <option value="Campus Friend">Campus Friend / Roommate</option>
                        <option value="Relative">Relative</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Emergency Contact Mobile Number
                    </label>
                    <div className="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-rose-500 overflow-hidden bg-white shadow-xs transition-all">
                      <div className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 border-r border-slate-300 text-slate-800 select-none text-xs font-bold shrink-0">
                        <span className="text-sm leading-none" role="img" aria-label="India flag">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setEmergencyPhone(digits);
                        }}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="w-full text-sm px-3 py-2.5 focus:outline-none bg-transparent font-medium text-slate-900 tracking-wide placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enter 10-digit mobile number (+91 added automatically). Can be modified anytime in Profile.
                    </p>
                  </div>
                </div>

                {/* Driver Section */}
                {accountType === "DRIVER" && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                      <Car className="w-4 h-4 text-amber-700" />
                      Driver & Vehicle Registration
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Driving License Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={driverIdentifier}
                          onChange={(e) => setDriverIdentifier(e.target.value)}
                          placeholder="e.g. UK07-20220014821"
                          className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Vehicle Type
                        </label>
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value as any)}
                          className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                        >
                          <option value="car">Car (Sedan/Hatchback/SUV)</option>
                          <option value="bike">Motorcycle / Scooter</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Vehicle Model
                        </label>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="e.g. Honda City"
                          className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Plate Last 4
                        </label>
                        <input
                          type="text"
                          value={plateLast4}
                          onChange={(e) => setPlateLast4(e.target.value)}
                          placeholder="4821"
                          maxLength={4}
                          className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono uppercase"
                        />
                      </div>
                    </div>

                    {/* Student ID Card (Baseline Reference for Daily Verification) */}
                    <div className="pt-3 border-t border-amber-200/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-amber-700" />
                          <span>Student College ID Card (Mandatory Baseline) *</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-800 uppercase px-2 py-0.5 rounded bg-amber-100 border border-amber-300">
                          Required
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800/90 mb-2.5">
                        Upload or snap a photo of your College ID. Every day before your first ride, you will authenticate against this card to protect campus commuters.
                      </p>

                      {idCardPreview ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-[#0B1E19] p-2 shadow-inner">
                          <img
                            src={idCardPreview}
                            alt="Student ID Card Preview"
                            className="w-full h-36 object-contain rounded-xl bg-[#102A22]"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                              <CheckCircle2 className="w-3 h-3" />
                              Baseline ID Saved
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setIdCardFile(null);
                                setIdCardPreview(null);
                              }}
                              className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl cursor-pointer bg-white transition-all text-center">
                            <Upload className="w-5 h-5 text-amber-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">Upload ID Card Photo</span>
                            <span className="text-[10px] text-slate-400">PNG, JPG or WEBP</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleIdCardFileSelect}
                            />
                          </label>


                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Face Verification Selfie Section for Registration */}
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/80">
                  <SelfieCapture onCapture={(res) => setSelfieResult(res)} />
                </div>

                {/* Admin Secret Section */}
                {accountType === "ADMIN" && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase">
                      <KeyRound className="w-4 h-4 text-purple-700" />
                      Institutional Secret Key
                    </div>
                    <p className="text-[11px] text-purple-800">
                      Enter the authorization token issued to your university campus administration office.
                    </p>
                    <input
                      type="password"
                      required
                      value={adminToken}
                      onChange={(e) => setAdminToken(e.target.value)}
                      placeholder="Enter Admin Invite Secret..."
                      className="w-full text-sm px-3 py-2 rounded-xl border border-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Credentials Block */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                College / Institutional Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="e.g. student@university.edu"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">Password *</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotOpen(true);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={isRegister ? 8 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs font-medium"
                />
              </div>
              {isRegister && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Min. 8 characters (must include letters and numbers)
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl mt-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 rounded-2xl bg-[#143D32] hover:bg-[#0f2e26] text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRegister ? (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              "Sign In to CampusRide"
            )}
          </button>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center pt-2 pb-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider relative">
              Or continue with
            </span>
          </div>

          {/* Google Sign-In Container */}
          <div className="w-full flex flex-col items-center">
            {googleLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Authenticating with Google...</span>
              </div>
            ) : (
              <div
                id="googleSignInBtnContainer"
                className="w-full min-h-[44px] flex justify-center"
              />
            )}
          </div>
        </form>
        </div>
      </div>


      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-[#143D32]/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsForgotOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Key className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Account Recovery</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Reset Your Password</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter your registered student email to receive a recovery token.
            </p>

            {forgotMsg && (
              <div
                className={
                  forgotMsg.isError
                    ? "p-3 rounded-xl text-xs mb-4 bg-rose-50 text-rose-700 border border-rose-200"
                    : "p-3 rounded-xl text-xs mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200"
                }
              >
                {forgotMsg.text}
              </div>
            )}

            {forgotStep === "REQUEST" ? (
              <form onSubmit={handleSendResetLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-[#143D32] hover:bg-[#0f2e26] text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reset Token / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste 6-character code or token..."
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters..."
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-[#143D32] hover:bg-[#0f2e26] text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save New Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
