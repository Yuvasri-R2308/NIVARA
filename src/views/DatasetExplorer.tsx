import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DataConfidenceTag } from '../components/DataConfidenceTag';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Database, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const DatasetExplorer: React.FC = () => {
  const { data } = useApp();
  const [selectedTable, setSelectedTable] = useState<'parcels' | 'sites' | 'flood' | 'weather' | 'sources' | 'roadmap'>('parcels');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  if (!data) return null;

  const { parcels, candidate_sites, flood_scenarios, weather_series, source_registers, roadmap_items } = data;

  const tableDefinitions = [
    { id: 'parcels', label: 'Cadastral Parcels', count: parcels.length, confidence: 'LOW', desc: '1,000 synthetic prototype parcels with multi-hazard ratings' },
    { id: 'sites', label: 'Candidate Safe Sites', count: candidate_sites.length, confidence: 'HIGH', desc: 'Screened candidate relocation land parcels' },
    { id: 'flood', label: 'Flood Scenarios (KSDMA)', count: flood_scenarios.length, confidence: 'HIGH', desc: '10/25/50/100/200/500-yr return period flood models' },
    { id: 'weather', label: 'Hourly Hydrometeorology', count: weather_series.length, confidence: 'HIGH', desc: 'Hourly precipitation and soil moisture readings' },
    { id: 'sources', label: 'Official Source Citations', count: source_registers.length, confidence: 'HIGH', desc: 'Cited official government authority registers' },
    { id: 'roadmap', label: 'Data Gap Roadmap', count: roadmap_items.length, confidence: 'HIGH', desc: 'Planned GIS and cadastral data integrations' },
  ];

  // Search filtering per table
  const filteredData = useMemo(() => {
    setPage(1); // reset page on filter change
    const q = query.toLowerCase();

    if (selectedTable === 'parcels') {
      return parcels.filter(p => !q || p.parcel_id.toLowerCase().includes(q) || p.village.toLowerCase().includes(q) || p.land_use.toLowerCase().includes(q));
    }
    if (selectedTable === 'sites') {
      return candidate_sites.filter(s => !q || s.name.toLowerCase().includes(q) || s.village.toLowerCase().includes(q));
    }
    if (selectedTable === 'flood') {
      return flood_scenarios.filter(f => !q || f.scenario.toLowerCase().includes(q));
    }
    if (selectedTable === 'weather') {
      return weather_series.filter(w => !q || w.time.toLowerCase().includes(q));
    }
    if (selectedTable === 'sources') {
      return source_registers.filter(s => !q || s.dataset.toLowerCase().includes(q) || s.source_name.toLowerCase().includes(q));
    }
    if (selectedTable === 'roadmap') {
      return roadmap_items.filter(r => !q || r.dataset.toLowerCase().includes(q) || r.what_to_collect.toLowerCase().includes(q));
    }
    return [];
  }, [selectedTable, query, parcels, candidate_sites, flood_scenarios, weather_series, source_registers, roadmap_items]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedRows = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nivara_${selectedTable}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* View Decision Banner */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              EXPLORER MODULE — TABULAR REGISTRY
            </span>
            <span className="text-xs font-mono text-pine-muted">RAW DATASETS & AUDIT EXPLORER</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-pine-text mt-1">
            Raw Datasets, Sources & Schema Explorer
          </h1>
          <p className="text-xs lg:text-sm text-pine-muted mt-1 max-w-3xl">
            <strong>Decision Changed:</strong> Allows government auditors and GIS reviewers to inspect raw records, metadata, column schemas, and verified citations directly in the browser without external SQL/GIS tools.
          </p>
        </div>

        <button
          onClick={handleDownloadJSON}
          className="px-4 py-2 bg-pine-accent hover:bg-emerald-400 text-pine-bg font-mono font-bold text-xs rounded transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT TABLE JSON</span>
        </button>
      </div>

      {/* Dataset Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {tableDefinitions.map((tbl) => {
          const isSelected = selectedTable === tbl.id;
          return (
            <button
              key={tbl.id}
              onClick={() => setSelectedTable(tbl.id as any)}
              className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                isSelected 
                  ? 'bg-pine-accent text-pine-bg font-bold border-pine-accent shadow-sm' 
                  : 'bg-pine-panel text-pine-muted hover:text-pine-text border-pine-border'
              }`}
            >
              <div className="truncate">{tbl.label}</div>
              <div className={`text-[10px] mt-1 ${isSelected ? 'text-pine-bg/80' : 'text-pine-accent'}`}>
                {tbl.count.toLocaleString()} rows
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Table Explorer */}
      <div className="bg-pine-panel border border-pine-border rounded-lg p-5 space-y-4 font-mono text-xs">
        
        {/* Search & Meta Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-pine-border pb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-pine-text text-sm capitalize">{selectedTable} Table</span>
            <span className="text-pine-muted text-xs">({filteredData.length} records matching)</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-pine-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-pine-elevated border border-pine-border rounded pl-8 pr-3 py-1.5 text-xs text-pine-text placeholder:text-pine-muted/60 focus:outline-none focus:border-pine-accent"
            />
          </div>
        </div>

        {/* Dynamic Table Body */}
        <div className="overflow-x-auto min-h-[360px]">
          {selectedTable === 'parcels' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pine-border text-pine-muted text-[11px] uppercase">
                  <th className="pb-2">Parcel ID</th>
                  <th className="pb-2">Village</th>
                  <th className="pb-2">Survey/Sub</th>
                  <th className="pb-2">Area (Ha)</th>
                  <th className="pb-2">Slope (°)</th>
                  <th className="pb-2">Elevation</th>
                  <th className="pb-2">24h Rain</th>
                  <th className="pb-2">Risk Score</th>
                  <th className="pb-2">Risk Level</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-border/60">
                {paginatedRows.map((p: any) => (
                  <tr key={p.parcel_id} className="hover:bg-pine-elevated/40">
                    <td className="py-2 font-bold text-pine-accent">{p.parcel_id}</td>
                    <td className="py-2 text-pine-text">{p.village}</td>
                    <td className="py-2 text-pine-muted">{p.survey_no}/{p.subdivision_no}</td>
                    <td className="py-2">{p.area_ha}</td>
                    <td className="py-2">{p.slope_deg.toFixed(1)}°</td>
                    <td className="py-2">{p.elevation_m}m</td>
                    <td className="py-2 text-cyan-400">{p.rainfall_24h_mm}mm</td>
                    <td className="py-2 font-bold">{p.risk_score}</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.risk_level === 'HIGH' ? 'text-rose-400 bg-rose-950/40' : p.risk_level === 'MEDIUM' ? 'text-amber-300 bg-amber-950/40' : 'text-emerald-400 bg-emerald-950/40'
                      }`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="py-2 text-pine-muted font-sans truncate max-w-xs">{p.recommended_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'sites' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pine-border text-pine-muted text-[11px] uppercase">
                  <th className="pb-2">Site ID</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Village</th>
                  <th className="pb-2">Area (Ha)</th>
                  <th className="pb-2">Slope</th>
                  <th className="pb-2">CCAS Score</th>
                  <th className="pb-2">Families Cap</th>
                  <th className="pb-2">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-border/60">
                {paginatedRows.map((s: any) => (
                  <tr key={s.site_id} className="hover:bg-pine-elevated/40">
                    <td className="py-2.5 font-bold text-emerald-400">{s.site_id}</td>
                    <td className="py-2.5 text-pine-text font-sans font-medium">{s.name}</td>
                    <td className="py-2.5 text-pine-muted">{s.village}</td>
                    <td className="py-2.5">{s.usable_area_ha} Ha</td>
                    <td className="py-2.5">{s.slope_deg}°</td>
                    <td className="py-2.5 font-bold text-pine-accent">{s.ccas_score}</td>
                    <td className="py-2.5 text-white font-bold">{s.capacity_families}</td>
                    <td className="py-2.5"><DataConfidenceTag confidence={s.data_confidence} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'flood' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pine-border text-pine-muted text-[11px] uppercase">
                  <th className="pb-2">Scenario Name</th>
                  <th className="pb-2">Return Period</th>
                  <th className="pb-2">Affected Area (sq km)</th>
                  <th className="pb-2">Hospitals Exposed</th>
                  <th className="pb-2">Schools Exposed</th>
                  <th className="pb-2">Authority Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-border/60">
                {paginatedRows.map((f: any, idx: number) => (
                  <tr key={idx} className="hover:bg-pine-elevated/40">
                    <td className="py-2.5 font-bold text-pine-text">{f.scenario}</td>
                    <td className="py-2.5 text-cyan-400">{f.return_period_years} Years</td>
                    <td className="py-2.5">{f.area_affected_sq_km} km²</td>
                    <td className="py-2.5 text-amber-300">{f.hospitals_exposed}</td>
                    <td className="py-2.5 text-amber-300">{f.schools_exposed}</td>
                    <td className="py-2.5 text-pine-muted font-sans">{f.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'weather' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pine-border text-pine-muted text-[11px] uppercase">
                  <th className="pb-2">Timestamp (UTC)</th>
                  <th className="pb-2">Rain (mm)</th>
                  <th className="pb-2">Showers (mm)</th>
                  <th className="pb-2">Topsoil Moisture (0-1cm)</th>
                  <th className="pb-2">Subsoil Moisture (1-3cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-border/60">
                {paginatedRows.map((w: any, idx: number) => (
                  <tr key={idx} className="hover:bg-pine-elevated/40">
                    <td className="py-2 text-pine-text">{w.time}</td>
                    <td className="py-2 text-cyan-400 font-bold">{w.rain_mm} mm</td>
                    <td className="py-2">{w.showers_mm} mm</td>
                    <td className="py-2 text-emerald-400">{(w.soil_moisture_0_1cm * 100).toFixed(1)}%</td>
                    <td className="py-2 text-rose-400">{(w.soil_moisture_1_3cm * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'sources' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pine-border text-pine-muted text-[11px] uppercase">
                  <th className="pb-2">Dataset Category</th>
                  <th className="pb-2">Official Agency</th>
                  <th className="pb-2">Authority Level</th>
                  <th className="pb-2">Provenance Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-border/60">
                {paginatedRows.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-pine-elevated/40">
                    <td className="py-2.5 font-bold text-pine-accent">{s.dataset}</td>
                    <td className="py-2.5 text-pine-text font-sans font-medium">{s.source_name}</td>
                    <td className="py-2.5 text-emerald-400">{s.authority_type}</td>
                    <td className="py-2.5 text-pine-muted font-sans">{s.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'roadmap' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pine-border text-pine-muted text-[11px] uppercase">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Required Layer</th>
                  <th className="pb-2">Collection Target</th>
                  <th className="pb-2">Purpose</th>
                  <th className="pb-2">Integration Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-border/60">
                {paginatedRows.map((r: any) => (
                  <tr key={r.id} className="hover:bg-pine-elevated/40">
                    <td className="py-2.5 text-pine-muted">#{r.id}</td>
                    <td className="py-2.5 font-bold text-pine-text">{r.dataset}</td>
                    <td className="py-2.5 text-pine-muted font-sans">{r.what_to_collect}</td>
                    <td className="py-2.5 text-pine-muted font-sans">{r.purpose}</td>
                    <td className="py-2.5 text-amber-300">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-pine-border pt-3 text-pine-muted">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded bg-pine-elevated hover:bg-pine-border disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded bg-pine-elevated hover:bg-pine-border disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
