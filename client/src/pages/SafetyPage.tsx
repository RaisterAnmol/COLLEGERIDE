import React from 'react';
import { ShieldCheck, Key, Lock, PhoneCall, AlertCircle, CheckCircle2, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeroBanner } from '../components/common/PageHeroBanner';
import safetyHeroImg from '../assets/illustrations/safety-hero.jpg';
import womenSafeImg from '../assets/illustrations/women-safe-ride.jpg';

export const SafetyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6F3] text-[#111111] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <PageHeroBanner image={safetyHeroImg} alt="Student holding verified ID card on campus" caption="YOUR SAFETY, OUR PRIORITY" />

      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-3">
          CAMPUSRIDE SAFETY ARCHITECTURE
        </span>
        <h1 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
          The Journey<br />
          Should Feel Safe.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#646A67] leading-relaxed">
          Unlike anonymous commercial ride apps, CampusRide is a verified campus community. Safety is engineered into every stage of the commute.
        </p>
      </div>

      {/* Safety Matrix */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1769FF] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">1. University Identity Verification</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Every account requires an authenticated university email domain (.edu or .ac.in) and mandatory student ID badge verification. No anonymous or commercial drivers.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#18A66A] flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">2. 4-Digit Departure OTP</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Upon pickup, the driver's phone presents a unique 4-digit token. The passenger validates it in-app to confirm the right vehicle before the journey starts.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DDE1DE] shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">3. Emergency Circles & Live SOS</h3>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Link emergency contacts (parents, hostel wardens, or campus security). 1-click in-app SOS immediately broadcasts your live vehicle coordinates and trip details.
          </p>
        </div>
      </div>

      {/* Women-Only Commute Section */}
      <div className="mt-12 bg-[#FFFFFF] p-8 sm:p-12 rounded-2xl border border-[#DDE1DE] shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-mono uppercase text-[#18A66A] font-bold">DEDICATED SAFETY FILTER</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">Women-Only University Carpools</h2>
          <p className="text-sm text-[#646A67] leading-relaxed">
            Female students can enable our strict Women-Only preference, filtering rides exclusively for verified female drivers and female classmates.
          </p>
        </div>
        <Link
          to="/search"
          className="px-6 py-3.5 rounded-xl bg-[#18A66A] hover:bg-[#166534] text-white font-semibold text-sm shadow-xs transition-colors shrink-0"
        >
          View Women-Only Corridors →
        </Link>
      </div>
    </div>
  );
};

