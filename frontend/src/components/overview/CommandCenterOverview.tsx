import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HazardType } from '../../types';
import { 
  getHazardProfile, 
  getHazardIncidentReport 
} from '../../data/hazardRegistry';
import { OverviewGisMap } from './OverviewGisMap';
import { OverviewAnalyticsCards } from './OverviewAnalyticsCards';
import { 
  Mountain, 
  Droplets, 
  CloudLightning, 
  Waves, 
  ShieldCheck, 
  Navigation,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  Database,
  Radio,
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export const CommandCenterOverview: React.FC = () => {
  const { 
    selectedHazard, 
    selectHazard,
    selectHazardModule, 
    theme,
    setActiveView
  } = useApp();

  const hazardKey: HazardType = selectedHazard || 'landslide';
  const profile = useMemo(() => getHazardProfile(hazardKey), [hazardKey]);
  const incident = useMemo(() => getHazardIncidentReport(hazardKey), [hazardKey]);
  const metrics = incident.metricsSummary;
  const redZone = profile.redZone;
  const safeHub = profile.safeDestinations[0];

  // Active Safe Site Selection for Map & Panels Sync
  const [selectedSafeSiteId, setSelectedSafeSiteId] = useState<string>(
    profile.safeDestinations[0]?.id || 'KL-WYD-S01'
  );

  useEffect(() => {
    if (profile.safeDestinations && profile.safeDestinations.length > 0) {
      setSelectedSafeSiteId(profile.safeDestinations[0].id);
    }
  }, [hazardKey, profile]);

  // Helper for hazard icon
  const getHazardIcon = (h: HazardType, className: string = "w-5 h-5") => {
    switch (h) {
      case 'landslide': return <Mountain className={`${className} text-rose-500`} />;
      case 'flood': return <Droplets className={`${className} text-blue-500`} />;
      case 'cloudburst': return <CloudLightning className={`${className} text-amber-500`} />;
      case 'coastal-erosion': return <Waves className={`${className} text-teal-500`} />;
    }
  };

  // 7 High-Value Executive KPI Cards (Power BI Executive Dashboard Style)
  const executiveKpis = useMemo(() => {
    switch (hazardKey) {
      case 'landslide':
        return [
          { 
            title: 'RISK LEVEL', 
            value: 'CRITICAL', 
            unit: 'RED',
            sub: 'FoS < 0.85 • Liquefaction Scarp', 
            provenance: 'SHALSTAB / GSI',
            color: 'rose'
          },
          { 
            title: 'HRI SEVERITY', 
            value: '96.0', 
            unit: '/100',
            sub: 'Multi-Criteria Hazard Index', 
            provenance: 'IMD & GSI 2024',
            color: 'rose'
          },
          { 
            title: 'AFFECTED AREA', 
            value: '38.4', 
            unit: 'km²',
            sub: 'Detachment Scarp & Runout', 
            provenance: 'SRTM 30m DEM',
            color: 'amber'
          },
          { 
            title: 'POPULATION EXPOSED', 
            value: (metrics.totalExposedPop || 4800).toLocaleString(), 
            unit: 'Pax',
            sub: 'Exposed Habitation Register', 
            provenance: 'Census 2011',
            color: 'default'
          },
          { 
            title: 'VULNERABLE FAMILIES', 
            value: '250', 
            unit: 'Fam',
            sub: 'Scarp Perimeter Households', 
            provenance: 'Census 2011 Official',
            color: 'rose'
          },
          { 
            title: 'IMMEDIATE RELOCATION', 
            value: '250', 
            unit: 'Fam',
            sub: '1,000 Persons (P1 Caseload)', 
            provenance: 'RPI Solver P1',
            color: 'rose'
          },
          { 
            title: 'SAFE HOLDING CAPACITY', 
            value: '550', 
            unit: 'Fam',
            sub: '2,200 Persons • Kalpetta Reserve', 
            provenance: 'Sphere Standards',
            color: 'emerald'
          }
        ];
      case 'flood':
        return [
          { 
            title: 'RISK LEVEL', 
            value: 'CRITICAL', 
            unit: 'RED',
            sub: 'Embankment Breach Hazard', 
            provenance: 'CWC & Brahmaputra',
            color: 'rose'
          },
          { 
            title: 'HRI SEVERITY', 
            value: '88.2', 
            unit: '/100',
            sub: 'Flood Vulnerability Score', 
            provenance: 'MCA kopili Matrix',
            color: 'rose'
          },
          { 
            title: 'AFFECTED AREA', 
            value: '245.0', 
            unit: 'km²',
            sub: 'Inundated Riverine Plain', 
            provenance: 'Sentinel-1 SAR',
            color: 'amber'
          },
          { 
            title: 'POPULATION EXPOSED', 
            value: (metrics.totalExposedPop || 142500).toLocaleString(), 
            unit: 'Pax',
            sub: 'Riverine Basin Plain', 
            provenance: 'Census 2011',
            color: 'default'
          },
          { 
            title: 'VULNERABLE FAMILIES', 
            value: `${metrics.familiesAtRisk || 4850}`, 
            unit: 'Fam',
            sub: 'Lowland Plain Households', 
            provenance: 'Census 2011',
            color: 'rose'
          },
          { 
            title: 'IMMEDIATE RELOCATION', 
            value: `${Math.round(metrics.immediateEvacuees / 5)}`, 
            unit: 'Fam',
            sub: `${metrics.immediateEvacuees.toLocaleString()} Pax • Rohmoria & Chabua`, 
            provenance: 'RPI Solver P1',
            color: 'rose'
          },
          { 
            title: 'SAFE HOLDING CAPACITY', 
            value: `${Math.round((safeHub?.capacityPersons || 12000) / 5)}`, 
            unit: 'Fam',
            sub: `${(safeHub?.capacityPersons || 12000).toLocaleString()} Pax • Univ. Campus`, 
            provenance: 'Sphere Standards',
            color: 'emerald'
          }
        ];
      case 'cloudburst':
        return [
          { 
            title: 'RISK LEVEL', 
            value: 'CRITICAL', 
            unit: 'RED',
            sub: 'Severe Orographic Burst', 
            provenance: 'IMD Radar Doppler',
            color: 'rose'
          },
          { 
            title: 'HRI SEVERITY', 
            value: '92.4', 
            unit: '/100',
            sub: 'Burst Probability Index', 
            provenance: 'GSI & IMD Station',
            color: 'rose'
          },
          { 
            title: 'AFFECTED AREA', 
            value: '18.2', 
            unit: 'km²',
            sub: 'Mandakini Gorge Funnel', 
            provenance: 'CartoDEM 30m',
            color: 'amber'
          },
          { 
            title: 'POPULATION EXPOSED', 
            value: (metrics.totalExposedPop || 12400).toLocaleString(), 
            unit: 'Pax',
            sub: 'Pilgrims & Valley Residents', 
            provenance: 'Disaster Register',
            color: 'default'
          },
          { 
            title: 'VULNERABLE FAMILIES', 
            value: '840', 
            unit: 'Fam',
            sub: 'High Exposure Gorge Units', 
            provenance: 'Temple Register',
            color: 'rose'
          },
          { 
            title: 'IMMEDIATE RELOCATION', 
            value: '840', 
            unit: 'Fam',
            sub: `${metrics.immediateEvacuees.toLocaleString()} Pax • Mandakini Chasm`, 
            provenance: 'RPI Solver P1',
            color: 'rose'
          },
          { 
            title: 'SAFE HOLDING CAPACITY', 
            value: `${Math.round((safeHub?.capacityPersons || 4500) / 4)}`, 
            unit: 'Fam',
            sub: `${(safeHub?.capacityPersons || 4500).toLocaleString()} Pax • Guptkashi Hub`, 
            provenance: 'Sphere Standards',
            color: 'emerald'
          }
        ];
      case 'coastal-erosion':
        return [
          { 
            title: 'RISK LEVEL', 
            value: 'HIGH', 
            unit: 'RED',
            sub: 'High Water Line Scour', 
            provenance: 'USGS DSAS Transects',
            color: 'rose'
          },
          { 
            title: 'HRI SEVERITY', 
            value: '68.4', 
            unit: '/100',
            sub: 'Coastal Vulnerability (CVI)', 
            provenance: 'INCOIS & Landsat',
            color: 'rose'
          },
          { 
            title: 'AFFECTED AREA', 
            value: '42.6', 
            unit: 'km²',
            sub: 'Intertidal Shoreline Strip', 
            provenance: 'Sentinel-2 LRR',
            color: 'amber'
          },
          { 
            title: 'POPULATION EXPOSED', 
            value: (metrics.totalExposedPop || 6850).toLocaleString(), 
            unit: 'Pax',
            sub: 'Coastal Hamlets Inhabitants', 
            provenance: 'Census 2011',
            color: 'default'
          },
          { 
            title: 'VULNERABLE FAMILIES', 
            value: '310', 
            unit: 'Fam',
            sub: 'Scour Zone Fisher Households', 
            provenance: 'Census 2011',
            color: 'rose'
          },
          { 
            title: 'IMMEDIATE RELOCATION', 
            value: '310', 
            unit: 'Fam',
            sub: '1,240 Persons (P1 High-Water Scour)', 
            provenance: 'RPI Solver P1',
            color: 'rose'
          },
          { 
            title: 'SAFE HOLDING CAPACITY', 
            value: '1,100', 
            unit: 'Fam',
            sub: '4,400 Persons • Baghalati Enclave', 
            provenance: 'Sphere Standards',
            color: 'emerald'
          }
        ];
    }
  }, [hazardKey, metrics, redZone, safeHub]);

  // Multi-Sector Hazard & Capacity Differential Chart Data
  const overviewDifferentialData = useMemo(() => {
    const dangerSectors = profile.evacuationRoster.slice(0, 4).map(r => ({
      name: r.name.split(' ')[0],
      'Hazard Severity (RPI)': r.rpiScore,
      'Exposed Pax (x100)': Math.round(r.population / 100),
      'Holding Capacity (x100)': 0,
      'Safety Score (CCAS)': 0
    }));

    const safeDestinations = profile.safeDestinations.slice(0, 3).map(d => ({
      name: d.name.split(' ')[0],
      'Hazard Severity (RPI)': 0,
      'Exposed Pax (x100)': 0,
      'Holding Capacity (x100)': Math.round(d.capacityPersons / 100),
      'Safety Score (CCAS)': d.ccasScore
    }));

    return [...dangerSectors, ...safeDestinations];
  }, [profile]);


  return (
    <div className="space-y-4 pb-12 w-full font-sans">
      
      {/* =========================================================================
          1. TOP COMMAND HEADER (POWER BI / ARCGIS OPERATIONS STYLE)
          ========================================================================= */}
      <div className={`p-4 rounded-2xl border shadow-sm transition-all flex flex-col gap-3 ${
        theme === 'light'
          ? 'bg-white border-slate-200'
          : 'bg-[#0B1310] border-[#1A2E24]'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Branding & Subtitle */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl border shrink-0 ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#08100C] border-[#1A2E24]'
            }`}>
              {getHazardIcon(hazardKey, "w-6 h-6")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-[#00897B] tracking-wider uppercase">NIVARA</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-mono text-slate-500 uppercase">Multi-Hazard Risk & Relocation Intelligence</span>
              </div>
              <h1 className={`text-xl sm:text-2xl font-black font-sans tracking-tight uppercase mt-0.5 ${
                theme === 'light' ? 'text-slate-950' : 'text-white'
              }`}>
                {profile.hazardTypeTitle} — {profile.studyLocation}
              </h1>
            </div>
          </div>

          {/* Right: Operational Status, Timestamp & Alert */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            {/* Timestamp */}
            <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border ${
              theme === 'light' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-[#070D0A] text-slate-300 border-[#1A2E24]'
            }`}>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Updated: 12 Sep 2026 | 18:30 IST</span>
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================================
          2. EXECUTIVE KPI STRIP (7 HIGH-VALUE POWER BI DECISION METRICS)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {executiveKpis.map((kpi, idx) => {
          const isRose = kpi.color === 'rose';
          const isAmber = kpi.color === 'amber';
          const isEmerald = kpi.color === 'emerald';

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border shadow-sm transition-all flex flex-col justify-between ${
                theme === 'light'
                  ? 'bg-white border-slate-200 shadow-2xs hover:shadow-xs'
                  : 'bg-[#0B1310] border-[#1A2E24] hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 truncate">
                {kpi.title}
              </div>
              <div className="my-1.5 flex items-baseline gap-1 flex-wrap">
                <span className={`text-lg sm:text-xl font-black font-mono tracking-tight leading-none ${
                  isRose 
                    ? 'text-rose-600 dark:text-rose-400' 
                    : isAmber 
                      ? 'text-amber-600 dark:text-amber-400'
                      : isEmerald 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : (theme === 'light' ? 'text-slate-900' : 'text-white')
                }`}>
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className={`text-[10px] font-mono font-bold ${
                    isRose ? 'text-rose-500' : isEmerald ? 'text-emerald-500' : 'text-slate-500'
                  }`}>
                    {kpi.unit}
                  </span>
                )}
              </div>
              <div className="text-[9.5px] text-slate-500 font-mono truncate">
                {kpi.sub}
              </div>
              <div className="mt-1 pt-1 border-t border-slate-100 dark:border-[#14241C] text-[8.5px] text-slate-400 font-mono flex items-center justify-between">
                <span>SRC:</span>
                <span className="truncate font-semibold">{kpi.provenance}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          3. MAIN GIS COMMAND THEATER: SPLIT LAYOUT (MAP ~62% + ANALYTICS ~38%)
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start w-full">
        
        {/* Left Column (62%): Large Integrated 3D GIS Command Map */}
        <div className="xl:col-span-7 2xl:col-span-8 w-full h-[640px] xl:h-[720px] min-h-[580px]">
          <OverviewGisMap 
            hazardKey={hazardKey} 
            theme={theme} 
            onNavigateToModule={selectHazardModule} 
            selectedSafeSiteId={selectedSafeSiteId}
            onSelectSafeSiteId={setSelectedSafeSiteId}
          />
        </div>

        {/* Right Column (38%): Analytical & Decision Panels */}
        <div className="xl:col-span-5 2xl:col-span-4 w-full xl:h-[720px] xl:overflow-y-auto pr-0 xl:pr-1 space-y-4">
          <OverviewAnalyticsCards
            hazardKey={hazardKey}
            theme={theme}
            onNavigateToModule={selectHazardModule}
            selectedSafeSiteId={selectedSafeSiteId}
            onSelectSafeSiteId={setSelectedSafeSiteId}
          />
        </div>

      </div>

      {/* =========================================================================
          4. EXECUTIVE MULTI-SECTOR HAZARD & CAPACITY DIFFERENTIAL ANALYSIS
          ========================================================================= */}
      <div className={`p-4 lg:p-5 rounded-2xl border shadow-sm transition-all ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0B1310] border-[#1A2E24]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b mb-4 border-slate-200 dark:border-[#1A2E24]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-mono text-sm font-bold tracking-wide uppercase ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  MULTI-SECTOR HAZARD RISK &amp; SAFE CAPACITY DIFFERENTIAL ANALYSIS
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/60">
                  DIFF CHARTS
                </span>
              </div>
              <p className={`text-[11px] font-sans ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Cross-sector comparative differential: Relocation Priority Index (RPI) vs Exposed Caseload vs Certified Safe Intake Capacity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('area-comparison')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Full Sector Diff Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Grouped Bar Chart of Sector Differentials */}
        <div className="h-72 w-full bg-[#09120E] rounded-xl border border-[#1A2E24] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewDifferentialData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#1A2E24" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'Space Grotesk' }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ backgroundColor: '#070D0A', borderColor: '#1A2E24', color: '#F8FAFC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk' }} />
              <Bar dataKey="Hazard Severity (RPI)" fill="#E8543E" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Exposed Pax (x100)" fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Holding Capacity (x100)" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Safety Score (CCAS)" fill="#38BDF8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Differential Insight Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-[#1A2E24] text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#070D0A] border border-[#1A2E24] flex items-center justify-between">
            <span className="text-slate-400">Critical Red Zone Delta:</span>
            <span className="text-rose-400 font-bold">{metrics.immediateEvacuees.toLocaleString()} Pax Urgent P1</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070D0A] border border-[#1A2E24] flex items-center justify-between">
            <span className="text-slate-400">Total Safe Refuge Capacity:</span>
            <span className="text-emerald-400 font-bold">{profile.safeDestinations.reduce((s, d) => s + d.capacityPersons, 0).toLocaleString()} Pax Available</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#070D0A] border border-[#1A2E24] flex items-center justify-between">
            <span className="text-slate-400">Intake Headroom Differential:</span>
            <span className="text-cyan-400 font-bold">
              +{profile.safeDestinations.reduce((s, d) => s + d.capacityPersons, 0) - metrics.immediateEvacuees} Pax Surplus Buffer
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. 4-WAY STRATEGIC RELOCATION & MULTI-MODEL CLEARANCE MATRIX
          ========================================================================= */}
      {profile.safeDestinations.length > 1 && (
        <div className={`p-4 lg:p-5 rounded-2xl border shadow-sm transition-all ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0B1310] border-[#1A2E24]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b mb-3 border-slate-200 dark:border-[#1A2E24]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-mono text-sm font-bold tracking-wide uppercase ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  4-WAY RELOCATION & SAFETY CLEARANCE MATRIX // BAYESIAN & XGBOOST CERTIFIED
                </h3>
                <p className={`text-[11px] font-sans ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Systematic multi-criteria evaluation of all 4 certified safe destinations based on geotechnical stability, CCAS capacity, and fastest evacuation corridors.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                theme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border-emerald-600'
              }`}>
                ● 4 CERTIFIED SAFE ZONES
              </span>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {profile.safeDestinations.map((dest, idx) => {
              const rank = dest.rank || idx + 1;
              const isRank1 = rank === 1;
              const isSelected = selectedSafeSiteId === dest.id;

              return (
                <div
                  key={dest.id}
                  onClick={() => setSelectedSafeSiteId(dest.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? theme === 'light'
                        ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-400'
                        : 'bg-[#10221A] border-emerald-500 ring-2 ring-emerald-400'
                      : theme === 'light'
                        ? 'bg-white hover:bg-slate-50 border-slate-300 shadow-xs'
                        : 'bg-[#0E1A15] hover:bg-[#12221B] border-[#1A2E24]'
                  }`}
                >
                  <div>
                    {/* Header & Badges */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                        theme === 'light'
                          ? isRank1
                            ? 'bg-amber-100 text-amber-950 border border-amber-400 font-black'
                            : rank === 2
                              ? 'bg-teal-100 text-teal-950 border border-teal-400 font-black'
                              : rank === 3
                                ? 'bg-sky-100 text-sky-950 border border-sky-400 font-black'
                                : 'bg-emerald-100 text-emerald-950 border border-emerald-400 font-black'
                          : isRank1
                            ? 'bg-amber-950/80 text-amber-200 border border-amber-700/60'
                            : rank === 2
                              ? 'bg-teal-950/80 text-teal-200 border border-teal-700/60'
                              : rank === 3
                                ? 'bg-sky-950/80 text-sky-200 border border-sky-700/60'
                                : 'bg-emerald-950/80 text-emerald-200 border border-emerald-700/60'
                      }`}>
                        {dest.rankLabel || `RANK #${rank}`}
                      </span>
                      <span className={`text-[11px] font-mono font-black ${
                        theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'
                      }`}>
                        CCAS {dest.ccasScore}/100
                      </span>
                    </div>

                    {/* Title & Location */}
                    <h4 className={`text-xs font-black leading-snug truncate ${
                      theme === 'light' ? 'text-slate-950' : 'text-white'
                    }`}>
                      {dest.name}
                    </h4>
                    <div className={`text-[10px] font-mono truncate mt-0.5 ${
                      theme === 'light' ? 'text-slate-600 font-semibold' : 'text-slate-400'
                    }`}>
                      {dest.location}
                    </div>

                    {/* ML Probabilities & Geotechnical Metrics */}
                    <div className={`grid grid-cols-2 gap-2 mt-2.5 text-[10px] font-mono p-2.5 rounded-lg border ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 shadow-2xs'
                        : 'bg-black/30 border-[#1E3228]'
                    }`}>
                      <div>
                        <span className={`block text-[9px] uppercase tracking-wider font-bold ${
                          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          Bayesian Safe
                        </span>
                        <strong className={`text-xs ${
                          theme === 'light' ? 'text-emerald-700 font-black' : 'text-emerald-400 font-bold'
                        }`}>
                          {dest.bayesianSafetyProb || 98}%
                        </strong>
                      </div>
                      <div>
                        <span className={`block text-[9px] uppercase tracking-wider font-bold ${
                          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          XGBoost Stability
                        </span>
                        <strong className={`text-xs ${
                          theme === 'light' ? 'text-emerald-700 font-black' : 'text-emerald-400 font-bold'
                        }`}>
                          {dest.xgboostStabilityScore || 97}%
                        </strong>
                      </div>
                      <div>
                        <span className={`block text-[9px] uppercase tracking-wider font-bold ${
                          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          Holding Cap
                        </span>
                        <strong className={`text-xs ${
                          theme === 'light' ? 'text-slate-950 font-black' : 'text-slate-200 font-bold'
                        }`}>
                          {dest.capacityPersons.toLocaleString()} Pax
                        </strong>
                      </div>
                      <div>
                        <span className={`block text-[9px] uppercase tracking-wider font-bold ${
                          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          Terrain Slope
                        </span>
                        <strong className={`text-xs ${
                          theme === 'light' ? 'text-slate-950 font-black' : 'text-slate-200 font-bold'
                        }`}>
                          {dest.slopeDeg || 3.8}°
                        </strong>
                      </div>
                    </div>

                    {/* Route Tag */}
                    <div className={`mt-2.5 text-[10px] font-mono flex items-center justify-between ${
                      theme === 'light' ? 'text-slate-700 font-semibold' : 'text-slate-400'
                    }`}>
                      <span>Corridor: <strong className={theme === 'light' ? 'text-slate-950 font-bold' : 'text-white'}>{dest.distanceKm || 14.8} km</strong></span>
                      <span className={`font-black ${
                        theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'
                      }`}>⚡ {dest.transitMins} mins</span>
                    </div>
                    {dest.fastestRouteBadge && (
                      <div className={`mt-1.5 text-[9px] font-mono font-black px-2 py-1 rounded border truncate ${
                        theme === 'light'
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                          : 'bg-emerald-950/70 text-emerald-300 border-emerald-700'
                      }`}>
                        {dest.fastestRouteBadge}
                      </div>
                    )}
                  </div>

                  {/* Select Corridor Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSafeSiteId(dest.id);
                    }}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#00897B] text-white border-[#00897B] shadow-xs'
                        : theme === 'light'
                          ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300 shadow-2xs font-black'
                          : 'bg-[#15271E] hover:bg-[#1C3328] text-slate-200 border-[#223E30]'
                    }`}
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isSelected ? 'ACTIVE ON MAP' : 'ACTIVATE ROUTE ON MAP'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default CommandCenterOverview;
