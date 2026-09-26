import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { SelfieCapture, SelfieCaptureResult } from "../components/verification/SelfieCapture";
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

  const { login, register } = useAuth();
  const navigate = useNavigate();

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
        const formattedPhone = phone.trim()
          ? phone.startsWith("+91")
            ? phone.trim()
            : `+91 ${phone.trim()}`
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
        };

        if (selfieResult?.previewUrl) {
          payload.avatarURL = selfieResult.previewUrl;
          payload.facePhoto = selfieResult.previewUrl;
          localStorage.setItem("campusride_user_avatar_" + email.toLowerCase().trim(), selfieResult.previewUrl);
          localStorage.setItem("campusride_user_selfie", selfieResult.previewUrl);
          if (selfieResult.embedding) {
            payload.faceDescriptor = selfieResult.embedding;
            localStorage.setItem("campusride_face_embedding_" + email.toLowerCase().trim(), JSON.stringify(selfieResult.embedding));
          }
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
        await login(email, password);
        navigate("/dashboard");
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


  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-emerald-950/5 border border-emerald-100/80 overflow-hidden">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/50 p-6 sm:p-8 relative overflow-hidden border-b border-emerald-100">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#143D32] font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified University Transit Network
            </div>
            <span className="text-[11px] font-mono text-emerald-900 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-sm">
              Dehradun Academic Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#143D32] mt-2">
            {isRegister ? "Create Your CampusRide Account" : "Sign In to CampusRide"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Safe, verified campus carpooling between colleges, hostels, and transit hubs.
          </p>

          {/* Switcher Tab */}
          <div className="flex gap-2 mt-6 bg-emerald-900/5 p-1.5 rounded-2xl border border-emerald-200/60">
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
        </div>


        {/* Main Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-2xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

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
                        }}
                        placeholder="98765 43210"
                        maxLength={10}
                        className="w-full text-sm px-3 py-2.5 focus:outline-none bg-transparent font-medium text-slate-900 tracking-wide placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enter 10-digit mobile number (+91 included automatically)
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
                        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-950 p-2 shadow-inner">
                          <img
                            src={idCardPreview}
                            alt="Student ID Card Preview"
                            className="w-full h-36 object-contain rounded-xl bg-slate-900"
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

          {/* Email & Password */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@university.edu"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                {!isRegister && (
                  <div className="flex items-center gap-3">

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
                  </div>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
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
        </form>
      </div>


      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
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
