/**
 * Admin API Routes
 * Handles user management, invite codes, and platform statistics
 */

import express from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User.js';
import InviteCode from '../models/InviteCode.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(requireAuth);
router.use(requireAdmin);

// ============================================
// Dashboard Statistics
// ============================================

/**
 * GET /api/admin/stats
 * Get platform-wide statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersToday = await User.countDocuments({
      created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const newUsersThisWeek = await User.countDocuments({
      created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const newUsersThisMonth = await User.countDocuments({
      created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Auth provider breakdown
    const authProviderStats = await User.aggregate([
      { $group: { _id: '$authProvider', count: { $sum: 1 } } }
    ]);

    // Subscription breakdown
    const subscriptionStats = await User.aggregate([
      { $group: { _id: '$subscription.type', count: { $sum: 1 } } }
    ]);

    // Credits stats
    const creditsStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$credits.balance' },
          totalEarned: { $sum: '$credits.total_earned' },
          totalSpent: { $sum: '$credits.total_spent' }
        }
      }
    ]);

    // Analysis stats
    const analysisStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: '$usage.total_analyses' },
          monthlyAnalyses: { $sum: '$usage.detective_analyses_this_month' }
        }
      }
    ]);

    // Invite code stats
    const inviteCodeStats = await InviteCode.getStats();

    // Recent signups (last 7 days by day)
    const recentSignups = await User.aggregate([
      {
        $match: {
          created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth
        },
        authProviders: authProviderStats.reduce((acc, item) => {
          acc[item._id || 'local'] = item.count;
          return acc;
        }, {}),
        subscriptions: subscriptionStats.reduce((acc, item) => {
          acc[item._id || 'free'] = item.count;
          return acc;
        }, {}),
        credits: creditsStats[0] || { totalBalance: 0, totalEarned: 0, totalSpent: 0 },
        analyses: analysisStats[0] || { totalAnalyses: 0, monthlyAnalyses: 0 },
        inviteCodes: inviteCodeStats,
        recentSignups
      }
    });

  } catch (error) {
    logger.error('Admin stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// ============================================
// User Management
// ============================================

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim(),
  query('status').optional().isIn(['all', 'active', 'inactive']),
  query('subscription').optional(),
  query('sortBy').optional().isIn(['created_at', 'lastLoginAt', 'name', 'email', 'credits.balance']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      subscription = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (subscription) {
      query['subscription.type'] = subscription;
    }

    // Build sort
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider,
          subscription: user.subscription,
          credits: user.credits,
          usage: user.usage,
          isActive: user.isActive,
          isAdmin: user.isAdmin,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.created_at,
          inviteCode: user.inviteCode
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Admin users list error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('invitedBy', 'name email');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    logger.error('Admin get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update user details
 */
