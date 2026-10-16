import React, { useEffect, useRef, useState } from 'react';

export interface RouteStop {
  name: string;
  landmark?: string;
  timeEstimate?: string;
}

export interface RouteThreadProps {
  origin?: string;
  stops?: RouteStop[];
  destination?: string;
  className?: string;
  ariaLabel?: string;
  reducedMotion?: boolean;
}

const DEFAULT_STOPS: RouteStop[] = [
  { name: 'Premnagar Chowk', landmark: 'Market Junction', timeEstimate: 'Start' },
  { name: 'Suddhowala Hub', landmark: 'Student PG Quad', timeEstimate: '+6 min' },
  { name: 'Nanda Ki Chowki', landmark: 'Campus Outer Gate', timeEstimate: '+12 min' },
  { name: 'UIT & USCS Gate 1', landmark: 'Main Academic Quad', timeEstimate: 'Arrival' },
];

export const RouteThread: React.FC<RouteThreadProps> = ({
  stops = DEFAULT_STOPS,
  className = '',
  ariaLabel = 'Dehradun Campus Transit Corridor',
  reducedMotion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawn, setIsDrawn] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReduced =
      reducedMotion !== undefined
        ? reducedMotion
        : typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setIsDrawn(true);
      return;
    }

    setIsDrawn(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDrawn(true);
          observer.disconnect(); // Trigger ONCE only. Never replay or loop.
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-4xl mx-auto py-2 px-1 select-none ${className}`}
      role="region"
      aria-label={ariaLabel}
    >
      {/* SVG Canvas for Route Spine */}
      <div className="relative w-full aspect-[600/120] max-h-[140px]">
        <svg
          viewBox="0 0 600 120"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label={ariaLabel}
        >
          {/* Subtle Vertical Pin Guides to Anchor Labels */}
          <g stroke="var(--line-base, #DDD9CE)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6">
            <line x1="20" y1="85" x2="20" y2="120" />
            <line x1="180" y1="65" x2="180" y2="120" />
            <line x1="380" y1="45" x2="380" y2="120" />
            <line x1="580" y1="75" x2="580" y2="120" />
          </g>

          {/* Subtle Guide Track */}
          <path
            d="M 20 85 C 140 25, 260 115, 380 45 S 520 20, 580 75"
            fill="none"
            stroke="var(--line-base, #DDD9CE)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Illuminated LED Underglow Track */}
          <path
            d="M 20 85 C 140 25, 260 115, 380 45 S 520 20, 580 75"
            fill="none"
            stroke="var(--signal-amber, #D97706)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity={isDrawn ? "0.2" : "0"}
            className="transition-opacity duration-1000"
          />

          {/* Active Drawing Route Thread */}
          <path
            d="M 20 85 C 140 25, 260 115, 380 45 S 520 20, 580 75"
            fill="none"
            stroke="var(--route, #143D32)"
            strokeWidth="3.5"
            strokeLinecap="round"
            pathLength="1"
            style={reducedMotion ? { strokeDashoffset: 0, transition: 'none' } : undefined}
            className={`route-thread-path ${isDrawn ? 'is-drawn' : ''}`}
          />

          {/* Lead Photon Pulse Point at Destination Terminus */}
          <circle
            cx="580"
            cy="75"
            r="4.5"
            className={`fill-[var(--signal-amber,#D97706)] stroke-[var(--surface,#FFFDFC)] stroke-1.5 transition-opacity duration-500 ${
              isDrawn ? 'opacity-95' : 'opacity-0'
            }`}
          />

          {/* Waypoint 1: Origin */}
          <circle
            cx="20"
            cy="85"
            r="6"
            className="fill-[var(--route,#143D32)] stroke-[var(--surface,#FFFDFC)] stroke-2"
          />
          <circle
            cx="20"
            cy="85"
            r="2.5"
            className="fill-[var(--surface,#FFFDFC)]"
          />

          {/* Waypoint 2: Intermediate Stop 1 */}
          <circle
            cx="180"
            cy="65"
            r="5"
            style={reducedMotion ? { transition: 'none' } : undefined}
            className={`fill-[var(--route,#143D32)] stroke-[var(--surface,#FFFDFC)] stroke-2 transition-opacity duration-500 delay-300 ${
              isDrawn ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Waypoint 3: Intermediate Stop 2 */}
          <circle
            cx="380"
            cy="45"
            r="5"
            style={reducedMotion ? { transition: 'none' } : undefined}
            className={`fill-[var(--route,#143D32)] stroke-[var(--surface,#FFFDFC)] stroke-2 transition-opacity duration-500 delay-600 ${
              isDrawn ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Waypoint 4: Destination with Terminus Flag */}
          <circle
            cx="580"
            cy="75"
            r="7"
            style={reducedMotion ? { transition: 'none' } : undefined}
            className={`fill-[var(--route,#143D32)] stroke-[var(--surface,#FFFDFC)] stroke-2 transition-opacity duration-500 delay-900 ${
              isDrawn ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <circle
            cx="580"
            cy="75"
            r="3"
            className="fill-[var(--surface,#FFFDFC)]"
          />
        </svg>
      </div>

      {/* Semantic Waypoint Labels - Dedicated Row Below SVG to eliminate text collisions */}
      <div className="w-full mt-3 flex justify-between items-start text-xs font-sans px-1">
        {stops.map((stop, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              idx === 0
                ? 'items-start text-left'
                : idx === stops.length - 1
                ? 'items-end text-right'
                : 'items-center text-center'
            }`}
            style={{ maxWidth: '24%' }}
          >
            <span className="font-semibold text-ink-primary leading-tight line-clamp-1">
              {stop.name}
            </span>
            {stop.landmark && (
              <span className="text-[11px] text-ink-secondary hidden sm:inline leading-tight mt-0.5">
                {stop.landmark}
              </span>
            )}
            {stop.timeEstimate && (
              <span className="font-mono text-[10px] text-route font-semibold mt-1 px-1.5 py-0.5 rounded bg-route-pale inline-block">
                {stop.timeEstimate}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

