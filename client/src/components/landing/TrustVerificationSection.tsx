import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Star, Key, Lock, PhoneCall, AlertCircle, Sparkles } from 'lucide-react';
import { AvatarFrame } from '../signature/AvatarFrame';
import { DestinationStamp } from '../signature/DestinationStamp';
import { TactileStudentBadge } from '../signature/TactileStudentBadge';
// Photorealistic Campus Verification Section
const verificationHeroImg = '/verification-student-real.jpg';

interface VerifiedStudent {
  id: string;
  name: string;
  role: string;
  college: string;
  department: string;
  year: string;
  rating: number;
  totalTrips: number;
  safetyScore: number;
  vehicle?: string;
  avatar: string;
  badges: string[];
  otpSimulatorCode: string;
}

const PROFILES: VerifiedStudent[] = [
  {
    id: 'aditya',
    name: 'Aditya Kumar',
    role: 'Verified Student Driver (4th Year)',
    college: 'University of Petroleum & Energy Studies (UPES)',
    department: 'B.Tech Computer Science & Engineering',
    year: 'Class of 2025',
    rating: 4.96,
    totalTrips: 24,
    safetyScore: 100,
    vehicle: 'Honda City (UK 07 AK 4821) • Insured & Inspected',
    avatar: '/hero-aditya-driver.jpg',
    badges: ['UPES Edu Email', 'Physical Campus ID', 'Driving License', 'Vehicle Registration'],
    otpSimulatorCode: '4 8 2 1',
  },
  {
    id: 'priya',
    name: 'Priya Verma',
    role: 'Verified Student Driver (3rd Year)',
    college: 'Graphic Era Hill University (GEHU)',
    department: 'B.Tech Information Technology',
    year: 'Class of 2025',
    rating: 4.98,
    totalTrips: 31,
    safetyScore: 100,
    vehicle: 'Tata Altroz (UK 07 BE 5541) • Insured & Inspected',
    avatar: '/safety-student-real.jpg',
    badges: ['GEHU Edu Email', 'Physical Campus ID', 'Driving License', 'Safety Certified'],
    otpSimulatorCode: '9 3 0 4',
  },
  {
    id: 'rohan',
    name: 'Rohan Sharma',
    role: 'Verified Student Driver (2nd Year)',
    college: 'DIT University',
    department: 'B.Tech Mechanical Engineering',
    year: 'Class of 2026',
    rating: 4.92,
    totalTrips: 18,
    safetyScore: 99,
    vehicle: 'Maruti Baleno (UK 07 CQ 8812) • Insured & Inspected',
    avatar: '/dashboard-students-real.jpg',
    badges: ['DIT Edu Email', 'Physical Campus ID', 'Driving License', 'Emergency Contact Linked'],
    otpSimulatorCode: '7 1 6 5',
  },
];

