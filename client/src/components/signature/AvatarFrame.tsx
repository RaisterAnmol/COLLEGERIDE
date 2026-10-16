import React from 'react';
import { StudentAvatar, StudentArchetype, AvatarState } from './StudentAvatar';

export type FrameVariant = 'plain' | 'route' | 'ticket' | 'milestone';

export interface AvatarFrameProps {
  src?: string;
  name: string;
  archetype?: StudentArchetype;
  avatarState?: AvatarState;
  frame?: FrameVariant;
  size?: number; // pixel diameter
  className?: string;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({
  src,
  name,
  archetype,
  avatarState = 'waiting',
  frame = 'plain',
  size = 48,
  className = '',
}) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative inline-block select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label={`${name}'s profile avatar`}
    >
      {/* Underlying Avatar: Archetype, Photo, or Initials */}
      <div className="w-full h-full rounded-control overflow-hidden bg-route-pale flex items-center justify-center border border-line-base">
        {archetype ? (
          <StudentAvatar archetype={archetype} state={avatarState} size={size} name={name} className="border-0 shadow-none" />
        ) : src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            width={size}
            height={size}
          />
        ) : (
          <span
            className="font-display font-bold text-route"
            style={{ fontSize: Math.floor(size * 0.38) }}
          >
            {initials || 'S'}
          </span>
        )}
      </div>

      {/* Signature Overlay Frames (docs/02 §D) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        aria-hidden="true"
        viewBox="0 0 100 100"
      >
        {frame === 'plain' && (
          <>
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="16"
              fill="none"
              stroke="var(--line-strong, #B5B0A4)"
              strokeWidth="2.5"
            />
            {/* Signature route dot accent */}
            <circle cx="86" cy="14" r="4.5" fill="var(--route, #143D32)" />
          </>
        )}

        {frame === 'route' && (
          <>
            {/* Interrupted ring with route curve */}
            <path
              d="M 18 2 L 75 2 C 90 2, 98 10, 98 25 L 98 75 C 98 90, 90 98, 75 98 L 25 98 C 10 98, 2 90, 2 75 L 2 25 C 2 10, 10 2, 18 2"
              fill="none"
              stroke="var(--route, #143D32)"
              strokeWidth="2.5"
              strokeDasharray="18 6 40 8"
            />
            <circle cx="88" cy="12" r="5" fill="var(--route, #143D32)" />
            <circle cx="88" cy="12" r="2" fill="var(--surface, #FFFDFC)" />
          </>
        )}

        {frame === 'ticket' && (
          <>
            <rect
              x="3"
              y="3"
              width="94"
              height="94"
              rx="12"
              fill="none"
              stroke="var(--route-light, #2D6A4F)"
              strokeWidth="2.5"
              strokeDasharray="8 5"
            />
            <circle cx="50" cy="2" r="3.5" fill="var(--canvas, #F7F5F0)" />
            <circle cx="50" cy="98" r="3.5" fill="var(--canvas, #F7F5F0)" />
          </>
        )}

        {frame === 'milestone' && (
          <>
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="16"
              fill="none"
              stroke="var(--signal-amber, #D97706)"
              strokeWidth="3"
            />
            {/* Star node awarded for completed rides */}
            <polygon
              points="86,6 89,14 97,14 91,19 93,27 86,22 79,27 81,19 75,14 83,14"
              fill="var(--signal-amber, #D97706)"
            />
          </>
        )}
      </svg>
    </div>
  );
};

