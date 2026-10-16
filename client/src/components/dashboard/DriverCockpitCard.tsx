import React, { useState } from 'react';
import { ShieldCheck, Navigation, CheckCircle2, Clock, Car, PhoneCall, AlertCircle, Sparkles } from 'lucide-react';

interface DriverCockpitProps {
  driverName?: string;
  driverVehicle?: string;
  driverAvatar?: string;
  onNavigate?: () => void;
  onVerifyOtp?: () => void;
}

export const DriverCockpitCard: React.FC<DriverCockpitProps> = ({
  driverName = 'Aditya Kumar',
  driverVehicle = 'Honda City (UK 07 AK 4821)',
  driverAvatar = '/hero-aditya-driver.jpg',
  onNavigate,
  onVerifyOtp,
}) => {
  const [passengers, setPassengers] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      avatarLetters: 'RS',
      avatarBg: 'bg-indigo-600',
      pickup: 'Premnagar Chowk (08:20 AM)',
      status: 'verified',
    },
    {
      id: 2,
      name: 'Ananya Verma',
      avatarLetters: 'AV',
      avatarBg: 'bg-teal-600',
      pickup: 'Suddhowala Junction (08:28 AM)',
      status: 'verified',
    },
    {
      id: 3,
      name: 'Priya Singh',
      avatarLetters: 'PS',
      avatarBg: 'bg-amber-600',
      pickup: 'UIT Gate 2 (08:35 AM)',
      status: 'awaiting',
    },
  ]);

  const [otpVerifiedModal, setOtpVerifiedModal] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const handleVerifyPriya = () => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === 3 ? { ...p, status: 'verified' } : p))
    );
    setOtpVerifiedModal(true);
    setTimeout(() => setOtpVerifiedModal(false), 3000);
    if (onVerifyOtp) onVerifyOtp();
  };

  const handleStartNav = () => {
    setNavigating(true);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Profile Bar (Matches Image 3) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-sm shrink-0">
            <img
              src={driverAvatar}
              alt={driverName}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-white">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-900 leading-tight">
              {driverName}
            </h2>
            <p className="text-xs text-slate-500 font-sans font-medium mt-0.5">
              Verified Campus Driver • {driverVehicle}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 self-start sm:self-auto shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Morning Face Liveness: Verified for Today</span>
        </div>
      </div>

      {/* 2. 4 Stat KPI Cards in a row (Matches Image 3) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            TODAY'S SEATS
          </span>
          <div className="text-2xl font-display font-black text-slate-900 tracking-tight">
            3 / 4
          </div>
          <div className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>1 seat remaining for pickup</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            FUEL SPLIT EARNED
          </span>
          <div className="text-2xl font-display font-black text-slate-900 tracking-tight">
            ₹180
          </div>
          <div className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>₹60 per co-rider standard</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            PUNCTUALITY SCORE
          </span>
          <div className="text-2xl font-display font-black text-slate-900 tracking-tight">
            98.5%
          </div>
          <div className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Always on schedule</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            RATING
          </span>
          <div className="text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>4.9</span>
            <span className="text-amber-500 text-xl">★</span>
          </div>
          <div className="text-[11px] font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>28 verified student reviews</span>
          </div>
        </div>
      </div>

      {/* 3. Lower Row: Passengers (col-7) & Corridor Telemetry (col-5) (Matches Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Today's Morning Commute Passengers */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-display font-black text-slate-900">
                  Today's Morning Commute Passengers
                </h3>
                <span className="text-[11px] font-mono text-slate-500 mt-0.5 block">
                  DEPARTURE: 08:15 AM • UIT ACADEMIC BLOCK
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-bold">
                3 Confirmed
              </span>
            </div>

            {/* Passenger Rows */}
            <div className="mt-4 space-y-3">
              {passengers.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${p.avatarBg} text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {p.avatarLetters}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.pickup}
                      </p>
                    </div>
                  </div>

                  <div>
                    {p.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-[11px] font-mono font-bold">
                        <span>OTP Verified</span>
                        <span>✓</span>
                      </span>
                    ) : (
                      <button
                        onClick={handleVerifyPriya}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100/90 hover:bg-amber-200 border border-amber-300 text-amber-900 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                        title="Click to simulate OTP verification"
                      >
                        <Clock className="w-3 h-3 text-amber-700" />
                        <span>Awaiting OTP</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {otpVerifiedModal && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Priya Singh's 4-digit token verified! Trip log synchronized.</span>
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>All students ID-verified</span>
            <span className="font-mono text-emerald-700 font-bold">● Live GPS Ping 1s</span>
          </div>
        </div>

        {/* Right Column: Active Corridor Telemetry */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                ACTIVE CORRIDOR TELEMETRY
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ACTIVE</span>
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xs font-mono text-slate-500">
                CORRIDOR 01:
              </div>
              <h3 className="text-lg font-display font-black text-slate-900 mt-0.5">
                PREMNAGAR → UIT GATE 1
              </h3>
            </div>

            {/* Status Information Box */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-900">
                  {navigating ? 'Route Active • On Corridor' : 'Live Corridor Scheduled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Live ETA:</span>
                <span className="font-bold text-emerald-700">12 mins to terminal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Safety Monitor:</span>
                <span className="font-bold text-slate-900">112 Protocol Active</span>
              </div>
            </div>
          </div>

          {/* Action Buttons (Matches Image 3) */}
          <div className="mt-6 space-y-2.5">
            <button
              onClick={handleStartNav}
              className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                navigating
                  ? 'bg-emerald-700 text-white shadow-emerald-950/20'
                  : 'bg-[#582C4D] hover:bg-[#431f3a] text-white shadow-[#582C4D]/25'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>{navigating ? 'Navigation Running (Corridor 01)' : 'Start Trip Navigation'}</span>
            </button>

            <button
              onClick={handleVerifyPriya}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <span>✓</span>
              <span>Verify OTP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

