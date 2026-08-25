import React from 'react';
import { RiskLevel } from '../types';

interface Props {
  level: RiskLevel | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<Props> = ({ level, score, size = 'md' }) => {
  const norm = level?.toUpperCase();

  let bgClass = 'bg-[#3FA37D]/20 text-[#3FA37D] border-[#3FA37D]/50';
  let dotClass = 'bg-[#3FA37D]';

  if (norm === 'HIGH' || norm === 'CRITICAL' || norm?.includes('HIGH')) {
    bgClass = 'bg-[#E8543E]/20 text-[#E8543E] border-[#E8543E]/50';
    dotClass = 'bg-[#E8543E]';
  } else if (norm === 'MEDIUM' || norm === 'MODERATE' || norm?.includes('MED')) {
    bgClass = 'bg-[#E8A63E]/20 text-[#E8A63E] border-[#E8A63E]/50';
    dotClass = 'bg-[#E8A63E]';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border font-mono tracking-wide ${bgClass} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} ${norm === 'HIGH' ? 'animate-pulse' : ''}`} />
      <span>{norm}</span>
      {score !== undefined && (
        <span className="opacity-90 font-mono">({score.toFixed(1)})</span>
      )}
    </span>
  );
};
