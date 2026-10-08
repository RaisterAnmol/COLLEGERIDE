import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface StudentCharacterProps {
  /** Whether the password field is currently focused */
  isPasswordFocused: boolean;
  /** Whether the email/text field is currently focused */
  isTextFocused: boolean;
  /** Current value of the email/text input (for eye tracking) */
  textValue: string;
  /** Optional current password value to react to typing */
  passwordValue?: string;
  /** Size of the SVG (default 160) */
  size?: number;
  /** Eye gaze direction when focused */
  lookDirection?: "left" | "right";
}

/**
 * World-Class Interactive Campus Panda Mascot ("Bao")
 * - Features the exact realistic forearm slide-up animation the user loved from the student character,
 *   styled on an adorable panda wearing an emerald university hoodie!
 * - High-contrast emerald hoodie sleeves with black paws and pink pads make the hands and arms
 *   instantly recognizable, crisp, and beautifully animated.
 * - Dynamic eye tracking, natural blinking, keystroke ear wiggles, and interactive click reactions.
 */
export const StudentCharacter: React.FC<StudentCharacterProps> = ({
  isPasswordFocused,
  isTextFocused,
  textValue,
  passwordValue = '',
  size = 160,
  lookDirection = "right",
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [earWiggle, setEarWiggle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Eye tracking: when email input is focused, look towards the input box based on lookDirection
  const textLen = textValue?.length || 0;
  const rawShift = Math.min(2.8 + textLen * 0.08, 4.4);
  const eyeShiftX = isTextFocused
    ? (lookDirection === "left" ? -rawShift : rawShift)
    : 0;
  const eyeShiftY = isTextFocused ? 1.8 : 0;

  // Natural blinking every few seconds
  const scheduleBlink = useCallback(() => {
    const delay = 2600 + Math.random() * 3200;
    blinkTimerRef.current = setTimeout(() => {
      if (!isPasswordFocused) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
      }
      scheduleBlink();
    }, delay);
  }, [isPasswordFocused]);

  useEffect(() => {
    scheduleBlink();
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [scheduleBlink]);

  // Keystroke ear wiggle
  useEffect(() => {
    if (textLen > 0 || passwordValue.length > 0) {
      setEarWiggle(true);
      const timer = setTimeout(() => setEarWiggle(false), 300);
      return () => clearTimeout(timer);
    }
  }, [textLen, passwordValue.length]);

  const showClosedEyes = isPasswordFocused || isBlinking;

  // Reactive speech balloon text
  const speechText = isPasswordFocused
    ? passwordValue.length > 0
      ? `Bao: "Typing secret password... (${passwordValue.length} chars) 🔒"`
      : 'Bao: "Paws firmly over my eyes! Secret safe 🙈"'
    : isTextFocused
    ? textValue.includes('@')
      ? 'Bao: "Campus domain verified! ✨"'
      : textLen > 0
      ? 'Bao: "Watching you type your email... 👀"'
      : 'Bao: "Enter your campus email! ✍️"'
    : clickCount > 0
    ? 'Bao: "*Giggles* Ready for campus carpooling! 🚗"'
    : 'Bao • Campus Safety Mascot';

  return (
    <div
      className="panda-mascot-container flex flex-col justify-center items-center select-none cursor-pointer"
      style={{ width: size, margin: '0 auto' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setClickCount((c) => c + 1)}
      title="Click Bao to interact!"
    >
      <motion.div
        animate={
          clickCount > 0
            ? { y: [0, -8, 0, -4, 0] }
            : isHovered
            ? { y: -3, scale: 1.02 }
            : { y: [0, -2.5, 0] }
        }
        transition={
          clickCount > 0
            ? { duration: 0.5 }
            : isHovered
            ? { duration: 0.2 }
            : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative"
      >
        <svg
          className="panda-svg"
          viewBox="0 0 160 210"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: size, height: 'auto', overflow: 'visible' }}
        >
          <defs>
            {/* White Fur Gradient */}
            <linearGradient id="pandaFur" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="85%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            {/* Dark Fur Gradient */}
            <linearGradient id="pandaDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="40%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Emerald Hoodie Gradient */}
            <linearGradient id="hoodieEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Pink Paw Pad Gradient */}
            <linearGradient id="pawPadPink" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBCFE8" />
              <stop offset="100%" stopColor="#FDA4AF" />
            </linearGradient>

            {/* Soft Shadow Filter */}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="145%">
              <feDropShadow dx="0" dy="3.5" stdDeviation="3" floodOpacity="0.16" />
            </filter>
          </defs>

          {/* Floating Twinkle Sparkles */}
          <g className="sparkles">
            {/* Gold Star Top Left */}
            <motion.path
              animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8], rotate: [0, 15, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              d="M18 42 L20.5 48.5 L27 51 L20.5 53.5 L18 60 L15.5 53.5 L9 51 L15.5 48.5 Z"
              fill="#F59E0B"
            />
            {/* Emerald Star Top Right */}
            <motion.path
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7], rotate: [0, -15, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, delay: 0.6, ease: 'easeInOut' }}
              d="M140 46 L142 51 L147 53 L142 55 L140 60 L138 55 L133 53 L138 51 Z"
              fill="#10B981"
            />
            {/* Sky Blue Star High */}
            <motion.path
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 1.1, ease: 'easeInOut' }}
              d="M132 26 L133.5 30 L137.5 31.5 L133.5 33 L132 37 L130.5 33 L126.5 31.5 L130.5 30 Z"
              fill="#38BDF8"
            />
          </g>

          {/* Ground Shadow */}
          <motion.ellipse
            rx={44}
            ry={7}
            cx="80"
            cy="198"
            animate={{
              rx: isPasswordFocused ? 42 : isHovered ? 46 : 44,
              opacity: isHovered ? 0.22 : 0.16,
            }}
            transition={{ duration: 0.3 }}
            fill="#0F172A"
          />

          {/* CHARACTER ROOT GROUP */}
          <g
            id="pandaCharRoot"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center bottom',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isPasswordFocused ? 'translateY(1.5px)' : 'translateY(0)',
            }}
          >
            {/* Stubby Feet with Pink Paw Pads */}
            <g id="feet">
              {/* Left Foot */}
              <g transform="translate(54, 186)">
                <ellipse cx="0" cy="0" rx="14" ry="9" fill="url(#pandaDark)" filter="url(#softShadow)" />
                <ellipse cx="0" cy="0.5" rx="7" ry="4.5" fill="url(#pawPadPink)" />
                <circle cx="-6" cy="-4" r="2.2" fill="url(#pawPadPink)" />
                <circle cx="0" cy="-6" r="2.4" fill="url(#pawPadPink)" />
                <circle cx="6" cy="-4" r="2.2" fill="url(#pawPadPink)" />
              </g>

              {/* Right Foot */}
              <g transform="translate(106, 186)">
                <ellipse cx="0" cy="0" rx="14" ry="9" fill="url(#pandaDark)" filter="url(#softShadow)" />
                <ellipse cx="0" cy="0.5" rx="7" ry="4.5" fill="url(#pawPadPink)" />
                <circle cx="-6" cy="-4" r="2.2" fill="url(#pawPadPink)" />
                <circle cx="0" cy="-6" r="2.4" fill="url(#pawPadPink)" />
                <circle cx="6" cy="-4" r="2.2" fill="url(#pawPadPink)" />
              </g>
            </g>

            {/* Torso: Emerald University Hoodie & White Belly */}
            <g id="torso">
              {/* Emerald Hoodie Body */}
              <path
                d="M44 130 C44 112 116 112 116 130 L122 178 C122 186 38 186 38 178 Z"
                fill="url(#hoodieEmerald)"
                filter="url(#softShadow)"
              />

              {/* White Belly Pocket Patch */}
              <ellipse cx="80" cy="162" rx="26" ry="18" fill="url(#pandaFur)" />

              {/* Hoodie Neckline V & Drawstrings */}
              <path d="M68 126 L80 138 L92 126" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
              {/* White Drawstrings */}
              <path d="M75 133 L73 150" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M85 133 L87 150" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

              {/* Golden Campus Crest Badge on Chest */}
              <g transform="translate(80, 142)">
                <path
                  d="M-5 -2 L5 -2 L5 3 C5 6.5 0 9 0 9 C0 9 -5 6.5 -5 3 Z"
                  fill="#F59E0B"
                  stroke="#B45309"
                  strokeWidth="0.8"
                />
                <path d="M-2.5 1 L-0.5 3 L3 0" fill="none" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" />
              </g>
            </g>

            {/* NORMAL RESTING ARMS (Drop down and fade out when password focused) */}
            {/* Left Resting Arm */}
            <g
              id="leftRestingArm"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'top center',
                transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: isPasswordFocused ? 0 : 1,
                transform: isPasswordFocused ? 'translateY(14px) scale(0.8)' : 'translateY(0) scale(1)',
              }}
            >
              {/* Green Sleeve */}
              <rect x="36" y="124" width="15" height="38" rx="7.5" fill="#10B981" filter="url(#softShadow)" />
              {/* Black Paw */}
              <circle cx="43.5" cy="162" r="9" fill="url(#pandaDark)" />
              {/* Pink Paw Pad */}
              <ellipse cx="43.5" cy="162" rx="5" ry="4" fill="url(#pawPadPink)" />
              <circle cx="39.5" cy="157" r="1.8" fill="url(#pawPadPink)" />
              <circle cx="43.5" cy="155.5" r="2" fill="url(#pawPadPink)" />
              <circle cx="47.5" cy="157" r="1.8" fill="url(#pawPadPink)" />
            </g>

            {/* Right Resting Arm */}
            <g
              id="rightRestingArm"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'top center',
                transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: isPasswordFocused ? 0 : 1,
                transform: isPasswordFocused ? 'translateY(14px) scale(0.8)' : 'translateY(0) scale(1)',
              }}
            >
              {/* Green Sleeve */}
              <rect x="109" y="124" width="15" height="38" rx="7.5" fill="#059669" filter="url(#softShadow)" />
              {/* Black Paw */}
              <circle cx="116.5" cy="162" r="9" fill="url(#pandaDark)" />
              {/* Pink Paw Pad */}
              <ellipse cx="116.5" cy="162" rx="5" ry="4" fill="url(#pawPadPink)" />
              <circle cx="112.5" cy="157" r="1.8" fill="url(#pawPadPink)" />
              <circle cx="116.5" cy="155.5" r="2" fill="url(#pawPadPink)" />
              <circle cx="120.5" cy="157" r="1.8" fill="url(#pawPadPink)" />
            </g>

            {/* PANDA HEAD & FEATURES */}
            <g
              id="headGroup"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center 100px',
                transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isPasswordFocused
                  ? 'translateY(3px) rotate(-1.5deg)'
                  : isTextFocused
                  ? 'translateY(1px) rotate(1deg)'
                  : 'translateY(0) rotate(0deg)',
              }}
            >
              {/* Ears (safely positioned within viewBox at y=60) */}
              {/* Left Ear */}
              <g
                style={{
                  transformOrigin: '46px 60px',
                  transition: 'transform 0.3s ease',
                  transform: earWiggle ? 'rotate(-8deg)' : 'rotate(0deg)',
                }}
              >
                <ellipse cx="46" cy="60" rx="16" ry="14" fill="url(#pandaDark)" transform="rotate(-18 46 60)" />
                <ellipse cx="46" cy="60" rx="8.5" ry="7" fill="url(#pawPadPink)" opacity="0.75" transform="rotate(-18 46 60)" />
              </g>

              {/* Right Ear */}
              <g
                style={{
                  transformOrigin: '114px 60px',
                  transition: 'transform 0.3s ease',
                  transform: earWiggle ? 'rotate(8deg)' : 'rotate(0deg)',
                }}
              >
                <ellipse cx="114" cy="60" rx="16" ry="14" fill="url(#pandaDark)" transform="rotate(18 114 60)" />
                <ellipse cx="114" cy="60" rx="8.5" ry="7" fill="url(#pawPadPink)" opacity="0.75" transform="rotate(18 114 60)" />
              </g>

              {/* Head Sphere */}
              <circle cx="80" cy="94" r="38" fill="url(#pandaFur)" filter="url(#softShadow)" />

              {/* Cute Top Head Fur Tufts */}
              <path
                d="M77 56 C77 52 81 52 81 56 C82 51 86 52 85 56"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Rosy Blushing Cheeks */}
              <ellipse
                cx="48"
                cy="102"
                rx="7"
                ry="4.5"
                fill="#FDA4AF"
                opacity={isPasswordFocused ? 0.95 : isTextFocused ? 0.65 : 0.45}
                style={{ transition: 'opacity 0.3s ease' }}
              />
              <ellipse
                cx="112"
                cy="102"
                rx="7"
                ry="4.5"
                fill="#FDA4AF"
                opacity={isPasswordFocused ? 0.95 : isTextFocused ? 0.65 : 0.45}
                style={{ transition: 'opacity 0.3s ease' }}
              />

              {/* Iconic Panda Eye Patches (Fades out when hands cover eyes so zero black patch peeks through) */}
              <g style={{ opacity: isPasswordFocused ? 0 : 1, transition: 'opacity 0.3s ease' }}>
                <ellipse cx="63" cy="90" rx="12" ry="15" fill="url(#pandaDark)" transform="rotate(-15 63 90)" />
                <ellipse cx="97" cy="90" rx="12" ry="15" fill="url(#pandaDark)" transform="rotate(15 97 90)" />
              </g>

              {/* EYES & TRACKING (When Open) */}
              {!showClosedEyes && (
                <g id="openEyes">
                  {/* Left Eye */}
                  <ellipse cx="64" cy="90" rx="6.5" ry="7.5" fill="#FFFFFF" />
                  <circle
                    cx={64 + eyeShiftX}
                    cy={90 + eyeShiftY}
                    r="4.4"
                    fill="#0F172A"
                    style={{ transition: 'cx 0.12s ease, cy 0.12s ease' }}
                  />
                  <circle cx={62.3 + eyeShiftX} cy={88 + eyeShiftY} r="1.6" fill="#FFFFFF" style={{ transition: "cx 0.15s ease-out, cy 0.15s ease-out" }} />
                  <circle cx={65.7 + eyeShiftX} cy={91.6 + eyeShiftY} r="0.9" fill="#FFFFFF" style={{ transition: "cx 0.15s ease-out, cy 0.15s ease-out" }} />

                  {/* Right Eye */}
                  <ellipse cx="96" cy="90" rx="6.5" ry="7.5" fill="#FFFFFF" />
                  <circle
                    cx={96 + eyeShiftX}
                    cy={90 + eyeShiftY}
                    r="4.4"
                    fill="#0F172A"
                    style={{ transition: 'cx 0.12s ease, cy 0.12s ease' }}
                  />
                  <circle cx={94.3 + eyeShiftX} cy={88 + eyeShiftY} r="1.6" fill="#FFFFFF" style={{ transition: "cx 0.15s ease-out, cy 0.15s ease-out" }} />
                  <circle cx={97.7 + eyeShiftX} cy={91.6 + eyeShiftY} r="0.9" fill="#FFFFFF" style={{ transition: "cx 0.15s ease-out, cy 0.15s ease-out" }} />
                </g>
              )}

              {/* CLOSED EYES / HAPPY ARCHES */}
              {showClosedEyes && !isPasswordFocused && (
                <g id="closedEyes">
                  <path d="M58 90 Q64 96 70 90" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M90 90 Q96 96 102 90" fill="none" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
                </g>
              )}

              {/* White Snout Muzzle */}
              <ellipse cx="80" cy="101" rx="14" ry="10" fill="#FFFFFF" />

              {/* Nose */}
              <path
                d="M75.5 97 C77.5 95.5 82.5 95.5 84.5 97 C85 99.5 81.5 102.5 80 102.5 C78.5 102.5 75.5 99.5 75.5 97 Z"
                fill="#0F172A"
              />
              <ellipse cx="78.8" cy="97.2" rx="1.6" ry="0.9" fill="#94A3B8" />

              {/* Smile */}
              <path
                d={
                  isPasswordFocused
                    ? 'M76 104 Q78 106 80 104 Q82 106 84 104'
                    : 'M75 104 Q77.5 107.5 80 104.5 Q82.5 107.5 85 104'
                }
                fill="none"
                stroke="#0F172A"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transition: 'd 0.3s ease' }}
              />
            </g>

            {/* REALISTIC COVER HANDS & FOREARMS (100% Full Eye Coverage) */}
            <g
              id="coverHandsLayer"
              style={{
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: isPasswordFocused ? 1 : 0,
                transform: isPasswordFocused ? 'translateY(0)' : 'translateY(55px)',
                pointerEvents: 'none',
              }}
            >
              {/* Left Cover Forearm & Plump Paw */}
              <g id="leftCoverHand">
                {/* Emerald Green Sleeve Forearm */}
                <rect
                  fill="url(#hoodieEmerald)"
                  x="38"
                  y="96"
                  width="18"
                  height="46"
                  rx="9"
                  transform="rotate(22 47 119)"
                  filter="url(#softShadow)"
                />
                {/* White Sleeve Cuff */}
                <rect
                  fill="#FFFFFF"
                  x="37"
                  y="94"
                  width="20"
                  height="4"
                  rx="2"
                  transform="rotate(22 47 119)"
                />
                {/* Chubby Black Panda Paw covering left eye zone completely */}
                <g transform="rotate(8 64 89)">
                  <ellipse cx="64" cy="89" rx="20" ry="16.5" fill="url(#pandaDark)" filter="url(#softShadow)" />
                  {/* Pink Paw Pad */}
                  <ellipse cx="64" cy="90" rx="9.5" ry="7" fill="url(#pawPadPink)" />
                  {/* Pink Toe Beans */}
                  <circle cx="56.5" cy="81.5" r="2.5" fill="url(#pawPadPink)" />
                  <circle cx="64" cy="79" r="2.8" fill="url(#pawPadPink)" />
                  <circle cx="71.5" cy="81.5" r="2.5" fill="url(#pawPadPink)" />
                </g>
              </g>

              {/* Right Cover Forearm & Plump Paw */}
              <g id="rightCoverHand">
                {/* Emerald Green Sleeve Forearm */}
                <rect
                  fill="url(#hoodieEmerald)"
                  x="104"
                  y="96"
                  width="18"
                  height="46"
                  rx="9"
                  transform="rotate(-22 113 119)"
                  filter="url(#softShadow)"
                />
                {/* White Sleeve Cuff */}
                <rect
                  fill="#FFFFFF"
                  x="103"
                  y="94"
                  width="20"
                  height="4"
                  rx="2"
                  transform="rotate(-22 113 119)"
                />
                {/* Chubby Black Panda Paw covering right eye zone completely */}
                <g transform="rotate(-8 96 89)">
                  <ellipse cx="96" cy="89" rx="20" ry="16.5" fill="url(#pandaDark)" filter="url(#softShadow)" />
                  {/* Pink Paw Pad */}
                  <ellipse cx="96" cy="90" rx="9.5" ry="7" fill="url(#pawPadPink)" />
                  {/* Pink Toe Beans */}
                  <circle cx="88.5" cy="81.5" r="2.5" fill="url(#pawPadPink)" />
                  <circle cx="96" cy="79" r="2.8" fill="url(#pawPadPink)" />
                  <circle cx="103.5" cy="81.5" r="2.5" fill="url(#pawPadPink)" />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </motion.div>

      {/* Reactive Interactive Dialogue Balloon */}
      <AnimatePresence mode="wait">
        <motion.div
          key={speechText}
          initial={{ opacity: 0, y: 3, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -2, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/90 text-[11px] font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition-colors"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isPasswordFocused
                ? 'bg-amber-400 animate-ping'
                : isTextFocused
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-emerald-600'
            }`}
          />
          <span>{speechText}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StudentCharacter;
