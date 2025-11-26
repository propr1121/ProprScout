/**
 * ProprHome Map Module - Coordinate Validation
 * Security utilities for validating map inputs
 */

import { COORDINATE_BOUNDS } from './constants';

/**
 * Validate that a value is a valid number
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Validate latitude value
 * @param {number} lat - Latitude to validate
 * @returns {boolean}
 */
export function isValidLatitude(lat) {
  return isValidNumber(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validate longitude value
 * @param {number} lng - Longitude to validate
 * @returns {boolean}
 */
export function isValidLongitude(lng) {
  return isValidNumber(lng) && lng >= -180 && lng <= 180;
}

/**
 * Validate coordinates object
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean}
 */
export function validateCoordinates(lat, lng) {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

/**
 * Check if coordinates are within Portugal bounds
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean}
 */
export function isInPortugal(lat, lng) {
  const bounds = COORDINATE_BOUNDS.PORTUGAL;
  return (
    lat >= bounds.lat.min &&
    lat <= bounds.lat.max &&
    lng >= bounds.lng.min &&
    lng <= bounds.lng.max
  );
}

/**
 * Check if coordinates are within Dubai bounds
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean}
 */
export function isInDubai(lat, lng) {
  const bounds = COORDINATE_BOUNDS.DUBAI;
  return (
    lat >= bounds.lat.min &&
    lat <= bounds.lat.max &&
    lng >= bounds.lng.min &&
    lng <= bounds.lng.max
  );
}

/**
 * Check if coordinates are in a supported market
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {{ valid: boolean, market: string | null }}
 */
export function validateMarket(lat, lng) {
  if (!validateCoordinates(lat, lng)) {
    return { valid: false, market: null };
  }

  if (isInPortugal(lat, lng)) {
    return { valid: true, market: 'portugal' };
  }

  if (isInDubai(lat, lng)) {
    return { valid: true, market: 'dubai' };
  }

  // Allow global coordinates but flag as outside primary markets
  return { valid: true, market: 'other' };
}

/**
 * Validate zoom level
 * @param {number} zoom - Zoom level
 * @param {number} min - Minimum zoom (default: 1)
 * @param {number} max - Maximum zoom (default: 22)
 * @returns {boolean}
 */
export function validateZoom(zoom, min = 1, max = 22) {
  return isValidNumber(zoom) && zoom >= min && zoom <= max;
}

/**
 * Clamp zoom to valid range
 * @param {number} zoom - Zoom level
 * @param {number} min - Minimum zoom
 * @param {number} max - Maximum zoom
 * @returns {number}
 */
export function clampZoom(zoom, min = 1, max = 22) {
  if (!isValidNumber(zoom)) return 16; // Default zoom
  return Math.max(min, Math.min(max, zoom));
}

/**
 * Parse and validate coordinates from various formats
 * Supports: { lat, lng }, { lat, lon }, { latitude, longitude }, [lng, lat]
 * @param {Object|Array} coords - Coordinates in various formats
 * @returns {{ lat: number, lng: number } | null}
 */
export function parseCoordinates(coords) {
  if (!coords) return null;

  let lat, lng;

  // Array format [lng, lat] (GeoJSON standard)
  if (Array.isArray(coords) && coords.length >= 2) {
    [lng, lat] = coords;
  }
  // Object with lat/lng
  else if (typeof coords === 'object') {
    lat = coords.lat ?? coords.latitude;
    lng = coords.lng ?? coords.lon ?? coords.longitude;
  }

  if (validateCoordinates(lat, lng)) {
    return { lat, lng };
  }

  return null;
}

/**
 * Validate API key format (basic check)
 * @param {string} key - API key to validate
 * @param {string} type - 'google' or 'mapbox'
 * @returns {boolean}
 */
export function validateApiKeyFormat(key, type = 'google') {
  if (!key || typeof key !== 'string') return false;

  switch (type) {
    case 'google':
      // Google Maps API keys start with AIza and are ~39 chars
      return key.startsWith('AIza') && key.length >= 30;
    case 'mapbox':
      // Mapbox tokens start with pk. or sk.
      return (key.startsWith('pk.') || key.startsWith('sk.')) && key.length >= 50;
    default:
      return key.length >= 10;
  }
}

export default {
  isValidNumber,
  isValidLatitude,
  isValidLongitude,
  validateCoordinates,
  isInPortugal,
  isInDubai,
  validateMarket,
  validateZoom,
  clampZoom,
  parseCoordinates,
  validateApiKeyFormat,
};
