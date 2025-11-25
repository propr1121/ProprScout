/**
 * Parse property URLs to extract site and property ID
 * @param {string} url - The property URL to parse
 * @returns {Object} - { site: string, propertyId: string }
 * @throws {Error} - If URL is not supported
 */
export function parsePropertyUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  // Normalize URL
  const normalizedUrl = url.trim();
  
  const patterns = {
    idealista: /idealista\.pt\/(?:en\/)?imovel\/(\d+)/,
    imovirtual: [
      /imovirtual\.com\/.*-ID([A-Z0-9]+)\.html/,  // Old format
      /imovirtual\.com\/pt\/anuncio\/([^\/]+)/,  // New format like your URL
      /imovirtual\.com\/.*\/([^\/]+)$/           // General format
    ],
    olx: /olx\.pt\/.*-ID([a-z0-9]+)\.html/,
    supercasa: [
      /supercasa\.pt\/.*,([a-f0-9-]{36})$/,       // UUID format
      /supercasa\.pt\/.*\/(\d+)$/,                // Numeric ID format
      /supercasa\.pt\/comprar-[^\/]+\/[^\/]+\/([^\/,]+)/  // General format
    ],
    casasapo: [
      /casa\.sapo\.pt\/.*-([a-f0-9-]+)$/,         // UUID format
      /casa\.sapo\.pt\/.*\/([^\/]+)$/             // General format
    ]
  };
  
  for (const [site, sitePatterns] of Object.entries(patterns)) {
    const patternArray = Array.isArray(sitePatterns) ? sitePatterns : [sitePatterns];
    
    for (const pattern of patternArray) {
      const match = normalizedUrl.match(pattern);
      if (match) {
        return { 
          site, 
          propertyId: match[1],
          originalUrl: normalizedUrl
        };
      }
    }
  }
  
  throw new Error('Unsupported property website. Please use Idealista, Imovirtual, OLX, Supercasa, or Casa Sapo.');
}

/**
 * Validate if a URL is supported
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if supported
 */
export function isSupportedUrl(url) {
  try {
    parsePropertyUrl(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get supported sites list
 * @returns {Array} - Array of supported site names
 */
export function getSupportedSites() {
  return ['idealista', 'imovirtual', 'olx', 'supercasa', 'casasapo'];
}
