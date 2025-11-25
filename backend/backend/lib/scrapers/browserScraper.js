/**
 * Browser-compatible scraper for client-side use
 * This version works in the browser without Node.js dependencies
 * When running in Node.js, uses jsdom for HTML parsing
 */

// Import jsdom for Node.js environment
let JSDOM;
const isNode = typeof window === 'undefined';
if (isNode) {
  try {
    const jsdom = await import('jsdom');
    JSDOM = jsdom.JSDOM;
  } catch (e) {
    console.warn('jsdom not available, HTML parsing may fail in Node.js environment');
  }
}

/**
 * Scrape property data using browser-compatible methods
 * @param {string} url - Property URL
 * @returns {Promise<Object>} Property data
 */
export async function scrapeProperty(url) {
  try {
    console.log(`🔍 Browser scraping: ${url}`);
    
    // Use CORS proxy for browser scraping
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest='
    ];

    let html = null;
    let proxyUsed = null;

    // Try each CORS proxy
    for (const proxy of corsProxies) {
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        console.log(`Trying proxy: ${proxy}`);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
            'User-Agent': 'Mozilla/5.0 (compatible; PropertyBot/1.0)'
          }
        });
        
        if (response.ok) {
          html = await response.text();
          proxyUsed = proxy;
          console.log(`✅ Successfully fetched HTML via ${proxy}, length: ${html.length}`);
          
          // Check if we got a challenge page
          if (html.includes('Please enable JS') || html.includes('disable any ad blocker') || html.length < 1000) {
            console.log('Got challenge page, trying next proxy...');
            continue;
          }
          
          break;
        }
      } catch (error) {
        console.warn(`Proxy ${proxy} failed:`, error.message);
        continue;
      }
    }

    if (!html) {
      throw new Error('Unable to access the property listing. The website may be blocking automated requests or the URL may be invalid. Please try a different property URL.');
    }

    // Check for server errors
    if (html.includes('500 Internal Server Error') || html.includes('404 Not Found') || html.includes('403 Forbidden') || html.includes('error code: 522') || html.includes('Connection timeout')) {
      throw new Error('The property URL appears to be invalid or the listing no longer exists. Please try a different property URL.');
    }

    // Check if we got a challenge page
    if (html.includes('Please enable JS') || html.includes('disable any ad blocker') || html.includes('captcha')) {
      throw new Error('The website is showing a CAPTCHA challenge. This requires advanced server-side scraping to bypass.');
    }

    // Extract property data from HTML
    let propertyData;
    try {
      propertyData = extractPropertyData(html, url);
    } catch (extractError) {
      console.error('Data extraction error:', extractError.message);
      throw new Error(`Data extraction failed: ${extractError.message}`);
    }
    
    if (!propertyData || !propertyData.title) {
      throw new Error('No property data could be extracted from the page. The website structure may have changed.');
    }

    // Check if we got generic/fallback data (indicates search page, not property listing)
    if (propertyData.title.includes('Casas e apartamentos para comprar') ||
        propertyData.title.includes('Todo o país') ||
        propertyData.price === null) {
      throw new Error('This appears to be a search results page, not a property listing. Please use a direct link to a specific property.');
    }

    console.log(`✅ Successfully scraped property data:`, propertyData);
    return propertyData;

  } catch (error) {
    console.error(`❌ Browser scraping failed for ${url}:`, error.message);
    throw new Error(`Property scraping failed: ${error.message}`);
  }
}

/**
 * Extract property data from HTML
 * Exported for use by other scrapers (e.g., Firecrawl)
 */
export function extractPropertyData(html, url) {
  // Use jsdom in Node.js, DOMParser in browser
  let doc;
  if (isNode && JSDOM) {
    const dom = new JSDOM(html);
    doc = dom.window.document;
  } else if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, 'text/html');
  } else {
    throw new Error('No HTML parser available. Install jsdom for Node.js support.');
  }
  
  const site = detectSite(url);
  const selectors = getSiteSelectors(site);
  
  // Ensure selectors exist and have default values
  const safeSelectors = {
    title: selectors?.title || ['h1', 'title'],
    price: selectors?.price || ['.price', '.value'],
    location: selectors?.location || ['.location', '.address'],
    area: selectors?.area || ['.area', '.surface'],
    bedrooms: selectors?.bedrooms || ['.bedrooms', '.rooms'],
    bathrooms: selectors?.bathrooms || ['.bathrooms'],
    images: selectors?.images || ['img'],
    description: selectors?.description || ['.description'],
    features: selectors?.features || ['.features'],
    coordinates: selectors?.coordinates || ['script[type="application/ld+json"]']
  };
  
  const data = {
    title: extractText(doc, safeSelectors.title),
    price: extractPrice(doc, safeSelectors.price),
    location: extractText(doc, safeSelectors.location),
    area: extractNumber(doc, safeSelectors.area, 'm²'),
    bedrooms: extractNumber(doc, safeSelectors.bedrooms, 'quarto'),
    bathrooms: extractNumber(doc, safeSelectors.bathrooms, 'casa de banho'),
    images: extractImages(doc, safeSelectors.images),
    description: extractText(doc, safeSelectors.description),
    features: extractFeatures(doc, safeSelectors.features),
    coordinates: extractCoordinates(doc, safeSelectors.coordinates),
    url: url,
    scrapedAt: new Date().toISOString(),
    site: site
  };

  return data;
}

