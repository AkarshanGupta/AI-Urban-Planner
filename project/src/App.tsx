import React, { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { CityVisualization } from './components/CityVisualization';
import { Header } from './components/Header';
import { PlanningProvider } from './context/PlanningContext';
import { TooltipProvider } from './components/ui/TooltipProvider';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full flex flex-col">
        <PlanningProvider>
          <TooltipProvider>
            <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="flex-1 flex overflow-hidden">
              <ControlPanel />
              <CityVisualization />
            </div>
          </TooltipProvider>
        </PlanningProvider>
      </div>
    </div>
  );
}

export default App;