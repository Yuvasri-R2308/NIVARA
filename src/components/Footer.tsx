import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <footer className="bg-pine-bg border-t border-pine-border px-4 lg:px-6 py-3 mt-auto text-xs font-mono">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-pine-muted">
        
        {/* Official Honesty Disclaimer Notice */}
        <div className="flex items-start gap-2.5 max-w-4xl">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-pine-muted/90">
            <strong className="text-pine-text">DATA HONESTY & TRANSPARENCY PROTOCOL:</strong> Parcel-level risk scores & candidate relocation matching are a synthetic prototype demonstration (SIH26191) engineered for SDMA methodology validation, and do <em className="text-amber-300 not-italic font-semibold">NOT</em> constitute legal land boundaries or official disaster determinations. IMD rainfall observations, KSDMA flood hazard scenarios, Census 2011 demographics, and GSI landslide source registers are official cited government records.
          </p>
        </div>

        {/* SIH Reference & Audit Link */}
        <div className="flex items-center gap-3 shrink-0 text-[11px] self-end md:self-auto">
          <span className="bg-pine-panel px-2 py-0.5 rounded border border-pine-border text-pine-muted">
            REF: <strong className="text-pine-text">SIH26191</strong>
          </span>
          
          <button
            onClick={() => setActiveView('methodology-pipeline')}
            className="text-pine-accent hover:underline flex items-center gap-1 font-sans"
          >
            <span>View Full Audit & Formulas &rarr;</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
