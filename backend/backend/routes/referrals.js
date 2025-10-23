/**
 * Referral API routes
 * Track referrals and manage bonus analyses
 */

import express from 'express';
import User from '../models/User.js';
import DetectiveAnalysis from '../models/DetectiveAnalysis.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/referrals/stats
 * Get user's referral statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { user_id = 'anonymous' } = req.query;
    
    // Get user's referral count
    const user = await User.findById(user_id);
    if (!user) {
      return res.json({
        success: true,
        data: {
          referralCount: 0,
          bonusAnalyses: 0,
          progressToPro: 0,
          referralsRemaining: 5
        }
      });
    }

    // Calculate referral stats
    const referralCount = user.usage.referral_count || 0;
    const bonusAnalyses = user.usage.bonus_analyses || 0;
    const progressToPro = Math.min(100, (referralCount / 5) * 100);
    const referralsRemaining = Math.max(0, 5 - referralCount);

    res.json({
      success: true,
      data: {
        referralCount,
        bonusAnalyses,
        progressToPro,
        referralsRemaining,
        nextReward: referralsRemaining > 0 ? `${5 - referralCount} more referrals for free Pro month` : 'Free Pro month unlocked!'
      }
    });

  } catch (error) {
    logger.error('Get referral stats failed:', error);
    res.status(500).json({
      error: 'Get referral stats failed',
      message: error.message
    });
  }
});

/**
 * POST /api/referrals/track
 * Track a successful referral
 */
router.post('/track', async (req, res) => {
  try {
    const { referrer_id, referee_id, referral_code } = req.body;
    
    if (!referrer_id || !referee_id || !referral_code) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'referrer_id, referee_id, and referral_code are required'
      });
    }

    // Verify referral code
    const expectedCode = Buffer.from(referrer_id).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    if (referral_code !== expectedCode) {
      return res.status(400).json({
        error: 'Invalid referral code',
        message: 'The referral code is invalid'
      });
    }

    // Update referrer's stats
    const referrer = await User.findById(referrer_id);
    if (referrer) {
      referrer.usage.referral_count = (referrer.usage.referral_count || 0) + 1;
      referrer.usage.bonus_analyses = (referrer.usage.bonus_analyses || 0) + 1;
      
      // Check if they've reached 5 referrals for free Pro month
      if (referrer.usage.referral_count >= 5 && referrer.subscription.type === 'free') {
        referrer.subscription.type = 'pro';
        referrer.subscription.plan = 'monthly';
        referrer.subscription.started_at = new Date();
        referrer.subscription.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        referrer.subscription.status = 'active';
      }
      
      await referrer.save();
    }

    // Update referee's stats (bonus analysis)
    const referee = await User.findById(referee_id);
    if (referee) {
      referee.usage.bonus_analyses = (referee.usage.bonus_analyses || 0) + 1;
      await referee.save();
    }

    logger.info(`Referral tracked: ${referrer_id} -> ${referee_id}`);

    res.json({
      success: true,
      data: {
        referrerBonus: 1,
        refereeBonus: 1,
        freeProUnlocked: referrer?.usage.referral_count >= 5
      }
    });

  } catch (error) {
    logger.error('Track referral failed:', error);
    res.status(500).json({
      error: 'Track referral failed',
      message: error.message
    });
  }
});

/**
 * GET /api/referrals/leaderboard
 * Get referral leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await User.aggregate([
      {
        $match: {
          'usage.referral_count': { $gt: 0 }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          'usage.referral_count': 1,
          'usage.bonus_analyses': 1,
          subscription: 1
        }
      },
      {
        $sort: { 'usage.referral_count': -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: {
        leaderboard,
        totalReferrers: leaderboard.length
      }
    });

  } catch (error) {
    logger.error('Get leaderboard failed:', error);
    res.status(500).json({
      error: 'Get leaderboard failed',
      message: error.message
    });
  }
});

/**
 * GET /api/referrals/validate
 * Validate a referral code
 */
router.get('/validate', async (req, res) => {
  try {
    const { referral_code } = req.query;
    
    if (!referral_code) {
      return res.status(400).json({
        error: 'Missing referral code',
        message: 'referral_code is required'
      });
    }

    // Decode referral code to get user ID
    try {
      const userId = Buffer.from(referral_code, 'base64').toString('utf-8');
      const user = await User.findById(userId);
      
      if (!user) {
        return res.json({
          success: true,
          data: {
            valid: false,
            message: 'Invalid referral code'
          }
        });
      }

      res.json({
        success: true,
        data: {
          valid: true,
          referrer: {
            name: user.name,
            email: user.email
          },
          message: `Referred by ${user.name}`
        }
      });

    } catch (decodeError) {
      res.json({
        success: true,
        data: {
          valid: false,
          message: 'Invalid referral code format'
        }
      });
    }

  } catch (error) {
    logger.error('Validate referral code failed:', error);
    res.status(500).json({
      error: 'Validate referral code failed',
      message: error.message
    });
  }
});

export default router;
