/**
 * Redis service for caching and rate limiting
 */

import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;

/**
 * Initialize Redis connection
 */
export async function initRedis() {
  try {
    const config = {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis server connection refused');
          return new Error('Redis server connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis max retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    };

    redisClient = createClient(config);

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('🔴 Redis connected');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis ready');
    });

    redisClient.on('end', () => {
      logger.info('🔴 Redis connection ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
}

/**
 * Get Redis client
 */
export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initRedis() first.');
  }
  return redisClient;
}

/**
 * Cache operations
 */
export class CacheService {
  constructor() {
    this.client = getRedisClient();
    this.defaultTTL = 3600; // 1 hour
  }

  /**
   * Set cache with TTL
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Set cache with expiration
   */
  async setEx(key, value, ttl) {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis SETEX error:', error);
      return false;
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys) {
    try {
      const values = await this.client.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Redis MGET error:', error);
      return [];
    }
  }

  /**
   * Set multiple keys
   */
  async mset(keyValuePairs) {
    try {
      const serializedPairs = {};
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs[key] = JSON.stringify(value);
      }
      await this.client.mSet(serializedPairs);
      return true;
    } catch (error) {
      logger.error('Redis MSET error:', error);
      return false;
    }
  }
}

/**
 * Rate limiting service
 */
export class RateLimitService {
  constructor() {
    this.client = getRedisClient();
  }

  /**
   * Check rate limit for IP and endpoint
   */
  async checkRateLimit(ip, endpoint, maxRequests = 100, windowMs = 900000) {
    try {
      const key = `rate_limit:${ip}:${endpoint}`;
      const window = Math.floor(Date.now() / windowMs);
      const windowKey = `${key}:${window}`;

      // Get current count
      const currentCount = await this.client.get(windowKey);
      const count = currentCount ? parseInt(currentCount) : 0;

      if (count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: (window + 1) * windowMs
        };
      }

      // Increment counter
      await this.client.incr(windowKey);
      await this.client.expire(windowKey, Math.ceil(windowMs / 1000));

      return {
        allowed: true,
        remaining: maxRequests - count - 1,
        resetTime: (window + 1) * windowMs
      };
    } catch (error) {
      logger.error('Rate limit check error:', error);
      // Allow request if Redis is down
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: Date.now() + windowMs
      };
    }
  }

  /**
   * Get rate limit info
   */
  async getRateLimitInfo(ip, endpoint) {
    try {
      const key = `rate_limit:${ip}:${endpoint}`;
      const window = Math.floor(Date.now() / 900000);
      const windowKey = `${key}:${window}`;

      const currentCount = await this.client.get(windowKey);
      const count = currentCount ? parseInt(currentCount) : 0;

      return {
        count,
        remaining: Math.max(0, 100 - count),
        resetTime: (window + 1) * 900000
      };
    } catch (error) {
      logger.error('Rate limit info error:', error);
      return {
        count: 0,
        remaining: 100,
        resetTime: Date.now() + 900000
      };
    }
  }
}

/**
 * Session service
 */
export class SessionService {
  constructor() {
    this.client = getRedisClient();
    this.sessionTTL = 86400; // 24 hours
  }

  /**
   * Create session
   */
  async createSession(sessionId, data) {
    try {
      const key = `session:${sessionId}`;
      await this.client.setEx(key, JSON.stringify(data), this.sessionTTL);
      return true;
    } catch (error) {
      logger.error('Session creation error:', error);
      return false;
    }
  }

  /**
   * Get session
   */
  async getSession(sessionId) {
    try {
      const key = `session:${sessionId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Session get error:', error);
      return null;
    }
  }

  /**
   * Update session
   */
  async updateSession(sessionId, data) {
    try {
      const key = `session:${sessionId}`;
      await this.client.setEx(key, JSON.stringify(data), this.sessionTTL);
      return true;
    } catch (error) {
      logger.error('Session update error:', error);
      return false;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    try {
      const key = `session:${sessionId}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Session delete error:', error);
      return false;
    }
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('🔴 Redis connection closed');
  }
}

export default { initRedis, getRedisClient, CacheService, RateLimitService, SessionService, closeRedis };
