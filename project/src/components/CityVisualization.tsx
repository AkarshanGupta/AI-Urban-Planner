import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Maximize2, Play, Pause } from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { LayerControls } from './visualization/LayerControls';
import { CityScene } from './visualization/CityScene';
import { TrafficSimulation } from './visualization/TrafficSimulation';

export const CityVisualization: React.FC = () => {
  const { cityData, viewLayers, isGenerating, setThreeScene } = usePlanning();
  const [isAnimating, setIsAnimating] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([50, 50, 50]);
  const controlsRef = useRef<any>();

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* View Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAnimation}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title={isAnimating ? "Pause Animation" : "Start Animation"}
          >
            {isAnimating ? (
              <Pause className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Play className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Layer Controls */}
      <LayerControls />

      {/* 3D Canvas */}
      <Canvas className="w-full h-full" onCreated={({ scene }) => setThreeScene(scene)}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={cameraPosition} />
          <OrbitControls 
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={20}
            maxDistance={200}
            maxPolarAngle={Math.PI / 2.2}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[50, 50, 25]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[0, 50, 0]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="city" />
          
          {/* Ground Grid */}
          <Grid 
            args={[100, 100]} 
            position={[0, -0.1, 0]}
            cellSize={2}
            cellThickness={0.5}
            cellColor="#6b7280"
            sectionSize={10}
            sectionThickness={1}
            sectionColor="#374151"
            fadeDistance={100}
            fadeStrength={1}
          />

          {/* City Scene */}
          <CityScene 
            cityData={cityData} 
            viewLayers={viewLayers}
            isAnimating={isAnimating}
            isGenerating={isGenerating}
          />

          {/* Traffic Simulation */}
          {viewLayers.infrastructure && (
            <TrafficSimulation isAnimating={isAnimating} />
          )}
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                Generating Smart City Layout...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Grid: {cityData.size}x{cityData.size}</span>
          <span>Population: {cityData.population.toLocaleString()}</span>
          <span>Density: {cityData.populationDensity}/km²</span>
          <div className={`w-2 h-2 rounded-full ${isAnimating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        </div>
      </div>
    </div>
  );
};