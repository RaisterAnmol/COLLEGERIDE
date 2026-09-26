import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { IRide, IRideRequest, ITrip } from '../types';
import {
  Car,
  Search,
  PlusCircle,
  ShieldCheck,
  Star,
  Users,
  MapPin,
  Clock,
  Navigation,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  School,
  ArrowUpRight,
  Shield,
  Key,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myOfferedRides, setMyOfferedRides] = useState<IRide[]>([]);
  const [myRequests, setMyRequests] = useState<IRideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [ridesRes, reqsRes] = await Promise.all([
        api.getRides({ creatorId: user._id }),
        api.getRequests('passenger'),
      ]);
      setMyOfferedRides(ridesRes || []);
      setMyRequests(reqsRes || []);
    } catch (err) {
      console.error('[Dashboard] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 relative">
      {/* Background Ambient Radial Tech Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Modern Student Profile Card & Mobility Banner */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/60 border border-emerald-200/70 shadow-[0_15px_35px_-10px_rgba(16,185,129,0.12),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Subtle Tech / Campus Matrix Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.15)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />

          {/* Ambient Glowing Aurora Mesh Orbs */}
          <div className="absolute -top-20 -right-16 w-96 h-96 bg-emerald-400/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-16 right-1/3 w-80 h-80 bg-teal-300/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-emerald-300/15 rounded-full blur-[70px] pointer-events-none" />

          {/* Main Content Area */}
          <div className="relative z-10 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Avatar & Identity Header */}
            <div className="flex items-start sm:items-center gap-5">
              {/* Avatar Container with Clean Glowing Ring */}
              <div className="relative shrink-0 select-none">
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl p-1 bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20">
                  <img
                    src={
                      user?.avatarURL ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={user?.name}
                    className="w-full h-full rounded-[14px] object-cover bg-slate-100"
                  />
                </div>
                {/* Active Verified Status Badge */}
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-white flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Name, Verified Status & Academic Tags */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {user?.name}
                  </h1>
                  {user?.verificationStatus === 'verified' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified .edu Student
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                      Pending Verification
                    </span>
                  )}
                  {(user as any)?.role === 'driver' || (user as any)?.accountType === 'DRIVER' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold border border-blue-200">
                      🚗 Campus Driver
                    </span>
                  ) : null}
                </div>

                {/* Academic Chips Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-700 border border-slate-200/90 shadow-xs font-medium backdrop-blur-sm">
                    <School className="w-3.5 h-3.5 text-emerald-600" />
                    {user?.college || 'Not specified'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-700 border border-slate-200/90 shadow-xs font-medium backdrop-blur-sm">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    {user?.course || 'Not specified'} {user?.department ? `(${user.department})` : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-600 border border-slate-200/90 shadow-xs backdrop-blur-sm font-medium">
                    <span>Year {user?.year || '-'}</span>
                    <span className="text-slate-400">•</span>
                    <span>Sem {user?.semester || '-'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: High-Impact Action CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <Link
                to="/search"
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Find a Ride</span>
              </Link>
              <Link
                to="/post"
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Offer a Ride</span>
              </Link>
            </div>
          </div>

          {/* Bottom Frosted Stats & Safety Ribbon */}
          <div className="pt-5 border-t border-emerald-100/90 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Stat 1: Rating */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 backdrop-blur-md flex items-center gap-3 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  {user?.rating?.toFixed(1) || '-'} / 5.0
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Student Rating</div>
              </div>
            </div>

            {/* Stat 2: Total Rides */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 backdrop-blur-md flex items-center gap-3 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  {user?.totalRides || 0} Rides
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Shared Commutes</div>
              </div>
            </div>

            {/* Stat 3: Trust & Safety */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 backdrop-blur-md flex items-center gap-3 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  100% Verified
                </div>
                <div className="text-[11px] text-slate-500 font-medium">ID & Campus Safe</div>
              </div>
            </div>

            {/* Stat 4: ICE Emergency Contact */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 backdrop-blur-md flex items-center gap-3 shadow-xs hover:border-purple-300 hover:shadow-sm transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center font-bold">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-sm font-black text-slate-900 leading-tight truncate">
                  {user?.emergencyContact?.name || 'Not set'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  ICE: {user?.emergencyContact?.relation || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Offered Rides vs Booked Rides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Offered Rides (Driver Lane) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                🚗
              </div>
              <h2 className="text-lg font-bold text-slate-900">Rides You're Offering</h2>
            </div>
            <Link to="/post" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              + Post New
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading rides...</div>
          ) : myOfferedRides.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Car className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No active offered rides</p>
              <p className="text-xs text-slate-400 mt-1">
                Share your empty seats with classmates commuting to/from campus!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOfferedRides.map((ride) => (
                <div
                  key={ride._id}
                  onClick={() => navigate(`/rides/${ride._id}`)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-white transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{ride.origin.text}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>{ride.destination.text}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ride.departureTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} left
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            ride.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ride.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                      Manage →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booked Rides & Requests (Passenger Lane) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                🎒
              </div>
              <h2 className="text-lg font-bold text-slate-900">Your Ride Requests</h2>
            </div>
            <Link to="/search" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Browse Matches →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading requests...</div>
          ) : myRequests.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No active bookings yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Search campus routes to get matched with student drivers in seconds.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => {
                const ride = typeof req.rideId === 'object' ? req.rideId : null;
                return (
                  <div
                    key={req._id}
                    onClick={() => ride && navigate(`/rides/${ride._id}`)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-white transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                          <span>{ride?.origin?.text || 'Origin'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{ride?.destination?.text || 'Destination'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>Driver: {ride?.creator?.name || 'Classmate'}</span>
                          <span>•</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              req.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800 font-bold'
                                : req.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>

                      {req.status === 'accepted' && (
                        <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm">
                          Trip Ready →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

