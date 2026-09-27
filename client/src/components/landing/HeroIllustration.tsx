import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Search, ShieldCheck, Wallet, Users, Leaf } from "lucide-react";
import heroHome from "../../assets/illustrations/hero-home.jpg";

export const HeroIllustration: React.FC = () => {
  return (
    <section className="relative w-full min-h-[580px] md:min-h-[640px] flex items-center overflow-hidden border-b border-slate-200">
      {/* Background Illustrated Image - 100% crystal clear and vibrant */}
      <img
        src={heroHome}
        alt="Illustrated CampusRide campus scene with students on a sunny day"
        className="absolute inset-0 w-full h-full object-cover object-[70%_center] md:object-center select-none"
      />

      {/* Gentle left-side readability shade only behind the text card */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-transparent md:w-1/2 pointer-events-none" />

      {/* Foreground Hero Content Card */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
        <div className="max-w-xl bg-white/92 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-3xl border border-white/80 shadow-2xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-[#143D32] text-xs font-mono font-bold tracking-wider uppercase mb-5">
            Share Rides · Save Time · Stay Safe
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] leading-[1.1] tracking-tight">
            Your Campus,<br />
            <span className="text-[#143D32]">Better Rides.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            CampusRide connects verified students for safe, affordable, shared commutes — whether you need a ride or have empty seats to offer.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/search"
              className="px-6 py-3.5 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white font-bold text-sm transition-all flex items-center gap-2 group shadow-md hover:shadow-lg"
            >
              <Search className="w-4 h-4" />
              <span>Find a Ride</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/post"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-[#111111] font-bold text-sm border border-slate-300 shadow-sm transition-all flex items-center gap-2"
            >
              <Car className="w-4 h-4 text-[#143D32]" />
              <span>Offer a Ride</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 gap-3 text-slate-700">
            {[
              { icon: ShieldCheck, label: "Verified Students Only" },
              { icon: Wallet, label: "Split Fare, Save Money" },
              { icon: Users, label: "Campus Community" },
              { icon: Leaf, label: "Greener Commutes" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-xs font-semibold"
              >
                <Icon className="w-4 h-4 text-[#143D32] shrink-0" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
