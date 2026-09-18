import React, { useState } from 'react';
import India from '@svg-maps/india';
import { HazardType } from '../../types';
import { ArrowRight } from 'lucide-react';

interface SvgLocation {
  name: string;
  id: string;
  path: string;
}

interface SvgMap {
  label: string;
  viewBox: string;
  locations: SvgLocation[];
}

const IndiaData = India as unknown as SvgMap;

interface IndiaDisasterMapProps {
  theme: 'light' | 'dark';
  onSelectHazard: (hazard: HazardType) => void;
  className?: string;
}

interface DisasterNode {
  id: HazardType;
  name: string;
  location: string;
  state: string;
  stateId: string;
  x: number;
  y: number;
  color: string;
  haloColor: string;
  badge: string;
  badgeBg: string;
  badgeBorder: string;
  hazardLabel: string;
}

export const IndiaDisasterMap: React.FC<IndiaDisasterMapProps> = ({
  theme,
  onSelectHazard,
  className = ''
}) => {
  const [hoveredHazard, setHoveredHazard] = useState<HazardType | null>(null);

  const disasterNodes: DisasterNode[] = [
    {
      id: 'cloudburst',
      name: 'Cloudburst & Flash Flood',
      location: 'Kedarnath Valley',
      state: 'Uttarakhand',
      stateId: 'ut',
      x: 228,
      y: 175,
      color: '#F59E0B',
      haloColor: 'rgba(245, 158, 11, 0.32)',
      badge: 'Flash Flood Threat',
      badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
      badgeBorder: 'border-amber-400/40',
      hazardLabel: 'Cloudburst'
    },
    {
      id: 'flood',
      name: 'River Flood & Breach',
      location: 'Dibrugarh & Basin',
      state: 'Assam',
      stateId: 'as',
      x: 528,
      y: 255,
      color: '#2563EB',
      haloColor: 'rgba(37, 99, 235, 0.32)',
      badge: 'High Inundation Risk',
      badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
      badgeBorder: 'border-blue-400/40',
      hazardLabel: 'Flood'
    },
    {
      id: 'coastal-erosion',
      name: 'Coastal Scarp Retreat',
      location: 'Podampeta Coast',
      state: 'Odisha',
      stateId: 'or',
      x: 348,
      y: 422,
      color: '#0D9488',
      haloColor: 'rgba(13, 148, 136, 0.32)',
      badge: 'Shoreline Erosion',
      badgeBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-300',
      badgeBorder: 'border-teal-400/40',
      hazardLabel: 'Coastal'
    },
    {
      id: 'landslide',
      name: 'Landslide & Debris Flow',
      location: 'Meppadi, Wayanad',
      state: 'Kerala',
      stateId: 'kl',
      x: 168,
      y: 588,
      color: '#E11D48',
      haloColor: 'rgba(225, 29, 72, 0.32)',
      badge: 'Critical Red Zone',
      badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
      badgeBorder: 'border-rose-400/40',
      hazardLabel: 'Landslide'
    }
  ];

  const activeNode = disasterNodes.find(n => n.id === hoveredHazard);

  // Background dotted grid lines (matching reference image)
  const hGridLines = [100, 220, 340, 460, 580];
  const vGridLines = [100, 200, 300, 400, 500];

  const isLight = theme === 'light';

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* SVG Map Canvas with High-Resolution Vector Precision */}
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 612 696"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Drop Shadow for the Entire India Landmass */}
            <filter id="mapElevationShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow 
                dx="0" 
                dy="6" 
                stdDeviation="12" 
                floodColor={isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(0, 0, 0, 0.45)'} 
              />
            </filter>

            {/* Glowing Halos for the 4 Tactical Crisis Nodes */}
            {disasterNodes.map(node => (
              <radialGradient key={`grad-${node.id}`} id={`haloGrad-${node.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={node.color} stopOpacity="0.55" />
                <stop offset="60%" stopColor={node.color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={node.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Dotted Grid Background (Exact match to reference image) */}
          <g className="pointer-events-none opacity-40 dark:opacity-25">
            {hGridLines.map(y => (
              <line
                key={`h-${y}`}
                x1="20"
                y1={y}
                x2="592"
                y2={y}
                stroke={isLight ? '#94A3B8' : '#334155'}
                strokeDasharray="4 6"
                strokeWidth="1"
              />
            ))}
            {vGridLines.map(x => (
              <line
                key={`v-${x}`}
                x1={x}
                y1="20"
                x2={x}
                y2="676"
                stroke={isLight ? '#94A3B8' : '#334155'}
                strokeDasharray="4 6"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* India States Geometry Group */}
          <g filter="url(#mapElevationShadow)">
            {IndiaData.locations.map((loc: SvgLocation) => {
              const matchingNode = disasterNodes.find(n => n.stateId === loc.id);
              const isHovered = hoveredHazard && matchingNode && hoveredHazard === matchingNode.id;

              // Color tuning for crisp, clarity-enhanced presentation
              let fillColor = isLight ? '#E8EEF5' : '#14212D';
              if (isHovered && matchingNode) {
                fillColor = isLight ? '#D7E5F3' : '#1B2C3C';
              } else if (matchingNode) {
                fillColor = isLight ? '#E3ECF6' : '#162534';
              }

              return (
                <path
                  key={loc.id}
                  id={`state-${loc.id}`}
                  d={loc.path}
                  fill={fillColor}
                  stroke={isLight ? '#FFFFFF' : '#233547'}
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    if (matchingNode) onSelectHazard(matchingNode.id);
                  }}
                  onMouseEnter={() => {
                    if (matchingNode) setHoveredHazard(matchingNode.id);
                  }}
                  onMouseLeave={() => {
                    if (matchingNode) setHoveredHazard(null);
                  }}
                >
                  <title>{loc.name}{matchingNode ? ` (${matchingNode.name})` : ''}</title>
                </path>
              );
            })}
          </g>

          {/* The 4 Tactical Crisis Nodes with Glowing Halos */}
          {disasterNodes.map(node => {
            const isHovered = hoveredHazard === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectHazard(node.id)}
                onMouseEnter={() => setHoveredHazard(node.id)}
                onMouseLeave={() => setHoveredHazard(null)}
              >
                {/* Outermost Pulsing Halo Glow (matching reference image) */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 34 : 26}
                  fill={`url(#haloGrad-${node.id})`}
                  className="animate-pulse transition-all duration-300"
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                />

                {/* Secondary Soft Translucent Ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 20 : 16}
                  fill={node.haloColor}
                  className="transition-all duration-200"
                />

                {/* Thin Halo Perimeter Ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 20 : 16}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="1"
                  strokeOpacity={isHovered ? 0.9 : 0.5}
                  strokeDasharray={isHovered ? 'none' : '2 3'}
                />

                {/* Crisp Center Solid Circle with Pure White Border */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 9.5 : 8}
                  fill={node.color}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-all duration-200 shadow-md"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Callout on Hover */}
        {activeNode && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: `${(activeNode.x / 612) * 100}%`,
              top: `${(activeNode.y / 696) * 100}%`,
              transform: 'translate(-50%, -130%)'
            }}
          >
            <div className={`px-3 py-2 rounded-xl shadow-xl border text-xs whitespace-nowrap backdrop-blur-md ${
              isLight 
                ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50' 
                : 'bg-[#0E1A26]/95 border-[#233547] text-white shadow-black/60'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeNode.color }} />
                <span>{activeNode.location}</span>
                <span className="text-[10px] font-mono text-slate-400">({activeNode.state})</span>
              </div>
              <div className="flex items-center justify-between gap-3 mt-1 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">{activeNode.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold border ${activeNode.badgeBg} ${activeNode.badgeBorder}`}>
                  {activeNode.badge}
                </span>
              </div>
              <div className="mt-1 text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span>Click to enter theater</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
