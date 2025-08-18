import React, { useState } from 'react';
import { TreePine, Flower2, Waves, Wind } from 'lucide-react';
import { SliderControl } from '../ui/SliderControl';
import { ToggleControl } from '../ui/ToggleControl';
import { MetricsCard } from '../ui/MetricsCard';
import { SpeciesSelector } from '../ui/SpeciesSelector';

export const GreenSpaceArchitect: React.FC = () => {
  const [parkDensity, setParkDensity] = useState(25);
  const [biodiversityIndex, setBiodiversityIndex] = useState(70);
  const [showAirQuality, setShowAirQuality] = useState(true);
  const [showWildlifeCorridors, setShowWildlifeCorridors] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Green Space Architect
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Design ecosystem-based parks and environmental infrastructure
        </p>
      </div>

      {/* Green Space Configuration */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <TreePine className="h-4 w-4 mr-2 text-green-600" />
          Park & Recreation Areas
        </h3>
        
        <SliderControl
          label="Park Density"
          value={parkDensity}
          onChange={setParkDensity}
          min={5}
          max={50}
          step={5}
          unit="% of area"
        />
        
        <SliderControl
          label="Biodiversity Index"
          value={biodiversityIndex}
          onChange={setBiodiversityIndex}
          min={0}
          max={100}
          step={5}
          unit="species variety"
        />
      </div>

      {/* Native Species Selection */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <Flower2 className="h-4 w-4 mr-2 text-green-600" />
          Native Plant Selection
        </h3>
        <SpeciesSelector />
      </div>

      {/* Environmental Analysis */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
          Environmental Analysis
        </h3>
        
        <ToggleControl
          label="Air Quality Impact"
          description="Show pollution reduction and oxygen generation"
          checked={showAirQuality}
          onChange={setShowAirQuality}
        />
        
        <ToggleControl
          label="Wildlife Corridors"
          description="Display connectivity pathways for biodiversity"
          checked={showWildlifeCorridors}
          onChange={setShowWildlifeCorridors}
        />
      </div>

      {/* Environmental Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricsCard
          title="Carbon Offset"
          value="12.5"
          unit="tons/year"
          icon={Wind}
          trend="up"
          color="green"
        />
        <MetricsCard
          title="Stormwater"
          value="85"
          unit="% managed"
          icon={Waves}
          trend="up"
          color="blue"
        />
      </div>
    </div>
  );
};