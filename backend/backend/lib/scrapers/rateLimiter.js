/**
 * Advanced rate limiting and backoff strategies
 */
export class RateLimiter {
  constructor() {
    this.siteLimits = new Map();
    this.globalLimit = {
      requests: 0,
      windowStart: Date.now(),
      windowSize: 60000, // 1 minute
      maxRequests: 10 // Max 10 requests per minute globally
    };
    this.backoffStrategies = new Map();
  }

  /**
   * Check if request is allowed for site
   */
  async canMakeRequest(site) {
    const now = Date.now();
    
    // Check global rate limit
    if (this.globalLimit.requests >= this.globalLimit.maxRequests) {
      const timeSinceWindowStart = now - this.globalLimit.windowStart;
      if (timeSinceWindowStart < this.globalLimit.windowSize) {
        const waitTime = this.globalLimit.windowSize - timeSinceWindowStart;
        console.log(`⏳ Global rate limit reached. Waiting ${waitTime}ms`);
        await this.delay(waitTime);
        this.resetGlobalLimit();
      }
    }

    // Check site-specific limits
    if (!this.siteLimits.has(site)) {
      this.siteLimits.set(site, {
        requests: 0,
        windowStart: now,
        windowSize: 30000, // 30 seconds per site
        maxRequests: 3, // Max 3 requests per 30s per site
        backoffLevel: 0
      });
    }

    const siteLimit = this.siteLimits.get(site);
    const timeSinceSiteWindowStart = now - siteLimit.windowStart;

    // Reset window if expired
    if (timeSinceSiteWindowStart >= siteLimit.windowSize) {
      siteLimit.requests = 0;
      siteLimit.windowStart = now;
      siteLimit.backoffLevel = Math.max(0, siteLimit.backoffLevel - 1);
    }

    // Check if site limit exceeded
    if (siteLimit.requests >= siteLimit.maxRequests) {
      const waitTime = siteLimit.windowSize - timeSinceSiteWindowStart;
      console.log(`⏳ Rate limit for ${site} reached. Waiting ${waitTime}ms`);
      await this.delay(waitTime);
      return this.canMakeRequest(site); // Recursive check after delay
    }

    // Apply backoff if previous requests failed
    if (siteLimit.backoffLevel > 0) {
      const backoffTime = this.calculateBackoffTime(siteLimit.backoffLevel);
      console.log(`⏳ Backoff for ${site}: ${backoffTime}ms`);
      await this.delay(backoffTime);
    }

    return true;
  }

  /**
   * Record successful request
   */
  recordSuccess(site) {
    this.globalLimit.requests++;
    
    const siteLimit = this.siteLimits.get(site);
    if (siteLimit) {
      siteLimit.requests++;
      siteLimit.backoffLevel = Math.max(0, siteLimit.backoffLevel - 1);
    }
  }

  /**
   * Record failed request and increase backoff
   */
  recordFailure(site, errorType) {
    this.globalLimit.requests++;
    
    const siteLimit = this.siteLimits.get(site);
    if (siteLimit) {
      siteLimit.requests++;
      siteLimit.backoffLevel++;
      
      // Track backoff strategies
      if (!this.backoffStrategies.has(site)) {
        this.backoffStrategies.set(site, new Map());
      }
      const strategies = this.backoffStrategies.get(site);
      const count = strategies.get(errorType) || 0;
      strategies.set(errorType, count + 1);
    }
  }

  /**
   * Calculate backoff time based on level
   */
  calculateBackoffTime(level) {
    // Exponential backoff: 2^level * 1000ms
    return Math.min(Math.pow(2, level) * 1000, 30000); // Max 30 seconds
  }

  /**
   * Get site-specific backoff strategy
   */
  getBackoffStrategy(site) {
    const strategies = this.backoffStrategies.get(site);
    if (!strategies || strategies.size === 0) {
      return null;
    }

    // Return most common error type
    const sorted = Array.from(strategies.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }

  /**
   * Reset global rate limit
   */
  resetGlobalLimit() {
    this.globalLimit.requests = 0;
    this.globalLimit.windowStart = Date.now();
  }

  /**
   * Get rate limit statistics
   */
  getStats() {
    const stats = {
      global: {
        requests: this.globalLimit.requests,
        maxRequests: this.globalLimit.maxRequests,
        windowRemaining: Math.max(0, this.globalLimit.windowSize - (Date.now() - this.globalLimit.windowStart))
      },
      sites: {}
    };

    for (const [site, limit] of this.siteLimits.entries()) {
      stats.sites[site] = {
        requests: limit.requests,
        maxRequests: limit.maxRequests,
        backoffLevel: limit.backoffLevel,
        windowRemaining: Math.max(0, limit.windowSize - (Date.now() - limit.windowStart)),
        backoffStrategy: this.getBackoffStrategy(site)
      };
    }

    return stats;
  }

  /**
   * Delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
