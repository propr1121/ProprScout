/**
 * External Integrations API Routes
 * Handles HubSpot and other third-party integrations
 * Secured with API key authentication (not user JWT)
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import InviteCode from '../models/InviteCode.js';
import logger from '../utils/logger.js';

const router = express.Router();

// API Key from environment
const INTEGRATION_API_KEY = process.env.INTEGRATION_API_KEY;

/**
 * Middleware: Verify API Key
 * Checks X-API-Key header for valid integration key
 */
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!INTEGRATION_API_KEY) {
    logger.error('INTEGRATION_API_KEY not configured in environment');
    return res.status(500).json({
      success: false,
      error: 'Integration API not configured'
    });
  }

  if (!apiKey || apiKey !== INTEGRATION_API_KEY) {
    logger.warn('Invalid API key attempt', { ip: req.ip });
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

// ============================================
// Public Endpoints (no auth required)
// ============================================

/**
 * GET /api/integrations/health
 * Health check endpoint to verify integration is working
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'ProprScout Integrations API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// Protected Endpoints (API key required)
// ============================================

// Apply API key verification to all routes below
router.use(verifyApiKey);

// ============================================
// HubSpot Integration Endpoints
// ============================================

/**
 * POST /api/integrations/hubspot/invite-code
 *
 * Creates a new invite code for a Circle community member.
 * Called by HubSpot workflow when someone joins Circle.
 *
 * Request Body:
 * {
 *   "email": "user@example.com",        // Required: User's email
 *   "name": "John Doe",                 // Optional: User's name
 *   "hubspot_contact_id": "123456",     // Optional: HubSpot contact ID for tracking
 *   "source": "circle"                  // Optional: Source identifier (default: "circle-hubspot")
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "code": "H7XK3NP2",
 *     "bonusCredits": 5,
 *     "expiresAt": null,
 *     "signupUrl": "https://proprscout.com/signup?code=H7XK3NP2"
 *   }
 * }
 */
router.post('/hubspot/invite-code', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').optional().trim(),
  body('hubspot_contact_id').optional().trim(),
  body('source').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, name, hubspot_contact_id, source = 'circle-hubspot' } = req.body;

    // Check if this email already has an unused invite code
    const existingCode = await InviteCode.findOne({
      'metadata.email': email.toLowerCase(),
      currentUses: 0,
      isActive: true
    });

    if (existingCode) {
      // Return existing unused code
      logger.info(`Returning existing invite code for ${email}: ${existingCode.code}`);

      const frontendUrl = process.env.FRONTEND_URL || 'https://proprscout.com';

      return res.json({
        success: true,
        data: {
          code: existingCode.code,
          bonusCredits: existingCode.bonusCredits,
          expiresAt: existingCode.expiresAt,
          signupUrl: `${frontendUrl}/signup?code=${existingCode.code}`,
          isExisting: true
        }
      });
    }

    // Create new invite code
    const inviteCode = await InviteCode.createCode({
      name: name ? `Circle: ${name}` : 'Circle Community Member',
      description: `Auto-generated for ${email} via HubSpot`,
      maxUses: 1,
      bonusCredits: 5,
      type: 'beta',
      grantsTier: null,
      expiresAt: null, // No expiration for Circle codes
      customCode: null // Auto-generate
    });

    // Store metadata for tracking (add to the code document)
    inviteCode.metadata = {
      email: email.toLowerCase(),
      name: name || null,
      hubspot_contact_id: hubspot_contact_id || null,
      source: source,
      created_via: 'hubspot-integration'
    };
    await inviteCode.save();

    logger.info(`Created invite code for ${email}: ${inviteCode.code}`, {
      hubspot_contact_id,
      source
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://proprscout.com';

    res.status(201).json({
      success: true,
      data: {
        code: inviteCode.code,
        bonusCredits: inviteCode.bonusCredits,
        expiresAt: inviteCode.expiresAt,
        signupUrl: `${frontendUrl}/signup?code=${inviteCode.code}`,
        isExisting: false
      }
    });

  } catch (error) {
    logger.error('HubSpot invite code creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invite code',
      message: error.message
    });
  }
});

