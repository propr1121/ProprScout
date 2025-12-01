import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import AnonymizeUAPlugin from 'puppeteer-extra-plugin-anonymize-ua';
import BlockResourcesPlugin from 'puppeteer-extra-plugin-block-resources';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import UserDataDirPlugin from 'puppeteer-extra-plugin-user-data-dir';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pRetry from 'p-retry';
import delay from 'delay';
import pLimit from 'p-limit';
import { proxyService } from './proxyService.js';
import { captchaService } from './captchaService.js';
import { monitoringService } from './monitoringService.js';
import { rateLimiter } from './rateLimiter.js';
import { dataValidator } from './dataValidator.js';
import { fallbackScraper } from './fallbackScraper.js';
import { errorHandler } from './errorHandler.js';

// Configure Puppeteer with all anti-detection plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
puppeteer.use(AnonymizeUAPlugin());
puppeteer.use(BlockResourcesPlugin({
  blockedTypes: ['image', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'],
  blockedExtensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'woff', 'woff2', 'ttf', 'eot']
}));
puppeteer.use(RecaptchaPlugin({
  provider: {
    id: '2captcha',
    token: process.env.CAPTCHA_TOKEN || 'YOUR_2CAPTCHA_TOKEN'
  }
}));
puppeteer.use(UserDataDirPlugin());

/**
 * Enhanced property scraper with advanced anti-bot protection
 */
export class EnhancedPropertyScraper {
  constructor() {
    this.browser = null;
    this.limit = pLimit(1); // Reduced to 1 for maximum stealth
    this.sessionCookies = new Map();
    this.userAgents = this.generateUserAgents();
    this.viewports = this.generateViewports();
    this.proxyService = proxyService;
    this.captchaService = captchaService;
    this.monitoringService = monitoringService;
    this.rateLimiter = rateLimiter;
    this.dataValidator = dataValidator;
    this.fallbackScraper = fallbackScraper;
    this.errorHandler = errorHandler;
  }

  /**
   * Generate realistic user agents
   */
  generateUserAgents() {
    return [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
  }

  /**
   * Generate realistic viewports
   */
  generateViewports() {
    return [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
      { width: 1280, height: 720 },
      { width: 1600, height: 900 }
    ];
  }

  /**
   * Get next proxy from proxy service
   */
  async getNextProxy() {
    return await this.proxyService.getNextProxy();
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
   * Handle CAPTCHA detection and solving
   */
  async handleCaptcha(page) {
    const captchaTypes = await this.captchaService.detectCaptcha(page);
    
    if (captchaTypes.length === 0) {
      return false;
    }

    console.log(`🤖 Detected CAPTCHA types: ${captchaTypes.join(', ')}`);

    for (const type of captchaTypes) {
      try {
        if (type === 'recaptcha-v2') {
          const siteKey = await page.evaluate(() => {
            const script = document.querySelector('script[src*="recaptcha"]');
            if (script) {
              const match = script.src.match(/render=([^&]+)/);
              return match ? match[1] : null;
            }
            return null;
          });

          if (siteKey) {
            await this.captchaService.solveRecaptchaV2(page, siteKey, page.url());
            return true;
          }
        }

        if (type === 'hcaptcha') {
          const siteKey = await page.evaluate(() => {
            const script = document.querySelector('script[src*="hcaptcha"]');
            if (script) {
              const match = script.src.match(/sitekey=([^&]+)/);
              return match ? match[1] : null;
            }
            return null;
          });

          if (siteKey) {
            await this.captchaService.solveHcaptcha(page, siteKey, page.url());
            return true;
          }
        }
      } catch (error) {
        console.log(`CAPTCHA solving failed for ${type}:`, error.message);
        // Try switching provider
        this.captchaService.switchProvider();
      }
    }

    return false;
  }

  async init() {
    if (!this.browser) {
      const proxy = await this.getNextProxy();
      const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config',
        '--disable-ipc-flooding-protection',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--disable-translate',
        '--disable-windows10-custom-titlebar',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--user-agent=' + this.getRandomUserAgent(),
        '--window-size=1920,1080',
        '--start-maximized'
      ];

      if (proxy) {
        args.push(`--proxy-server=${proxy}`);
      }

      this.browser = await puppeteer.launch({
        headless: 'new',
        args,
        ignoreDefaultArgs: ['--enable-automation'],
        ignoreHTTPSErrors: true,
        defaultViewport: null
      });
    }
    return this.browser;
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  getRandomViewport() {
    return this.viewports[Math.floor(Math.random() * this.viewports.length)];
  }

  /**
   * Simulate human-like mouse movements
   */
  async simulateHumanBehavior(page) {
    // Random mouse movements
    const viewport = await page.viewport();
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      await page.mouse.move(
        Math.random() * viewport.width,
        Math.random() * viewport.height,
        { steps: Math.floor(Math.random() * 10) + 5 }
      );
      await delay(Math.random() * 500 + 200);
    }

    // Random scrolling
    if (Math.random() > 0.5) {
      await page.evaluate(() => {
        window.scrollTo(0, Math.random() * document.body.scrollHeight);
      });
      await delay(Math.random() * 1000 + 500);
    }
  }

  /**
   * Set realistic browser fingerprint
   */
  async setBrowserFingerprint(page) {
    const userAgent = this.getRandomUserAgent();
    const viewport = this.getRandomViewport();

    await page.setUserAgent(userAgent);
    await page.setViewport(viewport);

    // Override navigator properties
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en', 'pt-PT', 'pt'],
      });

