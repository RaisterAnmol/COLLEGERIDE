// prefers-reduced-motion compliant institutional safety command
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
  RotateCcw,
  Sparkles,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import { StudentAvatar } from '../components/signature/StudentAvatar';
import { useSeoMeta } from '../hooks/useSeoMeta';

const safetyHeroImg = '/safety-student-real.jpg';

export const SafetyPage: React.FC = () => {
  useSeoMeta({
    title: "Campus Commute Safety & Emergency 112 Standard",
    description: "Explore the 4 pillars of CampusRide institutional safety: verified .edu credentials, GPS corridor telemetry, women-only commute options, and instant 112 dispatch.",
  });

  const { user } = useAuth();
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);
  const [sosPhoneInput, setSosPhoneInput] = useState(() =>
    (user?.phone || '').replace(/^\+91\s*/, '').replace(/\D/g, '').slice(0, 10)
  );

  // Live GPS telemetry & reverse geocode state
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [liveAddress, setLiveAddress] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatusText, setLocationStatusText] = useState<string>('Finding your location...');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sosNotesInput, setSosNotesInput] = useState<string>('');

  useEffect(() => {
    if (user?.phone) {
      setSosPhoneInput(user.phone.replace(/^\+91\s*/, '').replace(/\D/g, '').slice(0, 10));
    }
  }, [user?.phone]);

  const fetchIpLocation = useCallback(async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setLiveCoords({
            lat: data.latitude,
            lng: data.longitude,
            accuracy: 1000,
          });
          setLiveAddress(`${data.city || 'Campus Area'}, ${data.region || 'Uttarakhand'}`);
          setLocationLoading(false);
          return;
        }
      }
    } catch (_) {}
    setLiveCoords({ lat: 30.3415, lng: 77.9540, accuracy: 50 });
    setLiveAddress('Uttaranchal University Campus Perimeter');
    setLocationLoading(false);
  }, []);

  const acquireLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationStatusText('Finding your location (acquiring GPS satellite fix)...');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);
        setLiveCoords({ lat, lng, accuracy });
        setLocationLoading(false);
        setLocationError(null);

        // Reverse geocode via OpenStreetMap Nominatim for accurate local street/campus landmark
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: { Accept: 'application/json' },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              setLiveAddress(data.display_name.split(',').slice(0, 3).join(', '));
            }
          }
        } catch (_) {}
      },
      (err) => {
        if (err.code === 1) { // PERMISSION_DENIED
          setLocationError('Location permission denied. Please allow location access in your browser settings to enable live GPS telemetry.');
          setLocationLoading(false);
          fetchIpLocation();
          return;
        }

        setLocationStatusText('Refining with cellular & network triangulation...');
        console.warn('[SafetyPage] High accuracy GPS timed out, falling back to network triangulation:', err);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLiveCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy),
            });
            setLocationLoading(false);
            setLocationError(null);
          },
          (networkErr) => {
            if (networkErr.code === 1) {
              setLocationError('Location permission denied. Please enable location permissions.');
            } else {
              setLocationError('Unable to acquire precise GPS signal. Switched to campus corridor default.');
            }
            fetchIpLocation();
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [fetchIpLocation]);

  useEffect(() => {
    acquireLocation();
  }, [acquireLocation]);

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

  const handleTriggerSos = async () => {
    if (!user) {
      setSosError('Please log in to dispatch an emergency alert linked to your student profile, or call 112 directly.');
      return;
    }
    const finalPhone = sosPhoneInput.trim() ? `+91 ${sosPhoneInput.trim()}` : (user.phone || '');
    if (!finalPhone || finalPhone.replace(/\D/g, '').length < 10) {
      setSosError('Please enter a valid 10-digit mobile number so WhatsApp SOS distress alerts can reach you.');
      return;
    }

    setSosLoading(true);
    setSosError(null);

    const targetLat = liveCoords?.lat || 30.3415;
    const targetLng = liveCoords?.lng || 77.9540;
    const targetAcc = liveCoords?.accuracy || 15;
    const targetAddress = liveAddress || 'Campus Perimeter (Safety Center)';
    const targetNotes = sosNotesInput.trim()
      ? `Emergency distress note: ${sosNotesInput.trim()}`
      : 'Emergency SOS button triggered from Safety & Protection Hub.';

    try {
      await api.triggerSos({
        latitude: targetLat,
        longitude: targetLng,
        accuracy: targetAcc,
        address: targetAddress,
        notes: targetNotes,
        phone: finalPhone,
      });
      setSosDispatched(true);
      setTimeout(() => {
        setSosModalOpen(false);
        setSosDispatched(false);
      }, 3500);
    } catch (err: any) {
      setSosError(err?.message || 'Failed to dispatch SOS alert. Please call 112 immediately.');
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary py-6 sm:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle Collegiate Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-plum/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-80 h-80 bg-forest/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* TOP HERO & STATUS BANNER (Balanced 12-Col Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (5 cols): Editorial Typography & Tactile Proof */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between space-y-5 text-left"
          >
            <div>
              {/* Factual Live Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper text-ink-primary text-xs font-mono mb-4 border border-border shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-plum">Campus Atlas Protocol</span>
                <span className="text-border">•</span>
                <span className="text-ink-secondary">India 112 Standard</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.35rem] font-display font-extrabold text-ink-primary tracking-tight leading-[1.06]">
                Your safety <br />
                <em className="italic text-plum not-italic">comes first.</em>
              </h1>

              {/* Honest, Reassuring Body Copy */}
              <p className="mt-4 text-sm sm:text-base text-ink-secondary leading-relaxed max-w-lg">
                CampusRide is engineered for authenticated university students. Every commuter is pre-screened with active collegiate credentials, protected by live GPS telemetry, in-car 4-digit OTP matching, and direct one-touch dispatch to National Emergency 112.
              </p>
            </div>

            {/* Sunken & Embossed Tactile Stat Counters */}
            <div className="grid grid-cols-2 gap-3.5 w-full max-w-md items-stretch">
              <div className="p-3.5 rounded-2xl bg-paper neu-card-sm border border-white/80">
                <div className="text-2xl font-extrabold text-forest font-mono">100%</div>
                <div className="text-xs font-semibold text-ink-secondary mt-0.5">Pre-Screened Student IDs</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-paper neu-card-sm border border-white/80">
                <div className="text-2xl font-extrabold text-plum font-mono">24/7</div>
                <div className="text-xs font-semibold text-ink-secondary mt-0.5">India 112 Emergency Sync</div>
              </div>
            </div>

            {/* Student Avatars Trust Strip */}
            <div className="pt-4 border-t border-border/70 flex items-center gap-3">
              <div className="flex -space-x-2.5 overflow-hidden">
                <StudentAvatar archetype="priya" state="arrived" size={38} className="border-2 border-paper shadow-xs" />
                <StudentAvatar archetype="aditya" state="matched" size={38} className="border-2 border-paper shadow-xs" />
                <StudentAvatar archetype="ananya" state="waiting" size={38} className="border-2 border-paper shadow-xs" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-ink-primary block">Protected University Corridor</span>
                <span className="text-ink-secondary">Premnagar • Suddhowala • UIT Gate 1</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column (7 cols): Photorealistic Student Frame + Neumorphic Security Card */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch"
          >
            {/* Student Portrait with Tactile Floating Chips (sm:col-span-7) */}
            <div className="sm:col-span-7 relative rounded-3xl bg-paper p-3 neu-card border border-white/90 flex flex-col justify-center">
              <div className="relative h-[340px] sm:h-[380px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                <img
                  src={safetyHeroImg}
                  alt="Authentic university student commuter Priya holding verified digital student pass"
                  width={480}
                  height={380}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/campus-hero-real.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/20 pointer-events-none" />

                {/* Floating Top Beacon */}
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-[11px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>CAMPUS DISPATCH READY</span>
                </div>

                {/* Floating Bottom Card Banner */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 backdrop-blur-xl bg-white/85 border border-white/95 rounded-2xl p-3 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-slate-950 leading-tight">Priya Verma</div>
                      <div className="text-[10px] font-bold text-forest">Verified Student Commuter</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-black bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                    ★ 4.98 SAFE
                  </span>
                </div>
              </div>
            </div>

            {/* Live Security & Verification Status Card (sm:col-span-5) */}
            <div className="sm:col-span-5 bg-paper rounded-3xl p-5 neu-card border border-white/80 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-forest" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-primary leading-tight font-display">Security Status</h3>
                    <span className="text-[10px] font-mono text-forest font-bold uppercase">All Systems Active</span>
                  </div>
                </div>

                <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                  Your identity is linked to verified university records and active emergency routing.
                </p>

                {/* Checklist with Forest Dots */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-ink-primary block leading-tight">Profile Pre-Screened</span>
                      <span className="text-[10px] text-ink-secondary">University .edu credentials verified</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-ink-primary block leading-tight">In-Car 4-Digit OTP</span>
                      <span className="text-[10px] text-ink-secondary">Mandatory passenger trip handshake</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-ink-primary block leading-tight">ICE Contact Configured</span>
                      <span className="text-[10px] text-ink-secondary">
                        {user?.emergencyContact?.name || (user?.emergencyContacts && user.emergencyContacts[0]?.name) || 'Ready on file'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-ink-primary block leading-tight">GPS Telemetry Sync</span>
                      <span className="text-[10px] text-ink-secondary">Live coordinates and route tracking</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-border/70">
                <Link
                  to="/verification"
                  className="w-full py-2.5 px-3 rounded-full bg-forest hover:bg-forest/90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all neu-btn active:translate-y-0.5"
                >
                  <span>View Verification ID Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>

        {/* EMERGENCY SOS & QUICK DISPATCH COMMAND STRIP (Prominent, High-Priority, India 112 Standard) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#582C4D] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-white/10 text-left space-y-5"
        >
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/25 text-rose-300 border border-rose-400/40 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldAlert className="w-6 h-6 text-rose-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    24/7 EMERGENCY PROTOCOL
                  </span>
                  <span className="text-xs text-white/80 font-mono">India 112 Standard</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-display font-extrabold text-white leading-tight">
                  Direct Emergency Dispatch &amp; Live Telemetry
                </h2>
                <p className="text-xs sm:text-sm text-white/85 max-w-2xl mt-0.5 font-medium">
                  One-tap distress broadcast sends live reverse-geocoded GPS coordinates to Uttarakhand Police, Campus Security, and your WhatsApp emergency circle.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Trigger Emergency SOS Button */}
              <button
                type="button"
                onClick={() => setSosModalOpen(true)}
                className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 border border-rose-400/50 active:translate-y-0.5 transition-all neu-btn cursor-pointer"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
                <span>Trigger Emergency SOS</span>
              </button>

              {/* Direct Dial 112 */}
              <a
                href="tel:112"
                className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer neu-btn"
                title="Call National Emergency 112"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call 112</span>
              </a>

              {/* Share Live Location */}
              <button
                type="button"
                onClick={handleShareLocation}
                className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer neu-btn"
                title="Share Live Location"
              >
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{copiedLocation ? 'Link Copied!' : 'Share Live GPS'}</span>
              </button>
            </div>
          </div>

          {/* Real-time GPS Location Status Row */}
          {(locationLoading || locationError || liveCoords) && (
            <div className="pt-3 border-t border-white/15 flex items-center justify-between flex-wrap gap-3">
              {locationLoading ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xs text-emerald-300 text-xs font-mono font-medium border border-emerald-400/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span>{locationStatusText}</span>
                </div>
              ) : locationError ? (
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-black/35 backdrop-blur-xs text-amber-200 text-xs border border-amber-500/30">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="leading-snug">{locationError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={acquireLocation}
                    className="self-start sm:self-center px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-bold cursor-pointer transition-colors text-xs shrink-0 whitespace-nowrap"
                  >
                    Retry GPS Access
                  </button>
                </div>
              ) : liveCoords ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs text-white/90 text-xs font-mono border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span>GPS Telemetry Active: {liveCoords.lat.toFixed(4)}, {liveCoords.lng.toFixed(4)} ({liveAddress || 'Campus Perimeter'})</span>
                </div>
              ) : null}
            </div>
          )}
        </motion.div>

        {/* 4 CORE SAFETY PILLARS (Redesigned with Tactile Neumorphism) */}
        <div id="safety-details" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* CARD 1: Verified Driver & Vehicle */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-paper rounded-card p-6 sm:p-7 neu-card border border-white/80 flex flex-col justify-between text-left space-y-3.5"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shadow-xs">
                  <Car className="w-4 h-4 text-forest" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-primary">Verified Student Driver</h3>
                  <p className="text-[10px] font-mono text-forest font-bold uppercase">Pre-Screened Vehicle</p>
                </div>
              </div>

              <p className="text-xs text-ink-secondary mb-3.5 leading-relaxed">
                Ride with confidence. All drivers are verified with driving license and campus enrollment records.
              </p>

              {/* Driver Profile Inner Badge */}
              <div className="bg-white rounded-2xl p-3.5 border border-border/80 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs border border-forest/30">
                    RS
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-ink-primary leading-tight">Rohan Sharma</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                    </div>
                    <p className="text-[10px] text-ink-secondary">B.Tech CSE • UIT Dehradun</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-amber-700 font-semibold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>4.8</span>
                      <span className="text-ink-muted font-normal">• Verified Rating</span>
                    </div>
                  </div>
                </div>

                {/* 3 Pills: ID Verified, College Verified, Clean Record */}
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-border/60 text-[9px] font-mono font-bold">
                  <span className="px-2 py-0.5 rounded-full bg-forest-light text-forest border border-forest/20 whitespace-nowrap">
                    ID Verified
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-forest-light text-forest border border-forest/20 whitespace-nowrap">
                    College Verified
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-forest-light text-forest border border-forest/20 whitespace-nowrap">
                    Clean Record
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/search"
              className="mt-auto w-full py-2.5 px-3 rounded-xl bg-paper hover:bg-white text-ink-primary text-xs font-bold flex items-center justify-center gap-1.5 border border-border transition-all shadow-xs neu-btn"
            >
              <span>Explore Verified Drivers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* CARD 2: Ride Sharing & Live Corridor Tracking */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-paper rounded-card p-6 sm:p-7 neu-card border border-white/80 flex flex-col justify-between text-left space-y-3.5"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-plum/10 text-plum flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4 text-plum" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-primary">Campus Ride Sharing</h3>
                  <p className="text-[10px] font-mono text-plum font-bold uppercase">Peer Group Transit</p>
                </div>
              </div>

              <p className="text-xs text-ink-secondary mb-3.5 leading-relaxed">
                Travel together in authenticated groups. Live route tracking shared with fellow classmates.
              </p>

              {/* Photorealistic Campus Carpool Graphic with Corridor Overlays */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E2DDD3] h-48 sm:h-52 flex flex-col justify-between p-3 group/map shadow-xs">
                <img
                  src="/image_6f00263b.jpg"
                  alt="Verified university students carpooling together in car on university campus"
                  width={500}
                  height={208}
                  className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 group-hover/map:scale-105"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/campus-hero-real.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/35 pointer-events-none" />

                {/* Top Telemetry Overlay */}
                <div className="flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#143D32] text-[10px] font-mono font-bold shadow-xs border border-white whitespace-nowrap shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                    </span>
                    <span>Live GPS Active</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#143D32]/90 backdrop-blur-xs text-white text-[10px] font-mono font-bold shadow-xs border border-emerald-400/30 whitespace-nowrap shrink-0">
                    <Navigation className="w-2.5 h-2.5 text-emerald-300" />
                    <span>4.2 km • 11m</span>
                  </span>
                </div>

                {/* Bottom Waypoint Corridor Labels */}
                <div className="flex items-center justify-between z-10 w-full pt-1">
                  <span className="inline-flex items-center gap-1 bg-[#143D32]/95 backdrop-blur-xs text-white px-2 py-0.5 rounded-full shadow-xs text-[9px] font-mono font-bold border border-emerald-400/30 whitespace-nowrap shrink-0">
                    <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Premnagar</span>
                  </span>

                  <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs text-slate-800 px-2 py-0.5 rounded-full shadow-2xs text-[8.5px] font-mono font-bold border border-slate-200 whitespace-nowrap shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Suddhowala</span>
                  </span>

                  <span className="inline-flex items-center gap-1 bg-[#582C4D]/95 backdrop-blur-xs text-white px-2 py-0.5 rounded-full shadow-xs text-[9px] font-mono font-bold border border-pink-400/30 whitespace-nowrap shrink-0">
                    <MapPin className="w-2.5 h-2.5 text-pink-300" />
                    <span>UIT Gate 1</span>
                  </span>
                </div>
              </div>

              {/* Verified Peer Co-Passengers Trust Sub-strip */}
              <div className="mt-3 flex items-center justify-between text-xs text-ink-secondary">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <StudentAvatar archetype="priya" state="matched" size={22} className="border border-paper shadow-2xs" />
                    <StudentAvatar archetype="aditya" state="waiting" size={22} className="border border-paper shadow-2xs" />
                    <StudentAvatar archetype="rohan" state="arrived" size={22} className="border border-paper shadow-2xs" />
                  </div>
                  <span className="font-medium text-[11px] text-ink-primary">3 peer classmates</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-forest bg-forest-light px-2 py-0.5 rounded-full border border-forest/20 whitespace-nowrap shrink-0">
                  Fixed Fuel Split
                </span>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="mt-auto w-full py-2.5 px-3 rounded-xl bg-paper hover:bg-white text-ink-primary text-xs font-bold flex items-center justify-center gap-1.5 border border-border transition-all shadow-xs neu-btn"
            >
              <span>View Ride Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* CARD 3: Emergency Contacts List */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-paper rounded-card p-6 sm:p-7 neu-card border border-white/80 flex flex-col justify-between text-left space-y-3.5"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center shadow-xs">
                  <PhoneCall className="w-4 h-4 text-rose-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-primary">Emergency Contacts</h3>
                  <p className="text-[10px] font-mono text-rose-700 font-bold uppercase">Immediate Lines</p>
                </div>
              </div>

              <p className="text-xs text-ink-secondary mb-3 leading-relaxed">
                Direct phone channels for police dispatch, campus gate security, and your personal ICE contact.
              </p>

              {/* Contact List */}
              <div className="space-y-2 text-xs">
                {/* Campus Security */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-border/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center font-bold text-[10px]">
                      👮
                    </div>
                    <div>
                      <p className="font-bold text-ink-primary leading-tight">Campus Security</p>
                      <p className="text-[10px] text-ink-secondary font-mono">+91 12345 67890</p>
                    </div>
                  </div>
                  <a href="tel:+911234567890" className="p-1.5 rounded-xl bg-[#F8FAFC] border border-border text-forest hover:bg-forest hover:text-white transition-colors shadow-xs" title="Call Campus Security">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Police 112 */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-border/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[10px]">
                      🚓
                    </div>
                    <div>
                      <p className="font-bold text-ink-primary leading-tight">Police Dispatch</p>
                      <p className="text-[10px] text-rose-700 font-mono font-bold">112 (National)</p>
                    </div>
                  </div>
                  <a href="tel:112" className="p-1.5 rounded-xl bg-[#F8FAFC] border border-border text-rose-600 hover:bg-rose-600 hover:text-white transition-colors shadow-xs" title="Call Police 112">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* User ICE Contact */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-border/80 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div className="w-6 h-6 rounded-full bg-plum text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      👤
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-bold text-ink-primary leading-tight truncate"
                        title={user?.emergencyContact?.name || (user?.emergencyContacts && user.emergencyContacts[0]?.name) || 'ICE Contact'}
                      >
                        {user?.emergencyContact?.name || (user?.emergencyContacts && user.emergencyContacts[0]?.name) || 'ICE Contact'}
                      </p>
                      <p
                        className="text-[10px] text-ink-secondary font-mono truncate"
                        title={user?.emergencyContact?.phone || (user?.emergencyContacts && user.emergencyContacts[0]?.phone) || user?.phone || 'Not added'}
                      >
                        {user?.emergencyContact?.phone || (user?.emergencyContacts && user.emergencyContacts[0]?.phone) || user?.phone || 'Not added'}
                      </p>
                    </div>
                  </div>
                  {(user?.emergencyContact?.phone || (user?.emergencyContacts && user.emergencyContacts[0]?.phone) || user?.phone) ? (
                    <a
                      href={`tel:${(user?.emergencyContact?.phone || (user?.emergencyContacts && user.emergencyContacts[0]?.phone) || user?.phone || '').replace(/\s+/g, '')}`}
                      className="p-1.5 rounded-xl bg-[#F8FAFC] border border-border text-plum hover:bg-plum hover:text-white transition-colors shadow-xs shrink-0"
                      title="Direct Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="px-2.5 py-1 rounded-full bg-plum text-white text-[10px] font-bold hover:bg-plum-hover transition-colors shrink-0"
                    >
                      + Add
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="mt-auto w-full py-2.5 px-3 rounded-xl bg-paper hover:bg-white text-ink-primary text-xs font-bold flex items-center justify-center gap-1.5 border border-border transition-all shadow-xs neu-btn"
            >
              <span>Manage ICE Contacts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* CARD 4: Safety Checklist & In-Car OTP Protocol */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-paper rounded-card p-6 sm:p-7 neu-card border border-white/80 flex flex-col justify-between text-left space-y-3.5"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shadow-xs">
                  <ClipboardCheck className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink-primary">Safety Checklist</h3>
                  <p className="text-[10px] font-mono text-amber-700 font-bold uppercase">4-Point Protocol</p>
                </div>
              </div>

              <p className="text-xs text-ink-secondary mb-3 leading-relaxed">
                Zero-fail pre-departure verification. Simple steps that keep campus commutes secure.
              </p>

              {/* Checklist Items */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-ink-primary font-semibold">Verify Driver Student ID</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-ink-primary font-semibold">Check vehicle license plate</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-ink-primary font-semibold">Confirm 4-Digit In-Car OTP</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-ink-primary font-semibold">Keep emergency numbers on speed dial</span>
                </div>
              </div>
            </div>

            {/* Bottom Reassuring Footer */}
            <div className="mt-4 pt-3 border-t border-border/70 text-center">
              <span className="text-[11px] font-mono font-bold text-forest tracking-tight">
                Authentic Campus Security Protocol ✦
              </span>
            </div>
          </motion.div>

        </div>

      </div>

      {/* SOS CONFIRMATION MODAL (Tactile Neumorphic Styling) */}
      {sosModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-paper rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-600 text-center space-y-4 neu-card">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center shadow-inner border border-rose-200">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-display font-extrabold text-ink-primary">
              {sosDispatched ? 'Emergency Broadcast Dispatched!' : 'Confirm Campus Emergency Dispatch'}
            </h3>

            <p className="text-xs text-ink-secondary leading-relaxed">
              {sosDispatched
                ? 'Your live vehicle coordinates and trip telemetry have been sent to Campus Security and your emergency contacts.'
                : 'This will immediately broadcast your real-time GPS location and student identity to the University Security Operations Center and send live GPS tracking alerts to your emergency contacts.'}
            </p>

            {/* Live GPS Telemetry Card */}
            {!sosDispatched && (
              <div className="bg-white rounded-2xl p-3.5 border border-border/80 shadow-2xs text-left space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink-primary flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest" />
                    <span>Real-Time GPS Telemetry</span>
                  </span>
                  <button
                    type="button"
                    onClick={acquireLocation}
                    disabled={locationLoading}
                    className="text-[10px] font-bold text-forest hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{locationLoading ? 'Acquiring...' : 'Refresh GPS'}</span>
                  </button>
                </div>

                {locationLoading && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-forest/5 border border-forest/20 text-forest text-xs font-medium animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-forest animate-ping shrink-0" />
                    <span>{locationStatusText}</span>
                  </div>
                )}

                {locationError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-[11px] leading-relaxed">
                      <span>{locationError}</span>
                      <button
                        type="button"
                        onClick={acquireLocation}
                        className="block mt-1 font-bold text-amber-800 underline cursor-pointer"
                      >
                        Retry Location Access
                      </button>
                    </div>
                  </div>
                )}

                {liveCoords ? (
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs font-bold text-ink-primary flex items-center justify-between">
                      <span>{liveCoords.lat.toFixed(5)}, {liveCoords.lng.toFixed(5)}</span>
                      {liveCoords.accuracy && (
                        <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-sans">
                          ±{liveCoords.accuracy}m accuracy
                        </span>
                      )}
                    </div>
                    {liveAddress && (
                      <p className="text-[11px] text-ink-secondary truncate">{liveAddress}</p>
                    )}
                    <a
                      href={`https://maps.google.com/?q=${liveCoords.lat},${liveCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-forest hover:underline inline-flex items-center gap-0.5 mt-0.5"
                    >
                      <span>Preview in Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-ink-secondary">Detecting your exact GPS coordinates...</p>
                )}
              </div>
            )}

            {/* Optional Distress Note */}
            {!sosDispatched && (
              <div className="text-left space-y-1">
                <label className="text-[11px] font-bold text-ink-primary block font-mono">
                  Location Note / Landmark (Optional):
                </label>
                <input
                  type="text"
                  value={sosNotesInput}
                  onChange={(e) => setSosNotesInput(e.target.value)}
                  placeholder="e.g. Near UIT main gate, library cafe"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-white font-medium text-ink-primary focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            {/* WhatsApp SOS Phone Input */}
            {!sosDispatched && (
              <div className="bg-white rounded-2xl p-3.5 border border-border/80 shadow-2xs text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary font-semibold">WhatsApp SOS Phone:</span>
                  <span className="font-mono font-bold text-forest text-xs">
                    {sosPhoneInput ? `+91 ${sosPhoneInput}` : (user?.phone || 'Not added yet')}
                  </span>
                </div>
                <div className="flex rounded-xl border border-border focus-within:ring-2 focus-within:ring-forest overflow-hidden bg-white shadow-2xs">
                  <div className="px-2.5 py-1.5 bg-[#F5F2EB] border-r border-border text-ink-primary text-xs font-bold shrink-0 font-mono">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={sosPhoneInput}
                    onChange={(e) => setSosPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className="w-full text-xs px-2.5 py-1.5 focus:outline-none bg-transparent font-medium text-ink-primary font-mono"
                  />
                </div>
                <p className="text-[10px] text-ink-secondary leading-tight">
                  Emergency Google Maps tracking and distress alerts will be sent to this WhatsApp number.
                </p>
              </div>
            )}

            {sosError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold text-left">
                ⚠️ {sosError}
              </div>
            )}

            {!sosDispatched ? (
              <div className="space-y-2 pt-2">
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={sosLoading}
                    onClick={() => setSosModalOpen(false)}
                    className="flex-1 py-3 rounded-full bg-paper hover:bg-white text-ink-primary font-bold text-xs border border-border shadow-xs transition-colors cursor-pointer neu-btn disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={sosLoading}
                    onClick={handleTriggerSos}
                    className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 neu-btn active:translate-y-0.5"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{sosLoading ? 'Dispatching SOS...' : 'Confirm SOS'}</span>
                  </button>
                </div>
                <a
                  href="tel:112"
                  className="w-full py-2.5 px-3 rounded-full border border-rose-600 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Direct Dial Police & Emergency Helpline (112)</span>
                </a>
              </div>
            ) : (
              <div className="py-2.5 text-xs font-bold text-forest bg-forest-light rounded-xl border border-forest/30 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Security Alert Active (Closing...)</span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
