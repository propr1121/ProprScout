import { parsePropertyUrl } from './urlParser.js';
import { scrapeProperty as browserScrape } from './browserScraper.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

/**
 * Scrape property data from Portuguese real estate websites using robust anti-bot methods
 * @param {string} url - Property URL
 * @returns {Promise<Object>} Property data
 */
export async function scrapeProperty(url) {
  try {
    console.log(`🔍 Starting robust scrape for: ${url}`);

    // Parse URL to get site and property ID
    const { site, propertyId } = parsePropertyUrl(url);
    console.log(`📍 Detected site: ${site}, Property ID: ${propertyId}`);

    // Try server-side scraping first, fallback to browser
    let propertyData;
    try {
      console.log('🔄 Attempting server-side scraping...');
      const response = await fetch(`${API_URL}/api/properties/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          propertyData = result.data;
          console.log('✅ Server-side scraping succeeded');
        } else {
          throw new Error(result.error);
        }
      } else {
        throw new Error('Server not available');
      }
    } catch (serverError) {
      console.log('⚠️ Server-side scraping failed, using browser fallback:', serverError.message);
      try {
        propertyData = await browserScrape(url);
      } catch (browserError) {
        console.log('⚠️ Browser scraping also failed, trying Firecrawl fallback:', browserError.message);
        try {
          // Lazy import to avoid blocking page load
          const { scrapeWithFirecrawl } = await import('./firecrawlScraper.js');
          propertyData = await scrapeWithFirecrawl(url);
        } catch (firecrawlError) {
          console.log('⚠️ Firecrawl scraping also failed:', firecrawlError.message);
          throw new Error('All scraping methods failed. Please try again or check the URL.');
        }
      }
    }
    
    if (!propertyData || !propertyData.title) {
      throw new Error('No property data could be extracted from the page');
    }

    // Add metadata
    propertyData.propertyId = propertyId;
    propertyData.scrapedAt = new Date().toISOString();
    propertyData.site = site;

    console.log(`✅ Successfully scraped property data:`, propertyData);
    return propertyData;

  } catch (error) {
    console.error(`❌ Property scraping failed for ${url}:`, error.message);
    throw error; // Re-throw the original error without wrapping
  }
}


/**
 * Get property data with error handling
 * @param {Object} params - Scraping parameters
 * @returns {Promise<Object>} - Property data or error
 */
export async function getPropertyData(params) {
  try {
    const data = await scrapeProperty(params.url || params.originalUrl);
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      data: null 
    };
  }
}