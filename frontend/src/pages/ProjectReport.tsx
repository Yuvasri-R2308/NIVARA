import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateLiveReportData, generateLivePdfReport, LiveReportData } from '../services/reportDataService';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Users, 
  MapPin, 
  ShieldAlert, 
  Clock, 
  Droplets, 
  Mountain, 
  CloudRain, 
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';

export const ProjectReport: React.FC = () => {
  const { 
    data, 
    liveWeather, 
    selectedVillage, 
    rainfallMultiplier, 
    selectedSite, 
    selectedRiskFilter,
    setActiveView 
  } = useApp();

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Collect live system data dynamically from application state
  const report: LiveReportData = useMemo(() => {
    return generateLiveReportData(
      data,
      liveWeather,
      selectedVillage,
      rainfallMultiplier,
      selectedSite,
      selectedRiskFilter
    );
  }, [data, liveWeather, selectedVillage, rainfallMultiplier, selectedSite, selectedRiskFilter]);

  const handleGeneratePdf = () => {
    try {
      setPdfGenerating(true);
      generateLivePdfReport(report);
      setDownloadSuccess('Official Disaster Situation Report PDF generated and downloaded successfully.');
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err: any) {
      console.error('PDF Generation failed:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full font-sans text-base text-pine-text print:p-0 print:bg-white print:text-black">
      
      {/* ==================================================== */}
      {/* 1. REPORT HEADER */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-5 lg:p-7 shadow-panel print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold uppercase tracking-widest text-xs font-mono">
                NIVARA
              </span>
              <span className="text-pine-muted text-xs font-mono tracking-wider font-semibold">
                GOVERNMENT DISASTER DECISION BRIEFING
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-snug">
              NIVARA — Current Disaster Situation Report
            </h1>
            <p className="text-sm sm:text-base text-emerald-400 font-mono mt-1.5 font-bold">
              Wayanad District, Kerala &bull; Disaster Management & Relocation Authority
            </p>
            <div className="text-xs sm:text-sm text-pine-muted font-mono mt-2 flex flex-wrap items-center gap-3">
              <span><strong className="text-slate-200">Generated:</strong> {report.generatedDateFormatted}</span>
              <span>&bull;</span>
              <span><strong className="text-slate-200">Data Window:</strong> {report.reportingPeriod}</span>
            </div>
          </div>

          {/* Action Buttons & Status Badge */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-200 font-mono font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-sm">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span>DISTRICT STATUS: {report.districtStatus}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
              <button
                onClick={handleGeneratePdf}
                disabled={pdfGenerating}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono rounded-xl transition-all shadow-hero-glow flex items-center gap-2 text-sm cursor-pointer"
              >
                <Download className={`w-4 h-4 ${pdfGenerating ? 'animate-bounce' : ''}`} />
                <span>{pdfGenerating ? 'GENERATING PDF...' : 'Generate Live PDF Report'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-[#15241E] hover:bg-[#1E342B] text-pine-text font-bold font-mono rounded-xl border border-[#1E3228] transition-all flex items-center gap-2 text-sm cursor-pointer"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print Report</span>
              </button>

              <button
                onClick={() => setActiveView('sdma-command')}
                className="px-4 py-2.5 bg-[#15241E] hover:bg-[#1E342B] text-pine-muted hover:text-white font-bold font-mono rounded-xl border border-[#1E3228] transition-all flex items-center gap-2 text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-300 font-mono text-sm flex items-center gap-2 animate-fadeIn print:hidden">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 2. EXECUTIVE SUMMARY */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-6 space-y-3 shadow-panel">
        <div className="flex items-center gap-2.5 border-b border-[#1E3228] pb-3">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-serif">
            1. Executive Summary
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed pt-1">
          {report.executiveSummary}
        </p>
      </div>

      {/* ==================================================== */}
      {/* 3. CURRENT SITUATION AT A GLANCE */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-6 space-y-4 shadow-panel">
        <div className="flex items-center justify-between border-b border-[#1E3228] pb-3">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-serif">
              2. Current Situation at a Glance
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-pine-muted font-mono font-medium">Key Operational Metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
          <div className="p-4 bg-[#0B1310] rounded-xl border border-rose-900/70 space-y-1.5 shadow-sm">
            <span className="text-xs text-rose-400 uppercase font-bold block tracking-wider">Critical Habitations</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">{report.situationAtAGlance.criticalHabitations}</div>
            <span className="text-xs text-pine-muted">Immediate action</span>
          </div>

          <div className="p-4 bg-[#0B1310] rounded-xl border border-amber-900/70 space-y-1.5 shadow-sm">
            <span className="text-xs text-amber-300 uppercase font-bold block tracking-wider">High-Risk Habitations</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">{report.situationAtAGlance.highRiskHabitations}</div>
            <span className="text-xs text-pine-muted">Secondary warning</span>
          </div>

          <div className="p-4 bg-[#0B1310] rounded-xl border border-[#1E3228] space-y-1.5 shadow-sm">
            <span className="text-xs text-pine-muted uppercase font-bold block tracking-wider">Population at Risk</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{report.situationAtAGlance.populationAtRisk.toLocaleString()}</div>
            <span className="text-xs text-pine-muted">Persons exposed</span>
          </div>

          <div className="p-4 bg-[#0B1310] rounded-xl border border-[#1E3228] space-y-1.5 shadow-sm">
            <span className="text-xs text-pine-muted uppercase font-bold block tracking-wider">Families at Risk</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">{report.situationAtAGlance.familiesAtRisk.toLocaleString()}</div>
            <span className="text-xs text-rose-300">Vulnerable homes</span>
          </div>

          <div className="p-4 bg-[#0B1310] rounded-xl border border-emerald-900/70 space-y-1.5 shadow-sm">
            <span className="text-xs text-emerald-400 uppercase font-bold block tracking-wider">Relocation Capacity</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{report.situationAtAGlance.availableRelocationCapacity.toLocaleString()}</div>
            <span className="text-xs text-emerald-300">Persons (5 Sites)</span>
          </div>

          <div className="p-4 bg-[#0B1310] rounded-xl border border-[#1E3228] space-y-1.5 shadow-sm">
            <span className="text-xs text-cyan-400 uppercase font-bold block tracking-wider">Active Weather Alert</span>
            <div className="text-base sm:text-lg font-extrabold text-cyan-400 truncate mt-1">RED ALERT</div>
            <span className="text-xs text-pine-muted">Storm surge trigger</span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. PRIORITY AREAS */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-6 space-y-4 shadow-panel">
        <div className="flex items-center justify-between border-b border-[#1E3228] pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-serif">
              3. Priority Areas & Habitations
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-pine-muted font-mono">Sorted by Urgency Tier</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1E3228] text-pine-muted uppercase text-xs font-mono bg-[#0B1310]">
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Habitation / Area</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5 text-right">People at Risk</th>
                <th className="p-3.5">Main Hazard</th>
                <th className="p-3.5">Required Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E3228]">
              {report.priorityAreas.map((area) => (
                <tr key={area.priority} className="hover:bg-[#15241E]/70 transition-colors">
                  <td className="p-3.5 font-bold text-emerald-400 font-mono text-base">#{area.priority}</td>
                  <td className="p-3.5 font-bold text-white text-sm sm:text-base">{area.habitation}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${
                      area.riskLevel === 'CRITICAL' 
                        ? 'bg-rose-950 text-rose-300 border-rose-800' 
                        : area.riskLevel === 'HIGH' 
                        ? 'bg-amber-950 text-amber-300 border-amber-800' 
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {area.riskLevel}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-white text-sm sm:text-base">
                    {area.peopleAtRisk.toLocaleString()} <span className="text-xs text-pine-muted font-normal">({area.familiesAtRisk} fam)</span>
                  </td>
                  <td className="p-3.5 text-slate-300 text-sm max-w-sm">{area.mainHazard}</td>
                  <td className="p-3.5 text-emerald-300 font-sans text-sm font-medium">{area.requiredAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. WHY IS THE SITUATION CRITICAL? (PLAIN LANGUAGE) */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-6 space-y-4 shadow-panel">
        <div className="flex items-center gap-2.5 border-b border-[#1E3228] pb-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-serif">
            4. Why is the Situation Critical? (Main Risk Drivers)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {report.riskDrivers.map((driver, idx) => (
            <div key={idx} className="p-4 bg-[#0B1310] rounded-xl border border-[#1E3228] space-y-2">
              <div className="text-white font-bold text-sm sm:text-base flex items-center gap-2.5">
                <span className="text-lg">{driver.icon}</span>
                <span>{driver.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {driver.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 6. RELOCATION STATUS & CARRYING CAPACITY */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-6 space-y-4 shadow-panel">
        <div className="flex items-center justify-between border-b border-[#1E3228] pb-3">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-serif">
              5. Relocation Capacity & Land Audit
            </h2>
          </div>
          <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold">
            100% READY
          </span>
        </div>

        <div className="space-y-3 text-sm sm:text-base leading-relaxed font-sans">
          <div className="p-4 bg-[#0B1310] rounded-xl border border-[#1E3228] space-y-2.5">
            <p className="text-slate-200">
              <strong className="text-white">Relocation Requirement:</strong> {report.relocationStatus.peopleRequiringRelocation.toLocaleString()} people across {report.relocationStatus.familiesRequiringRelocation} families require immediate relocation assessment.
            </p>
            <p className="text-slate-200">
              <strong className="text-white">Available Capacity:</strong> {report.relocationStatus.availableCapacityPersons.toLocaleString()} persons across {report.relocationStatus.candidateSitesCount} screened government candidate sites.
            </p>
            <p className="text-emerald-400 font-bold">
              <strong>Capacity Status:</strong> {report.relocationStatus.capacitySummaryText}
            </p>
            <p className="text-slate-300 text-sm">
              <strong className="text-white">Primary Resettlement Destination:</strong> <span className="text-emerald-300 font-mono font-bold">{report.relocationStatus.highestPriorityDestination}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 7. IMMEDIATE GOVERNMENT ACTIONS REQUIRED */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-rose-900/80 rounded-2xl p-6 space-y-4 shadow-panel">
        <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-base sm:text-lg font-bold text-rose-300 uppercase tracking-wider font-serif">
              6. Immediate Government Actions (Action Required Now)
            </h2>
          </div>
          <span className="px-3 py-1 rounded bg-rose-950 text-rose-300 border border-rose-700 text-xs font-mono font-bold">
            HIGH PRIORITY
          </span>
        </div>

        <ol className="space-y-2.5 text-sm sm:text-base font-sans list-decimal list-inside text-white/95">
          {report.immediateActionsRequired.map((action, idx) => (
            <li key={idx} className="p-3 bg-[#0B1310] rounded-xl border border-rose-900/40 leading-relaxed">
              <strong className="text-rose-300">Action {idx + 1}:</strong> {action}
            </li>
          ))}
        </ol>
      </div>

      {/* ==================================================== */}
      {/* 8. ACTIONS ALREADY TAKEN */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-6 space-y-4 shadow-panel">
        <div className="flex items-center gap-2.5 border-b border-[#1E3228] pb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-serif">
            7. Actions Completed / In Progress
          </h2>
        </div>

        <ul className="space-y-2.5 text-sm sm:text-base font-sans">
          {report.actionsCompleted.map((action, idx) => (
            <li key={idx} className="p-3 bg-[#0B1310] rounded-xl border border-[#1E3228] flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-mono text-base shrink-0">✓</span>
              <span className="text-slate-200">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ==================================================== */}
      {/* 9. RECOMMENDED DECISION */}
      {/* ==================================================== */}
      <div className="bg-[#111D18] border border-[#1E3228] rounded-2xl p-6 space-y-3 shadow-panel">
        <div className="flex items-center gap-2.5 border-b border-[#1E3228] pb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-serif">
            8. NIVARA Recommendation
          </h2>
        </div>
        <p className="text-sm sm:text-base text-white font-semibold font-sans leading-relaxed pt-1">
          {report.nivaraRecommendation}
        </p>
      </div>

      {/* ==================================================== */}
      {/* 10. FINAL EXECUTIVE BLOCK (PROMINENT 30-SECOND BOX) */}
      {/* ==================================================== */}
      <div className="bg-[#0B1310] border-2 border-rose-600 rounded-2xl p-6 space-y-4 shadow-hero-glow">
        <div className="flex items-center gap-2.5 border-b border-rose-900/80 pb-3">
          <span className="text-xl">🚨</span>
          <h2 className="text-base sm:text-lg font-bold text-rose-400 uppercase tracking-widest font-mono">
            CURRENT GOVERNMENT DECISION REQUIRED (30-SECOND BRIEF)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm sm:text-base font-sans">
          <div className="space-y-2.5">
            <div>
              <span className="text-pine-muted block text-xs font-mono uppercase font-bold tracking-wider">Situation:</span>
              <strong className="text-white text-sm sm:text-base">{report.finalExecutiveBlock.situation}</strong>
            </div>
            <div>
              <span className="text-pine-muted block text-xs font-mono uppercase font-bold tracking-wider">Priority Area:</span>
              <strong className="text-rose-300 font-mono text-sm sm:text-base">{report.finalExecutiveBlock.priorityArea}</strong>
            </div>
            <div>
              <span className="text-pine-muted block text-xs font-mono uppercase font-bold tracking-wider">People at Risk:</span>
              <strong className="text-white font-mono text-sm sm:text-base">{report.finalExecutiveBlock.peopleAtRisk.toLocaleString()} persons (250 families)</strong>
            </div>
            <div>
              <span className="text-pine-muted block text-xs font-mono uppercase font-bold tracking-wider">Risk Level:</span>
              <span className="text-rose-400 font-mono font-bold text-sm sm:text-base">{report.finalExecutiveBlock.riskLevel}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div>
              <span className="text-pine-muted block text-xs font-mono uppercase font-bold tracking-wider">Recommended Action:</span>
              <strong className="text-emerald-300 text-sm sm:text-base">{report.finalExecutiveBlock.recommendedAction}</strong>
            </div>
            <div>
              <span className="text-pine-muted block text-xs font-mono uppercase font-bold tracking-wider">Mobilization Urgency:</span>
              <span className="text-rose-400 font-mono font-bold text-sm sm:text-base">{report.finalExecutiveBlock.urgency}</span>
            </div>
            <div>
              <span className="text-pine-muted block text-xs font-mono uppercase font-bold tracking-wider">Designated Relocation Haven:</span>
              <strong className="text-white font-mono text-sm sm:text-base">{report.finalExecutiveBlock.relocationSite}</strong>
            </div>
            <div>
              <span className="text-pine-muted block text-xs font-mono uppercase font-bold tracking-wider">Land Capacity Status:</span>
              <strong className="text-emerald-400 font-mono text-sm sm:text-base">{report.finalExecutiveBlock.capacityStatus}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 11. DATA & CONFIDENCE NOTE & FOOTER */}
      {/* ==================================================== */}
      <div className="p-5 bg-[#111D18] border border-[#1E3228] rounded-xl space-y-2 text-xs sm:text-sm text-pine-muted font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E3228] pb-2">
          <span><strong className="text-slate-200">Data Status:</strong> {report.dataConfidenceNote.dataStatus} (Updated {report.dataConfidenceNote.lastUpdated})</span>
          <span><strong className="text-slate-200">Sources:</strong> {report.dataConfidenceNote.primarySources}</span>
        </div>
        <p className="text-xs text-pine-muted/80 leading-relaxed">
          {report.dataConfidenceNote.prototypeNotice}
        </p>
        <div className="pt-2.5 border-t border-[#1E3228] flex flex-wrap items-center justify-between text-xs text-pine-muted/70">
          <span>NIVARA — National Intelligent Vulnerability & Automated Relocation Architecture</span>
          <span>Government Disaster Decision Support System | For Official Decision Support</span>
        </div>
      </div>

    </div>
  );
};
