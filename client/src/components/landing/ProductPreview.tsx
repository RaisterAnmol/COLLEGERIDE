import React, { useState } from 'react';
import { ShieldCheck, Search, Key, Star, Navigation, MapPin } from 'lucide-react';
import { DEMO_FEATURED_RIDES } from '../../data/mockData';
import { DriverCockpitCard } from '../dashboard/DriverCockpitCard';

export const ProductPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'passenger' | 'driver'>('driver');
  const featured = DEMO_FEATURED_RIDES[0];

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      {/* Editorial Header */}
      <div className="max-w-4xl text-center mx-auto">
        <span className="text-xs font-mono text-[#582C4D] font-bold tracking-wider block mb-3 uppercase">
          Application Architecture & Live Cockpit
        </span>
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
          Engineered For Daily Use.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          A high-density, real-time web application built for frictionless peer matching, morning commute telemetry, and authenticated departures.
        </p>

        {/* View Switcher Pills */}
        <div className="mt-8 inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab('driver')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'driver'
                ? 'bg-[#582C4D] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Driver Active Commute Cockpit
          </button>
          <button
            onClick={() => setActiveTab('passenger')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'passenger'
                ? 'bg-[#582C4D] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Passenger Corridor Matching
          </button>
        </div>
      </div>

      {/* Large Browser-Frame Mockup */}
      <div className="mt-12 max-w-5xl mx-auto bg-[#FFFFFF] rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Browser Top Navigation Bar */}
        <div className="bg-[#F8F9FA] px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
            <span className="w-3 h-3 rounded-full bg-[#10B981]/60" />
          </div>

          <div className="px-6 py-1 rounded-md bg-[#FFFFFF] border border-slate-200 text-[11px] font-mono text-slate-600">
            {activeTab === 'driver'
              ? 'https://campusride.edu/dashboard/driver-cockpit'
              : 'https://campusride.edu/search?corridor=premnagar-selaqui-uu'}
          </div>

          <div className="text-[11px] font-mono text-emerald-700 font-bold hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SOCKET.IO SECURE</span>
          </div>
        </div>

        {/* Application View Mockup Body */}
        <div className="p-6 sm:p-8 bg-[#FAFAFA]">
          {activeTab === 'driver' ? (
            <DriverCockpitCard />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#FFFFFF] p-6 rounded-2xl border border-slate-200">
              {/* Left Column: Corridor Search & Filter Card */}
              <div className="md:col-span-5 space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Selected Corridor</span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    Premnagar Chowk ──●── UU Gate 1
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-700 font-bold">
                    ✓ 94% Matching Overlap Detected
                  </div>
                </div>

                {/* Matched Ride Pass */}
                <div className="p-4 rounded-xl bg-white border border-[#582C4D] shadow-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-900">{featured.departureTime}</span>
                    <span className="text-xl font-black text-[#582C4D]">₹{featured.fare}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 pt-3 border-t border-slate-200">
                    <img
                      src={featured.driver.avatar}
                      alt={featured.driver.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <span>{featured.driver.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="text-[11px] text-slate-500">{featured.driver.vehicle?.model}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Tracking & Departure OTP */}
              <div className="md:col-span-7 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-mono">
                  <span className="text-slate-900 font-bold">LIVE TELEMETRY INTERFACE</span>
                  <span className="text-emerald-700 font-bold">ETA: 6 MINS</span>
                </div>

                <div className="my-6 p-4 bg-slate-900 text-white rounded-xl text-center font-mono">
                  <span className="text-[10px] text-slate-400 font-mono font-medium block mb-1">
                    Pickup Validation Token
                  </span>
                  <span className="text-3xl font-black tracking-widest text-emerald-400">
                    4 8 2 1
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Zero phone number exposure • Verified student vehicle
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Departure: 08:15 AM</span>
                  <span className="text-[#582C4D] font-bold">UIT Gate 1: 08:45 AM</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const ProductPreviewMockup = ProductPreview;

