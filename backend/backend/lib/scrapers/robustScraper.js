import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import { ProxyChain } from 'proxy-chain';
import UserAgent from 'user-agents';
import pRetry from 'p-retry';
import delay from 'delay';
import pLimit from 'p-limit';

// Configure Puppeteer with stealth mode
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

/**
 * Robust property scraper with anti-bot protection bypass
 */
export class RobustPropertyScraper {
  constructor() {
    this.browser = null;
    this.limit = pLimit(2); // Limit concurrent requests
    this.userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ];
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
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
          '--user-agent=' + this.getRandomUserAgent()
        ]
      });
    }
    return this.browser;
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  async scrapeProperty(url) {
    return this.limit(async () => {
      return pRetry(async () => {
        const browser = await this.init();
        const page = await browser.newPage();

        try {
          // Set realistic viewport and user agent
          await page.setViewport({ width: 1366, height: 768 });
          await page.setUserAgent(this.getRandomUserAgent());

          // Set extra headers to look more like a real browser
          await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          });

          // Add random delay before navigation
          await delay(Math.random() * 2000 + 1000);

          console.log(`🔍 Scraping: ${url}`);
          
          // Navigate with timeout and wait for network to be idle
          await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });

          // Wait for content to load
          await delay(Math.random() * 3000 + 2000);

          // Extract property data based on site
          const site = this.detectSite(url);
          const propertyData = await this.extractPropertyData(page, site);

          console.log(`✅ Successfully scraped: ${url}`);
          return propertyData;

        } catch (error) {
          console.error(`❌ Scraping failed for ${url}:`, error.message);
          throw error;
        } finally {
          await page.close();
        }
      }, {
        retries: 3,
        factor: 2,
        minTimeout: 2000,
        maxTimeout: 10000,
        onFailedAttempt: (error) => {
          console.log(`🔄 Retry attempt ${error.attemptNumber} for ${url}`);
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
      switch (site) {
        case 'idealista':
          await this.extractIdealistaData(page, data);
          break;
        case 'imovirtual':
          await this.extractImovirtualData(page, data);
          break;
        case 'supercasa':
          await this.extractSupercasaData(page, data);
          break;
        case 'olx':
          await this.extractOlxData(page, data);
          break;
        default:
          await this.extractGenericData(page, data);
      }
    } catch (error) {
      console.error(`Error extracting data for ${site}:`, error);
    }

    return data;
  }

  async extractIdealistaData(page, data) {
    // Try multiple selectors for each field
    data.title = await this.getTextBySelectors(page, [
      'h1[data-testid="title"]',
      '.main-info__title',
      'h1',
      '[data-testid="title"]'
    ]);

    data.price = await this.getTextBySelectors(page, [
      '[data-testid="price"]',
      '.info-data-price',
      '.price',
      '.main-info__price'
    ]);

    data.location = await this.getTextBySelectors(page, [
      '[data-testid="location"]',
      '.main-info__title-minor',
      '.location'
    ]);

    data.bedrooms = await this.getTextBySelectors(page, [
      '[data-testid="bedrooms"]',
      '.icon-bedrooms + span',
      '.details-property-habitations'
    ]);

    data.bathrooms = await this.getTextBySelectors(page, [
      '[data-testid="bathrooms"]',
      '.icon-bathrooms + span',
      '.details-property-bathrooms'
    ]);

    data.area = await this.getTextBySelectors(page, [
      '[data-testid="surface"]',
      '.icon-surface + span',
      '.details-property-surface'
    ]);

    // Extract features
    const features = await page.$$eval('.details-property-features li, .features li', els => 
      els.map(el => el.textContent?.trim()).filter(Boolean)
    );
    data.features = features;

    // Extract description
    data.description = await this.getTextBySelectors(page, [
      '.property-description',
      '.description',
      '[data-testid="description"]'
    ]);
  }

  async extractImovirtualData(page, data) {
    data.title = await this.getTextBySelectors(page, [
      'h1',
      '.property-title',
      '.title'
    ]);

    data.price = await this.getTextBySelectors(page, [
      '.price',
      '.property-price',
      '.value'
    ]);

    data.location = await this.getTextBySelectors(page, [
      '.location',
      '.property-location',
      '.address'
    ]);

    // Extract property details
    const details = await page.$$eval('.property-details li, .details li', els => 
      els.map(el => el.textContent?.trim()).filter(Boolean)
    );
    
    details.forEach(detail => {
      if (detail.includes('quartos') || detail.includes('dormitórios')) {
        data.bedrooms = detail;
      } else if (detail.includes('casas de banho') || detail.includes('banheiros')) {
        data.bathrooms = detail;
      } else if (detail.includes('m²') || detail.includes('metros')) {
        data.area = detail;
      }
    });
  }

  async extractSupercasaData(page, data) {
    data.title = await this.getTextBySelectors(page, [
      'h1',
      '.property-title',
      '.title'
    ]);

    data.price = await this.getTextBySelectors(page, [
      '.price',
      '.property-price',
      '.value'
    ]);

    data.location = await this.getTextBySelectors(page, [
      '.location',
      '.property-location',
      '.address'
    ]);
  }

  async extractOlxData(page, data) {
    data.title = await this.getTextBySelectors(page, [
      'h1',
      '.property-title',
      '.title'
    ]);

    data.price = await this.getTextBySelectors(page, [
      '.price',
      '.property-price',
      '.value'
    ]);

    data.location = await this.getTextBySelectors(page, [
      '.location',
      '.property-location',
      '.address'
    ]);
  }

  async extractGenericData(page, data) {
    // Generic extraction for unknown sites
    data.title = await this.getTextBySelectors(page, ['h1', '.title', '.property-title']);
    data.price = await this.getTextBySelectors(page, ['.price', '.value', '[class*="price"]']);
    data.location = await this.getTextBySelectors(page, ['.location', '.address', '[class*="location"]']);
  }

  async getTextBySelectors(page, selectors) {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate(el => el.textContent?.trim(), element);
          if (text) return text;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    return '';
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Export singleton instance
export const robustScraper = new RobustPropertyScraper();
