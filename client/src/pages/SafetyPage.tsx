import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  MapPin,
  CheckCircle2,
  Star,
  Users,
  Car,
  ClipboardCheck,
  Phone,
  Clock,
  ArrowRight,
  ExternalLink,
  Share2,
  Check,
  AlertTriangle,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import safetyHeroImg from '../assets/illustrations/safety-hero.jpg';

export const SafetyPage: React.FC = () => {
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'CampusRide Live Commute Location',
        text: 'Tracking my campus commute on CampusRide Dehradun: https://collegeride.vercel.app/safety',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLocation(true);
      setTimeout(() => setCopiedLocation(false), 2500);
    }
  };

  const handleTriggerSos = () => {
    setSosDispatched(true);
    setTimeout(() => {
      setSosModalOpen(false);
      setSosDispatched(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] text-[#1E2922] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative Botanical Leaf Accents */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-100/60 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Decorative corner illustrations */}
      <svg className="absolute -bottom-6 -left-6 w-36 h-36 text-emerald-700/25 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
        <path d="M10 90 Q 30 50, 70 40 Q 50 70, 10 90 Z" />
        <path d="M20 95 Q 50 60, 90 60 Q 60 85, 20 95 Z" opacity="0.7" />
        <path d="M5 80 Q 20 40, 50 30 Q 35 60, 5 80 Z" opacity="0.5" />
      </svg>
      <svg className="absolute -bottom-6 -right-6 w-36 h-36 text-emerald-700/25 pointer-events-none transform -scale-x-100" viewBox="0 0 100 100" fill="currentColor">
        <path d="M10 90 Q 30 50, 70 40 Q 50 70, 10 90 Z" />
        <path d="M20 95 Q 50 60, 90 60 Q 60 85, 20 95 Z" opacity="0.7" />
      </svg>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* TOP HERO & STATUS BANNER (Matches Image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Heading & Mission (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              {/* Handwritten Doodle Tag */}
              <div className="inline-block transform -rotate-2 mb-2">
                <span className="text-xs font-bold text-emerald-800 tracking-wide bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300/60 font-mono shadow-xs">
                  Safe Rides • Stronger Campus Communities 🌿
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-[1.12]">
                Your Safety <br className="hidden sm:inline" />
                Comes First
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
                CampusRide is built for students, with features that keep you safe, informed and connected — every step of your journey.
              </p>
            </div>

            {/* A safer campus is a stronger community Pill Banner */}
            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950 leading-tight">
                  A safer campus
                </p>
                <p className="text-[11px] text-emerald-700 font-medium underline decoration-emerald-400 decoration-1 underline-offset-2">
                  is a stronger community
                </p>
              </div>
            </div>
          </div>

          {/* Center Column: Campus Art Cutout (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center relative">
            {/* Top Doodle */}
            <div className="absolute -top-3 right-2 z-20 transform rotate-6 text-[11px] font-bold text-emerald-800 font-mono select-none pointer-events-none bg-white/90 px-2 py-0.5 rounded-full shadow-2xs border border-emerald-200">
              Ride Safe • Study Happy ☺
            </div>

            <div className="relative w-full h-full min-h-[220px] rounded-3xl overflow-hidden border-2 border-emerald-100/80 shadow-md group">
              <img
                src={safetyHeroImg}
                alt="University students walking safely on campus quad with backpacks"
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Green Shield Badge on Illustration */}
              <div className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl bg-emerald-600/90 backdrop-blur-xs text-white flex items-center justify-center shadow-lg border border-emerald-300/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Right Column 1: Safety Status Card (lg:col-span-3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between relative overflow-hidden">
            {/* Decorative sunburst doodle */}
            <div className="absolute top-3 right-3 text-emerald-600/40 text-xs font-mono select-none">
              \\ //
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Safety Status</h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-3.5">
                You're all set! Keep following the safety guidelines.
              </p>

              {/* Checklist items with green circles */}
              <div className="space-y-2.5 text-[11px]">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">Profile Verified</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Your identity has been verified</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">Emergency Contacts Added</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Friends & family can help in emergencies</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">Ride Sharing Active</span>
                    <span className="text-[10px] text-slate-500 leading-tight">You're sharing rides with verified students</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block leading-tight">Location Tracking Enabled</span>
                    <span className="text-[10px] text-slate-500 leading-tight">Real-time tracking during your ride</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('safety-details');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#143D32] hover:bg-[#0d2820] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <span>View Safety Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column 2: Emergency SOS Card (lg:col-span-2) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-rose-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
            {/* Red rays doodle */}
            <div className="absolute top-3 right-3 text-rose-500/40 text-xs font-mono select-none">
              \\\ ///
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Emergency</h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-3.5 leading-snug">
                Need immediate help? Use the SOS button or contact campus security.
              </p>

              {/* Call Emergency Red Button */}
              <button
                onClick={() => setSosModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#E14949] hover:bg-[#c93b3b] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Emergency</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>

              {/* Share Location Button */}
              <button
                onClick={handleShareLocation}
                className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{copiedLocation ? 'Link Copied!' : 'Share Location'}</span>
              </button>
            </div>

            {/* Quick Contacts Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  Campus Security
                </span>
                <a href="tel:+911234567890" className="font-bold text-slate-800 hover:text-emerald-700">
                  +91 12345 67890
                </a>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  24/7 Support
                </span>
                <span className="text-emerald-700 font-semibold">Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: 4 SAFETY FEATURE CARDS (Matches Image 1) */}
        <div id="safety-details" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* CARD 1: Verified Driver */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Verified Driver</h3>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-3.5">
                Ride with confidence. All drivers are verified and background checked.
              </p>

              {/* Driver Profile Inner Badge */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs overflow-hidden border border-emerald-300">
                    RS
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">Rohan Sharma</h4>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500">Verified Student Driver</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-amber-600 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>4.8</span>
                      <span className="text-slate-400 font-normal">(124 rides)</span>
                    </div>
                  </div>
                </div>

                {/* 3 Pills: ID Verified, College Verified, Clean Record */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60 text-[9px] font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    ID Verified
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    College Verified
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Clean Record
                  </span>
                </div>
              </div>

              {/* Green Doodle Badge */}
              <div className="mt-3 text-center transform -rotate-1 text-[10px] font-mono font-bold text-emerald-800 select-none">
                Verified Drivers + Safer Rides ☺
              </div>
            </div>

            <Link
              to="/search"
              className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <span>View Full Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* CARD 2: Ride Sharing & Live Tracking */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Ride Sharing</h3>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-3.5">
                Travel together. Stay safer.
              </p>

              {/* Map Route Graphic */}
              <div className="relative rounded-2xl bg-[#E8F1EC] border border-emerald-200/60 p-3 h-32 flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Live tracking indicator */}
                <div className="flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 text-emerald-800 text-[9px] font-bold shadow-2xs border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Tracking
                  </span>
                </div>

                {/* SVG Route Curve */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 120" preserveAspectRatio="none">
                  <path
                    d="M 25 35 Q 80 110, 140 60 T 180 85"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                  />
                  {/* Start Point */}
                  <circle cx="25" cy="35" r="5" fill="#047857" />
                  {/* End Point */}
                  <circle cx="180" cy="85" r="5" fill="#EF4444" />
                </svg>

                {/* Pin labels */}
                <div className="flex items-center justify-between text-[10px] font-bold z-10">
                  <span className="inline-flex items-center gap-0.5 bg-emerald-800 text-white px-1.5 py-0.5 rounded shadow-xs text-[9px]">
                    <MapPin className="w-2.5 h-2.5" />
                    You
                  </span>
                  <span className="inline-flex items-center gap-0.5 bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-xs text-[9px]">
                    <MapPin className="w-2.5 h-2.5" />
                    Campus
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>You're sharing this ride with <strong>3 other students</strong></span>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <span>View Ride Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* CARD 3: Emergency Contacts List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Emergency Contacts</h3>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-3.5">
                Quick access to help when you need it most.
              </p>

              {/* Contact List */}
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                      👮
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Campus Security</p>
                      <p className="text-[10px] text-slate-500">+91 12345 67890</p>
                    </div>
                  </div>
                  <a href="tel:+911234567890" className="p-1.5 rounded-lg bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors">
                    <Phone className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                      🚓
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Local Police</p>
                      <p className="text-[10px] text-slate-500">100 / 112</p>
                    </div>
                  </div>
                  <a href="tel:100" className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors">
                    <Phone className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                      🚑
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Medical Emergency</p>
                      <p className="text-[10px] text-slate-500">108</p>
                    </div>
                  </div>
                  <a href="tel:108" className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-700 hover:bg-rose-600 hover:text-white transition-colors">
                    <Phone className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                      👤
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Your Emergency Contact</p>
                      <p className="text-[10px] text-slate-500">+91 98765 43210</p>
                    </div>
                  </div>
                  <a href="tel:+919876543210" className="p-1.5 rounded-lg bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors">
                    <Phone className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <Link
              to="/verification"
              className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <span>Manage Contacts</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* CARD 4: Safety Checklist */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">Safety Checklist</h3>
                  </div>
                </div>
                <span className="text-amber-500/70 text-xs font-mono">\\\</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3.5">
                Quick reminders for a safer ride.
              </p>

              {/* Checklist Items */}
              <div className="space-y-2.5 text-[11px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">Share your live location</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">Confirm driver details</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">Check vehicle number</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">Keep emergency contacts handy</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">Avoid sharing personal information</span>
                </div>
              </div>
            </div>

            {/* Bottom Doodle */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-[10px] font-mono font-bold text-emerald-800 tracking-tight select-none">
                Small steps make a big difference ☺
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* SOS CONFIRMATION MODAL */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-300 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-9 h-9 animate-bounce" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              {sosDispatched ? 'Emergency Broadcast Dispatched!' : 'Confirm Campus Emergency Dispatch'}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {sosDispatched
                ? 'Your live vehicle coordinates and trip telemetry have been sent to Campus Security (+91 12345 67890) and your emergency ICE circle.'
                : 'This will immediately broadcast your real-time GPS location and student identity to the Uttaranchal University Security Control Room and your linked ICE contacts.'}
            </p>

            {!sosDispatched ? (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSosModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerSos}
                  className="flex-1 py-3 rounded-xl bg-[#E14949] hover:bg-[#c93b3b] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Confirm SOS</span>
                </button>
              </div>
            ) : (
              <div className="py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                ✓ Security Alert Active (Closing...)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
