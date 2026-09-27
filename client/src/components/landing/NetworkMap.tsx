import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Users, Clock, ShieldCheck, ArrowRight, MapPin, Zap, Compass, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveVehicle {
  id: string;
  driver: string;
  department: string;
  car: string;
  plate: string;
  route: string;
  pickupTime: string;
  dropTime: string;
  eta: string;
  speed: string;
  fare: string;
  seats: number;
  totalSeats: number;
  corridor: 'north' | 'west' | 'east';
  corridorName: string;
  x: number;
  y: number;
  rating: number;
  verified: boolean;
  detour: string;
  co2Saved: string;
}

const VEHICLES: ActiveVehicle[] = [
  {
    id: 'v-1',
    driver: 'Aditya Kumar',
    department: 'UIT Mechanical · Class of 25',
    car: 'Honda City i-VTEC',
    plate: 'UK 07 AK 4920',
    route: 'Premnagar Chowk → UU Gate 1',
    pickupTime: '08:15 AM',
    dropTime: '08:35 AM',
    eta: '8 mins to campus',
    speed: '42 km/h',
    fare: '₹40',
    seats: 2,
    totalSeats: 4,
    corridor: 'north',
    corridorName: 'Chakrata Rd · North Artery',
    x: 250,
    y: 78,
    rating: 4.8,
    verified: true,
    detour: '2.2 mins',
    co2Saved: '1.4 kg',
  },
  {
    id: 'v-2',
    driver: 'Ananya Verma',
    department: 'USCS Computer Science · Class of 24',
    car: 'Hyundai i20 Asta',
    plate: 'UK 07 AV 8112',
    route: 'Suddhowala PG Hub → UIT Campus',
    pickupTime: '08:30 AM',
    dropTime: '08:44 AM',
    eta: '12 mins to campus',
    speed: '38 km/h',
    fare: '₹35',
    seats: 1,
    totalSeats: 3,
    corridor: 'north',
    corridorName: 'Chakrata Rd · North Artery',
    x: 500,
    y: 172,
    rating: 4.9,
    verified: true,
    detour: '1.8 mins',
    co2Saved: '1.2 kg',
  },
  {
    id: 'v-3',
    driver: 'Siddharth Rao',
    department: 'UIM BBA Marketing · Class of 25',
    car: 'Maruti Baleno Alpha',
    plate: 'UK 07 SR 7721',
    route: 'Ballupur Chowk → Campus Gate 1',
    pickupTime: '08:20 AM',
    dropTime: '08:45 AM',
    eta: '16 mins to campus',
    speed: '44 km/h',
    fare: '₹50',
    seats: 3,
    totalSeats: 4,
    corridor: 'west',
    corridorName: 'Shimla Bypass · West Artery',
    x: 310,
    y: 348,
    rating: 4.7,
    verified: true,
    detour: '3.1 mins',
    co2Saved: '1.6 kg',
  },
  {
    id: 'v-4',
    driver: 'Sneha Joshi',
    department: 'Law Block · Class of 24',
    car: 'Tata Nexon EV Max',
    plate: 'UK 07 SJ 5430',
    route: 'Clock Tower Dehradun → UU Gate 1',
    pickupTime: '08:25 AM',
    dropTime: '08:48 AM',
    eta: '11 mins to campus',
    speed: '40 km/h',
    fare: '₹45',
    seats: 2,
    totalSeats: 4,
    corridor: 'east',
    corridorName: 'Rajpur Rd · East Artery',
    x: 785,
    y: 340,
    rating: 4.9,
    verified: true,
    detour: '2.5 mins',
    co2Saved: '1.5 kg',
  },
];

