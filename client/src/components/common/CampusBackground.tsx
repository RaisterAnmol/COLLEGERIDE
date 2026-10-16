import React from 'react';
import './CampusBackground.css';
import bgHome from '../../assets/illustrations/bg-home.webp';
import bgAuth from '../../assets/illustrations/bg-auth.webp';
import bgDashboard from '../../assets/illustrations/bg-dashboard.webp';
import bgSearch from '../../assets/illustrations/bg-search.webp';
import bgPost from '../../assets/illustrations/bg-post.webp';
import bgRideDetail from '../../assets/illustrations/bg-ride-detail.webp';
import bgVerification from '../../assets/illustrations/bg-verification.webp';
import bgAdmin from '../../assets/illustrations/bg-admin.webp';
import bgSafety from '../../assets/illustrations/bg-safety.webp';
import bgColleges from '../../assets/illustrations/bg-colleges.webp';

// ── SVG Route Paths (viewBox 0 0 1000 1000) ────────────────
const PATHS = {
  // Main arterial campus road — sweeping Dehradun corridor line
  mainArtery: 'M-100,300 C200,400 300,700 600,600 S800,200 1100,400',
  // Secondary route — vertical connector
  secondaryRoute: 'M400,-100 C300,200 600,500 500,1100',
  // Branch road — campus perimeter connector
  branchRoute: 'M600,600 C700,800 900,900 1100,850',
  // Tertiary route — quiet diagonal sweep
  tertiaryRoute: 'M1100,100 C800,250 500,400 -50,700',
};

// ── Leaf SVG Shape (botanical texture) ───────────────────────
const LeafShape: React.FC<{
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  fill?: string;
  opacity?: number;
}> = ({ x, y, rotate = 0, scale = 1, fill = '#3D8B6E', opacity = 0.35 }) => (
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
    <path d="M0,0 C10,-30 20,-55 15,-80" stroke="#3D8B6E" strokeWidth="1.2" fill="none" opacity="0.25" />
    <LeafShape x={8} y={-20} rotate={30} scale={0.5} fill="#4A9B7D" opacity={0.3} />
    <LeafShape x={-6} y={-35} rotate={-25} scale={0.4} fill="#3D8B6E" opacity={0.25} />
    <LeafShape x={10} y={-50} rotate={40} scale={0.6} fill="#5AAF8F" opacity={0.2} />
    <LeafShape x={-8} y={-65} rotate={-35} scale={0.45} fill="#4A9B7D" opacity={0.2} />
    <LeafShape x={5} y={-78} rotate={10} scale={0.55} fill="#3D8B6E" opacity={0.2} />
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
}> = ({ x = 0, y = 0, width = 60, height = 40, variant = 'classical', opacity = 0.05 }) => {
  const safeWidth = Number(width) || 60;
  const safeHeight = Number(height) || 40;
  const safeX = Number(x) || 0;
  const safeY = Number(y) || 0;

  if (variant === 'classical') {
    return (
      <g opacity={opacity}>
        <rect x={safeX} y={safeY} width={safeWidth} height={safeHeight} rx={2} fill="#2D6B56" />
        <polygon
          points={`${safeX - 4},${safeY} ${safeX + safeWidth / 2},${safeY - 14} ${safeX + safeWidth + 4},${safeY}`}
          fill="#1A5C4A"
        />
      </g>
    );
  }

  if (variant === 'tower') {
    return (
      <g opacity={opacity}>
        <rect x={safeX} y={safeY} width={safeWidth} height={safeHeight} rx={1} fill="#1E5C46" />
        <polygon
          points={`${safeX},${safeY} ${safeX + safeWidth / 2},${safeY - 18} ${safeX + safeWidth},${safeY}`}
          fill="#143D32"
        />
      </g>
    );
  }

  return (
    <g opacity={opacity}>
      <rect x={safeX} y={safeY} width={safeWidth} height={safeHeight} rx={3} fill="#2D6B56" />
    </g>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT — Campus Atlas Static Canvas
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
  const variantClass = `campus-bg-${variant}`;
  const currentBgImage = VARIANT_BG_IMAGE[variant] || bgHome;
  const showBranch = variant !== 'auth';

  return (
    <div className={`campus-bg-container ${variantClass}`} aria-hidden="true">
      {/* ── Base Layer: Subtle institutional backdrop illustration ── */}
      <div
        className="campus-bg-backdrop"
        style={{ backgroundImage: `url(${currentBgImage})` }}
      />

      {/* ── Dot grid mesh ─────────────────────────────────── */}
      <div className="dot-grid" />

      {/* ── Layer 1 (Far): Abstract architectural silhouettes ─── */}
      <div className="campus-layer layer-far">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          {/* Top-right corner architectural shape */}
          <path d="M700,0 L1000,0 L1000,400 Z" className="abstract-building" />
          {/* Bottom-left corner architectural shape */}
          <path d="M0,800 L200,1000 L0,1000 Z" className="abstract-building" />
          {/* Mid-right accent */}
          <path d="M850,300 L1000,300 L1000,500 L900,500 Z" className="abstract-building-accent" />

          {/* Quiet campus silhouettes */}
          <BuildingSilhouette x={80} y={720} width={65} height={50} variant="classical" opacity={0.04} />
          <BuildingSilhouette x={200} y={830} width={50} height={70} variant="tower" opacity={0.03} />
          <BuildingSilhouette x={750} y={120} width={55} height={45} variant="classical" opacity={0.03} />
          <BuildingSilhouette x={870} y={600} width={60} height={55} variant="modern" opacity={0.03} />
          <BuildingSilhouette x={400} y={860} width={45} height={60} variant="tower" opacity={0.03} />

          {/* Corner foliage accents */}
          <LeafBranch x={30} y={950} rotate={-20} scale={1.2} />
          <LeafBranch x={950} y={40} rotate={190} scale={1.1} />
        </svg>
      </div>

      {/* ── Layer 2 (Mid): Clean, Authentic, Static Campus Routes & Nodes ── */}
      <div className="campus-layer layer-mid">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="route-network"
        >
          {/* Static Route Lines */}
          <path d={PATHS.mainArtery} className="route-line main-route" />
          <path d={PATHS.secondaryRoute} className="route-line secondary-route" />
          {showBranch && (
            <path d={PATHS.branchRoute} className="route-line branch-route" />
          )}
          <path d={PATHS.tertiaryRoute} className="route-line tertiary-route" />

          {/* Static Campus Location Nodes */}
          {/* Node 1: Uttaranchal University (Premnagar / UIT Gate 1 junction) */}
          <g>
            <circle cx="600" cy="600" r="14" className="node-static-ring" />
            <circle cx="600" cy="600" r="5" className="node-core" />
          </g>

          {/* Node 2: Suddhowala corridor junction */}
          <g>
            <circle cx="500" cy="500" r="12" className="node-static-ring" />
            <circle cx="500" cy="500" r="4" className="node-core" />
          </g>

          {/* Node 3: Nanda Ki Chowki connecting waypoint */}
          {showBranch && (
            <g>
              <circle cx="700" cy="800" r="10" className="node-static-ring" />
              <circle cx="700" cy="800" r="3.5" className="node-core" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default CampusBackground;
