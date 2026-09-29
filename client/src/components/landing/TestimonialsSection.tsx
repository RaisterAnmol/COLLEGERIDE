import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Quote } from 'lucide-react';
import { DEMO_STUDENTS } from '../../data/mockData';

export const TestimonialsSection: React.FC = () => {
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const stories = [
    DEMO_STUDENTS.ananya,
    DEMO_STUDENTS.rahul,
    DEMO_STUDENTS.aditya,
    DEMO_STUDENTS.priya,
  ];
  const current = stories[activeStoryIdx];

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      {/* Editorial Header */}
      <div className="max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-3">
          09 — STUDENT EXPERIENCES
        </span>
        <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
          Real Commutes.<br />
          Real Classmates.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#646A67] max-w-xl">
          Hear how university peers across Dehradun, Premnagar, and Selaqui replaced congested transit with reliable, affordable daily carpools.
        </p>
      </div>

      {/* Featured Editorial Quote & Student Spotlight */}
      <div className="mt-14 bg-[#FFFFFF] rounded-2xl border border-[#DDE1DE] p-8 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Large Editorial Quote */}
        <div className="lg:col-span-8 space-y-6">
          <Quote className="w-10 h-10 text-[#1769FF]/20" />
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] leading-tight tracking-tight">
            "{current.quote}"
          </blockquote>

          <div className="pt-6 border-t border-[#DDE1DE] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-[#111111] flex items-center gap-1.5">
                <span>{current.name}</span>
                <ShieldCheck className="w-4 h-4 text-[#18A66A]" />
              </div>
              <p className="text-xs text-[#646A67]">{current.department} • {current.collegeShort}</p>
              <p className="text-xs font-mono text-[#1769FF] mt-1 font-semibold">
                Daily Corridor: {current.commuteRoute.origin.split('(')[0]} → Campus
              </p>
            </div>

            {/* Story Switcher Tabs */}
            <div className="flex items-center gap-2">
              {stories.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStoryIdx(idx)}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                    activeStoryIdx === idx
                      ? 'border-[#1769FF] scale-110 shadow-sm ring-2 ring-[#1769FF]/20'
                      : 'border-[#DDE1DE] opacity-60 hover:opacity-100'
                  }`}
                  data-cursor={s.name.split(' ')[0]}
                >
                  <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Authentic Profile Framing */}
        <div className="lg:col-span-4 bg-[#F5F6F3] p-6 rounded-xl border border-[#DDE1DE] text-center">
          <img
            src={current.avatar}
            alt={current.name}
            className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-white shadow-sm"
          />
          <h4 className="mt-4 text-base font-bold text-[#111111]">{current.name}</h4>
          <p className="text-xs text-[#646A67]">{current.batch}</p>

          <div className="mt-6 pt-4 border-t border-[#DDE1DE] grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 bg-white rounded-lg border border-[#DDE1DE]">
              <span className="text-[#646A67] block text-[10px]">Rides Completed</span>
              <span className="font-bold text-[#111111] mt-0.5 block">{current.totalRides}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-[#DDE1DE]">
              <span className="text-[#646A67] block text-[10px]">Punctuality</span>
              <span className="font-bold text-[#18A66A] mt-0.5 block">{current.punctualityRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const StudentStoriesSection = TestimonialsSection;

