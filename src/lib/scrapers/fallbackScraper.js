import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fallback scraping methods when main scraper fails
 */
export class FallbackScraper {
  constructor() {
    this.fallbackMethods = [
      'direct-axios',
      'cors-proxy',
      'api-endpoint',
      'mobile-version',
      'cached-version'
    ];
  }

  /**
   * Try fallback scraping methods
   */
  async scrapeWithFallbacks(url, site) {
    console.log(`🔄 Trying fallback methods for ${site}...`);

    for (const method of this.fallbackMethods) {
      try {
        console.log(`🔄 Attempting fallback method: ${method}`);
        const data = await this.executeFallbackMethod(method, url, site);
        
        if (data && data.title) {
          console.log(`✅ Fallback method ${method} succeeded`);
          return data;
        }
      } catch (error) {
        console.log(`❌ Fallback method ${method} failed: ${error.message}`);
        continue;
      }
    }

    throw new Error('All fallback methods failed');
  }

  /**
   * Execute specific fallback method
   */
  async executeFallbackMethod(method, url, site) {
    switch (method) {
      case 'direct-axios':
        return await this.directAxiosScrape(url, site);
      case 'cors-proxy':
        return await this.corsProxyScrape(url, site);
      case 'api-endpoint':
        return await this.apiEndpointScrape(url, site);
      case 'mobile-version':
        return await this.mobileVersionScrape(url, site);
      case 'cached-version':
        return await this.cachedVersionScrape(url, site);
      default:
        throw new Error(`Unknown fallback method: ${method}`);
    }
  }

  /**
   * Direct axios scraping with minimal headers
   */
  async directAxiosScrape(url, site) {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PropertyBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    return this.parseHtmlWithCheerio(response.data, site);
  }

  /**
   * CORS proxy scraping
   */
  async corsProxyScrape(url, site) {
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://thingproxy.freeboard.io/fetch/'
    ];

    for (const proxy of corsProxies) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await axios.get(proxyUrl, { timeout: 10000 });
        
        if (response.data && response.data.length > 1000) {
          return this.parseHtmlWithCheerio(response.data, site);
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('All CORS proxies failed');
  }

