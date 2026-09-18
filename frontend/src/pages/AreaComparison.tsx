import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/common/RiskBadge';
import { DataConfidenceTag } from '../components/common/DataConfidenceTag';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { AREA_HAZARD_REGISTRY } from '../data/areaHazardProfiles';
import { 
  BarChart2, 
  ArrowRight, 
  Users, 
  Mountain, 
  Waves, 
  CloudRain, 
  TrendingUp, 
  Layers, 
  Scale, 
  ArrowLeftRight, 
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

export const AreaComparison: React.FC = () => {
  const { data, setSelectedVillage, setActiveView, theme } = useApp();
  const [activeAnalysisMode, setActiveAnalysisMode] = useState<'sector-diff' | 'multi-bar' | 'capacity-diff' | 'threshold-exceedance'>('sector-diff');
  
  // Interactive Side-by-Side Diff State
  const [sectorAKey, setSectorAKey] = useState<string>('Meppadi');
  const [sectorBKey, setSectorBKey] = useState<string>('Kalpetta');

  const allAreasList = Object.values(AREA_HAZARD_REGISTRY);
  const areaKeys = Object.keys(AREA_HAZARD_REGISTRY);

  const sectorA = AREA_HAZARD_REGISTRY[sectorAKey] || allAreasList[0];
  const sectorB = AREA_HAZARD_REGISTRY[sectorBKey] || allAreasList[allAreasList.length - 1];

  // 1. Multi-Hazard Comparative Bar Data
  const allAreasBarData = allAreasList.map(a => ({
    name: a.name.split(' ')[0],
    'Landslide Risk %': a.landslideProb,
    'Flood Risk %': a.floodProb,
    'Slope Angle (°)': a.slopeDeg,
    '24h Rain (mm)': Math.round(a.rainfall24h)
  }));

  // 2. Population vs Safe Capacity Linear Differential Data (Zero Pie/Donut!)
  const capacityDifferentialData = [
    { name: 'Meppadi (Danger)', vulnerable: 4800, safeCapacity: 0, category: 'Evacuation Origin' },
    { name: 'Mundakkai (Origin)', vulnerable: 1850, safeCapacity: 0, category: 'Evacuation Origin' },
    { name: 'Achooranam (Slope)', vulnerable: 1240, safeCapacity: 0, category: 'Evacuation Origin' },
    { name: 'Kottathara (Basin)', vulnerable: 890, safeCapacity: 0, category: 'Evacuation Origin' },
    { name: 'Kalpetta Safe Hub', vulnerable: 0, safeCapacity: 2400, category: 'Certified Safe Haven' },
    { name: 'Achoor East Hub', vulnerable: 0, safeCapacity: 1800, category: 'Certified Safe Haven' },
    { name: 'Kuppadithara Flatland', vulnerable: 0, safeCapacity: 2100, category: 'Certified Safe Haven' }
  ];

  // 3. Geotechnical Threshold Exceedance Differentials
  const thresholdExceedanceData = [
    { factor: '24h Rainfall (mm)', current: sectorA.rainfall24h, threshold: 150, unit: 'mm', delta: +(sectorA.rainfall24h - 150).toFixed(1), exceedancePct: Math.round((sectorA.rainfall24h / 150) * 100) },
    { factor: 'Slope Gradient (°)', current: sectorA.slopeDeg, threshold: 25, unit: '°', delta: +(sectorA.slopeDeg - 25).toFixed(1), exceedancePct: Math.round((sectorA.slopeDeg / 25) * 100) },
    { factor: 'Soil Saturation (%)', current: sectorA.soilMoisture, threshold: 75, unit: '%', delta: +(sectorA.soilMoisture - 75).toFixed(1), exceedancePct: Math.round((sectorA.soilMoisture / 75) * 100) },
    { factor: 'Landslide Runout (%)', current: sectorA.landslideProb, threshold: 30, unit: '%', delta: +(sectorA.landslideProb - 30).toFixed(1), exceedancePct: Math.round((sectorA.landslideProb / 30) * 100) },
    { factor: 'Flood Inundation (%)', current: sectorA.floodProb, threshold: 35, unit: '%', delta: +(sectorA.floodProb - 35).toFixed(1), exceedancePct: Math.round((sectorA.floodProb / 35) * 100) }
  ];

  // Helper for delta styling
  const renderDeltaBadge = (delta: number, unit: string = '%', inverted: boolean = false) => {
    const isBad = inverted ? delta < 0 : delta > 0;
    const sign = delta > 0 ? '+' : '';
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold inline-flex items-center gap-1 ${
        isBad ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
      }`}>
        <span>{sign}{delta}{unit}</span>
        <span className="text-[9px] uppercase tracking-wider">{isBad ? '▲ Diff' : '▼ Diff'}</span>
      </span>
    );
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 w-full font-sans transition-colors ${
      theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#070D0A] text-slate-100'
    }`}>
      
      {/* Header Banner */}
      <div className={`border rounded-2xl p-5 shadow-sm transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0C1712] border-[#1A2E24]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                COMPARATIVE DIFFERENTIAL ANALYTICS
              </span>
              <DataConfidenceTag confidence="HIGH" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold mt-2">
              Sector Differential & Hazard Variance Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1 max-w-3xl">
              Side-by-side parameter differentials, physical threshold exceedances, and population-to-capacity linear balancing without obscure radar or pie charts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('sdma-command')}
              className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Analysis Mode Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-700/40">
          <button
            onClick={() => setActiveAnalysisMode('sector-diff')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAnalysisMode === 'sector-diff'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#09120E] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>1. Side-by-Side Sector Diff Tool</span>
          </button>

          <button
            onClick={() => setActiveAnalysisMode('multi-bar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAnalysisMode === 'multi-bar'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#09120E] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>2. Multi-Sector Hazard Differential Bars</span>
          </button>

          <button
            onClick={() => setActiveAnalysisMode('capacity-diff')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAnalysisMode === 'capacity-diff'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#09120E] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>3. Population vs Safe Capacity Linear Diff</span>
          </button>

          <button
            onClick={() => setActiveAnalysisMode('threshold-exceedance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAnalysisMode === 'threshold-exceedance'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#09120E] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4. Geotechnical Threshold Exceedance Diff</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: INTERACTIVE SIDE-BY-SIDE SECTOR DIFF TOOL ("Diff for Understanding")
          ========================================================================= */}
      {activeAnalysisMode === 'sector-diff' && (
        <div className="bg-[#0C1712] border border-[#1A2E24] rounded-2xl p-6 space-y-6 shadow-sm">
          
          {/* Sector Selector Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2E24]">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-1/2">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                  Primary Sector (A)
                </label>
                <select
                  value={sectorAKey}
                  onChange={(e) => setSectorAKey(e.target.value)}
                  className="w-full bg-[#09120E] border border-rose-800/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500 font-bold"
                >
                  {areaKeys.map(k => (
                    <option key={k} value={k}>{AREA_HAZARD_REGISTRY[k].name}</option>
                  ))}
                </select>
              </div>

              <div className="p-2 rounded-lg bg-[#09120E] border border-slate-800 text-slate-400 self-end mb-0.5">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="w-1/2">
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                  Comparative Sector (B)
                </label>
                <select
                  value={sectorBKey}
                  onChange={(e) => setSectorBKey(e.target.value)}
                  className="w-full bg-[#09120E] border border-cyan-800/80 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-bold"
                >
                  {areaKeys.map(k => (
                    <option key={k} value={k}>{AREA_HAZARD_REGISTRY[k].name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10.5px] font-mono text-slate-400 block uppercase">Relative Risk Variance:</span>
              <strong className="text-xl font-mono text-amber-400 font-bold">
                {Math.abs(sectorA.riskScore - sectorB.riskScore).toFixed(1)} Points Δ
              </strong>
            </div>
          </div>

          {/* Key Summary Cards Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 via-[#0A1410] to-[#09120E] border border-rose-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-900/60 text-rose-300 border border-rose-700/50">
                  SECTOR A: {sectorA.category.toUpperCase()}
                </span>
                <RiskBadge level={sectorA.riskLevel} score={sectorA.riskScore} size="sm" />
              </div>
              <h3 className="text-lg font-bold font-serif text-white">{sectorA.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>Exposed Population: <strong className="text-white block text-sm">{sectorA.exposedPopulation.toLocaleString()} People</strong></div>
                <div>High Risk Parcels: <strong className="text-rose-400 block text-sm">{sectorA.highRiskParcels} Parcels</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-[#0A1410] to-[#09120E] border border-cyan-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  SECTOR B: {sectorB.category.toUpperCase()}
                </span>
                <RiskBadge level={sectorB.riskLevel} score={sectorB.riskScore} size="sm" />
              </div>
              <h3 className="text-lg font-bold font-serif text-white">{sectorB.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>Exposed Population: <strong className="text-white block text-sm">{sectorB.exposedPopulation.toLocaleString()} People</strong></div>
                <div>High Risk Parcels: <strong className="text-cyan-400 block text-sm">{sectorB.highRiskParcels} Parcels</strong></div>
              </div>
            </div>
          </div>

          {/* Differential Comparison Metrics Table with Visual Meters */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Direct Parameter Differentials (Sector A vs Sector B)</span>
              <span className="text-[10px] text-emerald-400">Higher Value = Worse Hazard Condition</span>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Landslide Runout Risk', valA: sectorA.landslideProb, valB: sectorB.landslideProb, unit: '%', max: 100, icon: <Mountain className="w-3.5 h-3.5 text-rose-400" /> },
                { label: 'Flood Inundation Risk', valA: sectorA.floodProb, valB: sectorB.floodProb, unit: '%', max: 100, icon: <Waves className="w-3.5 h-3.5 text-cyan-400" /> },
                { label: 'Slope Gradient Angle', valA: sectorA.slopeDeg, valB: sectorB.slopeDeg, unit: '°', max: 50, icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> },
                { label: '24h Cumulative Precipitation', valA: sectorA.rainfall24h, valB: sectorB.rainfall24h, unit: ' mm', max: 350, icon: <CloudRain className="w-3.5 h-3.5 text-blue-400" /> },
                { label: 'Soil Moisture Saturation', valA: sectorA.soilMoisture, valB: sectorB.soilMoisture, unit: '%', max: 100, icon: <Layers className="w-3.5 h-3.5 text-emerald-400" /> },
                { label: 'Disaster History Occurrence', valA: sectorA.historyFreq, valB: sectorB.historyFreq, unit: '%', max: 100, icon: <AlertTriangle className="w-3.5 h-3.5 text-purple-400" /> }
              ].map((item, i) => {
                const diff = +(item.valA - item.valB).toFixed(1);
                return (
                  <div key={i} className="p-3 rounded-xl bg-[#09120E] border border-[#1A2E24] space-y-2 hover:border-emerald-700/50 transition-colors">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 font-bold text-white">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-rose-400 font-bold">{item.valA}{item.unit} (A)</span>
                        <span className="text-slate-500">vs</span>
                        <span className="text-cyan-400 font-bold">{item.valB}{item.unit} (B)</span>
                        {renderDeltaBadge(diff, item.unit)}
                      </div>
                    </div>

                    {/* Dual Comparative Progress Bar */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (item.valA / item.max) * 100)}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[9.5px] font-mono text-slate-500">
                          <span>{sectorA.name.split(' ')[0]}</span>
                          <span>{item.valA}{item.unit}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (item.valB / item.max) * 100)}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-[9.5px] font-mono text-slate-500">
                          <span>{sectorB.name.split(' ')[0]}</span>
                          <span>{item.valB}{item.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          MODE 2: MULTI-SECTOR HAZARD DIFFERENTIAL BAR CHART
          ========================================================================= */}
      {activeAnalysisMode === 'multi-bar' && (
        <div className="bg-[#0C1712] border border-[#1A2E24] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1A2E24] pb-3">
            <div>
              <h3 className="text-lg font-bold font-serif text-white">
                Multi-Sector Hazard Indicator Comparison
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Side-by-side grouped bars comparing landslide risk, flood inundation, terrain slope, and rainfall across all administrative sectors.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-[#070D0A] px-2.5 py-1 rounded border border-[#1A2E24]">
              {allAreasList.length} Sectors Audited
            </span>
          </div>

          <div className="h-80 w-full bg-[#09120E] rounded-xl border border-[#1A2E24] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allAreasBarData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1A2E24" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Space Grotesk' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#070D0A', borderColor: '#1A2E24', color: '#F8FAFC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk' }} />
                <Bar dataKey="Landslide Risk %" fill="#E8543E" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Flood Risk %" fill="#38BDF8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Slope Angle (°)" fill="#FBBF24" radius={[3, 3, 0, 0]} />
                <Bar dataKey="24h Rain (mm)" fill="#34D399" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 3: POPULATION VS CAPACITY LINEAR DIFFERENTIAL (ZERO PIE/DONUT!)
          ========================================================================= */}
      {activeAnalysisMode === 'capacity-diff' && (
        <div className="bg-[#0C1712] border border-[#1A2E24] rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1A2E24] pb-3">
            <div>
              <h3 className="text-lg font-bold font-serif text-white">
                Population Load vs Safe Haven Intake Capacity
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Direct linear comparison comparing vulnerable populations needing evacuation against verified holding capacities.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">TOTAL EVACUEES</span>
                <strong className="text-sm font-mono text-rose-400 font-bold">8,780 People</strong>
              </div>
              <span className="text-slate-600 font-mono">/</span>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">SAFE HOLDING CAP</span>
                <strong className="text-sm font-mono text-emerald-400 font-bold">6,300 People</strong>
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart of Population vs Safe Intake */}
          <div className="h-72 w-full bg-[#09120E] rounded-xl border border-[#1A2E24] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityDifferentialData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1A2E24" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'Space Grotesk' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#070D0A', borderColor: '#1A2E24', color: '#F8FAFC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk' }} />
                <Bar dataKey="vulnerable" fill="#E8543E" name="Evacuees Requiring Movement (People)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="safeCapacity" fill="#10B981" name="Safe Haven Holding Capacity (People)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Linear Balancing Summary Meter */}
          <div className="p-4 rounded-xl bg-[#09120E] border border-[#1A2E24] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-white uppercase">Regional Safe Intake Coverage:</span>
              <span className="text-amber-400 font-bold">71.8% Allocated (2,480 People Staging Required)</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: '71.8%' }} title="Safe Holding Intake (6,300 People)" />
              <div className="h-full bg-amber-500" style={{ width: '28.2%' }} title="Staging Overflow Required (2,480 People)" />
            </div>
            <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Kalpetta, Achoor East & Kuppadithara (6,300 People)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Secondary Emergency Transit Staging (2,480 People)</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 4: GEOTECHNICAL THRESHOLD EXCEEDANCE DIFFERENTIALS
          ========================================================================= */}
      {activeAnalysisMode === 'threshold-exceedance' && (
        <div className="bg-[#0C1712] border border-[#1A2E24] rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1A2E24] pb-3">
            <div>
              <h3 className="text-lg font-bold font-serif text-white">
                Geotechnical Threshold Exceedance Differentials ({sectorA.name})
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Direct delta values comparing real-time telemetry against critical geotechnical safety thresholds.
              </p>
            </div>
            <select
              value={sectorAKey}
              onChange={(e) => setSectorAKey(e.target.value)}
              className="bg-[#09120E] border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
            >
              {areaKeys.map(k => (
                <option key={k} value={k}>{AREA_HAZARD_REGISTRY[k].name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thresholdExceedanceData.map((t, idx) => {
              const isExceeded = t.delta > 0;
              return (
                <div key={idx} className="p-4 rounded-xl bg-[#09120E] border border-[#1A2E24] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white">{t.factor}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isExceeded ? 'bg-rose-950 text-rose-300 border border-rose-700/60' : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    }`}>
                      {isExceeded ? `${t.exceedancePct}% OF THRESHOLD` : 'SAFE MARGIN'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Current:</span>
                      <strong className="text-sm font-bold text-white">{t.current}{t.unit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Threshold:</span>
                      <span className="text-sm text-slate-300">{t.threshold}{t.unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Delta (Δ):</span>
                      <strong className={`text-sm font-bold ${isExceeded ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {t.delta > 0 ? `+${t.delta}` : t.delta}{t.unit}
                      </strong>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, t.exceedancePct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTOR COMPARATIVE CARDS (ZERO WALLS OF PROSE TEXT!)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Administrative Sector Scorecards ({allAreasList.length} Sectors)</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">Click card button to load into Side-by-Side Diff</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAreasList.map((area) => {
            const isEpicenter = area.category === 'Disaster Epicenter';
            const isSafe = area.category === 'Urban Centre' || area.category === 'Flatland Buffer';
            const isSelectedA = sectorAKey === area.name.split(' ')[0] || (area.name.includes('Meppadi') && sectorAKey === 'Meppadi');
            const isSelectedB = sectorBKey === area.name.split(' ')[0] || (area.name.includes('Kalpetta') && sectorBKey === 'Kalpetta');

            return (
              <div
                key={area.name}
                className={`p-4 rounded-2xl border space-y-3 transition-all ${
                  isSelectedA 
                    ? 'bg-rose-950/20 border-rose-600 shadow-md' 
                    : isSelectedB 
                    ? 'bg-cyan-950/20 border-cyan-600 shadow-md' 
                    : 'bg-[#0C1712] border-[#1A2E24] hover:border-emerald-700/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-[#1A2E24] pb-2.5">
                  <div>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                      isEpicenter ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50' : isSafe ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {area.category}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-white mt-1">
                      {area.name}
                    </h3>
                  </div>
                  <RiskBadge level={area.riskLevel} score={area.riskScore} size="sm" />
                </div>

                {/* Visual Meters Matrix (Zero Text Walls!) */}
                <div className="space-y-1.5 text-[11px] font-mono bg-[#09120E] p-2.5 rounded-xl border border-[#1A2E24]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Landslide Risk:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${area.landslideProb}%` }} />
                      </div>
                      <strong className="text-rose-400 font-bold w-9 text-right">{area.landslideProb}%</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Flood Inundation:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${area.floodProb}%` }} />
                      </div>
                      <strong className="text-cyan-400 font-bold w-9 text-right">{area.floodProb}%</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Terrain Slope:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (area.slopeDeg / 45) * 100)}%` }} />
                      </div>
                      <strong className="text-amber-400 font-bold w-9 text-right">{area.slopeDeg}°</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">24h Rainfall:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (area.rainfall24h / 300) * 100)}%` }} />
                      </div>
                      <strong className="text-blue-400 font-bold w-9 text-right">{Math.round(area.rainfall24h)}mm</strong>
                    </div>
                  </div>
                </div>

                {/* Population & Parcel Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-300">
                  <div className="bg-[#070D0A] p-2 rounded-lg border border-[#1A2E24]">
                    <span className="text-[10px] text-slate-500 block uppercase">EXPOSED POP</span>
                    <strong className="text-white text-xs">{area.exposedPopulation.toLocaleString()} People</strong>
                  </div>
                  <div className="bg-[#070D0A] p-2 rounded-lg border border-[#1A2E24]">
                    <span className="text-[10px] text-slate-500 block uppercase">RISK PARCELS</span>
                    <strong className="text-white text-xs">{area.highRiskParcels} Units</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-[#1A2E24] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const key = area.name.split(' ')[0];
                      setSectorAKey(key);
                      setActiveAnalysisMode('sector-diff');
                    }}
                    className="flex-1 py-1.5 bg-[#09120E] hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-700/60 rounded-lg text-[10.5px] font-mono font-bold transition-all"
                  >
                    Compare as Sector A
                  </button>

                  <button
                    onClick={() => {
                      const key = area.name.split(' ')[0];
                      setSectorBKey(key);
                      setActiveAnalysisMode('sector-diff');
                    }}
                    className="flex-1 py-1.5 bg-[#09120E] hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-200 border border-slate-700/60 rounded-lg text-[10.5px] font-mono font-bold transition-all"
                  >
                    Compare as Sector B
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
