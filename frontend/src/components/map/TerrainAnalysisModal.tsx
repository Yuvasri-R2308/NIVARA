import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mountain, 
  Waves, 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Activity,
  Download,
  CheckCircle2
} from 'lucide-react';
import { 
  detectPeaks, 
  detectLowPoints, 
  getTerrainAnalysis, 
  TerrainPeak, 
  TerrainLowPoint,
  TerrainAnalysisData 
} from '../../services/demService';
import { HazardType } from '../../types';
import { useApp } from '../../context/AppContext';

interface TerrainAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  village?: string;
  hazard?: HazardType | null;
}

const MODAL_STUDY_ZONES: Record<HazardType, { value: string; label: string }[]> = {
  'landslide': [
    { value: 'Meppadi', label: 'Meppadi (Epicenter & Headwall Scarp)' },
    { value: 'Mundakkai', label: 'Mundakkai (Upper Debris Detachment Scarp)' },
    { value: 'Chooralmala', label: 'Chooralmala (Bridge Runout Confluence)' },
    { value: 'Chembra', label: 'Chembra (Massif Peak & Headwall Crest)' },
    { value: 'Achooranam', label: 'Achooranam (Tea Plantation Valley)' },
    { value: 'Kottathara', label: 'Kottathara (Kabini Alluvial Basin)' },
    { value: 'Kuppadithara', label: 'Kuppadithara (Agricultural Flatlands)' },
    { value: 'Kalpetta', label: 'Kalpetta (Plateau Administrative Ridge)' },
    { value: 'Vythiri', label: 'Vythiri (Ghat Pass Corridor)' },
    { value: 'Padinharethara', label: 'Padinharethara (Banasura Divide)' },
    { value: 'ALL', label: 'Full Wayanad District (Regional Topography)' },
  ],
  'flood': [
    { value: 'Rohmaria', label: 'Rohmaria (Embankment Breach & Scour Zone)' },
    { value: 'Maijan', label: 'Maijan (Maijan Beel Flood Detention Basin)' },
    { value: 'Dibrugarh University', label: 'Dibrugarh University (Safe Elevated Terrace 108m)' },
    { value: 'Barbaruah', label: 'Barbaruah (High Alluvial Relief Mound 114m)' },
    { value: 'Chabua', label: 'Chabua (Upper Highland Relocation Hub 124m)' },
    { value: 'ALL', label: 'Full Dibrugarh Reach (Brahmaputra Basin)' },
  ],
  'cloudburst': [
    { value: 'Mandakini Gorge', label: 'Mandakini Gorge (Incised Bedrock Chasm & Runout)' },
    { value: 'Kedarnath', label: 'Kedarnath (Glacial Cirque & Temple Terrace 3584m)' },
    { value: 'Rambara', label: 'Rambara (Chute Bottleneck & Debris Funnel)' },
    { value: 'Guptkashi', label: 'Guptkashi (Safe Elevated Bedrock Terrace 1319m)' },
    { value: 'Ukhimath', label: 'Ukhimath (Valley Escarpment Spur 1480m)' },
    { value: 'ALL', label: 'Full Mandakini Valley (High Himalaya Basin)' },
  ],
  'coastal-erosion': [
    { value: 'Podampeta', label: 'Podampeta (Active Shoreline & Retreating Fore-Dune)' },
    { value: 'Rushikulya', label: 'Rushikulya (Estuarine Tidal Mouth & Spit)' },
    { value: 'Humma', label: 'Humma (Salt Pan Depression & Ridge Buffer 34m)' },
    { value: 'Rangeilunda', label: 'Rangeilunda (Inland Safe Laterite Plateau 48m)' },
    { value: 'ALL', label: 'Full Ganjam Coast (Littoral & Upland Zone)' },
  ]
};

