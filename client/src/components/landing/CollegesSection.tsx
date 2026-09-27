import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Building2, ShieldCheck, ArrowRight, Leaf, Users } from 'lucide-react';

export const CollegesSection: React.FC = () => {
  return (
    <section id="for-colleges" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Institutional Editorial Content */}
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block">
            10 — INSTITUTIONAL INFRASTRUCTURE
          </span>
          <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
            Built For<br />
            Campuses,<br />
            Not Just Rides.
          </h2>
          <p className="text-base sm:text-lg text-[#646A67] leading-relaxed">
            Universities struggle with parking bottlenecks, carbon footprints, and late-arrival rates. CampusRide turns uncoordinated student traffic into an intelligent, institutional transport mesh.
          </p>

          <div className="pt-4 space-y-3 font-mono text-xs text-[#111111]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#18A66A]" />
              <span>Campus Transport Insights & Peak Arrival Influx Telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
              <span>32% Reduction in University Gate Traffic & Parking Demand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#18A66A]" />
              <span>Quantifiable Sustainability Reporting for NIRF / NAAC Accreditations</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/colleges"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#143D32] hover:bg-[#0E2C24] text-white text-xs font-mono font-bold shadow-xs transition-colors"
              data-cursor="INSTITUTION"
            >
              <span>Explore university mobility partnerships</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Institutional Mobility Dashboard Preview Mockup */}
        <div className="lg:col-span-6 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#DDE1DE] font-mono text-xs">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1769FF]" />
              <span className="font-bold text-[#111111]">DTU CAMPUS MOBILITY TELEMETRY</span>
            </div>
            <span className="text-[#18A66A] font-bold">ONLINE</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE]">
              <span className="text-[#646A67] block text-[10px] uppercase">Daily Carpools</span>
              <span className="text-xl font-black text-[#111111] mt-1 block">142</span>
              <span className="text-[10px] text-[#18A66A] mt-0.5 block">+18% this month</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE]">
              <span className="text-[#646A67] block text-[10px] uppercase">CO₂ Offset</span>
              <span className="text-xl font-black text-[#18A66A] mt-1 block">14.2 Tons</span>
              <span className="text-[10px] text-[#646A67] mt-0.5 block">Audit certified</span>
            </div>
          </div>

          {/* Peak Transit Arrival Timeline Mockup */}
          <div className="mt-6 p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE]">
            <div className="flex items-center justify-between text-xs font-mono text-[#646A67] mb-2">
              <span>Gate 1 Arrival Influx</span>
              <span className="text-[#111111] font-bold">08:30–08:55 AM Peak</span>
            </div>
            <div className="h-2 w-full bg-[#DDE1DE] rounded-full overflow-hidden">
              <div className="h-full bg-[#1769FF] rounded-full w-4/5" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DDE1DE] flex items-center justify-between text-xs text-[#646A67] font-mono">
            <span>Enclave: Delhi Tech University</span>
            <span className="text-[#1769FF] font-semibold">Protected Domain</span>
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const ForCollegesSection = CollegesSection;

