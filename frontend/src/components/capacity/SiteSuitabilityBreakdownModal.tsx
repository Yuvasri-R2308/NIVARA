import React from 'react';
import { CapacityCalculationResult, SiteResourceLedger } from '../../types';
import { X, Scale, ShieldCheck, CheckCircle2, FileCode2, HelpCircle } from 'lucide-react';

interface Props {
  site: SiteResourceLedger;
  calculation: CapacityCalculationResult;
  onClose: () => void;
}

export const SiteSuitabilityBreakdownModal: React.FC<Props> = ({ site, calculation, onClose }) => {
  const { scoreBreakdown, suitabilityScore } = calculation;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono text-xs text-pine-text">
      <div className="relative w-full max-w-2xl bg-[#0E1A15] border border-[#1E3228] rounded-2xl shadow-modal flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 lg:p-5 border-b border-[#1E3228] flex items-center justify-between bg-[#111D18]">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base lg:text-lg font-serif font-bold text-white">
                Why this Score? Mathematical Breakdown
              </h2>
              <span className="text-[10px] text-pine-muted font-sans block">
                {site.name} ({site.siteId}) • Total Score: <strong className="text-emerald-400">{suitabilityScore} / 100</strong>
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Formula Display Box */}
          <div className="p-3.5 rounded-xl bg-[#0B1310] border border-[#1E3228] space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5" />
                <span>COMPOSITE SUITABILITY SCORING FUNCTION:</span>
              </span>
              <span className="text-[9.5px] text-pine-muted font-sans">Multi-Criteria Optimization</span>
            </div>
            <div className="p-2.5 bg-[#12221B] rounded-lg border border-[#1E3228] text-emerald-300 leading-relaxed font-bold">
              Suitability Score = 0.30·Safety + 0.25·Capacity + 0.15·Access + 0.15·Utilities + 0.15·EmergencyReadiness
            </div>
          </div>

          {/* Sub-factor Point Contributions Breakdown Table */}
          <div className="space-y-2">
            <span className="text-[10px] text-pine-muted uppercase font-bold tracking-wider block">
              Individual Factor Weights & Score Contributions:
            </span>

            <div className="space-y-2 font-mono text-xs">
              
              {/* 1. Safety Factor */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>1. Hazard Safety & Topography</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    +{scoreBreakdown.safetyScore.contribution} pts (Weight: {Math.round(scoreBreakdown.safetyScore.weight * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between text-[10.5px] text-pine-muted font-sans">
                  <span>Raw Score: {scoreBreakdown.safetyScore.points} / 100</span>
                  <span>Slope {site.slopeDeg}° • Landslide {site.landslideExposurePct}% • Flood {site.floodExposurePct}%</span>
                </div>
              </div>

              {/* 2. Capacity Factor */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>2. Practical Carrying Capacity</span>
                  </span>
                  <span className="text-cyan-400 font-bold">
                    +{scoreBreakdown.capacityScore.contribution} pts (Weight: {Math.round(scoreBreakdown.capacityScore.weight * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between text-[10.5px] text-pine-muted font-sans">
                  <span>Raw Score: {scoreBreakdown.capacityScore.points} / 100</span>
                  <span>{calculation.practicalCapacity} max safe capacity vs {calculation.targetPopulation} load</span>
                </div>
              </div>

              {/* 3. Accessibility Factor */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>3. Road Infrastructure & Transit</span>
                  </span>
                  <span className="text-blue-400 font-bold">
                    +{scoreBreakdown.accessibilityScore.contribution} pts (Weight: {Math.round(scoreBreakdown.accessibilityScore.weight * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between text-[10.5px] text-pine-muted font-sans">
                  <span>Raw Score: {scoreBreakdown.accessibilityScore.points} / 100</span>
                  <span>{site.distanceFromMeppadiKm} km distance • {site.roadStatus} Road • {site.independentAccessRoutesCount} Arterial Routes</span>
                </div>
              </div>

              {/* 4. Essential Services Factor */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>4. Water, Sanitation & Utilities</span>
                  </span>
                  <span className="text-purple-400 font-bold">
                    +{scoreBreakdown.essentialServicesScore.contribution} pts (Weight: {Math.round(scoreBreakdown.essentialServicesScore.weight * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between text-[10.5px] text-pine-muted font-sans">
                  <span>Raw Score: {scoreBreakdown.essentialServicesScore.points} / 100</span>
                  <span>Water {calculation.resources.water.coveragePct}% • Sanitation {calculation.resources.sanitation.coveragePct}% • Grid {site.electricityStatus}</span>
                </div>
              </div>

              {/* 5. Emergency Readiness Factor */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>5. Emergency Ambulances & Medical</span>
                  </span>
                  <span className="text-amber-400 font-bold">
                    +{scoreBreakdown.emergencyReadinessScore.contribution} pts (Weight: {Math.round(scoreBreakdown.emergencyReadinessScore.weight * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between text-[10.5px] text-pine-muted font-sans">
                  <span>Raw Score: {scoreBreakdown.emergencyReadinessScore.points} / 100</span>
                  <span>{site.ambulancesStationed} Ambulances • {site.medicalDoctorsOnCall + site.nursesOnCall} Medical Staff • {site.emergencyTriageBeds} Beds</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1E3228] bg-[#111D18] flex items-center justify-between">
          <span className="text-[10px] text-pine-muted">Mathematical weights configurable in Planning Assumptions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
          >
            Close Breakdown
          </button>
        </div>

      </div>
    </div>
  );
};
