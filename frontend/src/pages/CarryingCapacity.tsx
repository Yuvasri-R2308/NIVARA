import React from 'react';
import { useApp } from '../context/AppContext';
import { LandSafetyCarryingCapacityDashboard } from '../components/capacity/LandSafetyCarryingCapacityDashboard';

export const CarryingCapacity: React.FC = () => {
  const { selectedHazard, selectHazardModule } = useApp();

  return (
    <LandSafetyCarryingCapacityDashboard 
      hazard={selectedHazard || 'landslide'} 
      onNavigateModule={selectHazardModule} 
    />
  );
};

export default CarryingCapacity;
