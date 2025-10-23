/**
 * Monitoring and logging service for scraping operations
 */
export class MonitoringService {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      captchaSolved: 0,
      proxyRotations: 0,
      averageResponseTime: 0,
      errors: new Map(),
      siteStats: new Map()
    };
    this.startTime = Date.now();
  }

  /**
   * Log scraping attempt
   */
  logAttempt(url, site, method = 'enhanced') {
    this.metrics.totalRequests++;
    console.log(`📊 [${method.toUpperCase()}] Attempting: ${site} - ${url}`);
  }

  /**
   * Log successful scrape
   */
  logSuccess(url, site, responseTime, dataExtracted) {
    this.metrics.successfulRequests++;
    this.updateAverageResponseTime(responseTime);
    this.updateSiteStats(site, 'success');
    
    console.log(`✅ [SUCCESS] ${site} - ${responseTime}ms - ${dataExtracted} fields extracted`);
  }

  /**
   * Log failed scrape
   */
  logFailure(url, site, error, responseTime = 0) {
    this.metrics.failedRequests++;
    this.updateAverageResponseTime(responseTime);
    this.updateSiteStats(site, 'failure');
    this.trackError(error);
    
    console.log(`❌ [FAILURE] ${site} - ${error.message}`);
  }

  /**
   * Log CAPTCHA solving
   */
  logCaptchaSolved(type, provider, solveTime) {
    this.metrics.captchaSolved++;
    console.log(`🤖 [CAPTCHA] Solved ${type} via ${provider} in ${solveTime}ms`);
  }

  /**
   * Log proxy rotation
   */
  logProxyRotation(oldProxy, newProxy, reason) {
    this.metrics.proxyRotations++;
    console.log(`🔄 [PROXY] Rotated from ${oldProxy} to ${newProxy} - ${reason}`);
  }

  /**
   * Update average response time
   */
  updateAverageResponseTime(responseTime) {
    const total = this.metrics.successfulRequests + this.metrics.failedRequests;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (total - 1) + responseTime) / total;
  }

  /**
   * Track error patterns
   */
  trackError(error) {
    const errorKey = error.message.split(':')[0]; // Get error type
    const count = this.metrics.errors.get(errorKey) || 0;
    this.metrics.errors.set(errorKey, count + 1);
  }

  /**
   * Update site statistics
   */
  updateSiteStats(site, result) {
    if (!this.metrics.siteStats.has(site)) {
      this.metrics.siteStats.set(site, { success: 0, failure: 0 });
    }
    const stats = this.metrics.siteStats.get(site);
    stats[result]++;
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const successRate = this.metrics.totalRequests > 0 
      ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2)
      : 0;

    return {
      ...this.metrics,
      uptime: Math.floor(uptime / 1000),
      successRate: `${successRate}%`,
      siteStats: Object.fromEntries(this.metrics.siteStats),
      topErrors: Array.from(this.metrics.errors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const metrics = this.getMetrics();
    
    console.log('\n📊 SCRAPING PERFORMANCE REPORT');
    console.log('================================');
    console.log(`⏱️  Uptime: ${metrics.uptime}s`);
    console.log(`📈 Success Rate: ${metrics.successRate}`);
    console.log(`🔄 Total Requests: ${metrics.totalRequests}`);
    console.log(`✅ Successful: ${metrics.successfulRequests}`);
    console.log(`❌ Failed: ${metrics.failedRequests}`);
    console.log(`🤖 CAPTCHAs Solved: ${metrics.captchaSolved}`);
    console.log(`🔄 Proxy Rotations: ${metrics.proxyRotations}`);
    console.log(`⚡ Avg Response Time: ${metrics.averageResponseTime.toFixed(0)}ms`);
    
    console.log('\n🏠 SITE STATISTICS:');
    Object.entries(metrics.siteStats).forEach(([site, stats]) => {
      const siteSuccessRate = ((stats.success / (stats.success + stats.failure)) * 100).toFixed(1);
      console.log(`  ${site}: ${stats.success}/${stats.success + stats.failure} (${siteSuccessRate}%)`);
    });
    
    if (metrics.topErrors.length > 0) {
      console.log('\n🚨 TOP ERRORS:');
      metrics.topErrors.forEach(([error, count]) => {
        console.log(`  ${error}: ${count} times`);
      });
    }
    
    console.log('================================\n');
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
