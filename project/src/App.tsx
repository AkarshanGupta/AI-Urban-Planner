import React, { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { CityVisualization } from './components/CityVisualization';
import { Header } from './components/Header';
import { PlanningProvider } from './context/PlanningContext';
import { GISMap } from './components/GISMap';
import { TooltipProvider } from './components/ui/TooltipProvider';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<'3d' | 'map'>('3d');

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full flex flex-col">
        <PlanningProvider>
          <TooltipProvider>
            <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="flex-1 flex overflow-hidden relative">
              {/* View Switcher (placed bottom-right to avoid overlapping other controls) */}
              <div className="absolute bottom-4 right-4 z-[2000] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow p-1 flex items-center space-x-1">
                <button
                  onClick={() => setActiveView('3d')}
                  className={`px-3 py-1.5 text-sm rounded-md ${activeView === '3d' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  title="Show 3D City"
                >
                  3D City
                </button>
                <button
                  onClick={() => setActiveView('map')}
                  className={`px-3 py-1.5 text-sm rounded-md ${activeView === 'map' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  title="Show GIS Map"
                >
                  GIS Map
                </button>
              </div>

              <ControlPanel />
              {activeView === '3d' ? (
                <CityVisualization />
              ) : (
                <div className="flex-1 overflow-hidden">
                  <GISMap onBackTo3D={() => setActiveView('3d')} />
                </div>
              )}
            </div>
          </TooltipProvider>
        </PlanningProvider>
      </div>
    </div>
  );
}

export default App;