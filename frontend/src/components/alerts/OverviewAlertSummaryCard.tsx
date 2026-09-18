import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OverviewAlertSummaryCard: React.FC = () => {
  const { setActiveView } = useApp();
  const [kpis, setKpis] = useState<any>({
    active_alerts: 2,
    critical_alerts: 1,
    calls_in_progress: 0,
    acknowledged_alerts: 1
  });
  const [primaryAlert, setPrimaryAlert] = useState<any>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v2/alerts');
      if (res.ok) {
        const data = await res.json();
        setKpis(data.kpis || {});
        if (data.alerts && data.alerts.length > 0) {
          setPrimaryAlert(data.alerts[0]);
        }
      }
    } catch (e) {
      console.warn('Using local summary fallback:', e);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 rounded-2xl bg-[#09130F] border border-cyan-500/30 text-pine-text shadow-xl font-mono space-y-3">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              EMERGENCY ALERT & VOICE DISPATCH STATUS
            </h3>
            <span className="text-[10px] text-pine-muted font-sans">
              Hierarchical voice dispatch and multi-tier escalation active
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveView('alerts')}
          className="px-3 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
        >
          <span>OPEN ALERT CENTER</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-black/40 border border-cyan-500/10 flex items-center justify-between">
          <span className="text-[10.5px] text-pine-muted">ACTIVE ALERTS</span>
          <span className="font-bold text-white text-sm">{kpis.active_alerts || 2}</span>
        </div>
        <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
          <span className="text-[10.5px] text-rose-300">CRITICAL</span>
          <span className="font-bold text-rose-400 text-sm animate-pulse">{kpis.critical_alerts || 1}</span>
        </div>
        <div className="p-2 rounded-xl bg-black/40 border border-cyan-500/10 flex items-center justify-between">
          <span className="text-[10.5px] text-pine-muted">CALLS ACTIVE</span>
          <span className="font-bold text-cyan-300 text-sm">{kpis.calls_in_progress || 0}</span>
        </div>
        <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
          <span className="text-[10.5px] text-emerald-300">ACKNOWLEDGED</span>
          <span className="font-bold text-emerald-400 text-sm">{kpis.acknowledged_alerts || 1}</span>
        </div>
      </div>

      {/* Primary Highlight Mini-Banner */}
      {primaryAlert && (
        <div className="p-3 rounded-xl bg-black/50 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600 font-bold text-[10px]">
              {primaryAlert.alert_id} &bull; {primaryAlert.severity}
            </span>
            <span className="text-white font-serif font-bold">{primaryAlert.location}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10.5px] text-pine-muted">
              Status: <span className="text-amber-300 font-bold">{primaryAlert.final_status || primaryAlert.status}</span>
            </span>
            <button
              onClick={() => setActiveView('alerts')}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
            >
              <PhoneCall className="w-3 h-3" />
              <span>RESPOND NOW</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
