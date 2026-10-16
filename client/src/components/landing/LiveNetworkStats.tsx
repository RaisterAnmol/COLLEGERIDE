import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, TrendingUp, Users, Navigation } from 'lucide-react';
import { DEMO_STATS } from '../../data/mockData';

export const LiveNetworkStats: React.FC = () => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [students, setStudents] = useState(0);
  const [routes, setRoutes] = useState(0);
  const [activeRides, setActiveRides] = useState(0);
  const [savingsLakhs, setSavingsLakhs] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    const duration = 1500;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      setStudents(Math.floor(ease * DEMO_STATS.verifiedStudents));
      setRoutes(Math.floor(ease * DEMO_STATS.dailyCorridors));
      setActiveRides(Math.floor(ease * DEMO_STATS.weeklyActiveRides));
      setSavingsLakhs(Math.floor(ease * 18.4 * 10) / 10);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [inView]);

  return (
    <section ref={containerRef} className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      {/* Section Eyebrow */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[#143D32] font-semibold block mb-3">
            07 — Live Campus Telemetry
          </span>
          <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
            Network Scale.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#646A67]">
            Real-time mobility data aggregated across participating regional college campuses.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#18A66A] bg-[#ECFDF5] border border-[#D1FAE5] px-3.5 py-1.5 rounded-full self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#18A66A]" />
          <span>REAL-TIME SOCKET.IO TELEMETRY FEED</span>
        </div>
      </div>

      {/* 4 Large Number Blocks */}
      <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <span className="text-xs font-mono uppercase text-[#646A67] block">Students</span>
          <div className="mt-3 text-4xl sm:text-6xl font-black font-mono text-[#111111] tracking-tight">
            {students.toLocaleString()}
          </div>
          <span className="mt-2 text-xs text-[#18A66A] font-mono flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% .edu verified
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <span className="text-xs font-mono uppercase text-[#646A67] block">Routes</span>
          <div className="mt-3 text-4xl sm:text-6xl font-black font-mono text-[#1769FF] tracking-tight">
            {routes.toLocaleString()}
          </div>
          <span className="mt-2 text-xs text-[#646A67] font-mono block">
            Across 14 campus hubs
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <span className="text-xs font-mono uppercase text-[#646A67] block">Active Rides</span>
          <div className="mt-3 text-4xl sm:text-6xl font-black font-mono text-[#111111] tracking-tight">
            {activeRides.toLocaleString()}
          </div>
          <span className="mt-2 text-xs text-[#18A66A] font-mono block font-semibold">
            Weekly scheduled trips
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <span className="text-xs font-mono uppercase text-[#646A67] block">Fuel Saved</span>
          <div className="mt-3 text-4xl sm:text-6xl font-black font-mono text-[#111111] tracking-tight">
            ₹{savingsLakhs.toFixed(1)}L
          </div>
          <span className="mt-2 text-xs text-[#646A67] font-mono block">
            Zero platform commission
          </span>
        </div>
      </div>
    </section>
  );
};

