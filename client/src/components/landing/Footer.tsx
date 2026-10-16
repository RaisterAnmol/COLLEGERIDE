import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car } from 'lucide-react';
import { CampusVehicleMascot } from '../signature/CampusVehicleMascot';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Exact road altitude and pitch angle derived from the SVG road path
// (M 0 108 C 220 95, 420 115, 680 98 S 1020 110, 1200 96 in 1200x120 viewBox)
// Tires touch the asphalt with 0px hover gap across all resolutions and screen widths.
const ROAD_SAMPLES = [
  { p: 0, bottomPct: 10.0, angle: -3.3 },
  { p: 5, bottomPct: 12.3, angle: -2.0 },
  { p: 10, bottomPct: 13.5, angle: -0.9 },
  { p: 15, bottomPct: 13.9, angle: 0.0 },
  { p: 20, bottomPct: 13.7, angle: 0.5 },
  { p: 25, bottomPct: 13.2, angle: 0.7 },
  { p: 30, bottomPct: 12.6, angle: 0.5 },
  { p: 35, bottomPct: 12.3, angle: 0.1 },
  { p: 40, bottomPct: 12.5, angle: -0.5 },
  { p: 45, bottomPct: 13.2, angle: -1.4 },
  { p: 50, bottomPct: 14.8, angle: -2.3 },
  { p: 55, bottomPct: 17.3, angle: -3.4 },
  { p: 60, bottomPct: 20.3, angle: -2.9 },
  { p: 65, bottomPct: 22.3, angle: -1.5 },
  { p: 70, bottomPct: 22.9, angle: 0.0 },
  { p: 75, bottomPct: 22.2, angle: 1.5 },
  { p: 80, bottomPct: 20.5, angle: 2.5 },
  { p: 85, bottomPct: 18.2, angle: 2.3 },
  { p: 90, bottomPct: 16.8, angle: 0.7 },
  { p: 95, bottomPct: 17.2, angle: -1.9 },
  { p: 100, bottomPct: 20.0, angle: 0.0 },
];

export const getRoadAltitude = (percent: number) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const idx = Math.min(ROAD_SAMPLES.length - 2, Math.max(0, Math.floor(clamped / 5)));
  const s0 = ROAD_SAMPLES[idx];
  const s1 = ROAD_SAMPLES[idx + 1];
  const t = (clamped - s0.p) / (s1.p - s0.p);
  const bottomPct = s0.bottomPct + t * (s1.bottomPct - s0.bottomPct);
  const pitchAngle = s0.angle + t * (s1.angle - s0.angle);
  return { bottomPct, pitchAngle };
};

