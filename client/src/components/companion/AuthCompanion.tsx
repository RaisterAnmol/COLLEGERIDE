import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type CompanionState =
  | "IDLE"
  | "WATCHING_EMAIL"
  | "EMAIL_VALID"
  | "EMAIL_INVALID"
  | "WATCHING_PASSWORD"
  | "PASSWORD_COMPLETE"
  | "ERROR"
  | "SUCCESS"
  | "GUIDING";

interface AuthCompanionProps {
  state: CompanionState;
  className?: string;
  speechText?: string;
}

export const AuthCompanion: React.FC<AuthCompanionProps> = ({
  state,
  className = "",
  speechText,
}) => {
  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Derive dialogue bubble text based on state if not explicitly passed
  const dialog = useMemo(() => {
    if (speechText) return speechText;
    switch (state) {
      case "WATCHING_EMAIL":
        return "Type away! Checking your campus domain...";
      case "EMAIL_VALID":
        return "Verified campus email! Looks legit ✨";
      case "EMAIL_INVALID":
        return "Hmm, double-check your .edu or college domain?";
      case "WATCHING_PASSWORD":
        return "Don't mind me... just peeking through my fingers! 👀";
      case "PASSWORD_COMPLETE":
        return "Eyes fully covered! Secret is safe with me 🙈🔒";
      case "ERROR":
        return "Oops! Let's try that again 💫";
      case "SUCCESS":
        return "You're in! Welcome to CampusRide! 🚀🎉";
      case "GUIDING":
        return "Hold steady, align your face in the oval! 📸";
      case "IDLE":
      default:
        return "Hey! Ready to split your daily commute?";
    }
  }, [state, speechText]);

  if (prefersReducedMotion) {
    return null; // As per Section 6.3: render nothing when reduced motion is on
  }

  // Animation variants
  const isPeeking = state === "WATCHING_PASSWORD";
  const isFullyCovered = state === "PASSWORD_COMPLETE";
  const isHappy = state === "SUCCESS" || state === "EMAIL_VALID";
  const isWorried = state === "ERROR" || state === "EMAIL_INVALID";
  const isGuiding = state === "GUIDING";

  return (
    <div
      aria-hidden="true"
      className={`relative flex flex-col items-center select-none ${className}`}
    >
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dialog}
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="mb-2 px-3.5 py-1.5 rounded-2xl bg-[#0A1F1A] border border-[rgba(104,243,141,0.25)] shadow-[0_4px_16px_rgba(0,0,0,0.5)] text-center max-w-[210px] relative"
        >
          <span className="text-[11px] font-medium text-[#E8F0ED] leading-tight block">
            {dialog}
          </span>
          {/* Arrow pointing down to mascot */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A1F1A] border-r border-b border-[rgba(104,243,141,0.25)] rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Mascot Graphic Container */}
      <motion.div
        animate={
          isHappy
            ? { y: [0, -8, 0, -5, 0], rotate: [0, -3, 3, 0] }
            : isWorried
            ? { x: [-2, 2, -2, 2, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isHappy
            ? { duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }
            : isWorried
            ? { duration: 0.3 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative w-28 h-28 flex items-center justify-center"
      >
        {/* Ambient Neon Glow behind Peeko */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#68F38D]/20 via-[#67E8F9]/20 to-[#E8B94A]/10 blur-xl scale-110" />

        {/* Peeko SVG Character */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Body Gradient */}
            <linearGradient id="peekoBody" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#112B24" />
              <stop offset="1" stopColor="#071A16" />
            </linearGradient>

            {/* Ear Gradient */}
            <linearGradient id="peekoEar" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#68F38D" stopOpacity="0.8" />
              <stop offset="1" stopColor="#071A16" />
            </linearGradient>

            {/* Neon Accent Gradient */}
            <linearGradient id="neonAccent" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#68F38D" />
              <stop offset="1" stopColor="#4AE070" />
            </linearGradient>
          </defs>

          {/* Left Cat/Robot Ear */}
          <path
            d="M32 38L22 18C21 16 24 14 26 15L44 26"
            fill="url(#peekoEar)"
            stroke="#68F38D"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Right Cat/Robot Ear */}
          <path
            d="M88 38L98 18C99 16 96 14 94 15L76 26"
            fill="url(#peekoEar)"
            stroke="#68F38D"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Head & Body Capsule */}
          <rect
            x="24"
            y="24"
            width="72"
            height="72"
            rx="32"
            fill="url(#peekoBody)"
            stroke="rgba(104, 243, 141, 0.35)"
            strokeWidth="2"
          />

          {/* Visor / Face Screen */}
          <rect
            x="32"
            y="36"
            width="56"
            height="38"
            rx="16"
            fill="#04120F"
            stroke="rgba(104, 243, 141, 0.2)"
            strokeWidth="1"
          />

          {/* Blushing Cheeks */}
          <circle cx="39" cy="58" r="4" fill="#F87171" fillOpacity={isHappy || isPeeking ? "0.4" : "0.15"} />
          <circle cx="81" cy="58" r="4" fill="#F87171" fillOpacity={isHappy || isPeeking ? "0.4" : "0.15"} />

          {/* EYES LAYER */}
          {!isFullyCovered ? (
            <>
              {/* Left Eye */}
              {isHappy ? (
                <path d="M42 50C44 46 48 46 50 50" stroke="#68F38D" strokeWidth="2.5" strokeLinecap="round" />
              ) : isWorried ? (
                <path d="M42 49L50 52" stroke="#E8B94A" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <g>
                  <circle cx="46" cy="49" r="6" fill="#0A1F1A" stroke="#68F38D" strokeWidth="1.5" />
                  <motion.circle
                    animate={
                      state === "WATCHING_EMAIL"
                        ? { cx: 48, cy: 49 }
                        : { cx: 46, cy: 49 }
                    }
                    r="3.5"
                    fill="#68F38D"
                  />
                  <circle cx="45" cy="47.5" r="1.2" fill="#FFFFFF" />
                </g>
              )}

              {/* Right Eye */}
              {isHappy ? (
                <path d="M70 50C72 46 76 46 78 50" stroke="#68F38D" strokeWidth="2.5" strokeLinecap="round" />
              ) : isWorried ? (
                <path d="M70 52L78 49" stroke="#E8B94A" strokeWidth="2.5" strokeLinecap="round" />
              ) : isPeeking ? (
                <g>
                  <circle cx="74" cy="49" r="6" fill="#0A1F1A" stroke="#68F38D" strokeWidth="1.5" />
                  <circle cx="75" cy="49" r="3.5" fill="#68F38D" />
                  <circle cx="74" cy="47.5" r="1.2" fill="#FFFFFF" />
                </g>
              ) : (
                <g>
                  <circle cx="74" cy="49" r="6" fill="#0A1F1A" stroke="#68F38D" strokeWidth="1.5" />
                  <motion.circle
                    animate={
                      state === "WATCHING_EMAIL"
                        ? { cx: 76, cy: 49 }
                        : { cx: 74, cy: 49 }
                    }
                    r="3.5"
                    fill="#68F38D"
                  />
                  <circle cx="73" cy="47.5" r="1.2" fill="#FFFFFF" />
                </g>
              )}
            </>
          ) : (
            <g>
              <path d="M42 50C44 47 48 47 50 50" stroke="#68F38D" strokeWidth="2" strokeLinecap="round" />
              <path d="M70 50C72 47 76 47 78 50" stroke="#68F38D" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Mouth */}
          {isHappy ? (
            <path d="M56 61C58 64 62 64 64 61" stroke="#68F38D" strokeWidth="1.8" strokeLinecap="round" />
          ) : isWorried ? (
            <path d="M56 63C58 61 62 61 64 63" stroke="#9CB5AC" strokeWidth="1.5" strokeLinecap="round" />
          ) : isFullyCovered ? (
            <path d="M55 60C57 65 63 65 65 60" stroke="#68F38D" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M57 61C59 63 61 63 63 61" stroke="#9CB5AC" strokeWidth="1.5" strokeLinecap="round" />
          )}

          {/* Hands Layer (Peekaboo Mechanic) */}
          {isPeeking ? (
            <g>
              <motion.rect
                initial={{ y: 70 }}
                animate={{ y: 44 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                x="36"
                y="44"
                width="20"
                height="18"
                rx="8"
                fill="#16352C"
                stroke="#68F38D"
                strokeWidth="1.5"
              />
              <motion.g
                initial={{ y: 70 }}
                animate={{ y: 44 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
              >
                <rect x="65" y="42" width="18" height="6" rx="3" fill="#16352C" stroke="#68F38D" strokeWidth="1.2" />
                <rect x="65" y="52" width="18" height="6" rx="3" fill="#16352C" stroke="#68F38D" strokeWidth="1.2" />
              </motion.g>
            </g>
          ) : isFullyCovered ? (
            <motion.g
              initial={{ y: 60 }}
              animate={{ y: 42 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <rect x="36" y="42" width="22" height="20" rx="9" fill="#16352C" stroke="#68F38D" strokeWidth="1.8" />
              <rect x="62" y="42" width="22" height="20" rx="9" fill="#16352C" stroke="#68F38D" strokeWidth="1.8" />
              <circle cx="60" cy="52" r="5" fill="#E8B94A" />
              <path d="M59 50V49C59 48.4 59.4 48 60 48C60.6 48 61 48.4 61 49V50" stroke="#04120F" strokeWidth="1" />
            </motion.g>
          ) : isGuiding ? (
            <g>
              <rect x="32" y="74" width="14" height="12" rx="6" fill="#16352C" stroke="#68F38D" strokeWidth="1.2" />
              <rect x="74" y="74" width="14" height="12" rx="6" fill="#16352C" stroke="#68F38D" strokeWidth="1.2" />
              <path d="M84 74V70" stroke="#68F38D" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <rect x="34" y="78" width="16" height="12" rx="6" fill="#16352C" stroke="rgba(104, 243, 141, 0.3)" strokeWidth="1" />
              <rect x="70" y="78" width="16" height="12" rx="6" fill="#16352C" stroke="rgba(104, 243, 141, 0.3)" strokeWidth="1" />
            </g>
          )}

          {/* Antenna */}
          <line x1="60" y1="24" x2="60" y2="15" stroke="#68F38D" strokeWidth="2" strokeLinecap="round" />
          <circle cx="60" cy="14" r="3" fill="#68F38D" />
          <circle cx="60" cy="14" r="5" stroke="#68F38D" strokeWidth="0.8" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Name Tag */}
      <div className="mt-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#112B24] border border-[rgba(104,243,141,0.15)] text-[10px] font-bold text-[#68F38D]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#68F38D] animate-pulse" />
        PEEKO
      </div>
    </div>
  );
};