/**
 * Detect site from URL
 */
function detectSite(url) {
  if (url.includes('idealista.pt')) return 'idealista';
  if (url.includes('imovirtual.com')) return 'imovirtual';
  if (url.includes('supercasa.pt')) return 'supercasa';
  if (url.includes('olx.pt')) return 'olx';
  if (url.includes('casa.sapo.pt')) return 'casasapo';
  return 'unknown';
}

/**
 * Get site-specific selectors
 */
function getSiteSelectors(site) {
  const selectors = {
    idealista: {
      title: ['h1[data-testid="title"]', 'h1.main-info__title', 'meta[property="og:title"]', 'title'],
      price: ['[data-testid="price"]', '.info-data-price', '.price', '.main-info__price'],
      location: ['[data-testid="location"]', '.main-info__title-minor', '.location'],
      area: ['[data-testid="surface"]', '.icon-surface + span', '.details-property-surface'],
      bedrooms: ['[data-testid="bedrooms"]', '.icon-bedrooms + span', '.details-property-habitations'],
      bathrooms: ['[data-testid="bathrooms"]', '.icon-bathrooms + span', '.details-property-bathrooms'],
      images: ['[data-testid="gallery-image"]', '.property-gallery img', '.gallery img'],
      description: ['[data-testid="description"]', '.property-description', 'meta[property="og:description"]'],
      features: ['.info-features span', '.property-features span', '[data-testid="features"]'],
      coordinates: ['script[type="application/ld+json"]', 'iframe[src*="google.com/maps"]', '[data-testid="map"]']
    },
    imovirtual: {
      title: ['h1[data-testid="title"]', 'h1.property-title', 'h1', '.property-title', 'meta[property="og:title"]'],
      price: ['[data-testid="price"]', '.price-value', '.property-price', '.price', '[class*="price"]'],
      location: ['[data-testid="location"]', '.property-location', '.location', '.address'],
      area: ['[data-testid="area"]', '[class*="area"]', '[class*="surface"]', '[class*="m²"]'],
      bedrooms: ['[data-testid="bedrooms"]', '[class*="bedroom"]', '[class*="quarto"]', '[class*="room"]'],
      bathrooms: ['[data-testid="bathrooms"]', '[class*="bathroom"]', '[class*="banho"]'],
      images: ['img[data-testid="gallery-image"]', 'img[src*="property"]', '.gallery img'],
      description: ['meta[property="og:description"]', '.property-description', '[data-testid="description"]'],
      features: ['[data-testid="features"] span', '.property-features span', '.info-features span'],
      coordinates: ['script[type="application/ld+json"]', 'iframe[src*="google.com/maps"]']
    },
    supercasa: {
      title: ['h1.title', 'meta[property="og:title"]', 'h1'],
      price: ['.price-tag', '.property-price', '.value'],
      location: ['.property-address', 'h1.title', '.location'],
      area: ['.property-size', '.info-features span'],
      bedrooms: ['.property-rooms', '.info-features span'],
      bathrooms: ['.property-bathrooms', '.info-features span'],
      images: ['.property-gallery img', '[data-testid="gallery-image"]'],
      description: ['meta[property="og:description"]', '.property-description'],
      features: ['.property-features span', '.info-features span'],
      coordinates: ['script[type="application/ld+json"]', 'iframe[src*="google.com/maps"]']
    },
    olx: {
      title: ['h1[data-testid="ad-title"]', 'meta[property="og:title"]', 'h1'],
      price: ['[data-testid="price"]', '.price-tag', '.price'],
      location: ['[data-testid="address"]', '.property-address', '.location'],
      area: ['[data-testid="size"]', '.property-size'],
      bedrooms: ['[data-testid="rooms"]', '.property-rooms'],
      bathrooms: ['[data-testid="bathrooms"]', '.property-bathrooms'],
      images: ['[data-testid="gallery-image"]', '.property-gallery img'],
      description: ['meta[property="og:description"]', '[data-testid="description"]'],
      features: ['.property-features span', '.info-features span'],
      coordinates: ['script[type="application/ld+json"]', 'iframe[src*="google.com/maps"]']
    },
    casasapo: {
      title: ['h1.property-title', 'meta[property="og:title"]', 'h1', '.listing-title'],
      price: ['.property-price', '.price-value', '[class*="price"]', '.value'],
      location: ['.property-location', '.address', '.location', '[class*="location"]'],
      area: ['.property-area', '[class*="area"]', '[class*="m2"]', '.area-value'],
      bedrooms: ['.property-bedrooms', '[class*="bedroom"]', '[class*="quarto"]'],
      bathrooms: ['.property-bathrooms', '[class*="bathroom"]', '[class*="wc"]'],
      images: ['.gallery img', '.property-images img', 'img[src*="property"]'],
      description: ['meta[property="og:description"]', '.property-description', '.description'],
      features: ['.property-features li', '.features span', '.amenities li'],
      coordinates: ['script[type="application/ld+json"]', 'iframe[src*="google.com/maps"]']
    }
  };
  
  return selectors[site] || selectors.idealista;
}

