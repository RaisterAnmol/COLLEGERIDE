import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { useSeoMeta } from '../hooks/useSeoMeta';

export const NotFoundPage: React.FC = () => {
  useSeoMeta({
    title: "404 - Commute Stop Not Found",
    description: "The requested campus carpool route or page could not be located.",
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] bg-canvas flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient background styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#857F6B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-20" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-route/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="max-w-2xl w-full text-center relative z-10 space-y-8"
      >
        {/* Top 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-route-pale border border-route-light/30 text-route text-xs font-mono font-bold shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-route" />
          <span>Error 404 • Commute Stop Not Found</span>
        </div>

        {/* Big Stylized 404 Graphic */}
        <div className="relative select-none py-2">
          <div className="text-8xl sm:text-9xl font-display font-black tracking-tighter text-line-base">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              whileHover={{ rotate: 0, scale: 1.05 }}
              animate={{ rotate: [4, -4, 4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-route text-white flex items-center justify-center shadow-xl shadow-route/25"
            >
              <Compass className="w-10 h-10 sm:w-12 sm:h-12" />
            </motion.div>
          </div>
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-ink-primary tracking-tight">
            Looks like you've gone off-route!
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted max-w-lg mx-auto leading-relaxed font-sans">
            The page, carpool schedule, or stop you are trying to reach doesn't exist or may have departed for campus already.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-2xl border border-line-base bg-paper hover:bg-canvas text-ink-primary text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-ink-muted" />
            <span>Go Back</span>
          </button>

          <Link
            to="/search"
            className="px-6 py-3 rounded-2xl bg-route hover:bg-route-light text-white text-xs font-mono font-bold shadow-md shadow-route/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Find a Campus Ride</span>
          </Link>

          <Link
            to="/"
            className="px-5 py-3 rounded-2xl border border-line-base bg-paper hover:bg-canvas text-ink-primary text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-route" />
            <span>Campus Home</span>
          </Link>

          <Link
            to="/post"
            className="px-5 py-3 rounded-2xl border border-route-light/40 bg-route-pale hover:bg-route/15 text-route text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-route" />
            <span>Offer a Ride</span>
          </Link>
        </div>

        {/* Quick Route Shortcuts Card */}
        <div className="p-5 rounded-3xl bg-paper border border-line-base shadow-xs text-left max-w-lg mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs font-display font-bold text-ink-primary">
            <School className="w-4 h-4 text-route" />
            <span>Quick Campus Destinations in Uttarakhand</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <Link
              to="/search"
              className="p-2.5 rounded-xl bg-canvas hover:bg-route-pale hover:text-route text-ink-secondary transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-route shrink-0" />
              <span className="truncate">Uttaranchal University</span>
            </Link>
            <Link
              to="/search"
              className="p-2.5 rounded-xl bg-canvas hover:bg-route-pale hover:text-route text-ink-secondary transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">Graphic Era (GEU)</span>
            </Link>
            <Link
              to="/search"
              className="p-2.5 rounded-xl bg-canvas hover:bg-route-pale hover:text-route text-ink-secondary transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">DIT University</span>
            </Link>
            <Link
              to="/search"
              className="p-2.5 rounded-xl bg-canvas hover:bg-route-pale hover:text-route text-ink-secondary transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">UPES Dehradun</span>
            </Link>
          </div>
        </div>

        {/* Security / Verification footer assurance */}
        <div className="flex items-center justify-center gap-2 text-xs text-ink-faint font-mono">
          <ShieldCheck className="w-4 h-4 text-route" />
          <span>CampusRide • Student-Only Verified Carpool Platform</span>
        </div>
      </motion.div>
    </div>
  );
};
