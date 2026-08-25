import React from 'react';
import { ConfidenceTier } from '../types';

interface Props {
  confidence: ConfidenceTier | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  inline?: boolean;
}

export const DataConfidenceTag: React.FC<Props> = ({ 
  confidence, 
  size = 'sm', 
  showLabel = true,
  inline = true 
}) => {
  const conf = confidence.toUpperCase();

  let tagStyles = 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300';
  let labelText = 'OFFICIAL CITATION';
  let badgeLetter = 'H';

  if (conf.includes('MED')) {
    tagStyles = 'border-amber-500/40 bg-amber-950/40 text-amber-300';
    labelText = 'DERIVED / SPATIAL PROXY';
    badgeLetter = 'M';
  } else if (conf.includes('LOW')) {
    tagStyles = 'border-rose-500/40 bg-rose-950/40 text-rose-300';
    labelText = 'SYNTHETIC / MODELED';
    badgeLetter = 'L';
  }

  const isSmall = size === 'sm';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold border rounded ${
        isSmall ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      } ${tagStyles} ${inline ? 'inline-flex' : 'flex'}`}
      title={`Data Confidence Level: ${conf}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      <span>[{conf}]</span>
      {showLabel && <span className="opacity-75 hidden sm:inline">{labelText}</span>}
    </span>
  );
};
