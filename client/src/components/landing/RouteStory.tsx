import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, MapPin, Users, Key, Sparkles, Navigation, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeroBanner } from '../common/PageHeroBanner';
import routeStoryImg from '../../assets/illustrations/route-story.jpg';

interface StepData {
  id: string;
  stepNumber: string;
  title: string;
  tagline: string;
  description: string;
  specPill: string;
  telemetry: {
    label: string;
    value: string;
  }[];
}

const STEPS: StepData[] = [
  {
    id: 'step-1',
    stepNumber: '01',
    title: 'Choose your route',
    tagline: 'Set your regular morning or evening corridor',
    description:
      'Pin your hostel, apartment, or transit hub along with your target class time. CampusRide instantly computes matching corridors across verified student drivers.',
    specPill: 'GIS Corridors & Geo-Fencing',
    telemetry: [
      { label: 'Detour limit', value: '< 600 meters' },
      { label: 'Time tolerance', value: '±15 mins' },
      { label: 'Corridors active', value: '18 campus routes' },
    ],
  },
  {
    id: 'step-2',
    stepNumber: '02',
    title: 'Find people heading your way',
    tagline: 'Connect directly with verified student drivers',
    description:
      'Our deterministic detour engine evaluates route overlap, mutual university departments, and driver safety ratings to deliver verified peers with 85%+ trajectory match.',
    specPill: 'Multi-Factor Matching Engine',
    telemetry: [
      { label: 'Matching score', value: '94% match' },
      { label: 'Driver rating', value: '4.9 / 5.0' },
      { label: 'Seat availability', value: '1 to 3 seats' },
    ],
  },
  {
    id: 'step-3',
    stepNumber: '03',
    title: 'Share the journey',
    tagline: 'Secure OTP validation before wheels roll',
    description:
      'Coordinate in real-time with zero phone number exposure. Upon driver arrival, the driver reveals a 4-digit OTP that passenger enters to verify the correct student vehicle.',
    specPill: 'Zero-Leak In-App Protocol',
    telemetry: [
      { label: 'Auth mode', value: '4-Digit OTP' },
      { label: 'Location updates', value: 'Socket.IO Live' },
      { label: 'Emergency share', value: '1-Click SOS' },
    ],
  },
  {
    id: 'step-4',
    stepNumber: '04',
    title: 'Arrive together',
    tagline: 'Direct college drop-off with mutual trust ratings',
    description:
      'Drop off directly at the departmental gate on time. Split fuel costs transparently with zero platform commission or surge multipliers, and leave mutual peer reviews.',
    specPill: 'Zero Surge / Zero Commission',
    telemetry: [
      { label: 'Avg cost saved', value: '₹140 / day' },
      { label: 'CO₂ offset', value: '1.4 kg / trip' },
      { label: 'Community trust', value: '4.9★ verified' },
    ],
  },
];

// Exact vertical positions for the 4 step nodes inside the 456px viewBox
const NODE_CY = [36, 164, 292, 420];

