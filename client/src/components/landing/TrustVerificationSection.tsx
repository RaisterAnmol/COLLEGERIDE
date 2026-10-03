import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Star, Key, Lock, PhoneCall, AlertCircle, Sparkles } from 'lucide-react';

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
    id: 'ichigo',
    name: 'Ichigo Kurosaki',
    role: 'Verified Driver',
    college: 'Uttaranchal University (UIT)',
    department: 'B.Tech Computer Science & Engineering',
    year: 'Class of 2025',
    rating: 4.95,
    totalTrips: 24,
    safetyScore: 100,
    vehicle: 'Honda City (UK 07 AK 4821) • Insured & Inspected',
    avatar: '/test_uploads/driver_male_ichigo.jpg',
    badges: ['UIT .edu Verified', 'Driving License Authenticated', 'Zero Detour Violations'],
    otpSimulatorCode: '4 8 2 1',
  },
  {
    id: 'makima',
    name: 'Makima San',
    role: 'Verified Driver (Women-Only Anchor)',
    college: 'UPES University (Bidholi)',
    department: 'B.Tech Artificial Intelligence & DS',
    year: 'Class of 2024',
    rating: 5.0,
    totalTrips: 38,
    safetyScore: 100,
    vehicle: 'Honda City i-VTEC (UK 07 UP 9901)',
    avatar: '/test_uploads/driver_female_makima.jpg',
    badges: ['UPES .edu Verified', 'Women-Only Commute Anchor', 'Top Rated Peer'],
    otpSimulatorCode: '9 3 0 4',
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    role: 'Verified Peer Driver',
    college: 'Graphic Era University',
    department: 'B.Tech Mechanical Engineering',
    year: 'Class of 2026',
    rating: 4.88,
    totalTrips: 19,
    safetyScore: 99,
    vehicle: 'Royal Enfield Classic (UK 07 RZ 3321)',
    avatar: '/test_uploads/driver_male_zoro.jpg',
    badges: ['GEU .edu Verified', '100% On-Time Pickup', 'Emergency Contact Linked'],
    otpSimulatorCode: '7 1 6 5',
  },
];

export const TrustVerificationSection: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<VerifiedStudent>(PROFILES[0]);
  const [otpSimulated, setOtpSimulated] = useState(false);

  return (
    <section id="trust" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EAECF0]">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-[#175CD3] font-semibold">
          Section 04 / Identity & Trust Engine
        </p>
        <h2 className="mt-2 text-4xl sm:text-6xl font-black text-[#101828] uppercase tracking-tight">
          Who's In The Car?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#667085]">
          CampusRide is not an anonymous taxi platform. Every single person in the car is an authenticated university peer with verified institutional credentials.
        </p>
      </div>

      {/* 4 Trust Pillars */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#EAECF0] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#EFF8FF] text-[#175CD3] flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#101828]">College Verified</h3>
          <p className="mt-2 text-xs text-[#667085] leading-relaxed">
            Strict authentication through university .edu email domains and student ID card validation.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#EAECF0] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF3] text-[#12B76A] flex items-center justify-center mb-4">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#101828]">Secure Trip OTP</h3>
          <p className="mt-2 text-xs text-[#667085] leading-relaxed">
            Driver generates an in-app OTP upon arrival. Passenger validates before the car moves.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#EAECF0] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] text-[#101828] flex items-center justify-center mb-4 border border-[#EAECF0]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#101828]">Ride History & Metrics</h3>
          <p className="mt-2 text-xs text-[#667085] leading-relaxed">
            Transparent records of total on-time trips, punctuality scores, and route reliability records.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#EAECF0] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#FEF0C7] text-[#B54708] flex items-center justify-center mb-4">
            <Star className="w-5 h-5 fill-[#F79009] text-[#F79009]" />
          </div>
          <h3 className="text-base font-bold text-[#101828]">Community Rating</h3>
          <p className="mt-2 text-xs text-[#667085] leading-relaxed">
            Mutual feedback after every ride keeps accountability high and weeds out bad behavior.
          </p>
        </div>
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
          <div className="flex items-center gap-2">
            {PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedStudent(p);
                  setOtpSimulated(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedStudent.id === p.id
                    ? 'bg-[#143D32] text-white font-bold shadow-sm'
                    : 'bg-[#F7F8FA] text-[#667085] hover:text-[#143D32] border border-[#EAECF0]'
                }`}
              >
                {p.name.split(' ')[0]} ({p.role.includes('Driver') ? 'Driver' : 'Passenger'})
              </button>
            ))}
          </div>
        </div>

        {/* Sliding Profile Card Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Student ID Card Simulation */}
          <div className="lg:col-span-7 bg-[#F7F8FA] p-6 sm:p-8 rounded-2xl border border-[#EAECF0] transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=143D32&color=fff&bold=true`;
                  }}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#175CD3] shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#101828]">{selectedStudent.name}</h3>
                    <ShieldCheck className="w-5 h-5 text-[#12B76A]" />
                  </div>
                  <p className="text-xs font-semibold text-[#175CD3] mt-0.5">{selectedStudent.role}</p>
                  <p className="text-xs text-[#667085] mt-1">{selectedStudent.college}</p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-2xl font-black text-[#101828]">{selectedStudent.safetyScore}</span>
                <span className="text-[10px] text-[#667085] block uppercase">Safety Score</span>
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
              <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white text-slate-800 rounded-2xl text-center font-mono border-2 border-emerald-200/80 shadow-md shadow-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
                <span className="text-[11px] text-emerald-800 uppercase tracking-widest block mb-2 font-bold">
                  SECURE TRIP TOKEN
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-[0.35em] text-[#143D32] drop-shadow-xs py-1">
                  {otpSimulated ? selectedStudent.otpSimulatorCode : '• • • •'}
                </div>
                <div className="text-xs text-emerald-700 mt-2 font-semibold flex items-center justify-center gap-1.5 bg-white/90 py-1.5 px-3 rounded-xl border border-emerald-200 max-w-fit mx-auto shadow-2xs">
                  <span className={`w-2 h-2 rounded-full ${otpSimulated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
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
                    : 'bg-[#143D32] hover:bg-[#0f2e26] text-white font-bold shadow-md shadow-emerald-950/20'
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

