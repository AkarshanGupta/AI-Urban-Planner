import React from 'react';
import { Users, MapPin, Thermometer, Building2, Zap, TreePine, Sparkles, BarChart3 } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';
import { SliderControl } from '../ui/SliderControl';
import { SelectControl } from '../ui/SelectControl';
import { ProgressIndicator } from '../ui/ProgressIndicator';
import { MetricsCard } from '../ui/MetricsCard';
import { WeatherWidget } from '../ui/WeatherWidget';
import { PopulationChart } from '../ui/PopulationChart';

export const SmartCityGenerator: React.FC = () => {
  const { cityData, updateCityData, generateCity, isGenerating } = usePlanning();

  const handleParameterChange = (key: string, value: any) => {
    updateCityData({ [key]: value });
  };

  const climateOptions = [
    { value: 'temperate', label: 'Temperate' },
    { value: 'tropical', label: 'Tropical' },
    { value: 'arid', label: 'Arid' },
    { value: 'continental', label: 'Continental' },
  ];

  const terrainOptions = [
    { value: 'flat', label: 'Flat Plains' },
    { value: 'hilly', label: 'Rolling Hills' },
    { value: 'coastal', label: 'Coastal' },
    { value: 'mountainous', label: 'Mountainous' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Smart City Generator
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define population demographics, environmental constraints, and historical context
        </p>
      </div>

      {/* Demographics Section */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <Users className="h-4 w-4 mr-2 text-blue-600" />
          Population Demographics
        </h3>
        
        <SliderControl
          label="Population Density"
          value={cityData.populationDensity}
          onChange={(value) => handleParameterChange('populationDensity', value)}
          min={1000}
          max={50000}
          step={1000}
          unit="people/km²"
        />
        
        <SliderControl
          label="Average Income"
          value={cityData.averageIncome}
          onChange={(value) => handleParameterChange('averageIncome', value)}
          min={30000}
          max={150000}
          step={5000}
          unit="$/year"
        />
        
        <SliderControl
          label="Age Diversity Index"
          value={cityData.ageDiversity}
          onChange={(value) => handleParameterChange('ageDiversity', value)}
          min={0}
          max={100}
          step={5}
          unit="%"
        />
      </div>

      {/* Environmental Section */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-green-600" />
          Environmental Constraints
        </h3>
        
        <SelectControl
          label="Climate Zone"
          value={cityData.climate}
          onChange={(value) => handleParameterChange('climate', value)}
          options={climateOptions}
        />
        
        <SelectControl
          label="Terrain Type"
          value={cityData.terrain}
          onChange={(value) => handleParameterChange('terrain', value)}
          options={terrainOptions}
        />
        
        <SliderControl
          label="Environmental Risk"
          value={cityData.environmentalRisk}
          onChange={(value) => handleParameterChange('environmentalRisk', value)}
          min={0}
          max={100}
          step={5}
          unit="%"
        />
      </div>

      {/* Generation Controls */}
      <div className="space-y-4">
        <WeatherWidget climate={cityData.climate} />
        
        <button
          onClick={generateCity}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isGenerating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Smart City Layout</span>
            </>
          )}
        </button>
        
        {isGenerating && (
          <ProgressIndicator 
            progress={75} 
            label="City Generation Progress"
          />
        )}
      </div>

      {/* Population Analytics */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
          <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
          Population Analytics
        </h3>
        <PopulationChart cityData={cityData} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricsCard
          title="Sustainability Score"
          value="85"
          unit="%"
          icon={TreePine}
          trend="up"
          color="green"
        />
        <MetricsCard
          title="Efficiency Rating"
          value="78"
          unit="%"
          icon={Building2}
          trend="up"
          color="blue"
        />
      </div>
    </div>
  );
};