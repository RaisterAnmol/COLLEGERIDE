import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Menu, X, ShieldAlert, LogOut, ShieldCheck, Car, Search, Shield, User, Clock } from 'lucide-react';
import { NotificationBell } from './common/NotificationBell';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isDriver = user?.role === 'driver' || user?.accountType === 'DRIVER';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'campus_admin' || user?.role === 'moderator';

  // Navigation Links: 'Campuses' is only shown before login (public). When logged in, it is hidden for drivers, passengers, and admins.
  const navLinks = user
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        ...(isDriver ? [{ label: 'Offer a Ride', href: '/post' }] : []),
        ...(!isDriver && !isAdmin ? [{ label: 'Find a Ride', href: '/search' }] : []),
        { label: 'Safety', href: '/safety' },
        { label: 'Verification', href: '/verification' },
        ...(isAdmin ? [{ label: 'Admin Dashboard', href: '/admin' }] : []),
      ]
    : [
        { label: 'Campuses', href: '/colleges' },
        { label: 'Find a Ride', href: '/search' },
        { label: 'Safety', href: '/safety' },
        { label: 'Verification', href: '/verification' },
      ];

  return (
    <motion.header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-border py-3 shadow-sm'
          : 'bg-[#E8EBE6]/85 backdrop-blur-md py-3.5 border-b border-border/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-2.5 h-2.5 rounded-full bg-forest ring-4 ring-forest/20 transition-transform group-hover:scale-110" />
          <span className="text-2xl font-extrabold tracking-tight text-ink-primary font-display">
            CampusRide
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-paper text-ink-secondary rounded-full border border-border hidden sm:inline">
            DEHRADUN TRANSIT
          </span>
        </Link>

        {/* Desktop Nav Links - Accessible both before and after login */}
        {navLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-secondary">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative transition-colors py-1 ${
                    isActive
                      ? 'text-plum font-bold'
                      : 'hover:text-ink-primary'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-active-pill"
                      className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-plum rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                    />
                  )}
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
                  className="px-4 py-2 text-xs font-bold text-white bg-plum hover:bg-plum-hover rounded-control transition-all flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
                >
                  <Car className="w-3.5 h-3.5 text-plum-light" />
                  <span>Post a Ride</span>
                </Link>
              )}

              {!isDriver && !isAdmin && (
                <Link
                  to="/search"
                  className="px-4 py-2 text-xs font-bold text-plum bg-plum-light hover:bg-[#E9D7E2] border border-plum-border rounded-control transition-all flex items-center gap-1.5 shadow-sm active:translate-y-0.5"
                >
                  <Search className="w-3.5 h-3.5 text-plum" />
                  <span>Find a Ride</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-control transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* In-App Real-Time Notification Bell */}
              <NotificationBell />

              {/* Profile Capsule */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-control border border-border bg-paper hover:border-plum-border hover:bg-white transition-all shadow-xs group"
                title="View Dashboard & Profile"
              >
                <img
                  src={
                    user.avatarURL ||
                    '/test_uploads/profile_photo.jpg'
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-border"
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-ink-primary leading-none">
                      {user.name.split(' ')[0]}
                    </span>
                    {isDriver && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-forest-light text-forest border border-forest/30">
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
                  <span className="text-[10px] text-ink-muted leading-tight flex items-center gap-1 mt-0.5">
                    {user.verificationStatus === 'verified' ? (
                      <span className="text-forest font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 inline text-forest" /> Verified
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
                className="px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:text-emergency-crimson hover:bg-red-50 rounded-control transition-colors cursor-pointer flex items-center gap-1.5 border border-border"
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
                className="px-4 py-2 text-xs font-bold text-ink-primary hover:text-plum hover:bg-white rounded-control transition-all border border-border shadow-xs bg-paper"
              >
                Log In
              </Link>
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97, y: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-plum hover:bg-plum-hover text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Action Cluster */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          {!user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="hidden min-[380px]:inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-ink-primary bg-paper border border-border rounded-control"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-white bg-plum rounded-control shadow-xs"
              >
                Register
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-ink-primary rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <NotificationBell />
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-800 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileMenuOpen ? 'close' : 'open'}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="block"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu - Accessible for all visitors & authenticated users */}
      <AnimatePresence>
        {mobileMenuOpen && (
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

                  {!isDriver && !isAdmin && (
                    <Link
                      to="/search"
                      className="w-full py-2.5 text-center text-sm font-semibold bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find a Ride</span>
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
                    className="w-full py-2.5 text-center text-sm font-bold bg-plum hover:bg-plum-hover text-white rounded-xl shadow-xs transition-colors"
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
