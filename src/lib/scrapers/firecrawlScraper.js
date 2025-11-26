/**
 * Firecrawl scraper for property data extraction
 * Used as a backup when primary scraping methods fail
 */

const FIRECRAWL_API_KEY = import.meta.env.VITE_FIRECRAWL_API_KEY || '';
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v0/scrape';

// Dynamic import to avoid circular dependencies
let extractFromHTML = null;
async function getExtractFunction() {
  if (!extractFromHTML) {
    const browserScraper = await import('./browserScraper.js');
    extractFromHTML = browserScraper.extractPropertyData;
  }
  return extractFromHTML;
}

/**
 * Scrape property data using Firecrawl API
 * @param {string} url - Property URL
 * @returns {Promise<Object>} Property data
 */
export async function scrapeWithFirecrawl(url) {
  try {
    console.log('🔄 Attempting Firecrawl scraping...');
    
    const response = await fetch(FIRECRAWL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url: url,
        pageOptions: {
          onlyMainContent: false
        },
        formats: ['html', 'markdown']
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Firecrawl API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Firecrawl returned no data');
    }

    const html = result.data.html || result.data.markdown || '';
    
    if (!html || html.length < 100) {
      throw new Error('Firecrawl returned insufficient content');
    }

    // Extract property data from HTML using the same extraction logic
    const extract = await getExtractFunction();
    const propertyData = extract(html, url);
    
    if (!propertyData || !propertyData.title) {
      throw new Error('Could not extract property data from Firecrawl content');
    }

    console.log('✅ Firecrawl scraping succeeded');
    return propertyData;

  } catch (error) {
    console.log('⚠️ Firecrawl scraping failed:', error.message);
    throw error;
  }
}


