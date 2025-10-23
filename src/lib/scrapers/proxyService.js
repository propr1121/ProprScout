import axios from 'axios';

/**
 * Advanced proxy service with multiple sources and rotation
 */
export class ProxyService {
  constructor() {
    this.proxies = [];
    this.currentIndex = 0;
    this.failedProxies = new Set();
    this.lastUpdate = 0;
    this.updateInterval = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Get fresh proxy list from multiple sources
   */
  async updateProxyList() {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval && this.proxies.length > 0) {
      return this.proxies;
    }

    console.log('🔄 Updating proxy list...');
    const proxySources = [
      this.getProxyscrapeProxies(),
      this.getProxyListDownloadProxies(),
      this.getFreeProxyListProxies(),
      this.getGitHubProxyList()
    ];

    const allProxies = [];
    for (const source of proxySources) {
      try {
        const proxies = await source;
        allProxies.push(...proxies);
      } catch (error) {
        console.log(`Proxy source failed: ${error.message}`);
      }
    }

    // Remove duplicates and filter out failed proxies
    this.proxies = [...new Set(allProxies)].filter(proxy => !this.failedProxies.has(proxy));
    this.shuffleArray(this.proxies);
    this.lastUpdate = now;

    console.log(`📡 Loaded ${this.proxies.length} fresh proxies`);
    return this.proxies;
  }

  /**
   * Get proxies from ProxyScrape
   */
  async getProxyscrapeProxies() {
    try {
      const response = await axios.get('https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all', {
        timeout: 10000
      });
      return response.data.split('\n').filter(p => p.trim()).map(p => `http://${p.trim()}`);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get proxies from Proxy-List Download
   */
  async getProxyListDownloadProxies() {
    try {
      const response = await axios.get('https://www.proxy-list.download/api/v1/get?type=http', {
        timeout: 10000
      });
      return response.data.split('\n').filter(p => p.trim()).map(p => `http://${p.trim()}`);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get proxies from Free Proxy List
   */
  async getFreeProxyListProxies() {
    try {
      const response = await axios.get('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt', {
        timeout: 10000
      });
      return response.data.split('\n').filter(p => p.trim()).map(p => `http://${p.trim()}`);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get proxies from GitHub proxy lists
   */
  async getGitHubProxyList() {
    try {
      const response = await axios.get('https://raw.githubusercontent.com/mertguvencli/http-proxy-list/main/proxy-list/data.txt', {
        timeout: 10000
      });
      return response.data.split('\n').filter(p => p.trim()).map(p => `http://${p.trim()}`);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get next working proxy
   */
  async getNextProxy() {
    await this.updateProxyList();
    
    if (this.proxies.length === 0) {
      return null;
    }

    let attempts = 0;
    const maxAttempts = Math.min(this.proxies.length, 10);

    while (attempts < maxAttempts) {
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

      if (!this.failedProxies.has(proxy)) {
        const isWorking = await this.testProxy(proxy);
        if (isWorking) {
          return proxy;
        } else {
          this.failedProxies.add(proxy);
        }
      }
      attempts++;
    }

    // If no working proxy found, return null
    return null;
  }

  /**
   * Test if proxy is working
   */
  async testProxy(proxy) {
    try {
      const response = await axios.get('https://httpbin.org/ip', {
        proxy: proxy,
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark proxy as failed
   */
  markProxyFailed(proxy) {
    this.failedProxies.add(proxy);
  }

  /**
   * Shuffle array in place
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Get proxy statistics
   */
  getStats() {
    return {
      total: this.proxies.length,
      failed: this.failedProxies.size,
      working: this.proxies.length - this.failedProxies.size,
      lastUpdate: new Date(this.lastUpdate).toISOString()
    };
  }
}

// Export singleton instance
export const proxyService = new ProxyService();
