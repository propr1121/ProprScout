/**
 * Authentication API Routes
 * Handles registration, login, logout, and SSO callbacks
 */

import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import InviteCode from '../models/InviteCode.js';
import { generateToken, generateRefreshToken, verifyToken, requireAuth, blacklistToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendVerificationEmail
} from '../utils/email.js';
import {
  emitUserCreated,
  emitBetaCodeRedeemed
} from '../services/commandCenter.js';

const router = express.Router();

// Frontend URL for redirects after SSO
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Beta mode - require invite codes
const REQUIRE_INVITE_CODE = process.env.REQUIRE_INVITE_CODE !== 'false'; // Default to true

// Strict rate limiting for authentication endpoints (brute force protection)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Only count failed attempts
});

// Slightly more permissive for registration (still strict)
const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 registration attempts per hour (temporarily increased for testing)
  message: {
    error: 'Too many registration attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/auth/register
 * Register new user with email/password
 */
router.post('/register', registrationRateLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('inviteCode').trim().notEmpty().withMessage('Invite code is required')
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

    const { email, password, name, inviteCode, company, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'Registration failed',
        message: 'An account with this email already exists'
      });
    }

    // Validate invite code (REQUIRED for beta)
    let validInviteCode = null;
    let bonusCredits = 0;
    let grantsTier = null;

    if (REQUIRE_INVITE_CODE) {
      if (!inviteCode) {
        return res.status(400).json({
          error: 'Registration failed',
          message: 'An invite code is required to register during beta'
        });
      }

      validInviteCode = await InviteCode.findValidCode(inviteCode);
      if (!validInviteCode) {
        return res.status(400).json({
          error: 'Registration failed',
          message: 'Invalid or expired invite code'
        });
      }

      bonusCredits = validInviteCode.bonusCredits || 0;
      grantsTier = validInviteCode.grantsTier;
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
      authProvider: 'local',
      inviteCode: inviteCode,
      company: company || null,
      location: location || null,
      isActive: true
    });

    // Apply bonus credits from invite code
    if (bonusCredits > 0) {
      user.credits.balance += bonusCredits;
      user.credits.total_earned += bonusCredits;
    }

    // Apply subscription tier if granted
    if (grantsTier && grantsTier !== 'free') {
      user.subscription.type = grantsTier;
      user.subscription.status = 'active';
    }

    await user.save();

    // Mark invite code as used
    if (validInviteCode) {
      try {
        await validInviteCode.useCode(user._id);
        logger.info(`Invite code ${inviteCode} used by ${email}`);
      } catch (err) {
        logger.warn('Failed to mark invite code as used:', err);
      }
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`New user registered: ${email}`);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(err => {
      logger.error('Failed to send welcome email:', err);
    });

    // Emit Command Center webhooks (non-blocking)
    emitUserCreated({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      inviteCode: inviteCode || null
    }).catch(err => {
      logger.error('Failed to emit user created webhook:', err);
    });

    // Emit beta code redeemed if applicable
    if (validInviteCode && bonusCredits > 0) {
      emitBetaCodeRedeemed({
        userId: user._id.toString(),
        email: user.email,
        code: inviteCode,
        creditsAwarded: bonusCredits
      }).catch(err => {
        logger.error('Failed to emit beta code redeemed webhook:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          subscription: user.subscription.type,
          credits: user.credits.balance,
          profilePicture: user.profilePicture
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post('/login', authRateLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    passport.authenticate('local', { session: false }, async (err, user, info) => {
      if (err) {
        logger.error('Login error:', err);
        return res.status(500).json({
          error: 'Login failed',
          message: 'An error occurred during login'
        });
      }

      if (!user) {
        return res.status(401).json({
          error: 'Login failed',
          message: info?.message || 'Invalid credentials'
        });
      }

      // Update last login
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      await user.updateLastLogin(ip);

      // Check and recharge credits if needed
      user.checkAndRechargeCredits();
      await user.save();

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      logger.info(`User logged in: ${user.email}`);

      // Send login notification email (non-blocking)
      sendLoginNotificationEmail(user.email, user.name, {
        ip: ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
      }).catch(err => {
        logger.error('Failed to send login notification:', err);
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            subscription: user.subscription.type,
            credits: user.credits.balance,
            profilePicture: user.profilePicture,
            isAdmin: user.isAdmin
          },
          token,
          refreshToken
        }
      });
    })(req, res, next);

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout - blacklists the token to prevent reuse
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Blacklist the current token in Redis
    if (req.token) {
      const blacklisted = await blacklistToken(req.token);
      if (blacklisted) {
        logger.info(`Token blacklisted for user: ${req.user.email}`);
      }
    }

    logger.info(`User logged out: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh failed',
        message: 'Refresh token is required'
      });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Refresh failed',
        message: 'Invalid or expired refresh token'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Refresh failed',
        message: 'User not found or inactive'
      });
    }

    // Generate new access token
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Refresh failed',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // Check and recharge credits if needed
    const creditsRecharged = user.checkAndRechargeCredits();
    if (creditsRecharged) {
      await user.save();
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider,
          company: user.company,
          location: user.location,
          subscription: {
            type: user.subscription.type,
            plan: user.subscription.plan,
            status: user.subscription.status,
            expiresAt: user.subscription.expires_at
          },
          credits: {
            balance: user.credits.balance,
            totalEarned: user.credits.total_earned,
            totalSpent: user.credits.total_spent,
            nextRechargeDate: user.getNextRechargeDate()
          },
          usage: {
            analysesThisMonth: user.usage.detective_analyses_this_month,
            totalAnalyses: user.usage.total_analyses,
            referralCount: user.usage.referral_count,
            bonusAnalyses: user.usage.bonus_analyses
          },
          quota: user.quota_status,
          isAdmin: user.isAdmin,
          createdAt: user.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
});

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me', requireAuth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('company').optional().trim(),
  body('location').optional().trim(),
  body('preferences.language').optional().isIn(['en', 'pt', 'es']).withMessage('Invalid language'),
  body('preferences.notifications').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = req.user;
    const { name, company, location, preferences } = req.body;

    // Update allowed fields
    if (name) user.name = name;
    if (company !== undefined) user.company = company;
    if (location !== undefined) user.location = location;
    if (preferences) {
      if (preferences.language) user.preferences.language = preferences.language;
      if (preferences.notifications !== undefined) user.preferences.notifications = preferences.notifications;
    }

    await user.save();

    logger.info(`Profile updated: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          location: user.location,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change password for local auth users
 */
router.post('/change-password', requireAuth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findByEmailWithPassword(req.user.email);

    if (user.authProvider !== 'local') {
      return res.status(400).json({
        error: 'Cannot change password',
        message: 'Password change is only available for email/password accounts'
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Password change failed',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/referral-code
 * Get user's referral code
 */
router.get('/referral-code', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // Generate referral code from user ID
    const referralCode = Buffer.from(user._id.toString()).toString('base64');

    res.json({
      success: true,
      data: {
        referralCode,
        referralLink: `${FRONTEND_URL}/signup?ref=${referralCode}`,
        stats: {
          referralCount: user.usage.referral_count || 0,
          bonusAnalyses: user.usage.bonus_analyses || 0
        }
      }
    });

  } catch (error) {
    logger.error('Get referral code error:', error);
    res.status(500).json({
      error: 'Failed to get referral code',
      message: error.message
    });
  }
});

// ============================================
// Password Reset Routes
// ============================================

// Rate limiter for password reset requests
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: {
    error: 'Too many password reset requests',
    message: 'Please try again in an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post('/forgot-password', passwordResetRateLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    // But only send email if user exists and uses local auth
    if (user && user.authProvider === 'local') {
      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send password reset email
      try {
        await sendPasswordResetEmail(email, resetToken, user.name);
        logger.info(`Password reset email sent to: ${email}`);
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
        // Clear the token since email failed
        user.clearPasswordResetToken();
        await user.save();
        return res.status(500).json({
          error: 'Email failed',
          message: 'Failed to send password reset email. Please try again.'
        });
      }
    } else if (user && user.authProvider !== 'local') {
      // User exists but uses SSO - log for debugging but don't reveal
      logger.info(`Password reset requested for SSO user: ${email} (${user.authProvider})`);
    } else {
      // No user found - log for debugging but don't reveal
      logger.info(`Password reset requested for non-existent email: ${email}`);
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link shortly.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Request failed',
      message: 'An error occurred. Please try again.'
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token from email
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token, password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Password reset link is invalid or has expired. Please request a new one.'
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.clearPasswordResetToken();
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      error: 'Reset failed',
      message: 'An error occurred while resetting your password. Please try again.'
    });
  }
});

/**
 * GET /api/auth/verify-reset-token/:token
 * Verify if a reset token is valid (for frontend validation)
 */
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: 'Password reset link is invalid or has expired.'
      });
    }

    res.json({
      valid: true,
      message: 'Token is valid'
    });

  } catch (error) {
    logger.error('Verify reset token error:', error);
    res.status(500).json({
      valid: false,
      message: 'An error occurred while verifying the token.'
    });
  }
});

