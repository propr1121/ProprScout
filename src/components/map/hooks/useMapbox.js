/**
 * ProprHome Map Module - Mapbox Hook
 * Fallback map provider when Google Maps is unavailable
 *
 * @security API key loaded from environment variables only - NO hardcoded tokens
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_DEFAULTS, MAPBOX_STYLES, PROPRHOME_COLORS } from '../utils/constants';

/**
 * Hook to initialize and manage Mapbox map
 *
 * @param {Object} options
 * @param {string} options.accessToken - Mapbox access token (defaults to env var)
 * @param {Function} options.onError - Error callback
 * @returns {{ isLoaded: boolean, isError: boolean, error: Error|null, mapboxgl: typeof mapboxgl|null }}
 */
export function useMapbox(options = {}) {
  const {
    accessToken = import.meta.env.VITE_MAPBOX_TOKEN,
    onError
  } = options;

  const [state, setState] = useState({
    isLoaded: false,
    isError: false,
    error: null
  });

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    // SECURITY: Never use hardcoded fallback tokens
    if (!accessToken) {
      const error = new Error('Mapbox access token not configured. Set VITE_MAPBOX_TOKEN in your environment.');
      setState({
        isLoaded: false,
        isError: true,
        error
      });
      onErrorRef.current?.(error);
      return;
    }

    // Set access token
    mapboxgl.accessToken = accessToken;

    // Check if WebGL is supported
    if (!mapboxgl.supported()) {
      const error = new Error('Your browser does not support WebGL, which is required for maps.');
      setState({
        isLoaded: false,
        isError: true,
        error
      });
      onErrorRef.current?.(error);
      return;
    }

    setState({
      isLoaded: true,
      isError: false,
      error: null
    });
  }, [accessToken]);

  return {
    ...state,
    mapboxgl: state.isLoaded ? mapboxgl : null
  };
}

/**
 * Initialize a Mapbox map instance
 *
 * @param {Object} options
 * @param {HTMLElement} options.container - Map container element
 * @param {Object} options.center - { lat, lng }
 * @param {number} options.zoom - Zoom level
 * @param {string} options.style - Map style URL
 * @param {Object} options.mapOptions - Additional map options
 * @returns {mapboxgl.Map}
 */
export function initializeMapboxMap({
  container,
  center,
  zoom = MAP_DEFAULTS.zoom,
  style = MAPBOX_STYLES.satellite,
  mapOptions = {}
}) {
  if (!container) {
    throw new Error('Container element is required');
  }

  if (!mapboxgl.accessToken) {
    throw new Error('Mapbox access token not set');
  }

  const map = new mapboxgl.Map({
    container,
    style,
    center: [center.lng, center.lat], // Mapbox uses [lng, lat]
    zoom,
    attributionControl: false,
    ...mapOptions
  });

  // Add navigation controls
  map.addControl(
    new mapboxgl.NavigationControl({
      visualizePitch: true
    }),
    'bottom-right'
  );

  // Add scale control
  map.addControl(
    new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }),
    'bottom-left'
  );

  // Add attribution control
  map.addControl(
    new mapboxgl.AttributionControl({
      compact: true
    })
  );

  return map;
}

/**
 * Create a custom marker for Mapbox
 *
 * @param {Object} options
 * @param {mapboxgl.Map} options.map - Map instance
 * @param {Object} options.position - { lat, lng }
 * @param {string} options.title - Marker title
 * @param {boolean} options.draggable - Is marker draggable
 * @param {string} options.color - Marker color
 * @param {Function} options.onDragEnd - Drag end callback
 * @returns {mapboxgl.Marker}
 */
export function createMapboxMarker({
  map,
  position,
  title,
  draggable = false,
  color = PROPRHOME_COLORS.primary.green,
  onDragEnd
}) {
  const marker = new mapboxgl.Marker({
    color,
    draggable
  })
    .setLngLat([position.lng, position.lat])
    .addTo(map);

  // Add popup with title
  if (title) {
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 25
    }).setHTML(`<div class="font-medium text-sm">${title}</div>`);

    marker.setPopup(popup);

    // Show popup on hover
    marker.getElement().addEventListener('mouseenter', () => popup.addTo(map));
    marker.getElement().addEventListener('mouseleave', () => popup.remove());
  }

  // Handle drag end
  if (draggable && onDragEnd) {
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      onDragEnd({ lat: lngLat.lat, lng: lngLat.lng });
    });
  }

  return marker;
}

/**
 * Create a custom marker element with ProprHome branding
 *
 * @param {Object} options
 * @param {string} options.price - Price to display
 * @param {boolean} options.selected - Is marker selected
 * @returns {HTMLElement}
 */
export function createCustomMarkerElement({ price, selected = false }) {
  const el = document.createElement('div');
  el.className = 'proprhome-marker';

  if (price) {
    // Price tag marker
    el.innerHTML = `
      <div class="marker-price ${selected ? 'selected' : ''}">
        <span>${price}</span>
      </div>
    `;
    el.style.cssText = `
      background: ${selected ? PROPRHOME_COLORS.secondary.teal : PROPRHOME_COLORS.primary.green};
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-family: Poppins, sans-serif;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transform: translateY(-50%);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
    `;

    // Add arrow
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid ${selected ? PROPRHOME_COLORS.secondary.teal : PROPRHOME_COLORS.primary.green};
    `;
    el.appendChild(arrow);
  } else {
    // Default pin marker
    el.innerHTML = `
      <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 14.5 20 32 20 32s20-17.5 20-32C40 8.954 31.046 0 20 0z" fill="${PROPRHOME_COLORS.primary.green}"/>
        <circle cx="20" cy="20" r="12" fill="white"/>
        <path d="M20 12l-8 6v10h5v-6h6v6h5V18l-8-6z" fill="${PROPRHOME_COLORS.primary.green}"/>
      </svg>
    `;
    el.style.cssText = `
      cursor: pointer;
      transform: translateY(-26px);
    `;
  }

  return el;
}

/**
 * Hook to manage a Mapbox map instance
 */
export function useMapboxMap({
  containerRef,
  center,
  zoom = MAP_DEFAULTS.zoom,
  style = MAPBOX_STYLES.satellite,
  onLoad,
  onError
}) {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!accessToken) {
      onError?.(new Error('Mapbox access token not configured'));
      return;
    }

    mapboxgl.accessToken = accessToken;

    try {
      const map = initializeMapboxMap({
        container: containerRef.current,
        center,
        zoom,
        style
      });

      map.on('load', () => {
        setIsLoaded(true);
        onLoad?.(map);
      });

      map.on('error', (e) => {
        onError?.(e.error);
      });

      mapRef.current = map;
    } catch (error) {
      onError?.(error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerRef, center?.lat, center?.lng, zoom, style]);

  // Update center when coordinates change
  useEffect(() => {
    if (mapRef.current && isLoaded && center) {
      mapRef.current.flyTo({
        center: [center.lng, center.lat],
        duration: 1000
      });
    }
  }, [center?.lat, center?.lng, isLoaded]);

  return {
    map: mapRef.current,
    isLoaded
  };
}

export default useMapbox;
