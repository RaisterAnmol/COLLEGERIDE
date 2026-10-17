// prefers-reduced-motion compliant ride posting form (reducedMotion="user")
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  Car,
  MapPin,
  Clock,
  Users,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { PickupAndRouteNavigationMap } from "../components/map/PickupAndRouteNavigationMap";
import { PageHeroBanner } from "../components/common/PageHeroBanner";
import { MorningDriverLivenessModal } from "../components/verification/MorningDriverLivenessModal";
import { JourneyTicket } from "../components/signature/JourneyTicket";
import { CustomSelect } from "../components/common/CustomSelect";
const offerRideImg = "/hero-aditya-driver.jpg";

const PRESET_LOCATIONS = [
  // Dehradun - Uttaranchal University Campus Buildings
  { text: "UIT Building (Uttaranchal Institute of Technology)", lat: 30.3400, lng: 77.9515 },
  { text: "USCS Building (School of Computing Sciences)", lat: 30.3395, lng: 77.9518 },
  { text: "BBA Building (Uttaranchal Institute of Management)", lat: 30.3392, lng: 77.9520 },
  { text: "Central Academic Library & Law Block", lat: 30.3396, lng: 77.9517 },
  { text: "Campus Gate 1 (Uttaranchal University Main Entrance)", lat: 30.3400, lng: 77.9515 },

  // Dehradun Regional Transit & Student Hubs
  { text: "Premnagar Chowk Market", lat: 30.3340, lng: 77.9620 },
  { text: "Suddhowala Chowk (Student PG Hub)", lat: 30.3475, lng: 77.9320 },
  { text: "Selaqui Industrial & Institutional Hub", lat: 30.3685, lng: 77.8540 },
  { text: "Vikasnagar Bus Terminal", lat: 30.4350, lng: 77.7710 },
  { text: "ISBT Dehradun (Inter-State Bus Terminal)", lat: 30.2885, lng: 78.0080 },
  { text: "Ballupur Chowk (City Entrance)", lat: 30.3395, lng: 78.0125 },
  { text: "Clock Tower (Ghanta Ghar / Paltan Bazaar)", lat: 30.3256, lng: 78.0437 },
];

