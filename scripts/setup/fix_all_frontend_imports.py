import os

FRONTEND_SRC = r"c:\Users\yuvasri\OneDrive\Desktop\SIH PRG DATASET\Wayanad_FINAL_PROJECT_DATASET_PACKAGE_UPDATED\NIVRA UPDATED PROJECT\frontend\src"

# 1. App.tsx
app_tsx = """import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { ErrorState } from './components/common/ErrorState';
import { EvidenceModal } from './components/modals/EvidenceModal';
import { Chatbot } from './components/common/Chatbot';

// 5 Primary Experiences
import { SDMACommand } from './pages/SDMACommand';
import { RedZoneMap } from './pages/RedZoneMap';
import { RelocationEngine } from './pages/RelocationEngine';
import { WhatIfSimulation } from './pages/WhatIfSimulation';
import { IntelligenceLayers } from './pages/IntelligenceLayers';

// Secondary Views / Aliases
import { DataFoundation } from './pages/DataFoundation';
import { PriorityQueue } from './pages/PriorityQueue';
import { HazardRunout } from './pages/HazardRunout';
import { CandidateSites } from './pages/CandidateSites';
import { CarryingCapacity } from './pages/CarryingCapacity';
import { EarlyWarning } from './pages/EarlyWarning';
import { AreaComparison } from './pages/AreaComparison';
import { DatasetExplorer } from './pages/DatasetExplorer';
import { MethodologyPipeline } from './pages/MethodologyPipeline';

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
      // 5 Core Primary Views
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

      // Secondary & Specialised Engines
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
      case 'data-foundation':
        return <DataFoundation />;
      case 'dataset-explorer':
        return <DatasetExplorer />;
      case 'methodology-pipeline':
        return <MethodologyPipeline />;

      default:
        return <SDMACommand />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1310] text-pine-text flex flex-col selection:bg-pine-accent selection:text-pine-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenEvidence={() => setShowEvidenceModal(true)} />
        <main className="flex-1 overflow-y-auto bg-[#0B1310] p-0">
          {renderActiveView()}
        </main>
      </div>
      <Footer />

      {/* SDMA Evidence & Pipeline Modal */}
      {showEvidenceModal && (
        <EvidenceModal onClose={() => setShowEvidenceModal(false)} />
      )}

      {/* Floating AI Chat Assistant */}
      <Chatbot />
    </div>
  );
};

export function App() {
  return <AppContent />;
}

export default App;
"""
with open(os.path.join(FRONTEND_SRC, "App.tsx"), "w", encoding="utf-8") as f:
    f.write(app_tsx)

# 2. Fix common components
def replace_in_file(path, replacements):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

replace_in_file(os.path.join(FRONTEND_SRC, "components", "common", "DataConfidenceTag.tsx"), [
    ("from '../types'", "from '../../types'")
])
replace_in_file(os.path.join(FRONTEND_SRC, "components", "common", "RiskBadge.tsx"), [
    ("from '../types'", "from '../../types'")
])
replace_in_file(os.path.join(FRONTEND_SRC, "components", "common", "StatCard.tsx"), [
    ("from '../types'", "from '../../types'")
])
replace_in_file(os.path.join(FRONTEND_SRC, "components", "common", "Footer.tsx"), [
    ("from '../context/AppContext'", "from '../../context/AppContext'")
])
replace_in_file(os.path.join(FRONTEND_SRC, "components", "map", "MapComponent.tsx"), [
    ("from '../types'", "from '../../types'")
])
replace_in_file(os.path.join(FRONTEND_SRC, "components", "risk", "FactorBreakdown.tsx"), [
    ("from '../types'", "from '../../types'")
])
replace_in_file(os.path.join(FRONTEND_SRC, "components", "modals", "EvidenceModal.tsx"), [
    ("from './DataConfidenceTag'", "from '../common/DataConfidenceTag'")
])
replace_in_file(os.path.join(FRONTEND_SRC, "components", "modals", "DetailedAnalysisModal.tsx"), [
    ("from '../data/areaHazardProfiles'", "from '../../data/areaHazardProfiles'"),
    ("from '../services/bayesianRiskService'", "from '../../services/bayesianRiskService'")
])

# 3. Fix capacity components
capacity_dir = os.path.join(FRONTEND_SRC, "components", "capacity")
for cf in os.listdir(capacity_dir):
    cfp = os.path.join(capacity_dir, cf)
    if cf.endswith(".tsx"):
        replace_in_file(cfp, [
            ("from '../../../types'", "from '../../types'"),
            ("from '../types'", "from '../../types'"),
            ("from '../utils/capacityCalculator'", "from '../../utils/capacityCalculator'"),
            ("from '../data/siteCapacityRegistry'", "from '../../data/siteCapacityRegistry'"),
            ("alloc: any, idx: number", "alloc: any, idx: number"),
            ("(alloc, idx)", "(alloc: any, idx: number)")
        ])

print("Fixed all frontend imports precisely!")
