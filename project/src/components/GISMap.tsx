import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'mapillary-js/dist/mapillary.css';
import { GoogleStreetView } from './GoogleStreetView';

interface GISMapProps {
  onBackTo3D?: () => void;
}

type MapMode = 'map' | 'street';

export const GISMap: React.FC<GISMapProps> = ({ onBackTo3D }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const streetContainerRef = useRef<HTMLDivElement | null>(null);
  const streetViewerRef = useRef<any | null>(null);
  const [mode, setMode] = useState<MapMode>('map');
  const [is3D, setIs3D] = useState(true);
  const mapillaryToken = (import.meta.env.VITE_MAPILLARY_TOKEN as string | undefined) || undefined;
  const googleMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || undefined;
  const mapboxKey = (import.meta.env.VITE_MAPBOX_API_KEY as string | undefined) || 'pk.eyJ1IjoiYmliaW5wIiwiYSI6ImNsNTg4eGhuMTBuaWUzY25zZG9jOXl6c2MifQ.QvrYsftaHTXkCNq2b5ytPQ';
  const [mapCenter, setMapCenter] = useState<{ lng: number; lat: number }>({ lng: 77.209, lat: 28.6139 });
  const [streetAt, setStreetAt] = useState<{ lng: number; lat: number } | null>(null);
  const [placeStreetMode, setPlaceStreetMode] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [buildingsVisible, setBuildingsVisible] = useState(false);

  // Search bar state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    console.log('Initializing Mapbox map...');
    console.log('Container:', containerRef.current);
    console.log('Mapbox key:', mapboxKey ? 'Present' : 'Missing');

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxKey;

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11', // This gives the clean 3D look
        center: [77.2090, 28.6139],
        zoom: 12,
        pitch: 60,
        bearing: -17.6,
        antialias: true,
        dragRotate: true,
        pitchWithRotate: true,
        touchZoomRotate: true,
      });

      console.log('Mapbox map instance created:', map);

      // Error handling
      map.on('error', (e) => {
        console.error('Mapbox loading error:', e);
        setMapError(`Failed to load map: ${e.error?.message || 'Unknown error'}`);
      });

      // Success handling
      map.on('load', () => {
        console.log('Mapbox map loaded successfully');
        setMapLoading(false);
        setMapError(null);

        // Add terrain for 3D effect
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        });
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });

        // Add sky for atmosphere
        map.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun-intensity': 15
          }
        });

        // Add 3D buildings
        const labelLayerId = map.getStyle().layers?.find(l => l.type === 'symbol' && (l.layout as any)?.['text-field'])?.id;
        map.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        }, labelLayerId);

        setBuildingsVisible(true);
        console.log('3D buildings added');

        // Ensure map is properly sized
        setTimeout(() => {
          map.resize();
          console.log('Map resized');
        }, 100);
      });

      // Add controls
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      
      // Track map center
      map.on('moveend', () => {
        const c = map.getCenter();
        setMapCenter({ lng: c.lng, lat: c.lat });
      });

      // Track 3D state
      const syncPitchState = () => setIs3D((map.getPitch() || 0) > 0);
      map.on('pitchend', syncPitchState);
      map.on('load', syncPitchState);

      // Click handling
      map.on('click', (e) => {
        if (placeStreetMode && (mapillaryToken || googleMapsKey)) {
          setStreetAt({ lng: e.lngLat.lng, lat: e.lngLat.lat });
          setMode('street');
          setPlaceStreetMode(false);
          return;
        }
        const currently3D = (map.getPitch() || 0) > 0;
        map.flyTo({ center: e.lngLat, zoom: Math.max(map.getZoom(), 13), pitch: currently3D ? 70 : 0, speed: 0.8 });
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      console.error('Failed to create Mapbox map:', error);
      setMapError('Failed to create map. Please try refreshing.');
    }
  }, [mapboxKey]);

  // Handle mode changes
  useEffect(() => {
    if (mode === 'map' && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          console.log('Map resized after mode change');
        }
      }, 200);
    }
  }, [mode]);

  // Toggle 2D/3D
  const toggleDimensionality = () => {
    const map = mapRef.current;
    if (!map) return;
    const currently3D = (map.getPitch() || 0) > 0;
    const nextIs3D = !currently3D;
    setIs3D(nextIs3D);
    map.easeTo({
      pitch: nextIs3D ? 60 : 0,
      bearing: nextIs3D ? (map.getBearing() || -17.6) : 0,
      duration: 600,
    });
  };

  // Toggle 3D buildings
  const toggle3DBuildings = () => {
    const map = mapRef.current;
    if (!map || !mapboxKey) {
      console.log('3D Buildings not available - Mapbox key required');
      return;
    }
    
    const buildingLayer = map.getLayer('3d-buildings');
    
    if (buildingLayer) {
      map.removeLayer('3d-buildings');
      setBuildingsVisible(false);
      console.log('3D buildings removed');
    } else {
      try {
        const labelLayerId = map.getStyle().layers?.find(l => l.type === 'symbol' && (l.layout as any)?.['text-field'])?.id;
        map.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        }, labelLayerId);
        setBuildingsVisible(true);
        console.log('3D buildings added');
      } catch (error) {
        console.error('Failed to add 3D buildings:', error);
      }
    }
  };

  // Street View functions
  const openStreetAt = async (lng: number, lat: number): Promise<void> => {
    console.log('Opening Street View at:', lng, lat);
    
    if (googleMapsKey) {
      console.log('Using Google Street View');
      return Promise.resolve();
    }
    
    if (mapillaryToken && streetContainerRef.current) {
      console.log('Using Mapillary Street View');
      try {
        if (!streetViewerRef.current) {
          const mjs = await import('mapillary-js');
          const { Viewer } = mjs as any;
          streetViewerRef.current = new Viewer({
            container: streetContainerRef.current,
            accessToken: mapillaryToken,
          });
        }
        
        // Try to find images in a wider radius
        const resp = await fetch(
          `https://graph.mapillary.com/images?fields=id,computed_geometry&limit=10&closeto=${lng},${lat}&radius=5000`,
          { headers: { Authorization: `OAuth ${mapillaryToken}` } }
        );
        const data = await resp.json();
        const images = data?.data || [];
        
        if (images.length > 0) {
          // Use the closest image
          const imageId = images[0].id;
          await streetViewerRef.current.moveTo(imageId);
          console.log('Found Mapillary image:', imageId);
          return Promise.resolve();
        } else {
          console.log('No Mapillary images found in 5km radius');
          
          // Try some popular locations that have Street View
          const popularLocations = [
            { name: 'New York', lng: -74.006, lat: 40.7128 },
            { name: 'London', lng: -0.1276, lat: 51.5074 },
            { name: 'Paris', lng: 2.3522, lat: 48.8566 },
            { name: 'Tokyo', lng: 139.6917, lat: 35.6895 },
            { name: 'Mumbai', lng: 72.8777, lat: 19.0760 }
          ];
          
          // Find the closest popular location
          let closestLocation = popularLocations[0];
          let minDistance = Infinity;
          
          for (const location of popularLocations) {
            const distance = Math.sqrt(
              Math.pow(location.lng - lng, 2) + Math.pow(location.lat - lat, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              closestLocation = location;
            }
          }
          
          // Try to find images at the closest popular location
          const popularResp = await fetch(
            `https://graph.mapillary.com/images?fields=id,computed_geometry&limit=1&closeto=${closestLocation.lng},${closestLocation.lat}&radius=1000`,
            { headers: { Authorization: `OAuth ${mapillaryToken}` } }
          );
          const popularData = await popularResp.json();
          const popularImageId = popularData?.data?.[0]?.id;
          
          if (popularImageId) {
            await streetViewerRef.current.moveTo(popularImageId);
            console.log('Using popular location:', closestLocation.name);
            return Promise.resolve();
          } else {
            return Promise.reject(new Error(`No Street View available. Try searching for: ${popularLocations.map(l => l.name).join(', ')}`));
          }
        }
      } catch (error) {
        console.error('Failed to load Mapillary:', error);
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(new Error('No Street View tokens available'));
  };

  // Search functionality
  useEffect(() => {
    if (!query) {
      setResults([]);
      setShowSuggestions(false);
      setHighlightIndex(-1);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setIsSearching(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`;
        const resp = await fetch(url, { 
          headers: { 'Accept': 'application/json', 'User-Agent': 'smart-city-planner/1.0' }, 
          signal: controller.signal 
        });
        const data = await resp.json();
        setResults(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  const flyTo = (lng: number, lat: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13) });
  };

  const selectSearchResult = (idx: number) => {
    const res = results[idx];
    if (!res) return;
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    setMapCenter({ lng, lat });
    flyTo(lng, lat);
    setShowSuggestions(false);
    setHighlightIndex(-1);
  };

  return (
    <div className="w-full h-full relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-[1500] w-72">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
          <input
            type="text"
            className="w-full px-3 py-2 bg-transparent text-sm outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
            placeholder="Search place or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                if (highlightIndex >= 0) {
                  selectSearchResult(highlightIndex);
                } else if (results[0]) {
                  selectSearchResult(0);
                }
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
          />
          {showSuggestions && results.length > 0 && (
            <div className="max-h-64 overflow-auto border-t border-gray-200 dark:border-gray-700">
              {results.map((r, idx) => (
                <button
                  key={`${r.lat}-${r.lon}-${idx}`}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${idx === highlightIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onClick={() => selectSearchResult(idx)}
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
          {isSearching && (
            <div className="px-3 py-1 text-xs text-gray-500">Searching…</div>
          )}
        </div>
        <div className="mt-2 flex space-x-2">
          <button
            onClick={() => {
              const map = mapRef.current;
              if (!map) return;
              const c = map.getCenter();
              console.log('Street here clicked at:', c.lng, c.lat);
              
              if (googleMapsKey) {
                setStreetAt({ lng: c.lng, lat: c.lat });
                setMode('street');
              } else if (mapillaryToken) {
                // Don't switch mode immediately, let Mapillary load first
                openStreetAt(c.lng, c.lat).then(() => {
                  setStreetAt({ lng: c.lng, lat: c.lat });
                  setMode('street');
                }).catch((error) => {
                  alert(error.message || 'No Street View available at this location. Try searching for: New York, London, Paris, Tokyo, or Mumbai.');
                });
              } else {
                alert('Street View is not available. Please add VITE_MAPILLARY_TOKEN or VITE_GOOGLE_MAPS_API_KEY to your .env file.');
              }
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white shadow hover:bg-emerald-700"
            title="Open Street View at center (works best in major cities)"
          >
            Street here
          </button>
          <button
            onClick={() => setPlaceStreetMode((v) => !v)}
            className={`px-3 py-1.5 text-sm rounded-md shadow ${placeStreetMode ? 'bg-orange-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
            title="Place Street View by clicking on the map"
            disabled={!mapillaryToken && !googleMapsKey}
          >
            {placeStreetMode ? 'Click on map…' : 'Place Street' }
          </button>
          <button
            onClick={toggleDimensionality}
            className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white shadow hover:bg-indigo-700"
            title={is3D ? 'Switch to 2D pitch' : 'Switch to 3D pitch'}
            disabled={mode !== 'map'}
          >
            {is3D ? '2D Pitch' : '3D Pitch'}
          </button>
          <button
            onClick={toggle3DBuildings}
            className={`px-3 py-1.5 text-sm rounded-md shadow ${buildingsVisible ? 'bg-green-600 text-white' : 'bg-purple-600 text-white'} hover:opacity-80`}
            title="Toggle 3D Buildings"
            disabled={mode !== 'map' || !mapboxKey}
          >
            {buildingsVisible ? 'Hide 3D' : 'Show 3D'}
          </button>
        </div>
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 z-[1500] flex items-center space-x-2">
        <button
          onClick={() => setMode('map')}
          className={`px-3 py-1.5 text-sm rounded-md shadow ${mode === 'map' ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
          title="2D Map"
        >
          2D Map
        </button>
        <button
          onClick={() => {
            const map = mapRef.current;
            const c = map ? map.getCenter() : { lng: mapCenter.lng, lat: mapCenter.lat };
            console.log('Street View mode clicked at:', c.lng, c.lat);
            
            if (googleMapsKey) {
              setStreetAt({ lng: c.lng, lat: c.lat });
              setMode('street');
            } else if (mapillaryToken) {
              // Don't switch mode immediately, let Mapillary load first
              openStreetAt(c.lng, c.lat).then(() => {
                setStreetAt({ lng: c.lng, lat: c.lat });
                setMode('street');
              }).catch((error) => {
                alert(error.message || 'No Street View available at this location. Try searching for: New York, London, Paris, Tokyo, or Mumbai.');
              });
            } else {
              alert('Street View is not available. Please add VITE_MAPILLARY_TOKEN or VITE_GOOGLE_MAPS_API_KEY to your .env file.');
            }
          }}
          className={`px-3 py-1.5 text-sm rounded-md shadow ${mode === 'street' ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
          title="Street View"
          disabled={!mapillaryToken && !googleMapsKey}
        >
          Street View
        </button>
        {onBackTo3D && (
          <button
            onClick={onBackTo3D}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white shadow hover:bg-blue-700"
            title="Back to 3D City"
          >
            3D City
          </button>
        )}
      </div>

      {/* Loading and Error States */}
      {mapLoading && mode === 'map' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 dark:text-gray-400">Loading map...</div>
          </div>
        </div>
      )}

      {mapError && mode === 'map' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1500] bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-200 border border-red-200 dark:border-red-700 rounded px-3 py-2 text-xs">
          {mapError}
        </div>
      )}

      {/* Token hint */}
      {mode === 'street' && !mapillaryToken && !googleMapsKey && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1500] bg-yellow-50 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700 rounded px-3 py-2 text-xs">
          Add VITE_MAPILLARY_TOKEN or VITE_GOOGLE_MAPS_API_KEY to .env to enable Street View.
        </div>
      )}
      
      {/* Map Info */}
      {mapboxKey && mode === 'map' && (
        <div className="absolute bottom-20 right-4 z-[1500] bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded px-3 py-2 text-xs max-w-xs">
          <div className="font-semibold mb-1">3D Buildings Available</div>
          <div>Zoom to level 15+ to see 3D buildings. Use the "Show 3D" button to toggle them.</div>
        </div>
      )}

      {/* Containers */}
      <div className={`${mode === 'map' ? 'block' : 'hidden'} w-full h-full bg-gray-100 dark:bg-gray-900`} ref={containerRef} />
      {mode === 'street' && googleMapsKey ? (
        <GoogleStreetView apiKey={googleMapsKey} position={{ lat: (streetAt?.lat ?? mapCenter.lat), lng: (streetAt?.lng ?? mapCenter.lng) }} />
      ) : (
        <div className={`${mode === 'street' ? 'block' : 'hidden'} w-full h-full`} ref={streetContainerRef} />
      )}
    </div>
  );
};
