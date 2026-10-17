import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../services/api";
import { TurnstileWidget } from "../components/common/TurnstileWidget";

const stepVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 26,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 28 : -28,
    opacity: 0,
    transition: {
      duration: 0.16,
    },
  }),
};

const tabVariants: Variants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -10,
    transition: { duration: 0.14 },
  },
};
import { SelfieCapture, SelfieCaptureResult } from "../components/verification/SelfieCapture";
import { StudentAvatar, StudentArchetype } from "../components/signature/StudentAvatar";
import { TactileButton } from "../components/signature/TactileButton";
import { TermsModal } from "../components/common/TermsModal";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building2,
  Car,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Key,
  X,
  Upload,
  Loader2,
  BookOpen,
  Zap,
  Eye,
  EyeOff,
  Check,
  Compass,
} from "lucide-react";
import { SearchableInput } from "../components/common/SearchableInput";
import { CustomSelect } from "../components/common/CustomSelect";
import {
  POPULAR_COLLEGES,
  POPULAR_DEPARTMENTS,
  POPULAR_BRANCHES_COURSES,
} from "../data/academicData";

type AccountTypeOption = "PASSENGER" | "WOMEN_PASSENGER" | "DRIVER" | "ADMIN";

const ARCHETYPE_OPTIONS: {
  id: StudentArchetype;
  name: string;
  dept: string;
  tag: string;
}[] = [
  { id: "aarav", name: "Aarav", dept: "Engineering", tag: "Daily corridor commuter" },
  { id: "priya", name: "Priya", dept: "Science PG", tag: "Women-only pool preference" },
  { id: "aditya", name: "Aditya", dept: "Architecture", tag: "Flexible studio schedule" },
  { id: "kavita", name: "Kavita", dept: "Law Junior", tag: "Court & library transit" },
  { id: "rohan", name: "Rohan", dept: "Day-Scholar", tag: "Premnagar regular driver" },
  { id: "neha", name: "Neha", dept: "Transit Commuter", tag: "Suddhowala connection" },
];

// Module-level GSI singleton state to prevent duplicate initialization
let isGlobalGsiInitialized = false;
let globalGsiCallback: ((response: any) => void) | null = null;

