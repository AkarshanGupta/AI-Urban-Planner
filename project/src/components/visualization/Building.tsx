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
  const labelRef = useRef<THREE.Group>(null);
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
      // Hover effect - only scale X and Z, keep Y at 1 to prevent height distortion
      const targetScale = hovered ? 1.05 : 1;
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.1);
      meshRef.current.scale.y = 1; // Keep height constant
      
      // Subtle breathing animation for skyscrapers (only when not hovering)
      if (type === 'skyscraper' && !hovered) {
        const breathe = Math.sin(state.clock.elapsedTime + animationDelay) * 0.02 + 1;
        meshRef.current.scale.y = breathe;
      }
    }

    // Make label always face the camera for readability
    if (labelRef.current) {
      labelRef.current.lookAt(state.camera.position);
    }
  });

  const getWindowPattern = () => {
    if (type === 'residential') return '#fbbf24';
    if (type === 'commercial') return '#60a5fa';
    if (type === 'skyscraper') return '#f3f4f6';
    return color;
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setHovered(true);
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setHovered(false);
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log(`Clicked on ${type} building at height ${currentHeight}m`);
  };

  return (
    <group 
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Main Building - Always visible */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
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
      
      {/* Building Label - visible on hover, billboarded, and rendered on top */}
      <group ref={labelRef} position={[0, currentHeight + 2, 0]} renderOrder={999} visible={hovered}>
        {/* Simple colored background */}
        <mesh position={[0, 0, 0]} raycast={() => undefined} renderOrder={998}>
          <boxGeometry args={[4, 1.5, 0.1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthTest={false} />
        </mesh>
        {/* Dark border for contrast */}
        <mesh position={[0, 0, 0.04]} raycast={() => undefined} renderOrder={998}>
          <boxGeometry args={[4.1, 1.6, 0.02]} />
          <meshBasicMaterial color="#374151" transparent opacity={0.95} depthTest={false} />
        </mesh>
        {/* Text label */}
        <Text
          position={[0, 0.3, 0.08]}
          fontSize={0.9}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          raycast={() => undefined}
          renderOrder={1000}
          material-transparent
          material-depthTest={false}
          outlineWidth={0.03}
          outlineColor="#111827"
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
        {/* Height text */}
        <Text
          position={[0, -0.35, 0.08]}
          fontSize={0.75}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          raycast={() => undefined}
          renderOrder={1000}
          material-transparent
          material-depthTest={false}
          outlineWidth={0.03}
          outlineColor="#111827"
        >
          Height: {Math.round(currentHeight)}m
        </Text>
      </group>
      
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