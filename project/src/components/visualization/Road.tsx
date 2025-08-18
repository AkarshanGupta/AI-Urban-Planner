import React from 'react';

type RoadOrientation = 'horizontal' | 'vertical' | 'intersection';

interface RoadProps {
  position: [number, number, number];
  color: string;
  hasLight?: boolean;
  orientation?: RoadOrientation;
}

export const Road: React.FC<RoadProps> = ({ position, color, hasLight = false, orientation = 'horizontal' }) => {
  return (
    <group position={position}>
      {/* Road Surface */}
      <mesh receiveShadow>
        <boxGeometry args={[3.8, 0.1, 3.8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      
      {/* Road Markings */}
      {orientation !== 'intersection' && (
        <mesh position={[0, 0.06, 0]}>
          {orientation === 'horizontal' ? (
            <boxGeometry args={[3.6, 0.01, 0.15]} />
          ) : (
            <boxGeometry args={[0.15, 0.01, 3.6]} />
          )}
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      {orientation === 'intersection' && (
        <>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[3.6, 0.01, 0.15]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.15, 0.01, 3.6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </>
      )}

      {/* Street Light (reduced density) */}
      {hasLight && (
        <>
          <mesh position={[1.5, 2.5, 1.5]}>
            <cylinderGeometry args={[0.05, 0.05, 5]} />
            <meshLambertMaterial color="#4b5563" />
          </mesh>
          <mesh position={[1.5, 5.2, 1.5]}>
            <sphereGeometry args={[0.2]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <pointLight 
            position={[1.5, 5, 1.5]} 
            intensity={0.25} 
            color="#fbbf24"
            distance={7}
          />
        </>
      )}
    </group>
  );
};