export const NetworkMap: React.FC = () => {
  const [selectedCorridor, setSelectedCorridor] = useState<'all' | 'north' | 'west' | 'east'>('all');
  const [activeVehicleId, setActiveVehicleId] = useState<string>('v-1');
  const [simulatedTick, setSimulatedTick] = useState(0);

  // Smooth telemetry tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTick((t) => (t + 1) % 360);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const filteredVehicles = selectedCorridor === 'all'
    ? VEHICLES
    : VEHICLES.filter((v) => v.corridor === selectedCorridor);

  const activeVehicle = VEHICLES.find((v) => v.id === activeVehicleId) || filteredVehicles[0] || VEHICLES[0];

  return (
    <section id="live-map" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold border border-emerald-200/80 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>24 STUDENTS EN ROUTE TO UTTARANCHAL UNIVERSITY</span>
          </div>
          <h2 className="mt-3 text-4xl sm:text-6xl font-black text-slate-900 uppercase tracking-tight">
            Find Your People.
          </h2>
          <p className="mt-2 text-base text-slate-600 max-w-2xl leading-relaxed">
            Live transit mesh of active student carpools operating across primary Dehradun corridors heading directly to Uttaranchal University (UIT, USCS, Law & Library Gate).
          </p>
        </div>

        {/* Corridor Selector Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-mono self-start md:self-auto">
          {(
            [
              { id: 'all', label: 'All Corridors', count: '4' },
              { id: 'north', label: 'Chakrata Rd (North)', count: '2' },
              { id: 'west', label: 'Shimla Bypass (West)', count: '1' },
              { id: 'east', label: 'Rajpur Rd (East)', count: '1' },
            ] as const
          ).map((corr) => (
            <button
              key={corr.id}
              onClick={() => setSelectedCorridor(corr.id)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCorridor === corr.id
                  ? 'bg-[#143D32] text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
              }`}
            >
              <span>{corr.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                selectedCorridor === corr.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {corr.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Transit Canvas */}
      <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left / Main: Dynamic Schematic Map */}
        <div className="lg:col-span-8 p-6 sm:p-8 relative min-h-[500px] sm:min-h-[560px] flex flex-col justify-between bg-slate-50/50 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:20px_20px]">
          {/* Top Status Bar in Map */}
          <div className="flex items-center justify-between z-10 flex-wrap gap-2">
            <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span className="text-slate-900 font-bold">TRANSIT MESH: DEHRADUN CAMPUS ARTERIES</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">4 ACTIVE CHANNELS</span>
            </div>
            <div className="bg-emerald-50/95 backdrop-blur px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-800 font-semibold flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE GPS TELEMETRY STREAMING</span>
            </div>
          </div>

          {/* SVG Schematic Network Curves */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-6 sm:p-8 pointer-events-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 920 480" fill="none">
              <defs>
                {/* Glowing Gradients for Tracks */}
                <linearGradient id="northGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>

                <linearGradient id="westGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="50%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>

                <linearGradient id="eastGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>

                <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                </filter>
              </defs>

              {/* Corridor North: Chakrata Rd (Premnagar -> UIT) */}
              <path
                d="M 110 90 C 260 65, 420 120, 740 240"
                stroke="#DBEAFE"
                strokeWidth="10"
                strokeLinecap="round"
                opacity={selectedCorridor === 'all' || selectedCorridor === 'north' ? 1 : 0.25}
                className="transition-opacity duration-300"
              />
              <path
                d="M 110 90 C 260 65, 420 120, 740 240"
                stroke="url(#northGlow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="6 6"
                className="route-dash-moving transition-opacity duration-300"
                opacity={selectedCorridor === 'all' || selectedCorridor === 'north' ? 1 : 0.3}
              />

              {/* Corridor West: Shimla Bypass (Ballupur -> UIT) */}
              <path
                d="M 110 390 C 250 370, 440 310, 740 240"
                stroke="#E0E7FF"
                strokeWidth="10"
                strokeLinecap="round"
                opacity={selectedCorridor === 'all' || selectedCorridor === 'west' ? 1 : 0.25}
                className="transition-opacity duration-300"
              />
              <path
                d="M 110 390 C 250 370, 440 310, 740 240"
                stroke="url(#westGlow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="6 6"
                className="route-dash-moving transition-opacity duration-300"
                opacity={selectedCorridor === 'all' || selectedCorridor === 'west' ? 1 : 0.3}
              />

              {/* Corridor East: Rajpur Rd (Clock Tower -> UIT) */}
              <path
                d="M 850 420 C 800 340, 740 290, 740 240"
                stroke="#D1FAE5"
                strokeWidth="10"
                strokeLinecap="round"
                opacity={selectedCorridor === 'all' || selectedCorridor === 'east' ? 1 : 0.25}
                className="transition-opacity duration-300"
              />
              <path
                d="M 850 420 C 800 340, 740 290, 740 240"
                stroke="url(#eastGlow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="6 6"
                className="route-dash-moving transition-opacity duration-300"
                opacity={selectedCorridor === 'all' || selectedCorridor === 'east' ? 1 : 0.3}
              />

              {/* Destination Hub: Uttaranchal University (UIT / USCS) */}
              <g transform="translate(740, 240)">
                {/* Multi-tier animated radar ripples */}
                <circle r="44" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: '24s' }} />
                <circle r="30" fill="#FFFFFF" stroke="#059669" strokeWidth="3" filter="url(#mapShadow)" />
                <circle r="12" fill="#059669" />
                <circle r="5" fill="#FFFFFF" />

                {/* Hub Badge - Top Tag with clear backdrop */}
                <g transform="translate(0, -56)">
                  <rect x="-82" y="-14" width="164" height="28" rx="8" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" filter="url(#mapShadow)" />
                  <text x="0" y="4" textAnchor="middle" fill="#065F46" fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif">
                    🎓 UTTARANCHAL UNIV
                  </text>
                </g>

                {/* Hub Subtitle - Bottom Tag */}
                <g transform="translate(0, 50)">
                  <rect x="-68" y="-11" width="136" height="22" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" filter="url(#mapShadow)" />
                  <text x="0" y="4" textAnchor="middle" fill="#475569" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                    UIT &amp; USCS GATE 1
                  </text>
                </g>
              </g>

              {/* Waypoint 1: Premnagar Chowk */}
              <g transform="translate(110, 90)">
                <circle r="10" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" filter="url(#mapShadow)" />
                <circle r="4" fill="#2563EB" />
                <g transform="translate(0, -20)">
                  <rect x="-62" y="-12" width="124" height="22" rx="6" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="1" filter="url(#mapShadow)" />
                  <text x="0" y="3.5" textAnchor="middle" fill="#1E40AF" fontSize="10" fontWeight="700">
                    Premnagar Chowk
                  </text>
                </g>
                <text x="0" y="24" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="monospace">
                  08:15 AM Origin
                </text>
              </g>

              {/* Waypoint 2: Suddhowala PG Hub */}
              <g transform="translate(380, 125)">
                <circle r="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" filter="url(#mapShadow)" />
                <circle r="3.5" fill="#2563EB" />
                <g transform="translate(0, -18)">
                  <rect x="-60" y="-11" width="120" height="20" rx="6" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="1" filter="url(#mapShadow)" />
                  <text x="0" y="3.5" textAnchor="middle" fill="#1E40AF" fontSize="9.5" fontWeight="600">
                    Suddhowala PG Hub
                  </text>
                </g>
              </g>

              {/* Waypoint 3: Ballupur Chowk */}
              <g transform="translate(110, 390)">
                <circle r="10" fill="#FFFFFF" stroke="#6366F1" strokeWidth="3" filter="url(#mapShadow)" />
                <circle r="4" fill="#6366F1" />
                <g transform="translate(0, 24)">
                  <rect x="-56" y="-11" width="112" height="22" rx="6" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="1" filter="url(#mapShadow)" />
                  <text x="0" y="4" textAnchor="middle" fill="#4338CA" fontSize="10" fontWeight="700">
                    Ballupur Chowk
                  </text>
                </g>
              </g>

              {/* Waypoint 4: Clock Tower Dehradun */}
              <g transform="translate(850, 420)">
                <circle r="10" fill="#FFFFFF" stroke="#059669" strokeWidth="3" filter="url(#mapShadow)" />
                <circle r="4" fill="#059669" />
                <g transform="translate(0, 24)">
                  <rect x="-70" y="-11" width="140" height="22" rx="6" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1" filter="url(#mapShadow)" />
                  <text x="0" y="4" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="700">
                    Clock Tower Dehradun
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Interactive Dynamic Vehicle Markers Placed on Map */}
          <div className="relative w-full h-full z-20 pointer-events-auto">
            {filteredVehicles.map((v, i) => {
              const isSelected = v.id === activeVehicle.id;
              // Smooth micro-drift
              const dx = Math.sin((simulatedTick + i * 90) * (Math.PI / 180)) * 4;
              const dy = Math.cos((simulatedTick + i * 90) * (Math.PI / 180)) * 2.5;

              return (
                <button
                  key={v.id}
                  onClick={() => setActiveVehicleId(v.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 focus:outline-none group text-left cursor-pointer"
                  style={{
                    left: `${(v.x / 920) * 100}%`,
                    top: `${(v.y / 480) * 100}%`,
                    transform: `translate(${dx}px, ${dy}px)`,
                  }}
                >
                  <div className="relative group">
                    {/* Glowing radar pulse ring when selected */}
                    {isSelected && (
                      <span className="absolute -inset-1.5 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                    )}

                    <div
                      className={`px-3.5 py-2 rounded-full shadow-md transition-all flex items-center gap-2.5 border ${
                        isSelected
                          ? 'bg-[#143D32] text-white border-emerald-500 ring-4 ring-emerald-500/25 scale-105 shadow-xl'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:shadow-lg hover:scale-102'
                      }`}
                    >
                      {/* Driver Avatar Ring */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        🚗
                      </div>

                      <div className="text-[11px] leading-tight font-sans">
                        <div className="font-bold whitespace-nowrap flex items-center gap-1">
                          <span>{v.driver}</span>
                          <span className="text-[10px] text-emerald-500">★ {v.rating}</span>
                        </div>
                        <div className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {v.eta} · {v.speed}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Live Corridor Ticker */}
          <div className="z-10 mt-auto pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">CAMPUS CORRIDORS: 4 LIVE CARPOOLS</span>
            </div>
            <div className="flex items-center gap-5 text-[11px]">
              <span>AVG FARE: <strong className="text-slate-900">₹40 fuel split</strong></span>
              <span>MEDIAN DETOUR: <strong className="text-emerald-700">&lt; 2.5 mins</strong></span>
              <span>COMMISSION: <strong className="text-emerald-700">₹0 (Non-Commercial)</strong></span>
            </div>
          </div>
        </div>

        {/* Right / Sidebar: Transit Boarding Pass & Live Ride Details */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-7 bg-slate-50/60 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVehicle.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                {/* Card Header Pill */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-3.5 border-b border-slate-200">
                  <span className="font-bold text-slate-900 tracking-wider">ACTIVE CORRIDOR PASS</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    {activeVehicle.eta}
                  </span>
                </div>

                {/* Driver Info Header */}
                <div className="mt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{activeVehicle.driver}</span>
                        {activeVehicle.verified && (
                          <span title="Verified Uttaranchal University Peer">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-blue-700 font-medium mt-0.5">{activeVehicle.department}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {activeVehicle.car} • <span className="text-slate-700 font-semibold">{activeVehicle.plate}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-blue-700 font-mono">{activeVehicle.fare}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">fuel split only</span>
                    </div>
                  </div>

                  {/* Route Corridor Indicator */}
                  <div className="mt-4 px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200/60 text-xs font-mono text-blue-900 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold truncate">{activeVehicle.corridorName}</span>
                  </div>

                  {/* High-Precision Transit Stepper */}
                  <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block">{activeVehicle.route.split('→')[0].trim()}</span>
                          <span className="text-[10px] text-slate-500">Scheduled Pickup</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-700">{activeVehicle.pickupTime}</span>
                    </div>

                    <div className="w-px h-3.5 bg-slate-200 ml-1" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-900 block">UU Campus Gate 1 (UIT)</span>
                          <span className="text-[10px] text-slate-500">Direct Campus Drop</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700">{activeVehicle.dropTime}</span>
                    </div>
                  </div>

                  {/* Technical Ride Matrix */}
                  <div className="mt-4 grid grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-left shadow-2xs">
                      <span className="text-slate-500 block text-[10px] uppercase">Seats</span>
                      <span className="font-bold text-emerald-600 mt-0.5 block">
                        {activeVehicle.seats} / {activeVehicle.totalSeats} open
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-left shadow-2xs">
                      <span className="text-slate-500 block text-[10px] uppercase">Detour</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {activeVehicle.detour}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-left shadow-2xs">
                      <span className="text-slate-500 block text-[10px] uppercase">CO₂ Offset</span>
                      <span className="font-bold text-emerald-600 mt-0.5 block">
                        {activeVehicle.co2Saved}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking CTA Button */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <Link
                  to={`/search?from=${encodeURIComponent(activeVehicle.route.split('→')[0].trim())}&to=Uttaranchal%20University%20Gate%201`}
                  className="w-full py-3 px-4 rounded-xl bg-[#143D32] hover:bg-[#0E2C24] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all group"
                >
                  <span>Book Seat with {activeVehicle.driver.split(' ')[0]} ({activeVehicle.fare})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>College ID Verified · Zero Commercial Surge</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

// Backwards-compatible alias
export const InteractiveNetworkMap = NetworkMap;
