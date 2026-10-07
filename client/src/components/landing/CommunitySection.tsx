import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, ArrowRight, Clock } from 'lucide-react';
import { DEMO_STUDENTS } from '../../data/mockData';
import { PageHeroBanner } from '../common/PageHeroBanner';
import communityImg from '../../assets/illustrations/community.webp';

export const CommunitySection: React.FC = () => {
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);
  const studentsList = Object.values(DEMO_STUDENTS);

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      <PageHeroBanner image={communityImg} alt="Students celebrating beside a CampusRide car on campus" caption="CAMPUS COMMUNITY" />

      {/* Editorial Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-sm shadow-emerald-950/5 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-5xl">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            04 — STUDENT PROFILES ON YOUR CORRIDOR
          </span>
          <h2 className="text-heading-clamp font-black text-[#143D32] uppercase tracking-tight">
            The Best Route<br />
            Might Already<br />
            Have Someone On It.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
            Real peers commuting from your neighborhood. Tap any profile pass to inspect their daily trajectory and book a seat.
          </p>
        </div>

        <Link
          to="/search"
          className="text-xs font-mono font-bold text-white bg-[#143D32] hover:bg-[#1A4F41] px-5 py-3 rounded-2xl flex items-center gap-2 self-start md:self-auto transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
          data-cursor="ALL PEERS"
        >
          <span>EXPLORE ALL VERIFIED RIDERS</span>
          <ArrowRight className="w-4 h-4 text-emerald-300" />
        </Link>
      </div>

      {/* Grid of Micro-Interaction Student Passes */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentsList.slice(0, 4).map((student) => {
          const isHovered = hoveredStudentId === student.id;

          return (
            <div
              key={student.id}
              onMouseEnter={() => setHoveredStudentId(student.id)}
              onMouseLeave={() => setHoveredStudentId(null)}
              className="bg-white/95 backdrop-blur-sm rounded-2xl border border-emerald-100 p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500 hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                {/* Header: Departure & Fare */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{student.commuteRoute.departureTime}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#143D32]">₹{student.commuteRoute.fare}</span>
                    <span className="text-[10px] text-slate-500 ml-1">split</span>
                  </div>
                </div>

                {/* Student Avatar & Identity */}
                <div className="mt-5 flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#DDE1DE] transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-sm font-bold text-[#111111]">
                      <span className="truncate">{student.name}</span>
                      <ShieldCheck className="w-4 h-4 text-[#18A66A] shrink-0" />
                    </div>
                    <p className="text-xs text-[#646A67] truncate">{student.collegeShort}</p>
                    <p className="text-[10px] text-[#98A2B3] font-mono uppercase mt-0.5">
                      {student.role.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Commute Route Corridor */}
                <div className="mt-5 pt-4 border-t border-[#DDE1DE]">
                  <div className="text-xs font-semibold text-[#111111] flex items-center justify-between">
                    <span className="truncate">{student.commuteRoute.origin.split('(')[0]}</span>
                    <span className="text-[#18A66A] ml-1 shrink-0 font-mono text-[11px]">→ Campus</span>
                  </div>

                  {/* Animated Route Progress Bar */}
                  <div className="mt-2.5 h-1.5 w-full bg-[#F5F6F3] rounded-full overflow-hidden border border-[#DDE1DE]">
                    <div
                      className={`h-full bg-emerald-600 rounded-full transition-all duration-500 ${
                        isHovered ? 'w-full' : 'w-1/3'
                      }`}
                    />
                  </div>
                </div>

                {/* Secondary metadata that reveals on hover */}
                <div className="mt-4 text-xs text-[#646A67] leading-relaxed line-clamp-2 italic">
                  "{student.bio}"
                </div>
              </div>

              {/* Footer: Rating, Punctuality & Link */}
              <div className="mt-6 pt-4 border-t border-[#DDE1DE] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="flex items-center gap-1 font-bold text-[#111111]">
                    <Star className="w-3.5 h-3.5 fill-[#F79009] text-[#F79009]" />
                    {student.rating.toFixed(1)}
                  </span>
                  <span className="text-[#DDE1DE]">•</span>
                  <span className="text-[#18A66A] font-semibold">{student.punctualityRate}% on-time</span>
                </div>

                <Link
                  to="/search"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#143D32] group-hover:text-emerald-700 transition-colors"
                >
                  <span>Ride</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Backwards-compatible alias
export const FindYourPeople = CommunitySection;
