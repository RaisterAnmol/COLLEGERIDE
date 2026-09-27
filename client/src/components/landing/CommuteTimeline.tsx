import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, Car, Sparkles, Leaf, Clock, MapPin } from 'lucide-react';

interface DaySchedule {
  key: string;
  day: string;
  fullDay: string;
  time: string;
  driver: string;
  roleTag: string;
  college: string;
  vehicle: string;
  route: string;
  pickupPoint: string;
  dropPoint: string;
  status: string;
  fare: string;
  avatar: string;
  co2Saved: string;
  distanceKm: string;
  pickupWindow: string;
}

const WEEK_DAYS: DaySchedule[] = [
  {
    key: 'mon',
    day: 'MON',
    fullDay: 'Monday',
    time: '08:15 AM',
    driver: 'Ichigo Kurosaki',
    roleTag: 'Verified Driver',
    college: 'Uttaranchal University (UIT)',
    vehicle: 'Honda City (UK 07 AK 4821)',
    route: 'Premnagar Chowk → UIT Mechanical Block',
    pickupPoint: 'Premnagar Market Entrance',
    dropPoint: 'UIT Engineering Block Porch',
    status: 'Confirmed Weekly Seat',
    fare: '₹20',
    avatar: '/test_uploads/driver_male_ichigo.jpg',
    co2Saved: '1.4 kg CO₂',
    distanceKm: '3.8 km Transit',
    pickupWindow: 'Precise 3-min buffer',
  },
  {
    key: 'tue',
    day: 'TUE',
    fullDay: 'Tuesday',
    time: '08:30 AM',
    driver: 'Makima San',
    roleTag: 'Women-Only Commute Anchor',
    college: 'UPES University (Bidholi)',
    vehicle: 'Honda City i-VTEC (UK 07 UP 9901)',
    route: 'Suddhowala PG Hub → UPES Campus Gate',
    pickupPoint: 'Suddhowala Student PG Complex',
    dropPoint: 'UPES Gate 1 Main Roundabout',
    status: 'Women-Only Corridor Active',
    fare: '₹25',
    avatar: '/test_uploads/driver_female_makima.jpg',
    co2Saved: '1.8 kg CO₂',
    distanceKm: '8.4 km Transit',
    pickupWindow: 'Precise 2-min buffer',
  },
  {
    key: 'wed',
    day: 'WED',
    fullDay: 'Wednesday',
    time: '08:15 AM',
    driver: 'Roronoa Zoro',
    roleTag: 'Verified Peer Driver',
    college: 'Graphic Era University',
    vehicle: 'Royal Enfield Classic (UK 07 RZ 3321)',
    route: 'Clock Tower Chowk → GEU Main Campus',
    pickupPoint: 'Dehradun Clock Tower Hub',
    dropPoint: 'Graphic Era Faculty Quad',
    status: 'Confirmed Weekly Seat',
    fare: '₹15',
    avatar: '/test_uploads/driver_male_zoro.jpg',
    co2Saved: '1.1 kg CO₂',
    distanceKm: '6.2 km Transit',
    pickupWindow: 'Precise 3-min buffer',
  },
  {
    key: 'thu',
    day: 'THU',
    fullDay: 'Thursday',
    time: '08:30 AM',
    driver: 'Mitsuha Miyamizu',
    roleTag: 'Verified Driver',
    college: 'DIT University',
    vehicle: 'Maruti Suzuki Swift (UK 07 MM 5512)',
    route: 'Jakhan Market → DIT University Porch',
    pickupPoint: 'Jakhan Rajpur Road Junction',
    dropPoint: 'DIT Central Library Drop Bay',
    status: 'Confirmed Weekly Seat',
    fare: '₹20',
    avatar: '/test_uploads/driver_female_mitsuha.jpg',
    co2Saved: '1.5 kg CO₂',
    distanceKm: '5.1 km Transit',
    pickupWindow: 'Precise 2-min buffer',
  },
  {
    key: 'fri',
    day: 'FRI',
    fullDay: 'Friday',
    time: '08:20 AM',
    driver: 'Ichigo Kurosaki',
    roleTag: 'Verified Driver',
    college: 'Uttaranchal University (USCS)',
    vehicle: 'Honda City (UK 07 AK 4821)',
    route: 'Ballupur Chowk → UU Gate 1 Main Porch',
    pickupPoint: 'Ballupur Chowk Metro/Bus Stand',
    dropPoint: 'UU Campus Gate 1 Academic Bay',
    status: 'Confirmed Weekly Seat',
    fare: '₹25',
    avatar: '/test_uploads/driver_male_ichigo.jpg',
    co2Saved: '1.9 kg CO₂',
    distanceKm: '7.8 km Transit',
    pickupWindow: 'Precise 3-min buffer',
  },
];

