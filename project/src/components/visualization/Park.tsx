import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParkProps {
  position: [number, number, number];
  size: number;
}

export const Park: React.FC<ParkProps> = ({ position, size }) => {
  const treeRefs = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    treeRefs.current.forEach((tree, index) => {
      if (tree) {
        const sway = Math.sin(state.clock.elapsedTime + index) * 0.1;
        tree.rotation.z = sway;
      }
    });
  });

  const trees = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * Math.PI * 2;
    const radius = size / 3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    return { x, z, id: i };
  });

  return (
    <group position={position}>
      {/* Grass Base */}
      <mesh receiveShadow>
        <cylinderGeometry args={[size/2, size/2, 0.2, 8]} />
        <meshLambertMaterial color="#22c55e" />
      </mesh>
      
      {/* Trees */}
      {trees.map((tree) => (
        <group key={tree.id} position={[tree.x, 0, tree.z]}>
          {/* Tree Trunk */}
          <mesh
            ref={(ref) => {
              if (ref) treeRefs.current[tree.id] = ref;
            }}
          >
            <cylinderGeometry args={[0.1, 0.15, 2]} />
            <meshLambertMaterial color="#92400e" />
          </mesh>
          
          {/* Tree Foliage */}
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.8]} />
            <meshLambertMaterial color="#16a34a" />
          </mesh>
        </group>
      ))}
      
      {/* Park Bench */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.4]} />
        <meshLambertMaterial color="#8b5cf6" />
      </mesh>
      
      {/* Fountain */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1]} />
        <meshLambertMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
};