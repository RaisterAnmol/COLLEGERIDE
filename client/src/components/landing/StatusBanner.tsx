import React, { useState, useEffect, useRef } from 'react';
import { Users, Navigation, Car, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

export const StatusBanner: React.FC = () => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animated numbers
  const [students, setStudents] = useState(0);
  const [routes, setRoutes] = useState(0);
  const [activeRides, setActiveRides] = useState(0);
  const [savings, setSavings] = useState(0);

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

  // Number animation ticker when inView
  useEffect(() => {
    if (!inView) return;

    const duration = 1600; // ms
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setStudents(Math.floor(ease * 3842));
      setRoutes(Math.floor(ease * 126));
      setActiveRides(Math.floor(ease * 248));
      setSavings(Math.floor(ease * 184));

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [inView]);

  return (
    <section id="network" ref={containerRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EAECF0]">
      {/* Section Eyebrow */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#175CD3] font-semibold">
            Section 05 / Real-Time Telemetry
          </p>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black text-[#101828] uppercase tracking-tight">
            CampusRide Network.
          </h2>
          <p className="mt-2 text-base text-[#667085]">
            Verified university transit activity across Dehradun, Premnagar & Selaqui campuses.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#027A48] bg-[#ECFDF3] border border-[#D1FADF] px-3.5 py-1.5 rounded-full self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-ping" />
          <span>SOCKET.IO CLUSTER CONNECTED</span>
        </div>
      </div>

      {/* 4 Animated Metric Blocks */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] shadow-sm">
          <span className="text-xs font-mono uppercase text-[#667085] block">Verified Students</span>
          <div className="mt-2 text-4xl sm:text-5xl font-black font-mono text-[#101828] tracking-tight">
            {students.toLocaleString()}
          </div>
          <span className="mt-2 text-[11px] text-[#12B76A] font-mono flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% .edu verified
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] shadow-sm">
          <span className="text-xs font-mono uppercase text-[#667085] block">Active Routes</span>
          <div className="mt-2 text-4xl sm:text-5xl font-black font-mono text-[#175CD3] tracking-tight">
            {routes.toLocaleString()}
          </div>
          <span className="mt-2 text-[11px] text-[#667085] font-mono block">
            Across 14 campus hubs
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] shadow-sm">
          <span className="text-xs font-mono uppercase text-[#667085] block">Weekly Active Rides</span>
          <div className="mt-2 text-4xl sm:text-5xl font-black font-mono text-[#101828] tracking-tight">
            {activeRides.toLocaleString()}
          </div>
          <span className="mt-2 text-[11px] text-[#027A48] font-mono block font-semibold">
            +32% recurring rate
          </span>
        </div>

        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] shadow-sm">
          <span className="text-xs font-mono uppercase text-[#667085] block">Student Fuel Saved</span>
          <div className="mt-2 text-4xl sm:text-5xl font-black font-mono text-[#101828] tracking-tight">
            ₹{(savings / 10).toFixed(1)}L+
          </div>
          <span className="mt-2 text-[11px] text-[#667085] font-mono block">
            Zero platform commission
          </span>
        </div>
      </div>

      {/* Live Campus Network Activity Ticker */}
      <div className="mt-8 p-4 bg-[#FFFFFF] rounded-xl border border-[#EAECF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2.5 text-[#101828]">
          <span className="px-2 py-0.5 rounded bg-[#EFF8FF] text-[#175CD3] font-bold">LIVE FEED</span>
          <span className="text-[#667085]">
            Aditya K. posted ride: <span className="text-[#101828] font-semibold">Premnagar Chowk → Uttaranchal University Gate 1</span> (2 seats open)
          </span>
        </div>
        <span className="text-[#98A2B3] text-[11px] shrink-0">Updated 42 seconds ago</span>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const LiveTelemetryBanner = StatusBanner;

