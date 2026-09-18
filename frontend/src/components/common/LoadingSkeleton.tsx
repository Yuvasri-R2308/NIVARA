import React from 'react';

interface Props {
  message?: string;
}

export const LoadingSkeleton: React.FC<Props> = ({ message = 'Ingesting spatial hazard layers & calculating CCAS indices...' }) => {
  return (
    <div className="p-8 space-y-6 animate-pulse min-h-[500px]">
      {/* Top Banner Skeleton */}
      <div className="h-16 bg-pine-panel rounded-lg border border-pine-border flex items-center px-6 justify-between">
        <div className="space-y-2">
          <div className="h-4 w-48 bg-pine-border/60 rounded" />
          <div className="h-3 w-80 bg-pine-border/40 rounded" />
        </div>
        <div className="h-8 w-28 bg-pine-border/60 rounded" />
      </div>

      {/* Grid of Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-pine-panel rounded-lg border border-pine-border p-4 space-y-3">
            <div className="h-3 w-24 bg-pine-border/50 rounded" />
            <div className="h-7 w-32 bg-pine-border/80 rounded" />
            <div className="h-2.5 w-full bg-pine-border/30 rounded" />
          </div>
        ))}
      </div>

      {/* Main Panel Skeleton */}
      <div className="h-96 bg-pine-panel rounded-lg border border-pine-border p-6 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-pine-accent border-t-transparent animate-spin" />
        <div className="space-y-1">
          <p className="font-mono text-sm text-pine-text font-medium">{message}</p>
          <p className="font-sans text-xs text-pine-muted">Loading 1,000 cadastral parcels across Wayanad study area...</p>
        </div>
      </div>
    </div>
  );
};
