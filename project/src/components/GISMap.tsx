import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapillary-js/dist/mapillary.css';
import { GoogleStreetView } from './GoogleStreetView';

interface GISMapProps {
  onBackTo3D?: () => void;
}

type MapMode = 'map' | 'street';

export const GISMap: React.FC<GISMapProps> = ({ onBackTo3D }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const streetContainerRef = useRef<HTMLDivElement | null>(null);
  const streetViewerRef = useRef<any | null>(null);
  const [mode, setMode] = useState<MapMode>('map');
  const [is3D, setIs3D] = useState(true);
  const mapillaryToken = (import.meta.env.VITE_MAPILLARY_TOKEN as string | undefined) || undefined;
  const googleMapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || undefined;
  const [mapCenter, setMapCenter] = useState<{ lng: number; lat: number }>({ lng: 77.209, lat: 28.6139 });
  const [streetAt, setStreetAt] = useState<{ lng: number; lat: number } | null>(null);
  const [placeStreetMode, setPlaceStreetMode] = useState(false);

  // Search bar state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const RASTER_STYLE: any = {
      version: 8,
      name: 'OSM Raster',
      sources: {
        osm: {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
          maxzoom: 19,
        },
      },
      layers: [
        { id: 'background', type: 'background', paint: { 'background-color': '#e6eef7' } },
        { id: 'osm', type: 'raster', source: 'osm' },
      ],
    };

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: RASTER_STYLE,
      center: [77.2090, 28.6139],
      zoom: 12,
      pitch: 60,
      bearing: -17.6,
      antialias: true,
      dragRotate: true,
      pitchWithRotate: true,
      touchZoomRotate: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.on('moveend', () => {
      const c = map.getCenter();
      setMapCenter({ lng: c.lng, lat: c.lat });
    });

    // Keep local 2D/3D state in sync with the actual map pitch
    const syncPitchState = () => setIs3D((map.getPitch?.() || 0) > 0);
    map.on('pitchend', syncPitchState);
    map.on('load', syncPitchState);

    // Click to fly or place Street View
    map.on('click', (e) => {
      if (placeStreetMode && mapillaryToken) {
        setStreetAt({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        setMode('street');
        setPlaceStreetMode(false);
        return;
      }
      const currently3D = (map.getPitch?.() || 0) > 0;
      map.flyTo({ center: e.lngLat, zoom: Math.max(map.getZoom(), 13), pitch: currently3D ? 70 : 0, speed: 0.8 });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Toggle 2D/3D by reading current pitch so we can always return to 3D
  const toggleDimensionality = () => {
    const map = mapRef.current;
    if (!map) return;
    const currently3D = (map.getPitch?.() || 0) > 0;
    const nextIs3D = !currently3D;
    setIs3D(nextIs3D);
    map.easeTo({
      pitch: nextIs3D ? 60 : 0,
      bearing: nextIs3D ? (map.getBearing() || -17.6) : 0,
      duration: 600,
    });
  };

  const openStreetAt = async (lng: number, lat: number) => {
    if (!mapillaryToken || !streetContainerRef.current) return;
    if (!streetViewerRef.current) {
      const mjs = await import('mapillary-js');
      const { Viewer } = mjs as any;
      streetViewerRef.current = new Viewer({
        container: streetContainerRef.current,
        accessToken: mapillaryToken,
      });
    }
    try {
      const resp = await fetch(
        `https://graph.mapillary.com/images?fields=id,computed_geometry&limit=1&closeto=${lng},${lat}`,
        { headers: { Authorization: `OAuth ${mapillaryToken}` } }
      );
      const data = await resp.json();
      const imageId = data?.data?.[0]?.id as string | undefined;
      if (imageId) {
        await streetViewerRef.current.moveTo(imageId);
      }
    } catch {}
  };

  useEffect(() => {
    if (mode !== 'street') return;
    if (!mapillaryToken) return;
    const map = mapRef.current;
    const target = streetAt ?? (map ? map.getCenter() : { lng: 77.209, lat: 28.6139 });
    openStreetAt(target.lng, target.lat);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'street') return;
    if (!mapillaryToken) return;
    if (!streetAt) return;
    openStreetAt(streetAt.lng, streetAt.lat);
  }, [streetAt?.lng, streetAt?.lat]);

  // Debounced geocoding search via Nominatim
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
        const resp = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'smart-city-planner/1.0' }, signal: controller.signal });
        const data = await resp.json();
        setResults(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch {}
      finally {
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
              setStreetAt({ lng: c.lng, lat: c.lat });
              setMode('street');
            }}
            className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white shadow hover:bg-emerald-700"
            title="Open Street View at center"
          >
            Street here
          </button>
          <button
            onClick={() => setPlaceStreetMode((v) => !v)}
            className={`px-3 py-1.5 text-sm rounded-md shadow ${placeStreetMode ? 'bg-orange-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
            title="Place Street View by clicking on the map"
            disabled={!mapillaryToken}
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
            setStreetAt({ lng: c.lng, lat: c.lat });
            setMode('street');
          }}
          className={`px-3 py-1.5 text-sm rounded-md shadow ${mode === 'street' ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
          title="Street View"
          disabled={!mapillaryToken}
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

      {/* Token hint */}
      {mode === 'street' && !mapillaryToken && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1500] bg-yellow-50 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700 rounded px-3 py-2 text-xs">
          Set VITE_MAPILLARY_TOKEN in .env to enable Street View.
        </div>
      )}

      {/* Containers */}
      <div className={`${mode === 'map' ? 'block' : 'hidden'} w-full h-full`} ref={containerRef} />
      {mode === 'street' && googleMapsKey ? (
        <GoogleStreetView apiKey={googleMapsKey} position={{ lat: (streetAt?.lat ?? mapCenter.lat), lng: (streetAt?.lng ?? mapCenter.lng) }} />
      ) : (
        <div className={`${mode === 'street' ? 'block' : 'hidden'} w-full h-full`} ref={streetContainerRef} />
      )}
    </div>
  );
};
