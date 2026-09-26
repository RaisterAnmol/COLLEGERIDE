import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CustomCursor } from './components/common/CustomCursor';
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

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-[#143D32] border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-[#0F172A] selection:bg-[#10B981] selection:text-white">
          <CustomCursor />
          <Navbar />
          <main className="flex-1">
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
