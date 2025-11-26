/**
 * ProprHome Map Module - Constants
 * Brand colors, bounds, and default values
 */

// ProprHome Brand Colors
export const PROPRHOME_COLORS = {
  primary: {
    green: '#4ADE80',      // Brand/Green - Primary actions
    greenDark: '#22C55E',  // Hover states
  },
  secondary: {
    teal: '#14B8A6',       // Brand/Teal
    yellow: '#FBBF24',     // Brand/Yellow - Highlights
    turquoise: '#06B6D4',  // Brand/Turquoise
  },
  neutral: {
    shark: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    }
  }
};

// Geographic bounds for validation
export const COORDINATE_BOUNDS = {
  // Portugal bounding box (primary market)
  PORTUGAL: {
    lat: { min: 36.838, max: 42.280 },
    lng: { min: -9.526, max: -6.189 }
  },
  // Dubai bounding box (expansion market)
  DUBAI: {
    lat: { min: 24.763, max: 25.359 },
    lng: { min: 54.890, max: 55.565 }
  },
  // Global bounds
  GLOBAL: {
    lat: { min: -90, max: 90 },
    lng: { min: -180, max: 180 }
  }
};

// Default map settings
export const MAP_DEFAULTS = {
  zoom: 16,
  minZoom: 3,
  maxZoom: 20,
  streetViewRadius: 100, // Search within 100m
  loadTimeout: 10000,    // 10 seconds
};

// ProprHome branded marker SVG
export const PROPRHOME_MARKER_SVG = `
<svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 0C8.954 0 0 8.954 0 20c0 14.5 20 32 20 32s20-17.5 20-32C40 8.954 31.046 0 20 0z" fill="#4ADE80"/>
  <circle cx="20" cy="20" r="12" fill="white"/>
  <path d="M20 12l-8 6v10h5v-6h6v6h5V18l-8-6z" fill="#4ADE80"/>
</svg>
`;

// Price marker template
export const createPriceMarkerSvg = (price) => `
<svg width="80" height="40" viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="80" height="32" rx="4" fill="#4ADE80"/>
  <polygon points="40,40 32,32 48,32" fill="#4ADE80"/>
  <text x="40" y="22" text-anchor="middle" fill="white" font-family="Poppins, sans-serif" font-size="12" font-weight="600">${price}</text>
</svg>
`;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_COORDINATES: 'Invalid location coordinates',
  API_KEY_MISSING: 'Map API key not configured',
  MAP_LOAD_FAILED: 'Unable to load map',
  STREET_VIEW_UNAVAILABLE: 'Street View is not available at this location',
  GEOCODING_FAILED: 'Unable to find address',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
};

// Map styles
export const MAPBOX_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
};

export default {
  PROPRHOME_COLORS,
  COORDINATE_BOUNDS,
  MAP_DEFAULTS,
  PROPRHOME_MARKER_SVG,
  createPriceMarkerSvg,
  ERROR_MESSAGES,
  MAPBOX_STYLES,
};
