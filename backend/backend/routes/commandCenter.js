/**
 * Command Center API Routes
 * Endpoints for the central command center to manage credits and sync users
 */

import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { getServiceKey, emitCreditsPurchased, emitCreditsUsed } from '../services/commandCenter.js';

const router = express.Router();

// ============================================================================
// MIDDLEWARE - Service Key Validation
// ============================================================================

/**
 * Validate X-Service-Key header using timing-safe comparison
 */
function validateServiceKey(req, res, next) {
  const providedKey = req.headers['x-service-key'];
  const validKey = getServiceKey();

  if (!providedKey || !validKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing service key',
    });
  }

  try {
    const keyBuffer = Buffer.from(providedKey);
    const validBuffer = Buffer.from(validKey);

    if (keyBuffer.length !== validBuffer.length) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid service key',
      });
    }

    if (!crypto.timingSafeEqual(keyBuffer, validBuffer)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid service key',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid service key',
    });
  }
}

// ============================================================================
// HEALTH CHECK (No Auth)
// ============================================================================

/**
 * GET /api/command-center/health
 * Health check endpoint - no authentication required
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'proprscout-credits-api',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// GET BALANCE
// ============================================================================

/**
 * GET /api/command-center/credits/:userId
 * Get user's credits balance by user ID
 */
router.get('/credits/:userId', validateServiceKey, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('email credits updatedAt');

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: `User not found: ${userId}`,
      });
    }

    res.json({
      userId: user._id.toString(),
      email: user.email,
      balance: user.credits?.balance || 0,
      totalEarned: user.credits?.total_earned || 0,
      totalSpent: user.credits?.total_spent || 0,
      lastUpdated: user.updatedAt || null,
    });
  } catch (error) {
    logger.error('Get credits balance failed:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error.message,
    });
  }
});

/**
 * GET /api/command-center/credits/by-email/:email
 * Get user's credits balance by email
 */
router.get('/credits/by-email/:email', validateServiceKey, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();

    const user = await User.findOne({ email }).select('email credits updatedAt');

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: `User not found: ${email}`,
      });
    }

    res.json({
      userId: user._id.toString(),
      email: user.email,
      balance: user.credits?.balance || 0,
      totalEarned: user.credits?.total_earned || 0,
      totalSpent: user.credits?.total_spent || 0,
      lastUpdated: user.updatedAt || null,
    });
  } catch (error) {
    logger.error('Get credits by email failed:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error.message,
    });
  }
});

// ============================================================================
// GET HISTORY
// ============================================================================

/**
 * GET /api/command-center/credits/:userId/history
 * Get user's credit transaction history
 * Note: ProprScout doesn't have a separate transactions table,
 * so we return usage data from the user model
 */
router.get('/credits/:userId/history', validateServiceKey, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);

    const user = await User.findById(userId).select('email credits usage created_at');

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: `User not found: ${userId}`,
      });
    }

    // Build simplified history from user data
    // Note: For full transaction history, you'd need a CreditTransaction model
    const transactions = [];

    // Initial credit allocation
    if (user.credits?.total_earned > 0) {
      transactions.push({
        id: `initial_${user._id}`,
        amount: 15, // Initial credits
        type: 'bonus',
        description: 'Welcome bonus credits',
        createdAt: user.created_at,
      });
    }

    // Monthly recharge (if any)
    if (user.credits?.last_recharge_date) {
      transactions.push({
        id: `recharge_${user._id}_${user.credits.last_recharge_date.getTime()}`,
        amount: 15,
        type: 'bonus',
        description: 'Monthly credit recharge',
        createdAt: user.credits.last_recharge_date,
      });
    }

    // Usage (approximate from total_spent)
    if (user.credits?.total_spent > 0) {
      const analysisCount = Math.floor(user.credits.total_spent / 5);
      for (let i = 0; i < Math.min(analysisCount, limit); i++) {
        transactions.push({
          id: `usage_${user._id}_${i}`,
          amount: -5,
          type: 'usage',
          description: 'Property analysis',
          createdAt: user.usage?.last_analysis_at || new Date(),
        });
      }
    }

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + limit);

    res.json({
      userId: user._id.toString(),
      transactions: paginatedTransactions,
      total: transactions.length,
      page,
      limit,
    });
  } catch (error) {
    logger.error('Get credits history failed:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error.message,
    });
  }
});

// ============================================================================
// ALLOCATE / DEDUCT CREDITS
// ============================================================================

