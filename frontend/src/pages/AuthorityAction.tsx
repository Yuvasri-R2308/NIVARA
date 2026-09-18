import React from 'react';
import { useApp } from '../context/AppContext';
import { AuthorityActionResponsePlanner } from '../components/action/AuthorityActionResponsePlanner';

export const AuthorityAction: React.FC = () => {
  const { selectedHazard, selectHazardModule, theme } = useApp();

  return (
    <div className="min-h-full w-full bg-[#070D0A]">
      <AuthorityActionResponsePlanner
        hazardKey={selectedHazard || 'landslide'}
        theme={theme}
        onNavigateModule={selectHazardModule}
      />
    </div>
  );
};
