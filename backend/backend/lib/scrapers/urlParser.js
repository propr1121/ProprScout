/**
 * SSRF Protection - Block internal/private IP addresses and hostnames
 * @param {string} url - URL to validate
 * @throws {Error} - If URL targets internal resources
 */
function validateUrlSecurity(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Block localhost variants
    const blockedHostnames = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '[::1]'
    ];

    if (blockedHostnames.includes(hostname)) {
      throw new Error('Access to localhost is not allowed');
    }

    // Block private IP ranges (RFC 1918)
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [, a, b, c, d] = ipv4Match.map(Number);

      // 10.0.0.0/8
      if (a === 10) {
        throw new Error('Access to private IP addresses is not allowed');
      }
      // 172.16.0.0/12
      if (a === 172 && b >= 16 && b <= 31) {
        throw new Error('Access to private IP addresses is not allowed');
      }
      // 192.168.0.0/16
      if (a === 192 && b === 168) {
        throw new Error('Access to private IP addresses is not allowed');
      }
      // 169.254.0.0/16 (link-local)
      if (a === 169 && b === 254) {
        throw new Error('Access to link-local addresses is not allowed');
      }
    }

    // Block non-HTTP(S) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }

  } catch (e) {
    if (e.message.includes('not allowed')) {
      throw e;
    }
    throw new Error('Invalid URL format');
  }
}

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

  // SSRF Protection - validate URL before processing
  validateUrlSecurity(normalizedUrl);
  
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
