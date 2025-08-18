import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface BuildingProps {
  position: [number, number, number];
  height: number;
  color: string;
  type: string;
  isGenerating: boolean;
  animationDelay: number;
}

export const Building: React.FC<BuildingProps> = ({ 
  position, 
  height, 
  color, 
  type,
  isGenerating,
  animationDelay 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(isGenerating ? 0 : height);

  // Ensure full height once generation ends so the model is fully rendered
  useEffect(() => {
    if (!isGenerating) {
      setCurrentHeight(height);
    }
  }, [isGenerating, height]);

  // Growth animation during generation
  useFrame((state) => {
    if (isGenerating && currentHeight < height) {
      const growthSpeed = 0.1;
      setCurrentHeight(prev => Math.min(prev + growthSpeed, height));
    }
    
    if (meshRef.current) {
      // Hover effect
      const targetScale = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, 1, targetScale), 0.1);
      
      // Subtle breathing animation for skyscrapers
      if (type === 'skyscraper') {
        const breathe = Math.sin(state.clock.elapsedTime + animationDelay) * 0.02 + 1;
        meshRef.current.scale.y = breathe;
      }
    }
  });

  const getWindowPattern = () => {
    if (type === 'residential') return '#fbbf24';
    if (type === 'commercial') return '#60a5fa';
    if (type === 'skyscraper') return '#f3f4f6';
    return color;
  };

  return (
    <group position={position}>
      {/* Main Building */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[3.5, currentHeight, 3.5]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* Windows overlay (transparent, full height) */}
      {currentHeight > 2 && (
        <mesh position={[1.76, currentHeight/2, 0]}>
          <planeGeometry args={[0.1, currentHeight]} />
          <meshBasicMaterial color={getWindowPattern()} transparent opacity={0.25} />
        </mesh>
      )}
      
      {/* Building Label */}
      {hovered && (
        <Text
          position={[0, currentHeight + 2, 0]}
          fontSize={0.8}
          color="#374151"
          anchorX="center"
          anchorY="middle"
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
          {'\n'}Height: {Math.round(currentHeight)}m
        </Text>
      )}
      
      {/* Rooftop Details */}
      {type === 'skyscraper' && currentHeight > 10 && (
        <>
          <mesh position={[0, currentHeight/2 + 0.5, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshLambertMaterial color="#ef4444" />
          </mesh>
          <pointLight 
            position={[0, currentHeight/2 + 1, 0]} 
            intensity={0.5} 
            color="#ef4444"
            distance={10}
          />
        </>
      )}
    </group>
  );
};