      // Override chrome property
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };
    });
  }

  async scrapeProperty(url) {
    return this.limit(async () => {
      const startTime = Date.now();
      const site = this.detectSite(url);
      
      // Check rate limits
      await this.rateLimiter.canMakeRequest(site);
      
      // Log attempt
      this.monitoringService.logAttempt(url, site, 'enhanced');

      return pRetry(async () => {
        const browser = await this.init();
        const page = await browser.newPage();

        try {
          // Set browser fingerprint
          await this.setBrowserFingerprint(page);

          // Set extra headers
          await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
          });

          // Add random delay before navigation
          await delay(Math.random() * 3000 + 2000);

          console.log(`🔍 Enhanced scraping: ${url}`);
          
          // Navigate with multiple strategies
          let navigationSuccess = false;
          const strategies = [
            () => page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }),
            () => page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }),
            () => page.goto(url, { waitUntil: 'load', timeout: 30000 })
          ];

          for (const strategy of strategies) {
            try {
              await strategy();
              navigationSuccess = true;
              break;
            } catch (error) {
              console.log(`Navigation strategy failed: ${error.message}`);
              continue;
            }
          }

          if (!navigationSuccess) {
            throw new Error('All navigation strategies failed');
          }

          // Simulate human behavior
          await this.simulateHumanBehavior(page);

          // Wait for content to load
          await delay(Math.random() * 4000 + 3000);

          // Check for CAPTCHA and solve if present
          const captchaSolved = await this.handleCaptcha(page);
          if (captchaSolved) {
            console.log('✅ CAPTCHA solved successfully');
            await delay(2000); // Wait for page to process
          }

          // Extract property data
          const rawPropertyData = await this.extractPropertyData(page, site);
          
          // Validate and sanitize data
          const validation = this.dataValidator.validatePropertyData(rawPropertyData);
          
          if (!validation.isValid) {
            console.log(`⚠️ Data validation warnings: ${validation.errors.join(', ')}`);
          }

          const responseTime = Date.now() - startTime;
          this.monitoringService.logSuccess(url, site, responseTime, Object.keys(validation.data).length);
          this.rateLimiter.recordSuccess(site);

          console.log(`✅ Enhanced scraping successful: ${url}`);
          return validation.data;

        } catch (error) {
          const responseTime = Date.now() - startTime;
          this.monitoringService.logFailure(url, site, error, responseTime);
          this.rateLimiter.recordFailure(site, error.message);
          
          console.error(`❌ Enhanced scraping failed for ${url}:`, error.message);
          
          // Handle error with clear explanations
          const handledError = this.errorHandler.handleScrapingError(error, url, site);
          
          // Try fallback methods only if error is recoverable
          if (this.errorHandler.isRecoverableError(handledError)) {
            try {
              console.log('🔄 Attempting fallback scraping methods...');
              const fallbackData = await this.fallbackScraper.scrapeWithFallbacks(url, site);
              const validation = this.dataValidator.validatePropertyData(fallbackData);
              
              this.monitoringService.logSuccess(url, site, responseTime, Object.keys(validation.data).length);
              console.log('✅ Fallback scraping succeeded');
              return validation.data;
            } catch (fallbackError) {
              console.log('❌ All fallback methods also failed');
              throw new Error(handledError.message);
            }
          } else {
            // Non-recoverable error - provide clear explanation
            throw new Error(handledError.message);
          }
        } finally {
          await page.close();
        }
      }, {
        retries: 5, // Increased retries
        factor: 2,
        minTimeout: 3000,
        maxTimeout: 15000,
        onFailedAttempt: async (error) => {
          console.log(`🔄 Enhanced retry attempt ${error.attemptNumber} for ${url}`);
          // Rotate proxy on retry
          const proxy = await this.proxyService.getNextProxy();
          this.proxyService.markProxyFailed(proxy);
        }
      });
    });
  }

  detectSite(url) {
    if (url.includes('idealista.pt')) return 'idealista';
    if (url.includes('imovirtual.com')) return 'imovirtual';
    if (url.includes('supercasa.pt')) return 'supercasa';
    if (url.includes('olx.pt')) return 'olx';
    return 'unknown';
  }

  async extractPropertyData(page, site) {
    const data = {
      title: '',
      price: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      features: [],
      description: '',
      images: [],
      url: page.url()
    };

    try {
      // Use multiple extraction strategies
      const strategies = [
        () => this.extractWithSelectors(page, site, data),
        () => this.extractWithCheerio(page, site, data),
        () => this.extractWithRegex(page, site, data)
      ];

      for (const strategy of strategies) {
        try {
          await strategy();
          if (data.title && data.price) break; // Success
        } catch (error) {
          console.log(`Extraction strategy failed: ${error.message}`);
        }
      }

    } catch (error) {
      console.error(`Error extracting data for ${site}:`, error);
    }

    return data;
  }

  async extractWithSelectors(page, site, data) {
    const selectors = this.getSiteSelectors(site);
    
    for (const [field, selectorList] of Object.entries(selectors)) {
      for (const selector of selectorList) {
        try {
          const element = await page.$(selector);
          if (element) {
            const text = await page.evaluate(el => el.textContent?.trim(), element);
            if (text) {
              data[field] = text;
              break;
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
  }

  async extractWithCheerio(page, site, data) {
    const html = await page.content();
    const $ = cheerio.load(html);
    
    const selectors = this.getSiteSelectors(site);
    
    for (const [field, selectorList] of Object.entries(selectors)) {
      for (const selector of selectorList) {
        const element = $(selector);
        if (element.length && element.text().trim()) {
          data[field] = element.text().trim();
          break;
        }
      }
    }
  }

  async extractWithRegex(page, site, data) {
    const html = await page.content();
    
    // Price extraction with regex
    const priceRegex = /(?:€|EUR|euros?)\s*([\d\.,]+)/gi;
    const priceMatch = html.match(priceRegex);
    if (priceMatch) {
      data.price = priceMatch[0];
    }

    // Title extraction from meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      data.title = titleMatch[1];
    }

    // Location extraction
    const locationRegex = /(?:em|in|at)\s+([A-Za-z\s,]+?)(?:\s*[-–]\s*[A-Za-z\s,]+)?(?:\s*[-–]\s*[A-Za-z\s,]+)?/gi;
    const locationMatch = html.match(locationRegex);
    if (locationMatch) {
      data.location = locationMatch[0];
    }
  }

  getSiteSelectors(site) {
    const selectors = {
      idealista: {
        title: ['h1[data-testid="title"]', 'h1.main-info__title', 'meta[property="og:title"]', 'title'],
        price: ['[data-testid="price"]', '.info-data-price', '.price', '.main-info__price'],
        location: ['[data-testid="location"]', '.main-info__title-minor', '.location'],
        bedrooms: ['[data-testid="bedrooms"]', '.icon-bedrooms + span', '.details-property-habitations'],
        bathrooms: ['[data-testid="bathrooms"]', '.icon-bathrooms + span', '.details-property-bathrooms'],
        area: ['[data-testid="surface"]', '.icon-surface + span', '.details-property-surface']
      },
      imovirtual: {
        title: ['h1', '.property-title', '.title', 'meta[property="og:title"]'],
        price: ['.price', '.property-price', '.value', '[class*="price"]'],
        location: ['.location', '.property-location', '.address'],
        bedrooms: ['[class*="bedroom"]', '[class*="quarto"]', '[class*="room"]'],
        bathrooms: ['[class*="bathroom"]', '[class*="banho"]'],
        area: ['[class*="area"]', '[class*="surface"]', '[class*="m²"]']
      },
      supercasa: {
        title: ['h1.title', 'meta[property="og:title"]', 'h1'],
        price: ['.price-tag', '.property-price', '.value'],
        location: ['.property-address', 'h1.title', '.location'],
        bedrooms: ['[class*="bedroom"]', '[class*="quarto"]'],
        bathrooms: ['[class*="bathroom"]', '[class*="banho"]'],
        area: ['[class*="area"]', '[class*="surface"]']
      },
      olx: {
        title: ['h1[data-testid="ad-title"]', 'meta[property="og:title"]', 'h1'],
        price: ['[data-testid="price"]', '.price-tag', '.price'],
        location: ['[data-testid="address"]', '.property-address', '.location'],
        bedrooms: ['[data-testid="rooms"]', '.property-rooms'],
        bathrooms: ['[data-testid="bathrooms"]', '.property-bathrooms'],
        area: ['[data-testid="size"]', '.property-size']
      }
    };
    
    return selectors[site] || selectors.idealista;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Export singleton instance
export const enhancedScraper = new EnhancedPropertyScraper();
