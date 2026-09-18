import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HazardModuleId, HazardType } from '../../types';
import { 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  Radio, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  ListOrdered, 
  MapPinCheck, 
  Scale, 
  Columns3, 
  LayoutDashboard, 
  FileText, 
  Waves, 
  Droplets, 
  CloudLightning, 
  Mountain, 
  ArrowLeft, 
  Cpu, 
  Compass, 
  MapPin 
} from 'lucide-react';

interface ModuleNavItem {
  id: HazardModuleId;
  label: string;
  tag?: string;
  icon: React.ReactNode;
}

interface Props {
  onOpenEvidence?: () => void;
}

export const Sidebar: React.FC<Props> = ({ onOpenEvidence }) => {
  const { 
    selectedHazard, 
    selectedHazardModule, 
    selectHazardModule, 
    goHome, 
    activeView, 
    setActiveView,
    theme
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);

  // 5 STANDARDIZED OPERATIONAL PIPELINE MODULES
  const pipelineModules: ModuleNavItem[] = [
    { id: 'red-zone-update', label: 'Red Zone Update', icon: <MapPin className={`w-4 h-4 ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`} /> },
    { id: 'priority-evacuation', label: 'Priority Evacuation', icon: <ListOrdered className={`w-4 h-4 ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`} /> },
    { id: 'safe-relocation', label: 'Safe Relocation', icon: <MapPinCheck className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} /> },
    { id: 'authority-insights', label: 'Authority Insights', icon: <Activity className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} /> },
    { id: 'simulator', label: 'Simulator', icon: <Sliders className={`w-4 h-4 ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`} /> },
  ];

  // Hazard details for badge
  const getHazardBadge = (h: HazardType | null) => {
    switch (h) {
      case 'landslide':
        return { 
          title: 'LANDSLIDE', 
          loc: 'MEPPADI, KERALA', 
          icon: <Mountain className={`w-4 h-4 ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`} />, 
          border: theme === 'light' ? 'border-rose-200 bg-rose-50/60' : 'border-rose-700/60 bg-[#0E1E17]' 
        };
      case 'flood':
        return { 
          title: 'FLOOD', 
          loc: 'DIBRUGARH, ASSAM', 
          icon: <Droplets className={`w-4 h-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />, 
          border: theme === 'light' ? 'border-blue-200 bg-blue-50/60' : 'border-blue-700/60 bg-[#0E1E17]' 
        };
      case 'cloudburst':
        return { 
          title: 'CLOUDBURST', 
          loc: 'KEDARNATH, UK', 
          icon: <CloudLightning className={`w-4 h-4 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />, 
          border: theme === 'light' ? 'border-amber-200 bg-amber-50/60' : 'border-amber-700/60 bg-[#0E1E17]' 
        };
      case 'coastal-erosion':
        return { 
          title: 'COASTAL EROSION', 
          loc: 'PODAMPETA, ODISHA', 
          icon: <Waves className={`w-4 h-4 ${theme === 'light' ? 'text-teal-600' : 'text-teal-400'}`} />, 
          border: theme === 'light' ? 'border-teal-200 bg-teal-50/60' : 'border-teal-700/60 bg-[#0E1E17]' 
        };
      default:
        return { 
          title: 'DISASTER OPS', 
          loc: 'MULTI-HAZARD', 
          icon: <Compass className={`w-4 h-4 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />, 
          border: theme === 'light' ? 'border-emerald-200 bg-emerald-50/60' : 'border-emerald-700/60 bg-[#0E1E17]' 
        };
    }
  };

  const currentBadge = getHazardBadge(selectedHazard);

  return (
    <aside className={`border-r flex flex-col transition-all duration-200 shrink-0 ${
      collapsed ? 'w-16' : 'w-64 lg:w-72 2xl:w-80'
    } h-full select-none ${
      theme === 'light' 
        ? 'bg-white border-slate-200 text-slate-900 shadow-sm' 
        : 'bg-[#0B1310] border-[#1E3228] text-slate-100'
    }`}>
      
      {/* Top Bar: Back to Home & Collapse Toggle */}
      <div className={`p-3 border-b flex items-center justify-between gap-2 ${
        theme === 'light' ? 'border-slate-200 bg-slate-50/90' : 'border-[#1E3228] bg-[#08100C]'
      }`}>
        {!collapsed ? (
          <button
            onClick={goHome}
            className={`flex items-center gap-2 text-xs font-mono font-bold transition-colors px-2 py-1 rounded ${
              theme === 'light'
                ? 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                : 'text-emerald-400 hover:text-white hover:bg-emerald-950/50'
            }`}
            title="Return to Hazard Selection Portal"
          >
            <img 
              src="/assets/nivara_logo.png" 
              alt="NIVARA Logo" 
              className="w-5 h-5 rounded-full object-contain shrink-0 shadow-xs" 
            />
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>NIVARA HOME</span>
          </button>
        ) : (
          <button
            onClick={goHome}
            className="p-0.5 rounded-full transition-transform hover:scale-110 cursor-pointer"
            title="Return to NIVARA Home"
          >
            <img 
              src="/assets/nivara_logo.png" 
              alt="NIVARA Logo" 
              className="w-6 h-6 rounded-full object-contain shadow-xs" 
            />
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg transition-colors ml-auto ${
            theme === 'light'
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              : 'text-pine-muted hover:text-pine-text hover:bg-pine-panel'
          }`}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Hazard Theater Banner */}
      {!collapsed && (
        <div className={`mx-3 my-2.5 p-2.5 rounded-xl border ${currentBadge.border} flex items-center gap-3 shadow-sm`}>
          <div className={`p-1.5 rounded-lg border ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#070D0A] border-slate-700'
          }`}>
            {currentBadge.icon}
          </div>
          <div className="min-w-0">
            <div className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              ACTIVE THEATER
            </div>
            <div className={`text-xs font-bold font-mono truncate ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              {currentBadge.title} — {currentBadge.loc}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="p-3 flex-1 space-y-4 overflow-y-auto">
        
        {/* Section 1: Standardized 5-Module Decision Pipeline */}
        <div>
          {!collapsed && (
            <div className={`text-[11px] font-mono uppercase tracking-widest px-2 mb-2 font-bold flex items-center justify-between ${
              theme === 'light' ? 'text-slate-600' : 'text-emerald-400/80'
            }`}>
              <span>Decision Pipeline</span>
              <span className={`text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>5 Modules</span>
            </div>
          )}
          
          <ul className="space-y-1">
            {pipelineModules.map((item) => {
              const isActive = selectedHazardModule === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => selectHazardModule(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-sans transition-all group focus:outline-none ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-sm border border-emerald-500'
                        : (theme === 'light'
                            ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                            : 'text-pine-muted hover:text-white hover:bg-pine-panel/80')
                    }`}
                    title={item.label}
                  >
                    <span className={`shrink-0 ${
                      isActive 
                        ? 'text-white' 
                        : (theme === 'light' ? 'text-slate-500 group-hover:text-emerald-600' : 'text-slate-400 group-hover:text-emerald-400')
                    }`}>
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className={`truncate flex-1 font-semibold text-xs ${
                        isActive ? 'text-white' : (theme === 'light' ? 'text-slate-800' : 'text-slate-300')
                      }`}>
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Section 2: Methodology Architecture */}
        {!collapsed && (
          <div className={`pt-2 border-t ${theme === 'light' ? 'border-slate-200' : 'border-[#1E3228]'}`}>
            <button
              onClick={() => setActiveView('methodology-pipeline')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-sans transition-all group focus:outline-none ${
                activeView === 'methodology-pipeline' 
                  ? 'bg-emerald-600 text-white font-bold shadow-sm border border-emerald-500' 
                  : (theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium' : 'text-slate-400 hover:text-white hover:bg-pine-panel/80')
              }`}
              title="Methodology Pipeline, Equations & Data Transparency Audit"
            >
              <Activity className={`w-3.5 h-3.5 shrink-0 ${activeView === 'methodology-pipeline' ? 'text-white' : (theme === 'light' ? 'text-slate-500' : 'text-slate-400')}`} />
              <span className="truncate flex-1 font-semibold text-xs">Methodology Architecture</span>
            </button>
          </div>
        )}

      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className={`p-3 border-t text-[11px] font-mono space-y-1.5 ${
          theme === 'light' ? 'border-slate-200 bg-slate-50/90 text-slate-600' : 'border-[#1E3228] bg-[#08100C] text-slate-400'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <img 
                src="/assets/nivara_logo.png" 
                alt="NIVARA Seal" 
                className="w-4 h-4 rounded-full object-contain shrink-0" 
              />
              <span>SDMA DISASTER OPS</span>
            </div>
            <span className={`font-bold flex items-center gap-1 ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
              <span className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-emerald-600' : 'bg-emerald-400'}`} />
              ACTIVE
            </span>
          </div>
          <div className={`text-[10px] truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
            NIVARA Multi-Hazard Decision Core v3.0
          </div>
        </div>
      )}

    </aside>
  );
};
