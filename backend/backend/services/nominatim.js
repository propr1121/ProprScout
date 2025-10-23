/**
 * Nominatim service for reverse geocoding
 */

import axios from 'axios';
import logger from '../utils/logger.js';
import { CacheService } from './redis.js';

let cacheService = null;

/**
 * Initialize Nominatim service
 */
export async function initNominatim() {
  try {
    cacheService = new CacheService();
    logger.info('✅ Nominatim service initialized');
    return true;
  } catch (error) {
    logger.error('❌ Nominatim initialization failed:', error);
    throw error;
  }
}

/**
 * Get Nominatim configuration
 */
function getNominatimConfig() {
  return {
    baseUrl: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
    userAgent: process.env.NOMINATIM_USER_AGENT || 'ProprScout/1.0.0',
    email: process.env.NOMINATIM_EMAIL || 'contact@proprscout.com',
    timeout: 10000,
    rateLimit: 1000 // 1 second delay between requests
  };
}

/**
 * Reverse geocoding - get address from coordinates
 */
export async function reverseGeocode(latitude, longitude, options = {}) {
  try {
    const {
      useCache = true,
      cacheTTL = 3600, // 1 hour
      language = 'en',
      addressdetails = true,
      zoom = 18
    } = options;

    // Validate coordinates
    if (!validateCoordinates(latitude, longitude)) {
      throw new Error('Invalid coordinates provided');
    }

    // Check cache first
    if (useCache && cacheService) {
      const cacheKey = `nominatim:reverse:${latitude}:${longitude}:${language}`;
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('📍 Using cached Nominatim result');
        return cachedResult;
      }
    }

    const config = getNominatimConfig();
    const params = {
      lat: latitude,
      lon: longitude,
      format: 'json',
      addressdetails: addressdetails ? 1 : 0,
      zoom: zoom,
      'accept-language': language,
      email: config.email
    };

    logger.info(`🔍 Reverse geocoding: ${latitude}, ${longitude}`);

    const response = await axios.get(`${config.baseUrl}/reverse`, {
      params,
      headers: {
        'User-Agent': config.userAgent
      },
      timeout: config.timeout
    });

    if (!response.data || !response.data[0]) {
      throw new Error('No results found for the given coordinates');
    }

    const result = {
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      address: response.data[0].display_name,
      address_components: response.data[0].address || {},
      place_id: response.data[0].place_id,
      osm_type: response.data[0].osm_type,
      osm_id: response.data[0].osm_id,
      boundingbox: response.data[0].boundingbox,
      method: 'nominatim',
      processed_at: new Date().toISOString()
    };

    // Cache result
    if (useCache && cacheService) {
      const cacheKey = `nominatim:reverse:${latitude}:${longitude}:${language}`;
      await cacheService.set(cacheKey, result, cacheTTL);
    }

    logger.info(`✅ Reverse geocoding completed: ${result.address}`);
    return result;

  } catch (error) {
    logger.error('❌ Reverse geocoding failed:', error);
    throw new Error(`Reverse geocoding failed: ${error.message}`);
  }
}

/**
 * Forward geocoding - get coordinates from address
 */
export async function forwardGeocode(address, options = {}) {
  try {
    const {
      useCache = true,
      cacheTTL = 3600, // 1 hour
      language = 'en',
      countrycodes = 'pt', // Portugal
      limit = 1
    } = options;

    if (!address || typeof address !== 'string') {
      throw new Error('Address is required');
    }

    // Check cache first
    if (useCache && cacheService) {
      const cacheKey = `nominatim:forward:${address}:${language}`;
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('📍 Using cached Nominatim forward geocoding result');
        return cachedResult;
      }
    }

    const config = getNominatimConfig();
    const params = {
      q: address,
      format: 'json',
      addressdetails: 1,
      limit: limit,
      'accept-language': language,
      countrycodes: countrycodes,
      email: config.email
    };

    logger.info(`🔍 Forward geocoding: ${address}`);

    const response = await axios.get(`${config.baseUrl}/search`, {
      params,
      headers: {
        'User-Agent': config.userAgent
      },
      timeout: config.timeout
    });

    if (!response.data || !response.data[0]) {
      throw new Error('No results found for the given address');
    }

    const result = {
      coordinates: {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      },
      address: response.data[0].display_name,
      address_components: response.data[0].address || {},
      place_id: response.data[0].place_id,
      osm_type: response.data[0].osm_type,
      osm_id: response.data[0].osm_id,
      boundingbox: response.data[0].boundingbox,
      importance: response.data[0].importance,
      method: 'nominatim',
      processed_at: new Date().toISOString()
    };

    // Cache result
    if (useCache && cacheService) {
      const cacheKey = `nominatim:forward:${address}:${language}`;
      await cacheService.set(cacheKey, result, cacheTTL);
    }

    logger.info(`✅ Forward geocoding completed: ${result.coordinates.latitude}, ${result.coordinates.longitude}`);
    return result;

  } catch (error) {
    logger.error('❌ Forward geocoding failed:', error);
    throw new Error(`Forward geocoding failed: ${error.message}`);
  }
}

/**
 * Get place details by OSM ID
 */
export async function getPlaceDetails(osmType, osmId, options = {}) {
  try {
    const {
      useCache = true,
      cacheTTL = 3600,
      language = 'en'
    } = options;

    // Check cache first
    if (useCache && cacheService) {
      const cacheKey = `nominatim:details:${osmType}:${osmId}:${language}`;
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('📍 Using cached place details');
        return cachedResult;
      }
    }

    const config = getNominatimConfig();
    const params = {
      osm_ids: `${osmType}:${osmId}`,
      format: 'json',
      addressdetails: 1,
      'accept-language': language,
      email: config.email
    };

    logger.info(`🔍 Getting place details: ${osmType}:${osmId}`);

    const response = await axios.get(`${config.baseUrl}/lookup`, {
      params,
      headers: {
        'User-Agent': config.userAgent
      },
      timeout: config.timeout
    });

    if (!response.data || !response.data[0]) {
      throw new Error('No details found for the given OSM ID');
    }

    const result = {
      place_id: response.data[0].place_id,
      osm_type: response.data[0].osm_type,
      osm_id: response.data[0].osm_id,
      coordinates: {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      },
      address: response.data[0].display_name,
      address_components: response.data[0].address || {},
      boundingbox: response.data[0].boundingbox,
      method: 'nominatim',
      processed_at: new Date().toISOString()
    };

    // Cache result
    if (useCache && cacheService) {
      const cacheKey = `nominatim:details:${osmType}:${osmId}:${language}`;
      await cacheService.set(cacheKey, result, cacheTTL);
    }

    logger.info(`✅ Place details retrieved: ${result.address}`);
    return result;

  } catch (error) {
    logger.error('❌ Place details retrieval failed:', error);
    throw new Error(`Place details retrieval failed: ${error.message}`);
  }
}

/**
 * Validate coordinates
 */
export function validateCoordinates(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
}

/**
 * Get Nominatim service info
 */
export function getServiceInfo() {
  return {
    name: 'Nominatim',
    version: '1.0.0',
    description: 'OpenStreetMap-based geocoding service',
    baseUrl: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
    capabilities: [
      'Reverse geocoding',
      'Forward geocoding',
      'Place details',
      'Caching',
      'Multi-language support'
    ],
    status: 'ready'
  };
}

export default {
  initNominatim,
  reverseGeocode,
  forwardGeocode,
  getPlaceDetails,
  validateCoordinates,
  getServiceInfo
};
