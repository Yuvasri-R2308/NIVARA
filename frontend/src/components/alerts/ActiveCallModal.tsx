import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  PhoneCall, 
  PhoneForwarded, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  Mic, 
  Radio, 
  ShieldAlert, 
  Clock, 
  Layers, 
  Sparkles,
  Key,
  X,
  User
} from 'lucide-react';

interface ActiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: any;
  callAttempt: any;
  onAcknowledge: (alertId: string, officerName?: string) => void;
  onEscalate: (alertId: string) => void;
  onSimulateEvent: (alertId: string, callId: string, eventType: string, ivrKey?: string) => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  isOpen,
  onClose,
  alert,
  callAttempt,
  onAcknowledge,
  onEscalate,
  onSimulateEvent
}) => {
  const [duration, setDuration] = useState<number>(0);
  const [activeIvrKey, setActiveIvrKey] = useState<string | null>(null);

  const callStatus = callAttempt?.status || alert?.call_status || 'INITIATING';
  const isConnected = callStatus === 'CONNECTED' || callStatus === 'ANSWERED';
  const isAnswered = callStatus === 'ANSWERED' || alert?.call_answered;
  const isAcknowledged = alert?.acknowledged || alert?.status === 'ACKNOWLEDGED';
  const isFailed = callStatus === 'NO_ANSWER' || callStatus === 'BUSY' || callStatus === 'TIMEOUT' || callStatus === 'FAILED';
  const level = alert?.current_level || 1;
  const officerName = alert?.current_officer || (level === 1 ? 'Primary Emergency Officer' : 'Secondary Emergency Officer');
  const role = alert?.current_role || (level === 1 ? 'Primary Emergency Officer' : 'Secondary Emergency Officer');

  useEffect(() => {
    let timer: any;
    if (isOpen && isConnected && !isFailed && !isAcknowledged) {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isConnected, isFailed, isAcknowledged]);

  // Real in-browser audio speech synthesis for emergency voice dispatch
  useEffect(() => {
    if (isOpen && (isConnected || callStatus === 'IN_PROGRESS' || callStatus === 'ANSWERED') && !isAcknowledged) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const voiceText = `Attention emergency officer ${officerName}. This is an urgent critical disaster notification from NIVARA Multi-Hazard Early Warning Command. Landslide and flood risk detected in ${alert.location || 'Meppadi'}. Relocation Priority Index is ${alert.rpi || 91} out of 100. Hazard Risk Index is ${alert.hri || 88} out of 100. Twenty-four hour rainfall has exceeded ${alert.rainfall_24h_mm || 182} millimeters. Press 1 on your keypad to acknowledge this emergency alert.`;
        const utterance = new SpeechSynthesisUtterance(voiceText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, isConnected, callStatus, isAcknowledged]);

  if (!isOpen || !alert) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (key: string) => {
    setActiveIvrKey(key);
    if (key === '1') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const ackUtterance = new SpeechSynthesisUtterance('Thank you officer. Emergency response has been confirmed and registered in NIVARA Command Center.');
        window.speechSynthesis.speak(ackUtterance);
      }
      onAcknowledge(alert.alert_id, officerName);
      if (callAttempt?.id) {
        onSimulateEvent(alert.alert_id, callAttempt.id, 'IVR_ACKNOWLEDGE', '1');
      }
    } else if (callAttempt?.id) {
      onSimulateEvent(alert.alert_id, callAttempt.id, 'ANSWERED', key);
    }
    setTimeout(() => setActiveIvrKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-xl bg-[#09130F] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-black/60 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              EMERGENCY VOICE DISPATCH &bull; LEVEL {level}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold">
              DEMO CALL SIMULATION
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-pine-muted hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {/* Officer Identity & Call Animation Card */}
          <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500">
                  LEVEL {level} OFFICER
                </span>
                <span className="text-[11px] text-cyan-400 font-bold">Priority {level}</span>
              </div>
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>{officerName}</span>
              </h3>
              <p className="text-xs text-pine-muted">{role}</p>
              <div className="text-[10.5px] text-cyan-300/80 pt-0.5">
                Target Incident: <span className="font-bold text-white">{alert.alert_id}</span> ({alert.location})
              </div>
            </div>

            {/* Live Status Call Pill */}
            <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0 self-center sm:self-auto">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-md ${
                isAcknowledged
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                  : isFailed
                  ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                  : isConnected
                  ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-400 animate-pulse'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse'
              }`}>
                <PhoneCall className="w-3.5 h-3.5" />
                <span>
                  {isAcknowledged
                    ? 'ACKNOWLEDGED ✓'
                    : isFailed
                    ? callStatus.replace('_', ' ')
                    : isConnected
                    ? isAnswered ? 'CALL ANSWERED' : 'CONNECTED'
                    : callStatus}
                </span>
              </div>

              {isConnected && !isFailed && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono font-bold">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{formatDuration(duration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Audio Waveform / IVR Speech Prompt Banner */}
          <div className="p-3.5 rounded-xl bg-[#06120D] border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>IVR VOICE DISPATCH MESSAGE & KEYPAD</span>
              </span>
              <span className="text-[10px] text-pine-muted font-mono">
                {isAnswered ? 'Active IVR Dialog' : 'Waiting for Officer Answer'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/10 text-xs text-pine-text leading-relaxed font-sans italic">
              &ldquo;Emergency alert from NIVARA disaster intelligence. {alert.severity} hazard detected in {alert.location}. Alert ID {alert.alert_id}. Press 1 on your keypad to acknowledge this emergency. Press 2 for field assistance.&rdquo;
            </div>

            {/* IVR Keypad Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleKeyPress('1')}
                className={`flex-1 py-2 px-3 rounded-lg border font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeIvrKey === '1' || isAcknowledged
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'bg-[#12231B] hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <span>[ 1 ] Press 1: Acknowledge Emergency</span>
              </button>
              <button
                onClick={() => handleKeyPress('2')}
                className={`py-2 px-3 rounded-lg border font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeIvrKey === '2'
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-[#1E1C12] hover:bg-amber-950 text-amber-300 border-amber-500/40'
                }`}
              >
                <span>[ 2 ] Request Support</span>
              </button>
            </div>
          </div>

          {/* Demonstration Simulation Bar */}
          <div className="p-2.5 rounded-xl bg-black/50 border border-cyan-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold">
              <span>SIMULATE CALL STATES (FOR HACKATHON EVALUATION):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => onSimulateEvent(alert.alert_id, callAttempt?.id, 'RINGING')}
                className="px-2 py-1 rounded bg-black hover:bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] cursor-pointer"
              >
                Simulate Ringing
              </button>
              <button
                onClick={() => onSimulateEvent(alert.alert_id, callAttempt?.id, 'ANSWERED')}
                className="px-2 py-1 rounded bg-black hover:bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] cursor-pointer"
              >
                Simulate Answer
              </button>
              <button
                onClick={() => onSimulateEvent(alert.alert_id, callAttempt?.id, 'NO_ANSWER')}
                className="px-2 py-1 rounded bg-black hover:bg-rose-950 text-rose-300 border border-rose-500/30 text-[10px] cursor-pointer"
              >
                Simulate No Answer
              </button>
              <button
                onClick={() => onSimulateEvent(alert.alert_id, callAttempt?.id, 'BUSY')}
                className="px-2 py-1 rounded bg-black hover:bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] cursor-pointer"
              >
                Simulate Busy
              </button>
              <button
                onClick={() => onEscalate(alert.alert_id)}
                className="px-2 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-500/50 text-[10px] font-bold cursor-pointer"
              >
                Trigger Escalation
              </button>
            </div>
          </div>

          {/* Bottom Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-cyan-500/20">
            <button
              onClick={() => onSimulateEvent(alert.alert_id, callAttempt?.id, 'ENDED')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-black/60 hover:bg-rose-950 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span>END CALL</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isAcknowledged ? (
                <button
                  onClick={() => onAcknowledge(alert.alert_id, officerName)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>MARK ACKNOWLEDGED ✓</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>RESPONSE CONFIRMED ✓</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
