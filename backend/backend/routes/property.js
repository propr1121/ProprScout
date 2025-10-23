/**
 * Property API routes
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../database/init.js';
import { scrapeProperty } from '../lib/scrapers/propertyScraper.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/properties/scrape
 * Scrape property data from URL
 */
router.post('/scrape', [
  body('url').isURL().withMessage('Valid property URL is required'),
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

    const { url, options = {} } = req.body;

    logger.info(`🏠 Scraping property: ${url}`);

    // Scrape property data
    const propertyData = await scrapeProperty(url);

    // Store in database
    try {
      const result = await query(`
        INSERT INTO properties (
          url, site, property_id, title, description, price, area, 
          rooms, bathrooms, location, coordinates, features, images, raw_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `, [
        propertyData.url,
        propertyData.site,
        propertyData.propertyId,
        propertyData.title,
        propertyData.description,
        propertyData.price,
        propertyData.area,
        propertyData.rooms,
        propertyData.bathrooms,
        propertyData.location,
        propertyData.coordinates ? `POINT(${propertyData.coordinates.longitude}, ${propertyData.coordinates.latitude})` : null,
        propertyData.features,
        propertyData.images,
        JSON.stringify(propertyData)
      ]);

      propertyData.id = result.rows[0].id;
    } catch (dbError) {
      logger.warn('Failed to store property in database:', dbError);
    }

    res.json({
      success: true,
      data: propertyData
    });

  } catch (error) {
    logger.error('Property scraping failed:', error);
    res.status(500).json({
      error: 'Property scraping failed',
      message: error.message
    });
  }
});

/**
 * GET /api/properties/:id
 * Get property by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        id, url, site, property_id, title, description, price, area,
        rooms, bathrooms, location, 
        coordinates[0] as longitude, coordinates[1] as latitude,
        features, images, raw_data, created_at, updated_at
      FROM properties 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Property not found'
      });
    }

    const property = result.rows[0];
    if (property.longitude && property.latitude) {
      property.coordinates = {
        longitude: parseFloat(property.longitude),
        latitude: parseFloat(property.latitude)
      };
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    logger.error('Get property failed:', error);
    res.status(500).json({
      error: 'Get property failed',
      message: error.message
    });
  }
});

/**
 * GET /api/properties
 * List properties with pagination
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      site = null, 
      min_price = null, 
      max_price = null,
      min_area = null,
      max_area = null
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (site) {
      paramCount++;
      whereClause += ` AND site = $${paramCount}`;
      params.push(site);
    }

    if (min_price) {
      paramCount++;
      whereClause += ` AND price >= $${paramCount}`;
      params.push(min_price);
    }

    if (max_price) {
      paramCount++;
      whereClause += ` AND price <= $${paramCount}`;
      params.push(max_price);
    }

    if (min_area) {
      paramCount++;
      whereClause += ` AND area >= $${paramCount}`;
      params.push(min_area);
    }

    if (max_area) {
      paramCount++;
      whereClause += ` AND area <= $${paramCount}`;
      params.push(max_area);
    }

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT 
        id, url, site, property_id, title, description, price, area,
        rooms, bathrooms, location, 
        coordinates[0] as longitude, coordinates[1] as latitude,
        features, images, created_at
      FROM properties 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM properties 
      ${whereClause}
    `, params.slice(0, -2));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Process coordinates
    const properties = result.rows.map(property => {
      if (property.longitude && property.latitude) {
        property.coordinates = {
          longitude: parseFloat(property.longitude),
          latitude: parseFloat(property.latitude)
        };
      }
      return property;
    });

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('List properties failed:', error);
    res.status(500).json({
      error: 'List properties failed',
      message: error.message
    });
  }
});

/**
 * DELETE /api/properties/:id
 * Delete property by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM properties WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    logger.error('Delete property failed:', error);
    res.status(500).json({
      error: 'Delete property failed',
      message: error.message
    });
  }
});

/**
 * GET /api/properties/stats
 * Get property statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(DISTINCT site) as unique_sites,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(area) as avg_area,
        MIN(area) as min_area,
        MAX(area) as max_area,
        COUNT(CASE WHEN coordinates IS NOT NULL THEN 1 END) as properties_with_coordinates
      FROM properties
    `);

    const siteStats = await query(`
      SELECT 
        site,
        COUNT(*) as count,
        AVG(price) as avg_price,
        AVG(area) as avg_area
      FROM properties
      GROUP BY site
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        by_site: siteStats.rows
      }
    });

  } catch (error) {
    logger.error('Get property stats failed:', error);
    res.status(500).json({
      error: 'Get property stats failed',
      message: error.message
    });
  }
});

export default router;
