/**
 * ProprHome Map Module
 *
 * Production-ready interactive map component with Google Maps + Street View
 * and Mapbox fallback support.
 *
 * @version 1.0.0
 * @security
 * - API keys loaded from environment variables only (VITE_GOOGLE_MAPS_API_KEY, VITE_MAPBOX_TOKEN)
 * - Coordinates validated before use
 * - Custom SVG markers sanitized against XSS
 * - Error boundaries prevent crashes
 *
 * @example
 * ```jsx
 * <MapModule
 *   coordinates={{ lat: 38.7223, lng: -9.1393 }}
 *   propertyTitle="T2 Apartment in Alfama"
 *   propertyPrice="€610,000"
 *   height={400}
 * />
 * ```
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react';

// Hooks
import { useGoogleMaps, initializeGoogleMap, createGoogleMarker } from './hooks/useGoogleMaps';
import { useStreetView } from './hooks/useStreetView';
import { useMapbox, initializeMapboxMap, createMapboxMarker } from './hooks/useMapbox';

// Components
import MapSkeleton from './components/MapSkeleton';
import MapError from './components/MapError';
import ViewToggle from './components/ViewToggle';
import MapControls from './components/MapControls';
import MapFallbackBanner from './components/MapFallbackBanner';

// Utils
import { validateCoordinates, clampZoom } from './utils/validation';
import { sanitizeMarkerSvg, escapeHtml } from './utils/sanitization';
import { PROPRHOME_MARKER_SVG, MAP_DEFAULTS, ERROR_MESSAGES, MAPBOX_STYLES } from './utils/constants';

// Error Boundary Component
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MapModule error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <MapError
          title="Something went wrong"
          message="Unable to load the map. Please refresh the page."
          height={this.props.height || 400}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * Main MapModule Component
 */
