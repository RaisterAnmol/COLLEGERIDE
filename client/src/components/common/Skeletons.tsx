import React from 'react';

/**
 * High-fidelity responsive skeletons matching the tactile Campus Atlas design language
 * Uses soft CSS shimmer gradient with paper tones.
 */

export const RideTicketSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-paper border border-line-base rounded-3xl p-5 shadow-xs relative overflow-hidden space-y-4 animate-pulse"
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

export const MetricCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-paper border border-line-base space-y-2 animate-pulse"
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
    <div className="divide-y divide-line-subtle">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-3.5 px-4 flex items-center justify-between gap-4 animate-pulse">
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