export const AuthPage: React.FC = () => {
  const toast = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isRegisterRoute =
    location.pathname === "/register" ||
    location.pathname === "/signup" ||
    searchParams.get("mode") === "register" ||
    searchParams.get("tab") === "register";

  const [isRegister, setIsRegister] = useState(isRegisterRoute);
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [stepDirection, setStepDirection] = useState<number>(1);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const goToStep = (target: 1 | 2 | 3) => {
    setStepDirection(target > regStep ? 1 : -1);
    setRegStep(target);
  };

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
  const [selectedArchetype, setSelectedArchetype] = useState<StudentArchetype>(() => {
    return (localStorage.getItem("campusride_avatar_archetype") as StudentArchetype) || "aarav";
  });

  const handleArchetypeSelect = (arch: StudentArchetype) => {
    setSelectedArchetype(arch);
    try {
      localStorage.setItem("campusride_avatar_archetype", arch);
    } catch {}
  };

  // Shared credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

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
  const [devRegOtpHint, setDevRegOtpHint] = useState<string | null>(null);
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
      const res: any = await api.sendRegistrationPhoneOtp(phone);
      setRegOtpSent(true);
      if (res?.devOtpHint) {
        setDevRegOtpHint(res.devOtpHint);
      } else {
        setDevRegOtpHint(null);
      }
      setRegOtpMsg({ text: res?.message || "OTP code sent to your WhatsApp!", isError: false });
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Anti-spam honeypot fields (hidden from genuine users, filled by bots)
  const [honeypot, setHoneypot] = useState("");
  const [forgotHoneypot, setForgotHoneypot] = useState("");

  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);

  const accountTypeRef = useRef<AccountTypeOption>(accountType);
  accountTypeRef.current = accountType;

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

    globalGsiCallback = handleGoogleCallback;

    const initGoogle = () => {
      if (!isSubscribed) return;
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          if (!isGlobalGsiInitialized) {
            google.accounts.id.initialize({
              client_id: clientId,
              callback: (res: any) => {
                if (globalGsiCallback) {
                  globalGsiCallback(res);
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true,
              use_fedcm_for_prompt: true,
            });
            isGlobalGsiInitialized = true;
          }

          const btnContainer = document.getElementById("googleSignInBtnContainer");
          if (btnContainer) {
            btnContainer.innerHTML = "";
            const containerWidth = Math.min(380, Math.max(240, btnContainer.clientWidth || 320));
            google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              width: containerWidth,
              text: isRegister ? "signup_with" : "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
            });
          }

          // FedCM One Tap prompt
          google.accounts.id.prompt();
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
      setSelectedArchetype("priya");
    } else if (type === "ADMIN") {
      setEmail("admin@campusride.edu");
      setPassword("CampusRide2025!");
    } else if (type === "DRIVER") {
      setEmail("aditya.kumar@college.edu");
      setPassword("CampusRide2025!");
    } else if (type === "PASSENGER") {
      setEmail("rahul.sharma@college.edu");
      setPassword("CampusRide2025!");
    }
  };

  const handleNextStep = () => {
    setError("");
    if (regStep === 1) {
      if (!name.trim()) {
        setError("Please enter your full legal name.");
        return;
      }
      if (!college.trim()) {
        setError("Please select or enter your college / university.");
        return;
      }
      if (!phone.trim() || phone.length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
      setStepDirection(1);
      setRegStep(2);
    } else if (regStep === 2) {
      setStepDirection(1);
      setRegStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Anti-spam protection: invisible honeypot trap
    if (honeypot.trim()) {
      console.warn("[AuthPage] Bot submission detected via honeypot trap. Silently rejected.");
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 600);
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        if (!termsAccepted) {
          setError("Please agree to the CampusRide Terms of Transit & Community Guidelines to complete registration.");
          setLoading(false);
          return;
        }
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

        const registrationPayload: any = {
          name: name.trim(),
          email: email.trim(),
          password,
          role: accountType === "DRIVER" ? "driver" : "passenger",
          accountType,
          college: college.trim(),
          department: department.trim() || undefined,
          course: course.trim() || undefined,
          year,
          gender,
          phone: phone.trim() ? `+91${phone.trim()}` : undefined,
          phoneVerificationToken: phoneVerificationToken || undefined,
          avatarArchetype: selectedArchetype,
        };

        if (emergencyName.trim() && emergencyPhone.trim()) {
          registrationPayload.emergencyContact = {
            name: emergencyName.trim(),
            relationship: emergencyRelation,
            phone: `+91${emergencyPhone.trim().replace(/\D/g, "").slice(0, 10)}`,
          };
        }

        if (accountType === "DRIVER") {
          registrationPayload.driverIdentifier = driverIdentifier.trim();
          registrationPayload.vehicleType = vehicleType;
          registrationPayload.vehicleModel = vehicleModel.trim();
          registrationPayload.plateLast4 = plateLast4.trim();
          registrationPayload.capacity = Number(capacity);
          if (idCardPreview) {
            registrationPayload.idCardPreview = idCardPreview;
          }
        }

        if (selfieResult?.previewUrl) {
          registrationPayload.faceVerificationSelfie = selfieResult.previewUrl;
        }

        if (accountType === "ADMIN") {
          registrationPayload.adminToken = adminToken.trim();
        }

        try {
          localStorage.setItem("campusride_avatar_archetype", selectedArchetype);
        } catch {}

        if (turnstileToken) {
          registrationPayload.turnstileToken = turnstileToken;
        }

        await register(registrationPayload);
        navigate("/dashboard");
      } else {
        if (!termsAccepted) {
          setError("Please agree to the CampusRide Terms of Transit & Community Guidelines to sign in.");
          setLoading(false);
          return;
        }
        if (!email.trim() || !password.trim()) {
          setError("Please provide both email and password.");
          setLoading(false);
          return;
        }
        await login(email.trim(), password, turnstileToken);
        const redirect = searchParams.get("redirect") || (email.trim().startsWith("admin@") ? "/admin" : "/dashboard");
        navigate(redirect);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg({ text: "Please provide your student email address.", isError: true });
      toast.warning("Please provide your student email address.", "Email Required");
      return;
    }
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res: any = await api.forgotPassword(forgotEmail.trim(), turnstileToken);
      setResetToken(""); // Strictly empty so user must enter real OTP from email
      if (res.emailNotRegistered) {
        setForgotMsg({
          text: "This email is not registered on CampusRide. Please check the spelling or create an account.",
          isError: true,
        });
        toast.warning("No registered account found with that email.", "Email Not Found");
        return;
      } else {
        setForgotMsg({ 
          text: res.message || "A 6-digit verification code has been dispatched to your email.", 
          isError: false 
        });
        toast.success("Verification code sent! Please check your email inbox.", "Email Dispatched");
      }
      setForgotStep("RESET");
    } catch (err: any) {
      setForgotMsg({ text: err.message || "Failed to process password reset.", isError: true });
      toast.error(err.message || "Failed to process password reset.", "Reset Failed");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword.trim()) {
      setForgotMsg({ text: "Please enter both reset token and new password.", isError: true });
      toast.warning("Please enter both reset token and new password.", "Incomplete Fields");
      return;
    }
    if (newPassword.length < 8) {
      setForgotMsg({ text: "Password must be at least 8 characters long.", isError: true });
      toast.warning("Password must be at least 8 characters long.", "Password Too Short");
      return;
    }
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await api.resetPassword(resetToken.trim(), newPassword);
      setForgotMsg({ text: res.message || "Password updated successfully. You can now sign in.", isError: false });
      toast.success(res.message || "Password updated successfully! You can now sign in.", "Password Updated");
      setTimeout(() => {
        setIsForgotOpen(false);
        setForgotStep("REQUEST");
        setForgotMsg(null);
        setPassword(newPassword);
      }, 2000);
    } catch (err: any) {
      setForgotMsg({ text: err.message || "Failed to reset password. Invalid or expired token.", isError: true });
      toast.error(err.message || "Failed to reset password. Invalid or expired token.", "Reset Error");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center bg-canvas text-left">
      {/* Top Campus Brand Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 group shrink-0"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-forest ring-4 ring-forest/20 shrink-0" />
            <span className="text-xl sm:text-2xl font-display font-extrabold text-ink-primary tracking-tight">
              CampusRide
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono font-medium text-ink-secondary bg-paper px-3 py-1 rounded-full border border-border shadow-xs">
            <span>Premnagar Chowk</span>
            <span className="text-plum font-bold">↔</span>
            <span>Suddhowala</span>
            <span className="text-plum font-bold">↔</span>
            <span>UIT Gate 1</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-ink-secondary bg-paper px-2.5 sm:px-3 py-1 rounded-full border border-border shadow-xs shrink-0">
          <Compass className="w-3.5 h-3.5 text-plum shrink-0" />
          <span className="hidden sm:inline">Verified Student Corridor</span>
          <span className="sm:hidden">Verified Corridor</span>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-paper rounded-2xl sm:rounded-3xl neu-card border border-white/80 overflow-hidden shadow-card">
        {/* Onboarding Stepper Header if Registering */}
        {isRegister && (
          <div className="bg-paper border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-bold text-plum bg-plum-light px-2.5 sm:px-3 py-1 rounded-full border border-plum-border uppercase tracking-wider shrink-0">
                STEP {regStep} OF 3
              </span>
              <span className="text-xs font-bold text-ink-primary truncate">
                {regStep === 1 && "Academic & Personal Identity"}
                {regStep === 2 && "Verification & Safety"}
                {regStep === 3 && "Commute Role & Student Archetype"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className={`flex items-center gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-control border transition-all cursor-pointer shrink-0 ${
                  regStep === 1
                    ? "bg-route text-surface border-route font-semibold shadow-2xs"
                    : "bg-surface text-ink-secondary border-line-base hover:bg-canvas"
                }`}
              >
                <span>1. Profile</span>
                {regStep > 1 && <Check className="w-3 h-3 text-status-verified" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (name && college && phone) goToStep(2);
                }}
                className={`flex items-center gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-control border transition-all cursor-pointer shrink-0 ${
                  regStep === 2
                    ? "bg-route text-surface border-route font-semibold shadow-2xs"
                    : "bg-surface text-ink-secondary border-line-base hover:bg-canvas"
                }`}
              >
                <span>2. Safety</span>
                {regStep > 2 && <Check className="w-3 h-3 text-status-verified" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (name && college && phone) goToStep(3);
                }}
                className={`flex items-center gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-control border transition-all cursor-pointer shrink-0 ${
                  regStep === 3
                    ? "bg-route text-surface border-route font-semibold shadow-2xs"
                    : "bg-surface text-ink-secondary border-line-base hover:bg-canvas"
                }`}
              >
                <span>3. Pass</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left Side: Campus Atlas Plate Reassurance */}
          <div className="order-2 md:order-1 md:col-span-5 bg-canvas p-4 sm:p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-r border-line-base relative overflow-hidden">
            {/* Top Contour Pattern / Watermark */}
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-control bg-surface border border-line-base text-xs font-mono text-ink-secondary">
                <span className="w-2 h-2 rounded-full bg-status-verified" />
                <span>Zero Commercial Markup</span>
              </div>

              <div>
                <h2 className="text-2xl font-display font-extrabold text-ink-primary leading-tight">
                  {isRegister ? "Join Your Campus Commute" : "Welcome Back To Your Corridor"}
                </h2>
                <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed">
                  Every morning between Premnagar and the campus gates, verified students share real empty seats — reducing congestion, splitting fuel costs, and travelling safely together.
                </p>
              </div>

              {/* Digital Pass / Live Student Preview */}
              <div className="rounded-card bg-surface border border-line-base p-4 shadow-subtle space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-line-subtle text-[11px] font-mono">
                  <span className="text-ink-secondary">CAMPUSRIDE DIGITAL PASS</span>
                  <span className="text-route font-bold">DEH-{new Date().getFullYear()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-control bg-canvas border border-line-base shrink-0">
                    <StudentAvatar
                      archetype={selectedArchetype}
                      size={48}
                      state="matched"
                      name={name || "Student"}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-ink-primary truncate">
                      {name.trim() || "Your Student Name"}
                    </div>
                    <div className="text-xs text-ink-secondary truncate">
                      {college || "Uttaranchal University"}
                    </div>
                    <div className="text-[11px] text-ink-muted font-mono mt-0.5 truncate">
                      {course || department || "Academic Member"} • Year {year}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-line-subtle flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded-full bg-route-pale text-route font-semibold border border-route-light/20 whitespace-nowrap shrink-0 shadow-2xs">
                    {accountType === "DRIVER"
                      ? "🚗 DRIVER PASS"
                      : accountType === "WOMEN_PASSENGER"
                      ? "🌸 WOMEN-ONLY PASS"
                      : "🎒 STUDENT PASS"}
                  </span>
                  <span className="text-status-verified font-medium whitespace-nowrap shrink-0">Verified Corridor</span>
                </div>
              </div>

              {/* 6 Archetypes Trust Showcase */}
              <div className="p-3.5 rounded-control bg-surface border border-line-base space-y-2">
                <span className="text-[11px] font-mono text-ink-muted block uppercase">
                  Verified Campus Archetypes
                </span>
                <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1">
                  {ARCHETYPE_OPTIONS.map((arch) => (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => handleArchetypeSelect(arch.id)}
                      className={`p-1 rounded-control transition-all cursor-pointer shrink-0 ${
                        selectedArchetype === arch.id
                          ? "bg-route-pale ring-2 ring-route shadow-2xs"
                          : "hover:bg-canvas opacity-80 hover:opacity-100"
                      }`}
                      title={`${arch.name} (${arch.dept})`}
                    >
                      <StudentAvatar archetype={arch.id} size={32} state="arrived" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Institutional Reassurance Footer */}
            <div className="pt-4 sm:pt-6 border-t border-line-subtle text-xs text-ink-secondary space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-route shrink-0" />
                <span>Verified .edu student IDs only</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-route shrink-0" />
                <span>Zero surge pricing • Pre-negotiated fuel split</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form Body */}
          <div className="order-1 md:order-2 md:col-span-7 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-start bg-surface">
            {/* Top Switcher Tab */}
            <div className="flex gap-2 mb-4 sm:mb-6 bg-canvas p-1 rounded-control border border-line-base">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-control transition-all cursor-pointer ${
                  !isRegister
                    ? "bg-route text-surface shadow-2xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-surface/60"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-control transition-all cursor-pointer ${
                  isRegister
                    ? "bg-route text-surface shadow-2xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-surface/60"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Role Quick Switcher Pills for Login */}
            {!isRegister && (
              <div className="mb-4 sm:mb-6 space-y-2">
                <label className="block text-xs font-mono text-ink-muted">
                  Quick Role Switcher
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("PASSENGER")}
                    className={`py-2 sm:py-2.5 px-1.5 sm:px-3 text-center rounded-xl border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      accountType === "PASSENGER"
                        ? "bg-route-pale text-route border-route font-bold ring-1 ring-route/30"
                        : "bg-surface text-ink-secondary border-line-base hover:bg-canvas hover:text-ink-primary"
                    }`}
                  >
                    <span className="hidden sm:inline">Student Commuter</span>
                    <span className="sm:hidden">Commuter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("DRIVER")}
                    className={`py-2 sm:py-2.5 px-1.5 sm:px-3 text-center rounded-xl border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      accountType === "DRIVER"
                        ? "bg-route-pale text-route border-route font-bold ring-1 ring-route/30"
                        : "bg-surface text-ink-secondary border-line-base hover:bg-canvas hover:text-ink-primary"
                    }`}
                  >
                    <span className="hidden sm:inline">Student Driver</span>
                    <span className="sm:hidden">Driver</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange("ADMIN")}
                    className={`py-2 sm:py-2.5 px-1.5 sm:px-3 text-center rounded-xl border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      accountType === "ADMIN"
                        ? "bg-route-pale text-route border-route font-bold ring-1 ring-route/30"
                        : "bg-surface text-ink-secondary border-line-base hover:bg-canvas hover:text-ink-primary"
                    }`}
                  >
                    <span className="hidden sm:inline">Campus Admin</span>
                    <span className="sm:hidden">Admin</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Spam protection: hidden honeypot field (off-screen, tabindex -1, autocomplete off) */}
              <input
                type="text"
                name="user_campus_code_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Registration Form Steps */}
              <AnimatePresence mode="wait">
                {isRegister ? (
                  <motion.div
                    key="register-wrapper"
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <AnimatePresence mode="wait" custom={stepDirection}>
                      {/* Step 1: Academic & Personal Identity */}
                      {regStep === 1 && (
                        <motion.div
                          key="step1"
                          custom={stepDirection}
                          variants={stepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-semibold text-ink-primary mb-1">
                              Full Legal Name *
                            </label>
                            <div className="relative">
                              <User className="w-4 h-4 text-ink-muted absolute left-3 top-3.5" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Aarav Sharma"
                            className="w-full text-sm pl-9 pr-3 py-2.5 rounded-control border border-line-base bg-canvas focus:ring-1 focus:ring-route focus:border-route focus:outline-none text-ink-primary font-medium"
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
                          placeholder="e.g. Uttaranchal University"
                          icon={<Building2 className="w-4 h-4" />}
                          helperText="Search presets or enter campus name"
                        />

                        <div>
                          <div className="flex justify-between items-center h-5 mb-1.5 gap-2">
                            <label className="block text-xs font-semibold text-ink-primary select-none whitespace-nowrap shrink-0">
                              Academic Year <span className="text-route">*</span>
                            </label>
                          </div>
                          <CustomSelect
                            value={year}
                            onChange={(val) => setYear(Number(val))}
                            options={[
                              { value: 1, label: '1st Year' },
                              { value: 2, label: '2nd Year' },
                              { value: 3, label: '3rd Year' },
                              { value: 4, label: '4th Year' },
                              { value: 5, label: 'Postgraduate / PhD' },
                            ]}
                            icon={<GraduationCap className="w-4 h-4 text-slate-400" />}
                            placeholder="Select Academic Year"
                            ariaLabel="Academic Year"
                            triggerClassName="h-[46px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SearchableInput
                          label="Department"
                          value={department}
                          onChange={setDepartment}
                          options={POPULAR_DEPARTMENTS}
                          placeholder="e.g. Computer Science"
                          icon={<BookOpen className="w-4 h-4" />}
                          helperText="Optional academic department"
                        />

                        <SearchableInput
                          label="Course / Branch / Degree"
                          value={course}
                          onChange={setCourse}
                          options={POPULAR_BRANCHES_COURSES}
                          placeholder="e.g. B.Tech CSE"
                          icon={<GraduationCap className="w-4 h-4" />}
                          helperText="Optional course identifier"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between items-center h-5 mb-1.5 gap-2">
                            <label className="block text-xs font-semibold text-ink-primary select-none whitespace-nowrap shrink-0">
                              Gender <span className="text-route">*</span>
                            </label>
                          </div>
                          <CustomSelect
                            value={accountType === "WOMEN_PASSENGER" ? "female" : gender}
                            disabled={accountType === "WOMEN_PASSENGER"}
                            onChange={(val) => setGender(val as any)}
                            options={[
                              { value: 'male', label: 'Male' },
                              { value: 'female', label: 'Female' },
                              { value: 'other', label: 'Other' },
                            ]}
                            placeholder="Select Gender"
                            ariaLabel="Gender"
                            triggerClassName="h-[46px]"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center h-5 mb-1.5 gap-2">
                            <label className="block text-xs font-semibold text-ink-primary select-none whitespace-nowrap shrink-0">
                              Mobile Number <span className="text-route">*</span>
                            </label>
                          </div>
                          <div className="flex h-[46px] rounded-xl border border-slate-200/90 bg-white focus-within:ring-2 focus-within:ring-[#582C4D]/20 focus-within:border-[#582C4D] overflow-hidden shadow-2xs">
                            <span className="inline-flex items-center px-3 bg-slate-50 border-r border-slate-200 text-ink-secondary text-xs font-mono font-bold select-none">
                              +91
                            </span>
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
                              className="w-full text-sm px-3 py-2.5 focus:outline-none bg-transparent font-mono text-ink-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp OTP Verification Box */}
                      <div className="p-3.5 rounded-control bg-canvas border border-line-base space-y-2">
                        {isPhoneVerified ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-route-pale border border-route-light/30 text-route text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-status-verified shrink-0" />
                            <span>Mobile Verified via WhatsApp (+91 {phone})</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {!regOtpSent ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-xs text-ink-secondary">
                                  WhatsApp OTP verification ensures genuine student accounts.
                                </span>
                                <button
                                  type="button"
                                  onClick={handleSendRegistrationOtp}
                                  disabled={isSendingRegOtp || phone.length < 10}
                                  className="px-3 py-1.5 rounded-control bg-route hover:bg-route-light text-surface text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1 shrink-0 cursor-pointer min-h-[36px]"
                                >
                                  <Zap className="w-3.5 h-3.5 text-route-pale" />
                                  <span>{isSendingRegOtp ? "Sending..." : "Send WhatsApp OTP"}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-ink-secondary">Enter 6-digit WhatsApp OTP:</span>
                                  <button
                                    type="button"
                                    onClick={handleSendRegistrationOtp}
                                    disabled={isSendingRegOtp}
                                    className="text-xs font-semibold text-route hover:underline cursor-pointer"
                                  >
                                    Resend Code
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={regOtpInput}
                                    onChange={(e) =>
                                      setRegOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    placeholder="••••••"
                                    maxLength={6}
                                    className="flex-1 text-sm px-3 py-2 rounded-control border border-line-base bg-surface focus:outline-none focus:ring-1 focus:ring-route font-mono text-center font-bold tracking-widest text-ink-primary"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleVerifyRegistrationOtp}
                                    disabled={isVerifyingRegOtp || regOtpInput.length !== 6}
                                    className="px-4 py-2 rounded-control bg-route hover:bg-route-light text-surface text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer min-h-[36px]"
                                  >
                                    {isVerifyingRegOtp ? "Verifying..." : "Verify OTP"}
                                  </button>
                                </div>

                                {devRegOtpHint && (
                                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-control text-amber-900 text-xs flex items-center justify-between">
                                    <span>
                                      Local Dev Code:{" "}
                                      <strong className="font-mono text-xs bg-amber-200/80 px-1.5 py-0.5 rounded">
                                        {devRegOtpHint}
                                      </strong>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setRegOtpInput(devRegOtpHint)}
                                      className="px-2 py-0.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs transition cursor-pointer"
                                    >
                                      Auto-Fill
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {regOtpMsg && (
                              <div
                                className={`text-xs font-medium flex items-center gap-1.5 ${
                                  regOtpMsg.isError ? "text-emergency-crimson" : "text-status-verified"
                                }`}
                              >
                                {regOtpMsg.isError ? (
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span>{regOtpMsg.text}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {error && (
                        <div className="p-3 rounded-control bg-red-50 border border-red-200 text-emergency-crimson text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <TactileButton type="button" onClick={handleNextStep} variant="primary">
                          <span>Continue to Safety Verification</span>
                          <ArrowRight className="w-4 h-4" />
                        </TactileButton>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Verification & Emergency SOS */}
                  {regStep === 2 && (
                    <motion.div
                      key="step2"
                      custom={stepDirection}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4"
                    >
                      {/* Emergency Contact Block */}
                      <div className="p-4 rounded-control bg-canvas border border-line-base space-y-3">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-emergency-crimson" />
                          <h4 className="text-xs font-bold text-ink-primary">
                            Emergency SOS Contact (India 112 Standard)
                          </h4>
                        </div>
                        <p className="text-xs text-ink-secondary">
                          When you trigger an emergency during an active trip, live GPS coordinates and ride details are instantly dispatched to this contact.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-ink-primary mb-1">
                              Contact Name
                            </label>
                            <input
                              type="text"
                              value={emergencyName}
                              onChange={(e) => setEmergencyName(e.target.value)}
                              placeholder="e.g. Parent / Guardian Name"
                              className="w-full text-sm px-3 py-2 rounded-control border border-line-base bg-surface focus:outline-none focus:ring-1 focus:ring-route text-ink-primary font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-ink-primary mb-1">
                              Relationship
                            </label>
                            <CustomSelect
                              value={emergencyRelation}
                              onChange={(val) => setEmergencyRelation(val)}
                              placeholder="Select relationship"
                              options={[
                                { value: "Parent/Guardian", label: "Parent / Guardian" },
                                { value: "Sibling", label: "Brother / Sister" },
                                { value: "Campus Friend", label: "Campus Roommate / Peer" },
                                { value: "Relative", label: "Relative" },
                                { value: "Other", label: "Other" },
                              ]}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-ink-primary mb-1">
                            Emergency Contact Mobile Number
                          </label>
                          <div className="flex rounded-control border border-line-base bg-surface focus-within:ring-1 focus-within:ring-route overflow-hidden">
                            <span className="inline-flex items-center px-3 py-2 bg-canvas border-r border-line-base text-ink-secondary text-xs font-mono font-bold select-none">
                              +91
                            </span>
                            <input
                              type="tel"
                              value={emergencyPhone}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                setEmergencyPhone(digits);
                              }}
                              placeholder="98765 43210"
                              maxLength={10}
                              className="w-full text-sm px-3 py-2 focus:outline-none bg-transparent font-mono text-ink-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Student ID Card Upload / Preview */}
                      <div className="p-4 rounded-control bg-canvas border border-line-base space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-route" />
                            <span>Student College ID Card Photo</span>
                          </label>
                          <span className="text-[11px] font-mono text-ink-muted">Optional Now • Required for Drivers</span>
                        </div>

                        {idCardPreview ? (
                          <div className="relative rounded-control overflow-hidden border border-status-verified/40 bg-surface p-2">
                            <img
                              src={idCardPreview}
                              alt="ID Preview"
                              className="w-full h-32 object-contain rounded-control bg-canvas"
                            />
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-control bg-status-verified text-surface text-[10px] font-mono font-semibold">
                                ID Card Attached
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIdCardFile(null);
                                  setIdCardPreview(null);
                                }}
                                className="p-1 rounded-control bg-emergency-crimson text-surface cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-4 border border-dashed border-line-strong hover:border-route rounded-control cursor-pointer bg-surface transition-all text-center">
                            <Upload className="w-5 h-5 text-route mb-1" />
                            <span className="text-xs font-semibold text-ink-primary">
                              Upload ID Card Image
                            </span>
                            <span className="text-[10px] text-ink-muted">PNG, JPG or WEBP</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleIdCardFileSelect}
                            />
                          </label>
                        )}
                      </div>

                      {/* Live Face Verification Selfie Section */}
                      <div className="p-4 rounded-control bg-canvas border border-line-base">
                        <SelfieCapture onCapture={(res) => setSelfieResult(res)} />
                      </div>

                      {error && (
                        <div className="p-3 rounded-control bg-red-50 border border-red-200 text-emergency-crimson text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setStepDirection(-1);
                            setRegStep(1);
                          }}
                          className="px-4 py-2 rounded-control border border-line-base bg-surface text-ink-secondary text-xs font-semibold hover:bg-canvas transition-colors flex items-center gap-1.5 min-h-[44px]"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to Profile</span>
                        </button>

                        <TactileButton type="button" onClick={handleNextStep} variant="primary">
                          <span>Continue to Role & Archetype</span>
                          <ArrowRight className="w-4 h-4" />
                        </TactileButton>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Commute Role & Student Archetype */}
                  {regStep === 3 && (
                    <motion.div
                      key="step3"
                      custom={stepDirection}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-4"
                    >
                      {/* Role Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-ink-primary mb-2">
                          Select Campus Commute Role *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleAccountTypeChange("PASSENGER")}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
                              accountType === "PASSENGER"
                                ? "border-route bg-route-pale text-route font-semibold ring-1 ring-route/30 shadow-xs"
                                : "border-line-base bg-surface text-ink-secondary hover:bg-canvas hover:border-line-subtle"
                            }`}
                          >
                            <Users className="w-4 h-4 mb-2 text-route shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-ink-primary whitespace-nowrap">Passenger</div>
                              <div className="text-[10px] text-ink-muted mt-0.5 whitespace-nowrap">Find &amp; book rides</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAccountTypeChange("WOMEN_PASSENGER")}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
                              accountType === "WOMEN_PASSENGER"
                                ? "border-pink-600 bg-pink-50 text-pink-900 font-semibold ring-1 ring-pink-600/30 shadow-xs"
                                : "border-line-base bg-surface text-ink-secondary hover:bg-canvas hover:border-line-subtle"
                            }`}
                          >
                            <ShieldAlert className="w-4 h-4 mb-2 text-pink-600 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-ink-primary whitespace-nowrap">Women Only</div>
                              <div className="text-[10px] text-ink-muted mt-0.5 whitespace-nowrap">Female-only network</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAccountTypeChange("DRIVER")}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
                              accountType === "DRIVER"
                                ? "border-signal-amber bg-amber-50 text-signal-amber font-semibold ring-1 ring-signal-amber/30 shadow-xs"
                                : "border-line-base bg-surface text-ink-secondary hover:bg-canvas hover:border-line-subtle"
                            }`}
                          >
                            <Car className="w-4 h-4 mb-2 text-signal-amber shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-ink-primary whitespace-nowrap">Driver / Host</div>
                              <div className="text-[10px] text-ink-muted mt-0.5 whitespace-nowrap">Offer open seats</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAccountTypeChange("ADMIN")}
                            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
                              accountType === "ADMIN"
                                ? "border-purple-600 bg-purple-50 text-purple-900 font-semibold ring-1 ring-purple-600/30 shadow-xs"
                                : "border-line-base bg-surface text-ink-secondary hover:bg-canvas hover:border-line-subtle"
                            }`}
                          >
                            <KeyRound className="w-4 h-4 mb-2 text-purple-600 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-ink-primary whitespace-nowrap">University Admin</div>
                              <div className="text-[10px] text-ink-muted mt-0.5 whitespace-nowrap">Campus staff only</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Driver Specific Fields */}
                      {accountType === "DRIVER" && (
                        <div className="p-4 rounded-control bg-amber-50/60 border border-amber-200/90 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                            <Car className="w-4 h-4 text-signal-amber" />
                            <span>Driver & Vehicle Registration</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-ink-primary mb-1">
                                Driving License Number *
                              </label>
                              <input
                                type="text"
                                required
                                value={driverIdentifier}
                                onChange={(e) => setDriverIdentifier(e.target.value)}
                                placeholder="e.g. UK07-20220014821"
                                className="w-full text-sm px-3 py-2 rounded-control border border-line-base bg-surface focus:outline-none focus:ring-1 focus:ring-route font-mono uppercase"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-ink-primary mb-1">
                                Vehicle Type
                              </label>
                              <CustomSelect
                                value={vehicleType}
                                onChange={(val) => setVehicleType(val as any)}
                                placeholder="Select vehicle type"
                                options={[
                                  { value: "car", label: "Car (Sedan / Hatchback / SUV)" },
                                  { value: "bike", label: "Motorcycle / Scooter" },
                                ]}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-ink-primary mb-1">
                                Vehicle Model
                              </label>
                              <input
                                type="text"
                                value={vehicleModel}
                                onChange={(e) => setVehicleModel(e.target.value)}
                                placeholder="e.g. Honda City / Swift"
                                className="w-full text-sm px-3 py-2 rounded-control border border-line-base bg-surface focus:outline-none focus:ring-1 focus:ring-route"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-ink-primary mb-1">
                                Plate Last 4
                              </label>
                              <input
                                type="text"
                                value={plateLast4}
                                onChange={(e) => setPlateLast4(e.target.value)}
                                placeholder="4821"
                                maxLength={4}
                                className="w-full text-sm px-3 py-2 rounded-control border border-line-base bg-surface focus:outline-none focus:ring-1 focus:ring-route font-mono uppercase"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Admin Invite Token */}
                      {accountType === "ADMIN" && (
                        <div className="p-4 rounded-control bg-purple-50/70 border border-purple-200 space-y-2">
                          <label className="block text-xs font-bold text-purple-950">
                            Institutional Admin Secret Key *
                          </label>
                          <input
                            type="password"
                            required
                            value={adminToken}
                            onChange={(e) => setAdminToken(e.target.value)}
                            placeholder="Enter institutional authorization key..."
                            className="w-full text-sm px-3 py-2 rounded-control border border-purple-300 bg-surface focus:outline-none focus:ring-1 focus:ring-purple-600 font-mono"
                          />
                        </div>
                      )}

                      {/* Interactive Student Avatar Archetype Selector */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-ink-primary">
                          Choose Your Student Character Archetype *
                        </label>
                        <p className="text-xs text-ink-secondary">
                          Select the campus persona that best matches your daily journey.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                          {ARCHETYPE_OPTIONS.map((arch) => (
                            <button
                              key={arch.id}
                              type="button"
                              onClick={() => handleArchetypeSelect(arch.id)}
                              className={`p-3 rounded-control border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                                selectedArchetype === arch.id
                                  ? "border-route bg-route-pale ring-1 ring-route shadow-2xs"
                                  : "border-line-base bg-surface hover:bg-canvas text-ink-secondary"
                              }`}
                            >
                              <div className="shrink-0 p-1 bg-surface rounded-control border border-line-subtle">
                                <StudentAvatar archetype={arch.id} size={40} state="arrived" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-ink-primary truncate">
                                  {arch.name}
                                </div>
                                <div className="text-[11px] text-ink-muted truncate font-mono">
                                  {arch.dept}
                                </div>
                                <div className="text-[10px] text-ink-secondary mt-0.5 truncate">
                                  {arch.tag}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Account Credentials */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-ink-primary mb-1">
                            College / Institutional Email *
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3.5" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onFocus={() => setIsEmailFocused(true)}
                              onBlur={() => setIsEmailFocused(false)}
                              placeholder="student@university.edu"
                              className="w-full text-sm pl-9 pr-3 py-2.5 rounded-control border border-line-base bg-canvas focus:ring-1 focus:ring-route focus:outline-none text-ink-primary font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-ink-primary mb-1">
                            Create Secure Password *
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-3.5" />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              minLength={8}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              onFocus={() => setIsPasswordFocused(true)}
                              onBlur={() => setIsPasswordFocused(false)}
                              placeholder="Minimum 8 characters..."
                              className="w-full text-sm pl-9 pr-10 py-2.5 rounded-control border border-line-base bg-canvas focus:ring-1 focus:ring-route focus:outline-none text-ink-primary font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-ink-muted hover:text-ink-primary cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ink-muted font-mono">
                            <span className={password.length >= 8 ? "text-status-verified font-medium" : ""}>
                              {password.length >= 8 ? "✓" : "○"} 8+ chars
                            </span>
                            <span
                              className={
                                /[A-Za-z]/.test(password) && /[0-9]/.test(password)
                                  ? "text-status-verified font-medium"
                                  : ""
                              }
                            >
                              {/[A-Za-z]/.test(password) && /[0-9]/.test(password) ? "✓" : "○"} Letters &amp; numbers
                            </span>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 rounded-control bg-red-50 border border-red-200 text-emergency-crimson text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Terms & Conditions Agreement Checkbox */}
                      <div className="p-3.5 rounded-2xl bg-canvas border border-line-subtle flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="reg-terms-checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-line-base text-route focus:ring-route cursor-pointer accent-[#143D32]"
                        />
                        <label htmlFor="reg-terms-checkbox" className="text-xs text-ink-muted leading-relaxed select-none cursor-pointer">
                          I certify that I am an enrolled student or faculty member and agree to the{' '}
                          <button
                            type="button"
                            onClick={() => setIsTermsModalOpen(true)}
                            className="text-route font-bold underline underline-offset-2 hover:text-route-light transition-colors cursor-pointer"
                          >
                            Terms of Transit &amp; Community Safety Guidelines
                          </button>
                          .
                        </label>
                      </div>

                      {/* Cloudflare Turnstile Bot Protection */}
                      <TurnstileWidget
                        onVerify={(t) => setTurnstileToken(t)}
                        onExpire={() => setTurnstileToken("")}
                      />

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setStepDirection(-1);
                            setRegStep(2);
                          }}
                          className="px-4 py-2 rounded-control border border-line-base bg-surface text-ink-secondary text-xs font-semibold hover:bg-canvas transition-colors flex items-center gap-1.5 min-h-[44px]"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>

                        <TactileButton type="submit" isLoading={loading} variant="primary">
                          <span>Complete Campus Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </TactileButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Login Form */
              <motion.div
                key="login-wrapper"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                  <div>
                    <label className="block text-xs font-semibold text-ink-primary mb-1">
                      Institutional / Student Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        placeholder="student@university.edu"
                        className="w-full text-sm pl-9 pr-3 py-2.5 rounded-control border border-line-base bg-canvas focus:ring-1 focus:ring-route focus:outline-none text-ink-primary font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-ink-primary">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setIsForgotOpen(true);
                        }}
                        className="text-xs text-route hover:underline font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-3.5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        placeholder="••••••••"
                        className="w-full text-sm pl-9 pr-10 py-2.5 rounded-control border border-line-base bg-canvas focus:ring-1 focus:ring-route focus:outline-none text-ink-primary font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-ink-muted hover:text-ink-primary cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-control bg-red-50 border border-red-200 text-emergency-crimson text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Terms & Conditions Agreement Checkbox */}
                  <div className="flex items-start gap-2.5 text-xs text-ink-muted pt-1">
                    <input
                      type="checkbox"
                      id="login-terms-checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-line-base text-route focus:ring-route cursor-pointer accent-[#143D32]"
                    />
                    <label htmlFor="login-terms-checkbox" className="text-xs text-ink-muted leading-relaxed select-none cursor-pointer">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setIsTermsModalOpen(true)}
                        className="text-route font-bold underline underline-offset-2 hover:text-route-light transition-colors cursor-pointer"
                      >
                        Terms of Transit &amp; Community Guidelines
                      </button>
                    </label>
                  </div>

                  {/* Cloudflare Turnstile Bot Protection */}
                  <TurnstileWidget
                    onVerify={(t) => setTurnstileToken(t)}
                    onExpire={() => setTurnstileToken("")}
                  />

                  <TactileButton
                    type="submit"
                    isLoading={loading || googleLoading}
                    variant="primary"
                    className="w-full"
                  >
                    <span>Sign In to CampusRide</span>
                    <ArrowRight className="w-4 h-4" />
                  </TactileButton>

                  {/* Social Divider */}
                  <div className="relative flex items-center py-2.5">
                    <div className="flex-grow border-t border-line-subtle" />
                    <span className="shrink-0 px-3 text-xs text-ink-muted font-mono whitespace-nowrap select-none">
                      Or continue with
                    </span>
                    <div className="flex-grow border-t border-line-subtle" />
                  </div>

                  {/* Google Sign-In Container */}
                  <div className="w-full flex flex-col items-center justify-center pt-1">
                    {googleLoading ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-ink-secondary py-2.5">
                        <span className="w-4 h-4 border-2 border-route border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating with Google...</span>
                      </div>
                    ) : (
                      <div
                        id="googleSignInBtnContainer"
                        className="w-full min-h-[44px] flex justify-center items-center"
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-ink-primary/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="relative bg-surface rounded-card max-w-md w-full p-5 sm:p-6 shadow-card border border-line-base max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsForgotOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink-primary rounded-control cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-route mb-2">
              <Key className="w-4 h-4" />
              <span className="text-xs font-mono font-semibold">Account Recovery</span>
            </div>

            <h3 className="text-lg font-display font-bold text-ink-primary">
              Reset Your Password
            </h3>
            <p className="text-xs text-ink-secondary mt-1 mb-4 leading-relaxed">
              Enter your registered student email address to receive a recovery token.
            </p>

            {forgotMsg && (
              <div
                className={`p-3 rounded-control text-xs mb-4 flex items-center gap-2 ${
                  forgotMsg.isError
                    ? "bg-red-50 text-emergency-crimson border border-red-200"
                    : "bg-route-pale text-route border border-route-light/30"
                }`}
              >
                {forgotMsg.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{forgotMsg.text}</span>
              </div>
            )}

            {forgotStep === "REQUEST" ? (
              <form onSubmit={handleSendResetLink} className="space-y-4">
                {/* Spam protection: hidden honeypot field (off-screen, tabindex -1, autocomplete off) */}
                <input
                  type="text"
                  name="user_campus_recovery_hp"
                  value={forgotHoneypot}
                  onChange={(e) => setForgotHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, overflow: 'hidden' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full text-sm px-3 py-2.5 rounded-control border border-line-base bg-canvas focus:outline-none focus:ring-1 focus:ring-route text-ink-primary"
                  />
                </div>

                {/* Cloudflare Turnstile Bot Protection */}
                <TurnstileWidget
                  onVerify={(t) => setTurnstileToken(t)}
                  onExpire={() => setTurnstileToken("")}
                />

                <TactileButton
                  type="submit"
                  isLoading={forgotLoading}
                  variant="primary"
                  className="w-full"
                >
                  Send Reset Code
                </TactileButton>
              </form>
            ) : (
              <form onSubmit={handleCompleteReset} className="space-y-3">
                <div className="flex items-center justify-between text-xs text-ink-secondary py-1.5 px-3 rounded-xl bg-canvas border border-line-base">
                  <span className="truncate">Sent to: <strong className="text-ink-primary font-mono">{forgotEmail}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep("REQUEST");
                      setForgotMsg(null);
                    }}
                    className="text-route hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    Reset Token / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter 6-character token..."
                    className="w-full text-sm px-3 py-2 rounded-control border border-line-base bg-canvas focus:outline-none focus:ring-1 focus:ring-route font-mono text-ink-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-primary mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters..."
                    className="w-full text-sm px-3 py-2 rounded-control border border-line-base bg-canvas focus:outline-none focus:ring-1 focus:ring-route text-ink-primary"
                  />
                </div>

                <TactileButton
                  type="submit"
                  isLoading={forgotLoading}
                  variant="primary"
                  className="w-full"
                >
                  Save New Password
                </TactileButton>

                {/* Helpful instructions for students */}
                <div className="p-3 rounded-xl bg-canvas border border-line-base text-[11px] text-ink-secondary space-y-1 mt-3 text-left">
                  <p className="font-bold text-ink-primary">Check your email inbox</p>
                  <p>• A 6-digit verification code was dispatched to <span className="font-mono text-ink-primary">{forgotEmail}</span>.</p>
                  <p>• If you don't see it within a minute, check your <strong>Spam</strong> or <strong>Junk</strong> folder.</p>
                  <p>• Enter the exact 6-digit code above and choose your new password.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Institutional Terms & Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => setTermsAccepted(true)}
      />
    </div>
  );
};
