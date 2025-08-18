import React, { useState } from 'react';
import { Check } from 'lucide-react';

const nativeSpecies = [
  { id: 'oak', name: 'White Oak', type: 'Tree', co2: 48, selected: true },
  { id: 'maple', name: 'Sugar Maple', type: 'Tree', co2: 35, selected: true },
  { id: 'wildflower', name: 'Native Wildflowers', type: 'Ground Cover', co2: 5, selected: false },
  { id: 'fern', name: 'Royal Fern', type: 'Understory', co2: 8, selected: false },
  { id: 'grass', name: 'Buffalo Grass', type: 'Grass', co2: 3, selected: true },
];

export const SpeciesSelector: React.FC = () => {
  const [species, setSpecies] = useState(nativeSpecies);

  const toggleSpecies = (id: string) => {
    setSpecies(prev => prev.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  return (
    <div className="space-y-3">
      {species.map((item) => (
        <div
          key={item.id}
          onClick={() => toggleSpecies(item.id)}
          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
            item.selected 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  item.selected 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {item.selected && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.type}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {item.co2} lbs CO₂/year
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};