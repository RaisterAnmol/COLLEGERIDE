import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, ArrowRight, Search, ShieldCheck, Star } from 'lucide-react';
import { DEMO_CORRIDORS, DEMO_FEATURED_RIDES } from '../../data/mockData';

export const RouteBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCorridorId, setSelectedCorridorId] = useState('corridor-north');
  const [fromLocation, setFromLocation] = useState('Rohini Sector 14 Metro');
  const [toLocation, setToLocation] = useState('DTU Main Campus Gate 1');
  const [departureTime, setDepartureTime] = useState('08:15 AM');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const activeCorridor = DEMO_CORRIDORS.find((c) => c.id === selectedCorridorId) || DEMO_CORRIDORS[0];

  const handleCorridorSelect = (corridor: typeof DEMO_CORRIDORS[0]) => {
    setSelectedCorridorId(corridor.id);
    setFromLocation(corridor.origin);
    setToLocation(corridor.destination);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}&date=${selectedDate}`);
  };

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#DDE1DE]">
      {/* Editorial Header */}
      <div className="max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#1769FF] font-semibold block mb-3">
          03 — INTERACTIVE CORRIDOR BUILDER
        </span>
        <h2 className="text-heading-clamp font-black text-[#111111] uppercase tracking-tight">
          Plot Your Commute.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#646A67] max-w-2xl">
          Inspect active university corridors. Adjust your departure station or college destination to see matched carpools in flight.
        </p>
      </div>

      {/* Main Interactive Container: Split Left (Controls) & Right (Map Canvas) */}
      <div className="mt-12 bg-[#FFFFFF] rounded-2xl border border-[#DDE1DE] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Search & Route Configuration Form */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#DDE1DE]">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE1DE] text-xs font-mono text-[#646A67]">
              <span>COMMUTE PARAMETERS</span>
              <span className="text-[#1769FF] font-bold">PRE-ROUTED GIS</span>
            </div>

            {/* Quick Corridor Selection Pills */}
            <div>
              <label className="text-[11px] font-mono text-[#646A67] uppercase block mb-1.5">
                Preset Corridors
              </label>
              <div className="flex flex-col gap-1.5">
                {DEMO_CORRIDORS.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleCorridorSelect(c)}
                    className={`px-3 py-2 rounded-lg text-left text-xs font-mono transition-all flex items-center justify-between border ${
                      selectedCorridorId === c.id
                        ? 'bg-[#143D32] text-white border-[#143D32] font-bold shadow-xs'
                        : 'bg-[#F5F6F3] text-[#646A67] border-[#DDE1DE] hover:border-[#143D32]'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-[10px] ml-2 shrink-0">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Origin Input */}
            <div>
              <label className="text-[11px] font-mono text-[#646A67] uppercase block mb-1">
                From (Pickup Station)
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] focus-within:border-[#1769FF] focus-within:bg-[#FFFFFF]">
                <MapPin className="w-4 h-4 text-[#1769FF] shrink-0" />
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[#111111] focus:outline-none"
                />
              </div>
            </div>

            {/* Destination Input */}
            <div>
              <label className="text-[11px] font-mono text-[#646A67] uppercase block mb-1">
                To (Campus Portico)
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE] focus-within:border-[#1769FF] focus-within:bg-[#FFFFFF]">
                <MapPin className="w-4 h-4 text-[#18A66A] shrink-0" />
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[#111111] focus:outline-none"
                />
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-[#646A67] uppercase block mb-1">Date</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE]">
                  <Calendar className="w-3.5 h-3.5 text-[#646A67] shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono text-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#646A67] uppercase block mb-1">Slot</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F6F3] border border-[#DDE1DE]">
                  <Clock className="w-3.5 h-3.5 text-[#646A67] shrink-0" />
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full bg-transparent text-xs font-mono text-[#111111] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#1769FF] hover:bg-[#1D4ED8] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
              data-cursor="SEARCH"
            >
              <Search className="w-4 h-4" />
              <span>Find matched rides on this corridor</span>
            </button>
          </form>

          {/* Quick Metrics */}
          <div className="mt-6 pt-4 border-t border-[#DDE1DE] grid grid-cols-3 gap-2 text-xs font-mono">
            <div>
              <span className="text-[#646A67] block text-[10px]">DISTANCE</span>
              <span className="font-bold text-[#111111]">{activeCorridor.distanceKm} km</span>
            </div>
            <div>
              <span className="text-[#646A67] block text-[10px]">AVG TIME</span>
              <span className="font-bold text-[#111111]">{activeCorridor.avgDurationMins} mins</span>
            </div>
            <div>
              <span className="text-[#646A67] block text-[10px]">FUEL SPLIT</span>
              <span className="font-bold text-[#18A66A]">₹{activeCorridor.fareEstimate}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Large Interactive Schematic Map */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-[#FAFAFC] relative min-h-[440px] flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <div className="bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#DDE1DE] text-xs font-mono text-[#111111] font-bold">
              TRANSIT SCHEMATIC: {activeCorridor.name}
            </div>
            <div className="bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#DDE1DE] text-xs font-mono text-[#18A66A] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#18A66A] animate-pulse" />
              <span>{activeCorridor.activeCarsCount} CARPOOLS ACTIVE</span>
            </div>
          </div>

          {/* SVG Map Path */}
          <div className="relative my-auto py-8">
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 700 160" fill="none">
              {/* Route line */}
              <path
                d="M 50 80 C 200 20, 380 140, 650 80"
                stroke="#DDE1DE"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 50 80 C 200 20, 380 140, 650 80"
                stroke="#1769FF"
                strokeWidth="4"
                strokeLinecap="round"
                className="route-dash-moving"
              />

              {/* Waypoint 1: Origin */}
              <g transform="translate(50, 80)">
                <circle r="10" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
                <circle r="4" fill="#111111" />
                <text x="0" y="-18" textAnchor="middle" fill="#111111" fontSize="11" fontWeight="700">
                  {activeCorridor.origin.split(' ')[0]}
                </text>
              </g>

              {/* Waypoint 2: Intermediate Station */}
              <g transform="translate(340, 95)">
                <circle r="8" fill="#FFFFFF" stroke="#1769FF" strokeWidth="2.5" />
                <circle r="3" fill="#1769FF" />
                <text x="0" y="24" textAnchor="middle" fill="#1769FF" fontSize="10" fontWeight="600">
                  {activeCorridor.viaPoints[0]}
                </text>
              </g>

              {/* Waypoint 3: Destination Gate */}
              <g transform="translate(650, 80)">
                <circle r="12" fill="#FFFFFF" stroke="#18A66A" strokeWidth="3" />
                <circle r="5" fill="#18A66A" />
                <text x="0" y="-20" textAnchor="middle" fill="#111111" fontSize="11" fontWeight="800">
                  🎓 CAMPUS
                </text>
              </g>
            </svg>
          </div>

          {/* Featured Carpool Card on Corridor */}
          <div className="z-10 bg-[#FFFFFF] p-4 rounded-xl border border-[#DDE1DE] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={DEMO_FEATURED_RIDES[0].driver.avatar}
                alt={DEMO_FEATURED_RIDES[0].driver.name}
                className="w-10 h-10 rounded-full object-cover border border-[#DDE1DE]"
              />
              <div>
                <div className="text-xs font-bold text-[#111111] flex items-center gap-1">
                  <span>{DEMO_FEATURED_RIDES[0].driver.name}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#18A66A]" />
                </div>
                <p className="text-[11px] text-[#646A67]">{DEMO_FEATURED_RIDES[0].driver.vehicle?.model}</p>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-sm font-black text-[#1769FF]">₹{DEMO_FEATURED_RIDES[0].fare}</div>
              <div className="text-[10px] text-[#18A66A] font-semibold">{DEMO_FEATURED_RIDES[0].availableSeats} seats open</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



// Backwards-compatible alias
export const InteractiveRouteBuilder = RouteBuilder;

