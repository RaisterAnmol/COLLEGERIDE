import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Car,
  MapPin,
  Calendar,
  Search,
  ShieldCheck,
  CheckCircle2,
  Landmark,
  ChevronDown,
  X,
  Activity,
} from "lucide-react";
import gsap from "gsap";

import { useAuth } from "../../context/AuthContext";
import heroHome from "../../assets/illustrations/hero-home.jpg";

export const Hero: React.FC = () => {
  const { activePersona, user } = useAuth();
  const navigate = useNavigate();
  const [from, setFrom] = useState("Premnagar Chowk");
  const [to, setTo] = useState("UIT & USCS Gate 1");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const formatDisplayDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dStr;
    }
  };
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  // Entrance choreography with GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", { opacity: 0, y: -10, duration: 0.5, delay: 0.1 })
        .from(
          ".hero-line",
          { opacity: 0, y: 24, stagger: 0.1, duration: 0.8 },
          "-=0.2",
        )
        .from(".hero-sub", { opacity: 0, y: 12, duration: 0.6 }, "-=0.4")
        .from(
          ".hero-cta",
          { opacity: 0, y: 12, stagger: 0.1, duration: 0.5 },
          "-=0.3",
        );
      if (heroRef.current?.querySelector(".hero-search")) {
        tl.from(".hero-search", { opacity: 0, y: 16, duration: 0.6 }, "-=0.3");
      }
      if (heroRef.current?.querySelector(".hero-map-frame")) {
        tl.from(".hero-map-frame", { opacity: 0, y: 20, duration: 0.8 }, "-=0.3");
      }
    }, heroRef);

    return () => ctx.revert();
  }, [activePersona]);

  // High-precision path tracking for the vehicle along the bezier curve
  const pathRef = useRef<SVGPathElement>(null);
  const [carTransform, setCarTransform] = useState({ x: 60, y: 80, angle: 0 });

  // Continuous 60fps smooth loop along the route curve
  useEffect(() => {
    let animFrameId: number;
    let startTime: number | null = null;
    const duration = 14000; // 14s full circuit

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = (elapsed % duration) / duration;

      if (pathRef.current) {
        const totalLen = pathRef.current.getTotalLength();
        // Travel between 4% and 96% of the curve
        const curDist = (0.04 + rawProgress * 0.92) * totalLen;
        const pt = pathRef.current.getPointAtLength(curDist);
        const ptAhead = pathRef.current.getPointAtLength(Math.min(curDist + 4, totalLen));
        const angle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI);
        setCarTransform({ x: pt.x, y: pt.y, angle });
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`,
    );
  };

  return (
    <section
      ref={heroRef}
      className="relative pt-10 pb-20 md:pt-16 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-xs">
          {/* Verification Pill */}
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-slate-800 text-xs font-mono tracking-wider uppercase mb-6 border border-slate-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CampusRide · University Commute Network</span>
            {user ? (
              <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold ml-1 text-[11px] shadow-xs">
                {user.role === 'driver' || user.accountType === 'DRIVER'
                  ? '🚗 VERIFIED DRIVER'
                  : user.role === 'super_admin' || user.role === 'campus_admin'
                  ? '🏛️ CAMPUS ADMIN'
                  : user.accountType === 'WOMEN_PASSENGER'
                  ? '🛡️ WOMEN-ONLY STUDENT'
                  : '🎒 VERIFIED STUDENT'}
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold ml-1 text-[11px]">
                🔒 100% VERIFIED UNIVERSITY PEERS
              </span>
            )}
          </div>

          {/* Hero Headline */}
          <h1
            ref={headlineRef}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] max-w-2xl"
          >
            <span className="hero-line block">Your daily campus commute,</span>
            <span className="hero-line block text-[#143D32]">
              {user?.role === 'driver' || user?.accountType === 'DRIVER'
                ? 'share your seats & save fuel.'
                : user?.role === 'super_admin' || user?.role === 'campus_admin'
                ? 'managed with campus-wide safety.'
                : 'shared with peers you trust.'}
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="hero-sub mt-5 text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
            {user?.role === 'driver' || user?.accountType === 'DRIVER'
              ? 'Offer empty car/bike seats along your university route. Share commute expenses with verified student peers.'
              : user?.role === 'super_admin' || user?.role === 'campus_admin'
              ? 'Real-time university operations: live passenger tracking, incident monitoring, and campus mobility fare governance.'
              : 'Direct rides with university peers heading your direction. Verified college IDs, zero commercial surge, and scheduled carpools.'}
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta mt-7 flex flex-wrap items-center gap-3.5">
            {user?.role === 'driver' || user?.accountType === 'DRIVER' ? (
              <>
                <Link
                  to="/post"
                  className="px-6 py-3.5 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                >
                  <Car className="w-4 h-4 text-emerald-300" />
                  <span>Post a Ride Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/search"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm border border-slate-200 transition-all flex items-center gap-2 shadow-xs"
                >
                  <Search className="w-4 h-4 text-slate-600" />
                  <span>Browse Campus Rides</span>
                </Link>
              </>
            ) : user?.role === 'super_admin' || user?.role === 'campus_admin' ? (
              <>
                <Link
                  to="/admin"
                  className="px-6 py-3.5 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Open Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/search"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm border border-slate-200 transition-all flex items-center gap-2 shadow-xs"
                >
                  <span>Live Route Monitor</span>
                </Link>
              </>
            ) : user ? (
              <>
                <Link
                  to="/search"
                  className="px-6 py-3.5 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                >
                  <Search className="w-4 h-4" />
                  <span>Find a Ride</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/post"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm border border-slate-200 transition-all flex items-center gap-2 shadow-xs"
                >
                  <Car className="w-4 h-4 text-slate-600" />
                  <span>Offer a Ride</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                >
                  <span>Log In to CampusRide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm border border-slate-200 transition-all flex items-center gap-2 shadow-xs"
                >
                  <span>Create Student Account</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Column: High-Res Daytime Illustration (No Blur) */}
        <div className="lg:col-span-5 w-full">
          <div className="relative rounded-3xl overflow-hidden border border-[#DDE1DE] shadow-xl bg-white group">
            <img
              src={heroHome}
              alt="CampusRide campus community and student commute on a sunny morning"
              className="w-full h-[320px] sm:h-[400px] lg:h-[460px] object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#143D32]/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
              <span className="px-3 py-1.5 rounded-full bg-[#143D32]/85 backdrop-blur-sm border border-emerald-400/30 text-emerald-50">
                CAMPUS COMMUTE
              </span>
              <span className="px-3 py-1.5 rounded-full bg-emerald-700 text-white font-semibold">
                VERIFIED PEERS
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center text-center w-full">
        {/* Corridor Quick Search Bar - Find a Ride */}
        <div className="hero-search mt-10 w-full max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 sm:p-6 transition-all text-left">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-5">
              {/* Left Title Block with Transit Nodes Icon */}
              <div className="flex items-center gap-3 shrink-0 pr-2 lg:border-r lg:border-slate-100 lg:pr-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#143D32] flex items-center justify-center shrink-0 border border-emerald-100/80">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="18" r="2.5" />
                    <circle cx="18" cy="6" r="2.5" />
                    <circle cx="6" cy="6" r="2.5" />
                    <path d="M6 8.5v7" />
                    <path d="M8.5 6h7" />
                    <path d="M8 8l8 8" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">Find a Ride</h3>
                  <p className="text-xs text-slate-500 font-normal leading-tight mt-0.5 whitespace-nowrap">
                    Search campus routes and<br className="hidden sm:inline lg:hidden xl:inline" /> travel together
                  </p>
                </div>
              </div>

              {/* Form Inputs & Search Button */}
              <form onSubmit={handleSearch} className="flex-1 flex flex-col md:flex-row items-stretch gap-2.5">
                {/* FROM input */}
                <div className="flex-1 min-w-[170px] flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 bg-white transition-all">
                  <MapPin className="w-4 h-4 text-slate-800 shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">FROM</label>
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Pickup hub"
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none truncate"
                    />
                  </div>
                  {from && (
                    <button
                      type="button"
                      onClick={() => setFrom("")}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Clear origin"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* TO CAMPUS input */}
                <div className="flex-1 min-w-[190px] flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 bg-white transition-all">
                  <Landmark className="w-4 h-4 text-[#143D32] shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">TO CAMPUS</label>
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Campus gate"
                      className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none truncate"
                    />
                  </div>
                  {to && (
                    <button
                      type="button"
                      onClick={() => setTo("")}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Clear destination"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* DATE input */}
                <div className="w-full md:w-[185px] flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 bg-white transition-all relative cursor-pointer">
                  <Calendar className="w-4 h-4 text-slate-700 shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">DATE</label>
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {formatDisplayDate(date)}
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                </div>

                {/* SEARCH BUTTON */}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#143D32] hover:bg-[#0E2C24] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-white" />
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Bottom Sub-Bar */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold text-slate-700">Verified campus network</span>
                <span className="text-slate-300">•</span>
                <span>Only college students &amp; verified drivers</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>4 active channels</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span>Live GPS Telemetry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Schematic Corridor Display */}
      <div className="hero-map-frame mt-12 max-w-5xl mx-auto bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-sm relative">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-slate-900 font-medium">Corridor 01:</span>
            <span>Chakrata Rd · Selaqui to UIT Campus</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span>Live Speed: 38 km/h</span>
            <span className="text-emerald-600 font-medium">
              Cost split only · Zero Surge
            </span>
          </div>
        </div>

        {/* SVG Route Track */}
        <div className="relative h-44 sm:h-48 w-full mt-4 flex items-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 840 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.08" />
              </filter>
            </defs>

            <line
              x1="0"
              y1="40"
              x2="840"
              y2="40"
              stroke="#F1F5F9"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="80"
              x2="840"
              y2="80"
              stroke="#F1F5F9"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1="120"
              x2="840"
              y2="120"
              stroke="#F1F5F9"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Base Route Track */}
            <path
              d="M 60 80 C 200 30, 260 55, 300 55 C 400 55, 480 125, 560 80 C 640 45, 710 80, 780 80"
              stroke="#E2E8F0"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Active Highlight Track - Animated Dash */}
            <path
              ref={pathRef}
              d="M 60 80 C 200 30, 260 55, 300 55 C 400 55, 480 125, 560 80 C 640 45, 710 80, 780 80"
              stroke="url(#routeGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="8 6"
              className="route-dash-moving"
            />

            {/* Waypoint 1: Selaqui Hub (Starting Point) */}
            <g transform="translate(60, 80)">
              <circle r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
              <circle r="3" fill="#0F172A" />
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fill="#0F172A"
                fontSize="11"
                fontWeight="600"
              >
                Selaqui Hub
              </text>
              {/* Opaque pill to guarantee zero line clash */}
              <g transform="translate(0, 16)">
                <rect
                  x="-32"
                  y="0"
                  width="64"
                  height="18"
                  rx="9"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  filter="url(#badgeShadow)"
                />
                <text
                  x="0"
                  y="12.5"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  08:15 AM
                </text>
              </g>
            </g>

            {/* Waypoint 2: Suddhowala PG Hub */}
            <g transform="translate(300, 55)">
              <circle r="7" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
              <circle r="3" fill="#2563EB" />
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fill="#1E40AF"
                fontSize="11"
                fontWeight="600"
              >
                Suddhowala PG Hub
              </text>
              {/* Clean opaque badge for passenger - completely clears the curve */}
              <g transform="translate(0, 18)">
                <rect
                  x="-46"
                  y="0"
                  width="92"
                  height="20"
                  rx="10"
                  fill="#FFFFFF"
                  stroke="#BFDBFE"
                  strokeWidth="1.2"
                  filter="url(#badgeShadow)"
                />
                <text
                  x="0"
                  y="13.5"
                  textAnchor="middle"
                  fill="#1D4ED8"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  Rahul S. (+1)
                </text>
              </g>
            </g>

            {/* Waypoint 3: Nanda Ki Chowki Bridge */}
            <g transform="translate(560, 80)">
              <circle r="7" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
              <circle r="3" fill="#2563EB" />
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fill="#1E40AF"
                fontSize="11"
                fontWeight="600"
              >
                Nanda Ki Chowki
              </text>
              {/* Clean opaque badge for passenger */}
              <g transform="translate(0, 18)">
                <rect
                  x="-44"
                  y="0"
                  width="88"
                  height="20"
                  rx="10"
                  fill="#FFFFFF"
                  stroke="#BFDBFE"
                  strokeWidth="1.2"
                  filter="url(#badgeShadow)"
                />
                <text
                  x="0"
                  y="13.5"
                  textAnchor="middle"
                  fill="#1D4ED8"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  Priya S. (+1)
                </text>
              </g>
            </g>

            {/* Waypoint 4: UU Campus Gate 1 / UIT */}
            <g transform="translate(780, 80)">
              <circle r="10" fill="#FFFFFF" stroke="#059669" strokeWidth="3" />
              <circle r="4" fill="#059669" />
              <text
                x="0"
                y="-20"
                textAnchor="middle"
                fill="#065F46"
                fontSize="11.5"
                fontWeight="700"
              >
                UU Campus Gate 1 (UIT)
              </text>
              {/* Opaque arrival pill */}
              <g transform="translate(0, 18)">
                <rect
                  x="-52"
                  y="0"
                  width="104"
                  height="20"
                  rx="10"
                  fill="#ECFDF5"
                  stroke="#A7F3D0"
                  strokeWidth="1.2"
                  filter="url(#badgeShadow)"
                />
                <text
                  x="0"
                  y="13.5"
                  textAnchor="middle"
                  fill="#059669"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  08:45 AM Arrival
                </text>
              </g>
            </g>

            {/* Dynamically Traveling Vehicle Glued to SVG Bezier Curve */}
            <g
              transform={`translate(${carTransform.x}, ${carTransform.y})`}
              className="pointer-events-none"
            >
              {/* Radar Ping Glow */}
              <circle r="16" fill="#2563EB" opacity="0.2" className="animate-ping" />
              
              {/* Traveling Car Marker Node */}
              <circle r="9" fill="#0F172A" stroke="#3B82F6" strokeWidth="2.5" />
              <circle r="3.5" fill="#60A5FA" />

              {/* Floating Driver Pill Badge - perfectly level, never flips */}
              <g transform="translate(0, -28)">
                <rect
                  x="-42"
                  y="-11"
                  width="84"
                  height="22"
                  rx="6"
                  fill="#0F172A"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  filter="url(#badgeShadow)"
                />
                {/* Pointer down to car */}
                <polygon points="-4,11 4,11 0,14" fill="#0F172A" />
                <text
                  x="-12"
                  y="4"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                >
                  Aditya
                </text>
                <text
                  x="20"
                  y="4"
                  textAnchor="middle"
                  fill="#34D399"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="700"
                >
                  ₹40
                </text>
              </g>
            </g>
          </svg>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[11px]">Distance</span>
            <span className="text-slate-900 font-semibold">
              12.8 km corridor
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              Detour impact
            </span>
            <span className="text-emerald-600 font-semibold">
              &lt; 3 mins total
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              Fare structure
            </span>
            <span className="text-slate-900 font-semibold">₹40 fuel split</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              Authentication
            </span>
            <span className="text-[#143D32] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified IDs
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Backwards-compatible alias
export const EditorialHero = Hero;
