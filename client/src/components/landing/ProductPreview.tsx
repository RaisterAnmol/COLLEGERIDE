import React from 'react';
import { ShieldCheck, Search, Key, Star, Navigation, MapPin } from 'lucide-react';
import { DEMO_FEATURED_RIDES } from '../../data/mockData';

export const ProductPreview: React.FC = () => {
  const featured = DEMO_FEATURED_RIDES[0];

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      {/* Editorial Header */}
      <div className="max-w-4xl text-center mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-3">
          11 — APPLICATION ARCHITECTURE
        </span>
        <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
          Engineered For Daily Use.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#646A67] max-w-2xl mx-auto">
          A high-density, real-time web application built for frictionless matching, in-app coordination, and secure departures.
        </p>
      </div>

      {/* Large Browser-Frame Mockup (Section 25) */}
      <div className="mt-14 max-w-5xl mx-auto bg-[#FFFFFF] rounded-2xl border border-[#DDE1DE] shadow-lg overflow-hidden">
        {/* Browser Top Navigation Bar */}
        <div className="bg-[#F5F6F3] px-4 py-3 border-b border-[#DDE1DE] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]/60" />
          </div>

          <div className="px-6 py-1 rounded-md bg-[#FFFFFF] border border-[#DDE1DE] text-[11px] font-mono text-[#646A67]">
            https://campusride.edu/search?corridor=premnagar-selaqui-uu
          </div>

          <div className="text-[11px] font-mono text-[#18A66A] font-semibold hidden sm:block">
            SOCKET.IO SECURE
          </div>
        </div>

        {/* Application View Mockup Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#FFFFFF]">
          {/* Left Column: Corridor Search & Filter Card */}
          <div className="md:col-span-5 space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE]">
              <span className="text-[10px] text-[#646A67] uppercase block">Selected Corridor</span>
              <div className="font-bold text-[#111111] text-sm mt-1">
                Premnagar Chowk ──●── UU Gate 1
              </div>
              <div className="mt-2 text-[11px] text-[#18A66A] font-semibold">
                ✓ 94% Matching Overlap Detected
              </div>
            </div>

            {/* Matched Ride Pass */}
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#1769FF] shadow-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-[#111111]">{featured.departureTime}</span>
                <span className="text-xl font-black text-[#1769FF]">₹{featured.fare}</span>
              </div>
              <div className="mt-3 flex items-center gap-3 pt-3 border-t border-[#DDE1DE]">
                <img
                  src={featured.driver.avatar}
                  alt={featured.driver.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#DDE1DE]"
                />
                <div>
                  <div className="font-bold text-[#111111] flex items-center gap-1">
                    <span>{featured.driver.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#18A66A]" />
                  </div>
                  <div className="text-[11px] text-[#646A67]">{featured.driver.vehicle?.model}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Tracking & Departure OTP */}
          <div className="md:col-span-7 bg-[#F5F6F3] p-6 rounded-xl border border-[#DDE1DE] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE1DE] text-xs font-mono">
              <span className="text-[#111111] font-bold">LIVE TELEMETRY INTERFACE</span>
              <span className="text-[#18A66A] font-bold">ETA: 6 MINS</span>
            </div>

            <div className="my-6 p-4 bg-[#101515] text-white rounded-xl text-center font-mono">
              <span className="text-[10px] text-[#98A2B3] uppercase tracking-widest block mb-1">
                PICKUP VALIDATION TOKEN
              </span>
              <span className="text-3xl font-black tracking-widest text-[#18A66A]">
                4 8 2 1
              </span>
              <span className="text-[10px] text-white/60 block mt-1">
                Zero phone number exposure • Verified student vehicle
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#646A67]">
              <span>Departure: 08:15 AM</span>
              <span className="text-[#1769FF] font-bold">DTU Portico: 08:45 AM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const ProductPreviewMockup = ProductPreview;

