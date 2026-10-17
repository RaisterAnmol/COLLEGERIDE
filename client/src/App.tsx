import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CampusBackground } from './components/common/CampusBackground';
import type { CampusBackgroundVariant } from './components/common/CampusBackground';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { CookieBanner } from './components/common/CookieBanner';
import { TactileLoading } from './components/common/TactileLoading';

// Code-split route-level pages for optimized initial landing bundle
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PostRidePage = lazy(() => import('./pages/PostRidePage').then(m => ({ default: m.PostRidePage })));
const SearchRidesPage = lazy(() => import('./pages/SearchRidesPage').then(m => ({ default: m.SearchRidesPage })));
const RideDetailPage = lazy(() => import('./pages/RideDetailPage').then(m => ({ default: m.RideDetailPage })));
const TripTrackingPage = lazy(() => import('./pages/TripTrackingPage').then(m => ({ default: m.TripTrackingPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const SafetyPage = lazy(() => import('./pages/SafetyPage').then(m => ({ default: m.SafetyPage })));
const CollegesPage = lazy(() => import('./pages/CollegesPage').then(m => ({ default: m.CollegesPage })));
const VerificationStatusPage = lazy(() => import('./pages/VerificationStatusPage').then(m => ({ default: m.VerificationStatusPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const FaceVerifyPage = lazy(() => import('./pages/FaceVerifyPage').then(m => ({ default: m.FaceVerifyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const DesignPlaygroundPage = lazy(() => import('./pages/DesignPlaygroundPage').then(m => ({ default: m.DesignPlaygroundPage })));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <TactileLoading size="md" message="Synchronizing campus corridor..." />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteFallback />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteFallback />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin =
    user.role === 'campus_admin' ||
    user.role === 'super_admin' ||
    (user as any).role === 'admin' ||
    user.accountType === 'ADMIN' ||
    Boolean(user.email && user.email.startsWith('admin@'));
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/** Maps current route to CampusBackground variant */
function useBackgroundVariant(): CampusBackgroundVariant {
  const { pathname } = useLocation();
  if (pathname === '/') return 'home';
  if (['/auth', '/login', '/signin', '/register', '/signup'].includes(pathname)) return 'auth';
  if (pathname === '/verification' || pathname === '/face-verify' || pathname === '/verify-email') return 'verification';
  if (pathname === '/search' || pathname === '/rides') return 'search';
  if (pathname === '/post' || pathname === '/post-ride') return 'post';
  if (pathname.startsWith('/rides/')) return 'rideDetail';
  if (pathname.startsWith('/trips/')) return 'rideDetail';
  if (pathname === '/admin') return 'admin';
  if (pathname === '/safety') return 'safety';
  if (pathname === '/colleges') return 'colleges';
  if (pathname === '/dashboard') return 'dashboard';
  return 'dashboard';
}

function AppLayout() {
  const variant = useBackgroundVariant();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col font-sans antialiased text-ink-primary selection:bg-route selection:text-white">
        <CampusBackground variant={variant} />
        {!isAdminRoute && <Navbar />}
        <main className="flex-1 relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Suspense fallback={<RouteFallback />}>
                <Routes location={location}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/__design" element={<DesignPlaygroundPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/signin" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route path="/signup" element={<AuthPage />} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/verification" element={<ProtectedRoute><VerificationStatusPage /></ProtectedRoute>} />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/face-verify" element={<ProtectedRoute><FaceVerifyPage /></ProtectedRoute>} />
                  <Route path="/post" element={<ProtectedRoute><PostRidePage /></ProtectedRoute>} />
                  <Route path="/post-ride" element={<Navigate to="/post" replace />} />
                  <Route path="/search" element={<SearchRidesPage />} />
                  <Route path="/rides" element={<Navigate to="/search" replace />} />
                  <Route path="/rides/:id" element={<RideDetailPage />} />
                  <Route path="/trips/:id" element={<ProtectedRoute><TripTrackingPage /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                  <Route path="/safety" element={<SafetyPage />} />
                  <Route path="/colleges" element={<CollegesPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        {/* Global Policy-Compliant Cookie Consent Banner */}
        <CookieBanner />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
