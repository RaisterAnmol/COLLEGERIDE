import React, { useState, useEffect } from 'react';

export interface CampusVehicleMascotProps {
  /** Interaction state of the vehicle mascot */
  state?: 'idle' | 'driving' | 'celebrating' | 'waiting';
  /** Size in pixels (default: 120) */
  size?: number;
  /** Whether to show speech balloon */
  showSpeech?: boolean;
  /** Optional custom speech text */
  speechText?: string;
  /** Whether to show status label pill underneath vehicle */
  showLabel?: boolean;
  /** Click callback */
  onClick?: () => void;
  /** Optional className */
  className?: string;
}

/**
 * CampusVehicleMascot ("Pip" the Campus EV Mascot)
 * - Cheerful, compact campus electric hatchback designed in the Campus Atlas aesthetic.
 * - Warm Forest Green (#143D32) and Signal Amber (#D97706) livery with cream cab.
 * - Interactive micro-interactions: headlight blink on click, suspension settle, spinning directional hubcaps.
 * - States:
 *   - 'idle': gentle breathing, headlights warm
 *   - 'driving': forward suspension rake, wheel spin, speed dust motes
 *   - 'celebrating': celebratory hop, headlight flash, sparkle stars
 *   - 'waiting': parked beside a campus bus stop milestone
 * - Pure SVG + CSS, zero runtime bloat, fully accessible with prefers-reduced-motion.
 */
