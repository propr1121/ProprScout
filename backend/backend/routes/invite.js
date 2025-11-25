/**
 * Public Invite Code Routes
 * Handles invite code validation before signup
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import InviteCode from '../models/InviteCode.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/invite/validate
 * Validate an invite code (public endpoint - no auth required)
 */
router.post('/validate', [
  body('code').trim().notEmpty().withMessage('Invite code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code } = req.body;
    const inviteCode = await InviteCode.findValidCode(code);

    if (!inviteCode) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid or expired invite code'
      });
    }

    res.json({
      success: true,
      valid: true,
      data: {
        type: inviteCode.type,
        bonusCredits: inviteCode.bonusCredits,
        grantsTier: inviteCode.grantsTier,
        remainingUses: inviteCode.maxUses - inviteCode.currentUses
      }
    });

  } catch (error) {
    logger.error('Validate invite code error:', error);
    res.status(500).json({
      success: false,
      valid: false,
      error: 'Failed to validate invite code',
      message: error.message
    });
  }
});

/**
 * GET /api/invite/check/:code
 * Quick check if code is valid (GET for convenience)
 */
router.get('/check/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.length < 4) {
      return res.json({
        success: false,
        valid: false,
        message: 'Invalid code format'
      });
    }

    const inviteCode = await InviteCode.findValidCode(code);

    res.json({
      success: true,
      valid: !!inviteCode,
      message: inviteCode ? 'Code is valid' : 'Invalid or expired invite code'
    });

  } catch (error) {
    logger.error('Check invite code error:', error);
    res.status(500).json({
      success: false,
      valid: false,
      error: 'Failed to check invite code'
    });
  }
});

export default router;
