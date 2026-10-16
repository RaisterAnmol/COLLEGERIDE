import React from 'react';
import { CampusVehicleMascot } from './CampusVehicleMascot';
import { Car, Bell, Inbox, ShieldCheck } from 'lucide-react';

export type LivingEmptyStateVariant = 'no-rides' | 'no-requests' | 'no-notifications' | 'pending-verification';

export interface LivingEmptyStateProps {
  /** Thematic illustration variant */
  variant?: LivingEmptyStateVariant;
  /** Primary headline */
  title: string;
  /** Explanatory description */
  description: string;
  /** Primary call to action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.FC<{ className?: string }>;
  };
  /** Secondary call to action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.FC<{ className?: string }>;
  };
  /** Optional custom className */
  className?: string;
}

/**
 * LivingEmptyState
 * - Replaces bland blank screens with rich, purposeful illustrations and tactile CTAs.
 * - Adheres to Rule R5/R6: honest empty states that communicate real status and provide clear actions.
 * - Visual continuity: reinforces the illuminated road and campus transit motif.
 */
export const LivingEmptyState: React.FC<LivingEmptyStateProps> = ({
  variant = 'no-rides',
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Visual Illustration Cluster */}
      <div className="flex flex-col items-center justify-center mb-5">
        {variant === 'no-rides' && (
          <div className="relative">
            {/* Illuminated road track base */}
            <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto mb-2 relative overflow-hidden">
              <div className="absolute inset-y-0 left-10 w-24 bg-emerald-600/30 rounded-full" />
            </div>
            {/* Mascot in waiting state */}
            <CampusVehicleMascot
              state="waiting"
              size={130}
              showSpeech={true}
              speechText='Pip: "No active carpool on this route yet. Be the first to post!"'
            />
          </div>
        )}

        {variant === 'no-requests' && (
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-xs mb-2">
            <Inbox className="w-10 h-10 text-emerald-700" />
          </div>
        )}

        {variant === 'no-notifications' && (
          <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shadow-xs mb-2">
            <Bell className="w-9 h-9 text-slate-400" />
          </div>
        )}

        {variant === 'pending-verification' && (
          <div className="relative">
            <CampusVehicleMascot
              state="idle"
              size={120}
              showSpeech={true}
              speechText='Pip: "Campus Safety is reviewing your credentials!"'
            />
          </div>
        )}
      </div>

      {/* Typography */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Buttons Cluster */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="px-4 py-2.5 rounded-xl bg-[#143D32] hover:bg-[#0D2820] text-xs font-bold text-white shadow-xs transition-transform active:translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5" />}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-3.5 h-3.5" />}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

