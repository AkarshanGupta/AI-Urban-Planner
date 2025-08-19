import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Building } from './Building';
import { Road } from './Road';
import { Park } from './Park';
import { Utility } from './Utility';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { usePlanning, PLACEMENT_GRID_SIZE } from '../../context/PlanningContext';

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
  const { placements } = usePlanning();
  
  // Generate city layout based on parameters
  const cityLayout = useMemo(() => {
    const layout = [];
    const gridSize = cityData.size || 20;
    const density = cityData.populationDensity / 10000;
    // Environmental constraints
    const climate: string = cityData.climate;
    const terrain: string = cityData.terrain;
    const envRisk: number = cityData.environmentalRisk; // 0..100

    // Adjust road spacing by terrain (hillier terrain → fewer arterials)
    const isHilly = terrain === 'hilly' || terrain === 'mountainous';
    const arterialStep = isHilly ? 6 : 5;
    
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

        // Climate/terrain/risk biases
        let parkBias = 0;
        if (climate === 'tropical') parkBias += 0.05;
        if (climate === 'arid') parkBias -= 0.03;

        let skyscraperBias = 0;
        if (terrain === 'flat') skyscraperBias += 0.02;
        if (isHilly) skyscraperBias -= 0.05;

        const risk = Math.max(0, Math.min(1, envRisk / 100));
        skyscraperBias -= risk * 0.08; // higher risk → fewer tall buildings
        parkBias += risk * 0.05; // higher risk → more open/green buffers
        
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
          // Adjust by risk (higher risk → slightly less densification)
          const buildingChance = Math.min(
            Math.max(0.1, 0.2 + density * 0.5 + centerFactor * 0.15 - risk * 0.08),
            0.9
          );
          if (random < buildingChance) {
            if (centerFactor > 0.7 && random < 0.05 + skyscraperBias) {
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
          } else if (random < buildingChance + 0.08 + parkBias) {
            type = 'park';
            height = 0.2;
            // Park palette influenced by climate
            color = climate === 'arid' ? '#a3a3a3' : (climate === 'tropical' ? '#059669' : '#16a34a');
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

        // Terrain-driven vertical variance for buildings (hills → more height variation)
        if (type !== 'road' && type !== 'park') {
          const variance = isHilly ? (Math.sin(x * 0.3) + Math.cos(z * 0.3)) * 0.15 : 0;
          height = Math.max(0.5, height * (1 + variance));
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

  // Map infrastructure placements (8x8 grid) to world coordinates of city grid
  const placementWorldPositions = useMemo(() => {
    const gridSize = cityData.size || 20;
    const mapped = placements.map((p) => {
      const mappedXIndex = Math.round((p.x / (PLACEMENT_GRID_SIZE - 1)) * (gridSize - 1));
      const mappedZIndex = Math.round((p.y / (PLACEMENT_GRID_SIZE - 1)) * (gridSize - 1));
      const worldX = (mappedXIndex - gridSize / 2) * 4;
      const worldZ = (mappedZIndex - gridSize / 2) * 4;
      return { ...p, worldX, worldZ };
    });
    return mapped;
  }, [placements, cityData.size]);

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

      {/* Infrastructure Placements from Designer */}
      {viewLayers.infrastructure && placementWorldPositions.map((item) => {
        const baseY = 1;
        const labelOffset = 1.2;
        if (item.type === 'road') {
          return (
            <Road
              key={`placement-road-${item.id}`}
              position={[item.worldX, 0.05, item.worldZ]}
              color="#6b7280"
              orientation={'horizontal'}
              hasLight={false}
            />
          );
        }
        if (item.type === 'hospital') {
          return (
            <group key={`placement-hospital-${item.id}`} position={[item.worldX, baseY, item.worldZ]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[3.5, 2, 3.5]} />
                <meshLambertMaterial color="#ef4444" />
              </mesh>
              <Billboard position={[0, labelOffset + 1.2, 0]}>
                <Text 
                  fontSize={0.8} 
                  color="#fbbf24" 
                  anchorX="center" 
                  anchorY="middle"
                  renderOrder={1000}
                  material-transparent
                  material-depthTest={false}
                  outlineWidth={0.03}
                  outlineColor="#111827"
                >
                  Hospital
                </Text>
              </Billboard>
            </group>
          );
        }
        if (item.type === 'school') {
          return (
            <group key={`placement-school-${item.id}`} position={[item.worldX, baseY, item.worldZ]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[3.5, 2, 3.5]} />
                <meshLambertMaterial color="#3b82f6" />
              </mesh>
              <Billboard position={[0, labelOffset + 1.2, 0]}>
                <Text 
                  fontSize={0.8} 
                  color="#fbbf24" 
                  anchorX="center" 
                  anchorY="middle"
                  renderOrder={1000}
                  material-transparent
                  material-depthTest={false}
                  outlineWidth={0.03}
                  outlineColor="#111827"
                >
                  School
                </Text>
              </Billboard>
            </group>
          );
        }
        if (item.type === 'airport') {
          return (
            <group key={`placement-airport-${item.id}`} position={[item.worldX, 0, item.worldZ]}>
              {/* Runway */}
              <mesh receiveShadow position={[0, 0.05, 0]}>
                <boxGeometry args={[8, 0.1, 2.5]} />
                <meshLambertMaterial color="#4b5563" />
              </mesh>
              {/* Tower */}
              <mesh castShadow position={[3, 1.5, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 3]} />
                <meshLambertMaterial color="#9ca3af" />
              </mesh>
              <Billboard position={[0, 2.2, 0]}>
                <Text 
                  fontSize={0.8} 
                  color="#fbbf24" 
                  anchorX="center" 
                  anchorY="middle"
                  renderOrder={1000}
                  material-transparent
                  material-depthTest={false}
                  outlineWidth={0.03}
                  outlineColor="#111827"
                >
                  Airport
                </Text>
              </Billboard>
            </group>
          );
        }
        return null;
      })}
    </group>
  );
};