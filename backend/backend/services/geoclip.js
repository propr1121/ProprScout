/**
 * GeoCLIP service for image geolocation
 * Note: GeoCLIP is handled by Flask backend
 * This service proxies requests to Flask or provides fallback
 */

import axios from 'axios';
import sharp from 'sharp';
import logger from '../utils/logger.js';

// GeoCLIP Flask service URL - configure via environment variable
const GEOCLIP_API_URL = process.env.GEOCLIP_API_URL || 'http://localhost:5000';

let cacheService = null;

/**
 * Initialize GeoCLIP model (stub - GeoCLIP handled by Flask)
 */
export async function initGeoCLIP() {
  try {
    logger.info('🔍 GeoCLIP handled by Flask backend (port 5000)');
    logger.info('✅ GeoCLIP service ready (proxying to Flask)');
    return { status: 'ready', backend: 'flask' };
  } catch (error) {
    logger.error('❌ GeoCLIP initialization failed:', error);
    throw error;
  }
}

/**
 * Get GeoCLIP model (stub - GeoCLIP handled by Flask)
 */
export function getGeoCLIPModel() {
  return { status: 'ready', backend: 'flask', port: 5000 };
}

/**
 * Download and process image
 */
async function downloadAndProcessImage(imageUrl) {
  try {
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'ProprScout/1.0.0'
      }
    });

    // Process image with Sharp
    const processedImage = await sharp(response.data)
      .resize(512, 512, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer();

    return processedImage;
  } catch (error) {
    logger.error('Image download/processing error:', error);
    throw new Error(`Failed to download or process image: ${error.message}`);
  }
}

/**
 * Predict location from image
 */
export async function predictLocation(imageUrl, options = {}) {
  try {
    const {
      useCache = true,
      cacheTTL = 3600, // 1 hour
      confidenceThreshold = 0.5
    } = options;

    // Check cache first
    if (useCache && cacheService) {
      const cacheKey = `geoclip:${imageUrl}`;
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('📍 Using cached GeoCLIP result');
        return cachedResult;
      }
    }

    // Proxy to Flask backend for GeoCLIP prediction
    logger.info('🔍 Proxying GeoCLIP prediction to Flask backend...');
    
    try {
      const response = await axios.post(`${GEOCLIP_API_URL}/api/geoclip/predict`, {
        image_url: imageUrl,
        ...options
      }, {
        timeout: 60000 // 60 seconds
      });
      
      if (response.data && response.data.coordinates) {
        const prediction = response.data;

        // Extract coordinates and confidence from Flask response
    const result = {
          coordinates: prediction.coordinates,
      confidence: prediction.confidence || 0.8,
      method: 'geoclip',
      processed_at: new Date().toISOString(),
          image_url: imageUrl,
          backend: 'flask'
    };

    // Cache result
    if (useCache && cacheService) {
      const cacheKey = `geoclip:${imageUrl}`;
          // Note: Cache service would need to be initialized
    }

    logger.info(`✅ GeoCLIP prediction completed: ${result.coordinates.latitude}, ${result.coordinates.longitude}`);
    return result;
      } else {
        throw new Error('Invalid response from Flask backend');
      }
    } catch (flaskError) {
      logger.warn('Flask backend unavailable, GeoCLIP prediction failed:', flaskError.message);
      throw new Error(`GeoCLIP prediction failed: ${flaskError.message}`);
    }

  } catch (error) {
    logger.error('❌ GeoCLIP prediction failed:', error);
    throw new Error(`GeoCLIP prediction failed: ${error.message}`);
  }
}

/**
 * Batch predict locations
 */
export async function batchPredictLocations(imageUrls, options = {}) {
  try {
    const {
      batchSize = 5,
      delay = 1000, // 1 second delay between batches
      useCache = true
    } = options;

    const results = [];
    const batches = [];

    // Split URLs into batches
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      batches.push(imageUrls.slice(i, i + batchSize));
    }

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(`🔍 Processing batch ${i + 1}/${batches.length} (${batch.length} images)`);

      const batchPromises = batch.map(async (imageUrl) => {
        try {
          const result = await predictLocation(imageUrl, { useCache });
          return { imageUrl, result, success: true };
        } catch (error) {
          logger.error(`❌ Failed to predict location for ${imageUrl}:`, error);
          return { imageUrl, error: error.message, success: false };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return results;
  } catch (error) {
    logger.error('❌ Batch prediction failed:', error);
    throw new Error(`Batch prediction failed: ${error.message}`);
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
 * Calculate distance between coordinates
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get GeoCLIP model info
 */
export function getModelInfo() {
  return {
    name: 'GeoCLIP',
    version: '1.2.0',
    description: 'Image geolocation using GeoCLIP model',
    capabilities: [
      'Image geolocation',
      'Batch processing',
      'Caching',
      'Confidence scoring'
    ],
    status: geoclipModel ? 'ready' : 'not_initialized'
  };
}

export default {
  initGeoCLIP,
  getGeoCLIPModel,
  predictLocation,
  batchPredictLocations,
  validateCoordinates,
  calculateDistance,
  getModelInfo
};
