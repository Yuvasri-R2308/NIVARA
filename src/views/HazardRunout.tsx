import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapComponent } from '../components/MapComponent';
import { StatCard } from '../components/StatCard';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { 
  TrendingDown, 
  AlertOctagon, 
  Clock, 
  Gauge, 
  MapPin, 
  ShieldAlert,
  ArrowDownRight
} from 'lucide-react';

export const HazardRunout: React.FC = () => {
  const { data, setSelectedParcel } = useApp();
  const [selectedRunoutId, setSelectedRunoutId] = useState<string>('RUNOUT-MEPPADI-01');

  if (!data) return null;

  const { runout_paths, parcels } = data;
  const activePath = runout_paths.find(r => r.id === selectedRunoutId) || runout_paths[0];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
              STAGE 07 — RUNOUT & IMPACT
            </span>
            <span className="text-xs font-mono text-pine-muted">DEBRIS PROPAGATION MODELING</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text mt-1">
            Hazard Impact & Downstream Runout Simulator
          </h1>
          <p className="text-xs lg:text-sm text-pine-muted mt-1 max-w-3xl">
            <strong>Decision Changed:</strong> Enables SDMA response teams to demarcate secondary downstream evacuation cordons and alert downstream bridge crossings up to 18–50 minutes before mud/debris surges strike.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800 px-3 py-2 rounded text-xs font-mono text-rose-300">
          <AlertOctagon className="w-4 h-4 animate-pulse" />
          <span>EPICENTER FLOW: 48.5 KM/H</span>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Flow Trajectories"
          value={runout_paths.length}
          unit="Mapped Corridors"
          subtext="High-Elevation Scarps to Valley Confluences"
          confidence="HIGH"
          icon={<TrendingDown className="w-5 h-5 text-risk-high" />}
        />
        <StatCard
          title="Downstream Exposed Population"
          value="6,930"
          unit="In Path of Flow"
          subtext="Mundakkai, Chooralmala & Achoor Basins"
          variant="danger"
          confidence="HIGH"
          icon={<ShieldAlert className="w-5 h-5 text-risk-high" />}
        />
        <StatCard
          title="Max Debris Velocity"
          value="48.5"
          unit="km / h"
          subtext="Chembra Scarp Soil Liquefaction Surge"
          variant="warning"
          confidence="HIGH"
          icon={<Gauge className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          title="Minimum Warning Lead Time"
          value="18"
          unit="Minutes"
          subtext="From Sensor Trigger to Chooralmala Bridge"
          variant="accent"
          confidence="HIGH"
          icon={<Clock className="w-5 h-5 text-pine-accent" />}
        />
      </div>

      {/* Main Simulation View: Map + Runout Trajectory Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Map with Highlighted Vectors */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-pine-text flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pine-accent" />
              <span>Downstream Flow Vectors & Valley Inundation</span>
            </h2>
            <DataConfidenceTag confidence="HIGH" />
          </div>

          <MapComponent
            parcels={parcels}
            runoutPaths={runout_paths}
            height="520px"
            center={activePath.flow_coordinates[0]}
            zoom={12}
            showSites={false}
            showRunout={true}
          />
        </div>

        {/* Right 4 Cols: Trajectory Details */}
        <div className="lg:col-span-4 space-y-3 font-mono text-xs">
          <div className="text-pine-muted uppercase font-bold text-[11px]">Select Active Runout Corridor:</div>
          
          <div className="space-y-2.5">
            {runout_paths.map((p) => {
              const isSelected = p.id === selectedRunoutId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedRunoutId(p.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-pine-elevated border-risk-high shadow-panel' 
                      : 'bg-pine-panel border-pine-border hover:border-pine-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-pine-accent">{p.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      p.risk_rating.includes('EXTREME') 
                        ? 'bg-rose-950 text-rose-300 border-rose-800' 
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {p.risk_rating}
                    </span>
                  </div>

                  <div className="font-sans text-pine-text font-bold mb-1">
                    {p.village} Corridor ({p.length_km} km)
                  </div>

                  <div className="text-[11px] text-pine-muted font-sans space-y-1">
                    <div className="flex items-start gap-1">
                      <span className="text-pine-accent font-bold">&bull; Origin:</span>
                      <span>{p.source_name}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-rose-400 font-bold">&bull; Terminus:</span>
                      <span>{p.destination_name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-pine-bg p-2 rounded border border-pine-border/60 mt-2 text-[11px]">
                    <div>Velocity: <strong className="text-white">{p.estimated_velocity_kmh} km/h</strong></div>
                    <div>Lead Time: <strong className="text-amber-300">{p.early_warning_lead_time_min} mins</strong></div>
                    <div>Affected Parcels: <strong className="text-white">{p.affected_parcels_count}</strong></div>
                    <div>Exposed Pop: <strong className="text-rose-400">{p.exposed_population.toLocaleString()}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Incident Protocol Summary */}
          <div className="p-3.5 rounded-lg bg-pine-elevated border border-pine-border space-y-1.5 font-sans">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Standard Runout Action Protocol:</span>
            </div>
            <p className="text-[11px] text-pine-muted leading-relaxed">
              When rain exceeds 100mm/24h with soil saturation &gt;85%, immediate police barricades must be positioned at Chooralmala Bridge and lower river crossings prior to slope detachment.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
