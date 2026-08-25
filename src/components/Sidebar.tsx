import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveView } from '../types';
import { 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  Radio, 
  Database,
  ChevronLeft,
  ChevronRight,
  Activity,
  ListOrdered,
  TrendingDown,
  MapPinCheck,
  Scale,
  Columns3,
  FileSpreadsheet,
  FileCode2,
  LayoutDashboard
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  number: string;
  label: string;
  tag?: 'LIVE' | 'CORE' | 'SDMA';
  icon: React.ReactNode;
}

interface Props {
  onOpenEvidence?: () => void;
}

export const Sidebar: React.FC<Props> = ({ onOpenEvidence }) => {
  const { activeView, setActiveView } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  // 1. CORE DISASTER DECISION PIPELINE (01 Overview)
  const corePipelineItems: NavItem[] = [
    { id: 'sdma-command', number: '01', label: 'Overview', tag: 'SDMA', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'priority-queue', number: '02', label: 'Priority Evacuation List', icon: <ListOrdered className="w-4 h-4" /> },
    { id: 'hazard-runout', number: '03', label: 'Landslide & Flood Paths', icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'candidate-sites', number: '04', label: 'Safe Relocation Lands', icon: <MapPinCheck className="w-4 h-4" /> },
    { id: 'carrying-capacity', number: '05', label: 'Land Safety Capacity', icon: <Scale className="w-4 h-4" /> },
    { id: 'relocation-engine', number: '06', label: 'Relocation Matcher', tag: 'CORE', icon: <Sparkles className="w-4 h-4" /> },
  ];

  // 2. INTELLIGENCE & ANALYTICS
  const intelligenceItems: NavItem[] = [
    { id: 'early-warning', number: '07', label: 'Live Rain & Saturation', tag: 'LIVE', icon: <Radio className="w-4 h-4" /> },
    { id: 'intelligence-layers', number: '08', label: 'Ground Cracks & Alerts', icon: <Activity className="w-4 h-4" /> },
    { id: 'area-comparison', number: '09', label: 'Compare 4 Villages', icon: <Columns3 className="w-4 h-4" /> },
    { id: 'what-if-simulation', number: '10', label: 'Rain Risk Simulator', icon: <Sliders className="w-4 h-4" /> },
  ];

  // 3. DATA VAULT & METHODOLOGY
  const dataEvidenceItems: NavItem[] = [
    { id: 'data-foundation', number: '11', label: 'Data & Raw Records', icon: <Database className="w-4 h-4" /> },
    { id: 'dataset-explorer', number: '12', label: 'Browse Raw Tables', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'methodology-pipeline', number: '13', label: 'How Formulas Work', icon: <FileCode2 className="w-4 h-4" /> },
  ];

  const renderNavList = (items: NavItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = activeView === item.id;
        return (
          <li key={item.id}>
            <button
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-mono transition-all group focus:outline-none ${
                isActive
                  ? 'bg-emerald-700 text-white font-bold shadow-panel border border-emerald-500/50'
                  : 'text-pine-muted hover:text-white hover:bg-pine-panel/80'
              }`}
              title={`${item.number} ${item.label}`}
            >
              <span className={`font-mono text-[11px] shrink-0 ${
                isActive ? 'text-emerald-200 font-bold' : 'text-pine-muted/70 group-hover:text-emerald-400'
              }`}>
                {item.number}
              </span>

              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-pine-muted group-hover:text-emerald-400'}`}>
                {item.icon}
              </span>

              {!collapsed && (
                <span className="truncate flex-1 tracking-wide text-[11.5px] font-sans">
                  {item.label}
                </span>
              )}

              {!collapsed && item.tag && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                  isActive 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' 
                    : item.tag === 'CORE'
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                    : item.tag === 'SDMA'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                    : 'bg-amber-950/60 text-amber-300 border border-amber-800 animate-pulse'
                }`}>
                  {item.tag}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className={`bg-[#0B1310] border-r border-[#1E3228] flex flex-col transition-all duration-200 shrink-0 ${
      collapsed ? 'w-16' : 'w-60'
    } min-h-[calc(100vh-53px)] select-none`}>
      
      {/* Top Toggle Button */}
      <div className="p-2 border-b border-[#1E3228] flex items-center justify-between">
        {!collapsed && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NIVARA DISASTER OPS</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-pine-muted hover:text-pine-text hover:bg-pine-panel rounded transition-colors ml-auto"
          title={collapsed ? "Expand Navigation" : "Collapse Navigation"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="p-2.5 flex-1 space-y-4 overflow-y-auto">
        
        {/* Section 1: Core Pipeline */}
        <div>
          {!collapsed && (
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 px-2.5 mb-1.5 font-bold">
              Core Pipeline
            </div>
          )}
          {renderNavList(corePipelineItems)}
        </div>

        {/* Section 2: Intelligence & Analytics */}
        <div className="pt-2 border-t border-[#1E3228]/80">
          {!collapsed && (
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 px-2.5 mb-1.5 font-bold">
              Intelligence & Tools
            </div>
          )}
          {renderNavList(intelligenceItems)}
        </div>

        {/* Section 3: Data Vault & Methodology */}
        <div className="pt-2 border-t border-[#1E3228]/80">
          {!collapsed && (
            <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 px-2.5 mb-1.5 font-bold">
              Data & Evidence
            </div>
          )}
          {renderNavList(dataEvidenceItems)}
        </div>

      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-[#1E3228] bg-[#0E1814] text-[10px] font-mono text-pine-muted space-y-1">
          <div className="flex items-center justify-between">
            <span>OPERATIONAL STATUS</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ONLINE
            </span>
          </div>
          <p className="text-[9px] text-pine-muted/70 truncate">
            Wayanad Multi-Hazard Model v2.4
          </p>
        </div>
      )}

    </aside>
  );
};