export const PostRidePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard state (Steps 1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [originIndex, setOriginIndex] = useState(0);
  const [destIndex, setDestIndex] = useState(5);
  const [selectedRoutePolyline, setSelectedRoutePolyline] = useState<[number, number][]>([]);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [recurring, setRecurring] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(3);
  const [vehicleType, setVehicleType] = useState<"car" | "bike">("car");
  const [vehicleModel, setVehicleModel] = useState("");
  const [plateLast4, setPlateLast4] = useState("");
  const [pricePerSeat, setPricePerSeat] = useState<number>(20);

  // Preferences
  const [musicAllowed, setMusicAllowed] = useState(true);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [womenOnlyDriver, setWomenOnlyDriver] = useState(
    user?.gender === "female",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLivenessModal, setShowLivenessModal] = useState(false);
  const [publishedDetails, setPublishedDetails] = useState<{
    originText: string;
    destText: string;
    seats: number;
    fare: number;
    time: string;
  } | null>(null);

  // Load driver vehicle from profile
  useEffect(() => {
    async function loadDriverVehicle() {
      try {
        const v = await api.getMyVehicle();
        if (v?.vehicle) {
          if (v.vehicle.type) setVehicleType(v.vehicle.type);
          if (v.vehicle.model) setVehicleModel(v.vehicle.model);
          if (v.vehicle.plateLast4) setPlateLast4(v.vehicle.plateLast4);
          if (v.vehicle.capacity) setAvailableSeats(Math.max(1, v.vehicle.capacity - 1));
        }
      } catch (_) {}
    }
    if (user) {
      loadDriverVehicle();
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep === 1 && originIndex === destIndex) {
      setError("Origin and destination cannot be the same.");
      return;
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const executePublish = async () => {
    setError("");
    setLoading(true);

    try {
      const origin = PRESET_LOCATIONS[originIndex];
      const destination = PRESET_LOCATIONS[destIndex];

      await api.createRide({
        origin,
        destination,
        departureTime: new Date(departureDate).toISOString(),
        availableSeats,
        pricePerSeat: Math.max(10, pricePerSeat || 10),
        recurring,
        routePolyline: selectedRoutePolyline.length > 0 ? JSON.stringify(selectedRoutePolyline) : undefined,
        vehicle: {
          type: vehicleType,
          model: vehicleModel,
          capacity: availableSeats + 1,
          plateLast4,
        },
        preferences: {
          musicAllowed,
          smokingAllowed,
          womenOnlyDriver,
        },
      });

      setPublishedDetails({
        originText: origin.text,
        destText: destination.text,
        seats: availableSeats,
        fare: Math.max(10, pricePerSeat || 10),
        time: new Date(departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setShowSuccessModal(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to post ride");
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (user?.verificationStatus !== 'verified') {
      setError("Institutional verification required. Your driver credentials must be verified before publishing rides.");
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const isVerifiedToday = user?.lastDailyIdCheckDate === todayStr;
    if (!isVerifiedToday) {
      setShowLivenessModal(true);
      return;
    }
    await executePublish();
  };

  const stepsList = [
    { num: 1, title: "Route" },
    { num: 2, title: "Schedule" },
    { num: 3, title: "Seats" },
    { num: 4, title: "Preferences" },
    { num: 5, title: "Publish" },
  ];

  // 1. Not logged in guard
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center animate-in fade-in">
          <Car className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Sign in to Publish Rides</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            You must be logged in as a verified campus driver to offer seats.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // 2. Authoritative Server Role Guard: Only Driver role can post rides
  const isDriver = user.role === 'driver' || user.accountType === 'DRIVER';
  if (!isDriver) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Passenger Account Active
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
            Driver Verification Required
          </h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            You are logged in as <strong>{user.name}</strong> (Passenger). In accordance with campus transit bylaws, only verified student drivers with a valid driving license can publish carpool routes.
          </p>
          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => navigate('/verification')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Car className="w-4 h-4" />
              <span>Apply for Driver Verification</span>
            </button>
            <button
              onClick={() => navigate('/search')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>Search Available Rides</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Verification Approval Guard: Driver must be verified by admin
  if (user.verificationStatus !== 'verified') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-inner">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Driver Verification {user.verificationStatus.toUpperCase()}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">
            Pending Campus ID Approval
          </h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Your driver application and vehicle credentials are currently <strong>{user.verificationStatus}</strong> with the {user.college} Safety Office. Once verified, you will be authorized to publish rides.
          </p>
          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => navigate('/verification')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>View Verification Status & Documents</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors"
            >
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Driver Hub Side-by-Side Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-10 bg-paper p-6 sm:p-7 rounded-card border border-white/80 neu-card">
        <div className="md:col-span-7 space-y-3">
          <span className="text-xs font-mono font-bold text-plum bg-plum-light px-3.5 py-1 rounded-full border border-plum-border inline-block uppercase tracking-wider">
            CAMPUSRIDE DRIVER HUB
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-primary tracking-tight leading-[1.08]">
            Offer Empty Seats.<br />
            <span className="text-plum">Split Your Commute.</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Share your regular commute with verified classmates traveling your corridor. Save fuel costs with zero platform fee.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-ink-secondary">
            <span className="px-3 py-1 rounded-full bg-forest-light text-forest border border-forest/30 font-bold whitespace-nowrap shrink-0 shadow-2xs">✓ Zero Commission</span>
            <span className="px-3 py-1 rounded-full bg-white border border-border whitespace-nowrap shrink-0 shadow-2xs">✓ 4-Digit In-App OTP</span>
            <span className="px-3 py-1 rounded-full bg-white border border-border whitespace-nowrap shrink-0 shadow-2xs">✓ Verified Peers Only</span>
          </div>
        </div>

        <div className="md:col-span-5 w-full">
          <div className="relative rounded-3xl overflow-hidden border border-border neu-card-sm group">
            <img
              src={offerRideImg}
              alt="Student driver checking ride requests on phone beside CampusRide car"
              className="w-full h-52 sm:h-60 object-cover object-center select-none"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-plum/90 border border-plum-light/30 text-white text-xs font-mono font-bold">
              OFFER A RIDE
            </span>
          </div>
        </div>
      </div>

      {/* Progress Indicator with Spring-Animated Liquid Line */}
      <div className="bg-paper p-4 rounded-3xl border border-white/80 neu-card-sm mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-border -translate-y-1/2 -z-0" />
          <motion.div
            className="absolute top-1/2 left-6 h-0.5 bg-plum -translate-y-1/2 z-0"
            initial={false}
            animate={{ width: `calc(${((currentStep - 1) / (stepsList.length - 1)) * 100}% - ${((currentStep - 1) / (stepsList.length - 1)) * 12}px)` }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          />
          {stepsList.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className="relative z-10 flex flex-col items-center cursor-pointer group focus:outline-none"
              >
                <motion.div
                  animate={{ scale: isCurrent ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                    isDone
                      ? "bg-forest text-white shadow-xs"
                      : isCurrent
                        ? "bg-plum text-white ring-4 ring-plum/20 shadow-xs"
                        : "bg-canvas text-ink-muted border border-border group-hover:border-plum/40"
                  }`}
                >
                  {isDone ? "✓" : `0${s.num}`}
                </motion.div>
                <span
                  className={`text-[11px] font-mono mt-1 hidden sm:block ${isCurrent ? "font-bold text-ink-primary" : "text-ink-muted"}`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {/* Step Content Card with Animated Transitions */}
      <div className="bg-paper p-6 sm:p-10 rounded-3xl border border-white/80 neu-card-lg shadow-sm min-h-[380px] flex flex-col justify-between relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: ROUTE */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <span className="text-xs font-mono text-plum font-bold uppercase tracking-wider">
                  Step 01 / Route
                </span>
                <h2 className="text-2xl font-display font-extrabold text-ink-primary mt-1 tracking-tight">
                  Select Origin & Destination
                </h2>
              </div>

              {/* Quick Campus Landmarks Chips - Sunken Neumorphic Container */}
              <div className="space-y-2 p-4 rounded-2xl bg-canvas neu-sunken border border-border/80">
                <span className="text-[11px] font-mono text-ink-muted font-bold block uppercase tracking-wider">
                  Quick Campus Landmarks (Tap to set)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "🏛️ Main Gate 1", index: 4 },
                    { label: "💻 UIT Tech Block", index: 0 },
                    { label: "📚 Central Library", index: 3 },
                    { label: "🛒 Premnagar Chowk", index: 5 },
                    { label: "🏡 Suddhowala Hub", index: 6 },
                    { label: "🚌 ISBT Terminal", index: 10 },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        if (originIndex !== chip.index) {
                          setOriginIndex(chip.index);
                        } else {
                          setDestIndex(chip.index);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium active:translate-y-0.5 ${
                        originIndex === chip.index
                          ? "bg-plum text-white border-plum shadow-xs font-bold"
                          : destIndex === chip.index
                          ? "bg-forest text-white border-forest shadow-xs font-bold"
                          : "bg-white text-ink-primary border-border hover:border-plum/40 hover:bg-paper"
                      }`}
                    >
                      {chip.label}
                      {originIndex === chip.index ? " (Origin)" : destIndex === chip.index ? " (Dest)" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                <div>
                  <label className="text-xs font-mono text-ink-muted uppercase font-bold block mb-2">
                    Pickup Location
                  </label>
                  <CustomSelect
                    value={originIndex}
                    onChange={(val) => setOriginIndex(Number(val))}
                    options={PRESET_LOCATIONS.map((loc, i) => ({
                      value: i,
                      label: loc.text,
                      group: i < 5 ? '🏫 Campus Buildings (Uttaranchal University)' : '📍 Dehradun & Surrounding Hubs',
                    }))}
                    placeholder="Select Pickup Location"
                    ariaLabel="Pickup Location"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-ink-muted uppercase font-bold block mb-2">
                    Campus Destination
                  </label>
                  <CustomSelect
                    value={destIndex}
                    onChange={(val) => setDestIndex(Number(val))}
                    options={PRESET_LOCATIONS.map((loc, i) => ({
                      value: i,
                      label: loc.text,
                      group: i < 5 ? '🏫 Campus Buildings (Uttaranchal University)' : '📍 Dehradun & Surrounding Hubs',
                    }))}
                    placeholder="Select Campus Destination"
                    ariaLabel="Campus Destination"
                  />
                </div>
              </div>

              {/* Interactive Google Maps Multi-Road Selector */}
              <div className="pt-4 border-t border-border">
                <PickupAndRouteNavigationMap
                  originText={PRESET_LOCATIONS[originIndex]?.text}
                  destinationText={PRESET_LOCATIONS[destIndex]?.text}
                  compact
                  onOriginChange={(newOrig) => {
                    const idx = PRESET_LOCATIONS.findIndex(
                      (p) =>
                        p.text.toLowerCase().includes(newOrig.toLowerCase()) ||
                        newOrig.toLowerCase().includes(p.text.toLowerCase())
                    );
                    if (idx !== -1) setOriginIndex(idx);
                  }}
                  onDestinationChange={(newDest) => {
                    const idx = PRESET_LOCATIONS.findIndex(
                      (p) =>
                        p.text.toLowerCase().includes(newDest.toLowerCase()) ||
                        newDest.toLowerCase().includes(p.text.toLowerCase())
                    );
                    if (idx !== -1) setDestIndex(idx);
                  }}
                  onSelectRoute={(route) => {
                    setSelectedRoutePolyline(route.latLngs);
                  }}
                />
              </div>

              {/* Real-time Neumorphic Corridor Route Ticket Pass (Replacing thin wavy line) */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-plum">
                      Corridor Transit Ticket Pass
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-muted bg-paper px-2.5 py-0.5 rounded-full border border-border font-bold">
                    PASS #DEH-{(originIndex + 1) * 100 + (destIndex + 1)}
                  </span>
                </div>

                {/* Physical Ticket Pass Container with Semicircular Punch Notches */}
                <div className="relative bg-paper rounded-card border border-white/90 neu-card p-6 sm:p-7 overflow-hidden shadow-xs">
                  {/* Semicircular punch notches on left and right edges */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#EBECE8] border border-border shadow-inner pointer-events-none" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#EBECE8] border border-border shadow-inner pointer-events-none" />

                  {/* Top Bar inside Ticket */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-dashed border-border text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-plum-light text-plum font-mono font-bold text-[10px] uppercase whitespace-nowrap shrink-0">
                        Campus Carpool Pass
                      </span>
                      <span className="text-ink-secondary text-xs font-semibold">
                        Uttaranchal & Foothills Artery
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold whitespace-nowrap shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Verified Student Network</span>
                    </div>
                  </div>

                  {/* Route Block Sequence with Tactile Neumorphic Sunken Blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center py-4">
                    {/* Origin Block (Pickup) */}
                    <div className="md:col-span-4 p-3.5 rounded-xl bg-canvas neu-sunken border border-border/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-plum flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-plum inline-block" />
                          Pickup Location
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-plum-light text-plum px-1.5 py-0.2 rounded whitespace-nowrap shrink-0">
                          ORIGIN
                        </span>
                      </div>
                      <div className="text-sm font-bold text-ink-primary truncate">
                        {PRESET_LOCATIONS[originIndex]?.text?.split('(')[0]?.trim() || 'Pickup Point'}
                      </div>
                      <div className="text-[11px] text-ink-muted truncate mt-0.5 font-medium">
                        {PRESET_LOCATIONS[originIndex]?.text?.match(/\((.*?)\)/)?.[1] || 'Designated Campus Hub'}
                      </div>
                    </div>

                    {/* Corridor Connector Block */}
                    <div className="md:col-span-3 flex flex-col items-center justify-center py-1">
                      <div className="flex items-center gap-1.5 w-full justify-center">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-plum/30 via-emerald-500/50 to-emerald-600/30" />
                        <div className="px-2.5 py-1 rounded-full bg-paper border border-border neu-card-sm text-[10px] font-mono font-bold text-ink-secondary flex items-center gap-1 shadow-xs whitespace-nowrap shrink-0">
                          <Car className="w-3 h-3 text-emerald-600" />
                          <span>~4.2 km</span>
                        </div>
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-emerald-600/30 via-emerald-500/50 to-plum/30" />
                      </div>
                      <span className="text-[10px] font-mono text-ink-muted mt-1.5 text-center truncate max-w-full font-semibold">
                        Via Suddhowala Junction Bay
                      </span>
                    </div>

                    {/* Destination Block (Drop-off) */}
                    <div className="md:col-span-4 p-3.5 rounded-xl bg-canvas neu-sunken border border-border/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                          Campus Destination
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                          DROP-OFF
                        </span>
                      </div>
                      <div className="text-sm font-bold text-ink-primary truncate">
                        {PRESET_LOCATIONS[destIndex]?.text?.split('(')[0]?.trim() || 'Campus Gate'}
                      </div>
                      <div className="text-[11px] text-ink-muted truncate mt-0.5 font-medium">
                        {PRESET_LOCATIONS[destIndex]?.text?.match(/\((.*?)\)/)?.[1] || 'Academic Quad / Terminal'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Ticket Perforation & Telemetry Perks */}
                  <div className="pt-3 border-t border-dashed border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-canvas border border-border text-[11px] font-mono text-ink-primary font-bold">
                        ₹{pricePerSeat || 15} <span className="text-ink-muted font-normal">/ seat</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-canvas border border-border text-[11px] font-mono text-ink-muted">
                        Zero Platform Markup
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-canvas border border-border text-[11px] font-mono text-emerald-700 font-medium">
                        ✓ 4-Digit In-App OTP Safe Handshake
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-ink-muted tracking-widest uppercase hidden sm:block">
                      ||| | || |||| | ||||
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SCHEDULE */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <span className="text-xs font-mono text-plum font-bold uppercase tracking-wider">
                  Step 02 / Schedule
                </span>
                <h2 className="text-2xl font-display font-extrabold text-ink-primary mt-1 tracking-tight">
                  Departure Date & Time
                </h2>
              </div>

              <div>
                <label className="text-xs font-mono text-ink-muted uppercase font-bold block mb-2">
                  Departure Slot
                </label>
                <input
                  type="datetime-local"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-canvas neu-sunken border border-border/80 text-base sm:text-sm font-mono text-ink-primary focus:outline-none focus:border-plum"
                />
              </div>

              <div className="p-4 rounded-2xl bg-canvas neu-sunken border border-border/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-ink-primary">
                    Recurring Weekday Commute
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    Repeat this departure slot every Monday–Friday
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="w-5 h-5 rounded accent-plum cursor-pointer"
                />
              </div>

              {recurring && (
                <div className="p-4 rounded-2xl bg-emerald-50 neu-sunken border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active Mon–Fri Semester Schedule</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    This ride will be scheduled across regular weekdays at {new Date(departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, so classmates know they can rely on your daily commute without needing manual posts every day!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: SEATS & VEHICLE */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <span className="text-xs font-mono text-plum font-bold uppercase tracking-wider">
                  Step 03 / Vehicle & Capacity
                </span>
                <h2 className="text-2xl font-display font-extrabold text-ink-primary mt-1 tracking-tight">
                  Vehicle Specifications
                </h2>
              </div>

              {/* Neumorphic Vehicle Type Selector */}
              <div>
                <label className="text-xs font-mono text-ink-muted uppercase font-bold block mb-2">
                  Select Vehicle Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setVehicleType("car");
                      if (availableSeats < 1) setAvailableSeats(3);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      vehicleType === "car"
                        ? "bg-plum text-white border-plum neu-sunken shadow-inner"
                        : "bg-paper text-ink-primary border-border/80 neu-btn hover:border-plum/40 shadow-xs"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                      vehicleType === "car" ? "bg-white/20 text-white" : "bg-canvas neu-sunken text-plum"
                    }`}>
                      🚗
                    </div>
                    <div>
                      <span className="text-sm font-bold block leading-tight">Student Car</span>
                      <span className={`text-[11px] block mt-0.5 ${
                        vehicleType === "car" ? "text-plum-light" : "text-ink-muted"
                      }`}>
                        Sedan / Hatch / SUV
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setVehicleType("bike");
                      setAvailableSeats(1);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      vehicleType === "bike"
                        ? "bg-plum text-white border-plum neu-sunken shadow-inner"
                        : "bg-paper text-ink-primary border-border/80 neu-btn hover:border-plum/40 shadow-xs"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                      vehicleType === "bike" ? "bg-white/20 text-white" : "bg-canvas neu-sunken text-plum"
                    }`}>
                      🛵
                    </div>
                    <div>
                      <span className="text-sm font-bold block leading-tight">Two-Wheeler</span>
                      <span className={`text-[11px] block mt-0.5 ${
                        vehicleType === "bike" ? "text-plum-light" : "text-ink-muted"
                      }`}>
                        Scooter / Motorbike
                      </span>
                    </div>
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-ink-muted uppercase font-bold block mb-1.5">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Honda City / Activa 6G"
                    className="w-full p-3.5 rounded-xl bg-canvas neu-sunken border border-border/80 text-base sm:text-sm font-medium text-ink-primary focus:outline-none focus:border-plum"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-ink-muted uppercase font-bold block mb-1.5">
                    License Plate (Last 4 Digits)
                  </label>
                  <input
                    type="text"
                    value={plateLast4}
                    onChange={(e) => setPlateLast4(e.target.value)}
                    maxLength={4}
                    placeholder="4821"
                    className="w-full p-3.5 rounded-xl bg-canvas neu-sunken border border-border/80 text-base sm:text-sm font-mono uppercase text-ink-primary focus:outline-none focus:border-plum"
                  />
                </div>
              </div>

              {/* Neumorphic Available Seats Selection */}
              <div>
                <label className="text-xs font-mono text-ink-muted uppercase font-bold block mb-2">
                  Available Passenger Seats
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4].map((count) => {
                    const isBikeDisabled = vehicleType === "bike" && count > 1;
                    return (
                      <motion.button
                        key={count}
                        type="button"
                        disabled={isBikeDisabled}
                        whileHover={!isBikeDisabled ? { y: -2 } : {}}
                        whileTap={!isBikeDisabled ? { scale: 0.95 } : {}}
                        onClick={() => setAvailableSeats(count)}
                        className={`p-3 rounded-2xl border text-center transition-all font-display font-extrabold ${
                          isBikeDisabled
                            ? "opacity-30 cursor-not-allowed bg-canvas border-border/40 text-ink-muted"
                            : availableSeats === count
                            ? "bg-plum text-white border-plum neu-sunken shadow-inner cursor-pointer"
                            : "bg-paper text-ink-primary border-border/80 neu-btn hover:border-plum/40 shadow-xs cursor-pointer"
                        }`}
                      >
                        <span className="text-lg block leading-none">{count}</span>
                        <span className="text-[10px] font-mono block mt-1 uppercase font-normal">
                          {count === 1 ? "Seat" : "Seats"}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Price Per Seat Input (Minimum ₹10) */}
              <div className="p-4 rounded-2xl bg-canvas neu-sunken border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-ink-primary uppercase font-bold flex items-center gap-1.5">
                    <span>Fare Contribution Per Seat</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                      Campus Min: ₹10
                    </span>
                  </label>
                  <span className="text-xs font-mono text-ink-muted">Local transit shared rate</span>
                </div>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-primary font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={10}
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(Math.max(10, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-border text-base sm:text-sm font-bold text-ink-primary focus:outline-none focus:border-plum shadow-2xs"
                    placeholder="20"
                  />
                </div>
                <p className="text-[11px] text-ink-muted">
                  Helps offset fuel costs for your carpool. Admin minimum threshold is ₹10 per seat. Zero platform markup.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PREFERENCES */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <span className="text-xs font-mono text-plum font-bold uppercase tracking-wider">
                  Step 04 / Preferences
                </span>
                <h2 className="text-2xl font-display font-extrabold text-ink-primary mt-1 tracking-tight">
                  Commute Ground Rules
                </h2>
              </div>

              <div className="space-y-3">
                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={() => setWomenOnlyDriver(!womenOnlyDriver)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    womenOnlyDriver
                      ? "bg-plum/5 border-plum neu-sunken shadow-inner"
                      : "bg-paper border-border/80 neu-btn hover:border-plum/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center text-base neu-sunken shrink-0">
                      🛡️
                    </div>
                    <div>
                      <span className="text-sm font-bold text-ink-primary block">
                        Women-Only Carpool
                      </span>
                      <span className="text-xs text-ink-muted">
                        Only match and accept verified female students
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors relative p-0.5 neu-sunken ${
                    womenOnlyDriver ? "bg-plum" : "bg-slate-300"
                  }`}>
                    <motion.div
                      animate={{ x: womenOnlyDriver ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={() => setMusicAllowed(!musicAllowed)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    musicAllowed
                      ? "bg-emerald-500/5 border-emerald-600 neu-sunken shadow-inner"
                      : "bg-paper border-border/80 neu-btn hover:border-emerald-600/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-base neu-sunken shrink-0">
                      🎵
                    </div>
                    <div>
                      <span className="text-sm font-bold text-ink-primary block">
                        Music &amp; AUX Allowed
                      </span>
                      <span className="text-xs text-ink-muted">
                        Radio, podcasts, or student AUX playlist during commute
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors relative p-0.5 neu-sunken ${
                    musicAllowed ? "bg-emerald-600" : "bg-slate-300"
                  }`}>
                    <motion.div
                      animate={{ x: musicAllowed ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW & PUBLISH */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <span className="text-xs font-mono text-plum font-bold uppercase tracking-wider">
                  Step 05 / Review & Publish
                </span>
                <h2 className="text-2xl font-display font-extrabold text-ink-primary mt-1 tracking-tight">
                  Commute Pass Summary
                </h2>
              </div>

              {/* Live Journey Ticket Preview */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-ink-muted uppercase font-bold block">
                  Live Pass Preview (How Students Will See Your Ride)
                </span>
                <JourneyTicket
                  ride={{
                    _id: "draft_preview",
                    creator: user || { name: "You" },
                    origin: PRESET_LOCATIONS[originIndex],
                    destination: PRESET_LOCATIONS[destIndex],
                    departureTime: new Date(departureDate).toISOString(),
                    seatsAvailable: availableSeats,
                    availableSeats: availableSeats,
                    fare: pricePerSeat,
                    vehicleModel: vehicleModel,
                    vehiclePlate: plateLast4,
                    isWomenOnly: womenOnlyDriver,
                  }}
                  isCurrentUserCreator={true}
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 neu-sunken border border-emerald-200 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink-primary">Daily Student ID Check Activated</span>
                  <p className="text-ink-muted text-[11px] mt-0.5">
                    Before starting your first ride of the day, you will be prompted to snap a photo of your physical student ID card to match against your enrolled baseline card.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-2.5 rounded-xl bg-white border border-border text-xs font-mono font-bold text-ink-primary hover:bg-canvas active:translate-y-0.5 neu-card-sm flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-7 py-2.5 rounded-xl bg-plum hover:bg-plum-hover active:translate-y-0.5 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-md neu-btn transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:translate-y-0.5 text-white text-sm font-mono font-bold flex items-center gap-2 shadow-md neu-btn transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Publishing corridor...</span>
              ) : (
                <span>Publish Campus Commute →</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Animated Commute Published Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-100 text-center relative overflow-hidden max-h-[92vh] overflow-y-auto"
            >
              {/* Decorative background glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* Animated Success Checkmark Ring */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
                className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-5"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl font-black text-slate-900 tracking-tight"
              >
                Campus Ride Published! 🎉
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto"
              >
                Your commute offer is now live. Verified university classmates traveling along your corridor can request seats!
              </motion.p>

              {/* Commute Summary Card */}
              {publishedDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5 text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">{publishedDetails.originText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-700 truncate">{publishedDetails.destText}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-600 text-[11px]">
                    <span>Departure: <strong>{publishedDetails.time}</strong></span>
                    <span>Seats: <strong>{publishedDetails.seats} available</strong></span>
                    <span>Cost-share: <strong>₹{publishedDetails.fare}</strong></span>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex flex-col sm:flex-row items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                >
                  Go to My Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Offer Another Commute
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5-Second Morning Driver Liveness Check */}
      <MorningDriverLivenessModal
        isOpen={showLivenessModal}
        onClose={() => setShowLivenessModal(false)}
        onVerified={() => {
          setShowLivenessModal(false);
          executePublish();
        }}
        actionTitle="Offering Campus Ride"
      />
    </div>
  );
};
