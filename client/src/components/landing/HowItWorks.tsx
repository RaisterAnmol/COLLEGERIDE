import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Key, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { StudentAvatar } from '../signature/StudentAvatar';
const step1Img = '/how_step1_search_corridor_real.jpg';
const step2Img = '/how_step2_route_match_real.jpg';
const step3Img = '/how_step3_departure_carpool_real.jpg';

const STEPS = [
  {
    step: '01',
    phase: 'FIND',
    image: step1Img,
    imageCaption: 'Search & Origin Corridor Selection',
    tagline: 'Pin your origin, campus destination, and lecture schedule',
    description:
      'Enter your morning departure point and targeted college portico. CampusRide instantly scans active university corridors for classmates traveling that exact road.',
    details: [
      { label: 'Origin Precision', value: 'Chowk Hub, Apartment, or Hostel Gate' },
      { label: 'Time Tolerance', value: 'Flexible ±15 min window' },
      { label: 'Zero Commercial Cabs', value: 'Direct student driver matching' },
    ],
    mockup: {
      type: 'input',
      from: 'Premnagar Chowk Market',
      to: 'Campus Gate 1 (Uttaranchal University)',
      time: '08:15 AM Slot',
    },
  },
  {
    step: '02',
    phase: 'MATCH',
    image: step2Img,
    imageCaption: 'Algorithmic Route Match & Peer Profiles',
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
      college: 'Uttaranchal University Mechanical · 3rd Yr',
      car: 'Honda City (UK 07 AK 4821)',
      score: '94% Match',
      seats: '2 Seats Available',
    },
  },
  {
    step: '03',
    phase: 'RIDE',
    image: step3Img,
    imageCaption: 'Authenticated Departure & Campus Portico Dropoff',
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
    <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl"
      >
        <span className="text-xs font-mono text-plum font-bold bg-plum-light px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
          02 — The Continuous Commute Sequence
        </span>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-ink-primary tracking-tight">
          How CampusRide Works.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-ink-secondary max-w-2xl">
          One continuous visual protocol designed for student mobility. Step through the three phases:
        </p>
      </motion.div>

      {/* Phase Scrubber Tabs */}
      <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4 p-2 bg-paper rounded-3xl border border-border neu-card-sm">
        {STEPS.map((s, idx) => {
          const isCurrent = activeIdx === idx;
          return (
            <button
              key={s.step}
              onClick={() => setActiveIdx(idx)}
              className={`p-4 sm:p-5 rounded-2xl text-left transition-all relative cursor-pointer ${
                isCurrent
                  ? 'bg-plum text-white shadow-md'
                  : 'hover:bg-white/80 text-ink-secondary'
              }`}
              data-cursor={`STEP ${s.step}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-plum-light' : 'text-ink-muted'}`}>
                  {s.step}
                </span>
                {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </div>
              <div className={`text-lg sm:text-2xl font-extrabold mt-2 tracking-tight ${isCurrent ? 'text-white' : 'text-ink-primary'}`}>
                {s.phase}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continuous Animated Composition Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 bg-paper rounded-3xl border border-white/80 neu-card p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
      >
        {/* Left Side: Step Narrative */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-plum-light text-plum font-mono text-xs font-bold border border-plum-border">
              PHASE {activeStep.step} / 03
            </span>
            <span className="text-xs font-mono text-ink-muted uppercase">{activeStep.phase} PROTOCOL</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-ink-primary tracking-tight">
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

        {/* Right Side: Authentic UI Mockup & Step Illustration Container */}
        <div className="lg:col-span-6 bg-canvas/70 p-5 sm:p-7 rounded-3xl border border-[#E2DDD3] neu-card-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Real Campus Visual Window */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E2DDD3] mb-5 bg-surface shadow-xs">
                <img
                  src={activeStep.image}
                  alt={activeStep.imageCaption}
                  width={600}
                  height={224}
                  className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/campus-hero-real.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono drop-shadow-md">
                  <span className="flex items-center gap-1.5 backdrop-blur-md bg-black/60 px-3 py-1.5 rounded-xl border border-white/20 text-white shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold">{activeStep.imageCaption}</span>
                  </span>
                  <span className="backdrop-blur-md bg-emerald-900/90 text-emerald-100 px-2.5 py-1 rounded-lg font-bold text-[10px] border border-emerald-500/40 shadow-xs">
                    PHASE {activeStep.step}
                  </span>
                </div>
              </div>

              {activeStep.mockup.type === 'input' && (
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-paper border border-[#E2DDD3] shadow-xs flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-plum/10 text-plum flex items-center justify-center shrink-0 border border-plum/20">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-ink-muted uppercase font-mono font-bold block">
                        Departure Origin
                      </span>
                      <span className="font-bold text-ink-primary mt-0.5 block font-mono truncate">
                        {activeStep.mockup.from}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-canvas px-2.5 py-1 rounded-lg border border-[#E2DDD3] text-ink-muted shrink-0">
                      Pickup Hub
                    </span>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-paper border border-[#E2DDD3] shadow-xs flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0 border border-forest/20">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-ink-muted uppercase font-mono font-bold block">
                        Campus Destination
                      </span>
                      <span className="font-bold text-forest mt-0.5 block font-mono truncate">
                        {activeStep.mockup.to}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-forest/10 text-forest px-2.5 py-1 rounded-lg border border-forest/20 font-bold shrink-0">
                      Portico Drop
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-paper border border-[#E2DDD3] shadow-xs flex items-center justify-between font-mono text-xs">
                    <span className="text-[10px] text-ink-muted uppercase font-bold">Lecture Schedule Window</span>
                    <span className="font-bold text-forest bg-forest/10 px-3 py-1 rounded-full border border-forest/20 text-xs">
                      {activeStep.mockup.time}
                    </span>
                  </div>
                </div>
              )}

              {activeStep.mockup.type === 'match' && (
                <div className="space-y-3 font-sans">
                  <div className="p-4 rounded-2xl bg-paper border border-[#E2DDD3] shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <StudentAvatar archetype="aditya" state="matched" size={44} className="rounded-full shadow-xs shrink-0 border-2 border-forest/30" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-ink-primary flex items-center gap-1.5 flex-wrap">
                            <span>{activeStep.mockup.name}</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 font-bold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified Driver
                            </span>
                          </div>
                          <p className="text-xs text-ink-muted mt-0.5 truncate">{activeStep.mockup.college}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <span className="text-sm font-black text-forest">{activeStep.mockup.score}</span>
                        <span className="text-[10px] text-ink-muted block uppercase">Trajectory</span>
                      </div>
                    </div>
                    <div className="mt-3.5 pt-3 border-t border-[#EFEBE4] flex items-center justify-between text-xs font-mono">
                      <span className="text-ink-secondary flex items-center gap-1.5 font-medium">
                        🚘 {activeStep.mockup.car}
                      </span>
                      <span className="font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/20">
                        {activeStep.mockup.seats}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep.mockup.type === 'ride' && (
                <div className="space-y-3 font-sans">
                  {/* Tactile Departure Security Pass */}
                  <div className="bg-paper neu-card border border-[#E2DDD3] rounded-2xl p-5 shadow-xs relative overflow-hidden text-left">
                    {/* Subtle collegiate ambient glow */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-radial from-forest/5 via-forest/0 to-transparent pointer-events-none" />

                    {/* Header: Key icon + label + Live OTP badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#EFEBE4]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest shadow-2xs">
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono text-[10px] uppercase font-bold text-forest tracking-wider block">
                            Cryptographic Boarding Pass
                          </span>
                          <span className="text-[11px] text-ink-muted">
                            Share 4-digit code with driver upon boarding
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE OTP
                      </span>
                    </div>

                    {/* 4 Individual Tactile Digit Tiles */}
                    <div className="py-4">
                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        {activeStep.mockup.otp.split(' ').map((digit, i) => (
                          <div
                            key={i}
                            className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-canvas border border-[#D9D3C7] shadow-inner flex flex-col items-center justify-center relative group transition-transform hover:-translate-y-0.5"
                          >
                            {/* Top highlight reflection */}
                            <div className="absolute inset-x-2 top-1 h-[2px] bg-white/90 rounded-full" />
                            <span className="text-2xl sm:text-3xl font-mono font-black text-forest">
                              {digit}
                            </span>
                            <span className="text-[8px] font-mono text-ink-muted uppercase">
                              PIN {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified Status Guardrails Strip */}
                    <div className="pt-3 border-t border-[#EFEBE4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-forest font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                        <span>Driver Handshake Match Active</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-plum font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-plum shrink-0" />
                        <span>Emergency 112 SOS Armed</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Route Banner */}
                  <div className="p-3.5 bg-paper rounded-xl border border-[#E2DDD3] text-xs flex items-center justify-between shadow-2xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-forest font-bold">
                        {activeStep.mockup.status}
                      </span>
                    </div>
                    <span className="text-ink-muted text-[11px]">
                      {activeStep.mockup.arrival}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};



// Backwards-compatible alias
export const HowItWorksSequence = HowItWorks;

