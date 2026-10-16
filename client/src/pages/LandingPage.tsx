// prefers-reduced-motion compliant landing page matching Volume 1 Part 7.2 & Appendix H
import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { RideCards } from "../components/landing/RideCards";
import { CollegesSection } from "../components/landing/CollegesSection";
import { ProductPreview } from "../components/landing/ProductPreview";
import { StatusBanner } from "../components/landing/StatusBanner";
import { Footer } from "../components/landing/Footer";

const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen text-ink-primary bg-canvas flex flex-col antialiased selection:bg-route selection:text-white">
      {/* 1. Hero with RouteThread drawing across campus quad and StudentAvatar trust strip */}
      <Hero />

      {/* 2. How It Works: 3 Steps with real university student photography and live OTP card */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionRevealVariants}
      >
        <HowItWorks />
      </motion.div>

      {/* 3. Today's Ride Passes: Masked JourneyTicket passes with circular notches */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionRevealVariants}
      >
        <RideCards />
      </motion.div>

      {/* 4. University Infrastructure & College Transit Directory */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionRevealVariants}
      >
        <CollegesSection />
      </motion.div>

      {/* 5. Application Architecture & Driver Active Commute Cockpit */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionRevealVariants}
      >
        <ProductPreview />
      </motion.div>

      {/* 6. Institutional Campus Status Corridor Banner */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionRevealVariants}
      >
        <StatusBanner />
      </motion.div>

      {/* 7. Institutional Footer */}
      <Footer />
    </div>
  );
};

