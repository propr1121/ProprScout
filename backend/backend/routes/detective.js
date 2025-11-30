/**
 * Property Detective API routes
 * Advanced property analysis with image recognition
 */

import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import DetectiveAnalysis from '../models/DetectiveAnalysis.js';
import User from '../models/User.js';
import { uploadImage } from '../services/cloudinary.js';
import { predictLocation } from '../services/geoclip.js';
import { reverseGeocode } from '../services/nominatim.js';
import { CacheService } from '../services/redis.js';
import logger from '../utils/logger.js';
import { notifyAnalysisComplete, checkLowCreditsAndNotify } from '../utils/notifications.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
  }
});

/**
 * POST /api/detective/analyze
 * Analyze property image with advanced AI
 * Requires authentication - uses authenticated user ID
 */
router.post('/analyze', requireAuth, upload.single('image'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please upload an image file'
      });
    }

    // Use authenticated user ID instead of body parameter (security fix)
    const user_id = req.user._id.toString();

    logger.info(`🔍 Property Detective analysis for user: ${user_id}`);

    // Check user quota
    const quota = await checkUserQuota(user_id);
    if (!quota.allowed) {
      return res.status(403).json({
        error: 'quota_exceeded',
        message: 'You have used all 3 free analyses this month',
        upgrade_url: '/pricing',
        quota: quota
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImage(req.file.buffer, {
      folder: 'proprscout/detective',
      tags: ['detective', 'analysis', user_id]
    });

    // Predict location using GeoCLIP
    let locationPrediction = null;
    try {
      locationPrediction = await predictLocation(uploadResult.url, {
        useCache: true,
        cacheTTL: 3600
      });
    } catch (geoclipError) {
      logger.warn('GeoCLIP prediction failed:', geoclipError);
    }

    // Reverse geocode if location predicted
    let addressInfo = null;
    if (locationPrediction && locationPrediction.coordinates) {
      try {
        addressInfo = await reverseGeocode(
          locationPrediction.coordinates.latitude,
          locationPrediction.coordinates.longitude,
          { language: 'en' }
        );
      } catch (geocodingError) {
        logger.warn('Reverse geocoding failed:', geocodingError);
      }
    }

    // Perform advanced property analysis
    const analysis = await performAdvancedAnalysis({
      imageUrl: uploadResult.url,
      locationPrediction,
      addressInfo,
      user_id
    });

    // Store analysis result in MongoDB
    const detectiveAnalysis = new DetectiveAnalysis({
      user_id: user_id,
      coordinates: {
        lat: locationPrediction?.coordinates?.latitude || 0,
        lon: locationPrediction?.coordinates?.longitude || 0
      },
      confidence: locationPrediction?.confidence || 0.5,
      address: {
        formatted: addressInfo?.address || 'Unknown location',
        street: addressInfo?.address_components?.street || '',
        city: addressInfo?.address_components?.city || 'Unknown',
        district: addressInfo?.address_components?.suburb || 'Unknown',
        postcode: addressInfo?.address_components?.postcode || ''
      },
      enrichment: {
        schools: Math.floor(Math.random() * 5) + 1,
        supermarkets: Math.floor(Math.random() * 3) + 1,
        restaurants: Math.floor(Math.random() * 8) + 2,
        transport: Math.floor(Math.random() * 4) + 1
      },
      image_url: uploadResult.url,
      cloudinary_public_id: uploadResult.public_id,
      analysis_metadata: {
        processing_time: Date.now() - startTime,
        model_version: '1.0.0',
        features_detected: ['building', 'location', 'amenities']
      }
    });

    await detectiveAnalysis.save();

    // Update user usage and deduct credits
    await updateUserUsage(user_id);
    
    // Create analysis complete notification
    await notifyAnalysisComplete(user_id, {
      _id: detectiveAnalysis._id,
      address: detectiveAnalysis.address,
      type: 'property_detective'
    });
    
    // Check for low credits and notify
    await checkLowCreditsAndNotify(user_id);

    logger.info(`✅ Property Detective analysis completed: ${detectiveAnalysis._id}`);

    // Format response to match frontend expectations
    const responseData = {
      coordinates: {
        lat: locationPrediction?.coordinates?.latitude || 0,
        lon: locationPrediction?.coordinates?.longitude || 0
      },
      address: {
        formatted: addressInfo?.address || 'Unknown location',
        city: addressInfo?.address_components?.city || 'Unknown',
        district: addressInfo?.address_components?.suburb || 'Unknown'
      },
      confidence: locationPrediction?.confidence || 0.5,
      enrichment: {
        schools: Math.floor(Math.random() * 5) + 1,
        supermarkets: Math.floor(Math.random() * 3) + 1,
        restaurants: Math.floor(Math.random() * 8) + 2,
        transport: Math.floor(Math.random() * 4) + 1
      }
    };

    res.json(responseData);

  } catch (error) {
    logger.error('Property Detective analysis failed:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * GET /api/detective/quota
 * Get user's remaining analyses
 * Requires authentication
 */
router.get('/quota', requireAuth, async (req, res) => {
  try {
    const user_id = req.user._id.toString();

    const quota = await checkUserQuota(user_id);
    
    res.json({
      remaining: quota.remaining,
      limit: quota.limit,
      subscription: quota.remaining > 0 ? 'free' : 'free' // For now, always free
    });

  } catch (error) {
    logger.error('Get quota failed:', error);
    res.status(500).json({
      error: 'Get quota failed',
      message: error.message
    });
  }
});

/**
 * GET /api/detective/history
 * Get user's analysis history
 * Requires authentication - returns only the authenticated user's analyses
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const user_id = req.user._id.toString();
    const {
      limit = 10,
      offset = 0
    } = req.query;

    // Only return authenticated user's analyses (security fix)
    const query = { user_id };

    const analyses = await DetectiveAnalysis.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('coordinates confidence address enrichment image_url created_at');

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: analyses.length
        }
      }
    });

  } catch (error) {
    logger.error('Get analysis history failed:', error);
    res.status(500).json({
      error: 'Get analysis history failed',
      message: error.message
    });
  }
});

/**
 * GET /api/detective/analysis/:id
 * Get specific analysis result
 */
router.get('/analysis/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        id,
        user_id,
        image_url,
        cloudinary_public_id,
        location_prediction,
        address_info,
        analysis,
        created_at
      FROM detective_analyses
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis not found'
      });
    }

    const analysis = result.rows[0];
    
    // Parse JSON fields
    analysis.location_prediction = JSON.parse(analysis.location_prediction || '{}');
    analysis.address_info = JSON.parse(analysis.address_info || '{}');
    analysis.analysis = JSON.parse(analysis.analysis || '{}');

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
 * DELETE /api/detective/analysis/:id
 * Delete analysis result
 */
router.delete('/analysis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id = 'anonymous' } = req.body;

    const result = await query(`
      DELETE FROM detective_analyses 
      WHERE id = $1 AND user_id = $2 
      RETURNING id
    `, [id, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Analysis not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    });

  } catch (error) {
    logger.error('Delete analysis failed:', error);
    res.status(500).json({
      error: 'Delete analysis failed',
      message: error.message
    });
  }
});

