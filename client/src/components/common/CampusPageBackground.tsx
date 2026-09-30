import React from 'react';

interface CampusPageBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dense' | 'minimal';
}

export const CampusPageBackground: React.FC<CampusPageBackgroundProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#F3F7F4] via-[#F5F8F6] to-[#EDF4F0] text-[#1E2922] relative overflow-hidden font-sans ${className}`}
    >
      {/* Ambient Top Glow Orbs */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-bl from-emerald-100/60 via-teal-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-[360px] h-[360px] bg-gradient-to-tr from-emerald-100/50 via-green-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-50/40 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Micro Dot Pattern for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.75px,transparent_0.75px)] [background-size:32px_32px] opacity-[0.035] pointer-events-none" />

      {/* ============================================================== */}
      {/* BOTTOM-LEFT BOTANICAL LEAF ACCENT (Matches uploaded crop 1)    */}
      {/* ============================================================== */}
      <div className="absolute bottom-0 left-0 pointer-events-none select-none z-0 transform translate-y-3 -translate-x-3 sm:translate-y-0 sm:translate-x-0">
        <svg
          className="w-52 h-52 sm:w-72 sm:h-72 lg:w-84 lg:h-84 text-emerald-800"
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#86BFA0" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#A8D5BA" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#C9E6D5" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6DAF8B" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#97CBB0" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#BDDFC9" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="leafGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#559974" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#7DBF99" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#A4D6B7" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Leaf Blade 1 (Far background large gentle arc) */}
          <path
            d="M -20 340 C 40 250, 100 180, 220 120 C 180 190, 110 270, -20 340 Z"
            fill="url(#leafGrad1)"
          />

          {/* Leaf Blade 2 (Mid-ground fanning leaf pointing diagonally) */}
          <path
            d="M -15 330 C 50 220, 140 140, 290 80 C 230 170, 130 260, -15 330 Z"
            fill="url(#leafGrad2)"
          />

          {/* Leaf Blade 3 (Prominent center leaf matching the screenshot) */}
          <path
            d="M -10 325 C 70 200, 170 120, 310 40 C 240 150, 140 250, -10 325 Z"
            fill="url(#leafGrad3)"
          />

          {/* Leaf Blade 4 (Lower spreading leaf blade) */}
          <path
            d="M -5 320 C 80 230, 190 180, 310 160 C 220 230, 120 280, -5 320 Z"
            fill="url(#leafGrad1)"
          />

          {/* Leaf Blade 5 (Lowest ground leaf) */}
          <path
            d="M 0 310 C 90 270, 180 240, 280 240 C 190 280, 100 300, 0 310 Z"
            fill="url(#leafGrad2)"
          />

          {/* Subtle Central Stem Accent */}
          <path
            d="M -20 340 Q 90 230, 280 70"
            stroke="#478060"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.35"
          />
        </svg>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM-RIGHT BOTANICAL LEAF ACCENT (Matches uploaded crop 2)   */}
      {/* ============================================================== */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none z-0 transform translate-y-3 translate-x-3 sm:translate-y-0 sm:translate-x-0">
        <svg
          className="w-52 h-52 sm:w-72 sm:h-72 lg:w-84 lg:h-84 text-emerald-800 transform -scale-x-100"
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Leaf Blade 1 (Far background large gentle arc) */}
          <path
            d="M -20 340 C 40 250, 100 180, 220 120 C 180 190, 110 270, -20 340 Z"
            fill="url(#leafGrad1)"
          />

          {/* Leaf Blade 2 (Mid-ground fanning leaf pointing diagonally) */}
          <path
            d="M -15 330 C 50 220, 140 140, 290 80 C 230 170, 130 260, -15 330 Z"
            fill="url(#leafGrad2)"
          />

          {/* Leaf Blade 3 (Prominent center leaf matching the screenshot) */}
          <path
            d="M -10 325 C 70 200, 170 120, 310 40 C 240 150, 140 250, -10 325 Z"
            fill="url(#leafGrad3)"
          />

          {/* Leaf Blade 4 (Lower spreading leaf blade) */}
          <path
            d="M -5 320 C 80 230, 190 180, 310 160 C 220 230, 120 280, -5 320 Z"
            fill="url(#leafGrad1)"
          />

          {/* Subtle Central Stem Accent */}
          <path
            d="M -20 340 Q 90 230, 280 70"
            stroke="#478060"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.35"
          />
        </svg>
      </div>

      {/* Floating Micro Leaf Accents in Background */}
      {variant !== 'minimal' && (
        <>
          <div className="absolute top-24 left-1/5 opacity-40 pointer-events-none select-none hidden lg:block">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8 6 6 10 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 10 16 6 12 2Z"
                fill="#A8D5BA"
                transform="rotate(-25 12 12)"
              />
            </svg>
          </div>
          <div className="absolute top-1/2 right-12 opacity-35 pointer-events-none select-none hidden lg:block">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8 6 6 10 6 14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14C18 10 16 6 12 2Z"
                fill="#97CBB0"
                transform="rotate(35 12 12)"
              />
            </svg>
          </div>
        </>
      )}

      {/* Page Content Container */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
