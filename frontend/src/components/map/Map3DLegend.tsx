import React, { useState } from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Mountain, 
  Waves, 
  Users, 
  Home, 
  Route,
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface Map3DLegendProps {
  showExtrusion?: boolean;
  showLandslides?: boolean;
  showFloods?: boolean;
  showPopulation?: boolean;
  showSites?: boolean;
  showRoutes?: boolean;
  onOpenTerrainAnalysis?: () => void;
}

export const Map3DLegend: React.FC<Map3DLegendProps> = ({
  showExtrusion = true,
  showLandslides = true,
  showFloods = true,
  showPopulation = true,
  showSites = true,
  showRoutes = true,
  onOpenTerrainAnalysis
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-[#07110C]/95 backdrop-blur-xl border border-cyan-500/35 rounded-xl shadow-2xl overflow-hidden text-[11px] font-mono text-cyan-100 w-64 select-none transition-all">
      
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-3 py-2 bg-black/50 hover:bg-black/70 border-b border-cyan-500/20 text-white font-bold text-xs transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5 text-cyan-300">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>TOPOGRAPHY &amp; 3D LAYERS</span>
        </div>
        {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />}
      </button>

      {/* Legend Items */}
      {!isCollapsed && (
        <div className="p-2.5 space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar">
          
          {/* 1. TOPOGRAPHY & ELEVATION CARD (User Request) */}
          <div className="bg-[#050D0A] p-2 rounded-lg border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Mountain className="w-3 h-3" />
                DEM Elevation Palette
              </span>
              <span className="text-[9px] text-pine-muted">Muted GIS</span>
            </div>

            {/* Natural Elevation Color Ramp Bar */}
            <div className="space-y-1">
              <div className="h-2.5 w-full rounded-full overflow-hidden border border-white/10 flex">
                <div className="flex-1 bg-[#D4C8B2]" title="715m-760m: Lowland Sand / Valley Floor" />
                <div className="flex-1 bg-[#C2B69F]" title="760m-840m: Alluvial Margin" />
                <div className="flex-1 bg-[#8B9B85]" title="840m-980m: Soft Sage Slope" />
                <div className="flex-1 bg-[#697A63]" title="980m-1200m: Desaturated Olive" />
                <div className="flex-1 bg-[#4C5C48]" title="1200m-1450m: Forest Green" />
                <div className="flex-1 bg-[#6D675F]" title="1450m-1657m: Granite Stone Gray" />
              </div>
              <div className="flex items-center justify-between text-[9px] text-pine-muted">
                <span>715m (Low)</span>
                <span>950m</span>
                <span>1,657m (Peak)</span>
              </div>
            </div>

            {/* Key Topographic Metrics */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
              <div className="bg-[#0A1612] px-2 py-1 rounded border border-[#162A20]">
                <span className="text-pine-muted text-[8.5px] block">HIGHEST POINT</span>
                <span className="text-emerald-400 font-bold">▲ 1,657m</span>
                <span className="text-[8.5px] text-pine-muted block truncate">Chembra Scarp</span>
              </div>
              <div className="bg-[#0A1612] px-2 py-1 rounded border border-[#162A20]">
                <span className="text-pine-muted text-[8.5px] block">LOWEST POINT</span>
                <span className="text-cyan-400 font-bold">● 715m</span>
                <span className="text-[8.5px] text-pine-muted block truncate">Kabini Confluence</span>
              </div>
            </div>

            {/* Topographic Marker Icons */}
            <div className="space-y-1 pt-1 border-t border-[#162A20] text-[9.5px]">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">▲</span>
                <span className="text-white">Peak [elevation] m</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">●</span>
                <span className="text-cyan-200">Low Point (Water Accumulation)</span>
              </div>
            </div>

            {/* Button to Open Detailed Terrain Analysis Modal */}
            {onOpenTerrainAnalysis && (
              <button
                onClick={onOpenTerrainAnalysis}
                className="w-full mt-1.5 py-1.5 px-2 bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-[10.5px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <span>Detailed Terrain Analysis</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
          
          {/* 3D Risk Extrusion Levels */}
          {showExtrusion && (
            <div className="pt-1 border-t border-cyan-500/15">
              <div className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-cyan-400" />
                <span>3D Hazard Extrusions</span>
              </div>
              <div className="space-y-1 pl-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-2 rounded-sm bg-[#E8543E] border border-white/40 shadow-[0_0_8px_#E8543E]"></span>
                    <span className="text-white font-bold">Critical (HRI &ge; 75)</span>
                  </div>
                  <span className="text-rose-400 text-[9px]">350m Extruded</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-2 rounded-sm bg-[#FF705A] border border-white/20"></span>
                    <span className="text-gray-200">High (60 &le; HRI &lt; 75)</span>
                  </div>
                  <span className="text-orange-400 text-[9px]">200m</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-2 rounded-sm bg-[#E8A63E]"></span>
                    <span className="text-gray-300">Medium (35 &le; HRI &lt; 60)</span>
                  </div>
                  <span className="text-amber-400 text-[9px]">100m</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-2 rounded-sm bg-[#3FA37D]"></span>
                    <span className="text-gray-400">Low (HRI &lt; 35)</span>
                  </div>
                  <span className="text-emerald-400 text-[9px]">25m (Base)</span>
                </div>
              </div>
            </div>
          )}

          {/* Landslide Runout Vectors */}
          {showLandslides && (
            <div className="pt-1 border-t border-cyan-500/15">
              <div className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mountain className="w-3 h-3 text-rose-400" />
                <span>Landslide &amp; Runout</span>
              </div>
              <div className="flex items-center gap-2 pl-1 text-[10px]">
                <span className="w-5 h-1 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400"></span>
                <span className="text-gray-300">Debris flow runout channel</span>
              </div>
            </div>
          )}

          {/* Flood Inundation Buffer */}
          {showFloods && (
            <div className="pt-1 border-t border-cyan-500/15">
              <div className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Waves className="w-3 h-3 text-cyan-400" />
                <span>Flood Lowlands</span>
              </div>
              <div className="flex items-center gap-2 pl-1 text-[10px]">
                <span className="w-3.5 h-2 rounded-sm bg-cyan-500/40 border border-cyan-400"></span>
                <span className="text-gray-300">Kabini River Basin Floodplain</span>
              </div>
            </div>
          )}

          {/* 3D Evacuation Routes */}
          {showRoutes && (
            <div className="pt-1 border-t border-cyan-500/15">
              <div className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Route className="w-3 h-3 text-cyan-400" />
                <span>Evacuation Corridors</span>
              </div>
              <div className="flex items-center gap-2 pl-1 text-[10px]">
                <span className="w-5 h-1 border-b-2 border-dashed border-cyan-400"></span>
                <span className="text-cyan-200">NH-766 Protected Arterial</span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
