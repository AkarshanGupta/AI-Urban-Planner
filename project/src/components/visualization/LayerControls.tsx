import React from 'react';
import { Eye, EyeOff, Layers, Route, TreePine, Zap } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';

export const LayerControls: React.FC = () => {
  const { viewLayers, toggleLayer } = usePlanning();

  const layers = [
    { id: 'zoning', label: 'Zoning', icon: Layers, active: viewLayers.zoning },
    { id: 'infrastructure', label: 'Infrastructure', icon: Route, active: viewLayers.infrastructure },
    { id: 'greenspace', label: 'Green Spaces', icon: TreePine, active: viewLayers.greenspace },
    { id: 'utilities', label: 'Utilities', icon: Zap, active: viewLayers.utilities },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        View Layers
      </h3>
      <div className="space-y-2">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md transition-colors ${
              layer.active 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <layer.icon className="h-4 w-4" />
            <span className="text-sm">{layer.label}</span>
            {layer.active ? (
              <Eye className="h-3 w-3 ml-auto" />
            ) : (
              <EyeOff className="h-3 w-3 ml-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};