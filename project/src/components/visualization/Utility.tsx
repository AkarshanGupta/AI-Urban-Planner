import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface UtilityProps {
  cityLayout: any[];
}

export const Utility: React.FC<UtilityProps> = ({ cityLayout }) => {
  const powerLines = [];
  const waterLines = [];
  
  // Generate utility networks
  const buildings = cityLayout.filter(item => 
    ['residential', 'commercial', 'industrial', 'skyscraper'].includes(item.type)
  );
  
  // Power grid - connect buildings to nearest power sources
  for (let i = 0; i < buildings.length - 1; i++) {
    const current = buildings[i];
    const next = buildings[i + 1];
    
    if (Math.abs(current.x - next.x) < 8 || Math.abs(current.z - next.z) < 8) {
      powerLines.push([
        [current.x, current.height + 2, current.z],
        [next.x, next.height + 2, next.z]
      ]);
    }
  }
  
  // Water system - underground pipes
  for (let i = 0; i < buildings.length - 1; i++) {
    const current = buildings[i];
    const next = buildings[i + 1];
    
    if (Math.abs(current.x - next.x) < 6 || Math.abs(current.z - next.z) < 6) {
      waterLines.push([
        [current.x, -0.5, current.z],
        [next.x, -0.5, next.z]
      ]);
    }
  }

  return (
    <group>
      {/* Power Lines */}
      {powerLines.map((line, index) => (
        <Line
          key={`power-${index}`}
          points={line}
          color="#fbbf24"
          lineWidth={2}
          transparent
          opacity={0.7}
        />
      ))}
      
      {/* Water Pipes */}
      {waterLines.map((line, index) => (
        <Line
          key={`water-${index}`}
          points={line}
          color="#3b82f6"
          lineWidth={3}
          transparent
          opacity={0.5}
        />
      ))}
      
      {/* Power Substations */}
      {buildings.filter((_, i) => i % 10 === 0).map((building, index) => (
        <group key={`substation-${index}`} position={[building.x + 2, 1, building.z + 2]}>
          <mesh>
            <boxGeometry args={[1, 2, 1]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          <pointLight position={[0, 2.5, 0]} intensity={0.3} color="#ef4444" />
        </group>
      ))}
    </group>
  );
};