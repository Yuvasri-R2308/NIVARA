import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { HazardType } from '../types';
import { getHazardDriverConfig } from '../data/hazardDriverConfig';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { 
  Sliders, 
  RotateCcw, 
  TrendingUp, 
  ShieldAlert, 
  AlertTriangle, 
  Users, 
  Activity, 
  ArrowRight,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Radio,
  HelpCircle,
  Layers,
  Mountain,
  Droplets,
  CloudLightning,
  Waves,
  X,
  Compass,
  Info
} from 'lucide-react';

export const WhatIfSimulation: React.FC = () => {
  const { 
    selectedHazard, 
    hazardStressMultipliers, 
    setHazardStressMultiplier, 
    selectHazardModule,
    theme 
  } = useApp();

  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Active hazard and its specialized driver configuration
  const activeHazard: HazardType = selectedHazard || 'landslide';
  const driverConfig = useMemo(() => getHazardDriverConfig(activeHazard), [activeHazard]);

  // Current hazard-scoped stress multiplier
  const currentMultiplier = hazardStressMultipliers[activeHazard] ?? 1.0;
  const setMultiplier = (val: number) => setHazardStressMultiplier(activeHazard, val);

  // Downstream computed impact metrics and location escalation sectors
  const metrics = useMemo(() => driverConfig.computeImpact(currentMultiplier), [driverConfig, currentMultiplier]);
  const escalationSectors = useMemo(() => driverConfig.getEscalationSectors(currentMultiplier), [driverConfig, currentMultiplier]);
  const scenarioMatrix = useMemo(() => driverConfig.getComparisonMatrix(), [driverConfig]);

  // Render dynamic hazard driver icon
  const renderHazardIcon = () => {
    switch (driverConfig.iconName) {
      case 'waves':
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'droplets':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'cloud-lightning':
        return <CloudLightning className="w-5 h-5 text-amber-400" />;
      case 'mountain':
      default:
        return <Mountain className="w-5 h-5 text-rose-400" />;
    }
  };

  const isLight = theme === 'light';

  return (
    <div className={`p-4 sm:p-6 lg:p-8 space-y-6 w-full font-sans transition-colors ${
      isLight ? 'text-slate-900' : 'text-pine-text'
    }`}>
      
      {/* =========================================================================
          1. HEADER BANNER WITH HAZARD-SPECIFIC SCIENTIFIC CONTEXT
          ========================================================================= */}
      <div className={`border rounded-2xl p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#111D18] border-[#1E3228]'
      }`}>
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className={`p-2 rounded-xl border flex items-center justify-center ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#162A20] border-[#1E382B]'
            }`}>
              {renderHazardIcon()}
            </div>
            <h1 className={`text-xl sm:text-2xl font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {driverConfig.simulatorTitle}
            </h1>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-pine-muted'}`}>
            {driverConfig.simulatorSubtitle}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0B1511] border-[#1A2E24] text-slate-300'
            }`}>
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Study Location: <strong className={isLight ? 'text-emerald-700' : 'text-emerald-400'}>{driverConfig.studyAreaTitle}</strong></span>
            </div>

            {activeHazard === 'coastal-erosion' && (
              <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono flex items-center gap-1 ${
                isLight 
                  ? 'bg-cyan-50 text-cyan-800 border-cyan-300 font-semibold' 
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
              }`}>
                <Info className={`w-3 h-3 ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`} />
                <span>Oceanographic Wave & Surge Model (Rainfall Excluded)</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setCompareModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl border font-mono font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                : 'bg-[#15241E] hover:bg-[#1E342B] text-pine-text border-[#1E3228]'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>COMPARE CONDITIONS</span>
          </button>
          <button
            onClick={() => setMultiplier(1.0)}
            className={`px-4 py-2.5 rounded-xl border font-mono font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isLight 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
            }`}
            title="Reset to Normal Condition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET TO NORMAL</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. SIGNATURE INTERACTIVE HAZARD-SCOPED SLIDER CONSOLE
          ========================================================================= */}
      <div className={`border rounded-2xl p-4 sm:p-5 space-y-4 shadow-panel transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#111D18] border-[#1E3228]'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
          isLight ? 'border-slate-200' : 'border-[#1E3228]'
        }`}>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className={`font-mono font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {driverConfig.driverAxisName}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {metrics.headerTelemetry.surgePercentText} Increase
              </span>
            </div>
            <p className={`text-[11px] font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {driverConfig.driverAxisSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className={`px-2.5 py-1 rounded-lg border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1511] border-[#1A2E24]'
            }`}>
              <span className={isLight ? 'text-slate-600 mr-1.5' : 'text-slate-400 mr-1.5'}>{metrics.headerTelemetry.primaryLabel}:</span>
              <strong className={`font-bold text-sm ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>{metrics.headerTelemetry.primaryValue}</strong>
            </div>
            <div className={`px-2.5 py-1 rounded-lg border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1511] border-[#1A2E24]'
            }`}>
              <span className={isLight ? 'text-slate-600 mr-1.5' : 'text-slate-400 mr-1.5'}>{metrics.headerTelemetry.secondaryLabel}:</span>
              <strong className={`font-bold text-sm ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{metrics.headerTelemetry.secondaryValue}</strong>
            </div>
          </div>
        </div>

        {/* Large Slider */}
        <div className="space-y-3 pt-1">
          <input
            type="range"
            min={driverConfig.minMult}
            max={driverConfig.maxMult}
            step={driverConfig.stepSize}
            value={currentMultiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            className="w-full h-3 bg-[#08120D] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
          />

          {/* Stepped Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {driverConfig.presetSteps.map((step) => {
              const isActive = Math.abs(currentMultiplier - step.mult) < 0.03;
              return (
                <button
                  key={step.label}
                  onClick={() => setMultiplier(step.mult)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-hero-glow'
                      : isLight
                        ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        : 'bg-[#0B1310] text-pine-muted hover:text-white border-[#1E3228]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{step.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                      isActive 
                        ? 'bg-black/30 text-white' 
                        : isLight 
                          ? 'bg-emerald-100 text-emerald-800 font-semibold' 
                          : 'bg-emerald-950/80 text-emerald-300'
                    }`}>
                      {step.primaryMetricDisplay}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-85 font-sans mt-1 truncate">
                    {step.title}
                  </div>
                  <div className="text-[9px] opacity-70 font-mono truncate">
                    {step.secondaryMetricDisplay}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. FOUR DOWNSTREAM COMPUTED IMPACT CARDS (HAZARD-SPECIFIC)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Primary Probability / Rate Metric */}
        <div className={`border p-4 rounded-xl space-y-2 shadow-panel transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#111D18] border-[#1E3228]'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {metrics.primaryMetric.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              metrics.primaryMetric.status === 'CRITICAL' 
                ? (isLight ? 'bg-rose-50 text-rose-700 border border-rose-300' : 'bg-rose-950 text-rose-300 border border-rose-800') 
                : (isLight ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-amber-950 text-amber-300 border border-amber-800')
            }`}>
              {metrics.primaryMetric.status}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-slate-400 text-sm line-through font-mono">
              {metrics.primaryMetric.baselineValue}
            </span>
            <ArrowRight className={`w-4 h-4 shrink-0 ${isLight ? 'text-rose-500' : 'text-rose-400'}`} />
            <span className={`text-2xl font-bold font-mono ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
              {metrics.primaryMetric.simulatedValue}
            </span>
          </div>

          <span className={`text-[10px] font-mono block ${isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-400'}`}>
            {metrics.primaryMetric.subtext}
          </span>
          <span className="text-[10px] text-slate-500 font-sans block truncate">
            Source: {metrics.primaryMetric.confidenceLabel}
          </span>
        </div>

        {/* Card 2: Spatial Red-Zone Extent */}
        <div className={`border p-4 rounded-xl space-y-2 shadow-panel transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#111D18] border-[#1E3228]'
        }`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {metrics.redZoneExtent.label}
          </span>

          <div className="flex items-baseline gap-2">
            <span className="text-slate-400 text-sm line-through font-mono">
              {metrics.redZoneExtent.baselineValue}
            </span>
            <ArrowRight className={`w-4 h-4 shrink-0 ${isLight ? 'text-rose-500' : 'text-rose-400'}`} />
            <span className={`text-2xl font-bold font-mono ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
              {metrics.redZoneExtent.simulatedValue}
            </span>
          </div>

          <span className={`text-[10.5px] font-sans block leading-tight ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
            {metrics.redZoneExtent.deltaText}
          </span>
        </div>

        {/* Card 3: Exposed Population / Households */}
        <div className={`border p-4 rounded-xl space-y-2 shadow-panel transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#111D18] border-[#1E3228]'
        }`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {metrics.exposedPopulation.label}
          </span>

          <div className="flex items-baseline gap-2">
            <span className="text-slate-400 text-sm line-through font-mono">
              {metrics.exposedPopulation.baselineValue}
            </span>
            <ArrowRight className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
            <span className={`text-2xl font-bold font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
              {metrics.exposedPopulation.simulatedValue}
            </span>
          </div>

          <span className={`text-[10.5px] font-sans block leading-tight ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
            {metrics.exposedPopulation.deltaText}
          </span>
        </div>

        {/* Card 4: Environmental / Physical Indicator (NO pore saturation on Coastal Erosion!) */}
        <div className={`border p-4 rounded-xl space-y-2 shadow-panel transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#111D18] border-[#1E3228]'
        }`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {metrics.physicalIndicator.label}
          </span>

          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
              {metrics.physicalIndicator.displayValue}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({metrics.physicalIndicator.unit})
            </span>
          </div>

          <div className={`w-full h-2 rounded-full overflow-hidden mt-1 ${isLight ? 'bg-slate-200' : 'bg-[#08120D]'}`}>
            <div 
              className={`h-full transition-all duration-300 ${metrics.physicalIndicator.progressColor}`}
              style={{ width: `${metrics.physicalIndicator.numericPct}%` }}
            />
          </div>

          <span className={`text-[10px] font-sans block leading-tight ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {metrics.physicalIndicator.statusDescription}
          </span>
        </div>

      </div>

      {/* =========================================================================
          4. CRITICAL ESCALATION SECTORS (LOCATION-GROUNDED PER HAZARD)
          ========================================================================= */}
      <div className={`border rounded-2xl p-4 lg:p-5 space-y-4 shadow-panel transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#111D18] border-[#1E3228]'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 px-1 ${
          isLight ? 'border-slate-200' : 'border-[#1E3228]'
        }`}>
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider block font-mono ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
              {driverConfig.escalationSectionTitle} UNDER {currentMultiplier.toFixed(2)}x INTENSITY ({metrics.headerTelemetry.surgePercentText}):
            </span>
            <span className={`text-[11px] font-sans mt-0.5 block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Shows which specific locations face greater risk as conditions worsen.
            </span>
          </div>
          <span className={`text-xs font-mono font-bold shrink-0 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            {metrics.headerTelemetry.primaryLabel}: {metrics.headerTelemetry.primaryValue}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {escalationSectors.map((sector) => (
            <div 
              key={sector.id}
              className={`p-3.5 rounded-xl border space-y-1.5 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0B1310] border-[#1E382B]'
              }`}
            >
              <div className="flex justify-between items-start font-bold text-xs gap-2">
                <div>
                  <div className={isLight ? 'text-slate-900 font-bold' : 'text-white'}>{sector.name}</div>
                  <div className={`text-[10px] font-sans font-normal ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{sector.location}</div>
                </div>
                <span className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                  sector.riskColor === 'rose'
                    ? (isLight ? 'bg-rose-50 text-rose-700 border border-rose-300' : 'bg-rose-950/80 text-rose-300 border border-rose-800')
                    : sector.riskColor === 'amber'
                    ? (isLight ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-amber-950/80 text-amber-300 border border-amber-800')
                    : (isLight ? 'bg-cyan-50 text-cyan-800 border border-cyan-300' : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800')
                }`}>
                  {sector.probabilityOrRate}
                </span>
              </div>
              <div className={`text-[10px] font-mono uppercase font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                {sector.hazardRiskLabel}
              </div>
              <p className={`text-[11px] font-sans leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {sector.description}
              </p>
            </div>
          ))}
        </div>

        <div className={`pt-2 border-t flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'border-slate-200' : 'border-[#1E3228]'
        }`}>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{driverConfig.calibrationNotice}</span>
          </div>

          <button
            onClick={() => selectHazardModule('safe-relocation')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-hero-glow cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>RELOCATE AT-RISK POPULATION</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          5. COMPARE SCENARIOS MATRIX MODAL (HAZARD-SPECIFIC)
          ========================================================================= */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`border rounded-2xl p-5 max-w-3xl w-full space-y-4 shadow-modal font-mono text-xs ${
            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0E1A15] border-[#1E3228] text-slate-200'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-slate-200' : 'border-[#1E3228]'
            }`}>
              <div className="flex items-center gap-2">
                {renderHazardIcon()}
                <span className="font-bold text-base font-sans">
                  Condition Comparison Matrix — {driverConfig.hazardName}
                </span>
                <span className="text-slate-400 text-xs font-normal">
                  ({driverConfig.studyAreaTitle})
                </span>
              </div>
              <button 
                onClick={() => setCompareModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className={`border-b text-slate-400 uppercase text-[10px] ${
                    isLight ? 'border-slate-200' : 'border-[#1E3228]'
                  }`}>
                    <th className="pb-2">Condition</th>
                    <th className="pb-2">{metrics.headerTelemetry.primaryLabel}</th>
                    <th className="pb-2">{metrics.headerTelemetry.secondaryLabel}</th>
                    <th className="pb-2">Risk Level</th>
                    <th className="pb-2">Estimated Range</th>
                    <th className="pb-2">Estimated Impact</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#1E3228]'}`}>
                  {scenarioMatrix.map((row, idx) => (
                    <tr key={idx} className={row.multiplier === 2.0 ? (isLight ? 'bg-rose-50 font-semibold' : 'bg-rose-950/20') : ''}>
                      <td className="py-2.5 font-bold">{row.scenarioName}</td>
                      <td className={`py-2.5 font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>{row.driverMetric1}</td>
                      <td className={`py-2.5 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{row.driverMetric2}</td>
                      <td className={`py-2.5 font-bold ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>{row.hazardScoreOrProb}</td>
                      <td className={`py-2.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{row.confidenceInterval}</td>
                      <td className={`py-2.5 font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{row.impactScale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`pt-2 flex justify-between items-center border-t ${
              isLight ? 'border-slate-200' : 'border-[#1E3228]'
            }`}>
              <span className="text-[10px] text-slate-500">
                {driverConfig.calibrationNotice}
              </span>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
