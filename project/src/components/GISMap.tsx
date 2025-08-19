import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GISMapProps {
  onBackTo3D?: () => void;
}

export const GISMap: React.FC<GISMapProps> = ({ onBackTo3D }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      const center: L.LatLngExpression = [28.6139, 77.2090];
      const map = L.map(mapRef.current, {
        center,
        zoom: 12,
        zoomControl: true,
      });
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Optional marker at center
      L.marker(center).addTo(map);
    }
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      {onBackTo3D && (
        <div className="absolute bottom-4 right-4 z-[1500]">
          <button
            onClick={onBackTo3D}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white shadow hover:bg-blue-700"
            title="Back to 3D City"
          >
            3D City
          </button>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};


