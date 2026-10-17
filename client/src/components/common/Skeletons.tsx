import React from 'react';

/**
 * High-fidelity responsive skeletons matching the tactile Campus Atlas design language.
 * Matches real layout geometry to eliminate cumulative layout shift (CLS).
 * Uses motion-safe:animate-pulse to strictly respect prefers-reduced-motion.
 * All containers include aria-busy="true" and role="status".
 */

export const RideTicketSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading available campus rides"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-paper border border-line-base rounded-3xl p-5 shadow-xs relative overflow-hidden space-y-4 motion-safe:animate-pulse"
        >
          {/* Top Header: Time and Fare pills */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 rounded-full bg-slate-200" />
            <div className="h-6 w-16 rounded-full bg-slate-200" />
          </div>

          {/* Route Section */}
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-slate-300 shrink-0" />
              <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
            </div>
            <div className="ml-1.5 w-0.5 h-6 bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-slate-300 shrink-0" />
              <div className="h-4 w-4/5 rounded-lg bg-slate-200" />
            </div>
          </div>

          {/* Perforation Line Simulation */}
          <div className="border-t border-dashed border-line-base my-2" />

          {/* Driver Row & Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-300 shrink-0" />
              <div className="space-y-1">
                <div className="h-3.5 w-24 rounded bg-slate-200" />
                <div className="h-2.5 w-16 rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-8 w-20 rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const RideDetailSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading ride commute details"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header Bar Skeleton */}
      <div className="h-10 w-64 rounded-xl bg-slate-200 motion-safe:animate-pulse" />

      {/* Main Ticket Pass Skeleton */}
      <div className="bg-paper border border-line-base rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 motion-safe:animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-line-subtle pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-300 shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-36 rounded bg-slate-300" />
              <div className="h-3.5 w-48 rounded bg-slate-200" />
            </div>
          </div>
          <div className="h-9 w-28 rounded-full bg-slate-200" />
        </div>

        {/* Route Stops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-canvas border border-line-subtle space-y-2">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-4 w-32 rounded bg-slate-300" />
          </div>
          <div className="p-4 rounded-2xl bg-canvas border border-line-subtle space-y-2">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-4 w-32 rounded bg-slate-300" />
          </div>
          <div className="p-4 rounded-2xl bg-canvas border border-line-subtle space-y-2">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-4 w-32 rounded bg-slate-300" />
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="flex justify-between items-center pt-4 border-t border-line-subtle">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-10 w-32 rounded-xl bg-slate-300" />
        </div>
      </div>
    </div>
  );
};

export const ReviewCardSkeleton: React.FC<{ count?: number }> = ({ count = 2 }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading student reviews"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-canvas border border-line-base space-y-3 motion-safe:animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-300 shrink-0" />
              <div className="space-y-1">
                <div className="h-3 w-24 rounded bg-slate-300" />
                <div className="h-2.5 w-16 rounded bg-slate-200" />
              </div>
            </div>
            <div className="h-5 w-14 rounded-full bg-slate-200" />
          </div>
          <div className="h-3.5 w-full rounded bg-slate-200" />
          <div className="h-3.5 w-4/5 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading profile details"
      className="bg-paper border border-line-base rounded-3xl p-6 sm:p-8 space-y-6 motion-safe:animate-pulse"
    >
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-slate-300 shrink-0" />
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="h-6 w-48 rounded bg-slate-300 mx-auto sm:mx-0" />
          <div className="h-4 w-64 rounded bg-slate-200 mx-auto sm:mx-0" />
          <div className="h-4 w-36 rounded bg-slate-100 mx-auto sm:mx-0" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-line-subtle">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-canvas space-y-1.5">
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="h-5 w-20 rounded bg-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const MetricCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading performance metrics"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-paper border border-line-base space-y-2 motion-safe:animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="w-6 h-6 rounded-lg bg-slate-200" />
          </div>
          <div className="h-7 w-28 rounded bg-slate-300" />
          <div className="h-2.5 w-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading table records"
      className="divide-y divide-line-subtle"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-3.5 px-4 flex items-center justify-between gap-4 motion-safe:animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-slate-300" />
              <div className="h-2.5 w-24 rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-6 w-20 rounded-full bg-slate-200" />
          <div className="h-8 w-16 rounded-xl bg-slate-200" />
        </div>
      ))}
    </div>
  );
};
