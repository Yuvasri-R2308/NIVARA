import React from 'react';
import { 
  X, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Phone, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Mountain, 
  User, 
  Activity, 
  ArrowRight,
  Send,
  UserCheck
} from 'lucide-react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

interface AlertDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alert: any;
  timeline: any[];
  calls: any[];
  onStartCall: (alertId: string) => void;
  onAcknowledge: (alertId: string, officerName?: string) => void;
  onResolve: (alertId: string) => void;
  onViewOn2DMap: (location: string, coordinates: [number, number]) => void;
  onViewIn3D: (location: string, coordinates: [number, number]) => void;
}

export const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({
  isOpen,
  onClose,
  alert,
  timeline,
  calls,
  onStartCall,
  onAcknowledge,
  onResolve,
  onViewOn2DMap,
  onViewIn3D
}) => {
  if (!isOpen || !alert) return null;

  const isAcknowledged = alert.acknowledged || alert.status === 'ACKNOWLEDGED';
  const isResolved = alert.resolved || alert.status === 'RESOLVED';
  const isCritical = alert.severity === 'CRITICAL';
  const level = alert.current_level || 1;
  const officerName = alert.current_officer || (level === 1 ? 'Primary Emergency Officer' : 'Secondary Emergency Officer');
  const role = alert.current_role || (level === 1 ? 'Primary Emergency Officer' : 'Secondary Emergency Officer');
  const coords: [number, number] = alert.coordinates || [11.5512, 76.1264];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn font-mono">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#09130F] border-l border-cyan-500/30 text-pine-text shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 bg-black/60 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${
                isCritical ? 'bg-rose-950/80 border-rose-500 text-rose-300' : 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
              }`}>
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">ALERT DETAIL &bull; {alert.alert_id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    isCritical ? 'bg-rose-950 text-rose-300 border border-rose-600' : 'bg-amber-950 text-amber-300 border border-amber-600'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <div className="text-xs text-pine-muted font-sans mt-0.5">
                  {alert.location} &bull; Catchment: {alert.catchment_id}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-pine-muted hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* 1. Risk Intelligence & Hazard Profile */}
            <div className="p-4 bg-black/40 border border-cyan-500/20 rounded-xl space-y-3">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>HAZARD & PRECIPITATION PROFILE</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#06120D] border border-cyan-500/10">
                  <div className="text-[10px] text-pine-muted">RPI SCORE</div>
                  <div className="text-base font-bold text-rose-400">{alert.rpi || 91}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#06120D] border border-cyan-500/10">
                  <div className="text-[10px] text-pine-muted">HRI SCORE</div>
                  <div className="text-base font-bold text-amber-400">{alert.hri || 88}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#06120D] border border-cyan-500/10">
                  <div className="text-[10px] text-pine-muted">HAZARD TYPE</div>
                  <div className="text-xs font-bold text-white">{alert.hazard || 'LANDSLIDE'}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#06120D] border border-cyan-500/10">
                  <div className="text-[10px] text-pine-muted">24H RAINFALL</div>
                  <div className="text-xs font-bold text-cyan-300">{alert.rainfall_24h_mm || 182} mm</div>
                </div>
              </div>

              <p className="text-xs text-pine-muted/90 font-sans leading-relaxed">
                {alert.reason}
              </p>

              {/* GIS Navigation Shortcuts */}
              <div className="flex items-center gap-2 pt-2 border-t border-cyan-500/20">
                <button
                  onClick={() => onViewOn2DMap(alert.location, coords)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#0E1E17] hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>VIEW ON 2D GIS MAP</span>
                </button>
                <button
                  onClick={() => onViewIn3D(alert.location, coords)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#0E1B24] hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Mountain className="w-3.5 h-3.5" />
                  <span>VIEW IN 3D TERRAIN</span>
                </button>
              </div>
            </div>

            {/* 2. Assigned Emergency Officer & Status */}
            <div className="p-4 bg-black/40 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>ASSIGNED EMERGENCY OFFICER</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold">
                  LEVEL {level}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white font-serif">{officerName}</div>
                  <div className="text-xs text-pine-muted">{role}</div>
                </div>

                {!isAcknowledged && (
                  <button
                    onClick={() => onStartCall(alert.alert_id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>CALL OFFICER</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. Call Attempts Log */}
            <div className="p-4 bg-black/40 border border-cyan-500/20 rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                <span>VOICE CALL ATTEMPTS LOG</span>
              </div>

              {calls.length === 0 ? (
                <div className="text-center py-4 text-xs text-pine-muted font-sans">
                  No voice calls placed for this alert yet.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {calls.map((call, idx) => (
                    <div
                      key={call.id || idx}
                      className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold">
                          #{call.attempt_number || idx + 1}
                        </span>
                        <span className="font-bold text-white">Level {call.escalation_level || 1}</span>
                        <span className="text-pine-muted">({call.officer_name})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          call.status === 'ANSWERED' || call.acknowledged
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                            : call.status === 'NO_ANSWER'
                            ? 'bg-rose-950 text-rose-300 border border-rose-500'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                        }`}>
                          {call.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Complete Audit Event Timeline */}
            <div className="p-4 bg-black/40 border border-cyan-500/20 rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>COMPLETE EVENT AUDIT TIMELINE</span>
              </div>

              <div className="space-y-2 relative border-l-2 border-cyan-500/20 ml-2 pl-3">
                {timeline.map((evt, idx) => (
                  <div key={evt.event_id || idx} className="space-y-0.5 relative">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-black"></div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">{evt.title}</span>
                      <span className="text-[10px] text-pine-muted">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-pine-muted font-sans leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Bottom Actions */}
          <div className="p-4 bg-black/70 border-t border-cyan-500/20 flex items-center justify-between gap-3">
            {!isAcknowledged ? (
              <button
                onClick={() => onAcknowledge(alert.alert_id, officerName)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ACKNOWLEDGE ALERT ✓</span>
              </button>
            ) : !isResolved ? (
              <button
                onClick={() => onResolve(alert.alert_id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>RESOLVE INCIDENT ✓</span>
              </button>
            ) : (
              <div className="flex-1 py-2.5 text-center text-xs text-emerald-400 font-bold bg-emerald-950/60 rounded-xl border border-emerald-500/40">
                INCIDENT PERMANENTLY RESOLVED
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
