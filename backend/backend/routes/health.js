/**
 * Health check routes
 */

import express from 'express';
import { query } from '../database/init.js';
import { getRedisClient } from '../services/redis.js';
import { getGeoCLIPModel } from '../services/geoclip.js';
import { getServiceInfo as getNominatimInfo } from '../services/nominatim.js';
import { getServiceInfo as getCloudinaryInfo } from '../services/cloudinary.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/health
 * Basic health check
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check with service status
 */
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0',
      services: {}
    };

    // Check database
    try {
      await query('SELECT 1');
      health.services.database = {
        status: 'healthy',
        message: 'Connected'
      };
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        message: error.message
      };
      health.status = 'degraded';
    }

    // Check Redis
    try {
      const redis = getRedisClient();
      await redis.ping();
      health.services.redis = {
        status: 'healthy',
        message: 'Connected'
      };
    } catch (error) {
      health.services.redis = {
        status: 'unhealthy',
        message: error.message
      };
      health.status = 'degraded';
    }

    // Check GeoCLIP
    try {
      const geoclip = getGeoCLIPModel();
      health.services.geoclip = {
        status: 'healthy',
        message: 'Model loaded'
      };
    } catch (error) {
      health.services.geoclip = {
        status: 'unhealthy',
        message: error.message
      };
      health.status = 'degraded';
    }

    // Check Nominatim
    try {
      const nominatimInfo = getNominatimInfo();
      health.services.nominatim = {
        status: nominatimInfo.status,
        message: nominatimInfo.description
      };
    } catch (error) {
      health.services.nominatim = {
        status: 'unhealthy',
        message: error.message
      };
      health.status = 'degraded';
    }

    // Check Cloudinary
    try {
      const cloudinaryInfo = getCloudinaryInfo();
      health.services.cloudinary = {
        status: cloudinaryInfo.status,
        message: cloudinaryInfo.description
      };
    } catch (error) {
      health.services.cloudinary = {
        status: 'unhealthy',
        message: error.message
      };
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/ready
 * Readiness check for Kubernetes
 */
router.get('/ready', async (req, res) => {
  try {
    // Check critical services
    await query('SELECT 1');
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/live
 * Liveness check for Kubernetes
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
