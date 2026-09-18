import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { HazardType } from '../../types';
import { getHazardProfile } from '../../data/hazardRegistry';
import { 
  generateLiveReportData, 
  generateLivePdfDoc,
  LiveReportData 
} from '../../services/reportDataService';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { 
  PhoneCall, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ExternalLink, 
  Clock, 
  Radio, 
  X, 
  Loader2,
  ShieldCheck,
  Users
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface AuthorityInsightsProps {
  hazardKey: HazardType;
  theme?: 'dark' | 'light';
}

export const AuthorityInsightsDashboard: React.FC<AuthorityInsightsProps> = ({ 
  hazardKey, 
  theme = 'dark' 
}) => {
  const { 
    goHome,
    data,
    liveWeather,
    selectedVillage,
    rainfallMultiplier,
    selectedSite,
    selectedRiskFilter
  } = useApp();

  // Voice Alert State
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [voiceCallResult, setVoiceCallResult] = useState<{
    success: boolean;
    callSid?: string;
    status?: string;
    message?: string;
    officer?: string;
  } | null>(null);

  // PDF Report State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfReadyDoc, setPdfReadyDoc] = useState<{ doc: jsPDF; filename: string } | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Dynamic Hazard Profile (Single source of truth for active disaster)
  const profile = useMemo(() => getHazardProfile(hazardKey), [hazardKey]);

  // Current formatted timestamp
  const lastUpdated = useMemo(() => {
    const now = new Date();
    return now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' IST';
  }, []);

  // Format numbers safely
  const formatNum = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) return 'No data';
    return num.toLocaleString('en-IN');
  };

  // -------------------------------------------------------------
  // SECTION 1: DYNAMIC SUMMARY STATS (TOP 4 SUMMARY CARDS)
  // -------------------------------------------------------------
  const summaryData = useMemo(() => {
    const rz = profile?.redZone;
    const roster = profile?.evacuationRoster || [];
    const safeSites = profile?.safeDestinations || [];

    // 1. Current Status
    const status = rz?.severity || 'CRITICAL';

    // 2. Affected Population
    let affectedPopStr = rz?.affectedPop || '';
    if (!affectedPopStr && roster.length > 0) {
      const sum = roster.reduce((acc, h) => acc + (h.population || 0), 0);
      affectedPopStr = `${formatNum(sum)} Persons`;
    }
    if (!affectedPopStr) affectedPopStr = 'No data';

    // 3. Immediate Relocation
    let immediateRelocStr = rz?.immediateFamilies || '';
    if (!immediateRelocStr && roster.length > 0) {
      const p1 = roster.filter(h => h.urgency?.includes('P1') || h.urgency?.includes('IMMEDIATE'));
      const p1Fam = p1.reduce((acc, h) => acc + (h.families || 0), 0);
      immediateRelocStr = `${formatNum(p1Fam)} Families`;
    }
    if (!immediateRelocStr) immediateRelocStr = 'No data';

    // 4. Safe Capacity
    let safeCapStr = '';
    if (safeSites.length > 0) {
      const totalCap = safeSites.reduce((acc, s) => acc + (s.capacityPersons || s.availableCapacity || 0), 0);
      safeCapStr = `${formatNum(totalCap)} Persons`;
    } else {
      safeCapStr = 'No data';
    }

    return {
      status,
      affectedPopulation: affectedPopStr,
      immediateRelocation: immediateRelocStr,
      safeCapacity: safeCapStr,
      leadSafeSite: safeSites[0]?.name || 'Designated Safe Hub'
    };
  }, [profile]);

  // -------------------------------------------------------------
  // SECTION 2: HAZARD-SPECIFIC 4 CHARTS CONTENT
  // -------------------------------------------------------------

  // CHART 1: CURRENT RISK LEVEL (Donut / Pie Chart)
  // Purpose: "How serious is the situation?"
  const chart1Config = useMemo(() => {
    switch (hazardKey) {
      case 'flood':
        return {
          title: 'CURRENT FLOOD RISK',
          purpose: 'How serious is the flooding?',
          data: [
            { name: 'Critical', value: 5, color: '#EF4444' },
            { name: 'High', value: 4, color: '#F97316' },
            { name: 'Moderate', value: 2, color: '#EAB308' },
            { name: 'Low', value: 1, color: '#10B981' }
          ]
        };
      case 'cloudburst':
        return {
          title: 'CURRENT EXTREME RAINFALL RISK',
          purpose: 'How severe is the current extreme-rainfall risk?',
          data: [
            { name: 'Critical', value: 6, color: '#EF4444' },
            { name: 'High', value: 8, color: '#F97316' },
            { name: 'Moderate', value: 4, color: '#EAB308' },
            { name: 'Low', value: 2, color: '#10B981' }
          ]
        };
      case 'coastal-erosion':
        return {
          title: 'CURRENT EROSION RISK',
          purpose: 'How serious is coastal erosion?',
          data: [
            { name: 'Critical', value: 28, color: '#EF4444' },
            { name: 'High', value: 36, color: '#F97316' },
            { name: 'Moderate', value: 32, color: '#EAB308' },
            { name: 'Low', value: 23, color: '#10B981' }
          ]
        };
      case 'landslide':
      default:
        return {
          title: 'CURRENT RISK LEVEL',
          purpose: 'How serious is the landslide situation?',
          data: [
            { name: 'Critical', value: 3, color: '#EF4444' },
            { name: 'High', value: 2, color: '#F97316' },
            { name: 'Moderate', value: 1, color: '#EAB308' },
            { name: 'Low', value: 1, color: '#10B981' }
          ]
        };
    }
  }, [hazardKey]);

  // Custom Donut Label Renderer: Prevents SVG edge clipping & ensures high-contrast readability in Light & Dark modes
  const renderDonutLabel = useCallback((props: any) => {
    const { cx, cy, midAngle, outerRadius } = props;
    const name = props.name || props.payload?.name || '';
    const percent = props.percent !== undefined ? props.percent : (props.payload?.percent ?? 0);
    const rawColor = props.payload?.color || props.fill || '#10B981';

    const RADIAN = Math.PI / 180;
    // Position label cleanly outside slice perimeter with safe bounds
    const radius = outerRadius + 18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const isRight = x > cx;
    const textAnchor = isRight ? 'start' : 'end';

    // High-contrast colors tailored to theme
    let labelColor = rawColor;
    if (theme === 'light') {
      if (name === 'Moderate' || rawColor === '#EAB308') {
        labelColor = '#B45309'; // Rich amber (WCAG AA compliant on pure white)
      } else if (name === 'Critical' || rawColor === '#EF4444') {
        labelColor = '#DC2626'; // Vivid deep red
      } else if (name === 'High' || rawColor === '#F97316') {
        labelColor = '#C2410C'; // Warm contrast orange
      } else if (name === 'Low' || rawColor === '#10B981') {
        labelColor = '#047857'; // Deep emerald green
      }
    } else {
      if (name === 'Moderate' || rawColor === '#EAB308') {
        labelColor = '#FACC15'; // Bright crisp yellow
      } else if (name === 'Critical' || rawColor === '#EF4444') {
        labelColor = '#F87171'; // High-vis coral red
      } else if (name === 'High' || rawColor === '#F97316') {
        labelColor = '#FB923C'; // High-vis orange
      } else if (name === 'Low' || rawColor === '#10B981') {
        labelColor = '#34D399'; // High-vis mint
      }
    }

    const pctString = `${(percent * 100).toFixed(0)}%`;

    return (
      <text
        x={x}
        y={y}
        fill={labelColor}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="select-none font-mono text-[11px] font-bold tracking-tight"
        style={{
          filter: theme === 'light' 
            ? 'drop-shadow(0 1px 2px rgba(255,255,255,0.95))' 
            : 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))'
        }}
      >
        {`${name} (${pctString})`}
      </text>
    );
  }, [theme]);

  // CHART 02 — PEOPLE AT RISK (Grouped Bar Chart: People vs Families)
  const peopleAtRiskData = useMemo(() => {
    const roster = profile?.evacuationRoster || [];
    if (roster.length > 0) {
      return roster.slice(0, 5).map(h => ({
        zone: h.name.split(' ')[0] || h.name,
        'People at Risk': h.population || 0,
        'Vulnerable Families': h.families || 0
      }));
    }
    // Hazard-calibrated fallback
    switch (hazardKey) {
      case 'flood':
        return [
          { zone: 'Chabua', 'People at Risk': 4200, 'Vulnerable Families': 840 },
          { zone: 'Dikom', 'People at Risk': 3600, 'Vulnerable Families': 720 },
          { zone: 'Bogibeel', 'People at Risk': 3200, 'Vulnerable Families': 640 },
          { zone: 'Bindhakata', 'People at Risk': 2800, 'Vulnerable Families': 560 },
          { zone: 'Rohmaria', 'People at Risk': 2400, 'Vulnerable Families': 480 },
        ];
      case 'cloudburst':
        return [
          { zone: 'Kedarnath', 'People at Risk': 4500, 'Vulnerable Families': 900 },
          { zone: 'Rambara', 'People at Risk': 1800, 'Vulnerable Families': 360 },
          { zone: 'Gaurikund', 'People at Risk': 2200, 'Vulnerable Families': 440 },
          { zone: 'Sonprayag', 'People at Risk': 1400, 'Vulnerable Families': 280 },
          { zone: 'Guptkashi', 'People at Risk': 800, 'Vulnerable Families': 160 },
        ];
      case 'coastal-erosion':
        return [
          { zone: 'Podampeta', 'People at Risk': 820, 'Vulnerable Families': 180 },
          { zone: 'Boxipalli', 'People at Risk': 950, 'Vulnerable Families': 195 },
          { zone: 'Aryapalli', 'People at Risk': 620, 'Vulnerable Families': 130 },
          { zone: 'Gopalpur', 'People at Risk': 450, 'Vulnerable Families': 90 },
        ];
      case 'landslide':
      default:
        return [
          { zone: 'Chooralmala', 'People at Risk': 1850, 'Vulnerable Families': 95 },
          { zone: 'Mundakkai', 'People at Risk': 1420, 'Vulnerable Families': 75 },
          { zone: 'Attamala', 'People at Risk': 890, 'Vulnerable Families': 45 },
          { zone: 'Meppadi', 'People at Risk': 640, 'Vulnerable Families': 35 },
        ];
    }
  }, [profile, hazardKey]);

  // CHART 3: MAIN RISK FACTORS (Radar / Spider Chart)
  // Purpose: "What conditions are contributing to the risk?" / "What is driving the risk?"
  const chart3Config = useMemo(() => {
    switch (hazardKey) {
      case 'flood':
        return {
          title: 'MAIN FLOOD RISK FACTORS',
          purpose: 'What is driving the flood risk?',
          data: [
            { factor: 'Water Level', value: 94 },
            { factor: 'Rainfall', value: 82 },
            { factor: 'Flood Depth', value: 88 },
            { factor: 'Elevation', value: 75 },
            { factor: 'Drainage', value: 86 },
            { factor: 'Population Exposure', value: 85 }
          ]
        };
      case 'cloudburst':
        return {
          title: 'MAIN CLOUDBURST RISK FACTORS',
          purpose: 'What conditions are contributing to the risk?',
          data: [
            { factor: 'Rain Intensity', value: 96 },
            { factor: 'Terrain / Elevation', value: 94 },
            { factor: 'Rainfall Accumulation', value: 90 },
            { factor: 'Humidity', value: 86 },
            { factor: 'Historical Events', value: 92 }
          ]
        };
      case 'coastal-erosion':
        return {
          title: 'MAIN EROSION RISK FACTORS',
          purpose: 'What is driving the erosion risk?',
          data: [
            { factor: 'Shoreline Change', value: 92 },
            { factor: 'Erosion Rate', value: 88 },
            { factor: 'Historical Cyclone Impact', value: 84 },
            { factor: 'Elevation', value: 80 },
            { factor: 'Population Exposure', value: 76 }
          ]
        };
      case 'landslide':
      default:
        return {
          title: 'MAIN RISK FACTORS',
          purpose: 'What is increasing landslide risk?',
          data: [
            { factor: 'Rainfall', value: 95 },
            { factor: 'Soil Moisture', value: 98 },
            { factor: 'Slope', value: 88 },
            { factor: 'Past Events', value: 92 },
            { factor: 'Population Exposure', value: 78 }
          ]
        };
    }
  }, [hazardKey]);

  // CHART 04 — RELOCATION STATUS (Comparative Bar Chart: Required Relocation vs Safe Capacity)
  const relocationStatusData = useMemo(() => {
    const rz = profile?.redZone;
    const roster = profile?.evacuationRoster || [];
    const safeSites = profile?.safeDestinations || [];

    // Calculate required persons
    let requiredPersons = 0;
    if (roster.length > 0) {
      const p1 = roster.filter(h => h.urgency?.includes('P1') || h.urgency?.includes('IMMEDIATE'));
      requiredPersons = p1.reduce((acc, h) => acc + (h.population || 0), 0);
      if (requiredPersons === 0) {
        requiredPersons = roster.reduce((acc, h) => acc + (h.population || 0), 0);
      }
    }
    if (requiredPersons === 0) {
      if (hazardKey === 'flood') requiredPersons = 18500;
      else if (hazardKey === 'cloudburst') requiredPersons = 4500;
      else if (hazardKey === 'coastal-erosion') requiredPersons = 1770;
      else requiredPersons = 3800;
    }

    // Calculate available capacity
    let availableCap = safeSites.reduce((acc, s) => acc + (s.availableCapacity || s.capacityPersons || 0), 0);
    if (availableCap === 0) {
      if (hazardKey === 'flood') availableCap = 18500;
      else if (hazardKey === 'cloudburst') availableCap = 35500;
      else if (hazardKey === 'coastal-erosion') availableCap = 6500;
      else availableCap = 5480;
    }

    const surplus = availableCap - requiredPersons;
    const statusText = surplus > 0 
      ? `+${surplus.toLocaleString('en-IN')} SURPLUS SAFE CAPACITY` 
      : surplus === 0 
        ? 'BALANCED CAPACITY (FULL UTILIZATION)' 
        : `${Math.abs(surplus).toLocaleString('en-IN')} CAPACITY DEFICIT`;

    const pipelineItem = {
      metric: 'Total Pipeline',
      'Required Relocation': requiredPersons,
      'Available Safe Capacity': availableCap
    };

    let siteItems: any[] = [];
    if (hazardKey === 'flood') {
      siteItems = [
        { metric: 'Maijan Camp', 'Required Relocation': 4200, 'Available Safe Capacity': 4500 },
        { metric: 'Chabua Ground', 'Required Relocation': 3600, 'Available Safe Capacity': 4000 },
        { metric: 'Dibrugarh Hub', 'Required Relocation': 5800, 'Available Safe Capacity': 6000 },
        pipelineItem
      ];
    } else if (hazardKey === 'cloudburst') {
      siteItems = [
        { metric: 'Sonprayag Terrace', 'Required Relocation': 1800, 'Available Safe Capacity': 2500 },
        { metric: 'Guptkashi Camp', 'Required Relocation': 2700, 'Available Safe Capacity': 3200 },
        pipelineItem
      ];
    } else if (hazardKey === 'coastal-erosion') {
      siteItems = [
        { metric: 'Gopalpur Shelter', 'Required Relocation': 820, 'Available Safe Capacity': 1200 },
        { metric: 'Aryapalli Refuge', 'Required Relocation': 950, 'Available Safe Capacity': 1250 },
        pipelineItem
      ];
    } else {
      // Landslide
      siteItems = [
        { metric: 'Meppadi Poly', 'Required Relocation': 1420, 'Available Safe Capacity': 1800 },
        { metric: 'Kalpetta Hub', 'Required Relocation': 980, 'Available Safe Capacity': 1200 },
        { metric: 'Vythiri Reserve', 'Required Relocation': 870, 'Available Safe Capacity': 2480 },
        pipelineItem
      ];
    }

    return {
      statusText,
      isSufficient: surplus >= 0,
      data: siteItems
    };
  }, [profile, hazardKey]);

  // -------------------------------------------------------------
  // SECTION 3: BOTTOM ACTIONS (VOICE ALERT & PDF REPORT)
  // -------------------------------------------------------------

  // Real Emergency Voice Call Dispatch via Backend API
  const handleSendVoiceAlert = async () => {
    setIsCalling(true);
    setVoiceCallResult(null);
    try {
      const response = await fetch('/api/emergency/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officer: 'primary',
          alert_id: `NIV-INSIGHTS-${hazardKey.toUpperCase()}`
        })
      });

      const resData = await response.json();

      if (response.ok && (resData.success || resData.call_sid)) {
        setVoiceCallResult({
          success: true,
          callSid: resData.call_sid,
          status: resData.status || 'INITIATED',
          message: 'Official emergency voice dispatch initiated successfully via Twilio PSTN carrier.',
          officer: resData.officer_name || 'Primary Emergency Officer'
        });
      } else {
        setVoiceCallResult({
          success: false,
          status: resData.status || 'FAILED',
          message: resData.message || resData.detail || 'Failed to dispatch voice call. Verify Twilio environment credentials.',
          officer: resData.officer_name || 'Primary Emergency Officer'
        });
      }
    } catch (err: any) {
      setVoiceCallResult({
        success: false,
        status: 'NETWORK_ERROR',
        message: err.message || 'Network error connecting to voice dispatch API.',
        officer: 'Primary Emergency Officer'
      });
    } finally {
      setIsCalling(false);
      setShowVoiceConfirm(false);
    }
  };

  // Generate Official PDF Report via reportDataService
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    setPdfReadyDoc(null);
    try {
      const reportData: LiveReportData = generateLiveReportData(
        data,
        liveWeather,
        selectedVillage || 'ALL',
        rainfallMultiplier || 1.0,
        selectedSite,
        selectedRiskFilter || 'ALL',
        hazardKey
      );
      const pdfResult = generateLivePdfDoc(reportData);
      setPdfReadyDoc(pdfResult);
    } catch (err: any) {
      setPdfError(err.message || 'Failed to compile official situation report.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfReadyDoc) {
      pdfReadyDoc.doc.save(pdfReadyDoc.filename);
    }
  };

  const handleViewPdf = () => {
    if (pdfReadyDoc) {
      const blob = pdfReadyDoc.doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('CRITICAL')) return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (s.includes('HIGH') || s.includes('WARNING')) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (s.includes('MODERATE') || s.includes('WATCH')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  return (
    <div className={`space-y-6 animate-fadeIn ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
      
      {/* Top Header Lockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-[#1A2E24]">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-mono font-black tracking-wider uppercase ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            AUTHORITY INSIGHTS
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono mt-1">
            <span className={`font-bold uppercase px-2.5 py-0.5 rounded border ${
              theme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
            }`}>
              {profile.name.toUpperCase()}
            </span>
            <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
              {profile.studyLocation}, {profile.state}
            </span>
            <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-700'}>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Updated: {lastUpdated}</span>
            </span>
          </div>
        </div>

        {/* Live Authority Telemetry Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
            theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-[#0E1E17] border-emerald-900/60 text-emerald-300'
          }`}>
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>EXECUTIVE DISASTER DESK</span>
          </div>
        </div>
      </div>

      {/* Voice Alert Dispatch Result Banner (if dispatched) */}
      {voiceCallResult && (
        <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 animate-fadeIn ${
          voiceCallResult.success
            ? (theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200')
            : (theme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/60 border-rose-700/60 text-rose-200')
        }`}>
          <div className="flex items-start gap-3">
            {voiceCallResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-sm font-mono">
                {voiceCallResult.success ? 'VOICE ALERT SENT' : 'VOICE ALERT FAILED'}
              </div>
              <p className="text-xs opacity-90">{voiceCallResult.message}</p>
              {voiceCallResult.callSid && (
                <div className="text-[11px] font-mono opacity-80">
                  Call SID: {voiceCallResult.callSid} • Status: {voiceCallResult.status}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setVoiceCallResult(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          TOP: EXACTLY 4 SUMMARY CARDS
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: CURRENT STATUS */}
        <div className={`p-5 rounded-2xl border transition-all ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
            CURRENT STATUS
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-sm font-mono font-bold border tracking-wide uppercase ${
              getStatusBadgeStyle(summaryData.status)
            }`}>
              {summaryData.status}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-sans mt-2">
            Highest hazard severity level
          </div>
        </div>

        {/* CARD 2: AFFECTED POPULATION */}
        <div className={`p-5 rounded-2xl border transition-all ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
            AFFECTED POPULATION
          </div>
          <div className={`text-2xl font-bold font-mono ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {summaryData.affectedPopulation}
          </div>
          <div className="text-xs text-slate-400 font-sans mt-1">
            Exposed in surveyed disaster zones
          </div>
        </div>

        {/* CARD 3: IMMEDIATE RELOCATION */}
        <div className={`p-5 rounded-2xl border transition-all ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
            IMMEDIATE RELOCATION
          </div>
          <div className="text-2xl font-bold font-mono text-rose-500">
            {summaryData.immediateRelocation}
          </div>
          <div className="text-xs text-slate-400 font-sans mt-1">
            Priority-1 urgent evacuation roster
          </div>
        </div>

        {/* CARD 4: SAFE CAPACITY */}
        <div className={`p-5 rounded-2xl border transition-all ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
            SAFE CAPACITY
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500">
            {summaryData.safeCapacity}
          </div>
          <div className="text-xs text-slate-400 font-sans mt-1 truncate">
            {summaryData.leadSafeSite}
          </div>
        </div>

      </div>

      {/* =========================================================================
          2 × 2 CHART LAYOUT (STRICTLY FOUR CHARTS)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* -----------------------------------------------------------------
            CHART 1: CURRENT RISK LEVEL (DONUT / PIE)
            Purpose: "How serious is the situation?"
            ----------------------------------------------------------------- */}
        <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold font-serif ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                1. {chart1Config.title}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-[#07130E] text-emerald-400 border-emerald-900/60'
              }`}>
                Donut Chart
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {chart1Config.purpose}
            </p>
          </div>

          <div className="h-72 w-full flex-1 min-h-[290px] overflow-visible">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 28, right: 35, bottom: 15, left: 35 }} style={{ overflow: 'visible' }}>
                <Pie
                  data={chart1Config.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={40}
                  outerRadius={62}
                  paddingAngle={4}
                  label={renderDonutLabel}
                  labelLine={false}
                >
                  {chart1Config.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={theme === 'light' ? '#FFFFFF' : '#0A1410'} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#070D0A',
                    borderColor: theme === 'light' ? '#E2E8F0' : '#1A2E24',
                    color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    borderRadius: '8px',
                    boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                  formatter={(val: any, name: any) => [`${val} Units`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span className={`text-[11px] font-mono font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      {value}
                    </span>
                  )}
                  wrapperStyle={{ 
                    fontSize: '11px', 
                    fontFamily: 'monospace',
                    paddingTop: '16px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            CHART 2: PEOPLE AT RISK (GROUPED VERTICAL BAR)
            Purpose: "Comparison of exposed people and vulnerable families across priority zones"
            ----------------------------------------------------------------- */}
        <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold font-serif ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                2. CHART 02 — PEOPLE AT RISK
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-[#07130E] text-cyan-400 border-cyan-900/60'
              }`}>
                Grouped Bar
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Comparison of exposed people and vulnerable families across priority zones
            </p>
          </div>

          <div className="h-64 w-full flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peopleAtRiskData} margin={{ top: 15, right: 20, left: -5, bottom: 5 }}>
                <CartesianGrid stroke={theme === 'light' ? '#E2E8F0' : '#1A2E24'} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="zone" 
                  stroke={theme === 'light' ? '#64748B' : '#94A3B8'} 
                  tick={{ fontSize: 11 }} 
                />
                <YAxis 
                  stroke={theme === 'light' ? '#64748B' : '#94A3B8'} 
                  tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                  tickFormatter={(v) => Number(v).toLocaleString()}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#070D0A',
                    borderColor: theme === 'light' ? '#E2E8F0' : '#1A2E24',
                    color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    borderRadius: '8px'
                  }}
                  formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} ${name === 'People at Risk' ? 'Persons' : 'Families'}`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={32}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="People at Risk" fill="#E8543E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Vulnerable Families" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            CHART 3: MAIN RISK FACTORS (RADAR / SPIDER)
            Purpose: "What conditions are contributing to the risk?"
            ----------------------------------------------------------------- */}
        <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold font-serif ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                3. {chart3Config.title}
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-[#07130E] text-amber-400 border-amber-900/60'
              }`}>
                Radar Chart
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {chart3Config.purpose}
            </p>
          </div>

          <div className="h-64 w-full flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chart3Config.data} outerRadius="75%">
                <PolarGrid stroke={theme === 'light' ? '#CBD5E1' : '#1A2E24'} />
                <PolarAngleAxis 
                  dataKey="factor" 
                  stroke={theme === 'light' ? '#475569' : '#94A3B8'} 
                  tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  stroke={theme === 'light' ? '#94A3B8' : '#475569'} 
                  tick={{ fontSize: 9 }} 
                />
                <Radar 
                  name="Severity Index" 
                  dataKey="value" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.35} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#070D0A',
                    borderColor: theme === 'light' ? '#E2E8F0' : '#1A2E24',
                    color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    borderRadius: '8px'
                  }}
                  formatter={(val: any) => [`${val}% Severity`, 'Risk Impact']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            CHART 4: RELOCATION STATUS (COMPARATIVE VERTICAL BAR)
            Purpose: "Required relocation demand vs verified safe site holding capacity"
            ----------------------------------------------------------------- */}
        <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
        }`}>
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold font-serif ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                4. CHART 04 — RELOCATION STATUS
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                relocationStatusData.isSufficient
                  ? (theme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60')
                  : (theme === 'light' ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-rose-950/80 text-rose-400 border-rose-700/60')
              }`}>
                {relocationStatusData.statusText}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Required relocation demand vs verified safe site holding capacity
            </p>
          </div>

          <div className="h-64 w-full flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={relocationStatusData.data} margin={{ top: 15, right: 20, left: -5, bottom: 5 }}>
                <CartesianGrid stroke={theme === 'light' ? '#E2E8F0' : '#1A2E24'} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="metric" 
                  stroke={theme === 'light' ? '#64748B' : '#94A3B8'} 
                  tick={{ fontSize: 10 }} 
                />
                <YAxis 
                  stroke={theme === 'light' ? '#64748B' : '#94A3B8'} 
                  tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                  tickFormatter={(v) => Number(v).toLocaleString()}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#070D0A',
                    borderColor: theme === 'light' ? '#E2E8F0' : '#1A2E24',
                    color: theme === 'light' ? '#0F172A' : '#F8FAFC',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    borderRadius: '8px'
                  }}
                  formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} Persons`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={32}
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="Required Relocation" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available Safe Capacity" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* =========================================================================
          SECTION 3: BOTTOM ACTIONS (VOICE ALERT & GENERATE PDF REPORT)
          ========================================================================= */}
      <div className={`p-5 rounded-2xl border transition-all ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A1410] border-[#1A2E24]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base font-bold font-serif ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              AUTHORITY ACTIONS
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Dispatch official voice alert or generate executive situation report
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* ACTION 1: VOICE ALERT BUTTON */}
            <button
              onClick={() => setShowVoiceConfirm(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>VOICE ALERT</span>
            </button>

            {/* ACTION 2: GENERATE PDF REPORT BUTTON */}
            {!pdfReadyDoc ? (
              <button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>{isGeneratingPdf ? 'GENERATING REPORT...' : 'GENERATE PDF REPORT'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-1 rounded-xl border bg-[#070D0A] border-emerald-600/60 animate-fadeIn">
                <span className="text-xs font-mono font-bold text-emerald-400 px-3">
                  REPORT READY
                </span>
                <button
                  onClick={handleViewPdf}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Open report in new browser tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>VIEW</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Save PDF file to disk"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {pdfError && (
          <div className="mt-3 text-xs font-mono text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800">
            {pdfError}
          </div>
        )}
      </div>

      {/* Voice Dispatch Confirmation Modal */}
      {showVoiceConfirm && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#0A1410] border-rose-800/80 text-white'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-rose-900/40">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-mono font-bold text-sm uppercase tracking-wider">
                  CONFIRM EMERGENCY VOICE DISPATCH
                </span>
              </div>
              <button
                onClick={() => setShowVoiceConfirm(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              This initiates an official emergency voice dispatch to on-duty district disaster authorities for <strong className="text-white">{profile.studyLocation} ({profile.name})</strong> via telephony carrier.
            </p>

            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <div>DISASTER: <strong className="text-white">{profile.name.toUpperCase()}</strong></div>
              <div>LOCATION: <strong className="text-white">{profile.studyLocation}, {profile.state}</strong></div>
              <div>LEVEL: <strong className="text-rose-400">{summaryData.status}</strong></div>
              <div>IMMEDIATE RELOCATION: <strong className="text-white">{summaryData.immediateRelocation}</strong></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowVoiceConfirm(false)}
                disabled={isCalling}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleSendVoiceAlert}
                disabled={isCalling}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                {isCalling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>CONNECTING CARRIER...</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>INITIATE EMERGENCY CALL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuthorityInsightsDashboard;