export const TrustVerificationSection: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<VerifiedStudent>(PROFILES[0]);
  const [otpSimulated, setOtpSimulated] = useState(false);

  return (
    <section id="trust" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EAECF0]">
      {/* Visual Campus Verification Banner - Photorealistic Student ID Standard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden border-2 border-white shadow-[0_16px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] mb-12 group bg-slate-900"
      >
        <img
          src={verificationHeroImg}
          alt="Authentic university student commuter holding authenticated campus smart ID card at campus gate"
          className="w-full h-[480px] sm:h-[540px] md:h-[600px] object-cover object-[center_33%] transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Balanced Vignette Overlay preserving center face and ID card */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/30 pointer-events-none" />

        {/* Floating Top Pill Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-md text-slate-900 text-xs font-mono font-black">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>DEHRADUN CAMPUS SECURITY PROTOCOL</span>
        </div>

        {/* Smartcard Identification Indicator Pill (Floating near ID Card) */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border border-emerald-500/40 shadow-lg">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Physical Collegiate Smartcard • Pre-Screened</span>
        </div>

        {/* Floating Bottom Card Banner with Solid High-Contrast White Standard */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-20 bg-white border-2 border-slate-100 p-5 sm:p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-800 font-extrabold uppercase tracking-wider mb-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AUTHENTICATED INSTITUTIONAL NETWORK</span>
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-slate-950 leading-tight">
              100% Verified University Peers. Zero Strangers.
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-xl font-medium">
              Every commuter is pre-screened with their active university .edu credentials, government driving license, and campus smartcard.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#582C4D] text-white text-xs font-mono font-black px-4 py-2.5 rounded-2xl shadow-lg border border-[#582C4D]/30 self-start sm:self-auto shrink-0 hover:scale-105 transition-transform">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>2,400+ ACTIVE VERIFIED PEERS</span>
          </div>
        </div>
      </motion.div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto"
      >
        <p className="text-xs font-mono text-purple-900 font-black bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-block">
          Section 04 / Identity & Trust Engine
        </p>
        <h2 className="mt-3 text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
          Who's In The Car?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 font-medium">
          CampusRide is not an anonymous taxi platform. Every single person in the car is an authenticated university peer with verified institutional credentials.
        </p>
      </motion.div>

      {/* 4 Trust Pillars with Tactile Neumorphic Styling & Micro-Lifts */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 sm:p-7 rounded-card border border-slate-200 shadow-2xs hover:shadow-lg transition-all h-full flex flex-col justify-between space-y-3.5"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">College Verified</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Strict authentication through university .edu email domains and student ID card validation.
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 sm:p-7 rounded-card border border-slate-200 shadow-2xs hover:shadow-lg transition-all h-full flex flex-col justify-between space-y-3.5"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-[#143D32] text-white flex items-center justify-center mb-4 shadow-md">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Secure Trip OTP</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Driver generates an in-app OTP upon arrival. Passenger validates before the car moves.
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 sm:p-7 rounded-card border border-slate-200 shadow-2xs hover:shadow-lg transition-all h-full flex flex-col justify-between space-y-3.5"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Ride History & Metrics</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Transparent records of total on-time trips, punctuality scores, and route reliability records.
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 sm:p-7 rounded-card border border-slate-200 shadow-2xs hover:shadow-lg transition-all h-full flex flex-col justify-between space-y-3.5"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-4 shadow-md">
              <Star className="w-6 h-6 fill-slate-950 text-slate-950" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Community Rating</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans font-medium">
              Mutual feedback after every ride keeps accountability high and weeds out bad behavior.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Interactive Sliding Student Profile Showcase */}
      <div className="mt-16 bg-[#FFFFFF] rounded-2xl border border-[#EAECF0] p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EAECF0]">
          <div>
            <span className="text-xs font-mono uppercase text-[#667085] block">
              INTERACTIVE PROFILE AUTHENTICATOR
            </span>
            <span className="text-sm font-bold text-[#101828]">
              Select a verified student profile to inspect credential layers:
            </span>
          </div>

          {/* Student Profile Switcher Tabs */}
          {/* Student Profile Switcher Tabs */}
          <div className="flex items-center gap-2">
            {PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedStudent(p);
                  setOtpSimulated(false);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedStudent.id === p.id
                    ? 'bg-[#582C4D] text-white shadow-sm'
                    : 'bg-[#F7F8FA] text-[#667085] hover:text-[#582C4D] border border-[#EAECF0]'
                }`}
              >
                {p.name.split(' ')[0]} (Driver)
              </button>
            ))}
          </div>
        </div>

        {/* Sliding Profile Card Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Student ID Card Simulation */}
          <div className="lg:col-span-7 bg-[#F7F8FA] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-ink-primary font-display">{selectedStudent.name}</h3>
                    <ShieldCheck className="w-5 h-5 text-route" />
                  </div>
                  <p className="text-xs font-semibold text-route mt-0.5">{selectedStudent.role}</p>
                  <p className="text-xs text-ink-secondary mt-1">{selectedStudent.college}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DestinationStamp status="verified" label="STUDENT ID VERIFIED" issuedDate="Academic Yr 2026" />
              </div>
            </div>

            {/* Department & Academic Info */}
            <div className="mt-6 pt-5 border-t border-[#EAECF0] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-[#667085] block text-[10px] uppercase">Department</span>
                <span className="font-bold text-[#101828]">{selectedStudent.department}</span>
              </div>
              <div>
                <span className="text-[#667085] block text-[10px] uppercase">Batch</span>
                <span className="font-bold text-[#101828]">{selectedStudent.year}</span>
              </div>
              <div>
                <span className="text-[#667085] block text-[10px] uppercase">Trips Completed</span>
                <span className="font-bold text-[#12B76A]">{selectedStudent.totalTrips} verified</span>
              </div>
            </div>

            {/* Vehicle if driver */}
            {selectedStudent.vehicle && (
              <div className="mt-4 p-3 bg-[#FFFFFF] rounded-xl border border-[#EAECF0] text-xs font-mono text-[#101828] flex items-center gap-2">
                <span>🚗</span>
                <span className="font-bold">Vehicle:</span>
                <span className="text-[#667085]">{selectedStudent.vehicle}</span>
              </div>
            )}

            {/* Verification Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedStudent.badges.map((b, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-[#FFFFFF] border border-[#EAECF0] text-[11px] font-mono text-[#027A48] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A]" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Interactive 4-Digit OTP Simulation */}
          <div className="lg:col-span-5 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#667085] uppercase">
                <Key className="w-4 h-4 text-[#175CD3]" />
                <span>Pickup Verification Handshake</span>
              </div>

              <h4 className="mt-3 text-lg font-bold text-[#101828]">
                Real-Time OTP Protection
              </h4>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Before passenger enters the car, driver shows this code. This prevents mistaken pickups, ensures GPS tracking starts, and notifies emergency contacts.
              </p>

              {/* Code Display Box */}
              <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white text-slate-800 rounded-2xl text-center font-mono border-2 border-emerald-200/80 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
                <span className="text-[11px] text-emerald-800 font-mono block mb-2 font-bold">
                  Secure Trip Token
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-[0.35em] text-[#143D32] drop-shadow-xs py-1">
                  {otpSimulated ? selectedStudent.otpSimulatorCode : '• • • •'}
                </div>
                <div className="text-xs text-emerald-700 mt-2 font-semibold flex items-center justify-center gap-1.5 bg-white/90 py-1.5 px-3 rounded-xl border border-emerald-200 max-w-fit mx-auto shadow-2xs">
                  <span className={`w-2 h-2 rounded-full ${otpSimulated ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  <span>{otpSimulated ? '✓ Handshake Verified & Active' : 'Waiting for driver arrival simulation...'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAECF0]">
              <button
                onClick={() => setOtpSimulated(!otpSimulated)}
                className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  otpSimulated
                    ? 'bg-[#ECFDF3] text-[#027A48] border border-[#D1FADF]'
                    : 'bg-[#582C4D] hover:bg-[#431f3a] text-white font-bold shadow-md shadow-[#582C4D]/25'
                }`}
              >
                {otpSimulated ? 'Reset Handshake Simulator' : 'Simulate Driver OTP Reveal →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

