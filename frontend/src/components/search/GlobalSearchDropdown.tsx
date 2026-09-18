import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AREA_HAZARD_REGISTRY, SAFE_SITES_REGISTRY } from '../../data/areaHazardProfiles';
import { DetailedAnalysisModal } from '../modals/DetailedAnalysisModal';
import { 
  Search, 
  MapPin, 
  ShieldAlert, 
  Building, 
  Sliders, 
  Activity, 
  X, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Eye,
  FileText
} from 'lucide-react';

interface Props {
  className?: string;
  onSelectResult?: () => void;
}

export const GlobalSearchDropdown: React.FC<Props> = ({ className, onSelectResult }) => {
  const { 
    data, 
    searchQuery, 
    setSearchQuery, 
    setSelectedVillage, 
    setSelectedParcel, 
    setSelectedSite, 
    setActiveView 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [modalItem, setModalItem] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { villages: [], sites: [], parcels: [], views: [], totalCount: 0 };
    }

    // 1. Match Villages / Locations
    const matchedVillages = Object.entries(AREA_HAZARD_REGISTRY)
      .filter(([key, v]) => 
        key.toLowerCase().includes(q) || 
        v.name.toLowerCase().includes(q) || 
        v.primaryHazard.toLowerCase().includes(q) || 
        v.category.toLowerCase().includes(q)
      )
      .map(([key, v]) => ({
        key,
        ...v
      }));

    // 2. Match Candidate Safe Sites
    const matchedSites = Object.entries(SAFE_SITES_REGISTRY)
      .filter(([key, s]) =>
        key.toLowerCase().includes(q) || 
        s.name.toLowerCase().includes(q) || 
        s.village.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q)
      )
      .map(([key, s]) => ({
        key,
        ...s
      }));

    // 3. Match Cadastral Parcels
    const matchedParcels = (data?.parcels || [])
      .filter(p => 
        p.parcel_id.toLowerCase().includes(q) || 
        p.village.toLowerCase().includes(q) || 
        p.survey_no.toLowerCase().includes(q) || 
        (p.risk_level && p.risk_level.toLowerCase().includes(q))
      )
      .slice(0, 10);

    // 4. Match Navigational Tools
    const SYSTEM_VIEWS = [
      { id: 'early-warning', title: '07 Live Rain & Saturation Telemetry', desc: 'Open-Meteo live feed & geotechnical pore pressure', keywords: ['rain', 'weather', 'open-meteo', 'soil', 'moisture', 'saturation', 'early warning', 'sensor'] },
      { id: 'relocation-engine', title: '06 Smart Relocation Matcher', desc: 'Active transit radius & multi-objective pairing', keywords: ['relocate', 'matcher', 'distance', 'transit', 'route', 'destination', 'safe site', 'safe zone'] },
      { id: 'what-if-simulation', title: '10 Rain Risk Simulator', desc: 'What-if precipitation stress testing & liquefaction', keywords: ['simulate', 'what if', 'stress', 'rainfall multiplier', 'scenario'] },
      { id: 'carrying-capacity', title: '05 Land Safety & Carrying Capacity', desc: 'Bottleneck calculator: water, shelter, toilets, ambulances', keywords: ['capacity', 'carrying', 'water', 'shelter', 'sanitation', 'ambulance', 'toilet'] },
      { id: 'red-zone-map', title: '03 Dynamic Red Zone Map', desc: 'HRI-driven cadastral parcel risk scoring', keywords: ['red zone', 'map', 'cadastre', 'parcels', 'hazard', 'hri'] },
      { id: 'priority-queue', title: '02 AI Priority Evacuation List', desc: 'RPI ranking and Bayesian probability breakdown', keywords: ['priority', 'queue', 'evacuate', 'rpi', 'bayesian', 'ranking'] },
      { id: 'sdma-command', title: '01 Red Zone Update', desc: 'Operational map-first multi-hazard risk assessment & vulnerable population overview', keywords: ['red zone', 'update', 'overview', 'risk', 'population', 'map', 'command', 'sdma'] },
      { id: 'methodology-pipeline', title: '14 Methodology & Algorithmic Defense', desc: 'HRI, Bayesian Beta-Logit, and XGBoost ML formulation', keywords: ['methodology', 'equations', 'math', 'xgboost', 'audit', 'defense'] }
    ];

    const matchedViews = SYSTEM_VIEWS.filter(v => 
      v.title.toLowerCase().includes(q) || 
      v.desc.toLowerCase().includes(q) || 
      v.keywords.some(k => k.includes(q))
    );

    const totalCount = matchedVillages.length + matchedSites.length + matchedParcels.length + matchedViews.length;

    return {
      villages: matchedVillages,
      sites: matchedSites,
      parcels: matchedParcels,
      views: matchedViews,
      totalCount
    };
  }, [searchQuery, data?.parcels]);

  // Actions
  const handleOpenAreaDossier = (profile: any) => {
    setSelectedVillage(profile.key || profile.name);
    setModalItem(profile);
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
  };

  const handleSelectVillage = (villageKey: string) => {
    setSelectedVillage(villageKey);
    setActiveView('sdma-command');
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
  };

  const handleSelectSite = (site: any) => {
    setSelectedSite(site);
    setModalItem(site);
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
  };

  const handleSelectParcel = (parcel: any) => {
    setSelectedParcel(parcel);
    setModalItem(parcel);
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
  };

  const handleSelectView = (viewId: any) => {
    setActiveView(viewId);
    setIsOpen(false);
    if (onSelectResult) onSelectResult();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      if (searchResults.villages.length > 0) {
        handleOpenAreaDossier(searchResults.villages[0]);
      } else if (searchResults.sites.length > 0) {
        handleSelectSite(searchResults.sites[0]);
      } else if (searchResults.parcels.length > 0) {
        handleSelectParcel(searchResults.parcels[0]);
      } else if (searchResults.views.length > 0) {
        handleSelectView(searchResults.views[0].id);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className || 'w-full'}`}>
      
      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-pine-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search village (e.g. Meppadi), parcel, site..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (searchQuery.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#0D1813] border border-[#1E3228] hover:border-emerald-600 focus:border-emerald-400 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-pine-muted/70 focus:outline-none font-mono transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-pine-muted hover:text-white p-0.5"
            title="Clear Search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Search Results Dropdown (100% Solid Opaque Background) */}
      {isOpen && searchQuery.trim().length > 0 && (
        <div 
          onMouseDown={(e) => e.stopPropagation()} 
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-2 w-[340px] sm:w-[460px] md:w-[520px] z-[9999] bg-[#07110C] border-2 border-emerald-600/90 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-mono text-xs text-pine-text"
        >
          
          {/* Header Summary */}
          <div className="px-3.5 py-2.5 bg-[#0C1B13] border-b border-[#1E3228] flex items-center justify-between text-[10.5px]">
            <span className="font-bold text-emerald-400 uppercase tracking-wide">
              {searchResults.totalCount} Results for "{searchQuery}"
            </span>
            <span className="text-pine-muted text-[9.5px]">Press ENTER to open &bull; ESC to close</span>
          </div>

          <div className="overflow-y-auto p-2.5 space-y-3 divide-y divide-[#1E3228]">
            
            {/* 1. MATCHED VILLAGES / LOCATIONS */}
            {searchResults.villages.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1.5 px-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Study Locations & Villages ({searchResults.villages.length}):</span>
                </div>
                <div className="space-y-2">
                  {searchResults.villages.map((v) => (
                    <div
                      key={v.key}
                      className="p-3 rounded-xl bg-[#0E1A14] hover:bg-[#14261D] border border-[#1E3228] hover:border-emerald-500 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-sm">{v.name}</strong>
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                              v.riskLevel === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {v.riskLevel} (HRI {v.riskScore.toFixed(1)})
                            </span>
                          </div>
                          <p className="text-[10.5px] text-pine-muted font-sans mt-0.5">{v.primaryHazard}</p>
                        </div>

                        <div className="text-right text-[10px] text-pine-muted shrink-0 font-mono">
                          <div>{v.slopeDeg}° Slope</div>
                          <div className="text-cyan-400 font-bold">{v.rainfall24h}mm Rain</div>
                        </div>
                      </div>

                      <div className="text-[10.5px] text-white flex items-center justify-between pt-1 border-t border-[#1E3228]">
                        <span className="text-pine-muted">Exposed Population:</span>
                        <strong className="text-amber-300 font-mono">{v.exposedPopulation.toLocaleString()} people</strong>
                      </div>

                      {/* Direct Interactive Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenAreaDossier(v);
                          }}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>OPEN FULL DOSSIER</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectVillage(v.key);
                          }}
                          className="py-1.5 px-3 bg-[#172B21] hover:bg-[#1E3A2C] active:bg-[#254635] text-emerald-300 font-bold rounded-lg border border-[#1E3228] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>FOCUS ON MAP</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. MATCHED CANDIDATE SAFE SITES */}
            {searchResults.sites.length > 0 && (
              <div className="space-y-2 pt-2.5">
                <div className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1.5 px-1">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Candidate Safe Resettlement Sites ({searchResults.sites.length}):</span>
                </div>
                <div className="space-y-2">
                  {searchResults.sites.map((site) => (
                    <div
                      key={site.key}
                      className="p-3 rounded-xl bg-[#0E1A14] hover:bg-[#14261D] border border-[#1E3228] hover:border-cyan-500 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-white text-sm">{site.name}</strong>
                          <p className="text-[10px] text-pine-muted font-sans mt-0.5">{site.description}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold shrink-0">
                          CCAS {site.ccasScore}/100
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSelectSite(site);
                          }}
                          className="py-1.5 px-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>AUDIT CAPACITY</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedSite(site);
                            setActiveView('relocation-engine');
                            setIsOpen(false);
                          }}
                          className="py-1.5 px-3 bg-[#172B21] hover:bg-[#1E3A2C] text-cyan-300 font-bold rounded-lg border border-[#1E3228] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>RELOCATE HERE</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MATCHED CADASTRAL PARCELS */}
            {searchResults.parcels.length > 0 && (
              <div className="space-y-1.5 pt-2.5">
                <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1.5 px-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cadastral Land Parcels ({searchResults.parcels.length}):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {searchResults.parcels.map((p) => (
                    <div
                      key={p.parcel_id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectParcel(p);
                      }}
                      className="p-2.5 rounded-xl bg-[#0E1A14] hover:bg-rose-950/40 border border-[#1E3228] hover:border-rose-500 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-white text-xs group-hover:text-rose-300">{p.parcel_id}</strong>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            p.risk_level === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                          }`}>
                            HRI {p.risk_score}
                          </span>
                        </div>
                        <div className="text-[10px] text-pine-muted mt-0.5">
                          {p.village} &bull; Survey {p.survey_no}/{p.subdivision_no}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-pine-muted group-hover:text-rose-400 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. MATCHED PLATFORM ENGINES */}
            {searchResults.views.length > 0 && (
              <div className="space-y-1.5 pt-2.5">
                <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1.5 px-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Platform Decision Engines ({searchResults.views.length}):</span>
                </div>
                <div className="space-y-1.5">
                  {searchResults.views.map((v) => (
                    <div
                      key={v.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectView(v.id);
                      }}
                      className="p-2.5 rounded-xl bg-[#0E1A14] hover:bg-amber-950/40 border border-[#1E3228] hover:border-amber-500 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div>
                        <strong className="text-white text-xs group-hover:text-amber-300">{v.title}</strong>
                        <div className="text-[10px] text-pine-muted font-sans mt-0.5">{v.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-pine-muted group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Found */}
            {searchResults.totalCount === 0 && (
              <div className="p-5 text-center text-pine-muted space-y-1.5">
                <div className="font-bold text-white text-sm">No matches found for "{searchQuery}"</div>
                <p className="text-xs font-sans">
                  Try searching for <em>Meppadi, Achooranam, Kottathara, Kuppadithara, Vythiri, Kalpetta</em>, a survey number, or a tool name like <em>weather, capacity, simulation</em>.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Detailed Analysis Modal when an item is selected */}
      {modalItem && (
        <DetailedAnalysisModal
          item={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}

    </div>
  );
};