/**
 * GET /api/integrations/hubspot/invite-code/:email
 *
 * Look up an existing invite code by email.
 * Useful for HubSpot to check if a code already exists.
 */
router.get('/hubspot/invite-code/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();

    const inviteCode = await InviteCode.findOne({
      'metadata.email': email,
      isActive: true
    }).sort({ created_at: -1 }); // Get most recent

    if (!inviteCode) {
      return res.status(404).json({
        success: false,
        error: 'No invite code found for this email'
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://proprscout.com';

    res.json({
      success: true,
      data: {
        code: inviteCode.code,
        bonusCredits: inviteCode.bonusCredits,
        expiresAt: inviteCode.expiresAt,
        isUsed: inviteCode.currentUses >= inviteCode.maxUses,
        usedAt: inviteCode.usedBy?.[0]?.usedAt || null,
        signupUrl: `${frontendUrl}/signup?code=${inviteCode.code}`
      }
    });

  } catch (error) {
    logger.error('HubSpot invite code lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup invite code',
      message: error.message
    });
  }
});

/**
 * POST /api/integrations/hubspot/bulk-invite-codes
 *
 * Create multiple invite codes at once.
 * Useful for batch imports or campaigns.
 *
 * Request Body:
 * {
 *   "contacts": [
 *     { "email": "user1@example.com", "name": "User 1", "hubspot_contact_id": "123" },
 *     { "email": "user2@example.com", "name": "User 2", "hubspot_contact_id": "456" }
 *   ],
 *   "source": "circle-batch"
 * }
 */
router.post('/hubspot/bulk-invite-codes', [
  body('contacts').isArray({ min: 1, max: 100 }).withMessage('Contacts array required (max 100)'),
  body('contacts.*.email').isEmail().withMessage('Valid email required for each contact'),
  body('contacts.*.name').optional().trim(),
  body('contacts.*.hubspot_contact_id').optional().trim(),
  body('source').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { contacts, source = 'circle-hubspot-batch' } = req.body;
    const results = [];
    const frontendUrl = process.env.FRONTEND_URL || 'https://proprscout.com';

    for (const contact of contacts) {
      try {
        const email = contact.email.toLowerCase();

        // Check for existing code
        let inviteCode = await InviteCode.findOne({
          'metadata.email': email,
          currentUses: 0,
          isActive: true
        });

        let isExisting = false;

        if (!inviteCode) {
          // Create new code
          inviteCode = await InviteCode.createCode({
            name: contact.name ? `Circle: ${contact.name}` : 'Circle Community Member',
            description: `Auto-generated for ${email} via HubSpot batch`,
            maxUses: 1,
            bonusCredits: 5,
            type: 'beta'
          });

          inviteCode.metadata = {
            email: email,
            name: contact.name || null,
            hubspot_contact_id: contact.hubspot_contact_id || null,
            source: source,
            created_via: 'hubspot-integration-batch'
          };
          await inviteCode.save();
        } else {
          isExisting = true;
        }

        results.push({
          email: email,
          success: true,
          code: inviteCode.code,
          signupUrl: `${frontendUrl}/signup?code=${inviteCode.code}`,
          isExisting
        });

      } catch (contactError) {
        results.push({
          email: contact.email,
          success: false,
          error: contactError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.info(`Bulk invite code creation: ${successCount}/${contacts.length} successful`, { source });

    res.status(201).json({
      success: true,
      data: {
        total: contacts.length,
        created: successCount,
        failed: contacts.length - successCount,
        results
      }
    });

  } catch (error) {
    logger.error('HubSpot bulk invite code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invite codes',
      message: error.message
    });
  }
});

export default router;