export const RouteStory: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Optional auto-play ticker
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EAECF0] bg-[#F5F6F3] rounded-3xl my-8">
      {/* Editorial Header + Illustration Side-by-Side */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
        {/* Left: Text */}
        <div className="max-w-2xl lg:flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-semibold border border-blue-200/60 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>SECTION 01 / THE JOURNEY SEQUENCE</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-[#101828] uppercase leading-[0.95]">
            Commuting<br />
            Shouldn't Be<br />
            Complicated.
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-[#667085] leading-relaxed max-w-xl">
            CampusRide connects students travelling the same roads at the same time. No unpredictable cab surges. No standing in packed buses. No asking 14 friends on WhatsApp.
          </p>
        </div>
        {/* Right: Illustration */}
        <div className="lg:flex-1 max-w-xl lg:max-w-none">
          <div className="relative rounded-2xl overflow-hidden border border-[#DDE1DE] shadow-xs">
            <img src={routeStoryImg} alt="Aerial view of a winding campus road showing the CampusRide journey" className="w-full h-64 sm:h-72 md:h-80 object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-mono tracking-wide">
              THE JOURNEY SEQUENCE
            </span>
          </div>
        </div>
      </div>

      {/* Signature Continuous Journey Container */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Continuous Vertical SVG Track & Interactive Step Scrubber */}
        <div className="lg:col-span-5 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAECF0] text-xs font-mono text-[#667085]">
            <span>ROUTE RUNWAY: HOME → CAMPUS</span>
            <span className="text-[#175CD3] font-semibold">STEP {STEPS[activeStep].stepNumber} / 04</span>
          </div>

          <div className="relative mt-8 min-h-[460px] flex">
            {/* Continuous SVG Route Line on the left */}
            <div className="relative w-14 sm:w-16 shrink-0 flex justify-center">
              <svg className="h-full w-9 overflow-visible" viewBox="0 0 32 456" fill="none">
                {/* Full background line */}
                <line
                  x1="16"
                  y1={NODE_CY[0]}
                  x2="16"
                  y2={NODE_CY[3]}
                  stroke="#EAECF0"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Active illuminated path: perfectly connects to the active node */}
                <line
                  x1="16"
                  y1={NODE_CY[0]}
                  x2="16"
                  y2={NODE_CY[activeStep]}
                  stroke="#175CD3"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    transition: 'y2 450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />

                {/* Waypoint Nodes */}
                {STEPS.map((_, idx) => {
                  const cy = NODE_CY[idx];
                  const isCurrent = activeStep === idx;
                  const isPassed = activeStep >= idx;
                  return (
                    <g
                      key={idx}
                      transform={`translate(16, ${cy})`}
                      className="cursor-pointer"
                      onClick={() => setActiveStep(idx)}
                    >
                      {/* Outer pulse for current active node */}
                      {isCurrent && (
                        <circle
                          r="15"
                          fill="#175CD3"
                          opacity="0.18"
                          className="animate-ping"
                        />
                      )}
                      {/* Node circle */}
                      <circle
                        r={isCurrent ? '10' : '7'}
                        fill="#FFFFFF"
                        stroke={isPassed ? '#175CD3' : '#D0D5DD'}
                        strokeWidth={isCurrent ? '3.5' : '2'}
                        style={{
                          transition: 'all 300ms ease-out',
                        }}
                      />
                      {isPassed && !isCurrent && <circle r="3.5" fill="#175CD3" />}
                    </g>
                  );
                })}

                {/* Traveling Vehicle Marker: Vector aligned right inside SVG */}
                <g
                  style={{
                    transform: `translate(16px, ${NODE_CY[activeStep]}px)`,
                    transition: 'transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  className="pointer-events-none"
                >
                  <circle
                    r="14"
                    fill="#101828"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fontSize="11"
                    className="select-none"
                  >
                    🚗
                  </text>
                </g>
              </svg>
            </div>

            {/* Step Selection Buttons alongside the track */}
            <div className="flex-1 flex flex-col justify-between py-1 pl-3">
              {STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveStep(idx);
                    }}
                    className={`text-left p-3.5 rounded-xl transition-all border ${
                      isActive
                        ? 'bg-blue-50/70 border-[#175CD3] shadow-sm translate-x-1'
                        : 'border-transparent hover:bg-slate-50 text-[#667085]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded transition-colors ${
                          isActive ? 'bg-[#175CD3] text-white shadow-xs' : 'bg-[#EAECF0] text-[#667085]'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <span className={`text-sm font-bold ${isActive ? 'text-[#101828]' : 'text-[#667085]'}`}>
                        {step.title}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#667085] line-clamp-1">{step.tagline}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAECF0] flex items-center justify-between text-xs text-[#667085]">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F7F8FA] hover:bg-[#EAECF0] font-mono text-[11px] transition-colors"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-blue-600" />
                  <span>Pause tour</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-slate-600" />
                  <span>Auto tour</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                disabled={activeStep === 0}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveStep((p) => Math.max(0, p - 1));
                }}
                className="px-2.5 py-1 rounded bg-[#F7F8FA] hover:bg-[#EAECF0] disabled:opacity-40 font-mono transition-colors"
              >
                ← Prev
              </button>
              <button
                disabled={activeStep === 3}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveStep((p) => Math.min(3, p + 1));
                }}
                className="px-2.5 py-1 rounded bg-[#175CD3] text-white hover:bg-[#1749C2] disabled:opacity-40 font-mono transition-colors shadow-xs"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Telemetry & Interactive State Preview with Smooth Transitions */}
        <div className="lg:col-span-7 bg-[#FFFFFF] p-8 rounded-2xl border border-[#EAECF0] shadow-sm flex flex-col justify-between min-h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="px-3 py-1 rounded-md bg-[#EFF8FF] text-[#175CD3] font-mono text-xs font-semibold border border-[#D1E9FF]">
                  {STEPS[activeStep].specPill}
                </span>
                <span className="text-xs font-mono text-[#667085]">UTTARANCHAL UNIVERSITY COMMUTE NETWORK</span>
              </div>

              <h3 className="mt-6 text-3xl font-black text-[#101828] tracking-tight">
                {STEPS[activeStep].title}
              </h3>
              <p className="mt-2 text-base font-medium text-[#175CD3]">
                {STEPS[activeStep].tagline}
              </p>
              <p className="mt-4 text-base text-[#667085] leading-relaxed">
                {STEPS[activeStep].description}
              </p>

              {/* Technical Telemetry Matrix */}
              <div className="mt-8 grid grid-cols-3 gap-4 p-4 rounded-xl bg-[#F7F8FA] border border-[#EAECF0]">
                {STEPS[activeStep].telemetry.map((t, i) => (
                  <div key={i} className="text-left">
                    <span className="text-[11px] font-mono text-[#667085] uppercase block">{t.label}</span>
                    <span className="text-sm font-bold font-mono text-[#101828] mt-0.5 block">{t.value}</span>
                  </div>
                ))}
              </div>

              {/* Visual Interface Preview Mockup for active step */}
              <div className="mt-8 p-5 rounded-xl border border-[#EAECF0] bg-[#FFFFFF] shadow-2xs">
                {activeStep === 0 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-[#667085]">
                      <span>ORIGIN</span>
                      <span className="text-[#101828] font-bold">Selaqui Hub (Starting Point)</span>
                    </div>
                    <div className="h-px bg-[#EAECF0]" />
                    <div className="flex items-center justify-between text-[#667085]">
                      <span>CAMPUS DEST</span>
                      <span className="text-[#175CD3] font-bold">UU Central Library & UIT Portico</span>
                    </div>
                    <div className="h-px bg-[#EAECF0]" />
                    <div className="flex items-center justify-between text-[#667085]">
                      <span>DEPARTURE TIME</span>
                      <span className="text-[#12B76A] font-bold">08:15 AM (Morning Slot)</span>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#175CD3]/10 text-[#175CD3] flex items-center justify-center font-bold">
                          AK
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#101828] flex items-center gap-1.5">
                            <span>Aditya Kumar</span>
                            <span className="text-xs px-1.5 py-0.2 bg-[#ECFDF3] text-[#027A48] rounded font-mono">
                              UIT '25
                            </span>
                          </div>
                          <div className="text-xs text-[#667085]">Honda City • UK 07 AK 4920</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#12B76A]">94% OVERLAP</div>
                        <div className="text-xs text-[#667085]">2 mins detour</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-3">
                    <div className="p-3 bg-[#101828] text-white rounded-lg flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#12B76A]" />
                        <span className="text-xs text-[#98A2B3]">BOARDING OTP:</span>
                      </div>
                      <div className="text-xl font-bold tracking-widest text-[#12B76A]">4 8 2 1</div>
                    </div>
                    <p className="text-xs text-[#667085]">
                      Driver verifies code before departure. Instant notification triggers to verified emergency contacts.
                    </p>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#027A48] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> COMPLETED AT UIT CAMPUS GATE
                      </span>
                      <span className="text-[#101828] font-bold">₹40 Fuel Contribution</span>
                    </div>
                    <div className="p-3 bg-[#F7F8FA] rounded-lg text-xs text-[#667085]">
                      "Smooth ride, reached right on time for ME102 lecture at UIT!" — Rahul S. (Passenger)
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-[#EAECF0] flex items-center justify-between">
            <span className="text-xs text-[#667085]">Verified campus community only</span>
            <a
              href="#live-map"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#175CD3] hover:text-[#1749C2]"
            >
              <span>Explore live corridor network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const ContinuousRouteStory = RouteStory;

