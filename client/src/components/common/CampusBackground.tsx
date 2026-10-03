import React, { useEffect, useState } from 'react';
import './CampusBackground.css';
import campusMapBgImg from '../../assets/illustrations/campus-map-bg.jpg';
import bgHome from '../../assets/illustrations/bg-home.png';
import bgAuth from '../../assets/illustrations/bg-auth.png';
import bgDashboard from '../../assets/illustrations/bg-dashboard.png';
import bgSearch from '../../assets/illustrations/bg-search.png';
import bgPost from '../../assets/illustrations/bg-post.png';
import bgRideDetail from '../../assets/illustrations/bg-ride-detail.png';
import bgVerification from '../../assets/illustrations/bg-verification.png';
import bgAdmin from '../../assets/illustrations/bg-admin.png';
import bgSafety from '../../assets/illustrations/bg-safety.png';
import bgColleges from '../../assets/illustrations/bg-colleges.png';

// ── SVG Route Paths (viewBox 0 0 1000 1000) ────────────────
const PATHS = {
  // Main arterial campus road — sweeping S-curve across viewport
  mainArtery: 'M-100,300 C200,400 300,700 600,600 S800,200 1100,400',
  // Secondary route — vertical connection
  secondaryRoute: 'M400,-100 C300,200 600,500 500,1100',
  // Branch road — short connector in bottom-right
  branchRoute: 'M600,600 C700,800 900,900 1100,850',
  // Tertiary route — diagonal sweep top-right to bottom-left
  tertiaryRoute: 'M1100,100 C800,250 500,400 -50,700',
};

// ── Leaf SVG Shape (reused across multiple elements) ────────
const LeafShape: React.FC<{
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  fill?: string;
  opacity?: number;
}> = ({ x, y, rotate = 0, scale = 1, fill = '#3D8B6E', opacity = 0.6 }) => (
  <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${scale})`}>
    <path
      d="M0,-20 C8,-16 14,-8 14,0 C14,8 8,16 0,20 C-8,16 -14,8 -14,0 C-14,-8 -8,-16 0,-20 Z"
      fill={fill}
      opacity={opacity}
    />
    <line x1="0" y1="-18" x2="0" y2="18" stroke={fill} strokeWidth="0.6" opacity={opacity * 0.7} />
  </g>
);

// ── Branch/Twig SVG cluster ─────────────────────────────────
const LeafBranch: React.FC<{
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
}> = ({ x, y, rotate = 0, scale = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${scale})`}>
    {/* Main stem */}
    <path d="M0,0 C10,-30 20,-55 15,-80" stroke="#3D8B6E" strokeWidth="1.5" fill="none" opacity="0.4" />
    {/* Leaf pairs along stem */}
    <LeafShape x={8} y={-20} rotate={30} scale={0.5} fill="#4A9B7D" opacity={0.45} />
    <LeafShape x={-6} y={-35} rotate={-25} scale={0.4} fill="#3D8B6E" opacity={0.4} />
    <LeafShape x={10} y={-50} rotate={40} scale={0.6} fill="#5AAF8F" opacity={0.35} />
    <LeafShape x={-8} y={-65} rotate={-35} scale={0.45} fill="#4A9B7D" opacity={0.3} />
    <LeafShape x={5} y={-78} rotate={10} scale={0.55} fill="#3D8B6E" opacity={0.35} />
  </g>
);

// ── Map Pin SVG ─────────────────────────────────────────────
const MapPin: React.FC<{
  cx: number;
  cy: number;
  color?: string;
  size?: number;
}> = ({ cx, cy, color = '#F4C95D', size = 1 }) => (
  <g transform={`translate(${cx},${cy}) scale(${size})`}>
    <path
      d="M0,-16 C-9,-16 -16,-9 -16,0 C-16,9 0,20 0,20 C0,20 16,9 16,0 C16,-9 9,-16 0,-16 Z"
      fill={color}
      opacity="0.65"
    />
    <circle cx="0" cy="-2" r="5" fill="#fff" opacity="0.9" />
  </g>
);

