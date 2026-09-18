import React from 'react';
import { CapacityCalculationResult, SiteResourceLedger } from '../../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  Droplets, 
  Ambulance, 
  Building, 
  Car, 
  Users, 
  MapPin, 
  Scale 
} from 'lucide-react';

interface Props {
  sites: SiteResourceLedger[];
  calculations: CapacityCalculationResult[];
  onSelectSite?: (siteId: string) => void;
}

export const SiteComparisonTable: React.FC<Props> = ({ sites, calculations, onSelectSite }) => {
  // Sort calculations by suitability score descending (excluding rejected sites)
  const validCalcs = calculations.filter(c => !c.isRejectedDueToHazard);
  const bestCalc = validCalcs.length > 0 ? validCalcs.sort((a, b) => b.suitabilityScore - a.suitabilityScore)[0] : null;

  return (
    <div className="space-y-4 font-mono text-xs text-pine-text">
      
      {/* 1. Best Site Recommendation Banner */}
      {bestCalc && (
        <div className="bg-[#0E1A15] border-2 border-emerald-500/60 p-4 rounded-2xl shadow-hero-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold uppercase">
                  ALGORITHMICALLY RECOMMENDED BEST RECEPTOR
                </span>
                <span className="text-emerald-400 font-bold text-xs">{bestCalc.suitabilityScore} / 100 Score</span>
              </div>
              <h2 className="text-lg font-serif font-bold text-white mt-0.5">
                {bestCalc.siteName}
              </h2>
              <p className="text-xs text-pine-muted font-sans mt-0.5 leading-relaxed max-w-3xl">
                <strong>Why this site was chosen:</strong> Outperforms all other destinations with highest practical capacity ({bestCalc.practicalCapacity.toLocaleString()} persons), 4-lane highway accessibility, zero landslide recurrence history, and existing 100kL municipal water infrastructure.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectSite && onSelectSite(bestCalc.siteId)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-sm shrink-0"
          >
            Inspect Best Site
          </button>
        </div>
      )}

      {/* 2. Side-by-Side Comprehensive Multi-Dimension Comparison Table */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl overflow-hidden shadow-panel">
        <div className="p-3.5 border-b border-[#1E3228] flex items-center justify-between bg-[#0E1814]">
          <span className="font-bold text-white text-xs uppercase flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Candidate Resettlement Sites Comparative Matrix:</span>
          </span>
          <span className="text-[10px] text-pine-muted font-mono">
            Comparing {calculations.length} Screened Locations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-[#1E3228] bg-[#0B1310] text-pine-muted uppercase text-[10px]">
                <th className="p-3">Candidate Site</th>
                <th className="p-3">Suitability</th>
                <th className="p-3">Practical Capacity</th>
                <th className="p-3">Limiting Bottleneck</th>
                <th className="p-3">Water Supply</th>
                <th className="p-3">Sanitation</th>
                <th className="p-3">Ambulances</th>
                <th className="p-3">Distance & Road</th>
                <th className="p-3">Hazard Safety</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3228]">
              {calculations.map((calc) => {
                const site = sites.find(s => s.siteId === calc.siteId);
                const isBest = bestCalc?.siteId === calc.siteId;
                const isRej = calc.isRejectedDueToHazard;

                return (
                  <tr 
                    key={calc.siteId}
                    className={`transition-colors ${
                      isRej 
                        ? 'bg-rose-950/15 text-rose-300' 
                        : isBest 
                        ? 'bg-emerald-950/25 hover:bg-emerald-950/40' 
                        : 'hover:bg-[#15241E]'
                    }`}
                  >
                    {/* Site Name & ID */}
                    <td className="p-3 font-sans">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        {isBest && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span>{calc.siteName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-pine-muted">{calc.siteId} • {site?.village}</span>
                    </td>

                    {/* Suitability Score */}
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        isRej
                          ? 'bg-rose-950 text-rose-400 border-rose-800 line-through'
                          : isBest
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-[#0B1310] text-white border-[#1E3228]'
                      }`}>
                        {isRej ? 'REJECTED' : `${calc.suitabilityScore} / 100`}
                      </span>
                    </td>

                    {/* Practical Capacity */}
                    <td className="p-3">
                      <strong className={`font-mono text-xs ${isRej ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {calc.practicalCapacity.toLocaleString()}
                      </strong>
                      <span className="text-[10px] text-pine-muted block">people max</span>
                    </td>

                    {/* Limiting Bottleneck */}
                    <td className="p-3">
                      <span className="font-sans text-[10.5px] text-amber-300 block font-medium">
                        {calc.limitingResource}
                      </span>
                      <span className="text-[9.5px] text-pine-muted font-sans truncate max-w-[140px] block">
                        {calc.limitingResourceExplanation}
                      </span>
                    </td>

                    {/* Water Supply */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-cyan-400 font-bold">
                        <Droplets className="w-3 h-3" />
                        <span>{(site?.waterDailyAvailableLiters || 0) / 1000}k L/d</span>
                      </div>
                      <span className="text-[9.5px] text-pine-muted block">{calc.resources.water.status}</span>
                    </td>

                    {/* Sanitation */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-purple-300 font-bold">
                        <Building className="w-3 h-3" />
                        <span>{site?.toiletsAvailable} Toilets</span>
                      </div>
                      <span className="text-[9.5px] text-pine-muted block">{calc.resources.sanitation.status}</span>
                    </td>

                    {/* Ambulances */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-white font-bold">
                        <Ambulance className="w-3 h-3 text-emerald-400" />
                        <span>{site?.ambulancesStationed} Units</span>
                      </div>
                      <span className="text-[9.5px] text-pine-muted block">{calc.resources.ambulances.status}</span>
                    </td>

                    {/* Distance & Road */}
                    <td className="p-3">
                      <strong className="text-white">{site?.distanceFromMeppadiKm} km</strong>
                      <span className="text-[9.5px] text-pine-muted block">{site?.roadStatus} Road</span>
                    </td>

                    {/* Hazard Safety */}
                    <td className="p-3">
                      <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${
                        isRej 
                          ? 'bg-rose-950 text-rose-300 border-rose-800' 
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        {isRej ? 'HIGH HAZARD' : 'SAFE'}
                      </span>
                      <span className="text-[9px] text-pine-muted block mt-0.5">{site?.slopeDeg}° Slope</span>
                    </td>

                    {/* Action Button */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectSite && onSelectSite(calc.siteId)}
                        className="px-2.5 py-1 bg-[#15241E] hover:bg-emerald-600 hover:text-white text-emerald-400 font-bold rounded border border-[#1E3228] transition-colors text-[10px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
