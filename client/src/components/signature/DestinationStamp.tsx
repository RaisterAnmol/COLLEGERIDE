import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export interface DestinationStampProps {
  status: 'verified' | 'confirmed' | 'pending' | 'rejected' | string;
  label?: string;
  issuedDate?: string;
  date?: string;
  className?: string;
}

export const DestinationStamp: React.FC<DestinationStampProps> = ({
  status,
  label,
  issuedDate,
  date,
  className = '',
}) => {
  const isApproved = status === 'verified' || status === 'confirmed';
  const stampDate = issuedDate || date;

  if (!isApproved) {
    // Rule R6 & docs/02 §C: Pending/failed show plain status text, never stamp
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-control text-xs font-mono font-medium ${
          status === 'pending'
            ? 'bg-signal-amber-bg text-signal-amber border border-signal-amber/30'
            : 'bg-red-50 text-emergency-crimson border border-red-200'
        } ${className}`}
      >
        <span>
          {label || (status === 'pending' ? 'Verification In Review' : 'Not Verified')}
        </span>
      </div>
    );
  }

  // Stamp appearance: physical rubber stamp slam with -2.5° rotational settle and ink shockwave ring
  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Ink Shockwave Expansion Ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.6 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        className="absolute inset-0 rounded-control border-2 border-route pointer-events-none"
      />

      <motion.div
        role="status"
        aria-label={label || 'Verified Institutional Pass'}
        initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
        animate={{ scale: 1, opacity: 1, rotate: -2.5 }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 28,
          mass: 0.9,
        }}
      >
        <div className="animate-stamp-land border-2 border-dashed border-route px-3.5 py-1.5 rounded-control bg-route-pale/80 text-route font-mono font-bold text-xs uppercase flex items-center gap-2 shadow-xs backdrop-blur-xs rotate-[-2deg]">
          <ShieldCheck className="w-4 h-4 shrink-0 text-route" />
          <div className="leading-tight">
            <span className="block text-[11px] font-extrabold">{label || 'CAMPUS VERIFIED'}</span>
            {stampDate && (
              <span className="text-[9px] text-route-light font-normal block">
                {stampDate}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