// ── Building Silhouette ─────────────────────────────────────
const BuildingSilhouette: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  variant?: 'classical' | 'modern' | 'tower';
  opacity?: number;
}> = ({ x, y, width, height, variant = 'classical', opacity = 0.08 }) => {
  if (variant === 'classical') {
    // Classical building with columns and pediment
    return (
      <g opacity={opacity}>
        <rect x={x} y={y} width={width} height={height} rx={2} fill="#2D6B56" />
        {/* Pediment (triangle roof) */}
        <polygon
          points={`${x - 5},${y} ${x + width / 2},${y - height * 0.35} ${x + width + 5},${y}`}
          fill="#2D6B56"
        />
        {/* Columns */}
        {[0.2, 0.4, 0.6, 0.8].map((pct, i) => (
          <rect
            key={i}
            x={x + width * pct - 1.5}
            y={y + 4}
            width={3}
            height={height - 8}
            rx={1}
            fill="#E8F5EE"
            opacity={0.5}
          />
        ))}
        {/* Dome on top */}
        <ellipse cx={x + width / 2} cy={y - height * 0.3} rx={width * 0.15} ry={height * 0.12} fill="#2D6B56" />
      </g>
    );
  }
  if (variant === 'tower') {
    return (
      <g opacity={opacity}>
        <rect x={x} y={y} width={width} height={height} rx={1} fill="#2D6B56" />
        {/* Spire */}
        <polygon
          points={`${x + width * 0.3},${y} ${x + width / 2},${y - height * 0.5} ${x + width * 0.7},${y}`}
          fill="#2D6B56"
        />
        {/* Clock face */}
        <circle cx={x + width / 2} cy={y + height * 0.25} r={width * 0.2} fill="#E8F5EE" opacity={0.4} />
      </g>
    );
  }
  // Modern
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={width} height={height} rx={3} fill="#2D6B56" />
      {/* Window grid */}
      {[0.2, 0.5, 0.8].map((py, ri) =>
        [0.25, 0.5, 0.75].map((px, ci) => (
          <rect
            key={`${ri}-${ci}`}
            x={x + width * px - 3}
            y={y + height * py - 2}
            width={6}
            height={4}
            rx={0.5}
            fill="#E8F5EE"
            opacity={0.35}
          />
        ))
      )}
    </g>
  );
};

// ── Miniature Car SVG ───────────────────────────────────────
const CarIcon: React.FC<{ fill?: string }> = ({ fill = '#103F34' }) => (
  <svg viewBox="0 0 28 14" width="28" height="14">
    <rect x="2" y="3" width="24" height="9" rx="3.5" fill={fill} />
    <rect x="6" y="4" width="7" height="5" rx="1.2" fill="#E8F8F2" opacity="0.8" />
    <rect x="15" y="4" width="7" height="5" rx="1.2" fill="#E8F8F2" opacity="0.6" />
    {/* Wheels */}
    <circle cx="8" cy="12" r="2" fill="#1A3A2F" />
    <circle cx="20" cy="12" r="2" fill="#1A3A2F" />
  </svg>
);

// ── Floating Leaf (HTML element) ────────────────────────────
const FloatingLeaf: React.FC<{ className: string }> = ({ className }) => (
  <div className={`ambient-leaf ${className}`}>
    <svg width="18" height="24" viewBox="0 0 18 24">
      <path
        d="M9,0 C13,4 16,10 16,16 C16,20 13,24 9,24 C5,24 2,20 2,16 C2,10 5,4 9,0 Z"
        fill="#5AAF8F"
        opacity="0.6"
      />
      <line x1="9" y1="2" x2="9" y2="22" stroke="#3D8B6E" strokeWidth="0.5" opacity="0.4" />
    </svg>
  </div>
);

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export type CampusBackgroundVariant =
  | 'home'
  | 'dashboard'
  | 'auth'
  | 'verification'
  | 'search'
  | 'post'
  | 'rideDetail'
  | 'admin'
  | 'safety'
  | 'colleges';

// Per-page illustrated background image mapping
const VARIANT_BG_IMAGE: Record<CampusBackgroundVariant, string> = {
  home: bgHome,
  auth: bgAuth,
  dashboard: bgDashboard,
  search: bgSearch,
  post: bgPost,
  rideDetail: bgRideDetail,
  verification: bgVerification,
  admin: bgAdmin,
  safety: bgSafety,
  colleges: bgColleges,
};

interface CampusBackgroundProps {
  variant?: CampusBackgroundVariant;
}