export const CommuteTimeline: React.FC = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const active = WEEK_DAYS[selectedDayIndex];

  return (
    <section id="weekly-timeline" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
      {/* Section Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>ROUTINE CAMPUS CARPOOL TIMETABLE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Your University Week, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">Pre-Scheduled.</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
          Lock in your recurring college timetable with verified classmates. Tap across Monday–Friday to inspect automated peer carpool routes.
        </p>
      </div>

      {/* Interactive Mon-Fri Scrubber Box */}
      <div className="mt-10 bg-white rounded-3xl border border-emerald-100/90 p-6 sm:p-8 shadow-xl shadow-emerald-950/5 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Timeline Header Track */}
        <div className="relative pb-6">
          <div className="grid grid-cols-5 gap-2 sm:gap-3 relative z-10">
            {WEEK_DAYS.map((d, idx) => {
              const isSelected = selectedDayIndex === idx;

              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  onMouseEnter={() => setSelectedDayIndex(idx)}
                  className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#143D32] text-white shadow-lg shadow-emerald-950/20 scale-[1.03] ring-2 ring-emerald-500/40'
                      : 'bg-slate-50 text-slate-600 hover:bg-emerald-50/60 hover:text-slate-900 border border-slate-100'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black font-mono tracking-wider">{d.day}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full my-2 transition-all ${
                      isSelected ? 'bg-emerald-400 ring-4 ring-emerald-400/30' : 'bg-slate-300'
                    }`}
                  />
                  <span className={`text-[11px] font-mono font-semibold ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {d.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-tight mt-1 hidden md:block opacity-75">
                    CAMPUS
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Card for Selected Day */}
        <div className="mt-4 pt-6 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Day Details & Driver Profile */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
                {active.fullDay} Commute
              </span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-emerald-100 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{active.status}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {active.route}
            </h3>

            {/* Driver Profile Strip */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl border border-emerald-100/80 shadow-xs">
              <div className="relative shrink-0">
                <img
                  src={active.avatar}
                  alt={active.driver}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-slate-100"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-white">
                  <ShieldCheck className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                  <span className="truncate">{active.driver}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium truncate">{active.college}</p>
                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <Car className="w-3 h-3 text-emerald-600" />
                  <span>{active.vehicle}</span>
                </p>
              </div>

              <div className="text-right font-mono shrink-0 pl-2">
                <span className="text-xl font-black text-[#143D32]">{active.fare}</span>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">fuel split</span>
              </div>
            </div>
          </div>

          {/* Right: SVG Route Preview & Sustainability Telemetry */}
          <div className="lg:col-span-6 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white p-6 rounded-2xl border border-emerald-200/80 shadow-sm flex flex-col justify-between space-y-4 text-slate-800">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Weekly Scheduled Metrics</span>
              <span className="text-emerald-800 bg-emerald-100/90 border border-emerald-300 font-bold px-2.5 py-1 rounded-full text-xs shadow-2xs">
                Saving ~₹840 / Week
              </span>
            </div>

            {/* Dynamic Animated Route Path */}
            <div className="py-2">
              <div className="flex items-center justify-between text-xs font-mono mb-2 font-semibold">
                <span className="text-slate-900">{active.time} Pickup</span>
                <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
                  {active.distanceKm}
                </span>
                <span className="text-slate-900">08:45 AM Arrival</span>
              </div>
              <div className="relative h-2.5 bg-slate-200/90 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-full w-full animate-pulse shadow-sm shadow-emerald-500/20" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-emerald-100">
              <div className="flex items-center gap-3 bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Carbon Offset</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{active.co2Saved} saved</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/80 p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Pickup Window</span>
                  <span className="font-mono font-bold text-teal-800 text-xs">{active.pickupWindow}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA for Weekly Recurring Setup */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">Want a stress-free semester?</span> Schedule your Monday–Friday university commute in 2 minutes.
          </div>
          <Link
            to="/search"
            className="px-5 py-2.5 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-md shadow-emerald-950/20 hover:shadow-lg cursor-pointer"
          >
            <span>Lock your weekly commute</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export const WeeklyCommuteTimeline = CommuteTimeline;
export default CommuteTimeline;
