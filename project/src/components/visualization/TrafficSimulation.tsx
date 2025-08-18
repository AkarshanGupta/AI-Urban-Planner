import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TrafficSimulationProps {
  isAnimating: boolean;
}

export const TrafficSimulation: React.FC<TrafficSimulationProps> = ({ isAnimating }) => {
  const vehiclesRef = useRef<THREE.Group[]>([]);
  
  const routes = useMemo(() => {
    const paths = [] as { id: string; points: THREE.Vector3[] }[];

    // Align with arterials every 20 world units (arterial step 5 cells * 4 units)
    for (let i = -40; i <= 40; i += 20) {
      // Horizontal arterial
      paths.push({
        id: `h-${i}`,
        points: [new THREE.Vector3(-40, 0.5, i), new THREE.Vector3(40, 0.5, i)],
      });
      // Vertical arterial
      paths.push({
        id: `v-${i}`,
        points: [new THREE.Vector3(i, 0.5, -40), new THREE.Vector3(i, 0.5, 40)],
      });
    }

    // Add diagonal connectors at the edges to reduce cross-building segment choices
    paths.push({ id: 'd1', points: [new THREE.Vector3(-40, 0.5, -40), new THREE.Vector3(-24, 0.5, -24)] });
    paths.push({ id: 'd2', points: [new THREE.Vector3(40, 0.5, 40), new THREE.Vector3(24, 0.5, 24)] });

    return paths;
  }, []);

  const vehicles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      route: routes[i % routes.length],
      progress: Math.random(),
      speed: 0.004 + Math.random() * 0.007,
      color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][i % 4],
    }));
  }, [routes]);

  useFrame(() => {
    if (!isAnimating) return;
    
    vehicles.forEach((vehicle, index) => {
      const vehicleRef = vehiclesRef.current[index];
      if (!vehicleRef || !vehicle.route) return;
      
      vehicle.progress += vehicle.speed;
      if (vehicle.progress > 1) {
        vehicle.progress = 0;
        // Prefer switching to routes with similar orientation to avoid cutting through blocks
        const sameOrientation = routes.filter(r => r.id[0] === vehicle.route.id[0]);
        vehicle.route = (sameOrientation.length ? sameOrientation : routes)[Math.floor(Math.random() * (sameOrientation.length ? sameOrientation.length : routes.length))];
      }
      
      const { points } = vehicle.route;
      const position = new THREE.Vector3().lerpVectors(
        points[0], 
        points[1], 
        vehicle.progress
      );
      
      // Snap vehicle X or Z to the exact arterial coordinate to prevent drifting into blocks
      if (vehicle.route.id.startsWith('h-')) {
        position.z = Number(vehicle.route.id.split('-')[1]);
      } else if (vehicle.route.id.startsWith('v-')) {
        position.x = Number(vehicle.route.id.split('-')[1]);
      }
      vehicleRef.position.copy(position);
      
      // Face movement direction and keep to road plane
      const direction = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
      vehicleRef.position.y = 0.5; // keep above road, avoids clipping into buildings
      vehicleRef.lookAt(vehicleRef.position.clone().add(direction));
    });
  });

  return (
    <group>
      {vehicles.map((vehicle, index) => (
        <group
          key={vehicle.id}
          ref={(ref) => {
            if (ref) vehiclesRef.current[index] = ref;
          }}
        >
          {/* Vehicle Body */}
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.3, 1.5]} />
            <meshLambertMaterial color={vehicle.color} />
          </mesh>
          
          {/* Vehicle Lights */}
          <mesh position={[0, 0, 0.8]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          
          <mesh position={[0, 0, -0.8]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      ))}
    </group>
  );
};