  /**
   * API endpoint scraping (if available)
   */
  async apiEndpointScrape(url, site) {
    // Try to find API endpoints for known sites
    const apiEndpoints = {
      idealista: this.getIdealistaApiEndpoint(url),
      imovirtual: this.getImovirtualApiEndpoint(url),
      supercasa: this.getSupercasaApiEndpoint(url)
    };

    const endpoint = apiEndpoints[site];
    if (!endpoint) {
      throw new Error(`No API endpoint available for ${site}`);
    }

    const response = await axios.get(endpoint, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PropertyBot/1.0)',
        'Accept': 'application/json,text/html,*/*'
      }
    });

    return this.parseApiResponse(response.data, site);
  }

  /**
   * Mobile version scraping
   */
  async mobileVersionScrape(url, site) {
    const mobileUrl = this.convertToMobileUrl(url, site);
    
    const response = await axios.get(mobileUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });

    return this.parseHtmlWithCheerio(response.data, site);
  }

  /**
   * Cached version scraping
   */
  async cachedVersionScrape(url, site) {
    const cachedUrls = [
      `https://web.archive.org/web/${url}`,
      `https://webcache.googleusercontent.com/search?q=cache:${url}`,
      `https://archive.today/${url}`
    ];

    for (const cachedUrl of cachedUrls) {
      try {
        const response = await axios.get(cachedUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PropertyBot/1.0)'
          }
        });

        if (response.data && response.data.length > 1000) {
          return this.parseHtmlWithCheerio(response.data, site);
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('All cached versions failed');
  }

  /**
   * Parse HTML with Cheerio
   */
  parseHtmlWithCheerio(html, site) {
    const $ = cheerio.load(html);
    
    const data = {
      title: this.extractTitle($, site),
      price: this.extractPrice($, site),
      location: this.extractLocation($, site),
      bedrooms: this.extractBedrooms($, site),
      bathrooms: this.extractBathrooms($, site),
      area: this.extractArea($, site),
      features: this.extractFeatures($, site),
      images: this.extractImages($, site),
      description: this.extractDescription($, site)
    };

    return data;
  }

  /**
   * Extract title using multiple selectors
   */
  extractTitle($, site) {
    const selectors = [
      'h1',
      'title',
      'meta[property="og:title"]',
      '.property-title',
      '.title',
      '[data-testid="title"]'
    ];

    for (const selector of selectors) {
      const element = $(selector);
      if (element.length) {
        const text = element.attr('content') || element.text();
        if (text && text.trim().length > 5) {
          return text.trim();
        }
      }
    }

    return null;
  }

  /**
   * Extract price using multiple patterns
   */
  extractPrice($, site) {
    const priceSelectors = [
      '.price',
      '.property-price',
      '.value',
      '[class*="price"]',
      '[data-testid="price"]'
    ];

    for (const selector of priceSelectors) {
      const element = $(selector);
      if (element.length) {
        const text = element.text();
        const priceMatch = text.match(/[\d\.,]+/);
        if (priceMatch) {
          return priceMatch[0];
        }
      }
    }

    // Try to find price in meta tags
    const metaPrice = $('meta[property="product:price:amount"]').attr('content');
    if (metaPrice) {
      return metaPrice;
    }

    return null;
  }

  /**
   * Extract location
   */
  extractLocation($, site) {
    const locationSelectors = [
      '.location',
      '.address',
      '.property-location',
      '[data-testid="location"]',
      '[data-testid="address"]'
    ];

    for (const selector of locationSelectors) {
      const element = $(selector);
      if (element.length) {
        const text = element.text();
        if (text && text.trim().length > 3) {
          return text.trim();
        }
      }
    }

    return null;
  }

  /**
   * Extract bedrooms
   */
  extractBedrooms($, site) {
    const bedroomSelectors = [
      '[class*="bedroom"]',
      '[class*="quarto"]',
      '[class*="room"]',
      '[data-testid="bedrooms"]',
      '[data-testid="rooms"]'
    ];

    for (const selector of bedroomSelectors) {
      const element = $(selector);
      if (element.length) {
        const text = element.text();
        const match = text.match(/(\d+)/);
        if (match) {
          return parseInt(match[1]);
        }
      }
    }

    return null;
  }

  /**
   * Extract bathrooms
   */
  extractBathrooms($, site) {
    const bathroomSelectors = [
      '[class*="bathroom"]',
      '[class*="banho"]',
      '[data-testid="bathrooms"]'
    ];

    for (const selector of bathroomSelectors) {
      const element = $(selector);
      if (element.length) {
        const text = element.text();
        const match = text.match(/(\d+)/);
        if (match) {
          return parseInt(match[1]);
        }
      }
    }

    return null;
  }

  /**
   * Extract area
   */
  extractArea($, site) {
    const areaSelectors = [
      '[class*="area"]',
      '[class*="surface"]',
      '[class*="m²"]',
      '[data-testid="area"]',
      '[data-testid="surface"]'
    ];

    for (const selector of areaSelectors) {
      const element = $(selector);
      if (element.length) {
        const text = element.text();
        const match = text.match(/(\d+)/);
        if (match) {
          return parseInt(match[1]);
        }
      }
    }

    return null;
  }

  /**
   * Extract features
   */
  extractFeatures($, site) {
    const features = [];
    const featureSelectors = [
      '.features li',
      '.property-features li',
      '.amenities li',
      '[class*="feature"]'
    ];

    for (const selector of featureSelectors) {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 2 && text.length < 50) {
          features.push(text);
        }
      });
    }

    return [...new Set(features)]; // Remove duplicates
  }

  /**
   * Extract images
   */
  extractImages($, site) {
    const images = [];
    
    // Try meta tags first
    $('meta[property="og:image"]').each((i, el) => {
      const src = $(el).attr('content');
      if (src) images.push(src);
    });

    // Try image elements
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.startsWith('http')) {
        images.push(src);
      }
    });

    return [...new Set(images)]; // Remove duplicates
  }

  /**
   * Extract description
   */
  extractDescription($, site) {
    const descriptionSelectors = [
      '.description',
      '.property-description',
      'meta[property="og:description"]',
      '[data-testid="description"]'
    ];

    for (const selector of descriptionSelectors) {
      const element = $(selector);
      if (element.length) {
        const text = element.attr('content') || element.text();
        if (text && text.trim().length > 10) {
          return text.trim();
        }
      }
    }

    return null;
  }

  /**
   * Convert URL to mobile version
   */
  convertToMobileUrl(url, site) {
    if (site === 'idealista') {
      return url.replace('www.idealista.pt', 'm.idealista.pt');
    }
    if (site === 'imovirtual') {
      return url.replace('www.imovirtual.com', 'm.imovirtual.com');
    }
    if (site === 'supercasa') {
      return url.replace('www.supercasa.pt', 'm.supercasa.pt');
    }
    return url;
  }

  /**
   * Get API endpoints for known sites
   */
  getIdealistaApiEndpoint(url) {
    const propertyId = url.match(/\/(\d+)\//);
    if (propertyId) {
      return `https://www.idealista.pt/api/property/${propertyId[1]}`;
    }
    return null;
  }

  getImovirtualApiEndpoint(url) {
    // Imovirtual doesn't have public API, return null
    return null;
  }

  getSupercasaApiEndpoint(url) {
    // Supercasa doesn't have public API, return null
    return null;
  }

  /**
   * Parse API response
   */
  parseApiResponse(data, site) {
    // This would need to be implemented based on actual API responses
    return {
      title: data.title || data.name,
      price: data.price || data.value,
      location: data.location || data.address,
      bedrooms: data.bedrooms || data.rooms,
      bathrooms: data.bathrooms,
      area: data.area || data.surface,
      features: data.features || data.amenities || [],
      images: data.images || [],
      description: data.description
    };
  }
}

// Export singleton instance
export const fallbackScraper = new FallbackScraper();
