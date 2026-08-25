import React from 'react';
import { FactorBreakdown as FactorType } from '../types';

interface Props {
  factors: FactorType;
  totalScore: number;
  className?: string;
}

export const FactorBreakdown: React.FC<Props> = ({ factors, totalScore, className = '' }) => {
  const items = [
    { label: 'Terrain Slope Gradient (30%)', value: factors.slope_contribution, max: 30, color: 'bg-amber-500' },
    { label: '24h Precipitation Intensity (25%)', value: factors.rain_contribution, max: 25, color: 'bg-cyan-500' },
    { label: 'GSI Landslide Susceptibility (25%)', value: factors.landslide_contribution, max: 25, color: 'bg-rose-500' },
    { label: 'Floodplain / Inundation Depth (10%)', value: factors.flood_contribution, max: 10, color: 'bg-blue-500' },
    { label: 'Soil Moisture & Pore Pressure (10%)', value: factors.soil_contribution, max: 10, color: 'bg-emerald-500' },
  ];

  return (
    <div className={`space-y-2.5 p-3 rounded-md bg-pine-elevated/80 border border-pine-border ${className}`}>
      <div className="flex items-center justify-between pb-1.5 border-b border-pine-border text-xs font-mono">
        <span className="text-pine-muted font-medium uppercase tracking-wider">HRI Mathematical Factor Decomposition</span>
        <span className="text-pine-accent font-bold">Sum: {totalScore.toFixed(1)} / 100</span>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const pct = Math.min(100, Math.max(0, (item.value / item.max) * 100));
          return (
            <div key={i} className="text-xs">
              <div className="flex justify-between items-center text-pine-text mb-1">
                <span className="font-sans text-[11px] text-pine-muted">{item.label}</span>
                <span className="font-mono font-medium text-[11px]">+{item.value.toFixed(1)} pts</span>
              </div>
              <div className="w-full h-1.5 bg-pine-bg rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-300`} 
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-[10px] text-pine-muted/80 pt-1 font-mono">
        HRI = 0.30(Slope) + 0.25(Rain) + 0.25(GSI_Landslide) + 0.10(Flood) + 0.10(SoilMoisture)
      </p>
    </div>
  );
};
