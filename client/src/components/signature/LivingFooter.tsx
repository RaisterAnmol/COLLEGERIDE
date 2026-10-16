import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, MapPin, ExternalLink, GraduationCap, Phone } from 'lucide-react';
import { CampusVehicleMascot } from './CampusVehicleMascot';

export interface LivingFooterProps {
  className?: string;
}

/**
 * LivingFooter
 * - A memorable, handcrafted illustrated ending for the CampusRide homepage.
 * - Features the Dehradun / Mussoorie Shivalik foothills contour, pine trees,
 *   and an illuminated campus transit road where Pip the Campus EV cruises.
 * - Completely original clean-room SVG art with zero bloated external dependencies.
 * - Clamped to static layout under prefers-reduced-motion.
 */
export const LivingFooter: React.FC<LivingFooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`relative bg-[#143D32] text-white pt-12 pb-8 overflow-hidden select-none ${className}`}
      role="contentinfo"
      aria-label="CampusRide Footer"
    >
      {/* Decorative Foothill SVG Horizon with Campus Road */}
      <div className="relative w-full aspect-[1200/180] max-h-[160px] pointer-events-none mb-6">
        <svg
          viewBox="0 0 1200 180"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
          role="presentation"
        >
          <defs>
            {/* Foothill Gradient */}
            <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E5444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#143D32" stopOpacity="1" />
            </linearGradient>

            {/* Road Glow */}
            <linearGradient id="roadGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Distant Foothills (Mussoorie Shivalik Ridge) */}
          <path
            d="M 0 110 Q 180 70 380 95 T 780 75 Q 980 90 1200 65 L 1200 180 L 0 180 Z"
            fill="url(#hillGrad)"
            opacity="0.4"
          />

          {/* Midground Ridge with Pine Trees */}
          <path
            d="M 0 130 Q 240 100 520 120 T 960 105 Q 1100 125 1200 115 L 1200 180 L 0 180 Z"
            fill="url(#hillGrad)"
            opacity="0.7"
          />

          {/* Pine Trees Silhouette Clusters */}
          <g fill="#0D2B23" opacity="0.85">
            {/* Cluster 1 (Left) */}
            <polygon points="120,135 126,110 132,135" />
            <polygon points="128,137 134,115 140,137" />
            <polygon points="136,138 141,120 146,138" />

            {/* Cluster 2 (Mid-Left) */}
            <polygon points="340,125 346,98 352,125" />
            <polygon points="348,126 354,105 360,126" />

            {/* Cluster 3 (Mid-Right) */}
            <polygon points="760,118 766,92 772,118" />
            <polygon points="768,120 774,99 780,120" />

            {/* Cluster 4 (Right) */}
            <polygon points="1040,122 1046,96 1052,122" />
            <polygon points="1049,124 1055,102 1061,124" />
          </g>

          {/* Campus Clock Tower & Building Silhouette */}
          <g fill="#0B231C" opacity="0.9">
            <rect x="440" y="90" width="22" height="45" rx="2" />
            <polygon points="438,90 451,72 464,90" />
            <circle cx="451" cy="98" r="3.5" fill="#F7F5F0" opacity="0.6" />
          </g>

          {/* The Living Campus Transit Road (Illuminated LED Spine) */}
          <path
            d="M 0 165 C 220 145, 420 175, 680 152 S 1020 168, 1200 150"
            fill="none"
            stroke="#2D6A4F"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Illuminated Center Dashline */}
          <path
            d="M 0 165 C 220 145, 420 175, 680 152 S 1020 168, 1200 150"
            fill="none"
            stroke="url(#roadGlow)"
            strokeWidth="2"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />
        </svg>

        {/* Mascot Driving Along The Campus Road */}
        <div
          className="absolute top-10 left-[48%] -translate-x-1/2 pointer-events-auto cursor-pointer"
          title="Pip the Campus EV on Dehradun Transit Corridor"
        >
          <CampusVehicleMascot
            state="driving"
            size={90}
            showSpeech={false}
          />
        </div>
      </div>

      {/* Footer Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-emerald-900/60">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="font-display font-black text-xl text-white tracking-tight">
                CampusRide
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Verified collegiate carpooling network for Dehradun students. Zero commercial surge pricing. Direct fuel split between classmates.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/50 text-[10px] font-mono text-emerald-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>100% University Verified</span>
            </div>
          </div>

          {/* Corridor Directory */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-display font-bold text-white text-sm">Campus Corridors</h4>
            <ul className="space-y-1.5 text-emerald-200/70">
              <li>Premnagar Chowk ↔ UIT Gate 1</li>
              <li>Suddhowala Hub ↔ DIT Main Quad</li>
              <li>Nanda Ki Chowki ↔ Graphic Era</li>
              <li>Clock Tower ↔ UPES Bidholi</li>
              <li>Ballupur Chowk ↔ IMS Unison</li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-display font-bold text-white text-sm">Verified Hubs</h4>
            <ul className="space-y-1.5 text-emerald-200/80">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Find a Classmate Ride
                </Link>
              </li>
              <li>
                <Link to="/post" className="hover:text-white transition-colors">
                  Offer a Campus Commute
                </Link>
              </li>
              <li>
                <Link to="/verification" className="hover:text-white transition-colors">
                  Student ID Verification
                </Link>
              </li>
              <li>
                <Link to="/colleges" className="hover:text-white transition-colors">
                  Affiliated Uttarakhand Colleges
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">
                  Campus Safety & SOS Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety Helpline */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-display font-bold text-white text-sm">Emergency & Trust</h4>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              Every ride is backed by GPS telemetry and verified student identification.
            </p>
            <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Phone className="w-3.5 h-3.5" />
                <span>National Emergency Helpline</span>
              </div>
              <p className="text-white font-mono font-bold text-sm">112 (India Toll-Free)</p>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-300/70">
          <p>© {new Date().getFullYear()} CampusRide • Handcrafted Campus Atlas Architecture.</p>
          <div className="flex items-center gap-4">
            <Link to="/safety" className="hover:text-white transition-colors">
              Safety Constitution
            </Link>
            <span>•</span>
            <Link to="/colleges" className="hover:text-white transition-colors">
              Colleges
            </Link>
            <span>•</span>
            <span className="font-mono text-[11px] text-amber-300">
              Zero Commercial Markup
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

