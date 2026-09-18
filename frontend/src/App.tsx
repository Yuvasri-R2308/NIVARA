import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { ErrorState } from './components/common/ErrorState';
import { EvidenceModal } from './components/modals/EvidenceModal';
import { Chatbot } from './components/common/Chatbot';
import { LoginPage } from './components/LoginPage';

// Multi-Hazard Portal & Command Center
import { NivaraHome } from './pages/NivaraHome';
import { HazardCommandCenter } from './pages/HazardCommandCenter';

// Specialized Modeling Views
import { WhatIfSimulation } from './pages/WhatIfSimulation';
import { DWSSLPage } from './pages/DWSSLPage';
import { DatasetExplorer } from './pages/DatasetExplorer';
import { MethodologyPipeline } from './pages/MethodologyPipeline';
import { EarlyWarning } from './pages/EarlyWarning';
import { AreaComparison } from './pages/AreaComparison';
import { CarryingCapacity } from './pages/CarryingCapacity';
import { AuthorityAction } from './pages/AuthorityAction';

export const AppContent: React.FC = () => {
  const { activeView, selectedHazard, isLoading, error } = useApp();
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D0A] text-pine-text flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar onOpenEvidence={() => setShowEvidenceModal(true)} />
          <main className="flex-1 bg-[#070D0A]">
            <LoadingSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // 1. NIVARA HOME DISASTER SELECTION PORTAL
  // If no hazard is actively selected, or view is 'home', display the 4-disaster selection portal
  if (!selectedHazard || activeView === 'home') {
    return <NivaraHome />;
  }

  // 2. HAZARD-SPECIFIC COMMAND CENTER OR SPECIALIZED TOOL
  const renderActiveView = () => {
    switch (activeView) {
      case 'what-if-simulation':
        return <WhatIfSimulation />;
      case 'dwssl':
        return <DWSSLPage />;
      case 'dataset-explorer':
        return <DatasetExplorer />;
      case 'methodology-pipeline':
        return <MethodologyPipeline />;
      case 'early-warning':
        return <EarlyWarning />;
      case 'area-comparison':
        return <AreaComparison />;
      case 'carrying-capacity':
        return <CarryingCapacity />;
      case 'authority-action':
        return <AuthorityAction />;
      default:
        // Default to the comprehensive 11-module Hazard Command Center
        return <HazardCommandCenter />;
    }
  };

  return (
    <div className="w-full h-screen bg-[#070D0A] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden w-full h-[calc(100vh-64px)]">
        <Sidebar onOpenEvidence={() => setShowEvidenceModal(true)} />
        <main className="flex-1 overflow-y-auto bg-[#070D0A] p-0 w-full min-w-0 h-full">
          {renderActiveView()}
        </main>
      </div>

      {/* SDMA Evidence & Pipeline Modal */}
      {showEvidenceModal && (
        <EvidenceModal isOpen={showEvidenceModal} onClose={() => setShowEvidenceModal(false)} />
      )}

      {/* Floating AI Chat Assistant */}
      <Chatbot />
    </div>
  );
};

export function App() {
  const { isAuthenticated } = useApp();

  // Preserved untouched login page condition
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppContent />;
}

export default App;
