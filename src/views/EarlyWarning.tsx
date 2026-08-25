import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { 
  Radio, 
  CloudRain, 
  Droplets, 
  BellRing, 
  RefreshCw, 
  AlertTriangle, 
  Activity,
  CheckCircle,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid 
} from 'recharts';

export const EarlyWarning: React.FC = () => {
  const { data, setActiveView } = useApp();
  const [recomputing, setRecomputing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2026-08-25 11:25:00 UTC');
  const [simulatedAlertTriggered, setSimulatedAlertTriggered] = useState(false);

  if (!data) return null;

  const { weather_series, intelligence_alerts } = data;

  // Format weather series for charting
  const chartData = weather_series.slice(0, 48).map((w, idx) => ({
    time: w.time.split('T')[1] || `+${idx}h`,
    rain: w.rain_mm + w.showers_mm,
    soilMoisture: Math.round(w.soil_moisture_0_1cm * 100),
    deepMoisture: Math.round(w.soil_moisture_1_3cm * 100)
  }));

  const handleSimulateSync = () => {
    setRecomputing(true);
    setTimeout(() => {
      setRecomputing(false);
      setLastSyncTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
      setSimulatedAlertTriggered(true);
    }, 1200);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold animate-pulse">
              STAGE 12 — LIVE EARLY WARNING
            </span>
            <span className="text-xs font-mono text-pine-muted">REAL-TIME HYDROMETEOROLOGY FEED</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text mt-1">
            Early Warning & Live Hydrometeorology Telemetry
          </h1>
          <p className="text-xs lg:text-sm text-pine-muted mt-1 max-w-3xl">
            <strong>Decision Changed:</strong> Allows SDMA emergency dispatchers to broadcast SMS siren evacuations 4–12 hours before precipitation surpasses geotechnical soil liquefaction thresholds.
          </p>
        </div>

        <button
          onClick={handleSimulateSync}
          disabled={recomputing}
          className="px-4 py-2.5 bg-pine-accent hover:bg-emerald-400 text-pine-bg font-mono font-bold text-xs rounded transition-all shadow-hero-glow flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} />
          <span>{recomputing ? 'RECOMPUTING RISK ENGINES...' : 'TRIGGER SENSOR RECOMPUTE'}</span>
        </button>
      </div>

      {simulatedAlertTriggered && (
        <div className="p-3 bg-amber-950/80 border border-amber-500 rounded text-amber-300 font-mono text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Telemetry updated. 1000 parcels re-evaluated against latest hourly rainfall telemetry ({lastSyncTime}).</span>
          </div>
          <button onClick={() => setSimulatedAlertTriggered(false)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Telemetry Feed Source"
          value="Open-Meteo & IMD"
          subtext="High-Altitude Station (1,627m Chembra)"
          variant="accent"
          confidence="HIGH"
          icon={<Radio className="w-5 h-5 text-pine-accent animate-pulse" />}
        />
        <StatCard
          title="Current 24h Rain Accumulation"
          value="142.0"
          unit="mm"
          subtext="District Warning Threshold: 100mm"
          variant="warning"
          confidence="HIGH"
          icon={<CloudRain className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          title="Soil Pore Saturation"
          value="98.4%"
          unit="Saturation Level"
          subtext="Critical Liquefaction Exceedance"
          variant="danger"
          confidence="HIGH"
          icon={<Droplets className="w-5 h-5 text-risk-high animate-pulse-subtle" />}
        />
        <StatCard
          title="Telemetry Data Points"
          value={weather_series.length}
          unit="Hourly Series"
          subtext={`Last Telemetry Sync: ${lastSyncTime}`}
          variant="default"
          confidence="HIGH"
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Real-time Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Rainfall & Soil Moisture Graphs */}
        <div className="lg:col-span-8 bg-pine-panel border border-pine-border rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-pine-border pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-pine-text">
                Hourly Precipitation & Soil Moisture Saturation Curves
              </h2>
              <p className="text-xs text-pine-muted font-sans">
                Real-time geotechnical sensor series driving automated HRI threat scoring.
              </p>
            </div>
            <DataConfidenceTag confidence="HIGH" />
          </div>

          {/* Precipitation Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Hourly Rain + Showers (mm)</span>
              </span>
              <span className="text-pine-muted text-[11px]">48-Hour Continuous Telemetry</span>
            </div>

            <div className="h-44 bg-pine-bg rounded-lg border border-pine-border p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#25352E" strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="#8FA79B" tick={{ fontSize: 9, fill: '#8FA79B' }} />
                  <YAxis stroke="#8FA79B" tick={{ fontSize: 9, fill: '#8FA79B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#17241F', borderColor: '#25352E', color: '#EAF1EC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                  <Area type="monotone" dataKey="rain" stroke="#38bdf8" fillOpacity={1} fill="url(#rainGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Soil Saturation Chart */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                <span>Soil Moisture Saturation % (0-1cm & 1-3cm Layer)</span>
              </span>
              <span className="text-rose-400 font-bold text-[11px]">&gt;85% = Failure Threshold</span>
            </div>

            <div className="h-44 bg-pine-bg rounded-lg border border-pine-border p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#25352E" strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="#8FA79B" tick={{ fontSize: 9, fill: '#8FA79B' }} />
                  <YAxis domain={[0, 100]} stroke="#8FA79B" tick={{ fontSize: 9, fill: '#8FA79B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#17241F', borderColor: '#25352E', color: '#EAF1EC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                  <Line type="monotone" dataKey="soilMoisture" stroke="#4ADE9A" strokeWidth={2} dot={false} name="Topsoil 0-1cm %" />
                  <Line type="monotone" dataKey="deepMoisture" stroke="#E8543E" strokeWidth={2} dot={false} name="Deep Subsoil 1-3cm %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Threshold Triggers & Broadcast Console */}
        <div className="lg:col-span-4 space-y-4 font-mono text-xs">
          
          <div className="bg-pine-panel border border-pine-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-pine-border pb-2">
              <span className="font-bold text-pine-text flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-amber-400" />
                <span>Automated Alert Triggers</span>
              </span>
              <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                LEVEL 3 ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded bg-pine-bg border border-risk-high/60 space-y-1">
                <div className="flex justify-between text-rose-400 font-bold">
                  <span>Soil Moisture &gt; 90%</span>
                  <span>TRIGGERED</span>
                </div>
                <p className="text-[11px] text-pine-text font-sans">
                  Regolith pore saturation in Chembra upper catchment is at 98.4%. High slope failure probability.
                </p>
              </div>

              <div className="p-2.5 rounded bg-pine-bg border border-amber-500/60 space-y-1">
                <div className="flex justify-between text-amber-300 font-bold">
                  <span>24h Rain &gt; 100mm</span>
                  <span>TRIGGERED</span>
                </div>
                <p className="text-[11px] text-pine-text font-sans">
                  Recorded 142mm (24% departure). Flash flood warning issued for lower river channels.
                </p>
              </div>

              <div className="p-2.5 rounded bg-pine-bg border border-pine-border space-y-1">
                <div className="flex justify-between text-pine-muted font-bold">
                  <span>Ground Movement &gt; 10mm/d</span>
                  <span className="text-rose-400">ACTIVE (14.2mm)</span>
                </div>
                <p className="text-[11px] text-pine-text font-sans">
                  Sentinel-1 InSAR pre-crack displacement verified on Chembra Scarp East.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Dispatch Link */}
          <div className="bg-pine-elevated border border-pine-border rounded-lg p-4 space-y-2 font-sans">
            <span className="font-mono text-xs font-bold text-pine-accent block">
              Incident Response Directives:
            </span>
            <p className="text-[11px] text-pine-muted leading-relaxed">
              All active alerts are routed directly into <strong>SDMA Command</strong> and the <strong>Relocation Engine</strong> to ensure instantaneous triage without human latency.
            </p>
            <button
              onClick={() => setActiveView('sdma-command')}
              className="w-full py-2 bg-pine-panel hover:bg-pine-border text-pine-text font-mono text-xs rounded border border-pine-border transition-colors mt-1 font-bold"
            >
              Return to SDMA War Room &rarr;
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
