import React from 'react';
import { useApp } from '../context/AppContext';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { 
  FileCode2, 
  ShieldAlert, 
  Scale, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  ExternalLink,
  Info,
  BookOpen,
  Cpu
} from 'lucide-react';

export const MethodologyPipeline: React.FC = () => {
  const { data } = useApp();

  if (!data) return null;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              AUDIT & METHODOLOGY — SIH26191
            </span>
            <span className="text-xs font-mono text-pine-muted">ALGORITHMIC DEFENSE & TRANSPARENCY</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text mt-1">
            Methodology Pipeline, Equations & Data Transparency Audit
          </h1>
          <p className="text-xs lg:text-sm text-pine-muted mt-1 max-w-3xl">
            <strong>Decision Changed:</strong> Provides judges, SDMA legal counsels, and disaster researchers with a complete, fully auditable mathematical formulation of all 7 decision engines with explicit confidence tags.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-pine-elevated px-3 py-2 rounded border border-pine-border font-mono text-xs text-pine-text">
          <span>PROJECT CODE: <strong className="text-pine-accent">SIH26191</strong></span>
        </div>
      </div>

      {/* Critical Data Honesty Declaration Box */}
      <div className="bg-rose-950/20 border-2 border-rose-800/80 rounded-xl p-5 space-y-3 font-sans text-xs">
        <div className="flex items-center gap-2.5 text-rose-400 font-serif font-bold text-base">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>MANDATORY DATA HONESTY & CREDIBILITY DISCLOSURE</span>
        </div>
        <p className="text-pine-text leading-relaxed font-sans text-xs">
          <strong>NIVARA (SIH26191)</strong> is designed around strict data honesty. The 1,000 parcel-level risk records (<code className="text-rose-300 bg-pine-bg px-1 py-0.5 rounded font-mono">06_Cadastral_Prototype.csv</code>) are explicitly labeled as a <em>synthetic prototype demonstration</em> for algorithmic evaluation and must <strong className="text-rose-300 uppercase">not</strong> be used as legal cadastral boundary determinations.
        </p>
        <p className="text-pine-muted leading-relaxed text-xs">
          Conversely, all macro-environmental layers—including <strong>IMD 2024 rainfall station observations</strong>, <strong>KSDMA flood hazard scenarios (10–500 yr return periods)</strong>, <strong>Census of India 2011 demographics</strong>, <strong>SRTM digital elevation</strong>, and <strong>GSI 2022 landslide susceptibility registers</strong>—are cited, official government datasets integrated with complete provenance.
        </p>
      </div>

      {/* The 7 Engines Mathematical Formulation */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-pine-text flex items-center gap-2">
          <Cpu className="w-5 h-5 text-pine-accent" />
          <span>The 7 Core Decision Engines: Mathematical Formulations</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
          
          {/* Engine 1: HRI */}
          <div className="bg-pine-panel border border-pine-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-pine-border pb-2">
              <span className="font-bold text-pine-accent text-sm">Engine 1 & 2: Multi-Hazard Red-Zone Index (HRI)</span>
              <DataConfidenceTag confidence="HIGH" size="sm" showLabel={false} />
            </div>
            <p className="text-pine-muted font-sans text-[11px]">
              Computes multi-hazard vulnerability by integrating slope shear stress, precipitation saturation, landslide susceptibility, and drainage buffers.
            </p>
            <div className="p-2.5 rounded bg-pine-bg border border-pine-border text-emerald-300 text-[11px]">
              {'HRI = 0.30·Slope + 0.25·Rainfall + 0.25·GSI_Landslide + 0.10·FloodDepth + 0.10·SoilMoisture'}
            </div>
            <ul className="text-[10px] text-pine-muted space-y-1 font-sans">
              <li>&bull; <strong className="font-mono text-pine-text">HIGH RISK (Red Zone):</strong> HRI &ge; 60 (Mandatory Physical Relocation)</li>
              <li>&bull; <strong className="font-mono text-pine-text">MEDIUM RISK (Caution):</strong> 35 &le; HRI &lt; 60 (Slope Mitigation / Monitoring)</li>
              <li>&bull; <strong className="font-mono text-pine-text">LOW RISK (Safe):</strong> HRI &lt; 35 (Stable Baseline)</li>
            </ul>
          </div>

          {/* Engine 3 & 6: RPI Priority Queue */}
          <div className="bg-pine-panel border border-pine-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-pine-border pb-2">
              <span className="font-bold text-pine-accent text-sm">Engine 3 & 6: AI Relocation Priority Score (RPI)</span>
              <DataConfidenceTag confidence="HIGH" size="sm" showLabel={false} />
            </div>
            <p className="text-pine-muted font-sans text-[11px]">
              Weights hazard intensity against exposed population density and road cutoff isolation to establish the operational evacuation order.
            </p>
            <div className="p-2.5 rounded bg-pine-bg border border-pine-border text-emerald-300 text-[11px]">
              {'RPI = 0.45(HRI) + 0.25(PopDensity) + 0.15(RoadDist) + 0.15(DisasterHistory)'}
            </div>
            <ul className="text-[10px] text-pine-muted space-y-1 font-sans">
              <li>&bull; <strong className="font-mono text-rose-400">Immediate Phase (0-30d):</strong> RPI &ge; 75 or Epicenter (Meppadi)</li>
              <li>&bull; <strong className="font-mono text-amber-300">Short-Term Phase (30-90d):</strong> 50 &le; RPI &lt; 75</li>
              <li>&bull; <strong className="font-mono text-emerald-300">Medium-Term (90-180d):</strong> RPI &lt; 50</li>
            </ul>
          </div>

          {/* Engine 4: CCAS Carrying Capacity */}
          <div className="bg-pine-panel border border-pine-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-pine-border pb-2">
              <span className="font-bold text-pine-accent text-sm">Engine 4: Carrying Capacity Assessment (CCAS)</span>
              <DataConfidenceTag confidence="HIGH" size="sm" showLabel={false} />
            </div>
            <p className="text-pine-muted font-sans text-[11px]">
              Evaluates safe candidate destination parcels across 5 independent geotechnical and civic suitability dimensions.
            </p>
            <div className="p-2.5 rounded bg-pine-bg border border-pine-border text-emerald-300 text-[11px]">
              {'CCAS = 0.25(Slope) + 0.25(Water) + 0.20(RoadAccess) + 0.15(EcoSafety) + 0.15(SocialInfra)'}
            </div>
            <p className="text-[10px] text-pine-muted font-sans">
              {'Safe Capacity Ceiling = UsableArea × 0.70 × SafeDensityFactor (Enforces zero environmental overdraw).'}
            </p>
          </div>

          {/* Engine 5 & 7: Relocation Engine & Explainability */}
          <div className="bg-pine-panel border border-pine-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-pine-border pb-2">
              <span className="font-bold text-pine-accent text-sm">Engine 5 & 7: Smart Matching & Explainability</span>
              <DataConfidenceTag confidence="HIGH" size="sm" showLabel={false} />
            </div>
            <p className="text-pine-muted font-sans text-[11px]">
              Multi-objective integer linear programming pairing habitations to destinations minimizing distance and maximizing safety boost.
            </p>
            <div className="p-2.5 rounded bg-pine-bg border border-pine-border text-emerald-300 text-[11px]">
              {'min Σ [ 0.40·Distance + 0.35·(100 - CCAS) + 0.15·TransitCost ]'}
            </div>
            <p className="text-[10px] text-pine-muted font-sans">
              Every score outputs a human-readable one-sentence justification explaining exact factor contributions.
            </p>
          </div>

        </div>
      </div>

      {/* Confidence System Legend */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-5 space-y-3">
        <h3 className="text-base font-serif font-bold text-pine-text">
          Three-Tier Data Confidence Honesty Protocol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded bg-emerald-950/30 border border-emerald-800 space-y-1">
            <span className="text-emerald-300 font-bold block">[HIGH CONFIDENCE - OFFICIAL]</span>
            <p className="text-[11px] text-pine-muted font-sans">
              Cited official government datasets: IMD observations, Census 2011, KSDMA flood reports, SRTM DEM.
            </p>
          </div>
          <div className="p-3 rounded bg-amber-950/30 border border-amber-800 space-y-1">
            <span className="text-amber-300 font-bold block">[MEDIUM CONFIDENCE - DERIVED]</span>
            <p className="text-[11px] text-pine-muted font-sans">
              Spatial interpolations, satellite change detections, and regional rainfall proxy distributions.
            </p>
          </div>
          <div className="p-3 rounded bg-rose-950/30 border border-rose-800 space-y-1">
            <span className="text-rose-300 font-bold block">[LOW CONFIDENCE - MODELED]</span>
            <p className="text-[11px] text-pine-muted font-sans">
              Synthetic prototype cadastral parcels demonstrating multi-hazard scoring methodology.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
