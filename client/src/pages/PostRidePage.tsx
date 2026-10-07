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
  CheckCircle2,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { PickupAndRouteNavigationMap } from "../components/map/PickupAndRouteNavigationMap";
import { PageHeroBanner } from "../components/common/PageHeroBanner";
import { MorningDriverLivenessModal } from "../components/verification/MorningDriverLivenessModal";
import offerRideImg from "../assets/illustrations/offer-ride.jpg";

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
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800 uppercase tracking-wider border border-blue-300">
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
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-800 uppercase tracking-wider border border-amber-300">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Driver Hub Side-by-Side Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10 bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE1DE] shadow-xs">
        <div className="lg:col-span-7 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#143D32] font-semibold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block">
            CAMPUSRIDE DRIVER HUB
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] uppercase tracking-tight leading-[1.1]">
            Offer Empty Seats.<br />
            <span className="text-[#143D32]">Split Your Commute.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#646A67] leading-relaxed">
            Share your regular commute with verified classmates traveling your corridor. Save fuel costs with zero platform fee.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">✓ Zero Commission</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">✓ 4-Digit In-App OTP</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">✓ Verified Peers Only</span>
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-2xl overflow-hidden border border-[#DDE1DE] shadow-md group">
            <img
              src={offerRideImg}
              alt="Student driver checking ride requests on phone beside CampusRide car"
              className="w-full h-52 sm:h-60 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#143D32]/70 via-transparent to-transparent pointer-events-none" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#143D32]/85 backdrop-blur-sm border border-emerald-400/30 text-emerald-50 text-xs font-mono">
              OFFER A RIDE
            </span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DDE1DE] shadow-xs mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#DDE1DE] -translate-y-1/2 -z-0" />
          {stepsList.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div
                key={s.num}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isDone
                      ? "bg-[#18A66A] text-white"
                      : isCurrent
                        ? "bg-[#1769FF] text-white ring-4 ring-[#1769FF]/20"
                        : "bg-[#F5F6F3] text-[#646A67] border border-[#DDE1DE]"
                  }`}
                >
                  {isDone ? "✓" : `0${s.num}`}
                </div>
                <span
                  className={`text-[11px] font-mono mt-1 hidden sm:block ${isCurrent ? "font-bold text-[#111111]" : "text-[#646A67]"}`}
                >
                  {s.title}
                </span>
              </div>
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
      <div className="bg-[#FFFFFF] p-6 sm:p-10 rounded-2xl border border-[#DDE1DE] shadow-xs min-h-[380px] flex flex-col justify-between">
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
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#1769FF] font-bold uppercase">
                  Step 01 / Route
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Select Origin & Destination
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-2">
                    Pickup Location
                  </label>
                  <select
                    value={originIndex}
                    onChange={(e) => setOriginIndex(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm text-[#111111] focus:outline-none focus:border-[#1769FF]"
                  >
                    {PRESET_LOCATIONS.map((loc, i) => (
                      <option key={i} value={i}>
                        {loc.text}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-2">
                    Campus Destination
                  </label>
                  <select
                    value={destIndex}
                    onChange={(e) => setDestIndex(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm text-[#111111] focus:outline-none focus:border-[#1769FF]"
                  >
                    {PRESET_LOCATIONS.map((loc, i) => (
                      <option key={i} value={i}>
                        {loc.text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Google Maps Multi-Road Selector */}
              <div className="pt-4 border-t border-[#DDE1DE]">
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
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#1769FF] font-bold uppercase">
                  Step 02 / Schedule
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Departure Date & Time
                </h2>
              </div>

              <div>
                <label className="text-xs font-mono text-[#646A67] uppercase block mb-2">
                  Departure Slot
                </label>
                <input
                  type="datetime-local"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm font-mono text-[#111111] focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#111111]">
                    Recurring Weekday Commute
                  </div>
                  <div className="text-xs text-[#646A67]">
                    Repeat this departure slot every Monday–Friday
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#1769FF]"
                />
              </div>
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
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#1769FF] font-bold uppercase">
                  Step 03 / Vehicle & Capacity
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Vehicle Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) =>
                      setVehicleType(e.target.value as "car" | "bike")
                    }
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm font-mono"
                  >
                    <option value="car">Car (Sedan / Hatchback / SUV)</option>
                    <option value="bike">Two-Wheeler / Bike</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-1.5">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Honda City"
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-1.5">
                    License Plate (Last 4 Digits)
                  </label>
                  <input
                    type="text"
                    value={plateLast4}
                    onChange={(e) => setPlateLast4(e.target.value)}
                    maxLength={4}
                    placeholder="4821"
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#646A67] uppercase block mb-1.5">
                    Available Passenger Seats
                  </label>
                  <select
                    value={availableSeats}
                    onChange={(e) => setAvailableSeats(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] text-sm font-mono"
                  >
                    <option value={1}>1 passenger</option>
                    <option value={2}>2 passengers</option>
                    <option value={3}>3 passengers</option>
                    <option value={4}>4 passengers</option>
                  </select>
                </div>
              </div>

              {/* Price Per Seat Input (Minimum ₹10) */}
              <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#111111] uppercase font-bold flex items-center gap-1.5">
                    <span>Fare Contribution Per Seat</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Campus Min: ₹10
                    </span>
                  </label>
                  <span className="text-xs font-mono text-slate-500">Local transit shared rate</span>
                </div>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-700 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={10}
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(Math.max(10, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-[#DDE1DE] text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    placeholder="20"
                  />
                </div>
                <p className="text-[11px] text-[#646A67]">
                  Helps offset fuel costs for your carpool. Admin minimum threshold is ₹10 per seat.
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
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#1769FF] font-bold uppercase">
                  Step 04 / Preferences
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Commute Ground Rules
                </h2>
              </div>

              <div className="space-y-3">
                <label className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-[#111111] block">
                      Women-Only Carpool
                    </span>
                    <span className="text-xs text-[#646A67]">
                      Only match with verified female passengers
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={womenOnlyDriver}
                    onChange={(e) => setWomenOnlyDriver(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#18A66A]"
                  />
                </label>

                <label className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-bold text-[#111111] block">
                      Music Allowed
                    </span>
                    <span className="text-xs text-[#646A67]">
                      Radio / AUX playback during commute
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={musicAllowed}
                    onChange={(e) => setMusicAllowed(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#1769FF]"
                  />
                </label>
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
              <div className="border-b border-[#DDE1DE] pb-3">
                <span className="text-xs font-mono text-[#18A66A] font-bold uppercase">
                  Step 05 / Review & Publish
                </span>
                <h2 className="text-xl font-black text-[#111111] mt-1">
                  Commute Pass Summary
                </h2>
              </div>

              <div className="p-5 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#646A67]">Route:</span>
                  <span className="font-bold text-[#111111]">
                    {PRESET_LOCATIONS[originIndex].text} →{" "}
                    {PRESET_LOCATIONS[destIndex].text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646A67]">Departure:</span>
                  <span className="font-bold text-[#1769FF]">
                    {new Date(departureDate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646A67]">Vehicle:</span>
                  <span className="font-bold text-[#111111]">
                    {vehicleModel} (••• {plateLast4})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#646A67]">Seats Open:</span>
                  <span className="font-bold text-[#18A66A]">
                    {availableSeats} seats
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#00D084]/10 border border-[#00D084]/30 flex items-start gap-3 text-xs">
                <Shield className="w-4 h-4 text-[#18A66A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#111111]">Daily Student ID Check Activated</span>
                  <p className="text-[#646A67] text-[11px] mt-0.5">
                    Before starting your first ride of the day, you will be prompted to snap a photo of your physical student ID card to match against your enrolled baseline card.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-6 border-t border-[#DDE1DE] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-[#DDE1DE] text-xs font-mono font-bold text-[#111111] hover:bg-[#F5F6F3] flex items-center gap-1.5"
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
              className="px-6 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#1D4ED8] text-white text-xs font-mono font-bold flex items-center gap-2 shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-[#18A66A] hover:bg-[#15803D] text-white text-sm font-mono font-bold flex items-center gap-2 shadow-xs disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-100 text-center relative overflow-hidden"
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
