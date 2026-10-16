import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, FileText, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export interface VerificationJourneyTrackProps {
  /** Current verification step index: 1 (Email), 2 (Phone), 3 (Student ID), 4 (Approved) */
  currentStep?: 1 | 2 | 3 | 4;
  /** Whether the user has been fully approved by campus admin */
  isApproved?: boolean;
  /** Optional custom className */
  className?: string;
}

interface StepMeta {
  index: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
}

const STEPS: StepMeta[] = [
  { index: 1, title: 'Institutional email', subtitle: 'University .edu address', icon: Mail },
  { index: 2, title: 'Phone number', subtitle: 'OTP to student mobile', icon: Phone },
  { index: 3, title: 'Student ID', subtitle: 'Physical college card', icon: FileText },
  { index: 4, title: 'Safety approval', subtitle: 'Campus office check', icon: ShieldCheck },
];

export const VerificationJourneyTrack: React.FC<VerificationJourneyTrackProps> = ({
  currentStep = 3,
  isApproved = false,
  className = '',
}) => {
  const activeIndex = isApproved ? 4 : currentStep;
  // Calculate line completion percentage: 25% at step 1, 50% at 2, 75% at 3, 100% at 4
  const progressPercent = isApproved ? 100 : Math.round((activeIndex / 4) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full bg-paper rounded-3xl border border-white/80 neu-card-lg p-6 sm:p-8 shadow-sm space-y-6 ${className}`}
      role="region"
      aria-label="Student Identity Verification Journey"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-plum bg-plum-light px-2.5 py-0.5 rounded-full border border-plum-border inline-block mb-1">
            Verification Protocol
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-extrabold text-ink-primary tracking-tight">
            Verification Roadmap
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isApproved ? (
            <motion.span
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200 shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>✓ Fully Verified</span>
            </motion.span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-mono font-bold border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Step {activeIndex} of 4: In Progress</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 Cards Grid - Matches Image 3 Layout with Neumorphic Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEPS.map((step, idx) => {
          const isCompleted = isApproved || step.index < activeIndex;
          const isCurrent = !isApproved && step.index === activeIndex;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isCompleted
                  ? 'bg-canvas neu-sunken border-emerald-300/60 shadow-xs'
                  : isCurrent
                  ? 'bg-canvas neu-sunken border-plum ring-2 ring-plum/20 shadow-xs'
                  : 'bg-canvas/60 border-border/80 text-ink-muted'
              }`}
            >
              {/* Top Row: Icon Container + State Badge */}
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 shadow-xs'
                      : isCurrent
                      ? 'bg-plum text-white shadow-xs'
                      : 'bg-white border border-border text-ink-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                    ✓
                  </div>
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-plum animate-ping" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-border" />
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="mt-4">
                <h4 className={`text-sm font-bold truncate ${isCompleted || isCurrent ? 'text-ink-primary' : 'text-ink-muted'}`}>
                  {step.title}
                </h4>
                <p className="text-[11px] text-ink-muted mt-0.5 truncate">
                  {step.subtitle}
                </p>
              </div>

              {/* Status Pill */}
              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-ink-muted">STEP 0{step.index}</span>
                <span className={`font-bold ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-plum' : 'text-ink-muted'}`}>
                  {isCompleted ? 'VERIFIED' : isCurrent ? 'IN REVIEW' : 'PENDING'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Verification Progress Section (Matches Image 3) */}
      <div className="pt-2 space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-mono text-ink-muted uppercase font-bold tracking-wider">
              Verification Progress
            </span>
            <div className="text-xs text-ink-secondary mt-0.5">
              {isApproved
                ? 'All collegiate safety checkpoints completed and verified by campus administrators.'
                : `Completed ${activeIndex - 1} of 4 milestone verification checkpoints.`}
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-display font-black text-plum tracking-tight">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Animated Neumorphic Progress Track */}
        <div className="w-full h-3 bg-canvas neu-sunken rounded-full overflow-hidden p-0.5 border border-border/70">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progressPercent}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-plum via-forest to-emerald-500 rounded-full shadow-xs"
          />
        </div>
      </div>
    </motion.div>
  );
};

