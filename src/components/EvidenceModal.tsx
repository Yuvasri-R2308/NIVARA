import React, { useState } from 'react';
import { 
  X, 
  Database, 
  FileCode2, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  BookOpen,
  Scale,
  CheckCircle2
} from 'lucide-react';
import { DataConfidenceTag } from './DataConfidenceTag';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sources' | 'methodology' | 'formulas' | 'provenance' | 'limitations'>('sources');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono text-xs">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0E1A15] border border-[#1E3228] rounded-2xl shadow-modal flex flex-col overflow-hidden text-pine-text">
        
        {/* Modal Header */}
        <div className="p-4 lg:p-5 border-b border-[#1E3228] flex items-center justify-between bg-[#111D18]">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base lg:text-lg font-serif font-bold text-white">
                DATA & EVIDENCE VAULT
              </h2>
              <span className="text-[10px] text-pine-muted font-sans block">
                Research Transparency, Mathematical Formulas & Ingestion Provenance
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0B1310] hover:bg-[#1E3228] text-pine-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex items-center gap-1 p-2 bg-[#0B1310] border-b border-[#1E3228] overflow-x-auto text-[11px]">
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'sources' ? 'bg-emerald-600 text-white shadow-sm' : 'text-pine-muted hover:text-white'
            }`}
          >
            1. DATA SOURCES
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'methodology' ? 'bg-emerald-600 text-white shadow-sm' : 'text-pine-muted hover:text-white'
            }`}
          >
            2. METHODOLOGY
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'formulas' ? 'bg-emerald-600 text-white shadow-sm' : 'text-pine-muted hover:text-white'
            }`}
          >
            3. FORMULAS
          </button>
          <button
            onClick={() => setActiveTab('provenance')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'provenance' ? 'bg-emerald-600 text-white shadow-sm' : 'text-pine-muted hover:text-white'
            }`}
          >
            4. PROVENANCE
          </button>
          <button
            onClick={() => setActiveTab('limitations')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'limitations' ? 'bg-emerald-600 text-white shadow-sm' : 'text-pine-muted hover:text-white'
            }`}
          >
            5. DATA LIMITATIONS
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: DATA SOURCES */}
          {activeTab === 'sources' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="text-white font-bold font-mono text-sm border-b border-[#1E3228] pb-1.5">
                Official Ingested Scientific Datasets:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Geological Survey of India (GSI)</span>
                    <DataConfidenceTag confidence="HIGH" size="sm" />
                  </div>
                  <p className="text-[11px] text-pine-muted font-sans">
                    2022 Landslide Susceptibility Macro-Zonation (1:50,000 scale) validated against the July 30, 2024 Chooralmala debris flow scarp.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>India Meteorological Dept (IMD)</span>
                    <DataConfidenceTag confidence="HIGH" size="sm" />
                  </div>
                  <p className="text-[11px] text-pine-muted font-sans">
                    24h AWS rain gauges: 284.5mm at Vythiri / Meppadi stations recording extreme cloudburst exceedance thresholds.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>SRTM 30m Digital Elevation Model</span>
                    <DataConfidenceTag confidence="HIGH" size="sm" />
                  </div>
                  <p className="text-[11px] text-pine-muted font-sans">
                    Topographic slope angles, drainage flow accumulation, aspect angles, and stream network vector delineation.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>KSDMA Floodplain Hazard Atlas</span>
                    <DataConfidenceTag confidence="HIGH" size="sm" />
                  </div>
                  <p className="text-[11px] text-pine-muted font-sans">
                    10-year, 25-year, and 100-year return period flood inundation footprints along Kabini and Chaliyar drainage basins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METHODOLOGY */}
          {activeTab === 'methodology' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="text-white font-bold font-mono text-sm border-b border-[#1E3228] pb-1.5">
                4-Stage Geospatial Processing Pipeline:
              </div>
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-1">
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">STAGE 1: Cadastral Hazard Overlay & Multi-Criteria Evaluation</span>
                  <p className="text-pine-muted text-[11px] leading-relaxed">
                    Raster DEM layers and meteorological telemetry are clipped to individual digital survey parcels across Meppadi, Achooranam, Kottathara, and Kuppadithara.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-1">
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">STAGE 2: Debris Flow Runout Hydrodynamics</span>
                  <p className="text-pine-muted text-[11px] leading-relaxed">
                    Flow routing models determine kinetic energy, runout velocity (48.5 km/h), and deposition downstream of the Chembra peak failure crest.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-1">
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">STAGE 3: Resettlement Exclusion Matrix</span>
                  <p className="text-pine-muted text-[11px] leading-relaxed">
                    Candidate lands are screened through mandatory legal filters: zero landslide susceptibility, outside 100-yr flood level, slope &lt;10°, and outside ecologically sensitive forest buffer.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-1">
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">STAGE 4: Multi-Objective Relocation Allocation</span>
                  <p className="text-pine-muted text-[11px] leading-relaxed">
                    Linear programming optimization solves for minimum transit distance and maximized safety gain while preserving community cohesion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FORMULAS */}
          {activeTab === 'formulas' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="text-white font-bold font-mono text-sm border-b border-[#1E3228] pb-1.5">
                Mathematical Formulations:
              </div>

              <div className="p-3.5 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-2 font-mono">
                <span className="text-emerald-400 font-bold text-xs">1. Hazard Red-Zone Index (HRI):</span>
                <div className="p-2 bg-[#12221B] rounded border border-[#1E3228] text-emerald-300 text-[11px]">
                  HRI = 0.30·Slope + 0.25·Rain + 0.25·GSI_Landslide + 0.10·FloodDepth + 0.10·SoilMoisture
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-2 font-mono">
                <span className="text-emerald-400 font-bold text-xs">2. Relocation Priority Index (RPI):</span>
                <div className="p-2 bg-[#12221B] rounded border border-[#1E3228] text-emerald-300 text-[11px]">
                  RPI = 0.40·HRI + 0.25·PopDensity + 0.20·IsolatedAccess + 0.15·BuildingDensity
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0B1310] border border-[#1E3228] space-y-2 font-mono">
                <span className="text-emerald-400 font-bold text-xs">3. Composite Carrying Capacity Suitability (CCAS):</span>
                <div className="p-2 bg-[#12221B] rounded border border-[#1E3228] text-emerald-300 text-[11px]">
                  CCAS = 0.30·SlopeSafety + 0.25·RoadAccess + 0.20·WaterYield + 0.15·PowerGrid + 0.10·EcoSafety
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROVENANCE */}
          {activeTab === 'provenance' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="text-white font-bold font-mono text-sm border-b border-[#1E3228] pb-1.5">
                Data Lineage & Verification Ledger:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-[#1E3228] text-pine-muted uppercase text-[10px]">
                      <th className="pb-2">Dataset Name</th>
                      <th className="pb-2">Authority / Publisher</th>
                      <th className="pb-2">Scale / Resolution</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E3228]">
                    <tr>
                      <td className="py-2 font-bold text-white">Landslide Zonation</td>
                      <td className="py-2 text-pine-muted">Geological Survey of India (GSI)</td>
                      <td className="py-2 text-pine-text">1:50,000</td>
                      <td className="py-2 text-emerald-400 font-bold">Validated</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">Digital Elevation Model</td>
                      <td className="py-2 text-pine-muted">NASA SRTM</td>
                      <td className="py-2 text-pine-text">30m / 1 arc-sec</td>
                      <td className="py-2 text-emerald-400 font-bold">Validated</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">Census Demographics</td>
                      <td className="py-2 text-pine-muted">Registrar General of India</td>
                      <td className="py-2 text-pine-text">Village / Panchayat (2011)</td>
                      <td className="py-2 text-emerald-400 font-bold">Validated</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">Precipitation Telemetry</td>
                      <td className="py-2 text-pine-muted">IMD AWS Network</td>
                      <td className="py-2 text-pine-text">Station-level 24h</td>
                      <td className="py-2 text-emerald-400 font-bold">Validated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DATA LIMITATIONS */}
          {activeTab === 'limitations' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="text-white font-bold font-mono text-sm border-b border-[#1E3228] pb-1.5 flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Academic & Decision-Support Disclosure:</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/60 space-y-2 leading-relaxed text-pine-text">
                <p>
                  <strong>Cadastral Synthetic Boundary Notice:</strong> While GSI macro-zonation, IMD weather telemetry, SRTM elevation, and Census demographics represent validated empirical records, individual parcel boundaries (1,000 cadastral records) have been computationally synthesized for study benchmarking.
                </p>
                <p>
                  <strong>Executive Action Clearance:</strong> Official resettlement physical ground-breaking must be accompanied by site-specific geotechnical core boreholes and Revenue Department title verification before execution.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1E3228] bg-[#111D18] flex items-center justify-between">
          <span className="text-[10px] text-pine-muted">NIVARA Disaster Intelligence System &bull; Version 2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};
