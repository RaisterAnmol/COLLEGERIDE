import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Star, Key, Lock, PhoneCall, AlertCircle, Sparkles } from 'lucide-react';
import { DEMO_STUDENTS } from '../../data/mockData';

export const TrustVerificationFlow: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState(DEMO_STUDENTS.aditya);
  const [otpSimulated, setOtpSimulated] = useState(false);

  return (
    <section id="safety" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      {/* Editorial Header */}
      <div className="max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-3">
          08 — VERIFIED IDENTITY & SAFETY PROTOCOL
        </span>
        <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
          Know Who<br />
          You're Riding With.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#646A67] max-w-2xl">
          CampusRide is strictly closed to the general public. Every commuter must pass institutional identity checks before entering a carpool.
        </p>
      </div>

      {/* 4 Trust Pillars */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1769FF] flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#111111]">College Verified</h3>
          <p className="mt-2 text-xs text-[#646A67] leading-relaxed">
            Institutional authentication through official university email domains (.edu/.ac.in) and physical student IDs.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#18A66A] flex items-center justify-center mb-4">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#111111]">Phone & OTP Verified</h3>
          <p className="mt-2 text-xs text-[#646A67] leading-relaxed">
            Dynamic 4-digit code revealed on departure. Both parties confirm before wheels turn.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F5F6F3] text-[#111111] flex items-center justify-center mb-4 border border-[#DDE1DE]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#111111]">Vehicle Verified</h3>
          <p className="mt-2 text-xs text-[#646A67] leading-relaxed">
            Official vehicle registration, driver license authentication, and college parking permit checks.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DDE1DE] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-4">
            <Star className="w-5 h-5 fill-[#F79009] text-[#F79009]" />
          </div>
          <h3 className="text-base font-bold text-[#111111]">Community Rated</h3>
          <p className="mt-2 text-xs text-[#646A67] leading-relaxed">
            Mutual post-ride reviews maintain high accountability, courtesy standards, and safety records.
          </p>
        </div>
      </div>

      {/* Interactive Identity Card & Live OTP Simulator */}
      <div className="mt-12 bg-[#FFFFFF] rounded-2xl border border-[#DDE1DE] p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DDE1DE]">
          <div>
            <span className="text-xs font-mono uppercase text-[#646A67] block">IDENTITY INSPECTION LAB</span>
            <span className="text-sm font-bold text-[#111111]">
              Select a commuter persona to examine verified security credentials:
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[DEMO_STUDENTS.aditya, DEMO_STUDENTS.ananya, DEMO_STUDENTS.rahul].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedStudent(p);
                  setOtpSimulated(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  selectedStudent.id === p.id
                    ? 'bg-[#111111] text-white border-[#111111] font-bold shadow-xs'
                    : 'bg-[#F5F6F3] text-[#646A67] border-[#DDE1DE] hover:text-[#111111]'
                }`}
              >
                {p.name.split(' ')[0]} ({p.role.toUpperCase()})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Persona Card */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Identity Credentials */}
          <div className="lg:col-span-7 bg-[#F5F6F3] p-6 sm:p-8 rounded-2xl border border-[#DDE1DE]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#1769FF]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xl font-bold text-[#111111]">{selectedStudent.name}</h4>
                    <ShieldCheck className="w-5 h-5 text-[#18A66A]" />
                  </div>
                  <p className="text-xs font-semibold text-[#1769FF] mt-0.5">{selectedStudent.department}</p>
                  <p className="text-xs text-[#646A67] mt-0.5">{selectedStudent.college}</p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-2xl font-black text-[#111111]">{selectedStudent.punctualityRate}%</span>
                <span className="text-[10px] text-[#646A67] block uppercase">Punctuality</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#DDE1DE] grid grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <span className="text-[#646A67] block text-[10px] uppercase">Batch</span>
                <span className="font-bold text-[#111111]">{selectedStudent.batch}</span>
              </div>
              <div>
                <span className="text-[#646A67] block text-[10px] uppercase">Trips Completed</span>
                <span className="font-bold text-[#18A66A]">{selectedStudent.totalRides} rides</span>
              </div>
              <div>
                <span className="text-[#646A67] block text-[10px] uppercase">Rating</span>
                <span className="font-bold text-[#111111]">★ {selectedStudent.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {selectedStudent.vehicle && (
              <div className="mt-4 p-3 bg-[#FFFFFF] rounded-xl border border-[#DDE1DE] text-xs font-mono text-[#111111] flex items-center justify-between">
                <span>🚗 {selectedStudent.vehicle.model}</span>
                <span className="text-[#646A67] font-bold">{selectedStudent.vehicle.number}</span>
              </div>
            )}
          </div>

          {/* Real-time Handshake OTP Box */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-[#FFFFFF] rounded-2xl border border-[#DDE1DE] flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono uppercase text-[#646A67] flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#1769FF]" />
                <span>CRYPTOGRAPHIC TRIP TOKEN</span>
              </span>
              <h4 className="text-xl font-bold text-[#111111] mt-2">Zero-Mistake Handshake</h4>
              <p className="mt-2 text-xs text-[#646A67] leading-relaxed">
                Prevents accidental or unauthorized pickups. Passenger enters this 4-digit code to initialize ride tracking and alert emergency circles.
              </p>

              {/* Code Display Box */}
              <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white text-slate-800 rounded-2xl text-center font-mono border-2 border-emerald-200/80 shadow-md shadow-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
                <span className="text-[11px] text-emerald-800 uppercase tracking-widest block mb-2 font-bold">
                  SECURE TRIP TOKEN
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-[0.35em] text-[#143D32] drop-shadow-xs py-1">
                  {otpSimulated ? '4 8 2 1' : '• • • •'}
                </div>
                <div className="text-xs text-emerald-700 mt-2 font-semibold flex items-center justify-center gap-1.5 bg-white/90 py-1.5 px-3 rounded-xl border border-emerald-200 max-w-fit mx-auto shadow-2xs">
                  <span className={`w-2 h-2 rounded-full ${otpSimulated ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{otpSimulated ? '✓ Handshake Authenticated & Active' : 'Press button below to simulate departure token'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOtpSimulated(!otpSimulated)}
              className={`w-full py-3 rounded-xl text-xs font-mono font-bold transition-all ${
                otpSimulated
                  ? 'bg-[#ECFDF5] text-[#18A66A] border border-[#D1FAE5]'
                  : 'bg-[#143D32] hover:bg-[#0f2e26] text-white font-bold shadow-md shadow-emerald-950/20'
              }`}
            >
              {otpSimulated ? 'Reset OTP Simulation' : 'Simulate Driver OTP Handshake →'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