export const CampusBackground: React.FC<CampusBackgroundProps> = ({
  variant = 'home',
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Variant-based container class
  const variantClass = `campus-bg-${variant}`;
  const currentBgImage = VARIANT_BG_IMAGE[variant] || bgHome;

  const showBranch = variant !== 'auth';
  const showLeaves = !reducedMotion && (variant === 'home' || variant === 'dashboard' || variant === 'colleges');
  const showVehicles = !reducedMotion && (variant === 'home' || variant === 'search' || variant === 'post');

  return (
    <div className={`campus-bg-container ${variantClass}`} aria-hidden="true">

      {/* ── Base Layer: Illustrated Campus Map Backdrop with smooth fade & Ken Burns motion ── */}
      <div
        key={variant}
        className="campus-bg-backdrop campus-bg-animated"
        style={{ backgroundImage: `url(${currentBgImage})` }}
      />

      {/* ── Dot grid mesh ─────────────────────────────────── */}
      <div className="dot-grid" />

      {/* ── Ambient gradient orbs ─────────────────────────── */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      {variant === 'home' && <div className="ambient-orb orb-3" />}

      {/* ── Layer 1 (Far): Abstract architectural shapes ─── */}
      <div className="campus-layer layer-far">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          {/* Top-right triangular shape */}
          <path d="M700,0 L1000,0 L1000,400 Z" className="abstract-building" />
          {/* Bottom-left triangular shape */}
          <path d="M0,800 L200,1000 L0,1000 Z" className="abstract-building" />
          {/* Mid-right accent */}
          <path d="M850,300 L1000,300 L1000,500 L900,500 Z" className="abstract-building-accent" />

          {/* Building silhouettes scattered */}
          <BuildingSilhouette x={80} y={720} width={65} height={50} variant="classical" opacity={0.06} />
          <BuildingSilhouette x={200} y={830} width={50} height={70} variant="tower" opacity={0.05} />
          <BuildingSilhouette x={750} y={120} width={55} height={45} variant="classical" opacity={0.05} />
          <BuildingSilhouette x={870} y={600} width={60} height={55} variant="modern" opacity={0.04} />
          <BuildingSilhouette x={400} y={860} width={45} height={60} variant="tower" opacity={0.04} />

          {/* Leaf branches in corners */}
          <LeafBranch x={30} y={950} rotate={-20} scale={1.4} />
          <LeafBranch x={120} y={980} rotate={10} scale={1.1} />
          <LeafBranch x={950} y={40} rotate={190} scale={1.2} />
          <LeafBranch x={880} y={920} rotate={-40} scale={1.0} />
          <LeafBranch x={970} y={850} rotate={-60} scale={1.3} />

          {/* Scattered standalone leaves */}
          <LeafShape x={680} y={180} rotate={45} scale={0.8} opacity={0.12} />
          <LeafShape x={320} y={150} rotate={-30} scale={0.6} opacity={0.1} />
          <LeafShape x={550} y={850} rotate={60} scale={0.7} opacity={0.1} />
        </svg>
      </div>

      {/* ── Layer 2 (Mid): Routes, Nodes, Vehicles ───────── */}
      <div className="campus-layer layer-mid">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="route-network"
        >
          <defs>
            {/* Route glow filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Routes */}
          <path d={PATHS.mainArtery} className="route-line main-route" />
          <path d={PATHS.secondaryRoute} className="route-line secondary-route" />
          {showBranch && (
            <path d={PATHS.branchRoute} className="route-line branch-route" />
          )}
          <path d={PATHS.tertiaryRoute} className="route-line tertiary-route" />

          {/* Location Nodes — pulsing circles at route intersections */}
          {/* Node 1: Main intersection */}
          <g>
            
            
          </g>
          {/* Node 2: Secondary junction */}
          <g>
            
            
          </g>
          {/* Node 3: Branch start */}
          {showBranch && (
            <g>
              
              
            </g>
          )}

          {/* Map pins at key locations */}
          
          
          
          

          {/* Vehicles animated along the routes */}
          {showVehicles && (
            <>
              <g className="vehicle-group vehicle-main">
                <animateMotion
                  dur="20s"
                  repeatCount="indefinite"
                  rotate="auto"
                  begin="0s"
                  fill="freeze"
                  keyPoints="0;1"
                  keyTimes="0;1"
                >
                  <mpath href="#mainArteryPath" />
                </animateMotion>
                <rect x="-12" y="-5" width="24" height="10" rx="3.5" fill="#103F34" opacity="0.5" />
                <rect x="-8" y="-3.5" width="7" height="6" rx="1" fill="#E8F8F2" opacity="0.4" />
              </g>

              <g className="vehicle-group vehicle-secondary">
                <animateMotion
                  dur="28s"
                  repeatCount="indefinite"
                  rotate="auto"
                  begin="6s"
                  fill="freeze"
                  keyPoints="0;1"
                  keyTimes="0;1"
                >
                  <mpath href="#secondaryRoutePath" />
                </animateMotion>
                <rect x="-10" y="-4" width="20" height="8" rx="3" fill="#079B7F" opacity="0.4" />
              </g>
            </>
          )}

          {/* Hidden path references for animateMotion */}
          <path id="mainArteryPath" d={PATHS.mainArtery} fill="none" stroke="none" />
          <path id="secondaryRoutePath" d={PATHS.secondaryRoute} fill="none" stroke="none" />
        </svg>
      </div>

      {/* ── Layer 3: Leaf Clusters (corners, botanical) ──── */}
      <div className="campus-layer">
        {/* Bottom-left leaf cluster */}
        <svg className="leaf-cluster-bl" viewBox="0 0 300 300">
          <defs>
            <linearGradient id="cbLeafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5AAF8F" />
              <stop offset="100%" stopColor="#3D8B6E" />
            </linearGradient>
            <linearGradient id="cbLeafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A9B7D" />
              <stop offset="100%" stopColor="#6BC4A0" />
            </linearGradient>
          </defs>
          {/* Large anchor leaf */}
          <path d="M40,280 C60,220 100,180 140,160 C120,200 90,250 40,280 Z" fill="url(#cbLeafGrad1)" />
          <path d="M30,260 C70,200 120,170 170,150 C140,190 100,240 30,260 Z" fill="url(#cbLeafGrad2)" opacity="0.8" />
          <path d="M60,295 C90,250 130,220 180,200 C150,240 110,270 60,295 Z" fill="#5AAF8F" opacity="0.6" />
          <path d="M10,240 C40,190 80,160 120,140 C100,180 60,220 10,240 Z" fill="#3D8B6E" opacity="0.5" />
          {/* Thin leaf veins */}
          <path d="M40,280 C80,240 110,200 140,160" stroke="#2D6B56" strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M30,260 C70,220 120,190 170,150" stroke="#2D6B56" strokeWidth="0.6" fill="none" opacity="0.25" />
        </svg>

        {/* Top-right leaf cluster (mirrored) */}
        <svg className="leaf-cluster-tr" viewBox="0 0 300 300">
          <path d="M40,280 C60,220 100,180 140,160 C120,200 90,250 40,280 Z" fill="#4A9B7D" />
          <path d="M30,260 C70,200 120,170 170,150 C140,190 100,240 30,260 Z" fill="#5AAF8F" opacity="0.7" />
          <path d="M60,295 C90,250 130,220 180,200 C150,240 110,270 60,295 Z" fill="#6BC4A0" opacity="0.5" />
        </svg>

        {/* Bottom-right leaf cluster */}
        <svg className="leaf-cluster-br" viewBox="0 0 300 300">
          <path d="M40,280 C60,220 100,180 140,160 C120,200 90,250 40,280 Z" fill="url(#cbLeafGrad1)" opacity="0.9" />
          <path d="M30,260 C70,200 120,170 170,150 C140,190 100,240 30,260 Z" fill="#5AAF8F" opacity="0.7" />
          <path d="M10,240 C40,190 80,160 120,140 C100,180 60,220 10,240 Z" fill="#3D8B6E" opacity="0.4" />
        </svg>
      </div>

      {/* ── Layer 4 (Near): Floating leaf particles ──────── */}
      {showLeaves && (
        <div className="campus-layer layer-near">
          <FloatingLeaf className="leaf-1" />
          <FloatingLeaf className="leaf-2" />
          <FloatingLeaf className="leaf-3" />
        </div>
      )}
    </div>
  );
};

export default CampusBackground;
