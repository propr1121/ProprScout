/**
 * Analysis API routes
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../database/init.js';
import { analyzeProperty } from '../lib/analysis/propertyAnalyzer.js';
import { analyzeListingWithAI, isConfigured as isAIConfigured } from '../services/anthropic.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/analysis/analyze
 * Analyze property data
 */
router.post('/analyze', [
  body('property_id').isInt().withMessage('Property ID is required'),
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

    const { property_id, options = {} } = req.body;

    logger.info(`🔍 Analyzing property: ${property_id}`);

    // Get property data
    const propertyResult = await query(`
      SELECT 
        id, url, site, property_id, title, description, price, area,
        rooms, bathrooms, location, 
        coordinates[0] as longitude, coordinates[1] as latitude,
        features, images, raw_data
      FROM properties 
      WHERE id = $1
    `, [property_id]);

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Property not found'
      });
    }

    const property = propertyResult.rows[0];
    if (property.longitude && property.latitude) {
      property.coordinates = {
        longitude: parseFloat(property.longitude),
        latitude: parseFloat(property.latitude)
      };
    }

    // Analyze property (basic analysis)
    const analysis = analyzeProperty(property);

    // Get AI-powered analysis if configured
    let aiAnalysis = null;
    if (isAIConfigured()) {
      try {
        logger.info('Running AI analysis with Anthropic Claude...');
        aiAnalysis = await analyzeListingWithAI(property);
        logger.info('AI analysis completed successfully');
      } catch (aiError) {
        logger.warn('AI analysis failed, continuing without it:', aiError);
        aiAnalysis = {
          error: true,
          message: 'AI analysis temporarily unavailable'
        };
      }
    } else {
      logger.info('Anthropic API key not configured, skipping AI analysis');
    }

    // Add AI analysis to the result
    analysis.aiAnalysis = aiAnalysis;

    // Store analysis result
    try {
      await query(`
        INSERT INTO analysis_results (
          property_id, overall_score, price_analysis, location_analysis,
          property_analysis, recommendations, risks, opportunities, geolocation_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        property_id,
        analysis.overallScore.score,
        JSON.stringify(analysis.priceAnalysis),
        JSON.stringify(analysis.locationAnalysis),
        JSON.stringify(analysis.propertyAnalysis),
        analysis.recommendations,
        analysis.risks,
        analysis.opportunities,
        JSON.stringify(analysis.geolocationData || {})
      ]);
    } catch (dbError) {
      logger.warn('Failed to store analysis result in database:', dbError);
    }

    res.json({
      success: true,
      data: {
        property,
        analysis
      }
    });

  } catch (error) {
    logger.error('Property analysis failed:', error);
    res.status(500).json({
      error: 'Property analysis failed',
      message: error.message
    });
  }
});

/**
 * GET /api/analysis/:property_id
 * Get analysis results for property
 */
router.get('/:property_id', async (req, res) => {
  try {
    const { property_id } = req.params;

    const result = await query(`
      SELECT 
        ar.*,
        p.title, p.url, p.site, p.price, p.area, p.location
      FROM analysis_results ar
      JOIN properties p ON ar.property_id = p.id
      WHERE ar.property_id = $1
      ORDER BY ar.created_at DESC
      LIMIT 1
    `, [property_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis not found'
      });
    }

    const analysis = result.rows[0];
    
    // Parse JSON fields
    analysis.price_analysis = JSON.parse(analysis.price_analysis);
    analysis.location_analysis = JSON.parse(analysis.location_analysis);
    analysis.property_analysis = JSON.parse(analysis.property_analysis);
    analysis.geolocation_data = JSON.parse(analysis.geolocation_data || '{}');

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Get analysis failed:', error);
    res.status(500).json({
      error: 'Get analysis failed',
      message: error.message
    });
  }
});

/**
 * GET /api/analysis
 * List analysis results with pagination
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      min_score = null, 
      max_score = null,
      site = null
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (min_score) {
      paramCount++;
      whereClause += ` AND ar.overall_score >= $${paramCount}`;
      params.push(min_score);
    }

    if (max_score) {
      paramCount++;
      whereClause += ` AND ar.overall_score <= $${paramCount}`;
      params.push(max_score);
    }

    if (site) {
      paramCount++;
      whereClause += ` AND p.site = $${paramCount}`;
      params.push(site);
    }

    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT 
        ar.id, ar.property_id, ar.overall_score, ar.created_at,
        p.title, p.url, p.site, p.price, p.area, p.location
      FROM analysis_results ar
      JOIN properties p ON ar.property_id = p.id
      ${whereClause}
      ORDER BY ar.created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM analysis_results ar
      JOIN properties p ON ar.property_id = p.id
      ${whereClause}
    `, params.slice(0, -2));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        analyses: result.rows,
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
    logger.error('List analyses failed:', error);
    res.status(500).json({
      error: 'List analyses failed',
      message: error.message
    });
  }
});

/**
 * GET /api/analysis/stats
 * Get analysis statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_analyses,
        AVG(overall_score) as avg_score,
        MIN(overall_score) as min_score,
        MAX(overall_score) as max_score,
        COUNT(CASE WHEN overall_score >= 80 THEN 1 END) as high_score_analyses,
        COUNT(CASE WHEN overall_score >= 60 AND overall_score < 80 THEN 1 END) as medium_score_analyses,
        COUNT(CASE WHEN overall_score < 60 THEN 1 END) as low_score_analyses
      FROM analysis_results
    `);

    const scoreDistribution = await query(`
      SELECT 
        CASE 
          WHEN overall_score >= 90 THEN '90-100'
          WHEN overall_score >= 80 THEN '80-89'
          WHEN overall_score >= 70 THEN '70-79'
          WHEN overall_score >= 60 THEN '60-69'
          WHEN overall_score >= 50 THEN '50-59'
          ELSE '0-49'
        END as score_range,
        COUNT(*) as count
      FROM analysis_results
      GROUP BY score_range
      ORDER BY score_range
    `);

    const siteStats = await query(`
      SELECT 
        p.site,
        COUNT(*) as count,
        AVG(ar.overall_score) as avg_score
      FROM analysis_results ar
      JOIN properties p ON ar.property_id = p.id
      GROUP BY p.site
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        score_distribution: scoreDistribution.rows,
        by_site: siteStats.rows
      }
    });

  } catch (error) {
    logger.error('Get analysis stats failed:', error);
    res.status(500).json({
      error: 'Get analysis stats failed',
      message: error.message
    });
  }
});

export default router;
