import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/RiskBadge';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { AREA_HAZARD_REGISTRY, SAFE_SITES_REGISTRY } from '../data/areaHazardProfiles';
import { 
  Columns3, 
  Sparkles, 
  ArrowRight, 
  BarChart2, 
  ShieldAlert, 
  CheckCircle2,
  Users,
  Mountain,
  Waves,
  CloudRain,
  Compass,
  Building2,
  Activity,
  PieChart as PieIcon,
  TrendingUp,
  Radio
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Line
} from 'recharts';

export const AreaComparison: React.FC = () => {
  const { data, setSelectedVillage, setActiveView } = useApp();
  const [activeChartType, setActiveChartType] = useState<'multi-hazard' | 'radar-fingerprint' | 'population-capacity' | 'rain-slope-curve'>('multi-hazard');

  if (!data) return null;

  const { villages } = data;
  const allAreasList = Object.values(AREA_HAZARD_REGISTRY);

  // 1. Multi-Hazard Bar Chart Data
  const allAreasBarData = allAreasList.map(a => ({
    name: a.name.split(' ')[0],
    'Landslide Risk %': a.landslideProb,
    'Flood Risk %': a.floodProb,
    'Slope Angle (°)': a.slopeDeg,
    '24h Rain (mm)': Math.round(a.rainfall24h)
  }));

  // 2. Multi-Hazard Radar Fingerprint Data
  const radarData = [
    { subject: 'Landslide %', Meppadi: 94, Kalpetta: 12, Achooranam: 56, Kottathara: 22, fullMark: 100 },
    { subject: 'Flood Risk %', Meppadi: 86, Kalpetta: 14, Achooranam: 34, Kottathara: 78, fullMark: 100 },
    { subject: 'Slope Steepness', Meppadi: 96, Kalpetta: 18, Achooranam: 46, Kottathara: 16, fullMark: 100 },
    { subject: '24h Rainfall %', Meppadi: 100, Kalpetta: 45, Achooranam: 62, Kottathara: 54, fullMark: 100 },
    { subject: 'Soil Saturation %', Meppadi: 98, Kalpetta: 42, Achooranam: 71, Kottathara: 82, fullMark: 100 },
    { subject: 'Disaster History %', Meppadi: 95, Kalpetta: 15, Achooranam: 48, Kottathara: 68, fullMark: 100 }
  ];

  // 3. Population Distribution Donut Chart Data
  const populationPieData = [
    { name: 'Meppadi Red-Zone Pop', value: 4800, color: '#E8543E' },
    { name: 'Achooranam Slope Pop', value: 1240, color: '#E8A63E' },
    { name: 'Kottathara Riverbank Pop', value: 890, color: '#FBBF24' },
    { name: 'Kuppadithara Flatland Pop', value: 320, color: '#34D399' },
    { name: 'Kalpetta Safe Holding Cap', value: 2200, color: '#38BDF8' }
  ];

  // 4. Rain & Soil Moisture Saturation Curve Data
  const rainSaturationCurveData = [
    { rainMm: '50mm', 'Soil Saturation %': 28, 'Landslide Trigger %': 5, 'Critical Threshold': 80 },
    { rainMm: '100mm', 'Soil Saturation %': 45, 'Landslide Trigger %': 14, 'Critical Threshold': 80 },
    { rainMm: '150mm', 'Soil Saturation %': 65, 'Landslide Trigger %': 38, 'Critical Threshold': 80 },
    { rainMm: '200mm', 'Soil Saturation %': 82, 'Landslide Trigger %': 68, 'Critical Threshold': 80 },
    { rainMm: '250mm', 'Soil Saturation %': 93, 'Landslide Trigger %': 88, 'Critical Threshold': 80 },
    { rainMm: '285mm (Meppadi)', 'Soil Saturation %': 98, 'Landslide Trigger %': 94, 'Critical Threshold': 80 }
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto font-mono text-xs">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              MODULE 11 — MULTI-CHART VISUAL ANALYTICS
            </span>
            <span className="text-[11px] text-pine-muted">INTERACTIVE HAZARD & POPULATION VISUALIZATIONS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text mt-1">
            Visual Hazard Diagnostics & Area Comparison Studio
          </h1>
          <p className="text-xs text-pine-muted font-sans mt-1 max-w-3xl">
            Explore 4 dynamic visualization charts comparing multi-hazard parameters, radar diagnostic fingerprints, population distribution, and rain trigger curves.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedVillage('Meppadi');
            setActiveView('relocation-engine');
          }}
          className="px-4 py-2 bg-risk-high hover:bg-rose-600 text-white font-bold text-xs rounded transition-all flex items-center gap-2 shadow-panel shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>RELOCATE MEPPADI FIRST</span>
        </button>
      </div>

      {/* Interactive Multi-Chart Visualizer Panel */}
      <div className="bg-pine-panel border border-pine-border rounded-xl p-5 space-y-4 shadow-panel">
        
        {/* Chart Selector Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pine-border pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveChartType('multi-hazard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeChartType === 'multi-hazard'
                  ? 'bg-pine-accent text-pine-bg shadow-sm'
                  : 'bg-pine-elevated text-pine-muted hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>1. Multi-Hazard Bar Chart</span>
            </button>

            <button
              onClick={() => setActiveChartType('radar-fingerprint')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeChartType === 'radar-fingerprint'
                  ? 'bg-pine-accent text-pine-bg shadow-sm'
                  : 'bg-pine-elevated text-pine-muted hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>2. Multi-Hazard Radar Spider</span>
            </button>

            <button
              onClick={() => setActiveChartType('population-capacity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeChartType === 'population-capacity'
                  ? 'bg-pine-accent text-pine-bg shadow-sm'
                  : 'bg-pine-elevated text-pine-muted hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>3. Population & Capacity Donut</span>
            </button>

            <button
              onClick={() => setActiveChartType('rain-slope-curve')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeChartType === 'rain-slope-curve'
                  ? 'bg-pine-accent text-pine-bg shadow-sm'
                  : 'bg-pine-elevated text-pine-muted hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>4. Rain Saturation Trigger Curve</span>
            </button>
          </div>

          <DataConfidenceTag confidence="HIGH" />
        </div>

        {/* Dynamic Chart Container */}
        <div className="h-80 bg-pine-bg rounded-xl border border-pine-border p-4">
          
          {/* Chart 1: Multi-Hazard Bar Chart */}
          {activeChartType === 'multi-hazard' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allAreasBarData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#25352E" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#8FA79B" tick={{ fontSize: 11, fill: '#8FA79B', fontFamily: 'Space Grotesk' }} />
                <YAxis stroke="#8FA79B" tick={{ fontSize: 10, fill: '#8FA79B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#17241F', borderColor: '#25352E', color: '#EAF1EC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk' }} />
                <Bar dataKey="Landslide Risk %" fill="#E8543E" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Flood Risk %" fill="#38BDF8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Slope Angle (°)" fill="#FBBF24" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Chart 2: Radar Spider Fingerprint Chart */}
          {activeChartType === 'radar-fingerprint' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#25352E" />
                <PolarAngleAxis dataKey="subject" stroke="#8FA79B" tick={{ fill: '#8FA79B', fontSize: 10, fontFamily: 'Space Grotesk' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#25352E" tick={{ fill: '#8FA79B', fontSize: 9 }} />
                <Radar name="Meppadi (Epicenter)" dataKey="Meppadi" stroke="#E8543E" fill="#E8543E" fillOpacity={0.45} />
                <Radar name="Kalpetta (Safe Zone)" dataKey="Kalpetta" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.35} />
                <Radar name="Achooranam (Slope)" dataKey="Achooranam" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.25} />
                <Radar name="Kottathara (Flood)" dataKey="Kottathara" stroke="#34D399" fill="#34D399" fillOpacity={0.25} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk' }} />
                <Tooltip contentStyle={{ backgroundColor: '#17241F', borderColor: '#25352E', color: '#EAF1EC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {/* Chart 3: Population & Capacity Donut Chart */}
          {activeChartType === 'population-capacity' && (
            <div className="flex flex-col md:flex-row items-center h-full gap-4">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={populationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {populationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#17241F', borderColor: '#25352E', color: '#EAF1EC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-2 text-[11px] font-mono">
                <div className="text-white font-bold text-xs border-b border-pine-border pb-1">
                  Population Load vs Holding Capacity Distribution:
                </div>
                {populationPieData.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-pine-muted">{p.name}</span>
                    </span>
                    <strong className="text-white">{p.value.toLocaleString()} persons</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart 4: Rain Saturation Trigger Curve */}
          {activeChartType === 'rain-slope-curve' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainSaturationCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="saturationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="triggerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8543E" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#E8543E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#25352E" strokeDasharray="3 3" />
                <XAxis dataKey="rainMm" stroke="#8FA79B" tick={{ fontSize: 10, fill: '#8FA79B', fontFamily: 'Space Grotesk' }} />
                <YAxis stroke="#8FA79B" tick={{ fontSize: 10, fill: '#8FA79B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#17241F', borderColor: '#25352E', color: '#EAF1EC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk' }} />
                <Area type="monotone" dataKey="Soil Saturation %" stroke="#38BDF8" fillOpacity={1} fill="url(#saturationGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Landslide Trigger %" stroke="#E8543E" fillOpacity={1} fill="url(#triggerGrad)" strokeWidth={2} />
                <Line type="monotone" dataKey="Critical Threshold" stroke="#FBBF24" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}

        </div>
      </div>

      {/* Grid of Distinct Area Hazard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAreasList.map((area) => {
          const isEpicenter = area.category === 'Disaster Epicenter';
          const isSafe = area.category === 'Urban Centre' || area.category === 'Flatland Buffer';

          return (
            <div
              key={area.name}
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                isEpicenter 
                  ? 'bg-rose-950/25 border-rose-800 shadow-hero-glow' 
                  : isSafe 
                  ? 'bg-emerald-950/20 border-emerald-800/60' 
                  : 'bg-pine-panel border-pine-border hover:border-pine-accent/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-pine-border pb-2">
                <div>
                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isEpicenter ? 'bg-rose-900 text-rose-200' : isSafe ? 'bg-emerald-900 text-emerald-200' : 'bg-pine-elevated text-pine-muted'
                  }`}>
                    {area.category}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-pine-text mt-1">
                    {area.name}
                  </h3>
                </div>
                <RiskBadge level={area.riskLevel} score={area.riskScore} size="sm" />
              </div>

              {/* Distinct Hazard Metrics Matrix */}
              <div className="grid grid-cols-2 gap-2 bg-pine-bg p-2.5 rounded-lg border border-pine-border/60 text-[11px]">
                <div>
                  <span className="text-pine-muted text-[10px] block">Landslide Risk:</span>
                  <strong className="text-rose-400 font-mono text-xs">{area.landslideProb}%</strong>
                </div>
                <div>
                  <span className="text-pine-muted text-[10px] block">Flood Risk:</span>
                  <strong className="text-cyan-400 font-mono text-xs">{area.floodProb}%</strong>
                </div>
                <div>
                  <span className="text-pine-muted text-[10px] block">Slope Gradient:</span>
                  <strong className="text-amber-400 font-mono text-xs">{area.slopeDeg}°</strong>
                </div>
                <div>
                  <span className="text-pine-muted text-[10px] block">24h Rainfall:</span>
                  <strong className="text-blue-400 font-mono text-xs">{area.rainfall24h} mm</strong>
                </div>
                <div>
                  <span className="text-pine-muted text-[10px] block">Soil Moisture:</span>
                  <strong className="text-emerald-400 font-mono text-xs">{area.soilMoisture}%</strong>
                </div>
                <div>
                  <span className="text-pine-muted text-[10px] block">Disaster History:</span>
                  <strong className="text-white font-mono text-xs">{area.historyFreq}%</strong>
                </div>
              </div>

              {/* Primary Hazard Description */}
              <p className="text-[11px] text-pine-muted font-sans leading-relaxed line-clamp-2">
                {area.summary}
              </p>

              <div className="pt-2 border-t border-pine-border/60 flex items-center justify-between">
                <div className="flex flex-col text-[10px]">
                  <span className="text-white font-mono font-bold">
                    {area.censusPopulation.toLocaleString()} Total Pop
                  </span>
                  <span className="text-pine-accent">
                    {area.exposedPopulation.toLocaleString()} {area.category === 'Urban Centre' || area.category === 'Flatland Buffer' ? 'safe capacity' : 'exposed in red-zone'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedVillage(area.name.split(' ')[0]);
                    setActiveView('red-zone-map');
                  }}
                  className="px-2.5 py-1.5 bg-pine-elevated hover:bg-pine-accent hover:text-pine-bg text-pine-text rounded text-[10px] font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>View On Map</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
