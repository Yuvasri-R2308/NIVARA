import React, { ReactNode } from 'react';
import { DataConfidenceTag } from './DataConfidenceTag';
import { ConfidenceTier } from '../types';

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: ReactNode;
  confidence?: ConfidenceTier;
  variant?: 'default' | 'accent' | 'danger' | 'warning' | 'success';
  trend?: string;
  className?: string;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  unit,
  subtext,
  icon,
  confidence,
  variant = 'default',
  trend,
  className = ''
}) => {
  let borderStyle = 'border-pine-border bg-pine-panel';
  let valueColor = 'text-pine-text';

  if (variant === 'accent') {
    borderStyle = 'border-pine-accent/40 bg-pine-elevated';
    valueColor = 'text-pine-accent';
  } else if (variant === 'danger') {
    borderStyle = 'border-risk-high/40 bg-pine-panel';
    valueColor = 'text-risk-high';
  } else if (variant === 'warning') {
    borderStyle = 'border-risk-medium/40 bg-pine-panel';
    valueColor = 'text-risk-medium';
  } else if (variant === 'success') {
    borderStyle = 'border-risk-low/40 bg-pine-panel';
    valueColor = 'text-risk-low';
  }

  return (
    <div className={`p-4 rounded-lg border transition-all duration-150 ${borderStyle} ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs uppercase tracking-wider text-pine-muted font-medium font-mono">{title}</span>
        {icon && <div className="text-pine-muted/80">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className={`text-2xl lg:text-3xl font-bold font-mono tracking-tight ${valueColor}`}>
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-pine-muted font-medium">{unit}</span>}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-pine-border/40 mt-2">
        {subtext ? (
          <span className="text-[11px] text-pine-muted truncate" title={subtext}>{subtext}</span>
        ) : <span />}
        
        {confidence && <DataConfidenceTag confidence={confidence} size="sm" showLabel={false} />}
      </div>
    </div>
  );
};
