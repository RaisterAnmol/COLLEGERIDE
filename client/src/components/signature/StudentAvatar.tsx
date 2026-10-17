import React from 'react';

export type StudentArchetype = 'aarav' | 'priya' | 'aditya' | 'kavita' | 'rohan' | 'neha' | 'rahul' | 'ananya';
export type AvatarState = 'waiting' | 'matched' | 'on_the_way' | 'arrived';

export interface StudentAvatarProps {
  archetype?: StudentArchetype;
  state?: AvatarState;
  size?: 32 | 48 | 72 | 120 | number;
  name?: string;
  className?: string;
  variant?: 'stitched' | 'vector' | 'auto';
}

export const ARCHETYPE_ASSETS: Record<string, string> = {
  aditya: '/avatars/avatar_aditya.png',
  priya: '/avatars/avatar_priya.png',
  rohan: '/avatars/avatar_rahul.png',
  rahul: '/avatars/avatar_rahul.png',
  kavita: '/avatars/avatar_ananya.png',
  ananya: '/avatars/avatar_ananya.png',
  aarav: '/avatars/avatar_aditya.png',
  neha: '/avatars/avatar_ananya.png',
};

const ARCHETYPES_CONFIG: Record<
  StudentArchetype,
  {
    name: string;
    skin: string;
    skinBase: string;
    skinShadow: string;
    skinHighlight: string;
    hair: string;
    hairDark: string;
    hairMid: string;
    hairHighlight: string;
    irisColor: string;
    clothing: string;
    clothingBase: string;
    clothingTrim?: string;
    accessoryColor?: string;
  }