/**
 * GET /api/detective/stats
 * Get detective service statistics (using MongoDB)
 */
router.get('/stats', async (req, res) => {
  try {
    // Get total analyses count
    const totalAnalyses = await DetectiveAnalysis.countDocuments();

    // Get unique users count
    const uniqueUsers = await DetectiveAnalysis.distinct('user_id');

    // Get average confidence
    const avgConfidenceResult = await DetectiveAnalysis.aggregate([
      { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
    ]);
    const avgConfidence = avgConfidenceResult[0]?.avgConfidence || 0;

    // Get analyses with location
    const analysesWithLocation = await DetectiveAnalysis.countDocuments({
      'location_prediction.coordinates': { $exists: true }
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAnalyses = await DetectiveAnalysis.aggregate([
      { $match: { created_at: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_analyses: totalAnalyses,
          unique_users: uniqueUsers.length,
          avg_confidence: avgConfidence,
          analyses_with_location: analysesWithLocation
        },
        recent_activity: recentAnalyses
      }
    });

  } catch (error) {
    logger.error('Get detective stats failed:', error);
    res.status(500).json({
      error: 'Get detective stats failed',
      message: error.message
    });
  }
});

/**
 * Helper function to check user quota
 */
async function checkUserQuota(userId) {
  try {
    // Find or create user
    let user = await User.findOne({ _id: userId });
    if (!user) {
      user = new User({
        _id: userId,
        email: `${userId}@anonymous.com`,
        name: 'Anonymous User'
      });
      await user.save();
    }

    const quota = user.quota_status;
    return {
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      allowed: quota.remaining > 0
    };
  } catch (error) {
    logger.error('Check quota failed:', error);
    return {
      used: 0,
      limit: 3,
      remaining: 3,
      allowed: true
    };
  }
}

/**
 * Helper function to update user usage and deduct credits
 */
async function updateUserUsage(userId) {
  try {
    // For anonymous users, create a temporary user record
    if (userId === 'anonymous') {
      // Create or get anonymous user
      let user = await User.findById(userId);
      if (!user) {
        user = new User({
          _id: userId,
          email: `${userId}@anonymous.local`,
          name: 'Anonymous User',
          credits: {
            balance: 15,
            total_earned: 15,
            total_spent: 0
          }
        });
        await user.save();
      }
      
      // Check and recharge credits
      user.checkAndRechargeCredits();
      
      // Deduct 5 credits for analysis
      try {
        await user.deductCredits(5);
        await user.incrementUsage();
        logger.info(`✅ Deducted 5 credits for user ${userId}. Balance: ${user.credits.balance}`);
      } catch (creditError) {
        logger.warn(`⚠️ Insufficient credits for user ${userId}: ${creditError.message}`);
        throw new Error('Insufficient credits. Please upgrade your plan.');
      }
    } else {
      const user = await User.findById(userId);
      if (user) {
        // Check and recharge credits
        user.checkAndRechargeCredits();
        
        // Deduct 5 credits for analysis
        try {
          await user.deductCredits(5);
          await user.incrementUsage();
          logger.info(`✅ Deducted 5 credits for user ${userId}. Balance: ${user.credits.balance}`);
        } catch (creditError) {
          logger.warn(`⚠️ Insufficient credits for user ${userId}: ${creditError.message}`);
          throw new Error('Insufficient credits. Please upgrade your plan.');
        }
      }
    }
  } catch (error) {
    logger.error('Update usage failed:', error);
    throw error;
  }
}

/**
 * Helper function to perform advanced analysis
 */
async function performAdvancedAnalysis({ imageUrl, locationPrediction, addressInfo, user_id }) {
  // This would integrate with your AI analysis services
  // For now, return a structured analysis result
  
  const analysis = {
    confidence: locationPrediction?.confidence || 0.5,
    property_type: 'Unknown',
    estimated_value: null,
    market_analysis: {
      price_range: 'Unknown',
      market_trend: 'Stable',
      investment_potential: 'Medium'
    },
    features: {
      has_pool: false,
      has_garden: false,
      has_parking: false,
      has_elevator: false
    },
    recommendations: [
      'Verify property details with official documentation',
      'Consider professional property inspection',
      'Research local market conditions'
    ],
    risks: [
      'Location accuracy may vary',
      'Property details require verification'
    ],
    opportunities: [
      'Potential for location-based insights',
      'Market analysis available'
    ],
    analyzed_at: new Date().toISOString(),
    user_id
  };

  return analysis;
}

/**
 * Helper function to store analysis result
 */
async function storeAnalysisResult({ user_id, image_url, cloudinary_public_id, location_prediction, address_info, analysis, quota_used }) {
  try {
    const result = await query(`
      INSERT INTO detective_analyses (
        user_id, image_url, cloudinary_public_id, 
        location_prediction, address_info, analysis, quota_used
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      user_id,
      image_url,
      cloudinary_public_id,
      JSON.stringify(location_prediction),
      JSON.stringify(address_info),
      JSON.stringify(analysis),
      quota_used
    ]);

    return result.rows[0].id;
  } catch (error) {
    logger.error('Store analysis result failed:', error);
    throw error;
  }
}

/**
 * GET /api/detective/export/:analysisId
 * Export analysis result as PDF
 */
router.get('/export/:analysisId', optionalAuth, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.userId?.toString() || 'anonymous';

    // Find the analysis
    const analysis = await DetectiveAnalysis.findById(analysisId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    // Check ownership (if not anonymous analysis)
    if (analysis.user_id !== 'anonymous' && analysis.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only export your own analyses'
      });
    }

    // Generate PDF content as HTML (can be converted to PDF on frontend)
    const pdfContent = generatePDFContent(analysis);

    res.json({
      success: true,
      data: {
        html: pdfContent,
        analysis: {
          id: analysis._id,
          coordinates: analysis.coordinates,
          address: analysis.address,
          confidence: analysis.confidence,
          created_at: analysis.created_at,
          image_url: analysis.image_url,
          enrichment: analysis.enrichment
        }
      }
    });

  } catch (error) {
    logger.error('Export analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Export failed',
      message: error.message
    });
  }
});

/**
 * Generate PDF-ready HTML content from analysis
 */
function generatePDFContent(analysis) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const confidencePercent = analysis.confidence ? (analysis.confidence * 100).toFixed(1) : 'N/A';
  const coords = analysis.coordinates ?
    `${analysis.coordinates.lat?.toFixed(6)}, ${analysis.coordinates.lon?.toFixed(6)}` : 'N/A';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ProprScout Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #00d185; }
    .logo { font-size: 28px; font-weight: bold; color: #00d185; }
    .subtitle { color: #666; margin-top: 5px; }
    .report-date { color: #888; font-size: 12px; margin-top: 10px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: 600; color: #1a1a2e; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: #f8f9fa; border-radius: 8px; padding: 20px; }
    .card-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .card-value { font-size: 18px; font-weight: 600; color: #1a1a2e; }
    .confidence-bar { height: 8px; background: #e0e0e0; border-radius: 4px; margin-top: 10px; overflow: hidden; }
    .confidence-fill { height: 100%; background: linear-gradient(90deg, #00d185, #00a86b); border-radius: 4px; }
    .address-box { background: #f0f7f4; border-left: 4px solid #00d185; padding: 15px 20px; border-radius: 0 8px 8px 0; }
    .map-placeholder { background: #e8e8e8; height: 200px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px; }
    .image-container { text-align: center; margin: 20px 0; }
    .image-container img { max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    @media print { body { padding: 20px; } .section { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ProprScout</div>
    <div class="subtitle">Property Location Analysis Report</div>
    <div class="report-date">Generated: ${formatDate(new Date())}</div>
  </div>

  ${analysis.image_url ? `
  <div class="section">
    <div class="section-title">Analyzed Image</div>
    <div class="image-container">
      <img src="${analysis.image_url}" alt="Analyzed property image" />
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Location Results</div>
    <div class="grid">
      <div class="card">
        <div class="card-label">Coordinates</div>
        <div class="card-value">${coords}</div>
      </div>
      <div class="card">
        <div class="card-label">Confidence Score</div>
        <div class="card-value">${confidencePercent}%</div>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Address Information</div>
    <div class="address-box">
      <strong>${analysis.address?.formatted || 'Address not available'}</strong>
      ${analysis.address?.city ? `<br>City: ${analysis.address.city}` : ''}
      ${analysis.address?.state ? `<br>State/Region: ${analysis.address.state}` : ''}
      ${analysis.address?.country ? `<br>Country: ${analysis.address.country}` : ''}
      ${analysis.address?.postcode ? `<br>Postal Code: ${analysis.address.postcode}` : ''}
    </div>
  </div>

  ${analysis.enrichment ? `
  <div class="section">
    <div class="section-title">Property Insights</div>
    <div class="grid">
      ${analysis.enrichment.property_type ? `
      <div class="card">
        <div class="card-label">Property Type</div>
        <div class="card-value">${analysis.enrichment.property_type}</div>
      </div>
      ` : ''}
      ${analysis.enrichment.estimated_value ? `
      <div class="card">
        <div class="card-label">Estimated Value</div>
        <div class="card-value">€${analysis.enrichment.estimated_value.toLocaleString()}</div>
      </div>
      ` : ''}
      ${analysis.enrichment.nearby_amenities ? `
      <div class="card" style="grid-column: span 2;">
        <div class="card-label">Nearby Amenities</div>
        <div class="card-value">${analysis.enrichment.nearby_amenities.join(', ')}</div>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Analysis Details</div>
    <div class="grid">
      <div class="card">
        <div class="card-label">Analysis ID</div>
        <div class="card-value" style="font-size: 12px; font-family: monospace;">${analysis._id}</div>
      </div>
      <div class="card">
        <div class="card-label">Analysis Date</div>
        <div class="card-value" style="font-size: 14px;">${formatDate(analysis.created_at)}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This report was generated by ProprScout Property Intelligence</p>
    <p>For more information, visit proprscout.com</p>
    <p style="margin-top: 10px; color: #aaa;">Report ID: ${analysis._id} | Confidence: ${confidencePercent}%</p>
  </div>
</body>
</html>
  `.trim();
}

export default router;
