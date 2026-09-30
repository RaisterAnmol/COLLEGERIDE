import React from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "../components/landing/Hero";
import { RouteStory } from "../components/landing/RouteStory";
import { NetworkMap } from "../components/landing/NetworkMap";
import { RideCards } from "../components/landing/RideCards";
import { CommuteTimeline } from "../components/landing/CommuteTimeline";
import { TrustVerificationSection } from "../components/landing/TrustVerificationSection";
import { StatusBanner } from "../components/landing/StatusBanner";
import { Footer } from "../components/landing/Footer";
import { CommunitySection } from "../components/landing/CommunitySection";
export const LandingPage: React.FC = () => {

  return (
    <div className="min-h-screen text-slate-900 flex flex-col antialiased selection:bg-[#143D32] selection:text-white">
      {/* Hero Section */}
      <Hero />

      {/* Signature Continuous Route Runway */}
      <RouteStory />

      {/* Interactive Network Map Corridor Explorer */}
      <NetworkMap />

      {/* Daily Commute Passes */}
      <RideCards />

      {/* Weekly Commute Interactive Timeline */}
      <CommuteTimeline />

      {/* Trust & Safety Verification */}
      <TrustVerificationSection />

      {/* Campus Community */}
      <CommunitySection />

      {/* Live Campus Telemetry with Viewport Counters */}
      <StatusBanner />

      {/* Footer */}
      <Footer />
    </div>
  );
};