/**
 * POST /api/command-center/credits/:userId/allocate
 * Add bonus credits to a user (from Command Center)
 */
router.post('/credits/:userId/allocate', validateServiceKey, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason, source, referenceId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Amount must be a positive number',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: `User not found: ${userId}`,
      });
    }

    const currentBalance = user.credits?.balance || 0;
    const newBalance = currentBalance + amount;

    // Update user credits
    user.credits.balance = newBalance;
    user.credits.total_earned = (user.credits.total_earned || 0) + amount;
    await user.save();

    logger.info(`Credits allocated: ${amount} to user ${userId}. New balance: ${newBalance}`);

    // Emit webhook to Command Center
    await emitCreditsPurchased({
      userId: user._id.toString(),
      email: user.email,
      creditsAdded: amount,
      newBalance,
      transactionId: referenceId || `alloc_${Date.now()}`,
      paymentMethod: source || 'command_center',
    });

    res.json({
      success: true,
      transactionId: referenceId || `alloc_${Date.now()}`,
      previousBalance: currentBalance,
      newBalance,
      reason,
    });
  } catch (error) {
    logger.error('Allocate credits failed:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error.message,
    });
  }
});

/**
 * POST /api/command-center/credits/:userId/deduct
 * Deduct credits from a user
 */
router.post('/credits/:userId/deduct', validateServiceKey, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Amount must be a positive number',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: `User not found: ${userId}`,
      });
    }

    const currentBalance = user.credits?.balance || 0;

    if (currentBalance < amount) {
      return res.status(400).json({
        error: 'Insufficient credits',
        message: `User has ${currentBalance} credits, cannot deduct ${amount}`,
      });
    }

    const newBalance = currentBalance - amount;

    // Update user credits
    user.credits.balance = newBalance;
    user.credits.total_spent = (user.credits.total_spent || 0) + amount;
    await user.save();

    logger.info(`Credits deducted: ${amount} from user ${userId}. New balance: ${newBalance}`);

    // Emit webhook
    await emitCreditsUsed({
      userId: user._id.toString(),
      email: user.email,
      creditsUsed: amount,
      remainingBalance: newBalance,
    });

    res.json({
      success: true,
      transactionId: `deduct_${Date.now()}`,
      previousBalance: currentBalance,
      newBalance,
      reason,
    });
  } catch (error) {
    logger.error('Deduct credits failed:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error.message,
    });
  }
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * POST /api/command-center/credits/bulk/balances
 * Get balances for multiple users (max 100)
 */
router.post('/credits/bulk/balances', validateServiceKey, async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'userIds must be an array',
      });
    }

    if (userIds.length > 100) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Maximum 100 userIds allowed',
      });
    }

    const results = [];

    for (const userId of userIds) {
      try {
        const user = await User.findById(userId).select('email credits updatedAt');
        if (user) {
          results.push({
            userId: user._id.toString(),
            email: user.email,
            balance: user.credits?.balance || 0,
            lastUpdated: user.updatedAt || null,
          });
        }
      } catch (error) {
        logger.warn(`Failed to get balance for ${userId}`);
      }
    }

    res.json({
      success: true,
      results,
      requested: userIds.length,
      found: results.length,
    });
  } catch (error) {
    logger.error('Bulk balances failed:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error.message,
    });
  }
});

// ============================================================================
// USER LOOKUP
// ============================================================================

/**
 * GET /api/command-center/users/:userId
 * Get full user details for Command Center
 */
router.get('/users/:userId', validateServiceKey, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: `User not found: ${userId}`,
      });
    }

    res.json({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      authProvider: user.authProvider,
      inviteCode: user.inviteCode,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      subscription: user.subscription,
      credits: user.credits,
      usage: user.usage,
      createdAt: user.created_at,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    logger.error('Get user failed:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error.message,
    });
  }
});

/**
 * GET /api/command-center/users/by-email/:email
 * Get user by email for Command Center
 */
router.get('/users/by-email/:email', validateServiceKey, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();

    const user = await User.findOne({ email }).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: `User not found: ${email}`,
      });
    }

    res.json({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      authProvider: user.authProvider,
      inviteCode: user.inviteCode,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      subscription: user.subscription,
      credits: user.credits,
      usage: user.usage,
      createdAt: user.created_at,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    logger.error('Get user by email failed:', error);
    res.status(500).json({
      error: 'Internal error',
      message: error.message,
    });
  }
});

export default router;
