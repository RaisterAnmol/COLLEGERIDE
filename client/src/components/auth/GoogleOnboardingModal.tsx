import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  School,
  GraduationCap,
  Users,
  Car,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  Check,
  Upload,
  X,
  CreditCard,
  Camera,
  FileCheck2,
} from 'lucide-react';
import { SearchableInput } from '../common/SearchableInput';
import {
  POPULAR_COLLEGES,
  POPULAR_DEPARTMENTS,
  POPULAR_BRANCHES_COURSES,
} from '../../data/academicData';
import { SelfieCapture, SelfieCaptureResult } from '../verification/SelfieCapture';

interface GoogleOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const GoogleOnboardingModal: React.FC<GoogleOnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { user, refreshUser } = useAuth();
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [accountType, setAccountType] = useState<'PASSENGER' | 'DRIVER'>('PASSENGER');
  const [phone, setPhone] = useState('');

  // ID Card Verification State (For both Passenger and Driver)
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [idCardError, setIdCardError] = useState<string | null>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);

  // Driver Face Verification State (For Driver only)
  const [selfieResult, setSelfieResult] = useState<SelfieCaptureResult | null>(null);

  // Driver vehicle details
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateLast4, setPlateLast4] = useState('');
  const [capacity, setCapacity] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ID Card file handler
  const handleIdCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      setIdCardError('ID card image must be smaller than 5MB.');
      return;
    }
    setIdCardError(null);
    setIdCardFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setIdCardPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Instant demo ID card for seamless testing
  const handleDemoIdCard = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const sampleId =
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
    setIdCardPreview(sampleId);
    setIdCardError(null);
  };

  const handleRemoveIdCard = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIdCardFile(null);
    setIdCardPreview(null);
    if (idCardInputRef.current) {
      idCardInputRef.current.value = '';
    }
  };

  // Dynamic profile completion progress (0% - 100%)
  const calculateProgress = () => {
    let score = 20; // Base Google account
    if (accountType) score += 15;
    if (college.trim()) score += 20;
    if (idCardPreview) score += 20;
    if (accountType === 'DRIVER') {
      if (vehicleModel.trim() && plateLast4.trim().length === 4) score += 10;
      if (selfieResult?.previewUrl) score += 15;
    } else {
      if (department.trim() || course.trim()) score += 25;
    }
    return Math.min(100, score);
  };

  const completionProgress = calculateProgress();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college.trim()) {
      setError('Please select or enter your college/university.');
      return;
    }

    if (!idCardPreview) {
      setError('Please attach your College / Student ID Card photo for campus verification.');
      return;
    }

    if (accountType === 'DRIVER') {
      if (!vehicleModel.trim()) {
        setError('Please enter your vehicle model (e.g. Maruti Swift, Honda Activa).');
        return;
      }
      if (!plateLast4.trim() || plateLast4.trim().length !== 4) {
        setError('Please enter the last 4 digits of your vehicle license plate.');
        return;
      }
      if (!selfieResult?.previewUrl) {
        setError('Drivers must complete Live Biometric Face Verification before activation.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const formattedPhone = phone.trim()
        ? phone.startsWith('+91')
          ? phone.trim()
          : `+91 ${phone.trim()}`
        : '';

      const payload: any = {
        college: college.trim(),
        department: department.trim() || 'General Studies',
        course: course.trim() || 'B.Tech',
        year: Number(year),
        semester: Number(semester),
        phone: formattedPhone,
        accountType,
        enrolledIdCardUrl: idCardPreview || undefined,
      };

      if (accountType === 'DRIVER') {
        payload.vehicle = {
          type: vehicleType,
          model: vehicleModel.trim(),
          plateLast4: plateLast4.trim(),
          capacity: Number(capacity),
        };
        if (selfieResult?.previewUrl) {
          payload.avatarURL = selfieResult.previewUrl;
          payload.facePhoto = selfieResult.previewUrl;
          if (selfieResult.embedding) {
            payload.faceEmbedding = selfieResult.embedding;
          }
        }
      } else if (selfieResult?.previewUrl) {
        payload.avatarURL = selfieResult.previewUrl;
      }

      await api.updateProfile(payload);
      if (refreshUser) {
        await refreshUser();
      }
      onComplete();
    } catch (err: any) {
      console.error('Onboarding failed:', err);
      setError(err?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 350, damping: 25 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/65 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-start pt-20 sm:pt-28 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden"
          >
            {/* Top Botanical Ambient Glow */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-emerald-200/50 to-teal-100/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-emerald-100/40 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header with animated icon */}
            <div className="text-center pb-3 border-b border-slate-100 relative z-10">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="relative mx-auto mb-3 w-14 h-14"
              >
                <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-md animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shadow-xs">
                  <Sparkles className="w-7 h-7 text-emerald-600" />
                </div>
              </motion.div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome to CampusRide!
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Set up your verified university identity with campus ID card and biometric trust badges.
              </p>

              {/* Dynamic Interactive Completion Tracker */}
              <div className="mt-4 p-2.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-left">
                <div className="flex items-center justify-between text-xs font-mono mb-1.5 px-0.5">
                  <span className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Profile Setup Progress
                  </span>
                  <span className="font-bold text-[#143D32]">{completionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#143D32] rounded-full"
                    initial={{ width: '20%' }}
                    animate={{ width: `${completionProgress}%` }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 bg-rose-50 text-rose-800 border border-rose-200 shadow-xs"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.form
              variants={formVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="mt-4 space-y-4 relative z-10"
            >
              {/* Role Selection */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  How will you use CampusRide? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setAccountType('PASSENGER')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      accountType === 'PASSENGER'
                        ? 'border-[#143D32] bg-emerald-50/90 text-[#143D32] font-bold shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>Passenger</span>
                      </div>
                      {accountType === 'PASSENGER' && (
                        <div className="w-4 h-4 rounded-full bg-[#143D32] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-normal">
                      Find & share rides to campus
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setAccountType('DRIVER')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      accountType === 'DRIVER'
                        ? 'border-[#143D32] bg-emerald-50/90 text-[#143D32] font-bold shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-emerald-600" />
                        <span>Student Driver</span>
                      </div>
                      {accountType === 'DRIVER' && (
                        <div className="w-4 h-4 rounded-full bg-[#143D32] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-normal">
                      Offer empty seats & split fuel
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Academic Info */}
              <motion.div variants={itemVariants}>
                <SearchableInput
                  label="University / College *"
                  value={college}
                  onChange={setCollege}
                  options={POPULAR_COLLEGES}
                  placeholder="e.g. Uttaranchal University (UIT)"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <div>
                  <SearchableInput
                    label="Department"
                    value={department}
                    onChange={setDepartment}
                    options={POPULAR_DEPARTMENTS}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <SearchableInput
                    label="Course / Degree"
                    value={course}
                    onChange={setCourse}
                    options={POPULAR_BRANCHES_COURSES}
                    placeholder="e.g. B.Tech"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#143D32]/20 focus:border-[#143D32] transition-all outline-none cursor-pointer"
                  >
                    <option value={1}>1st Year (Fresher)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#143D32]/20 focus:border-[#143D32] transition-all outline-none"
                  />
                </div>
              </motion.div>

              {/* ID Card Verification Section (For BOTH Passenger & Driver) */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Campus ID Card Verification *</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Required for All Members
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload a photo of your physical Student ID or Faculty Card. This verifies your institution membership and unlocks the campus safety badge.
                </p>

                {idCardError && (
                  <div className="p-2.5 rounded-xl text-xs text-rose-700 bg-rose-50 border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{idCardError}</span>
                  </div>
                )}

                {idCardPreview ? (
                  /* ID Card Preview Container */
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-[#0B1E19] p-3 shadow-sm">
                    <div className="w-full h-40 flex items-center justify-center rounded-xl bg-[#102A22] overflow-hidden">
                      <img
                        src={idCardPreview}
                        alt="Campus ID Card Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ID Card Attached
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveIdCard}
                        className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow transition-colors cursor-pointer"
                        title="Remove ID Card"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ID Card Upload Options */
                  <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 transition-colors flex flex-col items-center text-center">
                    <CreditCard className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="text-xs font-bold text-slate-800">
                      Upload College / University ID Card
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      PNG, JPG or WEBP (Max 5MB)
                    </span>

                    <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={() => idCardInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#143D32] hover:bg-[#0e2c24] text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Choose Photo
                      </button>

                      <button
                        type="button"
                        onClick={handleDemoIdCard}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-900 border border-emerald-300 shadow-xs transition-colors cursor-pointer"
                        title="Quickly fill with a verified sample ID card"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        Sample Student ID
                      </button>
                    </div>

                    <input
                      ref={idCardInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleIdCardFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </motion.div>

              {/* Driver-specific Vehicle Section with Animated Accordion Expansion */}
              <AnimatePresence>
                {accountType === 'DRIVER' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.97 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden space-y-4"
                  >
                    {/* Vehicle Details */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Car className="w-4 h-4 text-amber-600" />
                        <span>Vehicle Details (Required for Drivers)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Vehicle Type
                          </label>
                          <select
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value as 'car' | 'bike')}
                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none cursor-pointer"
                          >
                            <option value="car">Car / Sedan / SUV</option>
                            <option value="bike">Motorcycle / Scooter</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Seats Available
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={6}
                            value={capacity}
                            onChange={(e) => setCapacity(Number(e.target.value))}
                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Vehicle Model *
                          </label>
                          <input
                            type="text"
                            required
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                            placeholder="e.g. Maruti Swift"
                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Plate Last 4 Digits *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={4}
                            value={plateLast4}
                            onChange={(e) => setPlateLast4(e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 8421"
                            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Driver Face Verification Section (Live Camera Selfie) */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#143D32]">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Driver Biometric Face Verification *</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Required for Drivers
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Live selfie verification matches the driver against the uploaded ID card to ensure student passenger safety before ride offers can be published.
                      </p>

                      <SelfieCapture onCapture={(res) => setSelfieResult(res)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Animated Submit Button */}
              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#143D32] to-[#1c5445] hover:from-[#0f2e26] hover:to-[#143D32] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>Saving Profile & Activating...</span>
                    </span>
                  ) : (
                    <>
                      <span>Complete Profile & Go to Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-emerald-300" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
