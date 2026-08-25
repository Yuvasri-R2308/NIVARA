import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { MapComponent } from '../components/MapComponent';
import { 
  Radio, 
  Activity, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Satellite, 
  CheckCircle, 
  FileCheck, 
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export const IntelligenceLayers: React.FC = () => {
  const { data, setSelectedVillage, setActiveView } = useApp();
  const [selectedAlertId, setSelectedAlertId] = useState<string>('ALT-2026-001');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!data) return null;

  const { intelligence_alerts, candidate_sites } = data;

  const activeAlert = intelligence_alerts.find(a => a.id === selectedAlertId) || intelligence_alerts[0];

  const handleIssueNotice = (alertId: string, action: string) => {
    setActionNotice(`Official SDMA Emergency Directive logged for ${alertId}: "${action}"`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="p-3 lg:p-5 space-y-4 max-w-7xl mx-auto font-mono text-xs text-pine-text">
      
      {/* 1. TOP BANNER */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-panel">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              05 LIVE INTELLIGENCE
            </span>
            <span className="text-pine-muted text-[11px]">EARLY WARNING TIMELINE</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white mt-1">
            Real-Time Sensors & Ground Movement Surveillance
          </h1>
          <p className="text-xs text-pine-muted font-sans mt-0.5 max-w-2xl">
            Live telemetry stream integrating InSAR ground subsidence, AWS precipitation gauges, river stage telemetry, and illegal toe-slope excavation alerts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0B1310] border border-[#1E3228] px-3 py-2 rounded-xl text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>4 TELEMETRY FEEDS SYNCHRONIZED</span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2. MAIN INTELLIGENCE WORKSPACE: TIMELINE vs CONTEXTUAL EVIDENCE & MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 5 Cols: Compact Interactive Live Timeline */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#111D18] border border-[#1E3228] rounded-xl p-3.5 space-y-2.5 shadow-panel">
            <div className="flex items-center justify-between border-b border-[#1E3228] pb-1.5">
              <span className="text-[10px] text-pine-muted uppercase font-bold tracking-wider">
                ACTIVE TELEMETRY INCIDENTS ({intelligence_alerts.length}):
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">CLICK TO EXPAND</span>
            </div>

            <div className="space-y-2">
              {intelligence_alerts.map((alt) => {
                const isSelected = selectedAlertId === alt.id;
                const isCritical = alt.severity === 'CRITICAL';

                return (
                  <div
                    key={alt.id}
                    onClick={() => setSelectedAlertId(alt.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-panel'
                        : 'bg-[#0B1310] border-[#1E3228] hover:border-emerald-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                          }`} />
                          <span className="font-bold text-white text-xs">{alt.location}</span>
                        </div>
                        <p className="text-[11px] text-pine-muted font-sans">
                          {alt.village} Sub-basin &bull; {alt.type.replace(/_/g, ' ')}
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border shrink-0 ${
                        isCritical 
                          ? 'bg-rose-950 text-rose-300 border-rose-800' 
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {alt.severity}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#1E3228]/60 flex items-center justify-between text-[10px] text-pine-muted font-mono">
                      <span>{alt.timestamp.replace('T', ' ').replace('Z', ' UTC')}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <span>Inspect Evidence</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Expanded Contextual Evidence & Direct Map Navigation */}
        <div className="lg:col-span-7 bg-[#111D18] border border-[#1E3228] rounded-xl p-4 space-y-3 shadow-panel flex flex-col justify-between">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E3228] pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-400">{activeAlert.id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  {activeAlert.severity} SEVERITY
                </span>
                <DataConfidenceTag confidence={activeAlert.confidence} size="sm" />
              </div>

              <span className="text-[10px] text-pine-muted font-mono">
                {activeAlert.timestamp.replace('T', ' ').replace('Z', ' UTC')}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-serif font-bold text-white">
                {activeAlert.location}
              </h2>
              <p className="text-xs text-pine-muted font-sans mt-0.5">
                {activeAlert.village} District Zone &bull; Instrument: <strong className="text-white">{activeAlert.detection_source}</strong>
              </p>
            </div>

            {/* Metric Evidence Box */}
            <div className="p-3 bg-[#0B1310] rounded-xl border border-[#1E3228] grid grid-cols-2 gap-2 text-xs">
              {activeAlert.movement_rate_mm_day && (
                <div>
                  <span className="text-pine-muted text-[10px] block">Displacement Creep:</span>
                  <strong className="text-rose-400 font-mono text-sm">{activeAlert.movement_rate_mm_day} mm/day</strong>
                </div>
              )}
              {activeAlert.cumulative_displacement_cm && (
                <div>
                  <span className="text-pine-muted text-[10px] block">Cumulative Slip:</span>
                  <strong className="text-white font-mono text-sm">{activeAlert.cumulative_displacement_cm} cm</strong>
                </div>
              )}
              {activeAlert.structure_type && (
                <div className="col-span-2">
                  <span className="text-pine-muted text-[10px] block">Unauthorized Structure:</span>
                  <strong className="text-amber-300 font-mono">{activeAlert.structure_type}</strong>
                </div>
              )}
              {activeAlert.saturation_pct && (
                <div className="col-span-2">
                  <span className="text-pine-muted text-[10px] block">Hydrological Pore Saturation:</span>
                  <strong className="text-rose-400 font-mono">{activeAlert.saturation_pct}% (Severe Exceedance)</strong>
                </div>
              )}
            </div>

            {/* Action Required */}
            <div className="p-3 bg-[#12221B] rounded-xl border border-[#1E3228] space-y-1 font-sans">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
                Mandatory SDMA Action Directive:
              </span>
              <p className="text-xs text-white leading-relaxed font-medium">
                {activeAlert.action_required}
              </p>
            </div>

            {/* Embedded Live Situation Map */}
            <div className="rounded-xl overflow-hidden border border-[#1E3228] min-h-[220px]">
              <MapComponent
                parcels={data.parcels.filter(p => p.village === activeAlert.village)}
                candidateSites={candidate_sites}
                runoutPaths={data.runout_paths}
                height="230px"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-[#1E3228] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <button
              onClick={() => {
                setSelectedVillage(activeAlert.village);
                setActiveView('red-zone-map');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>OPEN ON INTERACTIVE MAP</span>
            </button>

            <button
              onClick={() => handleIssueNotice(activeAlert.id, activeAlert.action_required)}
              className="px-4 py-2 bg-[#15241E] hover:bg-[#1E342B] text-pine-text rounded-lg border border-[#1E3228] font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ISSUE LEGAL DIRECTIVE</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