router.put('/users/:id', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('isActive').optional().isBoolean(),
  body('isAdmin').optional().isBoolean(),
  body('subscription.type').optional().isIn(['free', 'pro', 'annual'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const { name, isActive, isAdmin, subscription } = req.body;

    if (name) user.name = name;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
    if (subscription?.type) user.subscription.type = subscription.type;

    await user.save();

    logger.info(`Admin updated user: ${user.email}`, { adminId: req.user._id });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    logger.error('Admin update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/users/:id/credits
 * Add or remove credits from user
 */
router.post('/users/:id/credits', [
  body('amount').isInt().withMessage('Amount must be an integer'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const { amount, reason } = req.body;

    // Update credits
    user.credits.balance += amount;
    if (amount > 0) {
      user.credits.total_earned += amount;
    }

    // Ensure balance doesn't go negative
    if (user.credits.balance < 0) {
      user.credits.balance = 0;
    }

    await user.save();

    logger.info(`Admin modified credits for ${user.email}: ${amount > 0 ? '+' : ''}${amount}`, {
      adminId: req.user._id,
      reason
    });

    res.json({
      success: true,
      message: `Credits ${amount > 0 ? 'added' : 'removed'} successfully`,
      data: {
        userId: user._id,
        newBalance: user.credits.balance,
        amountChanged: amount
      }
    });

  } catch (error) {
    logger.error('Admin credits error:', error);
    res.status(500).json({
      error: 'Failed to modify credits',
      message: error.message
    });
  }
});

// ============================================
// Invite Code Management
// ============================================

/**
 * GET /api/admin/invite-codes
 * Get all invite codes
 */
router.get('/invite-codes', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['all', 'active', 'inactive', 'expired', 'used']),
  query('type').optional()
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      type = ''
    } = req.query;

    // Build query
    const query = {};

    if (status === 'active') {
      query.isActive = true;
      query.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];
      query.$expr = { $lt: ['$currentUses', '$maxUses'] };
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.expiresAt = { $lt: new Date() };
    } else if (status === 'used') {
      query.$expr = { $gte: ['$currentUses', '$maxUses'] };
    }

    if (type) {
      query.type = type;
    }

    const total = await InviteCode.countDocuments(query);
    const codes = await InviteCode.find(query)
      .populate('createdBy', 'name email')
      .populate('usedBy.user', 'name email')
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: {
        codes: codes.map(code => ({
          id: code._id,
          code: code.code,
          name: code.name,
          description: code.description,
          type: code.type,
          maxUses: code.maxUses,
          currentUses: code.currentUses,
          bonusCredits: code.bonusCredits,
          grantsTier: code.grantsTier,
          isActive: code.isActive,
          expiresAt: code.expiresAt,
          createdBy: code.createdBy,
          usedBy: code.usedBy,
          createdAt: code.created_at
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Admin invite codes list error:', error);
    res.status(500).json({
      error: 'Failed to fetch invite codes',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/invite-codes
 * Create new invite code
 */
router.post('/invite-codes', [
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('code').optional().trim().isLength({ min: 4, max: 20 }),
  body('maxUses').optional().isInt({ min: 1 }).toInt(),
  body('bonusCredits').optional().isInt({ min: 0 }).toInt(),
  body('type').optional().isIn(['beta', 'partner', 'founder', 'promo', 'referral']),
  body('grantsTier').optional().isIn(['free', 'pro', 'annual', null]),
  body('expiresAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      name,
      description,
      code: customCode,
      maxUses = 1,
      bonusCredits = 5,
      type = 'beta',
      grantsTier = null,
      expiresAt = null
    } = req.body;

    const inviteCode = await InviteCode.createCode({
      name,
      description,
      customCode,
      maxUses,
      bonusCredits,
      type,
      grantsTier,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id
    });

    logger.info(`Admin created invite code: ${inviteCode.code}`, { adminId: req.user._id });

    res.status(201).json({
      success: true,
      message: 'Invite code created successfully',
      data: { inviteCode }
    });

  } catch (error) {
    logger.error('Admin create invite code error:', error);
    res.status(500).json({
      error: 'Failed to create invite code',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/invite-codes/bulk
 * Create multiple invite codes at once
 */
router.post('/invite-codes/bulk', [
  body('count').isInt({ min: 1, max: 100 }).toInt(),
  body('name').optional().trim(),
  body('maxUses').optional().isInt({ min: 1 }).toInt(),
  body('bonusCredits').optional().isInt({ min: 0 }).toInt(),
  body('type').optional().isIn(['beta', 'partner', 'founder', 'promo', 'referral']),
  body('expiresAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      count,
      name,
      maxUses = 1,
      bonusCredits = 5,
      type = 'beta',
      expiresAt = null
    } = req.body;

    const codes = [];
    for (let i = 0; i < count; i++) {
      const inviteCode = await InviteCode.createCode({
        name: name ? `${name} #${i + 1}` : null,
        maxUses,
        bonusCredits,
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user._id
      });
      codes.push(inviteCode);
    }

    logger.info(`Admin created ${count} invite codes`, { adminId: req.user._id });

    res.status(201).json({
      success: true,
      message: `${count} invite codes created successfully`,
      data: { codes }
    });

  } catch (error) {
    logger.error('Admin bulk create invite codes error:', error);
    res.status(500).json({
      error: 'Failed to create invite codes',
      message: error.message
    });
  }
});

/**
 * PUT /api/admin/invite-codes/:id
 * Update invite code
 */
router.put('/invite-codes/:id', [
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('maxUses').optional().isInt({ min: 1 }).toInt(),
  body('bonusCredits').optional().isInt({ min: 0 }).toInt(),
  body('expiresAt').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const inviteCode = await InviteCode.findById(req.params.id);
    if (!inviteCode) {
      return res.status(404).json({
        error: 'Invite code not found'
      });
    }

    const { name, description, isActive, maxUses, bonusCredits, expiresAt } = req.body;

    if (name !== undefined) inviteCode.name = name;
    if (description !== undefined) inviteCode.description = description;
    if (typeof isActive === 'boolean') inviteCode.isActive = isActive;
    if (maxUses) inviteCode.maxUses = maxUses;
    if (bonusCredits !== undefined) inviteCode.bonusCredits = bonusCredits;
    if (expiresAt !== undefined) {
      inviteCode.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    await inviteCode.save();

    logger.info(`Admin updated invite code: ${inviteCode.code}`, { adminId: req.user._id });

    res.json({
      success: true,
      message: 'Invite code updated successfully',
      data: { inviteCode }
    });

  } catch (error) {
    logger.error('Admin update invite code error:', error);
    res.status(500).json({
      error: 'Failed to update invite code',
      message: error.message
    });
  }
});

/**
 * DELETE /api/admin/invite-codes/:id
 * Delete invite code
 */
router.delete('/invite-codes/:id', async (req, res) => {
  try {
    const inviteCode = await InviteCode.findById(req.params.id);
    if (!inviteCode) {
      return res.status(404).json({
        error: 'Invite code not found'
      });
    }

    await inviteCode.deleteOne();

    logger.info(`Admin deleted invite code: ${inviteCode.code}`, { adminId: req.user._id });

    res.json({
      success: true,
      message: 'Invite code deleted successfully'
    });

  } catch (error) {
    logger.error('Admin delete invite code error:', error);
    res.status(500).json({
      error: 'Failed to delete invite code',
      message: error.message
    });
  }
});

// ============================================
// Invite Code Validation (Public endpoint for checking)
// ============================================

/**
 * POST /api/admin/invite-codes/validate
 * Validate an invite code (doesn't require admin, used before signup)
 */
router.post('/invite-codes/validate', [
  body('code').trim().notEmpty().withMessage('Invite code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
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
        grantsTier: inviteCode.grantsTier
      }
    });

  } catch (error) {
    logger.error('Validate invite code error:', error);
    res.status(500).json({
      error: 'Failed to validate invite code',
      message: error.message
    });
  }
});

export default router;
