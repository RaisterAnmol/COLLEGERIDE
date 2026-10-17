import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Car,
  MapPin,
  Calendar,
  Search,
  ShieldCheck,
  Landmark,
  ChevronDown,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentAvatar } from '../signature/StudentAvatar';
import { CampusDatePicker } from '../common/CampusDatePicker';

interface DriverSlide {
  id: string;
  name: string;
  role: string;
  college: string;
  rating: string;
  verifiedTime: string;
  route: string;
  fare: string;
  image: string;
  tag: string;
}

const DRIVER_SLIDES: DriverSlide[] = [
  {
    id: 'aditya',
    name: 'Aditya Sharma',
    role: 'B.Tech CSE ‘25',
    college: 'UPES Dehradun',
    rating: '4.96 ★',
    verifiedTime: '07:30 AM selfie verified',
    route: 'Premnagar Chowk ⇄ UIT Gate 1',
    fare: '₹25',
    image: '/hero-aditya-driver.jpg',
    tag: 'VERIFIED CAMPUS DRIVER',
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    role: 'M.Sc Biotech ‘26',
    college: 'Uttaranchal Univ',
    rating: '4.98 ★',
    verifiedTime: '08:10 AM liveness pass',
    route: 'Suddhowala ⇄ UIT Campus',
    fare: '₹20',
    image: '/safety-student-real.jpg',
    tag: 'DAILY COMMUTER',
  },
  {
    id: 'rahul',
    name: 'Rahul Verma',
    role: 'B.Com Hons ‘25',
    college: 'Graphic Era Univ',
    rating: '4.92 ★',
    verifiedTime: '07:45 AM campus badge verified',
    route: 'Ballupur ⇄ Premnagar Hub',
    fare: '₹30',
    image: '/verification-student-real.jpg',
    tag: 'VERIFIED DRIVER',
  },
  {
    id: 'classmates',
    name: 'Ananya & Classmates',
    role: 'UIT Dehradun',
    college: 'Engineering Quad',
    rating: '5.0 ★',
    verifiedTime: 'Daily Shared Pool',
    route: 'Premnagar ⇄ UIT Tech Block',
    fare: '₹15',
    image: '/dashboard-students-real.jpg',
    tag: 'CAMPUS CARPOOL BATCH',
  },
];

