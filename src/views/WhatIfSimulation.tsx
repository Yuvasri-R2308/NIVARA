import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { 
  Sliders, 
  RotateCcw, 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle, 
  Users, 
  CloudRain, 
  Activity, 
  ArrowRight,
  Sparkles,
  BarChart2,
  CheckCircle2
} from 'lucide-react';

export const WhatIfSimulation: React.FC = () => {
  const { 
    data, 
    rainfallMultiplier, 
    setRainfallMultiplier, 
    recomputeRiskForRainfall,
    setActiveView 
  } = useApp();

  const [compareModalOpen, setCompareModalOpen] = useState(false);

  if (!data) return null;

  const { parcels, candidate_sites } = data;

  // Real-time calculation as slider moves
  const sim = useMemo(() => {
    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;
    let flippedToRed = 0;

    parcels.forEach((p) => {
      const originalLevel = p.risk_level;
      const { level: newLevel } = recomputeRiskForRainfall(
        p.risk_score, 
        rainfallMultiplier, 
        p.slope_deg
      );

      if (newLevel === 'HIGH') {
        highCount++;
        if (originalLevel !== 'HIGH') {
          flippedToRed++;
        }
      } else if (newLevel === 'MEDIUM') {
        medCount++;
      } else {
        lowCount++;
      }
    });

    const rainPct = Math.round((rainfallMultiplier - 1.0) * 100);
    const simulatedRain = Math.round(142.0 * rainfallMultiplier);
    const simulatedSoilSaturation = Math.min(99, Math.round(52 + rainPct * 0.46));
    const baselinePop = 4800;
    const simulatedExposedPop = Math.round(baselinePop + flippedToRed * 8.2);

    return {
      highCount,
      medCount,
      lowCount,
      flippedToRed,
      rainPct,
      simulatedRain,
      simulatedSoilSaturation,
      baselinePop,
      simulatedExposedPop
    };
  }, [parcels, rainfallMultiplier, recomputeRiskForRainfall]);

  const presetSteps = [
    { label: '0%', mult: 1.0, title: 'Baseline' },
    { label: '+25%', mult: 1.25, title: 'Monsoon Heavy' },
    { label: '+50%', mult: 1.5, title: 'Cloudburst Warning' },
    { label: '+75%', mult: 1.75, title: 'Severe Torrent' },
    { label: '+100%', mult: 2.0, title: 'Extreme 2024 Scarp Runoff' },
  ];

  return (
    <div className="p-3 lg:p-5 space-y-4 max-w-7xl mx-auto font-mono text-xs text-pine-text">
      
      {/* 1. HEADER BANNER */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              04 SIMULATION
            </span>
            <span className="text-pine-muted text-[11px]">WHAT-IF DISASTER SIMULATOR</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white mt-1">
            What-If Rainfall & Slope Liquefaction Simulator
          </h1>
          <p className="text-xs text-pine-muted font-sans mt-0.5 max-w-2xl">
            Model real-time landslide slope failure triggers and cadastral red-zone boundary expansion under forecasted precipitation surges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-3.5 py-2 bg-[#15241E] hover:bg-[#1E342B] text-pine-text rounded-lg border border-[#1E3228] font-bold transition-all flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>COMPARE SCENARIOS</span>
          </button>
          <button
            onClick={() => setRainfallMultiplier(1.0)}
            className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-800 font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* 2. SIGNATURE INTERACTIVE RAINFALL SLIDER CONSOLE */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 space-y-3 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E3228] pb-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="font-serif font-bold text-sm text-white">
              Precipitation Intensity Stress Slider:
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-pine-muted">
              Simulated Rain: <strong className="text-cyan-400 font-bold text-sm">{sim.simulatedRain} mm</strong>
            </span>
            <span className="text-pine-muted">
              Soil Saturation: <strong className="text-rose-400 font-bold text-sm">{sim.simulatedSoilSaturation}%</strong>
            </span>
          </div>
        </div>

        {/* Large Slider */}
        <div className="space-y-2 pt-1">
          <input
            type="range"
            min={1.0}
            max={2.0}
            step={0.05}
            value={rainfallMultiplier}
            onChange={(e) => setRainfallMultiplier(parseFloat(e.target.value))}
            className="w-full h-3 bg-[#0B1310] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
          />

          {/* Stepped Shortcut Buttons (0%, +25%, +50%, +75%, +100%) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {presetSteps.map((step) => {
              const isActive = Math.abs(rainfallMultiplier - step.mult) < 0.03;
              return (
                <button
                  key={step.label}
                  onClick={() => setRainfallMultiplier(step.mult)}
                  className={`p-2 rounded-lg border text-left text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-hero-glow'
                      : 'bg-[#0B1310] text-pine-muted hover:text-white border-[#1E3228]'
                  }`}
                >
                  <div className="font-bold text-sm">{step.label}</div>
                  <div className="text-[9.5px] opacity-75 font-sans truncate">{step.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. RED-ZONE CHANGE: BEFORE → AFTER (Animated Visual Delta) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Red Zone Parcels Expansion */}
        <div className="bg-[#111D18] border border-[#1E3228] p-4 rounded-xl space-y-1.5 shadow-panel">
          <span className="text-[10px] text-pine-muted uppercase font-bold tracking-wider block">
            RED-ZONE PARCEL TRANSITION
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-pine-muted text-sm line-through">424 high-risk</span>
            <ArrowRight className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-2xl font-bold text-rose-400 font-mono">
              {sim.highCount} parcels
            </span>
          </div>
          <span className="text-[10.5px] text-rose-300 font-sans block">
            +{sim.flippedToRed} vulnerable parcels escalated to Critical Red-Zone
          </span>
        </div>

        {/* Affected Population Expansion */}
        <div className="bg-[#111D18] border border-[#1E3228] p-4 rounded-xl space-y-1.5 shadow-panel">
          <span className="text-[10px] text-pine-muted uppercase font-bold tracking-wider block">
            EXPOSED POPULATION SURGE
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-pine-muted text-sm line-through">4,800 people</span>
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {sim.simulatedExposedPop.toLocaleString()} people
            </span>
          </div>
          <span className="text-[10.5px] text-amber-300 font-sans block">
            +{sim.simulatedExposedPop - sim.baselinePop} additional residents require immediate evacuation
          </span>
        </div>

        {/* Soil Liquefaction Risk Threshold */}
        <div className="bg-[#111D18] border border-[#1E3228] p-4 rounded-xl space-y-1.5 shadow-panel">
          <span className="text-[10px] text-pine-muted uppercase font-bold tracking-wider block">
            REGOLITH PORE PRESSURE
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {sim.simulatedSoilSaturation}% Saturation
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#0B1310] rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-300 ${sim.simulatedSoilSaturation > 80 ? 'bg-rose-500' : 'bg-cyan-400'}`}
              style={{ width: `${sim.simulatedSoilSaturation}%` }}
            />
          </div>
          <span className="text-[10.5px] text-pine-muted font-sans block">
            {sim.simulatedSoilSaturation > 80 ? 'CRITICAL: Pore pressure exceeds soil shear strength' : 'MODERATE: Soil stable under current drainage'}
          </span>
        </div>

      </div>

      {/* 4. MAIN MAP + NEW CRITICAL AREAS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Map Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-[#111D18] border border-[#1E3228] rounded-xl p-3 space-y-2 shadow-panel">
          <div className="flex items-center justify-between border-b border-[#1E3228] pb-1.5 px-1">
            <span className="font-bold text-white text-xs">DYNAMIC HEATMAP RECOMPUTATION</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              Active Multiplier: {rainfallMultiplier.toFixed(2)}x (+{sim.rainPct}%)
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#1E3228] min-h-[460px]">
            <MapComponent
              parcels={parcels}
              candidateSites={candidate_sites}
              runoutPaths={data.runout_paths}
              simulatedMultiplier={rainfallMultiplier}
              height="480px"
            />
          </div>
        </div>

        {/* New Critical Areas List (4 cols) */}
        <div className="lg:col-span-4 bg-[#111D18] border border-[#1E3228] rounded-xl p-4 space-y-3 shadow-panel flex flex-col justify-between">
          <div className="space-y-2.5">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block border-b border-[#1E3228] pb-1.5">
              NEW CRITICAL ESCALATION AREAS:
            </span>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-[#0B1310] border border-rose-900/60 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Achooranam Tea Slopes</span>
                  <span className="text-rose-400 font-mono">
                    {Math.min(99, Math.round(56 * rainfallMultiplier))}% Landslide
                  </span>
                </div>
                <p className="text-[10px] text-pine-muted font-sans leading-tight">
                  Terrace cutting instability escalates rapidly above 180mm rain threshold.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0B1310] border border-amber-900/60 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Vythiri Ghat Road Cut</span>
                  <span className="text-amber-400 font-mono">
                    {Math.min(99, Math.round(62 * rainfallMultiplier))}% Slip
                  </span>
                </div>
                <p className="text-[10px] text-pine-muted font-sans leading-tight">
                  High precipitation zone triggering road slip diversions along NH-766.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0B1310] border border-cyan-900/60 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Kottathara River Basin</span>
                  <span className="text-cyan-400 font-mono">
                    {Math.min(99, Math.round(78 * rainfallMultiplier))}% Flood
                  </span>
                </div>
                <p className="text-[10px] text-pine-muted font-sans leading-tight">
                  Kabini overflow submerging 69 low-lying riverfront homesteads.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('relocation-engine')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-hero-glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>RELOCATE ESCALATED PARCELS</span>
          </button>
        </div>

      </div>

      {/* Compare Scenarios Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0E1A15] border border-[#1E3228] rounded-2xl p-5 max-w-2xl w-full space-y-4 shadow-modal font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1E3228] pb-3">
              <span className="text-white font-serif font-bold text-base">Scenario Comparison Matrix</span>
              <button onClick={() => setCompareModalOpen(false)} className="text-pine-muted hover:text-white">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[#1E3228] text-pine-muted uppercase text-[10px]">
                    <th className="pb-2">Scenario</th>
                    <th className="pb-2">24h Rain</th>
                    <th className="pb-2">Soil Moisture</th>
                    <th className="pb-2">High-Risk Parcels</th>
                    <th className="pb-2">Exposed Population</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E3228]">
                  <tr>
                    <td className="py-2 font-bold text-white">Baseline (0%)</td>
                    <td className="py-2 text-cyan-400">142 mm</td>
                    <td className="py-2 text-pine-text">52%</td>
                    <td className="py-2 text-pine-text">424 / 1,000</td>
                    <td className="py-2 text-pine-text">4,800 people</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-amber-300">+25% Monsoon</td>
                    <td className="py-2 text-cyan-400">178 mm</td>
                    <td className="py-2 text-amber-400">64%</td>
                    <td className="py-2 text-amber-400">512 / 1,000</td>
                    <td className="py-2 text-amber-400">5,450 people</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-amber-400">+50% Cloudburst</td>
                    <td className="py-2 text-cyan-400">213 mm</td>
                    <td className="py-2 text-rose-400">75%</td>
                    <td className="py-2 text-rose-400">610 / 1,000</td>
                    <td className="py-2 text-rose-400">6,120 people</td>
                  </tr>
                  <tr className="bg-rose-950/20">
                    <td className="py-2 font-bold text-rose-400">+100% Extreme</td>
                    <td className="py-2 text-cyan-400">284 mm</td>
                    <td className="py-2 text-rose-400 font-bold">98% (Liquefaction)</td>
                    <td className="py-2 text-rose-400 font-bold">701 / 1,000</td>
                    <td className="py-2 text-rose-400 font-bold">6,950 people</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
