import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  generateLiveReportData, 
  generateLivePdfReport, 
  LiveReportData,
  PriorityAreaItem 
} from '../../services/reportDataService';
import { HazardType } from '../../types';
import { 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Clock, 
  FileText, 
  Building2, 
  Radio, 
  Mountain, 
  Droplets, 
  CloudLightning, 
  Waves,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';

interface ExecutiveSitrepReportProps {
  hazardKey: HazardType;
  theme?: 'dark' | 'light';
}

export const ExecutiveSitrepReport: React.FC<ExecutiveSitrepReportProps> = ({ 
  hazardKey, 
  theme = 'dark' 
}) => {
  const { 
    data, 
    liveWeather, 
    selectedVillage, 
    rainfallMultiplier, 
    selectedSite, 
    selectedRiskFilter 
  } = useApp();

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Generate live calibrated report data for the selected hazard
  const report: LiveReportData = useMemo(() => {
    return generateLiveReportData(
      data,
      liveWeather,
      selectedVillage,
      rainfallMultiplier,
      selectedSite,
      selectedRiskFilter,
      hazardKey
    );
  }, [data, liveWeather, selectedVillage, rainfallMultiplier, selectedSite, selectedRiskFilter, hazardKey]);

  // Candidate safe lands data calibrated per disaster
  const candidateSafeSites = useMemo(() => {
    switch (hazardKey) {
      case 'flood':
        return [
          { id: 'AS-DIB-S01', name: 'Lepetkata Elevated High Ground', score: 94.1, area: '22.0 Ha (1.8°)', cap: '3,500 persons (700 fam)', transit: '15 mins (NH-37)', util: 'Dedicated Water Treatment Plant, PWD Base' },
          { id: 'AS-DIB-S02', name: 'Chowkidinghee Institutional Complex', score: 91.5, area: '12.5 Ha (1.2°)', cap: '2,800 persons (560 fam)', transit: '10 mins (Urban Trunk)', util: 'Grid Substation, Civil Hospital Link' },
          { id: 'AS-DIB-S03', name: 'Barbaruah Flood Shelter Mound', score: 88.0, area: '9.0 Ha (2.0°)', cap: '1,600 persons (320 fam)', transit: '25 mins (Embankment Link)', util: 'Solar Microgrid, Deep Tube Well' },
          { id: 'AS-DIB-S04', name: 'Mohanbari Buffer Ridge', score: 85.3, area: '8.5 Ha (1.5°)', cap: '1,200 persons (240 fam)', transit: '20 mins (Airport Access)', util: 'Overhead Gravity Tank, Food Supply Depot' }
        ];
      case 'cloudburst':
        return [
          { id: 'UK-KED-S01', name: 'Guptkashi High Tableland Zone', score: 95.0, area: '18.0 Ha (4.2°)', cap: '2,500 persons (500 fam)', transit: '30 mins (NH-107)', util: 'Spring Water Pipeline, High-Altitude Clinic' },
          { id: 'UK-KED-S02', name: 'Phata Plateau Haven', score: 91.2, area: '11.5 Ha (5.1°)', cap: '1,800 persons (360 fam)', transit: '18 mins (Helipad Corridor)', util: '33kV Substation, SDRF Staging Base' },
          { id: 'UK-KED-S03', name: 'Rampur Institutional Safe Ground', score: 86.8, area: '8.0 Ha (6.0°)', cap: '1,100 persons (220 fam)', transit: '22 mins (PWD Bypass)', util: 'Borewell Supply, Satellite Communications' },
          { id: 'UK-KED-S04', name: 'Agastyamuni Valley Bench', score: 84.0, area: '7.2 Ha (5.5°)', cap: '800 persons (160 fam)', transit: '40 mins (River Terrace Rd)', util: 'Community Gravity Post, Disaster Shed' }
        ];
      case 'coastal-erosion':
        return [
          { id: 'OD-BHM-S01', name: 'Baghalati Enclave Inland Safe Zone', score: 89.0, area: '26.0 Ha (1.5°)', cap: '2,200 persons (440 fam)', transit: '25 mins (SH-32)', util: 'Piped Potable Supply, Primary Health Post' },
          { id: 'OD-BHM-S02', name: 'Golanthara Highland Reserve', score: 86.5, area: '15.0 Ha (2.1°)', cap: '1,400 persons (280 fam)', transit: '20 mins (NH-16 Link)', util: 'Substation Connection, Multi-Purpose Cyclone Shelter' },
          { id: 'OD-BHM-S03', name: 'Kanisi Inland Mound', score: 83.2, area: '9.5 Ha (2.8°)', cap: '800 persons (160 fam)', transit: '18 mins (Rural Arterial)', util: 'Community Well, Primary School Haven' },
          { id: 'OD-BHM-S04', name: 'Rangeilunda Buffer Terrace', score: 81.4, area: '7.0 Ha (3.0°)', cap: '600 persons (120 fam)', transit: '15 mins (District Highway)', util: '11kV Line, Relief Distribution Hub' }
        ];
      default: // landslide
        return [
          { id: 'KL-WYD-S01', name: 'Kalpetta-Vythiri Institutional Reserve', score: 93.4, area: '14.2 Ha (3.2°)', cap: '2,400 persons (600 fam)', transit: '22 mins (NH-766)', util: 'Overhead Gravity Tank, PWD Hospital Post' },
          { id: 'KL-WYD-S02', name: 'Kuppadithara North Plateau (Safe Zone A)', score: 90.2, area: '9.8 Ha (4.6°)', cap: '1,680 persons (420 fam)', transit: '28 mins (SH-54)', util: '12k LPH High-Yield Borewell, Power Line' },
          { id: 'KL-WYD-S03', name: 'Kottathara Valley South Safe Buffer', score: 87.5, area: '7.4 Ha (5.2°)', cap: '1,280 persons (320 fam)', transit: '35 mins (Blacktop Road)', util: 'Spring Water Line, Transit Sheds' },
          { id: 'KL-WYD-S04', name: 'Achoor East Ridgeline Foothill', score: 83.6, area: '6.2 Ha (6.8°)', cap: '1,000 persons (250 fam)', transit: '18 mins (Estate Main Road)', util: 'Substation Line, Relief Storage' }
        ];
    }
  }, [hazardKey]);

  // DIRECT PDF DOWNLOAD - Triggers doc.save() directly without print dialog
  const handleDownloadPdf = () => {
    try {
      setPdfGenerating(true);
      generateLivePdfReport(report);
      
      const cleanLoc = (report.districtLocation || 'Jurisdiction').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `NIVARA_SitRep_${cleanLoc}_${report.districtStatus}.pdf`;
      setDownloadNotice(`Official Situation Report "${filename}" generated and downloaded directly to your computer.`);
      
      setTimeout(() => setDownloadNotice(null), 7000);
    } catch (err: any) {
      console.error('Direct PDF download error:', err);
      alert('PDF generation encountered an issue. Please retry.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">

      {/* =========================================================================
          CONTROL & ACTION TOOLBAR (DIRECT PDF FILE DOWNLOAD ONLY)
          ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        isLight 
          ? 'bg-white border-slate-200' 
          : 'bg-[#0B1611] border-[#1B3125]'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white flex items-center gap-2">
                Disaster Incident Situation Report (SITREP) Console
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">
                OFFICIAL REPORT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Official NDMA / SDMA decision document &bull; Direct PDF file download &bull; Zero print dialogue
            </p>
          </div>
        </div>

        <div className="flex items-center">
          {/* PRIMARY: DOWNLOAD OFFICIAL SITREP (PDF) BUTTON */}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfGenerating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-mono font-bold flex items-center gap-2.5 transition-all shadow-xl shadow-emerald-950/70 border border-emerald-400/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className={`w-4 h-4 text-white ${pdfGenerating ? 'animate-bounce' : ''}`} />
            <span>{pdfGenerating ? 'GENERATING PDF DOCUMENT...' : 'DOWNLOAD OFFICIAL SITREP (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Direct Download Toast Notification */}
      {downloadNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 font-mono text-xs flex items-center gap-3 shadow-2xl animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <strong>Direct Download Complete:</strong> {downloadNotice}
          </div>
        </div>
      )}

      {/* =========================================================================
          THE OFFICIAL SITUATION REPORT DOCUMENT CANVAS
          ========================================================================= */}
      <div className={`p-6 sm:p-10 rounded-2xl border space-y-8 shadow-2xl transition-colors ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-900' 
          : 'bg-[#09120E] border-[#172B20] text-slate-100'
      }`}>

        {/* 1. OFFICIAL DOCUMENT HEADER */}
        <div className="border-b-2 border-emerald-600/60 pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                <span>GOVERNMENT OF INDIA</span>
                <span>&bull;</span>
                <span>{report.commandingAgency}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
                NIVARA DISASTER INCIDENT SITUATION REPORT (SITREP)
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-300">
                <span className="font-bold">{report.districtLocation}</span>
                <span>&bull;</span>
                <span className="text-slate-400">{report.hazardTitle}</span>
              </div>
            </div>

            {/* Tracking Code & District Status */}
            <div className="flex flex-col sm:items-end gap-2 shrink-0 font-mono">
              <div className="px-3 py-1.5 rounded-lg bg-[#0E1E17] border border-[#223F30] text-right">
                <span className="text-[10px] text-slate-400 uppercase block">INCIDENT CODE</span>
                <span className="text-sm font-bold text-emerald-400">{report.incidentTrackingCode}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg bg-rose-950/90 border border-rose-600 text-rose-200 font-bold text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>DISTRICT STATUS: {report.districtStatus}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono text-slate-300 border-t border-[#172B20]">
            <div><strong className="text-slate-400">REPORTED:</strong> {report.generatedDateFormatted}</div>
            <div><strong className="text-slate-400">WINDOW:</strong> {report.reportingPeriod}</div>
            <div><strong className="text-slate-400">LEAD AGENCY:</strong> {report.commandingAgency.split('(')[0]}</div>
            <div><strong className="text-slate-400">OFFICER:</strong> {report.commandingOfficer.split(',')[0]}</div>
          </div>
        </div>

        {/* 2. CORE QUESTION 1: WHAT IS THE CURRENT SITUATION? (EXECUTIVE SUMMARY) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
              <span>1. Executive Incident Appraisal</span>
              <span className="text-[10px] text-slate-400 font-normal">[Q1: What is the current situation?]</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
              Threat: {report.districtStatusLabel}
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-xl border leading-relaxed text-sm font-sans ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0D1A14] border-[#1E372A] text-slate-200'
          }`}>
            {report.executiveSummary}
          </div>
        </section>

        {/* 3. CORE QUESTION 3: HOW MANY PEOPLE / FAMILIES ARE AFFECTED? (SITUATION AT A GLANCE) */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
            <span>2. Current Situation at a Glance</span>
            <span className="text-[10px] text-slate-400 font-normal">[Q3: How many people/families are affected?]</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className={`p-3.5 rounded-xl border font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase">Critical Habitations</div>
              <div className="text-xl font-bold text-rose-400 mt-1">
                {report.situationAtAGlance.criticalHabitations} Area
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Priority 1 Evacuation</div>
            </div>

            <div className={`p-3.5 rounded-xl border font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase">High-Risk Habitations</div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {report.situationAtAGlance.highRiskHabitations} Areas
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Secondary Warning</div>
            </div>

            <div className={`p-3.5 rounded-xl border font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase">Population at Risk</div>
              <div className="text-xl font-bold text-white mt-1">
                {report.situationAtAGlance.populationAtRisk.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{report.situationAtAGlance.familiesAtRisk} Families</div>
            </div>

            <div className={`p-3.5 rounded-xl border font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase">Safe Haven Capacity</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {report.situationAtAGlance.availableRelocationCapacity.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Across 4 Safe Lands</div>
            </div>

            <div className={`p-3.5 rounded-xl border font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase">Capacity Status</div>
              <div className="text-sm font-bold text-emerald-300 mt-2">
                {report.relocationStatus.isSufficient ? 'SUFFICIENT' : 'DEFICIT'}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">
                {report.relocationStatus.capacitySurplusOrGap >= 0 ? '+' : ''}
                {report.relocationStatus.capacitySurplusOrGap.toLocaleString()} Surplus
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase">Active Warning</div>
              <div className="text-xs font-bold text-rose-400 mt-2 line-clamp-2">
                {report.situationAtAGlance.activeWeatherAlert.split('—')[0]}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">IMD AWS Trigger</div>
            </div>
          </div>
        </section>

        {/* 4. CORE QUESTION 2: WHERE ARE THE CRITICAL AREAS? (PRIORITY HABITATIONS REGISTER) */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
            <span>3. Priority Areas & Habitations (Top Vulnerable Zones)</span>
            <span className="text-[10px] text-slate-400 font-normal">[Q2: Where are the critical areas?]</span>
          </h3>

          <div className={`overflow-x-auto rounded-xl border ${
            isLight ? 'border-slate-200' : 'border-[#1E372A]'
          }`}>
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className={isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#0E1F18] text-slate-300'}>
                  <th className="p-3 border-b border-[#1E372A]">Priority & Habitation</th>
                  <th className="p-3 border-b border-[#1E372A]">Threat Level</th>
                  <th className="p-3 border-b border-[#1E372A]">Exposed (Families)</th>
                  <th className="p-3 border-b border-[#1E372A]">Primary Hazard Mechanism</th>
                  <th className="p-3 border-b border-[#1E372A]">Mandated Immediate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172B20]">
                {report.priorityAreas.map((area: PriorityAreaItem) => (
                  <tr key={area.priority} className={
                    area.priority === 1 
                      ? 'bg-rose-950/20 hover:bg-rose-950/30' 
                      : isLight ? 'hover:bg-slate-50' : 'hover:bg-[#0E1E17]'
                  }>
                    <td className="p-3">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 text-[10px] flex items-center justify-center font-bold">
                          #{area.priority}
                        </span>
                        <span>{area.habitation}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        area.riskLevel === 'CRITICAL' 
                          ? 'bg-rose-950 text-rose-300 border border-rose-600' 
                          : area.riskLevel === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      }`}>
                        {area.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-200">
                      {area.peopleAtRisk.toLocaleString()} <span className="text-slate-400 font-normal">({area.familiesAtRisk} fam)</span>
                    </td>
                    <td className="p-3 text-slate-300 text-[11px] max-w-xs leading-relaxed">
                      {area.mainHazard}
                    </td>
                    <td className="p-3 text-emerald-400 font-medium text-[11px] max-w-xs leading-relaxed">
                      {area.requiredAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. CORE QUESTION 4: WHAT HAS CHANGED OR TRIGGERED THE ALERT? (PHYSICAL RISK DRIVERS) */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
            <span>4. Physical & Hydro-Meteorological Triggers</span>
            <span className="text-[10px] text-slate-400 font-normal">[Q4: What has changed or triggered the current alert?]</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {report.riskDrivers.map((driver, dIdx) => (
              <div 
                key={dIdx} 
                className={`p-4 rounded-xl border space-y-1.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{driver.icon}</span>
                  <span className="font-mono text-xs font-bold text-white">{driver.title}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {driver.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CORE QUESTION 5: ACTIONS REQUIRED VS ACTIONS COMPLETED (DUAL DIRECTIVE) */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
            <span>5. Operational Actions Directive</span>
            <span className="text-[10px] text-slate-400 font-normal">[Q5: What action should be taken now vs already taken?]</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* IMMEDIATE GOVERNMENT ACTIONS REQUIRED (ACTION NOW) */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-rose-50/50 border-rose-200' : 'bg-[#180F12] border-rose-900/60'
            }`}>
              <div className="flex items-center justify-between border-b border-rose-900/40 pb-2">
                <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Immediate Government Actions Required (Action Now)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  HIGH PRIORITY
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs text-slate-200">
                {report.immediateActionsRequired.map((act, aIdx) => (
                  <div key={aIdx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0 text-[10px] mt-0.5">
                      {aIdx + 1}
                    </span>
                    <span className="leading-relaxed">{act.replace(/^[0-9]+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS COMPLETED / IN PROGRESS */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#0B1A13] border-emerald-900/60'
            }`}>
              <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Actions Already Completed / In Progress</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs text-slate-300">
                {report.actionsCompleted.map((act, cIdx) => (
                  <div key={cIdx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[10px] mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{act.replace(/^[✓x]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. CANDIDATE SAFE RELOCATION LANDS AUDIT */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              6. Screened Safe Relocation Lands Audit (SPHERE Standard Certified)
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Surplus: +{report.relocationStatus.capacitySurplusOrGap.toLocaleString()} Persons Capacity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {candidateSafeSites.map((site) => (
              <div 
                key={site.id} 
                className={`p-4 rounded-xl border space-y-2 font-mono ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold">{site.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    CCAS: {site.score}/100
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white font-sans line-clamp-1">{site.name}</h4>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div><strong>Capacity:</strong> {site.cap}</div>
                  <div><strong>Usable Land:</strong> {site.area}</div>
                  <div><strong>Transit:</strong> {site.transit}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1"><strong>Utilities:</strong> {site.util}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. SYSTEM ALGORITHMIC RECOMMENDATION */}
        <section className={`p-4 sm:p-5 rounded-xl border font-sans ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0E1E17] border-[#223F30]'
        }`}>
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5" />
            <span>NIVARA System Algorithmic Recommendation</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic">
            "{report.nivaraRecommendation}"
          </p>
        </section>

        {/* 9. PROMINENT 30-SECOND EXECUTIVE DECISION BOX */}
        <section className="rounded-2xl bg-gradient-to-br from-[#0B1526] to-[#08101E] border-2 border-rose-500/80 p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-500/40 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                30-SECOND EXECUTIVE DECISION BRIEFING
              </h3>
            </div>
            <span className="px-3 py-1 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold uppercase tracking-wider border border-rose-500/40">
              URGENCY: {report.finalExecutiveBlock.urgency}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">CURRENT SITUATION:</span>
                <span className="text-slate-200 text-xs font-sans leading-relaxed">{report.finalExecutiveBlock.situation}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">PRIORITY TARGET ZONE:</span>
                <span className="text-rose-300 font-bold">{report.finalExecutiveBlock.priorityArea}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">POPULATION AT IMMINENT RISK:</span>
                <span className="text-white font-bold">{report.finalExecutiveBlock.peopleAtRisk.toLocaleString()} Persons</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">MANDATED GOVERNMENT ACTION:</span>
                <span className="text-emerald-300 font-bold text-xs">{report.finalExecutiveBlock.recommendedAction}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">DESIGNATED SAFE HAVEN:</span>
                <span className="text-slate-200">{report.finalExecutiveBlock.relocationSite}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">LAND CARRYING CAPACITY STATUS:</span>
                <span className="text-emerald-400 font-bold">{report.finalExecutiveBlock.capacityStatus}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 10. OFFICIAL SIGN-OFF AUTHORITY & DISPATCH SEAL */}
        <div className="pt-6 border-t-2 border-[#1E372A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1 font-mono text-xs">
            <div className="text-slate-400 text-[10px] uppercase font-bold">AUTHORIZED REPORTING OFFICER:</div>
            <div className="text-sm font-bold text-white">{report.commandingOfficer}</div>
            <div className="text-slate-400">{report.commandingRole}</div>
            <div className="text-emerald-400 font-bold">{report.commandingAgency}</div>
          </div>

          <div className="border-2 border-dashed border-emerald-500/60 p-4 rounded-xl text-center font-mono text-xs bg-[#0B1A13]/50">
            <div className="text-slate-400 text-[10px] uppercase font-bold">OFFICIAL SDMA DISPATCH STAMP</div>
            <div className="text-emerald-300 font-bold text-sm my-1 tracking-wider">
              DISPATCH AUTHORIZED • LEVEL-1 ALERT
            </div>
            <div className="text-[10px] text-slate-400">
              VERIFIED VIA NIVARA MULTI-HAZARD DECISION SUPPORT SYSTEM
            </div>
          </div>
        </div>

        {/* 11. DATA CONFIDENCE & AUDIT NOTE */}
        <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-2 border-t border-[#172B20]">
          <div>
            <strong>Telemetry Status:</strong> {report.dataConfidenceNote.dataStatus} &bull; 
            <strong> Last Updated:</strong> {report.dataConfidenceNote.lastUpdated} &bull; 
            <strong> Sources:</strong> {report.dataConfidenceNote.primarySources}
          </div>
          <div className="text-slate-500 text-[10px]">
            {report.dataConfidenceNote.prototypeNotice}
          </div>
        </div>

      </div>

    </div>
  );
};
