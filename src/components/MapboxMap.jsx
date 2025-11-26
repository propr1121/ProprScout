import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxMap = ({ coordinates, address, confidence }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    // SECURITY: API key must come from environment variable - no hardcoded fallbacks
    const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!accessToken) {
      console.error('VITE_MAPBOX_TOKEN not configured. Map will not load.');
      return;
    }
    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [coordinates.lon, coordinates.lat],
      zoom: 16,
      attributionControl: false
    });

    // Add marker
    const marker = new mapboxgl.Marker({
      color: '#10b981'
    })
      .setLngLat([coordinates.lon, coordinates.lat])
      .addTo(map.current);

    // Add popup
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    })
      .setLngLat([coordinates.lon, coordinates.lat])
      .setHTML(`
        <div class="p-2">
          <div class="font-semibold text-gray-900">${address.formatted}</div>
          <div class="text-sm text-gray-600">
            Confidence: ${(confidence * 100).toFixed(0)}%
          </div>
        </div>
      `)
      .addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates, address, confidence]);

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapboxMap;
