import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { NivaraData, ActiveView, Parcel, CandidateSite, VillageStat, LiveWeatherFeed, BayesianRiskEstimate, HazardType, HazardModuleId } from '../types';
import { fetchLiveWeatherFeed, WEATHER_STATION_CONFIG } from '../services/weatherService';
import { calculateBayesianProbability, getBayesianRiskForLocation } from '../services/bayesianRiskService';

export interface UserProfile {
  username: string;
  name: string;
  role: 'SDMA Admin' | 'DDMA Officer' | 'Field Operator' | 'Village Coordinator' | 'Viewer (Public)';
  badge: string;
  district: string;
}

export const DEMO_ROLES: UserProfile[] = [
  {
    username: 'sdma_admin',
    name: 'Dr. K. S. Rajendran',
    role: 'SDMA Admin',
    badge: 'STATE OPERATIONS CHIEF',
    district: 'Kerala State'
  },
  {
    username: 'ddma_officer',
    name: 'Smt. R. Divya IAS',
    role: 'DDMA Officer',
    badge: 'DISTRICT COLLECTOR',
    district: 'Wayanad District'
  },
  {
    username: 'field_operator',
    name: 'Capt. Arun Menon',
    role: 'Field Operator',
    badge: 'RAPID RESPONSE TEAM',
    district: 'Vythiri / Meppadi'
  },
  {
    username: 'village_coordinator',
    name: 'K. Padmanabhan',
    role: 'Village Coordinator',
    badge: 'RELOCATION LIAISON',
    district: 'Chooralmala & Mundakkai'
  },
  {
    username: 'public_viewer',
    name: 'Civilian Observer',
    role: 'Viewer (Public)',
    badge: 'PUBLIC ADVISORY',
    district: 'General Access'
  }
];

