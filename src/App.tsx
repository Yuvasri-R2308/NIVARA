import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { EvidenceModal } from './components/EvidenceModal';
import { Chatbot } from './components/Chatbot';

// 5 Primary Experiences
import { SDMACommand } from './views/SDMACommand';
import { RedZoneMap } from './views/RedZoneMap';
import { RelocationEngine } from './views/RelocationEngine';
import { WhatIfSimulation } from './views/WhatIfSimulation';
import { IntelligenceLayers } from './views/IntelligenceLayers';

// Secondary Views / Aliases
import { DataFoundation } from './views/DataFoundation';
import { PriorityQueue } from './views/PriorityQueue';
import { HazardRunout } from './views/HazardRunout';
import { CandidateSites } from './views/CandidateSites';
import { CarryingCapacity } from './views/CarryingCapacity';
import { EarlyWarning } from './views/EarlyWarning';
import { AreaComparison } from './views/AreaComparison';
import { DatasetExplorer } from './views/DatasetExplorer';
import { MethodologyPipeline } from './views/MethodologyPipeline';

import { 
  ShieldAlert, 
  Map, 
  Sparkles, 
  Sliders, 
  Radio 
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeView, setActiveView, isLoading, error } = useApp();
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1310] text-pine-text flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar onOpenEvidence={() => setShowEvidenceModal(true)} />
          <main className="flex-1 bg-[#0B1310]">
            <LoadingSkeleton />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      // 5 Primary Operational Experiences
      case 'sdma-command':
        return <SDMACommand />;
      case 'red-zone-map':
        return <RedZoneMap />;
      case 'relocation-engine':
        return <RelocationEngine />;
      case 'what-if-simulation':
        return <WhatIfSimulation />;
      case 'intelligence-layers':
        return <IntelligenceLayers />;

      // Integrated Secondary Views
      case 'data-foundation':
        return <DataFoundation />;
      case 'priority-queue':
        return <PriorityQueue />;
      case 'hazard-runout':
        return <HazardRunout />;
      case 'candidate-sites':
        return <CandidateSites />;
      case 'carrying-capacity':
        return <CarryingCapacity />;
      case 'early-warning':
        return <EarlyWarning />;
      case 'area-comparison':
        return <AreaComparison />;
      case 'dataset-explorer':
        return <DatasetExplorer />;
      case 'methodology-pipeline':
        return <MethodologyPipeline />;
      default:
        return <SDMACommand />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1310] text-pine-text flex flex-col selection:bg-emerald-500 selection:text-black">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop / Tablet Sidebar */}
        <Sidebar onOpenEvidence={() => setShowEvidenceModal(true)} />
        
        {/* Main Operational Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#0B1310] min-h-[calc(100vh-100px)] pb-16 md:pb-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1400] bg-[#0E1A15]/95 backdrop-blur-lg border-t border-[#1E3228] px-2 py-1.5 flex items-center justify-around text-[10px] font-mono select-none">
        <button
          onClick={() => setActiveView('sdma-command')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
            activeView === 'sdma-command' ? 'text-emerald-400 font-bold' : 'text-pine-muted'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveView('priority-queue')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
            activeView === 'priority-queue' ? 'text-emerald-400 font-bold' : 'text-pine-muted'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Evacuate</span>
        </button>

        <button
          onClick={() => setActiveView('relocation-engine')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
            activeView === 'relocation-engine' ? 'text-emerald-400 font-bold' : 'text-pine-muted'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Relocate</span>
        </button>

        <button
          onClick={() => setActiveView('what-if-simulation')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
            activeView === 'what-if-simulation' ? 'text-emerald-400 font-bold' : 'text-pine-muted'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Simulate</span>
        </button>

        <button
          onClick={() => setActiveView('intelligence-layers')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
            activeView === 'intelligence-layers' ? 'text-emerald-400 font-bold' : 'text-pine-muted'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Intel</span>
        </button>
      </nav>

      {/* Floating AI Disaster Copilot */}
      <Chatbot />

      {/* Global Data & Evidence Modal */}
      <EvidenceModal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
      />

      <Footer />
    </div>
  );
};
