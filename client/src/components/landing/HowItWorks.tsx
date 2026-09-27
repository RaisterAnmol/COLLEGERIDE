import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Key, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    phase: 'FIND',
    tagline: 'Pin your origin, campus destination, and lecture schedule',
    description:
      'Enter your morning departure point and targeted college portico. CampusRide instantly scans active university corridors for classmates traveling that exact road.',
    details: [
      { label: 'Origin Precision', value: 'Metro, Apartment, or Hostel Gate' },
      { label: 'Time Tolerance', value: 'Flexible ±15 min window' },
      { label: 'Zero Commercial Cabs', value: 'Direct student driver matching' },
    ],
    mockup: {
      type: 'input',
      from: 'Sector 14 Rohini (Block C)',
      to: 'DTU Main Campus Gate 1',
      time: '08:15 AM Slot',
    },
  },
  {
    step: '02',
    phase: 'MATCH',
    tagline: 'Deterministic detour engine pairs you with verified peers',
    description:
      'Our geospatial matching algorithm evaluates trajectory overlap, mutual departmental circles, and driver reliability scores to connect you with 90%+ match accuracy.',
    details: [
      { label: 'Detour Radius', value: '< 600m pickup detour' },
      { label: 'Matching Overlap', value: '92% trajectory overlap' },
      { label: 'Gender Filter', value: 'Optional Women-Only carpool' },
    ],
    mockup: {
      type: 'match',
      name: 'Aditya Kumar',
      college: 'DTU Mechanical Engineering · 3rd Yr',
      car: 'Honda City (DL 8C AK 4920)',
      score: '94% Match',
      seats: '2 Seats Available',
    },
  },
  {
    step: '03',
    phase: 'RIDE',
    tagline: 'Cryptographic 4-digit OTP validation before wheels roll',
    description:
      'No phone numbers exposed. Upon driver arrival, an encrypted 4-digit OTP is shown to verify the car before departure. Drop off directly at the departmental portico.',
    details: [
      { label: 'Pickup Security', value: 'In-app 4-digit departure OTP' },
      { label: 'Real-time Tracking', value: 'Socket.IO live coordinate stream' },
      { label: 'Fuel Split', value: 'Transparent ₹35–₹45 per seat' },
    ],
    mockup: {
      type: 'ride',
      otp: '4 8 2 1',
      status: 'Trip In-Flight to Campus',
      arrival: '08:45 AM Target Arrival',
    },
  },
];

export const HowItWorks: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeStep = STEPS[activeIdx];

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      {/* Editorial Header */}
      <div className="max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-3">
          02 — THE CONTINUOUS COMMUTE SEQUENCE
        </span>
        <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
          How CampusRide Works.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#646A67] max-w-2xl">
          One continuous visual protocol designed for student mobility. Step through the three phases:
        </p>
      </div>

      {/* Phase Scrubber Tabs */}
      <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-4 p-1.5 bg-[#FFFFFF] rounded-2xl border border-[#DDE1DE] shadow-xs">
        {STEPS.map((s, idx) => {
          const isCurrent = activeIdx === idx;
          return (
            <button
              key={s.step}
              onClick={() => setActiveIdx(idx)}
              className={`p-4 sm:p-5 rounded-xl text-left transition-all relative ${
                isCurrent
                  ? 'bg-[#143D32] text-white shadow-sm'
                  : 'hover:bg-emerald-50/60 text-[#646A67]'
              }`}
              data-cursor={`STEP ${s.step}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-[#1769FF]' : 'text-[#98A2B3]'}`}>
                  {s.step}
                </span>
                {isCurrent && <span className="w-2 h-2 rounded-full bg-[#18A66A] animate-pulse" />}
              </div>
              <div className={`text-xl sm:text-2xl font-black mt-2 tracking-tight ${isCurrent ? 'text-white' : 'text-[#111111]'}`}>
                {s.phase}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continuous Animated Composition Card */}
      <div className="mt-8 bg-[#FFFFFF] rounded-2xl border border-[#DDE1DE] p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side: Step Narrative */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#1769FF] font-mono text-xs font-bold border border-[#DBEAFE]">
              PHASE {activeStep.step} / 03
            </span>
            <span className="text-xs font-mono text-[#646A67] uppercase">{activeStep.phase} PROTOCOL</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            {activeStep.tagline}
          </h3>

          <p className="text-base text-[#646A67] leading-relaxed">
            {activeStep.description}
          </p>

          <div className="pt-4 border-t border-[#DDE1DE] grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeStep.details.map((d, i) => (
              <div key={i} className="font-mono">
                <span className="text-[10px] text-[#646A67] uppercase block">{d.label}</span>
                <span className="text-xs font-bold text-[#111111] mt-0.5 block">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Authentic UI Mockup Container */}
        <div className="lg:col-span-6 bg-[#F5F6F3] p-6 sm:p-8 rounded-xl border border-[#DDE1DE]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {activeStep.mockup.type === 'input' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#DDE1DE]">
                    <span className="text-[10px] text-[#646A67] uppercase block">Departure Origin</span>
                    <span className="font-bold text-[#111111] mt-1 block">{activeStep.mockup.from}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#DDE1DE]">
                    <span className="text-[10px] text-[#646A67] uppercase block">Campus Destination</span>
                    <span className="font-bold text-[#1769FF] mt-1 block">{activeStep.mockup.to}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#DDE1DE] flex items-center justify-between">
                    <span className="text-[10px] text-[#646A67] uppercase">Lecture Time</span>
                    <span className="font-bold text-[#18A66A]">{activeStep.mockup.time}</span>
                  </div>
                </div>
              )}

              {activeStep.mockup.type === 'match' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#DDE1DE] shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1769FF]/10 text-[#1769FF] flex items-center justify-center font-bold">
                          AK
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#111111] flex items-center gap-1">
                            <span>{activeStep.mockup.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#18A66A]" />
                          </div>
                          <p className="text-xs text-[#646A67]">{activeStep.mockup.college}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-[#18A66A]">{activeStep.mockup.score}</span>
                        <span className="text-[10px] text-[#646A67] block">Overlap</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#DDE1DE] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#646A67]">{activeStep.mockup.car}</span>
                      <span className="font-bold text-[#1769FF]">{activeStep.mockup.seats}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep.mockup.type === 'ride' && (
                <div className="space-y-4 font-mono">
                  <div className="p-5 bg-[#143D32] text-white rounded-xl text-center border border-emerald-800 shadow-sm">
                    <span className="text-[10px] text-emerald-200/80 uppercase tracking-widest block mb-1">
                      ENCRYPTED DEPARTURE OTP
                    </span>
                    <div className="text-3xl font-black tracking-widest text-[#18A66A]">
                      {activeStep.mockup.otp}
                    </div>
                    <p className="text-[10px] text-emerald-100/70 mt-1.5">
                      ✓ Handshake Verified • Emergency SOS Armed
                    </p>
                  </div>
                  <div className="p-3 bg-[#FFFFFF] rounded-lg border border-[#DDE1DE] text-xs flex items-center justify-between">
                    <span className="text-[#18A66A] font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {activeStep.mockup.status}
                    </span>
                    <span className="text-[#646A67]">{activeStep.mockup.arrival}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const HowItWorksSequence = HowItWorks;

