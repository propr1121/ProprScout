/**
 * ProprHome Map Module - Public Exports
 *
 * @example
 * ```jsx
 * import { MapModule, MapModuleWithErrorBoundary } from '@/components/map';
 *
 * // Basic usage
 * <MapModule
 *   coordinates={{ lat: 38.7223, lng: -9.1393 }}
 *   propertyTitle="T2 Apartment"
 *   propertyPrice="€610,000"
 * />
 *
 * // With error boundary (recommended for production)
 * <MapModuleWithErrorBoundary
 *   coordinates={{ lat: 38.7223, lng: -9.1393 }}
 * />
 * ```
 */

// Main component
export { default, MapModule, MapModuleWithErrorBoundary } from './MapModule';

// Sub-components (for advanced usage)
export {
  MapSkeleton,
  MapError,
  ViewToggle,
  MapControls,
  MapFallbackBanner
} from './components';

// Hooks (for custom implementations)
export {
  useGoogleMaps,
  useStreetView,
  useMapbox,
  useMapboxMap,
  initializeGoogleMap,
  initializeMapboxMap,
  createGoogleMarker,
  createMapboxMarker,
  createCustomMarkerElement,
  checkStreetViewAvailability
} from './hooks';

// Utilities
export {
  validateCoordinates,
  validateMarket,
  parseCoordinates,
  sanitizeMarkerSvg,
  sanitizePopupContent,
  escapeHtml,
  createSafePopupHtml,
  PROPRHOME_COLORS,
  PROPRHOME_MARKER_SVG,
  createPriceMarkerSvg,
  MAP_DEFAULTS,
  COORDINATE_BOUNDS,
  ERROR_MESSAGES,
  MAPBOX_STYLES
} from './utils';