// ============================================
// Google OAuth Routes
// ============================================

/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

/**
 * GET /api/auth/google/callback
 * Google OAuth callback
 */
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        logger.error('Google auth error:', err);
        return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
      }

      // Check if invite is required (user doesn't exist and beta mode is on)
      if (!user && info?.message === 'invite_required') {
        logger.info(`Redirecting to invite-required page for: ${info.email}`);
        return res.redirect(`${FRONTEND_URL}/invite-required?provider=google`);
      }

      if (!user) {
        return res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
      }

      // Update last login
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      await user.updateLastLogin(ip);

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      logger.info(`User logged in via Google: ${user.email}`);

      // Redirect to frontend with tokens
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
      logger.error('Google callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=google_callback_failed`);
    }
  })(req, res, next);
});

// ============================================
// LinkedIn OAuth Routes
// ============================================

/**
 * GET /api/auth/linkedin
 * Initiate LinkedIn OAuth flow
 */
router.get('/linkedin',
  passport.authenticate('linkedin', {
    session: false
  })
);

/**
 * GET /api/auth/linkedin/callback
 * LinkedIn OAuth callback
 */
router.get('/linkedin/callback', (req, res, next) => {
  passport.authenticate('linkedin', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        logger.error('LinkedIn auth error:', err);
        return res.redirect(`${FRONTEND_URL}/login?error=linkedin_auth_failed`);
      }

      // Check if invite is required (user doesn't exist and beta mode is on)
      if (!user && info?.message === 'invite_required') {
        logger.info(`Redirecting to invite-required page for: ${info.email}`);
        return res.redirect(`${FRONTEND_URL}/invite-required?provider=linkedin`);
      }

      if (!user) {
        return res.redirect(`${FRONTEND_URL}/login?error=linkedin_auth_failed`);
      }

      // Update last login
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      await user.updateLastLogin(ip);

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      logger.info(`User logged in via LinkedIn: ${user.email}`);

      // Redirect to frontend with tokens
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
      logger.error('LinkedIn callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=linkedin_callback_failed`);
    }
  })(req, res, next);
});

export default router;
