import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Mountain, 
  Waves, 
  Users, 
  Home, 
  Route, 
  CloudRain, 
  RotateCcw, 
  Compass, 
  Maximize2, 
  Minimize2,
  Sliders,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Satellite,
  Map as MapIcon,
  ShieldAlert,
  Radio
} from 'lucide-react';

export interface Map3DLayersState {
  showExtrusion: boolean;
  showLandslides: boolean;
  showFloods: boolean;
  showPopulation: boolean;
  showSites: boolean;
  showRoutes: boolean;
  showWeather: boolean;
  showCatchments?: boolean;
}

export type MapBaseStyle = 'dark' | 'satellite' | 'terrain' | 'street';

interface Map3DControlsProps {
  mapMode: '2D' | '3D';
  onToggleMapMode: (mode: '2D' | '3D') => void;
  baseStyle?: MapBaseStyle;
  onChangeBaseStyle?: (style: MapBaseStyle) => void;
  terrainExaggeration: number;
  onChangeExaggeration: (val: number) => void;
  layers: Map3DLayersState;
  onToggleLayer: (layerKey: keyof Map3DLayersState) => void;
  onApplyPreset?: (presetName: string) => void;
  onResetCamera: () => void;
  onTiltCamera: (pitch: number) => void;
  isTilted: boolean;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const Map3DControls: React.FC<Map3DControlsProps> = ({
  mapMode,
  onToggleMapMode,
  baseStyle = 'dark',
  onChangeBaseStyle,
  terrainExaggeration,
  onChangeExaggeration,
  layers,
  onToggleLayer,
  onApplyPreset,
  onResetCamera,
  onTiltCamera,
  isTilted,
  onToggleFullscreen,
  isFullscreen = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-2 text-xs font-mono select-none">
      
      {/* 1. PRIMARY MODE TOGGLE PILL [ 2D GIS ] [ 3D TERRAIN ] */}
      <div className="flex items-center p-1 bg-[#07110C]/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl shadow-2xl">
        <button
          onClick={() => onToggleMapMode('2D')}
          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
            mapMode === '2D'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(52,211,153,0.5)] border border-emerald-400/40'
              : 'text-pine-muted hover:text-white hover:bg-white/5'
          }`}
          title="Switch to 2D GIS Leaflet Map"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2D GIS</span>
        </button>

        <button
          onClick={() => onToggleMapMode('3D')}
          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
            mapMode === '3D'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.6)] border border-cyan-400/50'
              : 'text-pine-muted hover:text-white hover:bg-white/5'
          }`}
          title="Switch to 3D WebGL Terrain Experience"
        >
          <Mountain className="w-3.5 h-3.5 text-cyan-300" />
          <span>3D TERRAIN</span>
        </button>
      </div>

      {/* 2. 3D QUICK ACTIONS & DRAWER TOGGLE (Only in 3D Mode) */}
      {mapMode === '3D' && (
        <div className="flex items-center gap-1.5">
          
          {/* Quick Perspective Tilt Button */}
          <button
            onClick={() => onTiltCamera(isTilted ? 0 : 58)}
            className={`p-2 rounded-xl backdrop-blur-xl border shadow-xl transition-all cursor-pointer ${
              isTilted
                ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                : 'bg-[#07110C]/90 text-pine-muted border-cyan-500/30 hover:text-white'
            }`}
            title={isTilted ? "Switch to Top-Down 2D Perspective (0°)" : "Tilt 3D Camera to 58° Horizon View"}
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Quick Camera Reset View Button */}
          <button
            onClick={onResetCamera}
            className="p-2 rounded-xl bg-[#07110C]/90 backdrop-blur-xl border border-cyan-500/30 text-pine-muted hover:text-white hover:border-cyan-400 shadow-xl transition-all cursor-pointer"
            title="Reset Camera to Wayanad Overview"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-xl bg-[#07110C]/90 backdrop-blur-xl border border-cyan-500/30 text-pine-muted hover:text-white hover:border-cyan-400 shadow-xl transition-all cursor-pointer"
              title="Toggle Fullscreen Map Mode"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Layer Panel Expand Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-2.5 py-1.5 rounded-xl backdrop-blur-xl border font-bold text-[11px] flex items-center gap-1.5 shadow-xl transition-all cursor-pointer ${
              isOpen
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                : 'bg-[#07110C]/90 text-cyan-300 border-cyan-500/30 hover:bg-black/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>MAP LAYERS & PRESETS</span>
            {isOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

        </div>
      )}

      {/* 3. EXPANDABLE MAPS, LAYERS & EXAGGERATION DRAWER */}
      {mapMode === '3D' && isOpen && (
        <div className="w-72 p-3 bg-[#07110C]/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl shadow-2xl space-y-3 animate-fadeIn max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* A. Base Maps & Historical Imagery */}
          {onChangeBaseStyle && (
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1.5">
                Base Maps & Historical Satellite
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onChangeBaseStyle('dark')}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    baseStyle === 'dark'
                      ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm'
                      : 'bg-black/40 text-pine-muted border-cyan-500/20 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-3 h-3 text-cyan-300" />
                  <span>Dark Canvas</span>
                </button>

                <button
                  onClick={() => onChangeBaseStyle('satellite')}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    baseStyle === 'satellite'
                      ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm'
                      : 'bg-black/40 text-pine-muted border-cyan-500/20 hover:text-white'
                  }`}
                >
                  <Satellite className="w-3 h-3 text-cyan-300" />
                  <span>Esri Satellite</span>
                </button>

                <button
                  onClick={() => onChangeBaseStyle('terrain')}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    baseStyle === 'terrain'
                      ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm'
                      : 'bg-black/40 text-pine-muted border-cyan-500/20 hover:text-white'
                  }`}
                >
                  <Mountain className="w-3 h-3 text-cyan-300" />
                  <span>Topo Terrain</span>
                </button>

                <button
                  onClick={() => onChangeBaseStyle('street')}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    baseStyle === 'street'
                      ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm'
                      : 'bg-black/40 text-pine-muted border-cyan-500/20 hover:text-white'
                  }`}
                >
                  <Route className="w-3 h-3 text-cyan-300" />
                  <span>Street Grid</span>
                </button>
              </div>
            </div>
          )}

          {/* B. Thematic Map Presets */}
          {onApplyPreset && (
            <div className="border-t border-cyan-500/20 pt-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1.5">
                Thematic Map Presets
              </span>
              <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                <button
                  onClick={() => onApplyPreset('red-zone')}
                  className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-600/60 rounded text-rose-200 font-bold text-left cursor-pointer transition-colors"
                >
                  🔴 Red-Zone Cadastral
                </button>
                <button
                  onClick={() => onApplyPreset('runout')}
                  className="p-1.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-600/60 rounded text-amber-200 font-bold text-left cursor-pointer transition-colors"
                >
                  🌊 2024 Event Runout
                </button>
                <button
                  onClick={() => onApplyPreset('resettlement')}
                  className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/60 rounded text-emerald-200 font-bold text-left cursor-pointer transition-colors"
                >
                  🛡️ CCAS Safe Lands
                </button>
                <button
                  onClick={() => onApplyPreset('all')}
                  className="p-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-600/60 rounded text-cyan-200 font-bold text-left cursor-pointer transition-colors"
                >
                  ✨ Full Intelligence
                </button>
              </div>
            </div>
          )}

          {/* C. Terrain Elevation Exaggeration */}
          <div className="border-t border-cyan-500/20 pt-2">
            <div className="flex items-center justify-between mb-1.5 text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              <span>Terrain Exaggeration</span>
              <span className="text-white font-bold">{terrainExaggeration}x</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[1.0, 1.5, 2.0].map((val) => (
                <button
                  key={val}
                  onClick={() => onChangeExaggeration(val)}
                  className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    terrainExaggeration === val
                      ? 'bg-cyan-600 text-white border-cyan-300 shadow-sm'
                      : 'bg-black/40 text-pine-muted border-cyan-500/20 hover:text-white'
                  }`}
                >
                  {val}x
                </button>
              ))}
            </div>
          </div>

          {/* D. 3D Disaster Layers Toggle Checkboxes */}
          <div className="space-y-1.5 border-t border-cyan-500/20 pt-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
              3D Disaster Intelligence Layers
            </span>

            {/* 3D Hazard Extrusions */}
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-cyan-500/15 cursor-pointer text-[11px] transition-colors">
              <div className="flex items-center gap-2 text-white">
                <Mountain className="w-3.5 h-3.5 text-rose-400" />
                <span>3D Hazard Extrusion</span>
              </div>
              <input
                type="checkbox"
                checked={layers.showExtrusion}
                onChange={() => onToggleLayer('showExtrusion')}
                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Landslide Runouts */}
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-cyan-500/15 cursor-pointer text-[11px] transition-colors">
              <div className="flex items-center gap-2 text-white">
                <Mountain className="w-3.5 h-3.5 text-amber-400" />
                <span>Landslide Runouts</span>
              </div>
              <input
                type="checkbox"
                checked={layers.showLandslides}
                onChange={() => onToggleLayer('showLandslides')}
                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Flood Inundation Lowlands */}
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-cyan-500/15 cursor-pointer text-[11px] transition-colors">
              <div className="flex items-center gap-2 text-white">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>Flood Lowlands</span>
              </div>
              <input
                type="checkbox"
                checked={layers.showFloods}
                onChange={() => onToggleLayer('showFloods')}
                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* 3D Population Density Columns */}
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-cyan-500/15 cursor-pointer text-[11px] transition-colors">
              <div className="flex items-center gap-2 text-white">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>3D Population Towers</span>
              </div>
              <input
                type="checkbox"
                checked={layers.showPopulation}
                onChange={() => onToggleLayer('showPopulation')}
                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Safe Resettlement Sites */}
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-cyan-500/15 cursor-pointer text-[11px] transition-colors">
              <div className="flex items-center gap-2 text-white">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>Safe Resettlement Sites</span>
              </div>
              <input
                type="checkbox"
                checked={layers.showSites}
                onChange={() => onToggleLayer('showSites')}
                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Evacuation Corridors */}
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-cyan-500/15 cursor-pointer text-[11px] transition-colors">
              <div className="flex items-center gap-2 text-white">
                <Route className="w-3.5 h-3.5 text-cyan-400" />
                <span>Evacuation Corridors</span>
              </div>
              <input
                type="checkbox"
                checked={layers.showRoutes}
                onChange={() => onToggleLayer('showRoutes')}
                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Live Weather Atmosphere */}
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 hover:bg-black/50 border border-cyan-500/15 cursor-pointer text-[11px] transition-colors">
              <div className="flex items-center gap-2 text-white">
                <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
                <span>Atmospheric Rainfall</span>
              </div>
              <input
                type="checkbox"
                checked={layers.showWeather}
                onChange={() => onToggleLayer('showWeather')}
                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
              />
            </label>

          </div>

        </div>
      )}

    </div>
  );
};