/**
 * Extract text content using multiple selectors
 */
function extractText(doc, selectors) {
  if (!selectors || !Array.isArray(selectors)) {
    return null;
  }
  
  for (const selector of selectors) {
    try {
      const element = doc.querySelector(selector);
      if (element) {
        const content = element.getAttribute('content') || element.textContent;
        if (content && content.trim()) {
          return content.trim();
        }
      }
    } catch (error) {
      console.warn(`Error with selector ${selector}:`, error.message);
    }
  }
  return null;
}

/**
 * Extract price as number
 */
function extractPrice(doc, selectors) {
  if (!selectors || !Array.isArray(selectors)) {
    return null;
  }
  
  for (const selector of selectors) {
    try {
      const element = doc.querySelector(selector);
      if (element) {
        const content = element.getAttribute('content') || element.textContent;
        const match = content?.match(/[\d\.,]+/);
        if (match) {
          const price = match[0].replace(/\./g, '').replace(',', '.');
          return parseFloat(price);
        }
      }
    } catch (error) {
      console.warn(`Error with selector ${selector}:`, error.message);
    }
  }
  return null;
}

/**
 * Extract number from text content
 */
function extractNumber(doc, selectors, filterText = null) {
  if (!selectors || !Array.isArray(selectors)) {
    return null;
  }
  
  for (const selector of selectors) {
    try {
      const elements = doc.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent?.trim();
        if (text) {
          if (filterText && !text.toLowerCase().includes(filterText.toLowerCase())) {
            continue;
          }
          const match = text.match(/(\d+)/);
          if (match) {
            return parseInt(match[1]);
          }
        }
      }
    } catch (error) {
      console.warn(`Error with selector ${selector}:`, error.message);
    }
  }
  return null;
}

/**
 * Extract image URLs
 */
function extractImages(doc, selectors) {
  const images = [];
  
  // Try og:image first
  const ogImage = doc.querySelector('meta[property="og:image"]');
  if (ogImage) {
    images.push(ogImage.getAttribute('content'));
  }
  
  // Try gallery images
  if (selectors && Array.isArray(selectors)) {
    for (const selector of selectors) {
      try {
        const elements = doc.querySelectorAll(selector);
        elements.forEach(img => {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (src && !images.includes(src)) {
            images.push(src);
          }
        });
      } catch (error) {
        console.warn(`Error with selector ${selector}:`, error.message);
      }
    }
  }
  
  return images;
}

/**
 * Extract property features
 */
function extractFeatures(doc, selectors) {
  const features = [];
  
  // Ensure selectors is an array
  if (!selectors || !Array.isArray(selectors)) {
    return features;
  }
  
  for (const selector of selectors) {
    try {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent?.trim();
        if (text && text.length > 2 && text.length < 50) {
          features.push(text);
        }
      });
    } catch (error) {
      console.warn(`Error with selector ${selector}:`, error.message);
    }
  }
  
  return [...new Set(features)]; // Remove duplicates
}

/**
 * Extract coordinates from various sources
 */
function extractCoordinates(doc, selectors) {
  // Check JSON-LD structured data
  const jsonLdScript = doc.querySelector('script[type="application/ld+json"]');
  if (jsonLdScript) {
    try {
      const jsonLd = JSON.parse(jsonLdScript.textContent);
      if (jsonLd.geo) {
        return {
          lat: parseFloat(jsonLd.geo.latitude),
          lng: parseFloat(jsonLd.geo.longitude)
        };
      }
    } catch (e) {
      console.warn('Could not parse JSON-LD:', e);
    }
  }
  
  // Check Google Maps iframe
  const mapFrame = doc.querySelector('iframe[src*="google.com/maps"]');
  if (mapFrame) {
    const src = mapFrame.getAttribute('src');
    const match = src?.match(/[?&]q=([-\d.]+),([-\d.]+)/);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
  }
  
  return null;
}
