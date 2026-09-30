import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Menu, X, ShieldAlert, LogOut, ShieldCheck, Car, Search, Shield, User, Clock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isDriver = user?.role === 'driver' || user?.accountType === 'DRIVER';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'campus_admin' || user?.role === 'moderator';

  // Navigation Links: Only show AFTER user is logged in
  const navLinks = user
    ? [
        { label: 'Find a Ride', href: '/search' },
        { label: 'Offer a Ride', href: '/post' },
        { label: 'Campuses', href: '/colleges' },
        { label: 'Safety', href: '/safety' },
        { label: 'Verification', href: '/verification' },
        ...(isAdmin ? [{ label: 'Admin Dashboard', href: '/admin' }] : []),
      ]
    : [];

  return (
    <motion.header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-xs'
          : 'bg-[#F8FAFC] py-4 border-b border-slate-200/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-2.5 h-2.5 rounded-full bg-[#143D32] ring-4 ring-[#143D32]/20 group-hover:scale-125 transition-transform" />
          <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
            CampusRide
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 hidden sm:inline">
            UNIVERSITY TRANSIT
          </span>
        </Link>

        {/* Desktop Nav Links - Only visible AFTER login */}
        {user && navLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`transition-colors py-1 ${
                    isActive
                      ? 'text-[#143D32] font-bold border-b-2 border-[#143D32]'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Cluster: Real Login / Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isDriver && (
                <Link
                  to="/post"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#143D32] hover:bg-[#0f2e26] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Car className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Post a Ride</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Profile Capsule */}
              <Link
                to="/verification"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs group"
                title="Manage ID Verification"
              >
                <img
                  src={
                    user.avatarURL ||
                    '/test_uploads/profile_photo.jpg'
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {user.name.split(' ')[0]}
                    </span>
                    {isDriver && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        DRIVER
                      </span>
                    )}
                    {isAdmin && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        ADMIN
                      </span>
                    )}
                    {user.accountType === 'WOMEN_PASSENGER' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300">
                        WOMEN ONLY
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 leading-tight flex items-center gap-1 mt-0.5">
                    {user.verificationStatus === 'verified' ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 inline text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 inline text-amber-600" /> Pending ID
                      </span>
                    )}
                  </span>
                </div>
              </Link>

              {/* Log Out Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200"
                title="Log Out & Switch Account"
                aria-label="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#143D32] hover:bg-slate-100 rounded-xl transition-colors border border-slate-300 shadow-2xs"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#143D32] hover:bg-[#0f2e26] text-white text-xs font-bold shadow-xs hover:shadow transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Action Cluster */}
        <div className="flex md:hidden items-center gap-2">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-[#143D32] bg-slate-100 border border-slate-200 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#143D32] rounded-xl shadow-xs"
              >
                Register
              </Link>
            </div>
          ) : (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-800 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu - Only shown for authenticated users */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-6 py-5 shadow-lg overflow-hidden"
          >
            <div className="flex flex-col gap-3 text-base font-semibold text-slate-900">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="hover:text-[#143D32] transition-colors py-1.5 border-b border-slate-100 last:border-0"
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="pt-3 flex flex-col gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          user.avatarURL ||
                          '/test_uploads/profile_photo.jpg'
                        }
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-300"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">
                          {user.verificationStatus === 'verified' ? '✓ Verified Student' : '⏳ Verification Pending'}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/verification"
                      className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                    >
                      Status
                    </Link>
                  </div>

                  {isDriver && (
                    <Link
                      to="/post"
                      className="w-full py-2.5 text-center text-sm font-semibold bg-[#143D32] text-white rounded-xl flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Car className="w-4 h-4" />
                      <span>Post a Ride</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="w-full py-2.5 text-center text-sm font-semibold bg-amber-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-xs"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin Operations</span>
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full py-2 text-center text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full py-2.5 text-center text-sm font-bold border border-slate-300 rounded-xl text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 text-center text-sm font-bold bg-[#143D32] text-white rounded-xl shadow-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
