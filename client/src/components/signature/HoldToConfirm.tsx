import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export interface HoldToConfirmProps {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  durationMs?: number; // default 750ms
  className?: string;
}

export const HoldToConfirm: React.FC<HoldToConfirmProps> = ({
  onConfirm,
  label = 'Hold to Cancel Ride',
  confirmLabel,
  confirmingLabel = 'Cancelling...',
  durationMs = 750,
  className = '',
}) => {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const startHold = () => {
    if (isCompleted) return;
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const p = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        setIsHolding(false);
        setIsCompleted(true);
        setProgress(100);
        startTimeRef.current = null;
        onConfirm();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (isCompleted) return;
    setIsHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isNearEnd = progress >= 75;

  return (
    <motion.button
      type="button"
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !isHolding) {
          e.preventDefault();
          startHold();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          cancelHold();
        }
      }}
      animate={
        isCompleted
          ? { scale: [1, 1.05, 1], borderColor: '#143D32' }
          : isNearEnd
          ? { scale: 1.02, boxShadow: '0 0 16px rgba(220, 38, 38, 0.45)' }
          : { scale: 1, boxShadow: '0 0 0px rgba(0, 0, 0, 0)' }
      }
      transition={{ duration: 0.15 }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`relative overflow-hidden px-4 py-2.5 rounded-control border border-red-300 text-emergency-crimson text-xs font-semibold select-none bg-surface cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${className}`}
    >
      {/* GPU-Accelerated Background Fill Progress Bar (scaleX) */}
      <span
        className="absolute inset-y-0 left-0 right-0 bg-red-100 origin-left pointer-events-none transition-transform"
        style={{
          transform: `scaleX(${progress / 100})`,
          transitionDuration: isHolding ? '0ms' : '200ms',
        }}
      />

      <span className="relative z-10 flex items-center gap-1.5 font-bold">
        {isCompleted ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Confirmed</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-emergency-crimson" />
            <span>{isHolding ? (confirmLabel || confirmingLabel) : label}</span>
          </>
        )}
      </span>
    </motion.button>
  );
};

export interface HoldToConfirmWithFallbackProps extends HoldToConfirmProps {
  dialogTitle?: string;
  dialogDescription?: string;
}

export const HoldToConfirmWithFallback: React.FC<HoldToConfirmWithFallbackProps> = ({
  onConfirm,
  label = 'Hold to Cancel',
  dialogTitle = 'Confirm Action',
  dialogDescription = 'Are you sure you want to perform this cancellation? This action cannot be undone.',
  ...props
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <HoldToConfirm onConfirm={onConfirm} label={label} {...props} />
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="text-[11px] text-ink-secondary hover:text-emergency-crimson underline underline-offset-2 min-h-[36px] px-2 py-1 transition-colors cursor-pointer"
        aria-haspopup="dialog"
      >
        Or click to confirm
      </button>

      {dialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/60 animate-in fade-in duration-150"
        >
          <div className="bg-surface rounded-card border border-line-base p-6 max-w-md w-full shadow-card space-y-4">
            <h3 id="confirm-dialog-title" className="text-base font-display font-bold text-ink-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emergency-crimson shrink-0" />
              {dialogTitle}
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
              {dialogDescription}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-control border border-line-base text-ink-secondary text-xs font-semibold hover:bg-canvas transition-colors min-h-[44px]"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false);
                  onConfirm();
                }}
                className="px-4 py-2 rounded-control bg-emergency-crimson hover:bg-red-700 text-surface text-xs font-semibold shadow-2xs active:translate-y-[1.5px] transition-all min-h-[44px]"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