export const Hero: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [from, setFrom] = useState('Premnagar Chowk');
  const [to, setTo] = useState('UIT Gate 1');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate slides every 4.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % DRIVER_SLIDES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = DRIVER_SLIDES[activeSlide];

  const formatDisplayDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    } catch {
      return dStr;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`
    );
  };

  return (
    <section className="relative pt-6 pb-12 md:pt-10 md:pb-14 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto overflow-hidden">
      {/* 2-Column Editorial Campus Atlas Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
        {/* Left Column (6 cols): Editorial Typography & Action */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 flex flex-col items-start text-left"
        >
          {/* Factual Live Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper text-ink-primary text-xs font-mono mb-4 border border-border shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-plum">Campus Atlas</span>
            <span className="text-border">•</span>
            <span className="text-ink-secondary">Dehradun University Transit</span>
          </div>

          {/* Display Headline in Fraunces serif */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.65rem] font-display font-extrabold tracking-tight text-ink-primary leading-[1.06]">
            Ride with people <br />
            <em className="italic text-plum not-italic">from your campus.</em>
          </h1>

          {/* Reassuring, Honest Body Copy */}
          <p className="mt-4 text-base sm:text-lg text-ink-secondary max-w-xl leading-relaxed">
            Every driver and rider on CampusRide has submitted a university student ID verified by campus admins. Share everyday commutes between Premnagar, Suddhowala, and UIT Gate 1 with zero surge pricing.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3.5">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-plum hover:bg-plum-hover text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:translate-y-0.5 neu-btn"
            >
              <Search className="w-4 h-4" />
              <span>Find a Ride</span>
            </Link>

            <Link
              to={user ? '/post' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-paper hover:bg-white text-ink-primary text-sm font-bold border border-border transition-all active:translate-y-0.5 neu-btn shadow-xs"
            >
              <Car className="w-4 h-4 text-plum" />
              <span>Offer a Ride</span>
            </Link>
          </div>

          {/* Sunken & Embossed Tactile Stat Counters */}
          <div className="mt-7 grid grid-cols-2 gap-3.5 w-full max-w-md items-stretch">
            <div className="p-3.5 rounded-2xl bg-paper neu-card-sm border border-white/80">
              <div className="text-2xl font-extrabold text-plum font-mono">₹25</div>
              <div className="text-xs font-semibold text-ink-secondary mt-0.5">Average Campus Share</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-paper neu-card-sm border border-white/80">
              <div className="text-2xl font-extrabold text-forest font-mono">100%</div>
              <div className="text-xs font-semibold text-ink-secondary mt-0.5">Student &amp; Faculty ID Verified</div>
            </div>
          </div>

          {/* Student Avatars Trust Strip */}
          <div className="mt-6 pt-5 border-t border-border/70 w-full flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 overflow-hidden">
                <StudentAvatar archetype="aditya" state="matched" size={38} className="border-2 border-paper shadow-xs" />
                <StudentAvatar archetype="priya" state="arrived" size={38} className="border-2 border-paper shadow-xs" />
                <StudentAvatar archetype="rahul" state="waiting" size={38} className="border-2 border-paper shadow-xs" />
                <StudentAvatar archetype="ananya" state="matched" size={38} className="border-2 border-paper shadow-xs" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-ink-primary block">Verified Classmates Commuting</span>
                <span className="text-ink-secondary">Uttaranchal, UPES, DIT & Graphic Era</span>
              </div>
            </div>

            <Link
              to="/safety"
              className="text-xs font-mono font-bold text-plum hover:underline inline-flex items-center gap-1"
            >
              <span>Safety protocols</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Right Column (6 cols): Auto-Rotating Real Photo Showcase with Neumorphic Depth */}
        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-6 w-full"
        >
          <div className="relative rounded-3xl bg-paper p-3 neu-card border border-white/90">
            {/* Main Showcase Image Frame */}
            <div className="relative h-[380px] sm:h-[420px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
              {DRIVER_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`${slide.name} - ${slide.role}`}
                    width={640}
                    height={480}
                    className="w-full h-full object-cover object-center"
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/campus-hero-real.jpg';
                    }}
                  />
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                </div>
              ))}

              {/* Progress Indicators (Dots) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/55 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                {DRIVER_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all rounded-full ${
                      idx === activeSlide
                        ? 'w-6 h-2 bg-white shadow-sm'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Slide Quick Navigation Pill */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{currentSlide.tag}</span>
              </div>
            </div>

            {/* Synchronized Floating Frosted Glassmorphism Telemetry Chips - Semi-Transparent & Razor-Sharp */}
            {/* Top-Right Chip: Verified Driver Rating */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              whileHover={{ scale: 1.04, y: -7 }}
              className="absolute -top-3 -right-1 sm:-top-4 sm:-right-4 z-30 backdrop-blur-xl bg-white/70 border border-white/90 shadow-[0_12px_32px_rgba(0,0,0,0.16),inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2.5 sm:gap-3.5 ring-1 ring-slate-900/10 cursor-pointer transition-shadow"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-[10px] sm:text-[11px] font-mono font-black uppercase text-purple-950 tracking-wider flex items-center gap-1.5">
                  <span>VERIFIED ID</span>
                  <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] border border-amber-500 shadow-xs">
                    ★ {currentSlide.rating}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-950 leading-tight">{currentSlide.name}</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-700">{currentSlide.college}</div>
              </div>
            </motion.div>

            {/* Bottom-Left Chip: Route & Fare */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              whileHover={{ scale: 1.04, y: -7 }}
              className="absolute -bottom-5 -left-1 sm:-bottom-6 sm:-left-4 z-30 backdrop-blur-xl bg-white/70 border border-white/90 shadow-[0_12px_32px_rgba(0,0,0,0.16),inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2.5 sm:gap-3.5 ring-1 ring-slate-900/10 cursor-pointer transition-shadow"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#143D32] text-white flex items-center justify-center font-mono font-black text-sm sm:text-base shadow-sm shrink-0">
                {currentSlide.fare}
              </div>
              <div className="text-left">
                <div className="text-[11px] font-mono font-black uppercase text-[#143D32] tracking-wider">DAILY ROUTE</div>
                <div
                  className="text-sm font-black text-slate-950 truncate leading-tight"
                  title={currentSlide.route}
                >
                  {currentSlide.route}
                </div>
                <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Zero platform commission</span>
                </div>
              </div>
            </motion.div>

            {/* Bottom-Right Chip: Security Liveness */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 1 }}
              whileHover={{ scale: 1.05, y: -7 }}
              className="absolute -bottom-6 -right-2 sm:-right-4 z-30 hidden sm:flex backdrop-blur-xl bg-white/70 border border-white/90 shadow-[0_12px_32px_rgba(0,0,0,0.16),inset_0_1px_1px_rgba(255,255,255,0.9)] rounded-2xl px-4 py-3 items-center gap-3 ring-1 ring-slate-900/10 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-mono font-black text-emerald-950 uppercase tracking-tight">LIVENESS PASS</div>
                <div className="text-xs font-black text-slate-950">{currentSlide.verifiedTime}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Pricing Pill - Enlarged & High Contrast Tactile */}
      <div className="mt-14 flex justify-center px-4">
        <div className="bg-[#582C4D] text-white rounded-3xl p-6 sm:p-7 shadow-lg flex items-center justify-center gap-3 sm:gap-4 max-w-4xl w-full text-center hover:scale-[1.01] transition-transform border border-pink-400/20">
          <span className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-none text-white shrink-0">
            ₹0
          </span>
          <span className="text-sm sm:text-base font-medium text-white/95">
            platform markup. Fuel is split directly between verified university students.
          </span>
        </div>
      </div>

      {/* Corridor Stops Ribbon - Enlarged & Continuous Horizontal Marquee */}
      <div className="mt-5 w-full max-w-full min-w-0 overflow-hidden whitespace-nowrap py-4 sm:py-4.5 bg-[#FAF8F5] border-y-2 border-[#E8E4DD] shadow-xs relative">
        {/* Subtle Fade Edges for Professional Polish */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee-horizontal items-center gap-10 font-bold text-sm sm:text-base text-slate-800">
          {/* Corridor Stops Sequence - Group 1 */}
          <div className="flex items-center gap-10 shrink-0">
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">Suddhowala Student Quad</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Pickup
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">Nanda Ki Chowki</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Junction
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">UIT Gate 1 Academic Campus</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Terminal
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">Premnagar Market Chowk</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Hub
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">Ballupur Chowk Artery</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Pickup
              </span>
            </span>
          </div>

          {/* Corridor Stops Sequence - Group 2 (Identical clone for seamless loop) */}
          <div className="flex items-center gap-10 shrink-0">
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">Suddhowala Student Quad</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Pickup
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">Nanda Ki Chowki</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Junction
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">UIT Gate 1 Academic Campus</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Terminal
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">Premnagar Market Chowk</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Hub
              </span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="text-[#582C4D] text-base font-black">✦</span>
              <span className="font-display">Ballupur Chowk Artery</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F5EBF2] text-[#582C4D] border border-[#582C4D]/20">
                Pickup
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Corridor Quick Search Bar (Tactile Neumorphic Container) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 w-full max-w-5xl mx-auto"
      >
        <div className="bg-paper rounded-3xl border border-white/80 neu-card p-4 sm:p-5 text-left">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-stretch gap-3">
            {/* FROM input */}
            <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-border/80 bg-white shadow-2xs focus-within:border-plum focus-within:ring-2 focus-within:ring-plum/20 transition-all">
              <MapPin className="w-4 h-4 text-plum shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <label className="block text-[10px] font-mono text-ink-muted uppercase font-bold">
                  Pickup Stop
                </label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="e.g. Premnagar Chowk"
                  className="w-full bg-transparent text-base sm:text-sm font-bold text-ink-primary focus:outline-none truncate"
                />
              </div>
              {from && (
                <button
                  type="button"
                  onClick={() => setFrom('')}
                  className="text-ink-muted hover:text-ink-primary p-0.5 cursor-pointer"
                  title="Clear origin"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* TO CAMPUS input */}
            <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-border/80 bg-white shadow-2xs focus-within:border-plum focus-within:ring-2 focus-within:ring-plum/20 transition-all">
              <Landmark className="w-4 h-4 text-plum shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <label className="block text-[10px] font-mono text-ink-muted uppercase font-bold">
                  Campus Gate
                </label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="e.g. UIT Gate 1"
                  className="w-full bg-transparent text-base sm:text-sm font-bold text-ink-primary focus:outline-none truncate"
                />
              </div>
              {to && (
                <button
                  type="button"
                  onClick={() => setTo('')}
                  className="text-ink-muted hover:text-ink-primary p-0.5 cursor-pointer"
                  title="Clear destination"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Tactile Campus Date Picker */}
            <div className="w-full lg:w-48 px-3.5 py-2.5 rounded-2xl border border-border/80 bg-white shadow-2xs relative">
              <CampusDatePicker value={date} onChange={setDate} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-plum hover:bg-plum-hover text-white font-bold text-sm neu-btn flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 transition-all shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>Search Rides</span>
            </button>
          </form>

          {/* Factual Sub-bar */}
          <div className="mt-3.5 pt-3 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-secondary">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>Enrolled university students and verified drivers only</span>
            </span>
            <span className="font-mono text-[11px] text-ink-muted">
              Zero platform markup • Direct fuel share • 100% Student Verified
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export const EditorialHero = Hero;
