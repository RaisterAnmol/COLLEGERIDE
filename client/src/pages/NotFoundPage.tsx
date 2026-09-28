import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  ArrowLeft, 
  Search, 
  PlusCircle, 
  Home, 
  ShieldCheck, 
  School,
  AlertTriangle
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient background dots & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10 space-y-8">
        {/* Top 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Error 404 • Commute Stop Not Found</span>
        </div>

        {/* Big Stylized 404 Graphic */}
        <div className="relative select-none py-2">
          <div className="text-8xl sm:text-9xl font-black tracking-tighter text-slate-200">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#143D32] to-[#10B981] text-white flex items-center justify-center shadow-xl shadow-emerald-900/20 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <Compass className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Looks like you've gone off-route!
          </h1>
          <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            The page, carpool schedule, or stop you are trying to reach doesn't exist or may have departed for campus already.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Go Back</span>
          </button>

          <Link
            to="/search"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Find a Campus Ride</span>
          </Link>

          <Link
            to="/"
            className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Campus Home</span>
          </Link>

          <Link
            to="/post"
            className="px-5 py-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Offer a Ride</span>
          </Link>
        </div>

        {/* Quick Route Shortcuts Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left max-w-lg mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            <School className="w-4 h-4 text-emerald-600" />
            <span>Quick Campus Destinations in Uttarakhand</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/search"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Uttaranchal University</span>
            </Link>
            <Link
              to="/search"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Graphic Era (GEU)</span>
            </Link>
            <Link
              to="/search"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="truncate">DIT University</span>
            </Link>
            <Link
              to="/search"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">UPES Dehradun</span>
            </Link>
          </div>
        </div>

        {/* Security / Verification footer assurance */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>CampusRide • Student-Only Verified Carpool Platform</span>
        </div>
      </div>
    </div>
  );
};
