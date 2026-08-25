import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NivaraData, ActiveView, Parcel, CandidateSite, VillageStat } from '../types';

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
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  recomputeRiskForRainfall: (baseScore: number, rainMultiplier: number, slope: number) => { score: number; level: 'HIGH' | 'MEDIUM' | 'LOW' };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<NivaraData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL synced active view
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const validViews: ActiveView[] = [
      'data-foundation', 'red-zone-map', 'priority-queue', 'hazard-runout',
      'candidate-sites', 'carrying-capacity', 'relocation-engine', 'sdma-command',
      'early-warning', 'intelligence-layers', 'area-comparison', 'what-if-simulation',
      'dataset-explorer', 'methodology-pipeline'
    ];
    return (validViews.includes(hash as ActiveView) ? hash as ActiveView : 'sdma-command');
  });

  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [selectedSite, setSelectedSite] = useState<CandidateSite | null>(null);
  const [rainfallMultiplier, setRainfallMultiplier] = useState<number>(1.0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        setActiveView(hash as ActiveView);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
  }, []);

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
        searchQuery,
        setSearchQuery,
        recomputeRiskForRainfall
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