export const CampusVehicleMascot: React.FC<CampusVehicleMascotProps> = ({
  state = 'idle',
  size = 130,
  showSpeech = false,
  speechText,
  showLabel = true,
  onClick,
  className = '',
}) => {
  const [isWinking, setIsWinking] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Periodic headlight winks
  useEffect(() => {
    const interval = setInterval(() => {
      setIsWinking(true);
      setTimeout(() => setIsWinking(false), 240);
    }, 4800 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setIsWinking(true);
    setClickCount((c) => c + 1);
    setTimeout(() => setIsWinking(false), 300);
    onClick?.();
  };

  const defaultSpeech =
    speechText ||
    (state === 'celebrating'
      ? 'Pip: "Ride locked in! Time to hit the road! ⚡"'
      : state === 'driving'
      ? 'Pip: "Cruising down the Premnagar corridor! 🚗"'
      : state === 'waiting'
      ? 'Pip: "Waiting at the campus pickup bay... 🚏"'
      : clickCount > 0
      ? 'Pip: "*Honk honk!* Zero surge pricing here! ✨"'
      : 'Pip • Campus EV Mascot');

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{ width: size }}
      role="img"
      aria-label={`CampusRide Vehicle Mascot in ${state} mode`}
    >
      {/* Speech Balloon */}
      {showSpeech && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-30 max-w-[85vw]">
          <div className="relative px-3 py-1 rounded-full bg-paper border border-line-base shadow-subtle text-[11px] font-mono font-bold text-ink-primary whitespace-nowrap truncate max-w-[260px] sm:max-w-none">
            {defaultSpeech}
            {/* Balloon triangle tail */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-paper"
            />
          </div>
        </div>
      )}

      {/* SVG Canvas for Tiny Car Mascot */}
      <button
        type="button"
        onClick={handleClick}
        className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-2xl p-1"
        title="Click Pip the Campus EV!"
      >
        <svg
          viewBox="0 0 160 110"
          className="w-full h-auto overflow-visible"
          style={{ width: size, height: (size * 110) / 160 }}
        >
          <defs>
            {/* Headlight beam gradient */}
            <linearGradient id="headlightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>

            {/* Car body sheen gradient */}
            <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E5444" />
              <stop offset="100%" stopColor="#143D32" />
            </linearGradient>

            {/* Cab cream gradient */}
            <linearGradient id="cabGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFDFC" />
              <stop offset="100%" stopColor="#F7F5F0" />
            </linearGradient>
          </defs>

          {/* Road shadow under vehicle */}
          <ellipse
            cx="80"
            cy="98"
            rx={state === 'celebrating' ? '46' : '56'}
            ry="6"
            className="fill-slate-900/15 transition-all duration-300"
          />

          {/* Waiting State: Bus stop signpost */}
          {state === 'waiting' && (
            <g transform="translate(18, 20)">
              {/* Pole */}
              <line x1="8" y1="12" x2="8" y2="76" stroke="#857F6B" strokeWidth="2.5" strokeLinecap="round" />
              {/* Circular stop sign */}
              <circle cx="8" cy="12" r="11" fill="#143D32" stroke="#FFFDFC" strokeWidth="2" />
              <text x="8" y="15" textAnchor="middle" fill="#FFFDFC" fontSize="9" fontWeight="bold" fontFamily="monospace">
                BUS
              </text>
            </g>
          )}

          {/* Celebrating State: Confetti sparkles */}
          {state === 'celebrating' && (
            <g className="animate-in fade-in duration-300">
              <path d="M 32 20 L 36 24 L 32 28 L 28 24 Z" fill="#D97706" />
              <path d="M 125 18 L 129 22 L 125 26 L 121 22 Z" fill="#10B981" />
              <path d="M 80 8 L 83 12 L 80 16 L 77 12 Z" fill="#F59E0B" />
              <circle cx="48" cy="14" r="2.5" fill="#3B82F6" />
              <circle cx="112" cy="12" r="2.5" fill="#EC4899" />
            </g>
          )}

          {/* Headlight Beams (Forward projection) */}
          <polygon
            points="128,68 160,56 160,82 128,74"
            fill="url(#headlightBeam)"
            opacity={isWinking ? 0.2 : 0.85}
            className="transition-opacity duration-150 pointer-events-none"
          />

          {/* Main Vehicle Group (Subject to celebration hop or driving tilt) */}
          <g
            transform={
              state === 'celebrating'
                ? 'translate(0, -8)'
                : state === 'driving'
                ? 'rotate(-1.5 80 80)'
                : 'translate(0, 0)'
            }
            className="transition-transform duration-300"
          >
            {/* Lower Body Main Shell */}
            <rect
              x="30"
              y="56"
              width="100"
              height="28"
              rx="10"
              fill="url(#carBodyGrad)"
              stroke="#0D2B23"
              strokeWidth="2"
            />

            {/* Signal Amber Racing Accent Line */}
            <path
              d="M 32 70 Q 80 71 128 70"
              fill="none"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Greenhouse / Upper Cab (Cream paper tone) */}
            <path
              d="M 46 56 L 58 34 Q 62 31 68 31 L 96 31 Q 102 31 106 34 L 118 56 Z"
              fill="url(#cabGrad)"
              stroke="#0D2B23"
              strokeWidth="2"
            />

            {/* Windshield Glass & Reflection */}
            <path
              d="M 86 35 L 95 35 Q 100 35 103 37 L 114 54 L 86 54 Z"
              fill="#93C5FD"
              opacity="0.75"
            />
            {/* Rear Window */}
            <path
              d="M 50 54 L 60 37 Q 63 35 68 35 L 82 35 L 82 54 Z"
              fill="#93C5FD"
              opacity="0.65"
            />

            {/* Student Visor in Windshield */}
            <path
              d="M 88 38 L 102 38"
              stroke="#143D32"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Front Headlight (Round friendly lamp) */}
            <circle
              cx="126"
              cy="68"
              r="6.5"
              fill={isWinking ? '#78350F' : '#FEF08A'}
              stroke="#D97706"
              strokeWidth="1.5"
            />
            <circle
              cx="126"
              cy="68"
              r="3"
              fill={isWinking ? '#92400E' : '#FFFFFF'}
            />

            {/* Tail Light (Emergency Crimson Ruby) */}
            <rect
              x="28"
              y="62"
              width="4.5"
              height="9"
              rx="2"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="1"
            />

            {/* Door Handle */}
            <rect
              x="76"
              y="61"
              width="9"
              height="2.5"
              rx="1.2"
              fill="#857F6B"
            />

            {/* Electric Leaf Emblem on Door */}
            <g transform="translate(62, 60)">
              <circle cx="5" cy="5" r="5" fill="#EDF5F2" />
              <path
                d="M 3 6 C 3 3, 7 3, 7 6 C 7 7.5, 4 8, 3 6 Z"
                fill="#143D32"
              />
            </g>

            {/* Bumper Corner Guards */}
            <rect x="27" y="74" width="6" height="5" rx="2" fill="#374151" />
            <rect x="127" y="74" width="6" height="5" rx="2" fill="#374151" />

            {/* Rear Wheel Arch & Wheel */}
            <g transform="translate(48, 84)">
              <circle cx="0" cy="0" r="14" fill="#1F2937" stroke="#111827" strokeWidth="2" />
              <circle cx="0" cy="0" r="7.5" fill="#E5E7EB" />
              <circle cx="0" cy="0" r="3" fill="#143D32" />
              {/* Wheel Spokes for spin effect */}
              <line
                x1="-6"
                y1="0"
                x2="6"
                y2="0"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                className={state === 'driving' ? 'cr-spinner' : ''}
                style={{ transformOrigin: '0 0' }}
              />
              <line
                x1="0"
                y1="-6"
                x2="0"
                y2="6"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                className={state === 'driving' ? 'cr-spinner' : ''}
                style={{ transformOrigin: '0 0' }}
              />
            </g>

            {/* Front Wheel Arch & Wheel */}
            <g transform="translate(108, 84)">
              <circle cx="0" cy="0" r="14" fill="#1F2937" stroke="#111827" strokeWidth="2" />
              <circle cx="0" cy="0" r="7.5" fill="#E5E7EB" />
              <circle cx="0" cy="0" r="3" fill="#143D32" />
              {/* Wheel Spokes for spin effect */}
              <line
                x1="-6"
                y1="0"
                x2="6"
                y2="0"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                className={state === 'driving' ? 'cr-spinner' : ''}
                style={{ transformOrigin: '0 0' }}
              />
              <line
                x1="0"
                y1="-6"
                x2="0"
                y2="6"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                className={state === 'driving' ? 'cr-spinner' : ''}
                style={{ transformOrigin: '0 0' }}
              />
            </g>
          </g>

          {/* Driving State: Road speed dust motes */}
          {state === 'driving' && (
            <g transform="translate(10, 88)">
              <circle cx="0" cy="0" r="2.5" fill="#D1D5DB" opacity="0.6" />
              <circle cx="-8" cy="2" r="1.8" fill="#D1D5DB" opacity="0.4" />
              <circle cx="-16" cy="1" r="1.2" fill="#D1D5DB" opacity="0.2" />
            </g>
          )}
        </svg>
      </button>

      {/* Mascot Label Pill */}
      {showLabel && (
        <span className="mt-1 text-[10px] font-mono font-semibold text-slate-500">
          {state === 'celebrating'
            ? '🎉 Commute Confirmed'
            : state === 'driving'
            ? '⚡ Zero Surge Commute'
            : state === 'waiting'
            ? '🚏 Campus Pickup Bay'
            : 'CampusRide EV • Pip'}
        </span>
      )}
    </div>
  );
};
