import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const marqueeItems = [
    'CAMPUS',
    'ROUTE',
    'COMMUNITY',
    'COMMUTE',
    'CAMPUSRIDE',
    'MOVE TOGETHER',
    'ZERO SURGE',
    'VERIFIED .EDU',
  ];

  return (
    <>
      {/* Brand Marquee (Section 31) */}
      <div className="py-6 bg-[#FFFFFF] border-y border-[#DDE1DE] overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-8 text-xs font-mono font-black tracking-widest text-[#111111]">
          {marqueeItems.concat(marqueeItems).concat(marqueeItems).map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 shrink-0">
              <span>{item}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
            </div>
          ))}
        </div>
      </div>

      {/* Huge Final CTA Section (Section 26) */}
      <section className="bg-[#101515] text-[#DDE1DE] py-28 md:py-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center">
        {/* Animated Background Route Line connecting the buttons */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <svg className="w-full h-48" viewBox="0 0 1000 200" fill="none">
            <path
              d="M 50 100 C 300 20, 700 180, 950 100"
              stroke="#1769FF"
              strokeWidth="4"
              strokeDasharray="6 8"
              className="route-dash-moving"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-xs font-mono text-[#18A66A] font-semibold block mb-4">
            University Transit Mesh Corridor
          </span>

          <h2 className="text-hero-clamp font-black text-white uppercase tracking-tight leading-none">
            Where<br />
            Are You<br />
            Going?
          </h2>

          <p className="mt-6 text-lg sm:text-xl text-[#98A2B3] max-w-xl mx-auto">
            Your next ride might already be on campus. Direct commutes with verified classmates heading your way.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/search"
              className="px-8 py-4 rounded-xl bg-[#143D32] hover:bg-[#0F2E26] text-white font-semibold text-base shadow-sm transition-colors flex items-center gap-2 active:translate-y-0.5"
            >
              <span>FIND A RIDE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/post"
              className="px-8 py-4 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-semibold text-base border border-white/20 transition-colors flex items-center gap-2 active:translate-y-0.5"
            >
              <Car className="w-4 h-4 text-[#1769FF]" />
              <span>OFFER A RIDE</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};



// Backwards-compatible alias
export const MarqueeAndFinalCTA = FinalCTA;

