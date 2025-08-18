import React, { useState } from 'react';
import { Layers, Route, TreePine, BarChart3, Settings } from 'lucide-react';
import { SmartCityGenerator } from './planning/SmartCityGenerator';
import { InfrastructureDesigner } from './planning/InfrastructureDesigner';
import { GreenSpaceArchitect } from './planning/GreenSpaceArchitect';
import { PredictiveDashboard } from './planning/PredictiveDashboard';
import { TabButton } from './ui/TabButton';

type TabType = 'generator' | 'infrastructure' | 'greenspace' | 'dashboard' | 'settings';

export const ControlPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('generator');

  const tabs = [
    { id: 'generator' as TabType, label: 'City Generator', icon: Layers },
    { id: 'infrastructure' as TabType, label: 'Infrastructure', icon: Route },
    { id: 'greenspace' as TabType, label: 'Green Spaces', icon: TreePine },
    { id: 'dashboard' as TabType, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generator':
        return <SmartCityGenerator />;
      case 'infrastructure':
        return <InfrastructureDesigner />;
      case 'greenspace':
        return <GreenSpaceArchitect />;
      case 'dashboard':
        return <PredictiveDashboard />;
      case 'settings':
        return <div className="p-6 text-gray-600 dark:text-gray-400">Settings panel coming soon...</div>;
      default:
        return <SmartCityGenerator />;
    }
  };

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-col">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};