/**
 * Geolocation API routes
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { predictLocation, batchPredictLocations } from '../services/geoclip.js';
import { reverseGeocode, forwardGeocode } from '../services/nominatim.js';
import { uploadImage, uploadImageFromUrl } from '../services/cloudinary.js';
import { query } from '../database/init.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/geolocation/predict
 * Predict location from image
 */
router.post('/predict', [
  body('image_url').isURL().withMessage('Valid image URL is required'),
  body('options').optional().isObject().withMessage('Options must be an object')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { image_url, options = {} } = req.body;

    logger.info(`🔍 Predicting location for image: ${image_url}`);

    // Predict location using GeoCLIP
    const prediction = await predictLocation(image_url, options);

    // Store result in database
    try {
      await query(`
        INSERT INTO geolocation_results (image_url, predicted_coordinates, confidence_score, geocoding_data)
        VALUES ($1, POINT($2, $3), $4, $5)
      `, [
        image_url,
        prediction.coordinates.longitude,
        prediction.coordinates.latitude,
        prediction.confidence,
        JSON.stringify(prediction)
      ]);
    } catch (dbError) {
      logger.warn('Failed to store geolocation result in database:', dbError);
    }

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    logger.error('Geolocation prediction failed:', error);
    res.status(500).json({
      error: 'Geolocation prediction failed',
      message: error.message
    });
  }
});

/**
 * POST /api/geolocation/batch-predict
 * Batch predict locations from multiple images
 */
router.post('/batch-predict', [
  body('image_urls').isArray({ min: 1, max: 10 }).withMessage('Image URLs array is required (1-10 items)'),
  body('options').optional().isObject().withMessage('Options must be an object')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { image_urls, options = {} } = req.body;

    logger.info(`🔍 Batch predicting locations for ${image_urls.length} images`);

    // Batch predict locations
    const results = await batchPredictLocations(image_urls, options);

    // Store results in database
    try {
      for (const result of results) {
        if (result.success) {
          await query(`
            INSERT INTO geolocation_results (image_url, predicted_coordinates, confidence_score, geocoding_data)
            VALUES ($1, POINT($2, $3), $4, $5)
          `, [
            result.imageUrl,
            result.result.coordinates.longitude,
            result.result.coordinates.latitude,
            result.result.confidence,
            JSON.stringify(result.result)
          ]);
        }
      }
    } catch (dbError) {
      logger.warn('Failed to store batch geolocation results in database:', dbError);
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    logger.error('Batch geolocation prediction failed:', error);
    res.status(500).json({
      error: 'Batch geolocation prediction failed',
      message: error.message
    });
  }
});

/**
 * POST /api/geolocation/reverse-geocode
 * Reverse geocoding - get address from coordinates
 */
router.post('/reverse-geocode', [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('options').optional().isObject().withMessage('Options must be an object')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { latitude, longitude, options = {} } = req.body;

    logger.info(`🔍 Reverse geocoding: ${latitude}, ${longitude}`);

    // Reverse geocode using Nominatim
    const result = await reverseGeocode(latitude, longitude, options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Reverse geocoding failed:', error);
    res.status(500).json({
      error: 'Reverse geocoding failed',
      message: error.message
    });
  }
});

/**
 * POST /api/geolocation/forward-geocode
 * Forward geocoding - get coordinates from address
 */
router.post('/forward-geocode', [
  body('address').isString().isLength({ min: 1, max: 500 }).withMessage('Valid address is required'),
  body('options').optional().isObject().withMessage('Options must be an object')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { address, options = {} } = req.body;

    logger.info(`🔍 Forward geocoding: ${address}`);

    // Forward geocode using Nominatim
    const result = await forwardGeocode(address, options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Forward geocoding failed:', error);
    res.status(500).json({
      error: 'Forward geocoding failed',
      message: error.message
    });
  }
});

/**
 * POST /api/geolocation/upload-and-predict
 * Upload image and predict location
 */
router.post('/upload-and-predict', [
  body('image_data').isString().withMessage('Image data is required'),
  body('options').optional().isObject().withMessage('Options must be an object')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { image_data, options = {} } = req.body;

    logger.info('🔍 Uploading image and predicting location');

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image_data, 'base64');

    // Upload to Cloudinary
    const uploadResult = await uploadImage(imageBuffer, {
      folder: 'proprscout/geolocation',
      tags: ['geolocation', 'proprscout']
    });

    // Predict location
    const prediction = await predictLocation(uploadResult.url, options);

    // Store result in database
    try {
      await query(`
        INSERT INTO geolocation_results (image_url, predicted_coordinates, confidence_score, geocoding_data)
        VALUES ($1, POINT($2, $3), $4, $5)
      `, [
        uploadResult.url,
        prediction.coordinates.longitude,
        prediction.coordinates.latitude,
        prediction.confidence,
        JSON.stringify(prediction)
      ]);
    } catch (dbError) {
      logger.warn('Failed to store geolocation result in database:', dbError);
    }

    res.json({
      success: true,
      data: {
        upload: uploadResult,
        prediction: prediction
      }
    });

  } catch (error) {
    logger.error('Upload and predict failed:', error);
    res.status(500).json({
      error: 'Upload and predict failed',
      message: error.message
    });
  }
});

/**
 * GET /api/geolocation/history
 * Get geolocation history
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(`
      SELECT 
        id,
        image_url,
        predicted_coordinates[0] as longitude,
        predicted_coordinates[1] as latitude,
        confidence_score,
        created_at
      FROM geolocation_results
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    logger.error('Get geolocation history failed:', error);
    res.status(500).json({
      error: 'Get geolocation history failed',
      message: error.message
    });
  }
});

/**
 * GET /api/geolocation/stats
 * Get geolocation statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_predictions,
        AVG(confidence_score) as avg_confidence,
        MIN(confidence_score) as min_confidence,
        MAX(confidence_score) as max_confidence,
        COUNT(CASE WHEN confidence_score > 0.8 THEN 1 END) as high_confidence_predictions
      FROM geolocation_results
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });

  } catch (error) {
    logger.error('Get geolocation stats failed:', error);
    res.status(500).json({
      error: 'Get geolocation stats failed',
      message: error.message
    });
  }
});

export default router;