> = {
  aarav: {
    name: 'Aarav (Engineering)',
    skin: '#D89A6A',
    skinBase: '#D89A6A',
    skinShadow: '#B87848',
    skinHighlight: '#EAC29E',
    hair: '#120F0D',
    hairDark: '#120F0D',
    hairMid: '#241E1A',
    hairHighlight: '#3E342E',
    irisColor: '#4A3324',
    clothing: '#143D32',
    clothingBase: '#143D32',
    clothingTrim: '#E3ECE8',
    accessoryColor: '#143D32',
  },
  priya: {
    name: 'Priya (Science PG)',
    skin: '#BD7E54',
    skinBase: '#BD7E54',
    skinShadow: '#9A5F36',
    skinHighlight: '#DCA680',
    hair: '#18120E',
    hairDark: '#18120E',
    hairMid: '#2E221B',
    hairHighlight: '#4A372C',
    irisColor: '#5C381E',
    clothing: '#D97706',
    clothingBase: '#D97706',
    clothingTrim: '#FFFDFC',
    accessoryColor: '#D97706',
  },
  aditya: {
    name: 'Aditya (Architecture)',
    skin: '#9A5E35',
    skinBase: '#9A5E35',
    skinShadow: '#794520',
    skinHighlight: '#B97C52',
    hair: '#100D0B',
    hairDark: '#100D0B',
    hairMid: '#281F1A',
    hairHighlight: '#3E3028',
    irisColor: '#3C2818',
    clothing: '#FFFDFC',
    clothingBase: '#FFFDFC',
    clothingTrim: '#143D32',
    accessoryColor: '#1B4F41',
  },
  kavita: {
    name: 'Kavita (Law Junior)',
    skin: '#E8B68E',
    skinBase: '#E8B68E',
    skinShadow: '#CA946A',
    skinHighlight: '#F5CEAE',
    hair: '#0D0D10',
    hairDark: '#0D0D10',
    hairMid: '#1C1C24',
    hairHighlight: '#30303E',
    irisColor: '#2B3830',
    clothing: '#0F2E26',
    clothingBase: '#0F2E26',
    clothingTrim: '#DC2626',
    accessoryColor: '#DC2626',
  },
  rohan: {
    name: 'Rohan (Day-Scholar)',
    skin: '#7A4727',
    skinBase: '#7A4727',
    skinShadow: '#5D3319',
    skinHighlight: '#975C36',
    hair: '#111116',
    hairDark: '#111116',
    hairMid: '#22222C',
    hairHighlight: '#383848',
    irisColor: '#3A281A',
    clothing: '#1B4F41',
    clothingBase: '#1B4F41',
    clothingTrim: '#D97706',
    accessoryColor: '#D97706',
  },
  neha: {
    name: 'Neha (Transit Commuter)',
    skin: '#633B22',
    skinBase: '#633B22',
    skinShadow: '#4A2814',
    skinHighlight: '#814F30',
    hair: '#0E0B0A',
    hairDark: '#0E0B0A',
    hairMid: '#201815',
    hairHighlight: '#382A25',
    irisColor: '#452614',
    clothing: '#E2ECE8',
    clothingBase: '#E2ECE8',
    clothingTrim: '#143D32',
    accessoryColor: '#143D32',
  },
  ananya: {
    name: 'Ananya (Campus Anchor)',
    skin: '#BD7E54',
    skinBase: '#BD7E54',
    skinShadow: '#9A5F36',
    skinHighlight: '#DCA680',
    hair: '#100D0B',
    hairDark: '#100D0B',
    hairMid: '#241E1A',
    hairHighlight: '#3E3028',
    irisColor: '#3C2818',
    clothing: '#143D32',
    clothingBase: '#143D32',
    clothingTrim: '#D97706',
    accessoryColor: '#D97706',
  },
  rahul: {
    name: 'Rahul (Day-Scholar Rider)',
    skin: '#7A4727',
    skinBase: '#7A4727',
    skinShadow: '#5D3319',
    skinHighlight: '#975C36',
    hair: '#111116',
    hairDark: '#111116',
    hairMid: '#22222C',
    hairHighlight: '#383848',
    irisColor: '#3A281A',
    clothing: '#143D32',
    clothingBase: '#143D32',
    clothingTrim: '#FFFDFC',
    accessoryColor: '#143D32',
  },
};

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  archetype = 'aarav',
  state = 'waiting',
  size = 72,
  name,
  className = '',
  variant = 'auto',
}) => {
  const [imgError, setImgError] = React.useState(false);
  const config = ARCHETYPES_CONFIG[archetype] || ARCHETYPES_CONFIG.aarav;
  const strokeColor = '#143D32';
  const uid = archetype; // unique id prefix for gradients
  const assetSrc = ARCHETYPE_ASSETS[archetype];

  // Render stitched tactile avatar portrait if available and allowed
  if (assetSrc && !imgError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none overflow-hidden rounded-xl border border-border/80 shadow-subtle ${className}`}
        style={{ width: size, height: size, backgroundColor: '#F4F5F4' }}
        role="img"
        aria-label={`${name || config.name} (${state})`}
      >
        <img
          src={assetSrc}
          alt={name || config.name}
          width={size}
          height={size}
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
        {(state === 'arrived' || state === 'matched') && (
          <span
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-forest border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm pointer-events-none"
            title="Verified Commuter"
          >
            ✓
          </span>
        )}
      </div>
    );
  }

  // Hair paths per archetype with realistic strand layering and depth
  const renderHair = () => {
    switch (archetype) {
      case 'aarav': // Modern tapered crew crop with volume
        return (
          <g>
            {/* Base hair volume */}
            <path
              d="M34 46 C32 26 44 14 62 14 C80 14 90 25 88 46 C84 34 76 26 62 26 C48 26 38 34 34 46 Z"
              fill={`url(#${uid}-hairGrad)`}
            />
            {/* Top textured crop strands */}
            <path
              d="M40 24 C46 16 58 14 66 16 C76 18 84 24 86 32 C80 24 70 20 60 20 C50 20 44 23 40 24 Z"
              fill={config.hairHighlight}
              opacity="0.6"
            />
            {/* Sideburns */}
            <path d="M34 44 L36 56 L39 52 L37 44 Z" fill={config.hairDark} />
            <path d="M86 44 L84 56 L81 52 L83 44 Z" fill={config.hairDark} />
          </g>
        );
      case 'priya': // Sleek wavy ponytail with shoulder drape and wisps
        return (
          <g>
            {/* Ponytail behind neck and shoulder */}
            <path
              d="M78 36 C92 36 102 46 98 68 C95 82 88 98 84 106 C82 96 84 82 86 68 C88 52 84 42 78 36 Z"
              fill={config.hairDark}
            />
            <path
              d="M84 48 C94 56 94 74 90 92 C88 80 90 64 82 52 Z"
              fill={config.hairMid}
              opacity="0.7"
            />
            {/* Main frontal hair and side swept bangs */}
            <path
              d="M34 48 C32 24 48 14 62 14 C80 14 88 26 86 48 C80 34 70 24 58 24 C46 24 38 34 34 48 Z"
              fill={`url(#${uid}-hairGrad)`}
            />
            {/* Soft hair shine wave */}
            <path
              d="M42 26 C52 18 68 18 78 24 C72 20 58 18 48 22 Z"
              fill={config.hairHighlight}
              opacity="0.5"
            />
            {/* Amber Hair Tie */}
            <ellipse cx="80" cy="38" rx="4" ry="7" fill="#D97706" transform="rotate(-20 80 38)" />
          </g>
        );
      case 'aditya': // Textured curly architect mop
        return (
          <g>
            {/* Curly hair silhouette with natural curl clusters */}
            <path
              d="M32 48 C28 32 38 14 58 14 C78 14 90 28 88 48 C84 34 76 26 62 26 C48 26 38 36 32 48 Z"
              fill={`url(#${uid}-hairGrad)`}
            />
            {/* Dimensional curl clusters */}
            <circle cx="44" cy="20" r="7" fill={config.hairMid} />
            <circle cx="56" cy="16" r="8" fill={config.hairDark} />
            <circle cx="68" cy="17" r="7.5" fill={config.hairMid} />
            <circle cx="78" cy="22" r="6.5" fill={config.hairDark} />
            <circle cx="36" cy="30" r="6" fill={config.hairMid} />
            <circle cx="86" cy="32" r="6" fill={config.hairDark} />
            {/* Curl highlight strokes */}
            <path d="M42 18 Q46 14 50 17" stroke={config.hairHighlight} strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M64 14 Q68 12 72 15" stroke={config.hairHighlight} strokeWidth="1.5" fill="none" opacity="0.6" />
            {/* Tapered sideburns */}
            <path d="M33 46 L35 55 L38 52 L36 46 Z" fill={config.hairDark} />
            <path d="M87 46 L85 55 L82 52 L84 46 Z" fill={config.hairDark} />
          </g>
        );
      case 'kavita': // Polished professional bob with clean inward curve
        return (
          <g>
            {/* Background hair behind neck */}
            <path d="M34 46 L32 74 C34 78 40 76 42 70 L40 52 Z" fill={config.hairDark} />
            <path d="M86 46 L88 74 C86 78 80 76 78 70 L80 52 Z" fill={config.hairDark} />
            {/* Front smooth cap */}
            <path
              d="M34 46 C32 24 48 14 62 14 C78 14 88 24 86 46 C80 30 70 24 58 24 C46 24 38 32 34 46 Z"
              fill={`url(#${uid}-hairGrad)`}
            />
            {/* Sleek center-part shine */}
            <path
              d="M40 26 C50 20 60 20 60 26 C60 20 70 20 80 26 C72 22 62 21 60 24 C58 21 48 22 40 26 Z"
              fill={config.hairHighlight}
              opacity="0.45"
            />
          </g>
        );
      case 'rohan': // Modern streetwear cap with low fade
        return (
          <g>
            {/* Back neck hair */}
            <path d="M36 48 L35 58 L40 54 Z M84 48 L85 58 L80 54 Z" fill={config.hairDark} />
            {/* Athletic 5-panel cap */}
            <path
              d="M32 40 C32 22 46 16 60 16 C76 16 88 22 88 40 Z"
              fill={config.clothingBase}
            />
            {/* Cap visor brim with realistic 3D curve */}
            <path
              d="M26 40 C32 37 56 35 88 38 C94 39 96 42 90 44 C66 47 34 47 26 42 C24 41 24 40 26 40 Z"
              fill="#0D2B23"
            />
            {/* Cap button & eyelet */}
            <circle cx="60" cy="16" r="2.5" fill="#D97706" />
          </g>
        );
      case 'neha': // Natural voluminous curls with warm halo
        return (
          <g>
            {/* Full curl volume silhouette */}
            <path
              d="M28 50 C24 30 36 12 60 12 C84 12 96 30 92 50 C98 38 90 22 74 18 C58 14 40 24 34 40 C30 46 28 52 28 50 Z"
              fill={`url(#${uid}-hairGrad)`}
            />
            {/* Side curl clusters framing cheekbones */}
            <circle cx="28" cy="46" r="6" fill={config.hairDark} />
            <circle cx="30" cy="56" r="6.5" fill={config.hairMid} />
            <circle cx="92" cy="46" r="6" fill={config.hairDark} />
            <circle cx="90" cy="56" r="6.5" fill={config.hairMid} />
            {/* Hair highlight swirls */}
            <circle cx="48" cy="18" r="5" fill={config.hairHighlight} opacity="0.35" />
            <circle cx="72" cy="18" r="5" fill={config.hairHighlight} opacity="0.35" />
          </g>
        );
    }
  };

  // Distinct campus accessories with high craft details
  const renderAccessory = () => {
    switch (archetype) {
      case 'aarav': // Sleek modern dark-rimmed glasses
        return (
          <g>
            {/* Left rim */}
            <rect x="42" y="44" width="15" height="11" rx="3.5" fill="none" stroke="#0D2B23" strokeWidth="1.8" />
            <rect x="44" y="45.5" width="11" height="8" rx="2" fill="#93C5FD" opacity="0.25" />
            {/* Right rim */}
            <rect x="63" y="44" width="15" height="11" rx="3.5" fill="none" stroke="#0D2B23" strokeWidth="1.8" />
            <rect x="65" y="45.5" width="11" height="8" rx="2" fill="#93C5FD" opacity="0.25" />
            {/* Bridge & temples */}
            <path d="M57 48 L63 48" stroke="#0D2B23" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M42 47 L34 45 M78 47 L86 45" stroke="#0D2B23" strokeWidth="1.5" />
          </g>
        );
      case 'priya': // Delicate amber drop earrings & university ID lanyard
        return (
          <g>
            {/* Earring */}
            <circle cx="36" cy="58" r="2.2" fill="#D97706" stroke="#B45309" strokeWidth="0.8" />
            <circle cx="84" cy="58" r="2.2" fill="#D97706" stroke="#B45309" strokeWidth="0.8" />
            {/* University ID Lanyard ribbon */}
            <path d="M48 88 L58 106 L62 106 L52 88 Z" fill="#D97706" opacity="0.8" />
            <path d="M72 88 L62 106 L58 106 L68 88 Z" fill="#B45309" opacity="0.8" />
            {/* ID Card pass */}
            <rect x="54" y="106" width="12" height="14" rx="1.5" fill="#FFFDFC" stroke="#857F6B" strokeWidth="1" />
            <rect x="56" y="108" width="8" height="4" rx="0.5" fill="#143D32" />
          </g>
        );
      case 'aditya': // Architectural drafting pencil tucked at collar & mock turtleneck
        return (
          <g>
            {/* Drafting pencil */}
            <g transform="translate(74, 82) rotate(-22)">
              <rect x="0" y="0" width="3.5" height="22" rx="0.8" fill="#D97706" />
              <polygon points="0,0 1.75,-5 3.5,0" fill="#E5E7EB" />
              <circle cx="1.75" cy="-5" r="0.8" fill="#111827" />
            </g>
          </g>
        );
      case 'kavita': // Tailored blazer collar & crimson university shield pin
        return (
          <g>
            {/* Blazer lapels */}
            <path d="M44 88 L58 106 L60 120" stroke="#0D2B23" strokeWidth="2" fill="none" />
            <path d="M76 88 L62 106 L60 120" stroke="#0D2B23" strokeWidth="2" fill="none" />
            {/* Crimson university pin on lapel */}
            <circle cx="48" cy="98" r="3.2" fill="#DC2626" stroke="#FFFDFC" strokeWidth="1" />
            <polygon points="48,96 50,99 46,99" fill="#FFFDFC" />
          </g>
        );
      case 'rohan': // Modern sport earphones resting on shoulders
        return (
          <g>
            {/* Neckband headset */}
            <path d="M44 86 C40 98 48 104 54 102" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M76 86 C80 98 72 104 66 102" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="54" cy="102" r="2.5" fill="#D97706" />
            <circle cx="66" cy="102" r="2.5" fill="#D97706" />
          </g>
        );
      case 'neha': // Gold huggie hoops and subtle wireless earbud
        return (
          <g>
            {/* Gold huggie hoops */}
            <circle cx="36" cy="56" r="3.5" fill="none" stroke="#D97706" strokeWidth="1.5" />
            <circle cx="84" cy="56" r="3.5" fill="none" stroke="#D97706" strokeWidth="1.5" />
            {/* Wireless earbud */}
            <ellipse cx="82" cy="53" rx="2.5" ry="3.5" fill="#FFFDFC" stroke="#857F6B" strokeWidth="0.8" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative inline-block select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`${config.name} (${state})`}
      role="img"
      aria-label={name ? `${name}'s student avatar` : `${config.name}, status: ${state}`}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-hidden rounded-control bg-canvas border border-line-base shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Volumetric skin gradient */}
          <linearGradient id={`${uid}-skinGrad`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={config.skinHighlight} />
            <stop offset="55%" stopColor={config.skinBase} />
            <stop offset="100%" stopColor={config.skinShadow} />
          </linearGradient>

          {/* Hair sheen gradient */}
          <linearGradient id={`${uid}-hairGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.hairDark} />
            <stop offset="50%" stopColor={config.hairMid} />
            <stop offset="100%" stopColor={config.hairDark} />
          </linearGradient>

          {/* Iris depth gradient */}
          <radialGradient id={`${uid}-iris`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor={config.irisColor} />
            <stop offset="70%" stopColor="#1C140E" />
            <stop offset="100%" stopColor="#0B0907" />
          </radialGradient>
        </defs>

        {/* Ambient background glow */}
        <circle cx="60" cy="60" r="58" fill="#FFFDFC" />

        {/* Torso / College Outfit */}
        <path
          d="M10 120 C10 96 32 84 60 84 C88 84 110 96 110 120 Z"
          fill={config.clothingBase}
          stroke="#0D2B23"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Clothing collar / inner lapel layer */}
        <path
          d="M48 84 L60 98 L72 84 Z"
          fill={config.clothingTrim || '#E3ECE8'}
          stroke="#0D2B23"
          strokeWidth="1.2"
        />

        {/* Neck with realistic shadow under chin */}
        <path
          d="M51 68 L51 86 C55 89 65 89 69 86 L69 68 Z"
          fill={`url(#${uid}-skinGrad)`}
        />
        {/* Soft shadow under jaw */}
        <path
          d="M51 68 Q60 76 69 68 L69 72 Q60 80 51 72 Z"
          fill={config.skinShadow}
          opacity="0.45"
        />

        {/* Ears with natural cartilage definition */}
        <g>
          {/* Left ear */}
          <ellipse cx="36" cy="52" rx="4.5" ry="7" fill={`url(#${uid}-skinGrad)`} stroke="#0D2B23" strokeWidth="1.2" />
          <path d="M37 49 Q34 52 37 55" fill="none" stroke={config.skinShadow} strokeWidth="1" />
          {/* Right ear */}
          <ellipse cx="84" cy="52" rx="4.5" ry="7" fill={`url(#${uid}-skinGrad)`} stroke="#0D2B23" strokeWidth="1.2" />
          <path d="M83 49 Q86 52 83 55" fill="none" stroke={config.skinShadow} strokeWidth="1" />
        </g>

        {/* Head / Sculpted Face Contour */}
        <path
          d="M38 42 C38 24 50 18 60 18 C70 18 82 24 82 42 C82 56 76 72 60 72 C44 72 38 56 38 42 Z"
          fill={`url(#${uid}-skinGrad)`}
          stroke="#0D2B23"
          strokeWidth="1.6"
        />

        {/* Sculpted Eyebrows */}
        <g stroke={config.hairDark} strokeWidth="2.2" strokeLinecap="round" fill="none">
          {/* Left brow: natural upward arch */}
          <path d="M43 41 Q50 39 56 42" />
          {/* Right brow: matching natural arch */}
          <path d="M64 42 Q70 39 77 41" />
        </g>

        {/* Realistic Eyes with Sclera, Iris, Pupil & Specular Light Reflection */}
        <g>
          {/* Left Eye */}
          <g transform="translate(49, 48)">
            {/* White Sclera */}
            <path d="M-6 0 Q0 -4 6 0 Q0 4 -6 0 Z" fill="#FFFDFC" stroke="#0D2B23" strokeWidth="1" />
            {/* Colored Iris */}
            <circle cx="0" cy="0" r="3.2" fill={`url(#${uid}-iris)`} />
            {/* Black Pupil */}
            <circle cx="0" cy="0" r="1.8" fill="#0B0907" />
            {/* Specular Catchlight (Gives eyes realistic life) */}
            <circle cx="-1" cy="-1.1" r="0.9" fill="#FFFFFF" />
            {/* Upper Eyelash line */}
            <path d="M-6.5 0 Q0 -4.5 6.5 0" fill="none" stroke="#0D2B23" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Right Eye */}
          <g transform="translate(71, 48)">
            {/* White Sclera */}
            <path d="M-6 0 Q0 -4 6 0 Q0 4 -6 0 Z" fill="#FFFDFC" stroke="#0D2B23" strokeWidth="1" />
            {/* Colored Iris */}
            <circle cx="0" cy="0" r="3.2" fill={`url(#${uid}-iris)`} />
            {/* Black Pupil */}
            <circle cx="0" cy="0" r="1.8" fill="#0B0907" />
            {/* Specular Catchlight */}
            <circle cx="-1" cy="-1.1" r="0.9" fill="#FFFFFF" />
            {/* Upper Eyelash line */}
            <path d="M-6.5 0 Q0 -4.5 6.5 0" fill="none" stroke="#0D2B23" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>

        {/* Dimensional Sculpted Nose */}
        <g>
          {/* Subtle bridge shadow */}
          <path d="M59 47 L58 56" stroke={config.skinShadow} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          {/* Nose tip and nostrils */}
          <path
            d="M56 57 Q60 60 64 57"
            fill="none"
            stroke={config.skinShadow}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Natural Expressive Lips */}
        <g>
          {/* Upper lip with cupid's bow */}
          <path
            d="M53 65 Q57 63 60 64 Q63 63 67 65"
            fill="none"
            stroke="#6B3420"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Smile line based on status */}
          <path
            d={
              state === 'waiting'
                ? "M54 65.5 L66 65.5"
                : "M53 65.5 Q60 70 67 65.5"
            }
            fill="none"
            stroke="#4A1E10"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Subtle lower lip fullness highlight */}
          <path
            d="M56 67.5 Q60 69.5 64 67.5"
            fill="none"
            stroke={config.skinShadow}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>

        {/* Realistic Hair Layer */}
        {renderHair()}

        {/* Character-Specific Accessories */}
        {renderAccessory()}

        {/* Verified Status Emblem in corner */}
        {(state === 'arrived' || state === 'matched') && (
          <g transform="translate(94, 94)">
            <circle cx="8" cy="8" r="8" fill="#143D32" stroke="#FFFDFC" strokeWidth="1.8" />
            <path
              d="M5 8 L7.5 10.5 L11.5 5.5"
              fill="none"
              stroke="#FFFDFC"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
