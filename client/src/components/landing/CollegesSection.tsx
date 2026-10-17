import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Building2, ShieldCheck, ArrowRight, Leaf, Users } from 'lucide-react';
// Photorealistic Campus Infrastructure & Telemetry
const campusesHeroImg = '/campus-students.jpg';

export const CollegesSection: React.FC = () => {
  return (
    <section id="for-colleges" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Left Side: Institutional Editorial Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 space-y-6 text-left"
        >
          <span className="text-xs font-mono text-purple-900 font-black bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-block">
            Campus Infrastructure & Data
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
            Built For Campuses, <br />
            Not Just Rides.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Universities struggle with parking bottlenecks, carbon footprints, and late-arrival rates. CampusRide turns uncoordinated student traffic into an intelligent, institutional transport mesh.
          </p>

          <div className="pt-2 space-y-3 font-mono text-xs text-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span className="font-semibold">Campus Transport Insights & Peak Arrival Influx Telemetry</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-700 shrink-0" />
              <span className="font-semibold">32% Reduction in University Gate Traffic & Parking Demand</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span className="font-semibold">Quantifiable Sustainability Reporting for NIRF / NAAC Accreditations</span>
            </div>
          </div>

          <div className="pt-3">
            <Link
              to="/colleges"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-purple-800 hover:bg-purple-900 text-white text-xs font-mono font-black shadow-md neu-btn transition-all"
              data-cursor="INSTITUTION"
            >
              <span>Explore university mobility partnerships</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Tactile Neumorphic Mobility Telemetry Console */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
        >
          {/* Photorealistic Campus Quad Photo Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 mb-6 shadow-sm group">
            <img
              src={campusesHeroImg}
              alt="Authentic university campus students and transit quad"
              width={640}
              height={208}
              className="w-full h-48 sm:h-52 object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/campus-hero-real.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono drop-shadow">
              <span className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold">Uttaranchal, UPES, DIT, GEU Transit Network</span>
              </span>
              <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-black text-[10px] shadow-sm">
                ACTIVE ENCLAVE
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-100 font-mono text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight">UU CAMPUS MOBILITY TELEMETRY</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-emerald-800 font-black text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE FEED</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3.5 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-white border border-blue-200/90 shadow-xs hover:shadow-md transition-shadow">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Daily Carpools</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">142</span>
              <span className="text-[11px] text-emerald-700 mt-1 block font-extrabold flex items-center gap-1">
                <span>↑</span> +18% this month
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-white border border-emerald-200/90 shadow-xs hover:shadow-md transition-shadow">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">CO₂ Offset</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">14.2 Tons</span>
              <span className="text-[11px] text-slate-600 mt-1 block font-bold">Audit certified</span>
            </div>
          </div>

          {/* Peak Transit Arrival Timeline Mockup */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 mb-2">
              <span className="font-bold">Gate 1 Arrival Influx</span>
              <span className="text-slate-900 font-extrabold bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                08:30–08:55 AM Peak
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full w-4/5 animate-pulse" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>Enclave: Uttaranchal University</span>
            <span className="text-blue-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Protected Domain</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const ForCollegesSection = CollegesSection;

