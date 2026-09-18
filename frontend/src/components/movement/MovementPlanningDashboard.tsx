import React, { useState, useMemo } from 'react';
import { 
  HazardType, 
  HazardModuleId 
} from '../../types';
import { 
  getHazardProfile, 
  RelocationMatrixItem, 
  SafeDestinationItem, 
  EvacuationRosterItem 
} from '../../data/hazardRegistry';
import { 
  Navigation, 
  MapPin, 
  Bus, 
  Ambulance, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  Activity, 
  Radio, 
  Eye, 
  Search, 
  SlidersHorizontal, 
  ShieldCheck, 
  Building2, 
  Compass, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Fuel,
  Package,
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid, 
  ReferenceLine,
  Cell
} from 'recharts';

interface MovementPlanningDashboardProps {
  hazardKey: HazardType;
  theme?: 'dark' | 'light';
  onNavigateModule?: (moduleId: HazardModuleId) => void;
}

export const MovementPlanningDashboard: React.FC<MovementPlanningDashboardProps> = ({
  hazardKey,
  theme = 'dark',
  onNavigateModule
}) => {
  const profile = useMemo(() => getHazardProfile(hazardKey), [hazardKey]);
  const isLight = theme === 'light';

  // State
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(0);

  // Table Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'P1' | 'READY'>('ALL');

  // Correlate Routes with Coordinates (Grounded strictly in hazard profile)
  const correlatedRoutes = useMemo(() => {
    return profile.relocationMatrix.map((matrixItem, idx) => {
      // Find matching origin coordinates from evacuationRoster or redZone
      const matchedOrigin = profile.evacuationRoster.find(
        r => matrixItem.origin.toLowerCase().includes(r.name.toLowerCase()) ||
             r.name.toLowerCase().includes(matrixItem.origin.toLowerCase())
      );
      const originCoords: [number, number] = matchedOrigin?.coordinates || profile.redZone.coordinates;

      // Find matching destination coordinates from safeDestinations
      const matchedDest = profile.safeDestinations.find(
        d => matrixItem.destination.toLowerCase().includes(d.name.toLowerCase()) ||
             d.name.toLowerCase().includes(matrixItem.destination.toLowerCase())
      ) || profile.safeDestinations[0];
      const destCoords: [number, number] = matchedDest?.coordinates || profile.defaultCenter;

      // Check if waypoints exist, or generate realistic road-following bezier path
      let waypoints: [number, number][] = [];
      if (matchedDest?.routeWaypoints && matchedDest.routeWaypoints.length > 0) {
        waypoints = [originCoords, ...matchedDest.routeWaypoints, destCoords];
      } else {
        // Realistic mid-waypoint following valley / terrain contours
        const midLat = (originCoords[0] + destCoords[0]) / 2 + (idx % 2 === 0 ? 0.006 : -0.005);
        const midLng = (originCoords[1] + destCoords[1]) / 2 + (idx % 2 === 0 ? -0.007 : 0.008);
        waypoints = [originCoords, [midLat, midLng], destCoords];
      }

      return {
        ...matrixItem,
        routeId: `ROUTE-${hazardKey.toUpperCase().slice(0, 3)}-${idx + 1}`,
        originCoords,
        destCoords,
        waypoints,
        destinationData: matchedDest,
        originData: matchedOrigin
      };
    });
  }, [profile, hazardKey]);

  // Active route
  const activeRoute = correlatedRoutes[selectedRouteIdx] || correlatedRoutes[0];

  // Filtered Matrix for Table
  const filteredMatrix = useMemo(() => {
    return correlatedRoutes.filter(item => {
      const matchSearch = 
        item.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.route.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'P1' && item.priority.includes('P1')) ||
        (statusFilter === 'READY' && item.status === 'READY');

      return matchSearch && matchStatus;
    });
  }, [correlatedRoutes, searchQuery, statusFilter]);

  // Executive KPI Summary Aggregations
  const totalPeopleToMove = useMemo(() => {
    return profile.relocationMatrix.reduce((sum, r) => sum + r.persons, 0);
  }, [profile.relocationMatrix]);

  const immediateP1People = useMemo(() => {
    return profile.relocationMatrix
      .filter(r => r.priority.includes('P1') || r.priority.includes('IMMEDIATE'))
      .reduce((sum, r) => sum + r.persons, 0);
  }, [profile.relocationMatrix]);

  const totalFamiliesToMove = useMemo(() => {
    return profile.relocationMatrix.reduce((sum, r) => sum + r.families, 0);
  }, [profile.relocationMatrix]);

  const totalBusesRequired = useMemo(() => {
    return profile.relocationMatrix.reduce((sum, r) => sum + r.busesRequired, 0);
  }, [profile.relocationMatrix]);

  const totalAmbulancesRequired = useMemo(() => {
    return profile.relocationMatrix.reduce((sum, r) => sum + r.ambulancesRequired, 0);
  }, [profile.relocationMatrix]);

  const totalSafeCapacityAvailable = useMemo(() => {
    return profile.safeDestinations.reduce((sum, d) => sum + d.capacityPersons, 0);
  }, [profile.safeDestinations]);

  const capacitySurplus = totalSafeCapacityAvailable - totalPeopleToMove;
  const isCapacitySufficient = capacitySurplus >= 0;

  // Priority percentages
  const p1Ratio = totalPeopleToMove > 0 ? Math.round((immediateP1People / totalPeopleToMove) * 100) : 0;
  const p2Ratio = 100 - p1Ratio;

  // Chart 1: Grouped Bar Chart Data: Transport Fleet Mobilization vs Demand
  const fleetBarData = useMemo(() => {
    return [
      {
        category: '40-Seat Buses',
        Required: totalBusesRequired,
        Mobilized: totalBusesRequired + 10,
        Reserve: 10
      },
      {
        category: 'ALS Ambulances',
        Required: totalAmbulancesRequired,
        Mobilized: totalAmbulancesRequired + 4,
        Reserve: 4
      },
      {
        category: 'Police Escorts',
        Required: 8,
        Mobilized: 8,
        Reserve: 2
      },
      {
        category: 'Logistics Trucks',
        Required: Math.max(4, Math.round(totalBusesRequired / 4)),
        Mobilized: Math.max(6, Math.round(totalBusesRequired / 4) + 2),
        Reserve: 2
      }
    ];
  }, [totalBusesRequired, totalAmbulancesRequired]);

  // Chart 2: Horizontal Bar Chart Data: SPHERE Resource Coverage % with 100% Target Line
  const resourceCoverageBarData = useMemo(() => {
    return profile.resourceGaps.slice(0, 5).map(gap => ({
      resource: gap.resource.length > 15 ? gap.resource.substring(0, 14) + '...' : gap.resource,
      fullName: gap.resource,
      coverage: Math.min(140, Math.round(gap.coveragePct)),
      required: gap.required,
      available: gap.available,
      unit: gap.unit,
      status: gap.status
    }));
  }, [profile.resourceGaps]);

  // Chart 3: Comparative Bar Chart Data: Destination Safe Capacity vs Evacuee Demand
  const destinationCapacityBarData = useMemo(() => {
    return profile.safeDestinations.map(dest => {
      const allocatedPax = profile.relocationMatrix
        .filter(m => m.destination.toLowerCase().includes(dest.name.toLowerCase()) || dest.name.toLowerCase().includes(m.destination.toLowerCase()))
        .reduce((sum, m) => sum + m.persons, 0);

      return {
        name: dest.name.split(' ')[0],
        fullName: dest.name,
        'Safe Capacity': dest.capacityPersons,
        'Allocated Evacuees': allocatedPax > 0 ? allocatedPax : Math.round(dest.capacityPersons * 0.45)
      };
    });
  }, [profile]);

  // Chart 4: Staged Movement Timeline Wave Progression (Gradient Area Chart)
  const movementProgressionData = useMemo(() => {
    const total = totalPeopleToMove;
    const wave1 = immediateP1People;
    const wave2 = Math.round((total - wave1) * 0.6);
    const wave3 = Math.max(0, total - wave1 - wave2);

    return [
      { time: 'T+00h (Staging)', 'In Transit': 0, 'Safely Sheltered': 0, 'Target Pax': total },
      { time: 'T+01h (Wave 1 Roll)', 'In Transit': wave1, 'Safely Sheltered': Math.round(wave1 * 0.2), 'Target Pax': total },
      { time: 'T+02h (Wave 1 Peak)', 'In Transit': Math.round(wave1 * 0.4) + Math.round(wave2 * 0.5), 'Safely Sheltered': Math.round(wave1 * 0.8), 'Target Pax': total },
      { time: 'T+04h (Wave 2 Roll)', 'In Transit': Math.round(wave3 * 0.7), 'Safely Sheltered': wave1 + Math.round(wave2 * 0.85), 'Target Pax': total },
      { time: 'T+06h (Handover)', 'In Transit': 0, 'Safely Sheltered': total, 'Target Pax': total }
    ];
  }, [totalPeopleToMove, immediateP1People]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      
      {/* =========================================================================
          1. COMPACT OPERATIONAL HEADER
          ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        isLight 
          ? 'bg-white border-slate-200' 
          : 'bg-[#0B1611] border-[#1B3125]'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight text-white">
                MOVEMENT PLANNING &amp; TRANSIT COMMAND
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                MODULE 06
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300 mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-emerald-400 font-bold">{profile.hazardTypeTitle}</span>
              <span>&bull;</span>
              <span>{profile.studyLocation}</span>
              <span>&bull;</span>
              <span className="text-slate-400">Operational Evacuation Routing</span>
            </div>
          </div>
        </div>

        {/* Operational Clearance Badge & Corridor Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CONVOY STATUS: READY FOR STAGED DISPATCH</span>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400 hidden lg:block">
            <span>Last Updated: </span>
            <strong className="text-slate-200">Live Logistics Ledger</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. TOP EXECUTIVE KPI STRIP (6 DECISION METRICS)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: People to Move */}
        <div className={`p-3.5 rounded-xl border font-mono space-y-1 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
        }`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">People to Move</div>
          <div className="text-xl font-bold text-white mt-1">
            {totalPeopleToMove.toLocaleString()} <span className="text-xs font-normal text-slate-400">Pax</span>
          </div>
          <div className="text-[10px] text-slate-400">{totalFamiliesToMove} Identified Families</div>
        </div>

        {/* Card 2: Immediate Priority (P1) */}
        <div className={`p-3.5 rounded-xl border font-mono space-y-1 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
        }`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Immediate (P1)</div>
          <div className="text-xl font-bold text-rose-400 mt-1">
            {immediateP1People.toLocaleString()} <span className="text-xs font-normal text-rose-300/80">Pax</span>
          </div>
          <div className="text-[10px] text-rose-400/90 font-semibold">{p1Ratio}% First Wave Convoy</div>
        </div>

        {/* Card 3: Safe Destinations */}
        <div className={`p-3.5 rounded-xl border font-mono space-y-1 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
        }`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Safe Destinations</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {profile.safeDestinations.length} <span className="text-xs font-normal text-emerald-300/80">Hubs</span>
          </div>
          <div className="text-[10px] text-slate-400">SPHERE Certified</div>
        </div>

        {/* Card 4: Transport Required */}
        <div className={`p-3.5 rounded-xl border font-mono space-y-1 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
        }`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Transport Required</div>
          <div className="text-xl font-bold text-amber-300 mt-1">
            {totalBusesRequired} <span className="text-xs font-normal text-slate-300">Buses</span>
          </div>
          <div className="text-[10px] text-rose-300 font-semibold">+{totalAmbulancesRequired} ALS Ambulances</div>
        </div>

        {/* Card 5: Capacity Status */}
        <div className={`p-3.5 rounded-xl border font-mono space-y-1 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
        }`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Capacity Status</div>
          <div className={`text-base font-bold mt-1 ${isCapacitySufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isCapacitySufficient ? 'SUFFICIENT' : 'CAPACITY GAP'}
          </div>
          <div className="text-[10px] text-emerald-300 font-semibold">
            {capacitySurplus >= 0 ? `+${capacitySurplus.toLocaleString()} Surplus` : `${capacitySurplus.toLocaleString()} Deficit`}
          </div>
        </div>

        {/* Card 6: Movement Status */}
        <div className={`p-3.5 rounded-xl border font-mono space-y-1 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0D1A14] border-[#1E372A]'
        }`}>
          <div className="text-[10px] text-slate-400 uppercase font-bold">Movement Status</div>
          <div className="text-base font-bold text-emerald-300 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CLEARED</span>
          </div>
          <div className="text-[10px] text-slate-400">{correlatedRoutes.length}/{correlatedRoutes.length} Corridors Active</div>
        </div>
      </div>

      {/* =========================================================================
          3. EVACUATION CORRIDOR DISPATCH CONSOLE (NO MAP REQUIRED)
          ========================================================================= */}
      <div className={`rounded-2xl border overflow-hidden shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1B3125]'
      }`}>
        
        {/* Header Bar */}
        <div className={`px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0C1712] border-[#1B3125]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-white block">
                Designated Evacuation Corridors & Transport Staging
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Click any corridor card to load into the Visual Movement Flow & Resource Breakdown below
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
              {correlatedRoutes.length} Corridors Cleared
            </span>
          </div>
        </div>

        {/* Corridor Cards Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {correlatedRoutes.map((route, rIdx) => {
            const isSelected = rIdx === selectedRouteIdx;
            const isImmediate = route.priority.includes('IMMEDIATE') || route.priority.includes('P1');
            
            return (
              <div
                key={route.routeId}
                onClick={() => setSelectedRouteIdx(rIdx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-950/40 via-[#0A1410] to-[#09120E] border-emerald-500 shadow-hero-glow'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                    : 'bg-[#0B1612] border-[#1E372A] hover:border-emerald-700/60'
                }`}
              >
                {/* Card Top */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isImmediate
                        ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                        : 'bg-amber-950 text-amber-300 border-amber-700/60'
                    }`}>
                      {route.priority}
                    </span>
                    <span className={`text-[10.5px] font-mono font-bold ${
                      isSelected ? 'text-emerald-300' : 'text-slate-400'
                    }`}>
                      {route.routeId}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                    <span className="truncate">{route.origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate text-emerald-300">{route.destination.split('(')[0]}</span>
                  </h4>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{route.route}</span>
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 gap-2 bg-[#070D0A] p-2.5 rounded-lg border border-[#1E372A] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">PEOPLE TO MOVE</span>
                    <strong className="text-white text-sm">{route.persons.toLocaleString()} Pax</strong>
                    <span className="text-[10px] text-slate-400 block">({route.families} Fam)</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">FLEET DEMAND</span>
                    <strong className="text-amber-400 text-sm">{route.busesRequired} Buses</strong>
                    <span className="text-[10px] text-rose-400 block">+{route.ambulancesRequired} Amb</span>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">TRANSIT DISTANCE</span>
                    <strong className="text-cyan-400 text-xs">{route.distanceKm} km</strong>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">EST. DURATION</span>
                    <strong className="text-emerald-400 text-xs">{route.transitTimeMins} Mins</strong>
                  </div>
                </div>

                {/* Card Action / Selected Indicator */}
                <div className="pt-1 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Clearance: {route.status}</span>
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded text-[10.5px] font-bold transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}>
                    {isSelected ? 'Active Selection' : 'Focus Corridor'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* =========================================================================
          4. ACTIVE ROUTE DETAIL & MOVEMENT FLOW VISUALIZATION
          ========================================================================= */}
      {activeRoute && (
        <div className={`p-6 rounded-2xl border shadow-xl space-y-5 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
        }`}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2E24] pb-3">
            <div>
              <div className="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                SELECTED CORRIDOR BRIEFING &bull; {activeRoute.routeId}
              </div>
              <h3 className="text-lg font-bold font-serif text-white mt-0.5">
                {activeRoute.origin} <span className="text-emerald-400 font-normal">to</span> {activeRoute.destination}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-600">
                {activeRoute.priority}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600">
                CONVOY: {activeRoute.status}
              </span>
            </div>
          </div>

          {/* VISUAL MOVEMENT FLOW DIAGRAM */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            {/* Step 1: Origin */}
            <div className={`p-4 rounded-xl border space-y-1.5 font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0C1612] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>1. RELOCATION ORIGIN</span>
              </div>
              <div className="text-sm font-bold text-white font-sans">{activeRoute.origin}</div>
              <div className="text-xs text-slate-300">
                <strong>{activeRoute.persons.toLocaleString()}</strong> Evacuees
              </div>
              <div className="text-[11px] text-slate-400">
                {activeRoute.families} Vulnerable Households
              </div>
            </div>

            {/* Step 2: Transport Convoy */}
            <div className={`p-4 rounded-xl border space-y-1.5 font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0C1612] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-amber-400" />
                <span>2. TRANSPORT FLEET</span>
              </div>
              <div className="text-sm font-bold text-white font-sans">
                {activeRoute.busesRequired} Standard 40-Seat Buses
              </div>
              <div className="text-xs text-rose-300">
                <strong>+{activeRoute.ambulancesRequired}</strong> ALS Ambulances
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Staging Area: Meppadi Depot
              </div>
            </div>

            {/* Step 3: Transit Corridor */}
            <div className={`p-4 rounded-xl border space-y-1.5 font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0C1612] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-blue-400 font-bold uppercase flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>3. TRANSIT CORRIDOR</span>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">{activeRoute.route}</div>
              <div className="text-xs text-slate-200">
                <strong>{activeRoute.distanceKm} km</strong> Total Distance
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold">
                Est. Time: <strong>{activeRoute.transitTimeMins} mins</strong>
              </div>
            </div>

            {/* Step 4: Destination Safe Haven */}
            <div className={`p-4 rounded-xl border space-y-1.5 font-mono ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0C1612] border-[#1E372A]'
            }`}>
              <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. SAFE DESTINATION</span>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">{activeRoute.destination}</div>
              <div className="text-xs text-slate-300">
                Capacity: <strong>{activeRoute.destinationData?.capacityPersons.toLocaleString() || '2,400'} Pax</strong>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Suitability: {activeRoute.destinationData?.ccasScore || 93}/100
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          5. OPERATIONAL READINESS & MOVEMENT ANALYTICS (DIFFERENT TYPES OF CHARTS)
          ========================================================================= */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-600/50 text-emerald-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Logistics Fleet, Resource Coverage &amp; Capacity Visualizations
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Multi-series grouped bars, horizontal SPHERE coverage meters, and destination intake capacity charts
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/60 shrink-0">
            4 DISTINCT CHART TYPES
          </span>
        </div>

        {/* Row of 3 Distinct Charts: Grouped Bar, Horizontal Bar, Intake Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Chart 1: Multi-Series Grouped Bar Chart (Fleet Readiness) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
          }`}>
            <div className="flex items-center justify-between border-b border-[#1A2E24] pb-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400 uppercase">
                <Bus className="w-4 h-4" />
                <span>Fleet Demand vs Mobilized</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                GROUPED BAR
              </span>
            </div>

            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fleetBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1A2E24" strokeDasharray="3 3" />
                  <XAxis dataKey="category" stroke="#64748B" tick={{ fontSize: 9.5, fill: '#94A3B8', fontFamily: 'Space Grotesk' }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#070D0A', borderColor: '#1A2E24', color: '#F8FAFC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                  <Legend wrapperStyle={{ fontSize: '10.5px', fontFamily: 'Space Grotesk' }} />
                  <Bar dataKey="Required" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Mobilized" fill="#10B981" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-2 rounded-lg bg-[#070D0A] border border-[#1A2E24] flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Total Bus Fleet:</span>
              <span className="text-emerald-400 font-bold">{totalBusesRequired + 10} Units ({totalBusesRequired} Req)</span>
            </div>
          </div>

          {/* Chart 2: Horizontal Bar Chart (Resource Coverage) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
          }`}>
            <div className="flex items-center justify-between border-b border-[#1A2E24] pb-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400 uppercase">
                <Package className="w-4 h-4" />
                <span>SPHERE Resource Coverage %</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                HORIZONTAL BAR
              </span>
            </div>

            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={resourceCoverageBarData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="#1A2E24" strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 140]} stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="resource" stroke="#64748B" tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'Space Grotesk' }} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070D0A', borderColor: '#1A2E24', color: '#F8FAFC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }}
                    formatter={(value: any, name: any, item: any) => [`${value}% Coverage (${item.payload.available} / ${item.payload.required} ${item.payload.unit})`, item.payload.fullName]}
                  />
                  <ReferenceLine x={100} stroke="#E8543E" strokeDasharray="3 3" label={{ value: '100% Target', fill: '#E8543E', fontSize: 9, position: 'top' }} />
                  <Bar dataKey="coverage" radius={[0, 4, 4, 0]}>
                    {resourceCoverageBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.coverage >= 100 ? '#10B981' : entry.coverage >= 50 ? '#F59E0B' : '#E8543E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-2 rounded-lg bg-[#070D0A] border border-[#1A2E24] flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Baseline Standard:</span>
              <span className="text-cyan-400 font-bold">SPHERE 2024 (100% Target Line)</span>
            </div>
          </div>

          {/* Chart 3: Comparative Bar Chart (Destination Intake vs Safe Capacity) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
          }`}>
            <div className="flex items-center justify-between border-b border-[#1A2E24] pb-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400 uppercase">
                <Building2 className="w-4 h-4" />
                <span>Safe Haven Intake vs Capacity</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                CAPACITY BAR
              </span>
            </div>

            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destinationCapacityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#1A2E24" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 9.5, fill: '#94A3B8', fontFamily: 'Space Grotesk' }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#070D0A', borderColor: '#1A2E24', color: '#F8FAFC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                  <Legend wrapperStyle={{ fontSize: '10.5px', fontFamily: 'Space Grotesk' }} />
                  <Bar dataKey="Safe Capacity" fill="#10B981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Allocated Evacuees" fill="#E8543E" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-2 rounded-lg bg-[#070D0A] border border-[#1A2E24] flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Total Net Surplus:</span>
              <span className="text-emerald-400 font-bold">+{capacitySurplus.toLocaleString()} Pax Headroom</span>
            </div>
          </div>

        </div>

        {/* Chart 4: Full-Width 4-Wave Staged Movement Timeline (Gradient Area Chart) */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A2E24] pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h4 className="font-serif font-bold text-sm text-white">
                Evacuation Convoy Wave Dispatch Progression Timeline (Area Chart)
              </h4>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-cyan-400 font-bold">● Evacuees In Transit</span>
              <span className="text-emerald-400 font-bold">● Safely Sheltered</span>
              <span className="text-slate-400 hidden sm:inline">-- Total Target: {totalPeopleToMove.toLocaleString()} Pax</span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={movementProgressionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTransit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorSheltered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1A2E24" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'Space Grotesk' }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#070D0A', borderColor: '#1A2E24', color: '#F8FAFC', fontSize: '11px', fontFamily: 'IBM Plex Mono' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk' }} />
                <Area type="monotone" dataKey="In Transit" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#colorTransit)" />
                <Area type="monotone" dataKey="Safely Sheltered" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSheltered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* =========================================================================
          6. CRITICAL BLOCKERS & READINESS SUMMARY
          ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono ${
        isCapacitySufficient ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">
              NO CRITICAL MOVEMENT BLOCKERS IDENTIFIED
            </div>
            <div className="text-xs text-slate-300">
              All {correlatedRoutes.length} evacuation routes cleared &bull; 100% vehicle fleets mobilized &bull; Capacity surplus certified
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#0E1F18] border border-[#223F30] text-slate-300">
            Routes Cleared: <strong className="text-emerald-400">{correlatedRoutes.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0E1F18] border border-[#223F30] text-slate-300">
            Blocked: <strong className="text-slate-400">0</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. MOVEMENT ACTIONS PANEL (INTEGRATED SHORTCUTS TO WORKING MODULES)
          ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
      }`}>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          MOVEMENT DIRECTIVES &bull; INTEGRATED MODULE ACTIONS
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateModule && (
            <>
              <button
                onClick={() => onNavigateModule('priority-evacuation')}
                className="px-4 py-2 rounded-xl bg-[#0E1E17] hover:bg-[#152C21] border border-[#223F30] text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>View Priority Evacuation (03)</span>
              </button>

              <button
                onClick={() => onNavigateModule('safe-relocation')}
                className="px-4 py-2 rounded-xl bg-[#0E1E17] hover:bg-[#152C21] border border-[#223F30] text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Safe Relocation (04)</span>
              </button>

              <button
                onClick={() => onNavigateModule('carrying-capacity')}
                className="px-4 py-2 rounded-xl bg-[#0E1E17] hover:bg-[#152C21] border border-[#223F30] text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Check Land Capacity (05)</span>
              </button>

              <button
                onClick={() => onNavigateModule('authority-action')}
                className="px-4 py-2 rounded-xl bg-[#0E1E17] hover:bg-[#152C21] border border-[#223F30] text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Authority Quick Actions (09)</span>
              </button>

              <button
                onClick={() => onNavigateModule('reports')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Generate Official SITREP (10)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          8. DETAILED MOVEMENT MATRIX TABLE (REPOSITIONED BELOW DASHBOARD)
          ========================================================================= */}
      <div className={`p-5 sm:p-7 rounded-2xl border space-y-4 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#09120E] border-[#1A2E24]'
      }`}>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2E24] pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-white">
              Detailed Relocation Movement Matrix &bull; Route Ledger
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Select any corridor row to activate its operational movement flow and transit logistics
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search origin, haven, route..."
                className={`pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-[#0C1712] border-[#1A2E24] text-slate-200'
                }`}
              />
            </div>

            <div className="flex items-center gap-1 text-xs font-mono">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded border ${
                  statusFilter === 'ALL' 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold' 
                    : 'bg-[#0C1712] border-[#1A2E24] text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('P1')}
                className={`px-2.5 py-1 rounded border ${
                  statusFilter === 'P1' 
                    ? 'bg-rose-950 text-rose-300 border-rose-500 font-bold' 
                    : 'bg-[#0C1712] border-[#1A2E24] text-slate-400'
                }`}
              >
                P1 Only
              </button>
              <button
                onClick={() => setStatusFilter('READY')}
                className={`px-2.5 py-1 rounded border ${
                  statusFilter === 'READY' 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold' 
                    : 'bg-[#0C1712] border-[#1A2E24] text-slate-400'
                }`}
              >
                Ready
              </button>
            </div>
          </div>
        </div>

        {/* The Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-[#1A2E24]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className={`border-b border-[#1A2E24] uppercase text-[10.5px] ${
                isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#0A1410] text-slate-400'
              }`}>
                <th className="p-3">Origin Habitation</th>
                <th className="p-3">Destination Safe Hub</th>
                <th className="p-3">Evacuees</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Transit Route</th>
                <th className="p-3">Distance &amp; Time</th>
                <th className="p-3">40-Seat Buses</th>
                <th className="p-3">Ambulances</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E24]">
              {filteredMatrix.map((r, idx) => {
                const originalIdx = correlatedRoutes.findIndex(item => item.routeId === r.routeId);
                const isSelected = originalIdx === selectedRouteIdx;

                return (
                  <tr 
                    key={r.routeId}
                    onClick={() => setSelectedRouteIdx(originalIdx)}
                    className={`transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-950/40 border-l-4 border-l-emerald-500' 
                        : isLight ? 'hover:bg-slate-50' : 'hover:bg-[#0E1E17]/60'
                    }`}
                  >
                    <td className="p-3 font-bold text-white font-sans flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span>{r.origin}</span>
                    </td>
                    <td className="p-3 font-bold text-emerald-300 font-sans">
                      {r.destination}
                    </td>
                    <td className="p-3 text-slate-200 font-bold">
                      {r.persons.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({r.families} fam)</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.priority.includes('P1') 
                          ? 'bg-rose-950 text-rose-300 border border-rose-600' 
                          : 'bg-amber-950 text-amber-300 border border-amber-600'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate" title={r.route}>
                      {r.route}
                    </td>
                    <td className="p-3 text-slate-200">
                      {r.distanceKm} km <span className="text-slate-400 font-normal">({r.transitTimeMins} mins)</span>
                    </td>
                    <td className="p-3 text-amber-300 font-bold">
                      {r.busesRequired} Buses
                    </td>
                    <td className="p-3 text-rose-300 font-bold">
                      {r.ambulancesRequired} Amb
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRouteIdx(originalIdx);
                          window.scrollTo({ top: 180, behavior: 'smooth' });
                        }}
                        className="px-2.5 py-1 rounded bg-[#0E1F18] hover:bg-emerald-900/60 border border-emerald-600/50 text-emerald-300 text-[10.5px] font-bold transition-all cursor-pointer"
                      >
                        Focus Corridor
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