interface AppContextType {
  data: NivaraData | null;
  isLoading: boolean;
  error: string | null;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedVillage: string;
  setSelectedVillage: (v: string) => void;
  selectedRiskFilter: string;
  setSelectedRiskFilter: (r: string) => void;
  selectedParcel: Parcel | null;
  setSelectedParcel: (p: Parcel | null) => void;
  selectedSite: CandidateSite | null;
  setSelectedSite: (s: CandidateSite | null) => void;
  rainfallMultiplier: number;
  setRainfallMultiplier: (val: number) => void;
  hazardStressMultipliers: Record<HazardType, number>;
  setHazardStressMultiplier: (hazard: HazardType, mult: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  recomputeRiskForRainfall: (baseScore: number, rainMultiplier: number, slope: number) => { score: number; level: 'HIGH' | 'MEDIUM' | 'LOW' };
  
  // Real-Time Hydrometeorology & Weather Feed
  liveWeather: LiveWeatherFeed | null;
  isWeatherLoading: boolean;
  weatherError: string | null;
  refreshLiveWeather: () => Promise<void>;
  rainfallAlertThreshold: number;
  setRainfallAlertThreshold: (threshold: number) => void;

  // Bayesian Risk Functions
  getBayesianRisk: (locationName: string, customRainfall?: number) => BayesianRiskEstimate;

  // Multi-Hazard Operations Portal & Command Centers
  selectedHazard: HazardType | null;
  selectedHazardModule: HazardModuleId;
  selectHazard: (hazard: HazardType) => void;
  selectHazardModule: (module: HazardModuleId) => void;
  goHome: () => void;

  // User Authentication & Demo Roles
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  login: (username?: string, password?: string, role?: string) => boolean;
  loginAsDemo: (roleName?: string) => void;
  logout: () => void;

  // Global Theme (Light / Dark)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const ROUTE_TO_VIEW_MAP: Record<string, ActiveView> = {
  // 01 Red Zone Update
  'red-zone-update': 'sdma-command',
  'overview': 'sdma-command',
  'dashboard': 'sdma-command',
  'sdma-command': 'sdma-command',

  // 02 Priority Evacuation List
  'priority-evacuation': 'priority-queue',
  'priority-queue': 'priority-queue',

  // 03 Safe Relocation Lands
  'safe-relocation': 'candidate-sites',
  'candidate-sites': 'candidate-sites',

  // 04 Land Safety Capacity
  'land-capacity': 'carrying-capacity',
  'carrying-capacity': 'carrying-capacity',

  // 05 Relocation Matrix
  'relocation-matrix': 'relocation-engine',
  'relocation-engine': 'relocation-engine',

  // 06 Live Weather & Sensors
  'live-weather': 'early-warning',
  'early-warning': 'early-warning',

  // 07 DWSSL
  'dwssl': 'dwssl',

  // 04 Authority Insights
  'authority-insights': 'sdma-command',

  // 08 Alerts & Voice
  'alerts': 'alerts',

  // 09 Hazard Analysis & Area...
  'hazard-analysis': 'area-comparison',
  'area-comparison': 'area-comparison',

  // 05 / 10 Rainfall Impact Simulator
  'rainfall-simulator': 'what-if-simulation',
  'simulator': 'what-if-simulation',
  'what-if-simulation': 'what-if-simulation',

  // 11 Project Report
  'project-report': 'project-report',

  // Coastal Erosion Intelligence
  'coastal-erosion': 'coastal-erosion',

  // Flood Intelligence (Dibrugarh, Assam)
  'flood-intelligence': 'flood-intelligence',

  // Cloudburst Intelligence (Uttarakhand)
  'cloudburst-intelligence': 'cloudburst-intelligence',

  // Additional pipeline views
  'red-zone-map': 'red-zone-map',
  'intelligence-layers': 'intelligence-layers',
  'hazard-runout': 'hazard-runout',
  'data-foundation': 'data-foundation',
  // Home disaster portal
  'home': 'home',
  'methodology-pipeline': 'methodology-pipeline'
};

export const VIEW_TO_ROUTE_MAP: Record<ActiveView, string> = {
  'home': 'home',
  'authority-action': 'authority-action',
  'sdma-command': 'red-zone-update',
  'dashboard': 'red-zone-update',
  'overview': 'red-zone-update',
  'priority-queue': 'priority-evacuation',
  'priority-evacuation': 'priority-evacuation',
  'candidate-sites': 'safe-relocation',
  'safe-relocation': 'safe-relocation',
  'carrying-capacity': 'land-capacity',
  'land-capacity': 'land-capacity',
  'relocation-engine': 'relocation-matrix',
  'relocation-matrix': 'relocation-matrix',
  'early-warning': 'live-weather',
  'live-weather': 'live-weather',
  'dwssl': 'dwssl',
  'alerts': 'alerts',
  'area-comparison': 'hazard-analysis',
  'hazard-analysis': 'hazard-analysis',
  'what-if-simulation': 'rainfall-simulator',
  'rainfall-simulator': 'rainfall-simulator',
  'coastal-erosion': 'coastal-erosion',
  'flood-intelligence': 'flood-intelligence',
  'cloudburst-intelligence': 'cloudburst-intelligence',
  'project-report': 'project-report',
  'red-zone-map': 'red-zone-map',
  'intelligence-layers': 'intelligence-layers',
  'hazard-runout': 'hazard-runout',
  'data-foundation': 'data-foundation',
  'dataset-explorer': 'dataset-explorer',
  'methodology-pipeline': 'methodology-pipeline',
  'login': 'login'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<NivaraData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication State: defaults to false so initial app opening ALWAYS displays the Login Page!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '').trim();
    if (!rawHash || rawHash === 'login') {
      sessionStorage.removeItem('nivara_auth');
      return false;
    }
    return sessionStorage.getItem('nivara_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = sessionStorage.getItem('nivara_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_ROLES[0];
      }
    }
    return DEMO_ROLES[0];
  });

  // Global Theme Mode ('dark' | 'light')
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nivara_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    localStorage.setItem('nivara_theme', t);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('nivara_theme', next);
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  // Multi-Hazard Operations State
  const [selectedHazard, setSelectedHazard] = useState<HazardType | null>(() => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '').trim();
    const parts = rawHash.split('/');
    if (['landslide', 'flood', 'cloudburst', 'coastal-erosion'].includes(parts[0])) {
      return parts[0] as HazardType;
    }
    const saved = sessionStorage.getItem('nivara_hazard');
    if (saved && ['landslide', 'flood', 'cloudburst', 'coastal-erosion'].includes(saved)) {
      return saved as HazardType;
    }
    return null;
  });

  const [selectedHazardModule, setSelectedHazardModule] = useState<HazardModuleId>(() => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '').trim();
    const parts = rawHash.split('/');
    if (parts.length > 1 && parts[1]) {
      const m = parts[1];
      if (m === 'overview') return 'red-zone-update';
      return m as HazardModuleId;
    }
    return 'red-zone-update';
  });

  // URL synced active view
  const [activeView, _setActiveView] = useState<ActiveView>(() => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '').trim();
    if (!rawHash || rawHash === 'home') return 'home';
    const parts = rawHash.split('/');
    if (['landslide', 'flood', 'cloudburst', 'coastal-erosion'].includes(parts[0])) {
      const h = parts[0];
      return h === 'flood' ? 'flood-intelligence' : h === 'cloudburst' ? 'cloudburst-intelligence' : h === 'coastal-erosion' ? 'coastal-erosion' : 'sdma-command';
    }
    return ROUTE_TO_VIEW_MAP[rawHash] || 'home';
  });

  const selectHazard = (hazard: HazardType) => {
    setSelectedHazard(hazard);
    setSelectedHazardModule('red-zone-update');
    sessionStorage.setItem('nivara_hazard', hazard);
    _setActiveView(hazard === 'flood' ? 'flood-intelligence' : hazard === 'cloudburst' ? 'cloudburst-intelligence' : hazard === 'coastal-erosion' ? 'coastal-erosion' : 'sdma-command');
    window.location.hash = `#/${hazard}/red-zone-update`;
  };

  const selectHazardModule = (module: HazardModuleId) => {
    setSelectedHazardModule(module);
    const haz = selectedHazard || 'landslide';
    _setActiveView(haz === 'flood' ? 'flood-intelligence' : haz === 'cloudburst' ? 'cloudburst-intelligence' : haz === 'coastal-erosion' ? 'coastal-erosion' : 'sdma-command');
    window.location.hash = `#/${haz}/${module}`;
  };

  const goHome = () => {
    setSelectedHazard(null);
    setSelectedHazardModule('red-zone-update');
    sessionStorage.removeItem('nivara_hazard');
    _setActiveView('home');
    window.location.hash = '#/home';
  };

  const setActiveView = (view: ActiveView) => {
    const resolvedView = ROUTE_TO_VIEW_MAP[view] || view;
    _setActiveView(resolvedView);
    if (resolvedView === 'candidate-sites' || view === 'candidate-sites' || (view as string) === 'safe-relocation') {
      setSelectedHazardModule('safe-relocation');
    }
    const targetRoute = VIEW_TO_ROUTE_MAP[resolvedView] || resolvedView;
    const currentHash = window.location.hash.replace('#/', '').replace('#', '').trim();
    if (currentHash !== targetRoute) {
      window.location.hash = '#/' + targetRoute;
    }
  };

  const login = (username?: string, password?: string, role?: string): boolean => {
    const userRole = (role as any) || 'SDMA Admin';
    const foundRole = DEMO_ROLES.find(r => r.role === userRole) || DEMO_ROLES[0];
    const user: UserProfile = {
      username: username || foundRole.username,
      name: foundRole.name,
      role: foundRole.role,
      badge: foundRole.badge,
      district: foundRole.district
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    sessionStorage.setItem('nivara_auth', 'true');
    sessionStorage.setItem('nivara_user', JSON.stringify(user));
    setSelectedHazard(null);
    setSelectedHazardModule('red-zone-update');
    sessionStorage.removeItem('nivara_hazard');
    _setActiveView('home');
    window.location.hash = '#/home';
    return true;
  };

  const loginAsDemo = (roleName?: string) => {
    const targetRole = DEMO_ROLES.find(r => r.role === roleName) || DEMO_ROLES[0];
    setCurrentUser(targetRole);
    setIsAuthenticated(true);
    sessionStorage.setItem('nivara_auth', 'true');
    sessionStorage.setItem('nivara_user', JSON.stringify(targetRole));
    setSelectedHazard(null);
    setSelectedHazardModule('red-zone-update');
    sessionStorage.removeItem('nivara_hazard');
    _setActiveView('home');
    window.location.hash = '#/home';
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSelectedHazard(null);
    sessionStorage.removeItem('nivara_auth');
    sessionStorage.removeItem('nivara_user');
    sessionStorage.removeItem('nivara_hazard');
    window.location.hash = '#/login';
  };

  // Sync hash routing and protect dashboard routes
  useEffect(() => {
    const syncRouteWithAuth = () => {
      const rawHash = window.location.hash.replace('#/', '').replace('#', '').trim();
      if (!isAuthenticated) {
        if (rawHash !== 'login') {
          window.location.hash = '#/login';
        }
      } else {
        const parts = rawHash.split('/');
        if (['landslide', 'flood', 'cloudburst', 'coastal-erosion'].includes(parts[0])) {
          setSelectedHazard(parts[0] as HazardType);
          const rawMod = parts[1] as string;
          const mod = (rawMod === 'overview' ? 'red-zone-update' : (rawMod as HazardModuleId)) || 'red-zone-update';
          setSelectedHazardModule(mod);
          sessionStorage.setItem('nivara_hazard', parts[0]);
          const h = parts[0];
          _setActiveView(h === 'flood' ? 'flood-intelligence' : h === 'cloudburst' ? 'cloudburst-intelligence' : h === 'coastal-erosion' ? 'coastal-erosion' : 'sdma-command');
        } else if (!rawHash || rawHash === 'home' || rawHash === 'login' || rawHash === 'dashboard') {
          setSelectedHazard(null);
          setSelectedHazardModule('red-zone-update');
          _setActiveView('home');
          if (window.location.hash !== '#/home') {
            window.location.hash = '#/home';
          }
        } else if (ROUTE_TO_VIEW_MAP[rawHash]) {
          const targetView = ROUTE_TO_VIEW_MAP[rawHash];
          _setActiveView(targetView);
          if (rawHash === 'safe-relocation' || rawHash === 'candidate-sites' || targetView === 'candidate-sites') {
            const saved = (sessionStorage.getItem('nivara_hazard') as HazardType) || 'landslide';
            setSelectedHazard(saved);
            setSelectedHazardModule('safe-relocation');
          }
        }
      }
    };

    syncRouteWithAuth();
    window.addEventListener('hashchange', syncRouteWithAuth);
    return () => window.removeEventListener('hashchange', syncRouteWithAuth);
  }, [isAuthenticated]);

  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [selectedSite, setSelectedSite] = useState<CandidateSite | null>(null);
  
  // Hazard-scoped driver stress multipliers (isolated per hazard type)
  const [hazardStressMultipliers, setHazardStressMultipliersState] = useState<Record<HazardType, number>>({
    'landslide': 1.0,
    'flood': 1.0,
    'cloudburst': 1.0,
    'coastal-erosion': 1.0
  });

  const setHazardStressMultiplier = useCallback((hazard: HazardType, mult: number) => {
    setHazardStressMultipliersState(prev => ({
      ...prev,
      [hazard]: mult
    }));
  }, []);

  const activeHazardKey = selectedHazard || 'landslide';
  const rainfallMultiplier = hazardStressMultipliers[activeHazardKey] ?? 1.0;
  const setRainfallMultiplier = useCallback((val: number) => {
    setHazardStressMultiplier(activeHazardKey, val);
  }, [activeHazardKey, setHazardStressMultiplier]);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Weather Telemetry State
  const [liveWeather, setLiveWeather] = useState<LiveWeatherFeed | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [rainfallAlertThreshold, setRainfallAlertThreshold] = useState<number>(WEATHER_STATION_CONFIG.defaultAlertThresholdMmHr);

  const loadWeatherFeed = useCallback(async () => {
    try {
      setIsWeatherLoading(true);
      const feed = await fetchLiveWeatherFeed(rainfallAlertThreshold);
      setLiveWeather(feed);
      setWeatherError(null);
    } catch (err: any) {
      console.error('Failed to load weather feed:', err);
      setWeatherError(err.message || 'Weather feed unreachable');
    } finally {
      setIsWeatherLoading(false);
    }
  }, [rainfallAlertThreshold]);



  const handleSetActiveView = (view: ActiveView) => {
    setActiveView(view);
    window.location.hash = `#/${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error(`Failed to load data.json: HTTP ${response.status} ${response.statusText}`);
        }
        const jsonData: NivaraData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data.json:', err);
        setError(err.message || 'Unknown error loading data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    loadWeatherFeed();

    // Auto-poll weather feed every 30 minutes with cleanup
    const weatherInterval = setInterval(loadWeatherFeed, WEATHER_STATION_CONFIG.pollingIntervalMs);
    return () => clearInterval(weatherInterval);
  }, [loadWeatherFeed]);

  // What-If Dynamic Risk Recompute Formula:
  // Dynamically models slope runoff & saturation scaling with rainfall intensity
  const recomputeRiskForRainfall = (baseScore: number, rainMultiplier: number, slope: number): { score: number; level: 'HIGH' | 'MEDIUM' | 'LOW' } => {
    if (rainMultiplier === 1.0) {
      const level: 'HIGH' | 'MEDIUM' | 'LOW' = baseScore >= 60 ? 'HIGH' : baseScore >= 35 ? 'MEDIUM' : 'LOW';
      return { score: baseScore, level };
    }
    const rainDeltaFactor = (rainMultiplier - 1.0) * 35.0;
    const slopeAmplifier = 1.0 + (slope / 45.0) * 0.5;
    const addedRisk = rainDeltaFactor * slopeAmplifier;
    const newScore = Math.min(100.0, Math.max(0.0, baseScore + addedRisk));
    const newLevel: 'HIGH' | 'MEDIUM' | 'LOW' = newScore >= 60 ? 'HIGH' : newScore >= 35 ? 'MEDIUM' : 'LOW';
    return { score: Math.round(newScore * 10) / 10, level: newLevel };
  };

  // Bayesian Risk Provider Function
  const getBayesianRisk = useCallback((locationName: string, customRainfall?: number): BayesianRiskEstimate => {
    return getBayesianRiskForLocation(locationName, customRainfall);
  }, []);

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        error,
        activeView,
        setActiveView: handleSetActiveView,
        selectedVillage,
        setSelectedVillage,
        selectedRiskFilter,
        setSelectedRiskFilter,
        selectedParcel,
        setSelectedParcel,
        selectedSite,
        setSelectedSite,
        rainfallMultiplier,
        setRainfallMultiplier,
        hazardStressMultipliers,
        setHazardStressMultiplier,
        searchQuery,
        setSearchQuery,
        recomputeRiskForRainfall,
        liveWeather,
        isWeatherLoading,
        weatherError,
        refreshLiveWeather: loadWeatherFeed,
        rainfallAlertThreshold,
        setRainfallAlertThreshold,
        getBayesianRisk,
        selectedHazard,
        selectedHazardModule,
        selectHazard,
        selectHazardModule,
        goHome,
        isAuthenticated,
        currentUser,
        login,
        loginAsDemo,
        logout,
        theme,
        setTheme,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