const MapModule = forwardRef(function MapModule(props, ref) {
  const {
    coordinates,
    zoom = MAP_DEFAULTS.zoom,
    propertyTitle,
    propertyPrice,
    propertyAddress,
    disableStreetView = false,
    defaultView = 'map',
    onLocationChange,
    draggableMarker = false,
    height = 400,
    showFullscreen = true,
    showStyleToggle = false,
    className = '',
    ariaLabel = 'Property location map'
  } = props;

  // State
  const [currentView, setCurrentView] = useState(defaultView);
  const [useFallback, setUseFallback] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [isMapReady, setIsMapReady] = useState(false);

  // Refs
  const mapContainerRef = useRef(null);
  const streetViewContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const panoramaRef = useRef(null);

  // Validate coordinates
  const lat = coordinates?.lat ?? coordinates?.latitude;
  const lng = coordinates?.lng ?? coordinates?.lon ?? coordinates?.longitude;
  const isValidCoords = validateCoordinates(lat, lng);
  const validatedZoom = clampZoom(zoom);

  // Load Google Maps
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapboxApiKey = import.meta.env.VITE_MAPBOX_TOKEN;

  const { isLoaded: googleLoaded, isError: googleError, google } = useGoogleMaps({
    apiKey: googleApiKey,
    onError: (err) => {
      console.warn('Google Maps failed, falling back to Mapbox:', err.message);
      setUseFallback(true);
    }
  });

  // Street View availability
  const {
    available: streetViewAvailable,
    checking: streetViewChecking,
    initialize: initializeStreetView
  } = useStreetView({
    google,
    coordinates: isValidCoords ? { lat, lng } : null,
    enabled: googleLoaded && !disableStreetView
  });

  // Determine if we should use fallback
  const shouldUseFallback = useFallback || googleError || !googleApiKey;
  const hasMapboxKey = !!mapboxApiKey;

  // Initialize Google Map
  useEffect(() => {
    if (!googleLoaded || shouldUseFallback || !mapContainerRef.current || !isValidCoords) {
      return;
    }

    // Clean up existing map
    if (mapInstanceRef.current) {
      return;
    }

    try {
      const map = initializeGoogleMap({
        container: mapContainerRef.current,
        google,
        center: { lat, lng },
        zoom: validatedZoom
      });

      mapInstanceRef.current = map;

      // Add marker
      const sanitizedSvg = sanitizeMarkerSvg(PROPRHOME_MARKER_SVG);
      markerRef.current = createGoogleMarker({
        google,
        map,
        position: { lat, lng },
        title: propertyTitle || 'Property Location',
        draggable: draggableMarker,
        iconSvg: sanitizedSvg,
        onDragEnd: (newCoords) => {
          if (validateCoordinates(newCoords.lat, newCoords.lng)) {
            onLocationChange?.(newCoords);
          }
        }
      });

      // Add info window if price provided
      if (propertyPrice || propertyTitle) {
        const infoContent = `
          <div style="padding: 8px; font-family: Poppins, sans-serif;">
            ${propertyTitle ? `<div style="font-weight: 600; color: #334155;">${escapeHtml(propertyTitle)}</div>` : ''}
            ${propertyPrice ? `<div style="color: #4ADE80; font-weight: 600;">${escapeHtml(propertyPrice)}</div>` : ''}
            ${propertyAddress ? `<div style="font-size: 12px; color: #64748B;">${escapeHtml(propertyAddress)}</div>` : ''}
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });

        markerRef.current.addListener('click', () => {
          infoWindow.open(map, markerRef.current);
        });
      }

      setIsMapReady(true);

    } catch (error) {
      console.error('Failed to initialize Google Map:', error);
      setUseFallback(true);
    }
  }, [googleLoaded, shouldUseFallback, lat, lng, validatedZoom, google, isValidCoords, propertyTitle, propertyPrice, propertyAddress, draggableMarker, onLocationChange]);

  // Initialize Mapbox fallback
  useEffect(() => {
    if (!shouldUseFallback || !hasMapboxKey || !mapContainerRef.current || !isValidCoords) {
      return;
    }

    if (mapInstanceRef.current) {
      return;
    }

    try {
      const map = initializeMapboxMap({
        container: mapContainerRef.current,
        center: { lat, lng },
        zoom: validatedZoom,
        style: mapStyle === 'satellite' ? MAPBOX_STYLES.satellite : MAPBOX_STYLES.streets
      });

      map.on('load', () => {
        mapInstanceRef.current = map;

        // Add marker
        markerRef.current = createMapboxMarker({
          map,
          position: { lat, lng },
          title: propertyTitle,
          draggable: draggableMarker,
          onDragEnd: (newCoords) => {
            if (validateCoordinates(newCoords.lat, newCoords.lng)) {
              onLocationChange?.(newCoords);
            }
          }
        });

        setIsMapReady(true);
      });

    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
    }
  }, [shouldUseFallback, hasMapboxKey, lat, lng, validatedZoom, mapStyle, isValidCoords, propertyTitle, draggableMarker, onLocationChange]);

  // Initialize Street View when view changes
  useEffect(() => {
    if (currentView !== 'streetview' || !streetViewAvailable || !streetViewContainerRef.current || !google) {
      return;
    }

    if (panoramaRef.current) {
      return;
    }

    panoramaRef.current = initializeStreetView(streetViewContainerRef.current);

  }, [currentView, streetViewAvailable, google, initializeStreetView]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    centerOn: (newLat, newLng) => {
      if (!mapInstanceRef.current || !validateCoordinates(newLat, newLng)) return;

      if (shouldUseFallback) {
        // Mapbox
        mapInstanceRef.current.flyTo({
          center: [newLng, newLat],
          duration: 1000
        });
      } else {
        // Google Maps
        mapInstanceRef.current.panTo({ lat: newLat, lng: newLng });
      }
    },
    setView: (view) => {
      if (view === 'streetview' && !streetViewAvailable) {
        console.warn('Street View not available at this location');
        return;
      }
      setCurrentView(view);
    },
    getCenter: () => {
      if (!mapInstanceRef.current) return { lat, lng };

      if (shouldUseFallback) {
        const center = mapInstanceRef.current.getCenter();
        return { lat: center.lat, lng: center.lng };
      } else {
        const center = mapInstanceRef.current.getCenter();
        return { lat: center?.lat() || lat, lng: center?.lng() || lng };
      }
    },
    getMap: () => mapInstanceRef.current
  }), [lat, lng, streetViewAvailable, shouldUseFallback]);

  // Handle fullscreen
  const handleFullscreen = useCallback(() => {
    const container = currentView === 'map' ? mapContainerRef.current : streetViewContainerRef.current;
    if (container?.requestFullscreen) {
      container.requestFullscreen();
    }
  }, [currentView]);

  // Handle style change (Mapbox only)
  const handleStyleChange = useCallback((newStyle) => {
    setMapStyle(newStyle);
    if (mapInstanceRef.current && shouldUseFallback) {
      mapInstanceRef.current.setStyle(
        newStyle === 'satellite' ? MAPBOX_STYLES.satellite : MAPBOX_STYLES.streets
      );
    }
  }, [shouldUseFallback]);

  // Calculate height style
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  // Invalid coordinates
  if (!isValidCoords) {
    return (
      <MapError
        title={ERROR_MESSAGES.INVALID_COORDINATES}
        message="The property coordinates are invalid. Please contact support."
        height={height}
      />
    );
  }

  // No API keys available
  if (!googleApiKey && !mapboxApiKey) {
    return (
      <MapError
        title={ERROR_MESSAGES.API_KEY_MISSING}
        message="Map service is not configured. Please contact support."
        height={height}
      />
    );
  }

  // Loading state
  if (!googleLoaded && !shouldUseFallback) {
    return <MapSkeleton height={height} />;
  }

  // Show loading if fallback but no key
  if (shouldUseFallback && !hasMapboxKey) {
    return (
      <MapError
        title={ERROR_MESSAGES.MAP_LOAD_FAILED}
        message="Unable to load map service. Please try again later."
        height={height}
      />
    );
  }

  return (
    <div
      className={`proprhome-map-module ${className}`}
      style={{ height: heightStyle }}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Fallback Banner */}
      {shouldUseFallback && hasMapboxKey && (
        <MapFallbackBanner />
      )}

      {/* View Toggle */}
      {!disableStreetView && !shouldUseFallback && streetViewAvailable !== null && (
        <ViewToggle
          currentView={currentView}
          onViewChange={setCurrentView}
          streetViewAvailable={streetViewAvailable}
        />
      )}

      {/* Controls */}
      {showFullscreen && (
        <MapControls
          onFullscreen={handleFullscreen}
          showStyleToggle={shouldUseFallback && showStyleToggle}
          currentStyle={mapStyle}
          onStyleChange={handleStyleChange}
        />
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className={`map-container ${currentView === 'map' ? 'active' : 'hidden'}`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Street View Container */}
      {!disableStreetView && !shouldUseFallback && (
        <div
          ref={streetViewContainerRef}
          className={`street-view-container ${currentView === 'streetview' ? 'active' : 'hidden'}`}
          style={{ width: '100%', height: '100%' }}
        />
      )}

      {/* Street View Unavailable Message */}
      {currentView === 'streetview' && streetViewAvailable === false && !shouldUseFallback && (
        <div className="street-view-unavailable">
          <p>{ERROR_MESSAGES.STREET_VIEW_UNAVAILABLE}</p>
          <button onClick={() => setCurrentView('map')} type="button">
            Return to Map
          </button>
        </div>
      )}

      {/* Loading overlay while checking street view */}
      {!disableStreetView && streetViewChecking && !shouldUseFallback && (
        <div className="street-view-checking">
          Checking Street View availability...
        </div>
      )}

      <style>{`
        .proprhome-map-module {
          position: relative;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background-color: #F1F5F9;
          font-family: 'Poppins', sans-serif;
        }

        .map-container,
        .street-view-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: opacity 0.3s ease;
        }

        .active {
          opacity: 1;
          z-index: 1;
        }

        .hidden {
          opacity: 0;
          z-index: 0;
          pointer-events: none;
        }

        .street-view-unavailable {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #F1F5F9;
          gap: 16px;
          z-index: 5;
        }

        .street-view-unavailable p {
          font-size: 14px;
          color: #475569;
          margin: 0;
        }

        .street-view-unavailable button {
          padding: 8px 16px;
          background: #4ADE80;
          color: white;
          border: none;
          border-radius: 6px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .street-view-unavailable button:hover {
          background: #22C55E;
        }

        .street-view-checking {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #64748B;
          z-index: 10;
        }

        /* Custom popup styles */
        .proprhome-popup {
          padding: 8px;
          font-family: 'Poppins', sans-serif;
        }

        .popup-title {
          font-weight: 600;
          color: #334155;
          margin-bottom: 4px;
        }

        .popup-price {
          color: #4ADE80;
          font-weight: 600;
          font-size: 14px;
        }

        .popup-address {
          font-size: 12px;
          color: #64748B;
          margin-top: 4px;
        }

        /* Mapbox marker styles */
        .proprhome-marker {
          position: relative;
        }

        .marker-price {
          white-space: nowrap;
        }

        .marker-price.selected {
          background: #14B8A6 !important;
        }
      `}</style>
    </div>
  );
});

/**
 * MapModule with Error Boundary wrapper
 * Use this for production to prevent crashes
 */
export function MapModuleWithErrorBoundary(props) {
  return (
    <MapErrorBoundary height={props.height}>
      <MapModule {...props} />
    </MapErrorBoundary>
  );
}

export default MapModuleWithErrorBoundary;
export { MapModule };
