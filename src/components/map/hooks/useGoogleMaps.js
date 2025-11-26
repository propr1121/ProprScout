/**
 * ProprHome Map Module - Google Maps Hook
 * Handles loading and initialization of Google Maps JavaScript API
 *
 * @security API key loaded from environment variables only
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MAP_DEFAULTS } from '../utils/constants';

// Singleton to track API loading state
let googleMapsPromise = null;
let isLoadingStarted = false;

/**
 * Load Google Maps JavaScript API
 * @param {string} apiKey - Google Maps API key
 * @returns {Promise<typeof google>}
 */
function loadGoogleMapsApi(apiKey) {
  // Return existing promise if already loading/loaded
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if already loaded
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is required'));
  }

  isLoadingStarted = true;

  googleMapsPromise = new Promise((resolve, reject) => {
    // Set timeout for loading
    const timeout = setTimeout(() => {
      reject(new Error('Google Maps API loading timeout'));
    }, MAP_DEFAULTS.loadTimeout);

    // Create callback for async loading
    const callbackName = `googleMapsCallback_${Date.now()}`;
    window[callbackName] = () => {
      clearTimeout(timeout);
      delete window[callbackName];
      resolve(window.google);
    };

    // Create script element
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      clearTimeout(timeout);
      delete window[callbackName];
      googleMapsPromise = null;
      isLoadingStarted = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Hook to load and use Google Maps API
 *
 * @param {Object} options
 * @param {string} options.apiKey - Google Maps API key (defaults to env var)
 * @param {Function} options.onError - Error callback
 * @returns {{ isLoaded: boolean, isError: boolean, error: Error|null, google: typeof google|null }}
 */
export function useGoogleMaps(options = {}) {
  const {
    apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    onError
  } = options;

  const [state, setState] = useState({
    isLoaded: false,
    isError: false,
    error: null,
    google: null
  });

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps) {
      setState({
        isLoaded: true,
        isError: false,
        error: null,
        google: window.google
      });
      return;
    }

    // Skip if no API key
    if (!apiKey) {
      const error = new Error('Google Maps API key not configured');
      setState({
        isLoaded: false,
        isError: true,
        error,
        google: null
      });
      onErrorRef.current?.(error);
      return;
    }

    let isMounted = true;

    loadGoogleMapsApi(apiKey)
      .then((google) => {
        if (isMounted) {
          setState({
            isLoaded: true,
            isError: false,
            error: null,
            google
          });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({
            isLoaded: false,
            isError: true,
            error,
            google: null
          });
          onErrorRef.current?.(error);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  return state;
}

/**
 * Initialize a Google Map instance
 *
 * @param {Object} options
 * @param {HTMLElement} options.container - Map container element
 * @param {typeof google} options.google - Google Maps API
 * @param {Object} options.center - { lat, lng }
 * @param {number} options.zoom - Zoom level
 * @param {Object} options.mapOptions - Additional map options
 * @returns {google.maps.Map}
 */
export function initializeGoogleMap({
  container,
  google,
  center,
  zoom = MAP_DEFAULTS.zoom,
  mapOptions = {}
}) {
  if (!container || !google) {
    throw new Error('Container and Google API are required');
  }

  const defaultOptions = {
    center,
    zoom,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT,
      mapTypeIds: [
        google.maps.MapTypeId.ROADMAP,
        google.maps.MapTypeId.SATELLITE,
        google.maps.MapTypeId.HYBRID
      ]
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    streetViewControl: false, // We handle this ourselves
    fullscreenControl: false, // We handle this ourselves
    scaleControl: true,
    gestureHandling: 'greedy'
  };

  return new google.maps.Map(container, {
    ...defaultOptions,
    ...mapOptions
  });
}

/**
 * Create a custom marker
 *
 * @param {Object} options
 * @param {typeof google} options.google - Google Maps API
 * @param {google.maps.Map} options.map - Map instance
 * @param {Object} options.position - { lat, lng }
 * @param {string} options.title - Marker title
 * @param {boolean} options.draggable - Is marker draggable
 * @param {string} options.iconSvg - Custom SVG icon
 * @param {Function} options.onDragEnd - Drag end callback
 * @returns {google.maps.Marker}
 */
export function createGoogleMarker({
  google,
  map,
  position,
  title,
  draggable = false,
  iconSvg,
  onDragEnd
}) {
  const markerOptions = {
    map,
    position,
    title,
    draggable,
    animation: google.maps.Animation.DROP
  };

  // Use custom SVG icon if provided
  if (iconSvg) {
    markerOptions.icon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(iconSvg)}`,
      scaledSize: new google.maps.Size(40, 52),
      anchor: new google.maps.Point(20, 52)
    };
  }

  const marker = new google.maps.Marker(markerOptions);

  if (draggable && onDragEnd) {
    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) {
        onDragEnd({ lat: pos.lat(), lng: pos.lng() });
      }
    });
  }

  return marker;
}

export default useGoogleMaps;
