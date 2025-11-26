/**
 * JWT Authentication Middleware
 * Protects routes that require authentication
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { TokenBlacklistService } from '../services/redis.js';

// Token blacklist service instance (lazy initialized)
let tokenBlacklist = null;

function getTokenBlacklist() {
  if (!tokenBlacklist) {
    try {
      tokenBlacklist = new TokenBlacklistService();
    } catch (error) {
      logger.warn('Token blacklist not available (Redis not connected)');
      return null;
    }
  }
  return tokenBlacklist;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // Default 24 hours for security

// Fail fast if JWT_SECRET is not configured
if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required');
}

/**
 * Generate JWT token for user
 */
export function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    subscription: user.subscription?.type || 'free',
    isAdmin: user.isAdmin || false
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(user) {
  const payload = {
    id: user._id,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware - requires valid JWT
 */
export async function requireAuth(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Invalid or expired token'
      });
    }

    // Check if token is blacklisted (logout security)
    const blacklist = getTokenBlacklist();
    if (blacklist) {
      const isBlacklisted = await blacklist.isBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Token has been revoked'
        });
      }
    }

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account disabled',
        message: 'Your account has been deactivated'
      });
    }

    // Attach user and token to request
    req.user = user;
    req.userId = user._id;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * Optional authentication - attaches user if token present
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (decoded) {
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    req.user = null;
    req.userId = null;
    next();
  }
}

/**
 * Admin-only middleware
 */
export async function requireAdmin(req, res, next) {
  try {
    // First check if user is authenticated
    await requireAuth(req, res, () => {
      // Then check if user is admin
      if (!req.user.isAdmin) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Admin privileges required'
        });
      }
      next();
    });
  } catch (error) {
    // Error already handled by requireAuth
  }
}

/**
 * Subscription check middleware
 * Use: requireSubscription('pro') or requireSubscription(['pro', 'annual'])
 */
export function requireSubscription(allowedTypes) {
  const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];

  return async (req, res, next) => {
    try {
      // First ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to access this feature'
        });
      }

      const userSubscription = req.user.subscription?.type || 'free';

      if (!types.includes(userSubscription)) {
        return res.status(403).json({
          error: 'Subscription required',
          message: `This feature requires a ${types.join(' or ')} subscription`,
          currentSubscription: userSubscription,
          requiredSubscription: types
        });
      }

      next();
    } catch (error) {
      logger.error('Subscription check error:', error);
      return res.status(500).json({
        error: 'Subscription check failed',
        message: 'An error occurred while checking subscription'
      });
    }
  };
}

/**
 * Blacklist a token (for logout)
 * @param {string} token - JWT token to blacklist
 * @returns {boolean} - Success status
 */
export async function blacklistToken(token) {
  const blacklist = getTokenBlacklist();
  if (blacklist && token) {
    // Blacklist for 24 hours (matching token expiry)
    return await blacklist.blacklistToken(token, 86400);
  }
  return false;
}

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  requireAuth,
  optionalAuth,
  requireAdmin,
  requireSubscription,
  blacklistToken
};
