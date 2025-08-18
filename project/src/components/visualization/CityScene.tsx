import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Building } from './Building';
import { Road } from './Road';
import { Park } from './Park';
import { Utility } from './Utility';
import * as THREE from 'three';

interface CitySceneProps {
  cityData: any;
  viewLayers: any;
  isAnimating: boolean;
  isGenerating: boolean;
}

export const CityScene: React.FC<CitySceneProps> = ({ 
  cityData, 
  viewLayers, 
  isAnimating,
  isGenerating 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate city layout based on parameters
  const cityLayout = useMemo(() => {
    const layout = [];
    const gridSize = cityData.size || 20;
    const density = cityData.populationDensity / 10000;
    const arterialStep = 5;
    
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const seed = x * gridSize + z;
        const random = (seed * 9301 + 49297) % 233280 / 233280;
        
        let type = 'empty';
        let height = 1;
        let color = '#e5e7eb';
        let orientation: 'horizontal' | 'vertical' | 'intersection' | undefined;
        let hasLight: boolean | undefined;
        
        // Determine building type based on location and parameters
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - gridSize/2, 2) + Math.pow(z - gridSize/2, 2)
        );
        const centerFactor = 1 - (distanceFromCenter / (gridSize/2));
        
        // Arterial grid: carve roads every `arterialStep` cells, aligned with traffic simulation
        const isArterialX = x % arterialStep === 0;
        const isArterialZ = z % arterialStep === 0;
        if (isArterialX || isArterialZ) {
          type = 'road';
          height = 0.1;
          color = '#6b7280';
          orientation = isArterialX && isArterialZ ? 'intersection' : (isArterialZ ? 'horizontal' : 'vertical');
          hasLight = (x + z) % (arterialStep * 2) === 0;
        } else {
          // Increase base building chance so the city feels fuller by default
          const buildingChance = Math.min(0.2 + density * 0.5 + centerFactor * 0.15, 0.9);
          if (random < buildingChance) {
            if (centerFactor > 0.7 && random < 0.05) {
              type = 'skyscraper';
              height = 15 + random * 20;
              color = '#1f2937';
            } else if (centerFactor > 0.5) {
              type = 'commercial';
              height = 5 + random * 10;
              color = '#3b82f6';
            } else if (random < 0.3) {
              type = 'residential';
              height = 2 + random * 6;
              color = '#10b981';
            } else {
              type = 'industrial';
              height = 3 + random * 5;
              color = '#f59e0b';
            }
          } else if (random < buildingChance + 0.08) {
            type = 'park';
            height = 0.2;
            color = '#059669';
          } else if (random < buildingChance + 0.12) {
            type = 'road';
            height = 0.1;
            color = '#6b7280';
            orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            hasLight = Math.random() > 0.8;
          } else {
            // Fallback: fill remaining cells with low-rise residential to avoid empty gaps
            type = 'residential';
            height = 2 + random * 4;
            color = '#10b981';
          }
        }
        
        layout.push({
          x: (x - gridSize/2) * 4,
          z: (z - gridSize/2) * 4,
          type,
          height,
          color,
          id: `${x}-${z}`,
          seed: random,
          orientation,
          hasLight
        });
      }
    }
    
    return layout;
  }, [cityData]);

  // Animation
  useFrame((state) => {
    if (isAnimating && groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {cityLayout.map((item) => {
        const position: [number, number, number] = [item.x, item.height/2, item.z];
        
        if (!viewLayers.zoning && item.type !== 'road') return null;
        if (!viewLayers.infrastructure && item.type === 'road') return null;
        if (!viewLayers.greenspace && item.type === 'park') return null;
        
        switch (item.type) {
          case 'skyscraper':
          case 'commercial':
          case 'residential':
          case 'industrial':
            return (
              <Building
                key={item.id}
                position={position}
                height={item.height}
                color={item.color}
                type={item.type}
                isGenerating={isGenerating}
                animationDelay={item.seed * 2}
              />
            );
          case 'road':
            return (
              <Road
                key={item.id}
                position={position}
                color={item.color}
                orientation={item.orientation}
                hasLight={item.hasLight}
              />
            );
          case 'park':
            return (
              <Park
                key={item.id}
                position={position}
                size={3.5}
              />
            );
          default:
            return null;
        }
      })}
      
      {/* Utility Networks */}
      {viewLayers.utilities && (
        <Utility cityLayout={cityLayout} />
      )}
    </group>
  );
};