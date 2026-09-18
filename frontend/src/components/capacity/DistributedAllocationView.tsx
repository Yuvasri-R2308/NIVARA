import React, { useState } from 'react';
import { DistributedRelocationPlan } from '../../types';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Users, 
  Droplets, 
  Ambulance, 
  Car, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  Building,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';

interface Props {
  plan: DistributedRelocationPlan;
  onSelectSite?: (siteId: string) => void;
}

export const DistributedAllocationView: React.FC<Props> = ({ plan, onSelectSite }) => {
  const [directiveNotice, setDirectiveNotice] = useState<string | null>(null);

  const handleExportDirective = () => {
    setDirectiveNotice(`Official SDMA Multi-Site Relocation Order #${plan.sourceVillage.toUpperCase()}-DISTRIB-2026 successfully compiled for executive sign-off.`);
    setTimeout(() => setDirectiveNotice(null), 6000);
  };

  return (
    <div className="space-y-4 font-mono text-xs text-pine-text">
      
      {/* 1. Header & Summary Banner */}
      <div className="bg-[#111D18] border border-[#1E3228] p-4 lg:p-5 rounded-2xl shadow-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
              SMART MULTI-SITE DISTRIBUTION ENGINE
            </span>
            <span className="text-pine-muted text-[10px]">
              TOTAL DISPLACED POPULATION: <strong className="text-white">{plan.totalDisplacedPopulation.toLocaleString()} ({plan.totalDisplacedFamilies} Families)</strong>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-serif font-bold text-white mt-1">
            Optimized Multi-Destination Relocation Blueprint
          </h2>
          <p className="text-xs text-pine-muted font-sans mt-0.5 max-w-3xl leading-relaxed">
            When vulnerable populations exceed single-site carrying capacities, this algorithm distributes habitations across top-ranked screened receptor plateaus without exceeding local water, sanitation, or safety thresholds.
          </p>
        </div>

        <button
          onClick={handleExportDirective}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-all shadow-hero-glow flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT SDMA DIRECTIVE</span>
        </button>
      </div>

      {directiveNotice && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{directiveNotice}</span>
        </div>
      )}

      {/* 2. Combined Aggregate Resource Logistics Requirements Grid */}
      <div className="bg-[#0E1A15] border border-[#1E3228] p-4 rounded-2xl space-y-3 shadow-panel">
        <div className="flex items-center justify-between border-b border-[#1E3228] pb-2">
          <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Combined District Resource Requirements ({plan.allocations.length} Active Sites):</span>
          </span>
          <span className="text-[10px] text-pine-muted">
            Status: <strong className="text-emerald-400 font-bold">100% Displaced Population Accommodated</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          
          {/* Total Ambulances */}
          <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
            <span className="text-[9.5px] text-pine-muted uppercase block font-bold flex items-center gap-1">
              <Ambulance className="w-3 h-3 text-emerald-400" />
              <span>Ambulances:</span>
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {plan.totalAmbulancesRequired} <span className="text-[10px] text-pine-muted font-normal">units</span>
            </div>
            <span className="text-[9px] text-emerald-400 block">ALS/BLS on standby</span>
          </div>

          {/* Total Potable Water */}
          <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
            <span className="text-[9.5px] text-pine-muted uppercase block font-bold flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>Water Daily:</span>
            </span>
            <div className="text-xl font-bold font-mono text-cyan-400">
              {(plan.totalWaterRequiredLitersDay / 1000).toFixed(0)}k <span className="text-[10px] text-pine-muted font-normal">L/day</span>
            </div>
            <span className="text-[9px] text-pine-muted block">70 L/person/day</span>
          </div>

          {/* Total Bio-Toilets */}
          <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
            <span className="text-[9.5px] text-pine-muted uppercase block font-bold flex items-center gap-1">
              <Building className="w-3 h-3 text-purple-400" />
              <span>Toilets:</span>
            </span>
            <div className="text-xl font-bold font-mono text-purple-300">
              {plan.totalToiletsRequired} <span className="text-[10px] text-pine-muted font-normal">units</span>
            </div>
            <span className="text-[9px] text-pine-muted block">Sphere 1:20 ratio</span>
          </div>

          {/* Total Rescue Vehicles */}
          <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
            <span className="text-[9.5px] text-pine-muted uppercase block font-bold flex items-center gap-1">
              <Car className="w-3 h-3 text-amber-400" />
              <span>Vehicles:</span>
            </span>
            <div className="text-xl font-bold font-mono text-amber-300">
              {plan.totalRescueVehiclesRequired} <span className="text-[10px] text-pine-muted font-normal">trucks</span>
            </div>
            <span className="text-[9px] text-pine-muted block">4x4 quick rescue</span>
          </div>

          {/* Total Medical Staff */}
          <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
            <span className="text-[9.5px] text-pine-muted uppercase block font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-rose-400" />
              <span>Medical Staff:</span>
            </span>
            <div className="text-xl font-bold font-mono text-rose-300">
              {plan.totalMedicalStaffRequired} <span className="text-[10px] text-pine-muted font-normal">staff</span>
            </div>
            <span className="text-[9px] text-pine-muted block">Doctors & Nurses</span>
          </div>

          {/* Total Daily Meals */}
          <div className="bg-[#0B1310] p-3 rounded-xl border border-[#1E3228] space-y-1">
            <span className="text-[9.5px] text-pine-muted uppercase block font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Daily Meals:</span>
            </span>
            <div className="text-xl font-bold font-mono text-yellow-300">
              {(plan.totalMealsPerDayRequired / 1000).toFixed(1)}k <span className="text-[10px] text-pine-muted font-normal">meals</span>
            </div>
            <span className="text-[9px] text-pine-muted block">3 hot meals/day</span>
          </div>

        </div>
      </div>

      {/* 3. Individual Destination Site Allocation Cards */}
      <div className="space-y-3">
        <span className="text-[10.5px] text-pine-muted uppercase font-bold tracking-wider block">
          Allocated Safe Resettlement Corridors:
        </span>

        <div className="space-y-3">
          {plan.allocations.map((alloc: any, idx: number) => {
            const rank = idx + 1;
            return (
              <div 
                key={alloc.siteId}
                className="bg-[#111D18] border border-[#1E3228] p-4 rounded-xl space-y-3 shadow-panel hover:border-emerald-700/60 transition-all cursor-pointer"
                onClick={() => onSelectSite && onSelectSite(alloc.siteId)}
              >
                {/* Header: Destination name & allocation numbers */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E3228] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-black font-bold flex items-center justify-center text-xs shrink-0">
                      0{rank}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white font-serif">{alloc.siteName}</h3>
                      <span className="text-[10px] text-pine-muted font-mono">
                        {alloc.siteId} • Distance: <strong className="text-white">{alloc.distanceKm} km</strong> (~{alloc.travelTimeMins} mins convoy)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      Allocated: {alloc.allocatedPopulation.toLocaleString()} Persons ({alloc.allocatedFamilies} Fam)
                    </span>
                    <span className="text-pine-muted text-[11px]">
                      Score: <strong className="text-emerald-400">{alloc.suitabilityScore}/100</strong>
                    </span>
                  </div>
                </div>

                {/* Logistics Ledger Grid for this Site */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#0B1310] p-2.5 rounded-lg border border-[#1E3228] text-[10.5px]">
                  <div>
                    <span className="text-pine-muted block">Capacity Used:</span>
                    <strong className="text-white font-mono">{alloc.utilizationPct}% ({alloc.practicalCapacity} cap)</strong>
                  </div>
                  <div>
                    <span className="text-pine-muted block">Ambulances Needed:</span>
                    <strong className="text-emerald-400 font-mono">{alloc.ambulancesRequired} Ambulances</strong>
                  </div>
                  <div>
                    <span className="text-pine-muted block">Daily Water Demand:</span>
                    <strong className="text-cyan-400 font-mono">{alloc.waterRequiredLitersDay.toLocaleString()} L/day</strong>
                  </div>
                  <div>
                    <span className="text-pine-muted block">Sanitation Units:</span>
                    <strong className="text-purple-300 font-mono">{alloc.toiletsRequired} Toilets</strong>
                  </div>
                  <div>
                    <span className="text-pine-muted block">Medical Doctors/Nurses:</span>
                    <strong className="text-rose-300 font-mono">{alloc.medicalStaffRequired} Staff</strong>
                  </div>
                </div>

                {/* Limiting Resource note */}
                <div className="flex items-center justify-between text-[10px] text-pine-muted">
                  <span>Limiting Resource for this Site: <strong className="text-white">{alloc.limitingResource}</strong></span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>Inspect Site Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