export const TerrainAnalysisModal: React.FC<TerrainAnalysisModalProps> = ({
  isOpen,
  onClose,
  village,
  hazard
}) => {
  const { selectedHazard } = useApp();
  const currentHazard: HazardType = hazard || selectedHazard || 'landslide';

  const defaultVillage = village || (
    currentHazard === 'flood' ? 'Rohmaria' :
    currentHazard === 'cloudburst' ? 'Mandakini Gorge' :
    currentHazard === 'coastal-erosion' ? 'Podampeta' :
    'Meppadi'
  );

  const [activeVillage, setActiveVillage] = useState<string>(defaultVillage);
  const [data, setData] = useState<TerrainAnalysisData>(() => getTerrainAnalysis(defaultVillage, currentHazard));
  const [activeTab, setActiveTab] = useState<'overview' | 'peaks' | 'valleys' | 'slope'>('overview');

  useEffect(() => {
    if (village) {
      setActiveVillage(village);
    } else {
      setActiveVillage(defaultVillage);
    }
  }, [village, currentHazard]);

  useEffect(() => {
    setData(getTerrainAnalysis(activeVillage, currentHazard));
  }, [activeVillage, currentHazard]);

  // Attempt to fetch live from backend API if available
  useEffect(() => {
    fetch(`/api/v2/dem/terrain-analysis?village=${activeVillage}`)
      .then(res => res.json())
      .then(apiData => {
        if (apiData && apiData.status === 'SUCCESS') {
          // Backend has calibrated data
        }
      })
      .catch(() => {
        // Fallback to local demService cleanly
      });
  }, [activeVillage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#07130F] border border-emerald-500/40 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-pine-text font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#1E3228] bg-[#0B1A14]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Digital Elevation Model (DEM) & Topographic Intelligence
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono font-bold">
                  {currentHazard === 'flood' ? 'ALOS PALSAR 12.5m CALIBRATED' : currentHazard === 'cloudburst' ? 'COPERNICUS GLO-30 CALIBRATED' : currentHazard === 'coastal-erosion' ? 'USGS DSAS / AW3D30 CALIBRATED' : 'SRTM 30m CALIBRATED'}
                </span>
              </div>
              <p className="text-xs text-pine-muted mt-0.5">
                Topographic relief, peak classification, water accumulation corridors & slope stability matrix
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-pine-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUBHEADER: STUDY AREA SELECTOR & NAVIGATION TABS */}
        <div className="px-5 py-2.5 border-b border-[#1A2E24] bg-[#06100C] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-pine-muted">Study Zone:</span>
            <select
              value={activeVillage}
              onChange={(e) => setActiveVillage(e.target.value)}
              className="bg-[#0B1A14] text-emerald-300 text-xs font-mono px-3 py-1 rounded-lg border border-emerald-500/30 focus:outline-none cursor-pointer"
            >
              {(MODAL_STUDY_ZONES[currentHazard] || MODAL_STUDY_ZONES['landslide']).map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#091410] p-1 rounded-lg border border-[#162A20]">
            {(['overview', 'peaks', 'valleys', 'slope'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-xs font-mono capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'text-pine-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'peaks' ? (currentHazard === 'coastal-erosion' ? '▲ Dunes & Plateaus' : currentHazard === 'flood' ? '▲ Levees & Terraces' : '▲ Peaks & Ridges') : tab === 'valleys' ? (currentHazard === 'coastal-erosion' ? '● Intertidal & Swash' : currentHazard === 'cloudburst' ? '● Gorge Chutes' : '● Valleys & Basins') : 'Slope Distribution'}
              </button>
            ))}
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Top 4 Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0A1611] p-3.5 rounded-xl border border-emerald-500/20">
                  <div className="text-[11px] font-mono text-pine-muted uppercase">Highest Elevation</div>
                  <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                    ▲ {data.highestPoint.elevationM} m
                  </div>
                  <div className="text-[11px] text-white/80 mt-1 truncate">
                    {data.highestPoint.name}
                  </div>
                </div>

                <div className="bg-[#0A1611] p-3.5 rounded-xl border border-cyan-500/20">
                  <div className="text-[11px] font-mono text-pine-muted uppercase">Lowest Elevation</div>
                  <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                    ● {data.lowestPoint.elevationM} m
                  </div>
                  <div className="text-[11px] text-white/80 mt-1 truncate">
                    {data.lowestPoint.name}
                  </div>
                </div>

                <div className="bg-[#0A1611] p-3.5 rounded-xl border border-amber-500/20">
                  <div className="text-[11px] font-mono text-pine-muted uppercase">Elevation Relief Span</div>
                  <div className="text-xl font-mono font-bold text-amber-300 mt-1">
                    {data.elevationRangeM} m
                  </div>
                  <div className="text-[11px] text-pine-muted mt-1">
                    Vertical gradient drop
                  </div>
                </div>

                <div className="bg-[#0A1611] p-3.5 rounded-xl border border-purple-500/20">
                  <div className="text-[11px] font-mono text-pine-muted uppercase">Mean Topographic Slope</div>
                  <div className="text-xl font-mono font-bold text-purple-300 mt-1">
                    {data.avgSlopeDeg}&deg; (Max {data.maxSlopeDeg}&deg;)
                  </div>
                  <div className="text-[11px] text-pine-muted mt-1">
                    SRTM 30m grid derivative
                  </div>
                </div>
              </div>

              {/* Hypsometric Natural GIS Color Scale Card */}
              <div className="bg-[#091510] p-4 rounded-xl border border-[#192E23] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Hypsometric DEM Elevation Palette (Realistic Earth Tones)
                  </div>
                  <span className="text-[11px] font-mono text-pine-muted">
                    No artificial neon gradients &bull; Continuous GIS scale
                  </span>
                </div>

                {/* Color Ramp Bar */}
                <div className="h-4 w-full rounded-lg overflow-hidden border border-white/10 flex shadow-inner">
                  <div className="w-[15%] bg-[#D4C8B2] flex items-center justify-center text-[9px] font-mono font-bold text-stone-900" title="715m-760m: Lowland Sand">715m</div>
                  <div className="w-[15%] bg-[#C2B69F] flex items-center justify-center text-[9px] font-mono font-bold text-stone-900" title="760m-840m: Warm Tan">800m</div>
                  <div className="w-[20%] bg-[#8B9B85] flex items-center justify-center text-[9px] font-mono font-bold text-stone-900" title="840m-980m: Soft Sage">950m</div>
                  <div className="w-[22%] bg-[#697A63] flex items-center justify-center text-[9px] font-mono font-bold text-stone-100" title="980m-1200m: Desaturated Olive">1,150m</div>
                  <div className="w-[18%] bg-[#4C5C48] flex items-center justify-center text-[9px] font-mono font-bold text-stone-100" title="1200m-1450m: Dark Forest">1,400m</div>
                  <div className="w-[10%] bg-[#6D675F] flex items-center justify-center text-[9px] font-mono font-bold text-stone-100" title="1450m-1657m: Stone Gray">1,657m</div>
                </div>

                <div className="grid grid-cols-3 text-[11px] font-mono text-pine-muted pt-1">
                  <div>Lowland Basin &amp; River Confluence</div>
                  <div className="text-center">Mid-Slope Terraces &amp; Tea Hills</div>
                  <div className="text-right">High Mountain Divide &amp; Scarp Crest</div>
                </div>
              </div>

              {/* SDMA Geomorphic Takeaways */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#0E1612] p-4 rounded-xl border border-rose-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    High-Elevation Headwall Scarp Dynamics
                  </div>
                  <p className="text-xs text-pine-text/85 leading-relaxed">
                    Elevations exceeding 1,200m in Meppadi (Chembra Scarp) exhibit steep slopes &gt; 40&deg;. Saturated colluvial regolith undergoes shear failure under monsoon conditions &gt; 200mm/24h, generating catastrophic debris torrents that travel down into low valleys.
                  </p>
                </div>

                <div className="bg-[#0E1612] p-4 rounded-xl border border-emerald-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    Topographic Clearance for Resettlement
                  </div>
                  <p className="text-xs text-pine-text/85 leading-relaxed">
                    NIVARA candidate relocation havens (e.g. Kottathara East Haven, Achoor East Estate) are sited on gentle plateau knolls (slopes 4&deg;–9&deg;) elevated 35m–60m above adjacent drainage basins, ensuring zero flood inundation and zero debris runout risk.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DETECTED PROMINENT PEAKS */}
          {activeTab === 'peaks' && (
            <div className="space-y-4">
              <div className="text-xs text-pine-muted">
                Prominent peaks detected via local neighborhood maxima extraction with minimum prominence threshold &gt; 100m.
              </div>

              <div className="space-y-2.5">
                {data.detectedPeaks.map((peak) => (
                  <div 
                    key={peak.id}
                    className="bg-[#0A1611] p-3.5 rounded-xl border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold font-mono text-sm">▲</span>
                        <span className="font-bold text-white text-sm">{peak.name}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                          {peak.classification}
                        </span>
                      </div>
                      <p className="text-xs text-pine-muted">
                        {peak.hazardContext}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono bg-[#050D0A] px-3 py-2 rounded-lg border border-[#162A20] self-start sm:self-auto">
                      <div>
                        <div className="text-[9px] text-pine-muted uppercase">Elevation</div>
                        <div className="font-bold text-emerald-400">{peak.elevationM} m</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-pine-muted uppercase">Prominence</div>
                        <div className="font-bold text-white">{peak.prominenceM} m</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-pine-muted uppercase">Slope</div>
                        <div className="font-bold text-amber-400">{peak.slopeDeg}&deg;</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VALLEYS & WATER ACCUMULATION BASINS */}
          {activeTab === 'valleys' && (
            <div className="space-y-4">
              <div className="text-xs text-pine-muted">
                Low-lying topographic depressions and confluence points susceptible to rapid storm runoff accumulation.
              </div>

              <div className="space-y-2.5">
                {data.detectedLowPoints.map((lowPoint) => (
                  <div 
                    key={lowPoint.id}
                    className="bg-[#09151A] p-3.5 rounded-xl border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold font-mono text-sm">●</span>
                        <span className="font-bold text-white text-sm">{lowPoint.name}</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                          {lowPoint.classification}
                        </span>
                      </div>
                      <p className="text-xs text-rose-300 font-semibold">
                        {lowPoint.potentialRelevance}
                      </p>
                      <p className="text-xs text-pine-muted">
                        {lowPoint.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono bg-[#050D0A] px-3 py-2 rounded-lg border border-[#162A20] self-start sm:self-auto">
                      <div>
                        <div className="text-[9px] text-pine-muted uppercase">Floor Elev</div>
                        <div className="font-bold text-cyan-400">{lowPoint.elevationM} m</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-pine-muted uppercase">Rel. Depth</div>
                        <div className="font-bold text-white">{lowPoint.depthM} m</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-pine-muted uppercase">Floor Slope</div>
                        <div className="font-bold text-emerald-400">{lowPoint.slopeDeg}&deg;</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SLOPE DISTRIBUTION */}
          {activeTab === 'slope' && (
            <div className="space-y-4">
              <div className="text-xs text-pine-muted">
                Slope gradient distribution calculated from 31,501 empirical DEM sample points across Wayanad.
              </div>

              <div className="space-y-3">
                <div className="bg-[#0A1611] p-3.5 rounded-xl border border-[#192E23] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-emerald-300">Flat (0&deg; &ndash; 5&deg;) &bull; Alluvial Basins &amp; Valley Floors</span>
                    <span className="font-bold text-white">{data.slopeDistribution.flat}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.slopeDistribution.flat}%` }} />
                  </div>
                  <p className="text-[11px] text-pine-muted">Low slope angle; prone to water stagnation and riverine inundation during extreme precipitation.</p>
                </div>

                <div className="bg-[#0A1611] p-3.5 rounded-xl border border-[#192E23] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-300">Gentle (5&deg; &ndash; 15&deg;) &bull; Resettlement Plateaus &amp; Safe Havens</span>
                    <span className="font-bold text-white">{data.slopeDistribution.gentle}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${data.slopeDistribution.gentle}%` }} />
                  </div>
                  <p className="text-[11px] text-pine-muted">Optimal construction gradient with natural drainage, high bearing capacity, and zero landslide hazard.</p>
                </div>

                <div className="bg-[#0A1611] p-3.5 rounded-xl border border-[#192E23] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-amber-300">Moderate (15&deg; &ndash; 30&deg;) &bull; Tea Plantations &amp; Hillslopes</span>
                    <span className="font-bold text-white">{data.slopeDistribution.moderate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${data.slopeDistribution.moderate}%` }} />
                  </div>
                  <p className="text-[11px] text-pine-muted">Agricultural zones requiring terrace engineering and deep drainage to prevent shallow slip failure.</p>
                </div>

                <div className="bg-[#0A1611] p-3.5 rounded-xl border border-[#192E23] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-rose-400">Steep (&gt; 30&deg;) &bull; Mountain Scarps &amp; Debris Initiation Zones</span>
                    <span className="font-bold text-white">{data.slopeDistribution.steep}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${data.slopeDistribution.steep}%` }} />
                  </div>
                  <p className="text-[11px] text-pine-muted">Uninhabitable high-risk detachment scars; source zones for catastrophic mud and rock avalanches.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-[#1E3228] bg-[#0A1813]/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-pine-muted">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Calibrated against 31,501 SRTM elevation points for Wayanad</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
          >
            Close Analysis
          </button>
        </div>

      </div>
    </div>
  );
};
