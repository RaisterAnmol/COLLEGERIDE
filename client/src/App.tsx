import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CustomCursor } from './components/common/CustomCursor';
import { CampusBackground } from './components/common/CampusBackground';
import type { CampusBackgroundVariant } from './components/common/CampusBackground';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';

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
const FaceVerifyPage = lazy(() => import('./pages/FaceVerifyPage').then(m => ({ default: m.FaceVerifyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-[#143D32] border-t-transparent animate-spin" />
    </div>
  );
}

/** Maps current route to CampusBackground variant */
function useBackgroundVariant(): CampusBackgroundVariant {
  const { pathname } = useLocation();
  if (pathname === '/' || pathname === '/colleges') return 'home';
  if (['/auth', '/login', '/signin', '/register', '/signup'].includes(pathname)) return 'auth';
  if (pathname === '/verification' || pathname === '/face-verify') return 'verification';
  return 'dashboard';
}

function AppLayout() {
  const variant = useBackgroundVariant();

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-[#0F172A] selection:bg-[#10B981] selection:text-white">
      <CampusBackground variant={variant} />
      <CustomCursor />
      <Navbar />
      <main className="flex-1 relative z-[1]">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signin" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/verification" element={<VerificationStatusPage />} />
            <Route path="/face-verify" element={<FaceVerifyPage />} />
            <Route path="/post" element={<PostRidePage />} />
            <Route path="/post-ride" element={<Navigate to="/post" replace />} />
            <Route path="/search" element={<SearchRidesPage />} />
            <Route path="/rides" element={<Navigate to="/search" replace />} />
            <Route path="/rides/:id" element={<RideDetailPage />} />
            <Route path="/trips/:id" element={<TripTrackingPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/colleges" element={<CollegesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
