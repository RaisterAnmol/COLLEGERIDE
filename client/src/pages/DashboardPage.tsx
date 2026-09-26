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
  Edit3,
  X,
  BookOpen,
  Phone,
} from 'lucide-react';
import { SearchableInput } from '../components/common/SearchableInput';
import {
  POPULAR_COLLEGES,
  POPULAR_DEPARTMENTS,
  POPULAR_BRANCHES_COURSES,
} from '../data/academicData';

export const DashboardPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [myOfferedRides, setMyOfferedRides] = useState<IRide[]>([]);
  const [myRequests, setMyRequests] = useState<IRideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editCollege, setEditCollege] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editYear, setEditYear] = useState(1);
  const [editSemester, setEditSemester] = useState(1);
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openEditModal = () => {
    if (user) {
      setEditCollege(user.college || '');
      setEditDepartment(user.department || '');
      setEditCourse(user.course || '');
      setEditYear(user.year || 1);
      setEditSemester(user.semester || 1);
      const rawPhone = (user.phone || '').replace(/^\+91\s*/, '').replace(/\D/g, '').slice(0, 10);
      setEditPhone(rawPhone);
      setProfileMsg(null);
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const formattedPhone = editPhone.trim() ? `+91 ${editPhone.trim()}` : '';
      if (updateProfile) {
        await updateProfile({
          college: editCollege.trim(),
          department: editDepartment.trim(),
          course: editCourse.trim(),
          year: Number(editYear),
          semester: Number(editSemester),
          phone: formattedPhone,
        });
      } else {
        await api.updateProfile({
          college: editCollege.trim(),
          department: editDepartment.trim(),
          course: editCourse.trim(),
          year: Number(editYear),
          semester: Number(editSemester),
          phone: formattedPhone,
        });
      }
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditingProfile(false);
      }, 900);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

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

  const userAvatar =
    user?.avatarURL ||
    (user?.email ? localStorage.getItem('campusride_user_avatar_' + user.email.toLowerCase().trim()) : null) ||
    localStorage.getItem('campusride_user_selfie') ||
    '';

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
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl p-1 bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20 flex items-center justify-center overflow-hidden">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={user?.name || 'Student'}
                      className="w-full h-full rounded-[14px] object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#143D32] to-[#10b981] text-white font-black text-2xl sm:text-3xl flex items-center justify-center uppercase select-none">
                      {user?.name ? user.name.trim().charAt(0) : 'U'}
                    </div>
                  )}
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
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 shadow-xs font-semibold text-xs transition-colors cursor-pointer"
                    title="Edit academic details and phone number"
                  >
                    <Edit3 className="w-3 h-3 text-emerald-600" />
                    <span>Edit Info</span>
                  </button>
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
                  {user?.rating?.toFixed(1) || '5.0'} / 5.0
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

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Offered Rides (Driver Lane) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                🚗
              </div>
              <h2 className="text-lg font-bold text-slate-900">Your Offered Rides</h2>
            </div>
            <Link to="/post" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              + Post New Ride
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading rides...</div>
          ) : myOfferedRides.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Car className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No commute rides posted yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Share empty seats on your daily university route and split fuel costs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOfferedRides.map((ride) => (
                <div
                  key={ride._id}
                  onClick={() => navigate(`/rides/${ride._id}`)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-white transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                        <span>{ride.origin?.text || 'Origin'}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>{ride.destination?.text || 'Destination'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{ride.availableSeats} seats left</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600">₹{(ride as any).pricing?.costPerSeat ?? (ride as any).pricePerSeat ?? 0}</span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-400 hover:text-emerald-600">
                      View Details →
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

      {/* Edit Academic Profile Modal Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Edit Academic Profile</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Update your university, department, branch, or contact number
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {profileMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* College Searchable Input */}
              <SearchableInput
                label="College / University"
                value={editCollege}
                onChange={setEditCollege}
                options={POPULAR_COLLEGES}
                placeholder="Search or type college (e.g. Uttaranchal, GEU, UPES, DTU)"
                icon={<School className="w-4 h-4" />}
                helperText="Search presets or write your institution"
                required
              />

              {/* Department & Course Searchable Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableInput
                  label="Department"
                  value={editDepartment}
                  onChange={setEditDepartment}
                  options={POPULAR_DEPARTMENTS}
                  placeholder="e.g. Computer Science, Mechanical"
                  icon={<BookOpen className="w-4 h-4" />}
                  helperText="Search or type custom"
                />

                <SearchableInput
                  label="Course / Branch / Degree"
                  value={editCourse}
                  onChange={setEditCourse}
                  options={POPULAR_BRANCHES_COURSES}
                  placeholder="e.g. B.Tech CSE, BCA, MBA"
                  icon={<GraduationCap className="w-4 h-4" />}
                  helperText="Search or type custom"
                />
              </div>

              {/* Year & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                    <option value={5}>Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile Number with Static +91 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden bg-white shadow-xs transition-all">
                  <div className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 border-r border-slate-300 text-slate-800 select-none text-xs font-bold shrink-0">
                    <span className="text-sm leading-none" role="img" aria-label="India flag">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setEditPhone(digits);
                    }}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full text-sm px-3 py-2.5 focus:outline-none bg-transparent font-medium text-slate-900 tracking-wide placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  10-digit mobile number (+91 prefix automatically applied)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