export const Footer: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(38);
  const [isHovered, setIsHovered] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth driving animation loop (60fps requestAnimationFrame, pauses on hover or reduced-motion)
  useEffect(() => {
    if (reducedMotion) return;

    let animId: number;
    let lastTime = performance.now();
    // Pace: ~8-9 seconds for a brisk, lively commute traverse across campus (60fps * 8.5s ~ 510 frames across 112% width)
    const speed = 0.22;

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isHovered && !isCelebrating) {
        setProgress((prev) => {
          const next = prev + speed * (delta / 16.67);
          return next > 106 ? -6 : next;
        });
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [reducedMotion, isHovered, isCelebrating]);

  const handleMascotClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsCelebrating(true);
    setSpeech('Pip: "*Honk honk!* Zero surge on campus! 🚗✨"');

    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
    celebrationTimeoutRef.current = setTimeout(() => {
      setIsCelebrating(false);
      setSpeech(null);
    }, 2800);
  };

  const handleRoadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    setProgress(Math.max(2, Math.min(98, clickX)));
    setSpeech('Pip: Fast-forwarding to this stop! 📍');
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
    celebrationTimeoutRef.current = setTimeout(() => {
      setSpeech(null);
    }, 2200);
  };

  const { bottomPct, pitchAngle } = getRoadAltitude(progress);

  return (
    <footer className="w-full bg-white border-t border-border mt-20 mb-0 pb-0 overflow-hidden">
      {/* Editorial CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center border-b border-border">
        <span className="text-xs font-mono font-bold text-plum uppercase tracking-wider block mb-3">
          CampusRide Commute Transit
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-5xl font-display font-extrabold text-ink-primary max-w-3xl mx-auto leading-tight">
          Where Are You Heading Next?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-ink-secondary max-w-xl mx-auto">
          Skip crowded local buses and erratic auto surge pricing. Connect directly with verified student peers on your campus route today.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/search"
            className="px-8 py-3.5 rounded-control bg-plum hover:bg-plum-hover text-white font-bold text-sm shadow-sm transition-all active:translate-y-0.5 flex items-center gap-2"
          >
            <span>Find your next ride</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/post"
            className="px-8 py-3.5 rounded-control bg-paper hover:bg-white text-ink-primary font-bold text-sm border border-border transition-all active:translate-y-0.5 flex items-center gap-2 shadow-xs"
          >
            <Car className="w-4 h-4 text-plum" />
            <span>Offer your empty seats</span>
          </Link>
        </div>
      </div>

      {/* Directory Columns - Image 4 Institutional Light Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
        <div className="md:col-span-4 pr-0 md:pr-4">
          <div className="flex items-center gap-2 text-base font-bold text-ink-primary mb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#582C4D]" />
            <span className="font-display tracking-tight text-lg text-slate-900">CampusRide</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans mb-4">
            Peer-to-peer verified collegiate mobility network engineered exclusively for university students in Dehradun, Uttarakhand.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% ID-Verified Campus Network</span>
          </div>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-4">
              Active Corridors
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-sans">
              <li>
                <Link to="/search?q=Premnagar" className="hover:text-slate-900 transition-colors">Premnagar ⇄ Bidholi (UPES)</Link>
              </li>
              <li>
                <Link to="/search?q=Clock+Tower" className="hover:text-slate-900 transition-colors">Clock Tower ⇄ Graphic Era (GEU)</Link>
              </li>
              <li>
                <Link to="/search?q=ISBT" className="hover:text-slate-900 transition-colors">ISBT ⇄ DIT University Campus</Link>
              </li>
              <li>
                <Link to="/search?q=Ballupur" className="hover:text-slate-900 transition-colors">Ballupur Chowk ⇄ IMS Unison</Link>
              </li>
              <li>
                <Link to="/search?q=Suddhowala" className="hover:text-slate-900 transition-colors">Suddhowala ⇄ UIT Gate 1</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-4">
              Safety & Security
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-sans">
              <li>
                <Link to="/verification" className="hover:text-slate-900 transition-colors">Mandatory .edu Email Validation</Link>
              </li>
              <li>
                <Link to="/verification" className="hover:text-slate-900 transition-colors">Physical Campus ID Verification</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-slate-900 transition-colors">Real-Time 4-Digit In-Car OTP</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-slate-900 transition-colors">Women-Only Commute Anchor</Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-slate-900 transition-colors">Emergency 112 Protocol Link</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider mb-4">
              Campus Hubs
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-sans">
              <li className="hover:text-slate-900 transition-colors cursor-default">Uttaranchal University (UIT)</li>
              <li className="hover:text-slate-900 transition-colors cursor-default">UPES Bidholi & Kandoli</li>
              <li className="hover:text-slate-900 transition-colors cursor-default">Graphic Era (GEU & GEHU)</li>
              <li className="hover:text-slate-900 transition-colors cursor-default">DIT University Dehradun</li>
              <li className="hover:text-slate-900 transition-colors cursor-default">IMS Unison University</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Legal Line - Image 4 Matching */}
      <div className="border-t border-slate-200 bg-[#FAFAFA] py-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans">
            © 2026 CampusRide Network • Built for student transit in Dehradun, Uttarakhand • <span className="font-bold text-slate-900">₹0 platform fee.</span>
          </p>
          <div className="flex items-center gap-6 font-mono text-[11px] text-slate-500">
            <Link to="/safety" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link to="/safety" className="hover:text-slate-900 transition-colors">Terms of Transit</Link>
            <Link to="/safety" className="hover:text-slate-900 transition-colors">Emergency Protocols</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Backwards-compatible alias
export const ArchitecturalFooter = Footer;
