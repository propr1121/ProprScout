/**
 * MapView Component - GeoSpy-inspired design
 * Mapbox map with confidence radius polygon
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function MapView({
  center,
  confidenceRadius = 25000, // meters
  showRadius = false,
  onMapReady,
  viewMode = 'map', // 'map' | '3d'
  markerImageUrl = null
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Check for access token
    if (!mapboxgl.accessToken) {
      setMapError('Mapbox access token not configured');
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: center ? [center.lon, center.lat] : [-9.1393, 38.7223], // Default to Lisbon
        zoom: center ? 11 : 5,
        pitch: viewMode === '3d' ? 60 : 0,
        bearing: viewMode === '3d' ? -20 : 0,
        attributionControl: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      map.current.on('load', () => {
        setMapLoaded(true);

        // Add 3D buildings if in 3D mode
        if (viewMode === '3d') {
          add3DBuildings();
        }

        if (onMapReady) onMapReady(map.current);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Map failed to load');
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [viewMode]);

  // Add 3D buildings layer
  const add3DBuildings = useCallback(() => {
    if (!map.current) return;

    // Check if layer already exists
    if (map.current.getLayer('3d-buildings')) return;

    map.current.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#2a2a2a',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'min_height'],
        'fill-extrusion-opacity': 0.8
      }
    });
  }, []);

  // Update center when coordinates change
  useEffect(() => {
    if (!map.current || !center || !mapLoaded) return;

    // Fly to new location
    map.current.flyTo({
      center: [center.lon, center.lat],
      zoom: 12,
      duration: 2000,
      essential: true
    });

    // Update/add confidence radius
    if (showRadius) {
      updateConfidenceRadius(center, confidenceRadius);
    }

    // Update/add marker
    updateMarker(center);
  }, [center, showRadius, confidenceRadius, mapLoaded, markerImageUrl]);

  // Create circle polygon for confidence radius
  const createCirclePolygon = useCallback((centerCoords, radiusMeters, points = 64) => {
    const coords = [];
    const km = radiusMeters / 1000;

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = km * Math.cos(angle);
      const dy = km * Math.sin(angle);
      // Approximate conversion to lat/lon
      const lat = centerCoords[1] + (dy / 110.574);
      const lon = centerCoords[0] + (dx / (111.320 * Math.cos(centerCoords[1] * Math.PI / 180)));
      coords.push([lon, lat]);
    }
    coords.push(coords[0]); // Close the polygon

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      }
    };
  }, []);

  // Update confidence radius on map
  const updateConfidenceRadius = useCallback((centerCoords, radius) => {
    if (!map.current) return;

    const sourceId = 'confidence-radius';
    const circle = createCirclePolygon([centerCoords.lon, centerCoords.lat], radius);

    if (map.current.getSource(sourceId)) {
      // Update existing source
      map.current.getSource(sourceId).setData(circle);
    } else {
      // Add new source and layers
      map.current.addSource(sourceId, {
        type: 'geojson',
        data: circle
      });

      // Fill layer
      map.current.addLayer({
        id: 'confidence-radius-fill',
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#00d185',
          'fill-opacity': 0.15
        }
      });

      // Border layer
      map.current.addLayer({
        id: 'confidence-radius-border',
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#00d185',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });
    }
  }, [createCirclePolygon]);

  // Update marker
  const updateMarker = useCallback((coords) => {
    if (!map.current) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create marker element
    const el = document.createElement('div');
    el.className = 'detective-marker';

    if (markerImageUrl) {
      // Custom marker with image thumbnail
      el.innerHTML = `
        <div class="marker-container">
          <div class="marker-image" style="background-image: url('${markerImageUrl}')"></div>
          <div class="marker-pin"></div>
        </div>
      `;
    } else {
      // Simple marker
      el.innerHTML = `
        <div class="marker-dot"></div>
      `;
    }

    marker.current = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat([coords.lon, coords.lat])
      .addTo(map.current);
  }, [markerImageUrl]);

  // Error state
  if (mapError) {
    return (
      <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{mapError}</p>
          <p className="text-gray-500 text-sm">Please check your Mapbox configuration</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Custom marker styles */}
      <style>{`
        .detective-marker {
          cursor: pointer;
        }

        .marker-container {
          position: relative;
          width: 60px;
          height: 70px;
        }

        .marker-image {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid #00d185;
          background-size: cover;
          background-position: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .marker-pin {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid #00d185;
        }

        .marker-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #00d185;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        /* Hide Mapbox attribution on small screens */
        @media (max-width: 640px) {
          .mapboxgl-ctrl-attrib {
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}
