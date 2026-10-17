import React from 'react';
import { StudentAvatar, StudentArchetype, ARCHETYPE_ASSETS } from './StudentAvatar';

export interface TactileStudentBadgeProps {
  name: string;
  collegeShort: string;
  role: 'driver' | 'passenger' | 'anchor' | string;
  avatarSrc?: string;
  archetype?: StudentArchetype;
  isVerified?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * TactileStudentBadge
 * Handcrafted physical paper-cutout, felt, and cardboard 3D relief badge.
 * Features:
 * - Rounded cream paper avatar badge with green dashed blanket stitching.
 * - Stamped serrated verification seal with checkmark.
 * - Physical ivory paper tape label with typewriter font (DRIVER, ANCHOR, PASSENGER).
 * - Warm kraft cardboard background texture with realistic tactile shadows.
 */
export const TactileStudentBadge: React.FC<TactileStudentBadgeProps> = ({
  name,
  collegeShort,
  role,
  avatarSrc,
  archetype,
  isVerified = true,
  className = '',
  onClick,
}) => {
  // Infer archetype if not explicitly passed
  const resolvedArchetype: StudentArchetype =
    archetype ||
    (name.toLowerCase().includes('aditya') ? 'aditya'
      : name.toLowerCase().includes('ananya') ? 'kavita'
      : name.toLowerCase().includes('rahul') ? 'rohan'
      : name.toLowerCase().includes('priya') ? 'priya'
      : 'aarav');

  const resolvedSrc = avatarSrc || ARCHETYPE_ASSETS[resolvedArchetype];

  const roleLabel = role.toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex max-w-full items-center gap-3.5 p-3 rounded-2xl select-none transition-all duration-150 ${
        onClick ? 'cursor-pointer active:translate-y-[1px]' : ''
      } ${className}`}
      style={{
        backgroundColor: '#DBCBB6',
        backgroundImage: `
          radial-gradient(#CBB79F 1px, transparent 1px),
          linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.06) 100%)
        `,
        backgroundSize: '12px 12px, 100% 100%',
        boxShadow: '0 3px 8px -2px rgba(45, 30, 15, 0.18), inset 0 1px 0 rgba(255,255,255,0.4)',
      }}
      role="region"
      aria-label={`Student Badge: ${name}, ${collegeShort} ${roleLabel}`}
    >
      {/* 1. Stitched Patch Avatar Badge */}
      <div
        className="relative shrink-0 w-[58px] h-[64px] rounded-xl flex items-center justify-center p-1 overflow-hidden"
        style={{
          backgroundColor: '#EDE4D3',
          boxShadow: '0 2px 5px rgba(35, 25, 15, 0.22), inset 0 1px 2px rgba(255,255,255,0.6)',
        }}
      >
        {/* Blanket stitch border */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 58 64"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="52"
            height="58"
            rx="9"
            stroke="#235A42"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
        </svg>

        {/* Character Image / Avatar */}
        <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
          {resolvedSrc ? (
            <img
              src={resolvedSrc}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <StudentAvatar archetype={resolvedArchetype} size={50} name={name} />
          )}
        </div>
      </div>

      {/* 2. Identity & Meta Details */}
      <div className="min-w-0 pr-2 flex flex-col justify-center">
        {/* Name and Scalloped Stamp Seal */}
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className="font-display font-black text-ink-primary text-sm sm:text-base tracking-tight truncate max-w-[150px] sm:max-w-[220px]"
            title={name}
          >
            {name}
          </span>
          {isVerified && (
            <div
              className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
              title="Verified Student Identity"
              style={{
                backgroundColor: '#EAD7BD',
                border: '1px dashed #A08562',
                color: '#5E4324',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              ✓
            </div>
          )}
        </div>

        {/* College Code */}
        <div className="mt-1 text-xs font-mono font-bold text-ink-secondary tracking-wider">
          {collegeShort}
        </div>

        {/* 3. Paper Tape Role Pill */}
        <div className="mt-1.5 self-start">
          <div
            className="px-2 py-0.5 rounded-sm font-mono text-[10px] font-black text-[#2D2A26] uppercase transform -rotate-0.5"
            style={{
              backgroundColor: '#F4EFE6',
              boxShadow: '0 1px 3px rgba(0,0,0,0.14), inset 0 0 0 1px rgba(0,0,0,0.06)',
            }}
          >
            {roleLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

