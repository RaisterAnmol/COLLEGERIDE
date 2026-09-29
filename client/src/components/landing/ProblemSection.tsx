import React, { useRef } from 'react';
import { Clock, TrendingDown, ShieldCheck, ArrowRight } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Giant Typography Editorial Statement */}
        <div className="lg:col-span-7">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-4">
            01 — THE DAILY COMMUTE
          </span>
          <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
            Getting To Campus<br />
            Shouldn't Be<br />
            The Hard Part.
          </h2>
          <p className="mt-8 text-lg sm:text-xl text-[#646A67] leading-relaxed max-w-xl">
            Students already travel the same roads every day. CampusRide connects verified classmates heading the same direction so they can travel together.
          </p>
          <div className="mt-8 flex items-center gap-6 text-sm font-mono text-[#111111]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#18A66A]" />
              <span>No erratic surge pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1769FF]" />
              <span>No standing in packed buses</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Mobility Comparison Grid */}
        <div className="lg:col-span-5 bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-6">
          <div className="border-b border-[#DDE1DE] pb-4">
            <span className="text-xs font-mono uppercase text-[#646A67]">Daily Commuter Benchmark</span>
            <h3 className="text-xl font-bold text-[#111111] mt-1">Direct Campus Corridors vs Public Transit</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFFFFF] flex items-center justify-center text-[#1769FF] border border-[#DDE1DE]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111111]">Time Reclaimed</div>
                  <div className="text-xs text-[#646A67]">Direct carpool vs multiple Vikram/bus transfers</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-black text-[#1769FF]">38 mins</span>
                <span className="text-[10px] text-[#646A67] block">saved / commute</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFFFFF] flex items-center justify-center text-[#18A66A] border border-[#DDE1DE]">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111111]">Cost Efficiency</div>
                  <div className="text-xs text-[#646A67]">True fuel split vs ride-hailing cabs</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-black text-[#18A66A]">68%</span>
                <span className="text-[10px] text-[#646A67] block">lower expense</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FFFFFF] flex items-center justify-center text-[#111111] border border-[#DDE1DE]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#111111]">Identity Verification</div>
                  <div className="text-xs text-[#646A67]">University email & student badge</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-black text-[#111111]">100%</span>
                <span className="text-[10px] text-[#646A67] block">verified peers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const DailyCommuteProblem = ProblemSection;

