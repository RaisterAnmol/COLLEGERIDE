import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DEMO_STUDENTS } from '../../data/mockData';

const WEEK_DAYS = [
  {
    key: 'mon',
    day: 'MON',
    fullDay: 'Monday',
    time: '08:15 AM',
    driver: DEMO_STUDENTS.aditya,
    route: 'Premnagar Chowk Market → UIT Engineering Portico',
    status: 'Automated Class Schedule',
  },
  {
    key: 'tue',
    day: 'TUE',
    fullDay: 'Tuesday',
    time: '08:30 AM',
    driver: DEMO_STUDENTS.ananya,
    route: 'Selaqui Industrial Hub → Uttaranchal University',
    status: 'Automated Class Schedule',
  },
  {
    key: 'wed',
    day: 'WED',
    fullDay: 'Wednesday',
    time: '08:15 AM',
    driver: DEMO_STUDENTS.aditya,
    route: 'Premnagar Chowk Market → UIT Engineering Portico',
    status: 'Automated Class Schedule',
  },
  {
    key: 'thu',
    day: 'THU',
    fullDay: 'Thursday',
    time: '08:30 AM',
    driver: DEMO_STUDENTS.ananya,
    route: 'Selaqui Industrial Hub → Uttaranchal University',
    status: 'Automated Class Schedule',
  },
  {
    key: 'fri',
    day: 'FRI',
    fullDay: 'Friday',
    time: '08:15 AM',
    driver: DEMO_STUDENTS.siddharth,
    route: 'Suddhowala Chowk → Campus Gate 1',
    status: 'Automated Class Schedule',
  },
];

export const RecurringCommuteSchedule: React.FC = () => {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const activeDay = WEEK_DAYS[activeDayIdx];

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      {/* Editorial Header */}
      <div className="max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-3">
          05 — RECURRING COMMUTE TIMETABLE
        </span>
        <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
          Your Route. Every Day.<br />
          Without The Hassle.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#646A67] max-w-2xl">
          Lock in your semester schedule once. Automatic weekday pairing with classmates heading to your 09:00 AM lectures.
        </p>
      </div>

      {/* Interactive Mon-Fri Timeline Scrubber */}
      <div className="mt-12 bg-[#FFFFFF] rounded-2xl border border-[#DDE1DE] p-6 sm:p-8 shadow-xs">
        {/* Scrubber Days */}
        <div className="grid grid-cols-5 gap-2 pb-6 border-b border-[#DDE1DE]">
          {WEEK_DAYS.map((d, idx) => {
            const isSelected = activeDayIdx === idx;
            return (
              <button
                key={d.key}
                onClick={() => setActiveDayIdx(idx)}
                onMouseEnter={() => setActiveDayIdx(idx)}
                className={`p-3 sm:p-4 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-[#143D32] text-white shadow-sm scale-105'
                    : 'bg-[#F5F6F3] text-[#646A67] hover:bg-[#DDE1DE]/40'
                }`}
                data-cursor={d.day}
              >
                <div className="text-xs sm:text-sm font-black font-mono">{d.day}</div>
                <div className={`w-2 h-2 rounded-full mx-auto my-2 ${isSelected ? 'bg-[#18A66A]' : 'bg-[#DDE1DE]'}`} />
                <div className={`text-[11px] font-mono ${isSelected ? 'text-emerald-200' : 'text-[#646A67]'}`}>
                  {d.time}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Schedule Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#1769FF] font-mono text-xs font-bold border border-[#DBEAFE]">
                {activeDay.fullDay} Schedule
              </span>
              <span className="text-xs font-mono text-[#18A66A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {activeDay.status}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-[#111111]">
              {activeDay.route}
            </h3>

            {/* Matched Driver */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE]">
              <img
                src={activeDay.driver.avatar}
                alt={activeDay.driver.name}
                className="w-12 h-12 rounded-full object-cover border border-[#DDE1DE]"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#111111] flex items-center gap-1">
                  <span>{activeDay.driver.name}</span>
                  <ShieldCheck className="w-4 h-4 text-[#18A66A]" />
                </div>
                <p className="text-xs text-[#646A67] truncate">
                  {activeDay.driver.vehicle?.model || 'Verified Student Driver'}
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-black text-[#1769FF]">₹{activeDay.driver.commuteRoute.fare}</span>
                <span className="text-[10px] text-[#646A67] block">per trip</span>
              </div>
            </div>
          </div>

          {/* Right: Automated Recurring Benefits */}
          <div className="lg:col-span-6 p-6 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#646A67]">
              <span>SEMESTER PASS INTEGRITY</span>
              <span className="text-[#18A66A] font-bold">ZERO FARE SURGE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#FFFFFF] rounded-lg border border-[#DDE1DE]">
                <span className="text-[#646A67] block text-[10px]">Weekly Savings</span>
                <span className="text-sm font-bold text-[#111111] mt-0.5 block">~₹780 / week</span>
              </div>
              <div className="p-3 bg-[#FFFFFF] rounded-lg border border-[#DDE1DE]">
                <span className="text-[#646A67] block text-[10px]">Carbon Offset</span>
                <span className="text-sm font-bold text-[#18A66A] mt-0.5 block">6.8 kg CO₂ / wk</span>
              </div>
            </div>

            <Link
              to="/search"
              className="py-2.5 px-4 rounded-lg bg-[#143D32] hover:bg-[#0E2C24] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Schedule your weekly commute →</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

