import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  MapPin, 
  Search, 
  Activity, 
  RefreshCw,
  Bell,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    data, 
    selectedVillage, 
    setSelectedVillage, 
    searchQuery, 
    setSearchQuery,
    setActiveView,
    activeView
  } = useApp();

  const villages = data?.villages || [];
  const highRiskTotal = data?.metrics_summary?.total_high_risk_parcels || 424;
  const immediateFamilies = data?.metrics_summary?.immediate_relocation_needed_families || 250;

  return (
    <header className="sticky top-0 z-40 bg-pine-bg/95 backdrop-blur border-b border-pine-border px-4 lg:px-6 py-2.5">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Left: Brand & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded bg-pine-elevated border border-pine-accent/30 text-pine-accent font-serif font-black text-lg">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-pine-text">
                NIVARA
              </span>
              <span className="text-[10px] font-mono uppercase bg-pine-accent/15 text-pine-accent px-1.5 py-0.5 rounded border border-pine-accent/30 font-medium">
                SDMA RELOCATION OPS
              </span>
            </div>
            <p className="text-[11px] text-pine-muted font-sans hidden sm:block">
              Multi-Hazard Risk & Smart Relocation Decision Support System
            </p>
          </div>
        </div>

        {/* Center: Live Status & Signature Indicator */}
        <div className="hidden xl:flex items-center gap-3 bg-pine-panel px-3 py-1.5 rounded-md border border-pine-border">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-risk-high"></span>
            </span>
            <span className="text-pine-muted">ACTIVE RED ZONE:</span>
            <span className="text-risk-high font-bold tracking-wide animate-pulse-subtle">
              MEPPADI (100% CRITICAL)
            </span>
          </div>

          <div className="h-4 w-px bg-pine-border" />

          <div className="flex items-center gap-1.5 text-xs font-mono text-pine-muted">
            <Activity className="w-3.5 h-3.5 text-pine-accent" />
            <span>IMMEDIATE RELOCATION:</span>
            <span className="text-pine-accent font-bold">{immediateFamilies} FAMILIES</span>
          </div>
        </div>

        {/* Right: Village Filter, Search & Status */}
        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto">
          
          {/* Village Quick Selector */}
          <div className="flex items-center gap-1.5 bg-pine-panel border border-pine-border rounded px-2.5 py-1 text-xs">
            <MapPin className="w-3.5 h-3.5 text-pine-accent" />
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="bg-transparent text-pine-text font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-pine-panel text-pine-text">All 4 Study Villages (Wayanad)</option>
              {villages.map((v) => (
                <option key={v.name} value={v.name} className="bg-pine-panel text-pine-text">
                  {v.name} ({v.high_risk_count} High Risk)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-pine-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search parcel, site, survey..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-pine-panel border border-pine-border rounded pl-8 pr-3 py-1 text-xs text-pine-text placeholder:text-pine-muted/60 focus:outline-none focus:border-pine-accent w-44 lg:w-56 font-mono"
            />
          </div>

          {/* Early Warning Trigger Button */}
          <button
            onClick={() => setActiveView('early-warning')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono transition-colors ${
              activeView === 'early-warning'
                ? 'bg-pine-accent text-pine-bg border-pine-accent font-bold'
                : 'bg-pine-panel text-pine-muted hover:text-pine-text border-pine-border'
            }`}
            title="Early Warning & Live Hydrometeorology"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">LIVE SENSORS</span>
          </button>

        </div>
      </div>
    </header>
  );
};
