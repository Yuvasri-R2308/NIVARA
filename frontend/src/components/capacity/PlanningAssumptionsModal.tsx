import React from 'react';
import { PlanningAssumptions } from '../../types';
import { DEFAULT_PLANNING_ASSUMPTIONS } from '../../data/siteCapacityRegistry';
import { Sliders, X, RotateCcw, CheckCircle2, Info, Scale, ShieldCheck } from 'lucide-react';

interface Props {
  assumptions: PlanningAssumptions;
  onUpdateAssumptions: (updated: PlanningAssumptions) => void;
  onClose: () => void;
}

export const PlanningAssumptionsModal: React.FC<Props> = ({
  assumptions,
  onUpdateAssumptions,
  onClose
}) => {
  const handleChange = (key: keyof PlanningAssumptions, value: number) => {
    onUpdateAssumptions({
      ...assumptions,
      [key]: value
    });
  };

  const handleResetDefaults = () => {
    onUpdateAssumptions({ ...DEFAULT_PLANNING_ASSUMPTIONS });
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono text-xs text-pine-text">
      <div className="relative w-full max-w-3xl bg-[#0E1A15] border border-[#1E3228] rounded-2xl shadow-modal flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 lg:p-5 border-b border-[#1E3228] flex items-center justify-between bg-[#111D18]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base lg:text-lg font-serif font-bold text-white">
                Planning Assumptions & Standards Control Panel
              </h2>
              <span className="text-[10px] text-pine-muted font-sans block">
                Adjust per-capita emergency relief ratios and mathematical scoring weights
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-[#15241E] hover:bg-[#1E342B] text-pine-muted hover:text-white rounded-lg border border-[#1E3228] flex items-center gap-1 text-[11px]"
              title="Reset to Sphere Humanitarian Standards"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#0B1310] hover:bg-[#1E3228] text-pine-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Information Alert */}
          <div className="p-3 bg-[#12221B] rounded-xl border border-[#1E3228] flex items-start gap-2.5 text-[11px] font-sans leading-relaxed text-pine-text">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong>Data Transparency Notice:</strong> These assumptions define how raw physical site resources (water, toilets, ambulances, beds) translate into human population capacities. Any modifications immediately recalculate practical capacities, limiting bottlenecks, and suitability scores across all dashboards.
            </div>
          </div>

          {/* Section 1: Per-Capita Humanitarian Resource Ratios */}
          <div className="space-y-3">
            <span className="text-[10.5px] text-emerald-400 uppercase font-bold tracking-wider block border-b border-[#1E3228] pb-1.5">
              1. Humanitarian & Emergency Resource Ratios:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* People per Ambulance */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white text-[11px]">People per Ambulance:</span>
                  <span className="text-emerald-400 font-bold">{assumptions.peoplePerAmbulance} people</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={1000}
                  step={50}
                  value={assumptions.peoplePerAmbulance}
                  onChange={(e) => handleChange('peoplePerAmbulance', Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-[#0B1310] rounded cursor-pointer"
                />
                <span className="text-[9.5px] text-pine-muted font-sans block">
                  Default: 500 persons/ambulance (Planning Assumption)
                </span>
              </div>

              {/* People per Toilet */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white text-[11px]">People per Toilet:</span>
                  <span className="text-purple-300 font-bold">{assumptions.peoplePerToilet} people</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={2}
                  value={assumptions.peoplePerToilet}
                  onChange={(e) => handleChange('peoplePerToilet', Number(e.target.value))}
                  className="w-full accent-purple-400 h-1.5 bg-[#0B1310] rounded cursor-pointer"
                />
                <span className="text-[9.5px] text-pine-muted font-sans block">
                  Default: 20 persons/toilet (Sphere Humanitarian Standard)
                </span>
              </div>

              {/* Water Requirement (Liters/Person/Day) */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white text-[11px]">Water Demand (L/person/day):</span>
                  <span className="text-cyan-400 font-bold">{assumptions.waterLitersPerPersonPerDay} Liters</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={150}
                  step={5}
                  value={assumptions.waterLitersPerPersonPerDay}
                  onChange={(e) => handleChange('waterLitersPerPersonPerDay', Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-[#0B1310] rounded cursor-pointer"
                />
                <span className="text-[9.5px] text-pine-muted font-sans block">
                  Default: 70 L/day (Camp relief baseline + sanitation)
                </span>
              </div>

              {/* Shelter Space per Person */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white text-[11px]">Covered Shelter Living Area:</span>
                  <span className="text-white font-bold">{assumptions.shelterSpaceSqmPerPerson} m²/person</span>
                </div>
                <input
                  type="range"
                  min={2.5}
                  max={6.0}
                  step={0.5}
                  value={assumptions.shelterSpaceSqmPerPerson}
                  onChange={(e) => handleChange('shelterSpaceSqmPerPerson', Number(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-[#0B1310] rounded cursor-pointer"
                />
                <span className="text-[9.5px] text-pine-muted font-sans block">
                  Default: 3.5 m² per person (Sphere standard)
                </span>
              </div>

              {/* People per Medical Staff */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white text-[11px]">People per Medical Staff:</span>
                  <span className="text-rose-300 font-bold">{assumptions.peoplePerMedicalStaff} people</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={500}
                  step={25}
                  value={assumptions.peoplePerMedicalStaff}
                  onChange={(e) => handleChange('peoplePerMedicalStaff', Number(e.target.value))}
                  className="w-full accent-rose-400 h-1.5 bg-[#0B1310] rounded cursor-pointer"
                />
                <span className="text-[9.5px] text-pine-muted font-sans block">
                  Default: 250 persons per doctor/nurse
                </span>
              </div>

              {/* People per Emergency Vehicle */}
              <div className="p-3 bg-[#111D18] rounded-xl border border-[#1E3228] space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-white text-[11px]">People per Rescue Vehicle:</span>
                  <span className="text-amber-300 font-bold">{assumptions.peoplePerEmergencyVehicle} people</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={600}
                  step={25}
                  value={assumptions.peoplePerEmergencyVehicle}
                  onChange={(e) => handleChange('peoplePerEmergencyVehicle', Number(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-[#0B1310] rounded cursor-pointer"
                />
                <span className="text-[9.5px] text-pine-muted font-sans block">
                  Default: 300 persons per rescue 4x4 / utility truck
                </span>
              </div>

            </div>
          </div>

          {/* Section 2: Mathematical Scoring Weights */}
          <div className="space-y-3">
            <span className="text-[10.5px] text-emerald-400 uppercase font-bold tracking-wider block border-b border-[#1E3228] pb-1.5">
              2. Suitability Scoring Weights (Sum to 100%):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="bg-[#0B1310] p-2.5 rounded-xl border border-[#1E3228] text-center">
                <span className="text-[9.5px] text-pine-muted block">Safety Weight</span>
                <strong className="text-base text-emerald-400 font-mono">
                  {Math.round(assumptions.weightSafety * 100)}%
                </strong>
              </div>
              <div className="bg-[#0B1310] p-2.5 rounded-xl border border-[#1E3228] text-center">
                <span className="text-[9.5px] text-pine-muted block">Capacity Weight</span>
                <strong className="text-base text-cyan-400 font-mono">
                  {Math.round(assumptions.weightCapacity * 100)}%
                </strong>
              </div>
              <div className="bg-[#0B1310] p-2.5 rounded-xl border border-[#1E3228] text-center">
                <span className="text-[9.5px] text-pine-muted block">Access Weight</span>
                <strong className="text-base text-blue-400 font-mono">
                  {Math.round(assumptions.weightAccessibility * 100)}%
                </strong>
              </div>
              <div className="bg-[#0B1310] p-2.5 rounded-xl border border-[#1E3228] text-center">
                <span className="text-[9.5px] text-pine-muted block">Utilities Weight</span>
                <strong className="text-base text-purple-400 font-mono">
                  {Math.round(assumptions.weightEssentialServices * 100)}%
                </strong>
              </div>
              <div className="bg-[#0B1310] p-2.5 rounded-xl border border-[#1E3228] text-center">
                <span className="text-[9.5px] text-pine-muted block">Medical Weight</span>
                <strong className="text-base text-amber-400 font-mono">
                  {Math.round(assumptions.weightEmergencyReadiness * 100)}%
                </strong>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1E3228] bg-[#111D18] flex items-center justify-between">
          <span className="text-[10px] text-pine-muted">Changes apply immediately across all modules</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
          >
            Apply & Save Parameters
          </button>
        </div>

      </div>
    </div>
  );
};
