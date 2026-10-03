import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, ArrowRight, Clock, Users, Zap, CheckCircle2 } from 'lucide-react';

interface RideCardData {
  id: string;
  driverName: string;
  driverCollege: string;
  driverRating: number;
  driverAvatar: string;
  vehicle: string;
  departureTime: string;
  origin: string;
  destination: string;
  fare: string;
  seatsAvailable: number;
  tags: string[];
  detour: string;
}

const FEATURED_RIDES: RideCardData[] = [
  {
    id: 'r-1',
    driverName: 'Ichigo Kurosaki',
    driverCollege: 'Uttaranchal Univ (UIT) · 3rd Yr',
    driverRating: 4.95,
    driverAvatar: '/test_uploads/driver_male_ichigo.jpg',
    vehicle: 'Honda City (UK 07 AK 4821)',
    departureTime: '08:15 AM',
    origin: 'Premnagar Chowk',
    destination: 'Uttaranchal University Gate 1',
    fare: '₹20',
    seatsAvailable: 3,
    tags: ['Verified .edu', 'AC', 'Classmates'],
    detour: '2 min detour',
  },
  {
    id: 'r-2',
    driverName: 'Makima San',
    driverCollege: 'UPES University · Final Yr',
    driverRating: 5.0,
    driverAvatar: '/test_uploads/driver_female_makima.jpg',
    vehicle: 'Honda City i-VTEC (UK 07 UP 9901)',
    departureTime: '08:30 AM',
    origin: 'Suddhowala PG Corridor',
    destination: 'UPES Campus Bidholi Gate 1',
    fare: '₹25',
    seatsAvailable: 2,
    tags: ['Women-Only Corridor', 'Verified .edu', 'Safe Peer'],
    detour: '2 min detour',
  },
  {
    id: 'r-3',
    driverName: 'Roronoa Zoro',
    driverCollege: 'Graphic Era Mechanical · 2nd Yr',
    driverRating: 4.88,
    driverAvatar: '/test_uploads/driver_male_zoro.jpg',
    vehicle: 'Royal Enfield (UK 07 RZ 3321)',
    departureTime: '08:45 AM',
    origin: 'Ballupur Chowk',
    destination: 'GEU Faculty Quad Porch',
    fare: '₹15',
    seatsAvailable: 1,
    tags: ['Verified .edu', 'Direct Commute'],
    detour: '1 min detour',
  },
];

export const RideCards: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#EAECF0]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs mb-10">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#175CD3] font-semibold">
            Section 02 / Daily Commute Passes
          </p>
          <h2 className="mt-2 text-3xl sm:text-5xl font-black text-[#101828] uppercase tracking-tight">
            Engineered Ride Passes.
          </h2>
          <p className="mt-2 text-base text-[#667085]">
            Ticket-style micro-interaction passes built for everyday transparency. Tap any pass to inspect or reserve.
          </p>
        </div>
        <Link
          to="/search"
          className="text-xs font-mono font-bold text-[#175CD3] hover:text-[#1749C2] flex items-center gap-1 self-start md:self-auto shrink-0 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200"
        >
          <span>VIEW ALL 42 CORRIDORS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Micro-Interaction Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {FEATURED_RIDES.map((ride) => {
          const isHovered = hoveredCard === ride.id;

          return (
            <div
              key={ride.id}
              onMouseEnter={() => setHoveredCard(ride.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group bg-[#FFFFFF] rounded-2xl border border-[#EAECF0] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#175CD3] hover:shadow-md flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip that reveals on hover */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-[#175CD3] transition-all duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />

              <div>
                {/* Header Row: Time & Price */}
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono text-[#101828]">
                      {ride.departureTime}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#EAECF0] text-[#667085]">
                      {ride.detour}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-[#175CD3]">{ride.fare}</span>
                    <span className="text-[10px] text-[#667085] block font-mono">fuel split</span>
                  </div>
                </div>

                {/* Animated Route Line */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs font-medium text-[#101828]">
                    <span className="font-bold">{ride.origin}</span>
                    <span className="font-bold text-[#12B76A]">🎓 {ride.destination}</span>
                  </div>

                  {/* Route Track Graphic */}
                  <div className="mt-2 relative h-1.5 w-full bg-[#F7F8FA] rounded-full overflow-hidden border border-[#EAECF0]">
                    <div
                      className={`h-full bg-[#175CD3] rounded-full transition-all duration-500 ${
                        isHovered ? 'w-full' : 'w-1/3'
                      }`}
                    />
                  </div>
                </div>

                {/* Driver Identity Block */}
                <div className="mt-6 pt-5 border-t border-[#EAECF0] flex items-center gap-3">
                  <img
                    src={ride.driverAvatar}
                    alt={ride.driverName}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ride.driverName)}&background=143D32&color=fff&bold=true`;
                    }}
                    className="w-11 h-11 rounded-full object-cover border border-[#EAECF0] transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm font-bold text-[#101828]">
                      <span className="truncate">{ride.driverName}</span>
                      <ShieldCheck className="w-4 h-4 text-[#12B76A] shrink-0" />
                    </div>
                    <p className="text-xs text-[#667085] truncate font-sans">{ride.driverCollege}</p>
                    <p className="text-[11px] text-[#98A2B3] font-mono truncate">{ride.vehicle}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ride.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F7F8FA] text-[#667085] border border-[#EAECF0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Rating, Seats & Link */}
              <div className="mt-6 pt-4 border-t border-[#EAECF0] flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1 font-bold text-[#101828]">
                    <Star className="w-3.5 h-3.5 fill-[#F79009] text-[#F79009]" />
                    {ride.driverRating.toFixed(1)}
                  </span>
                  <span className="text-[#98A2B3]">•</span>
                  <span className="text-[#12B76A] font-semibold">
                    {ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? 's' : ''} left
                  </span>
                </div>

                <Link
                  to="/search"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#175CD3] group-hover:text-[#1749C2] transition-colors"
                >
                  <span>View ride</span>
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
export const EngineeredRideCards = RideCards;

