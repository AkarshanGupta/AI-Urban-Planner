import React from 'react';

interface CityGridProps {
  cityData: any;
  viewLayers: any;
}

export const CityGrid: React.FC<CityGridProps> = ({ cityData, viewLayers }) => {
  const gridSize = 20;
  
  const getZoneColor = (zoneType: string) => {
    switch (zoneType) {
      case 'residential': return 'bg-green-400';
      case 'commercial': return 'bg-blue-400';
      case 'industrial': return 'bg-yellow-400';
      case 'park': return 'bg-green-600';
      case 'water': return 'bg-blue-600';
      default: return 'bg-gray-300';
    }
  };

  const generateZone = (x: number, y: number) => {
    const seed = x * gridSize + y;
    const rand = (seed * 9301 + 49297) % 233280;
    const normalized = rand / 233280;
    
    if (normalized < 0.4) return 'residential';
    if (normalized < 0.6) return 'commercial';
    if (normalized < 0.75) return 'park';
    if (normalized < 0.9) return 'industrial';
    return 'water';
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div 
        className="grid gap-1 transform rotate-45"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: '600px',
          height: '600px'
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const zoneType = generateZone(x, y);
          const baseHeight = Math.random() * 30 + 20;
          
          return (
            <div
              key={index}
              className={`relative transition-all duration-300 hover:scale-110 cursor-pointer ${getZoneColor(zoneType)}`}
              style={{
                height: `${baseHeight}px`,
                transform: `translateZ(${baseHeight}px)`,
                transformStyle: 'preserve-3d'
              }}
              title={`${zoneType} zone (${x}, ${y})`}
            >
              {viewLayers.infrastructure && (
                <div className="absolute inset-0 border border-gray-500 opacity-30" />
              )}
              {viewLayers.greenspace && zoneType === 'park' && (
                <div className="absolute inset-0 bg-green-700 opacity-50" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};