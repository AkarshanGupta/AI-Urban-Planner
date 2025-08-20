import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    initGMapsCallback?: () => void;
    google?: any;
  }
}

interface GoogleStreetViewProps {
  apiKey: string;
  position: { lat: number; lng: number };
}

export const GoogleStreetView: React.FC<GoogleStreetViewProps> = ({ apiKey, position }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panoRef = useRef<any | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (window.google?.maps && containerRef.current && !panoRef.current) {
      panoRef.current = new window.google.maps.StreetViewPanorama(containerRef.current, {
        position,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        visible: true,
      });
      return;
    }

    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (containerRef.current && window.google?.maps) {
        panoRef.current = new window.google.maps.StreetViewPanorama(containerRef.current, {
          position,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          visible: true,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Google Maps API doesn't expose a destroy; removing node is fine
    };
  }, []);

  useEffect(() => {
    if (panoRef.current) {
      panoRef.current.setPosition(position);
    }
  }, [position.lat, position.lng]);

  return <div ref={containerRef} className="w-full h-full" />;
};





