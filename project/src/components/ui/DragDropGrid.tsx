import React, { useState } from 'react';
import { Route, Heart, GraduationCap, Plane, Trash2 } from 'lucide-react';
import { usePlanning, PLACEMENT_GRID_SIZE } from '../../context/PlanningContext';

interface DragDropGridProps {
  selectedTool: string;
}

interface GridItem {
  id: string;
  type: string;
  x: number;
  y: number;
}

export const DragDropGrid: React.FC<DragDropGridProps> = ({ selectedTool }) => {
  const { placements, addPlacement, removePlacementAt, clearPlacements } = usePlanning();
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const gridSize = PLACEMENT_GRID_SIZE;
  
  const handleCellClick = (x: number, y: number) => {
    const existingItem = placements.find(item => item.x === x && item.y === y);
    if (existingItem) {
      removePlacementAt(x, y);
    } else {
      addPlacement({ id: `${selectedTool}-${Date.now()}`, type: selectedTool, x, y });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'road': return Route;
      case 'hospital': return Heart;
      case 'school': return GraduationCap;
      case 'airport': return Plane;
      default: return Route;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'road': return 'text-gray-600 bg-gray-200';
      case 'hospital': return 'text-red-600 bg-red-100';
      case 'school': return 'text-blue-600 bg-blue-100';
      case 'airport': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Infrastructure Grid ({placements.length} items placed)
        </h4>
        <button
          onClick={() => clearPlacements()}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear</span>
        </button>
      </div>
      
      <div className="grid grid-cols-8 gap-1 aspect-square">
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const item = placements.find(item => item.x === x && item.y === y);
          const Icon = item ? getIcon(item.type) : null;
          
          return (
            <button
              key={index}
              onClick={() => handleCellClick(x, y)}
              className={`aspect-square border border-gray-300 dark:border-gray-600 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center ${
                item ? getColor(item.type) : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              {Icon && <Icon className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p className="text-center">
          Click cells to place <span className="font-medium">{selectedTool}</span> infrastructure
        </p>
        <p className="text-center">
          Click existing items to remove them
        </p>
      </div>
    </div>
  );
};