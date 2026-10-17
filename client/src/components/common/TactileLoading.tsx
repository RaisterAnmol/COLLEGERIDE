import React from 'react';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

interface TactileLoadingProps {
  message?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const TactileLoading: React.FC<TactileLoadingProps> = ({
  message = 'Synchronizing verified campus transit...',
  subtext = 'Connecting with Dehradun university corridor nodes',
  size = 'md',
  fullScreen = false,
}) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas/80 backdrop-blur-sm p-6'
    : 'flex flex-col items-center justify-center p-8 w-full';

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {/* Animated Orbit / Transit Ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className={`rounded-full border-2 border-dashed border-[#143D32]/30 ${
            isSmall ? 'w-12 h-12' : isLarge ? 'w-24 h-24' : 'w-16 h-16'
          }`}
        />

        {/* Inner Spinning Transit Track */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className={`absolute rounded-full border-2 border-transparent border-t-[#143D32] border-r-[#10B981] ${
            isSmall ? 'w-12 h-12' : isLarge ? 'w-24 h-24' : 'w-16 h-16'
          }`}
        />

        {/* Center Campus Mascot / Car Icon */}
        <div
          className={`absolute rounded-full bg-paper border border-line-base shadow-sm flex items-center justify-center text-route ${
            isSmall ? 'w-7 h-7' : isLarge ? 'w-12 h-12' : 'w-9 h-9'
          }`}
        >
          <motion.div
            animate={{ y: [-1, 1, -1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Car className={isSmall ? 'w-3.5 h-3.5' : isLarge ? 'w-6 h-6' : 'w-4 h-4'} />
          </motion.div>
        </div>
      </div>

      {/* Narrative Loading Copy */}
      <div className="mt-4 text-center space-y-1">
        <h4 className="font-display font-bold text-xs sm:text-sm text-ink-primary">
          {message}
        </h4>
        {subtext && (
          <p className="text-[11px] font-mono text-ink-muted">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export const TactileSpinner: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      style={{ width: size, height: size }}
      className={`rounded-full border-2 border-line-base border-t-route ${className}`}
      aria-label="Loading"
    />
  );
};

