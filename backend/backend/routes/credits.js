/**
 * Credits API routes
 */

import express from 'express';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/credits
 * Get user credits with recharge date
 */
router.get('/', async (req, res) => {
  try {
    const { user_id = 'anonymous' } = req.query;

    // For anonymous users, return default credits (no database lookup needed)
    if (user_id === 'anonymous') {
      // Return default anonymous user credits
      const nextRechargeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      res.json({
        success: true,
        data: {
          balance: 15,
          totalEarned: 15,
          totalSpent: 0,
          nextRechargeDate: nextRechargeDate.toISOString(),
          lastRechargeDate: null
        }
      });
      return;
    }

    // For authenticated users, look up from database
    {
      const user = await User.findById(user_id);
      if (!user) {
        return res.json({
          success: true,
          data: {
            balance: 15,
            totalEarned: 15,
            totalSpent: 0,
            nextRechargeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastRechargeDate: null
          }
        });
      }
      
      // Check and recharge credits
      const wasRecharged = user.checkAndRechargeCredits();
      if (wasRecharged) {
        await user.save();
      }
      
      const nextRechargeDate = user.getNextRechargeDate();
      
      res.json({
        success: true,
        data: {
          balance: user.credits.balance,
          totalEarned: user.credits.total_earned,
          totalSpent: user.credits.total_spent,
          nextRechargeDate: nextRechargeDate.toISOString(),
          lastRechargeDate: user.credits.last_recharge_date?.toISOString() || null
        }
      });
    }
    
  } catch (error) {
    logger.error('Get credits failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credits',
      message: error.message
    });
  }
});

export default router;

