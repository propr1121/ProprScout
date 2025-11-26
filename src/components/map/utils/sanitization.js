/**
 * ProprHome Map Module - Sanitization Utilities
 * XSS prevention for custom markers and user content
 */

/**
 * List of allowed SVG tags for custom markers
 */
const ALLOWED_SVG_TAGS = [
  'svg', 'path', 'circle', 'rect', 'polygon', 'polyline', 'line',
  'ellipse', 'g', 'defs', 'linearGradient', 'radialGradient', 'stop',
  'text', 'tspan', 'use', 'symbol', 'clipPath', 'mask', 'filter',
  'feGaussianBlur', 'feOffset', 'feBlend', 'feMerge', 'feMergeNode'
];

/**
 * List of allowed SVG attributes
 */
const ALLOWED_SVG_ATTRS = [
  'viewBox', 'xmlns', 'width', 'height', 'd', 'fill', 'stroke',
  'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'opacity',
  'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'points', 'transform', 'id', 'class', 'offset', 'stop-color',
  'stop-opacity', 'gradientUnits', 'gradientTransform', 'spreadMethod',
  'text-anchor', 'font-family', 'font-size', 'font-weight', 'fill-opacity',
  'stroke-opacity', 'clip-path', 'mask', 'filter', 'xlink:href', 'href'
];

/**
 * Sanitize SVG string for XSS prevention
 * @param {string} svg - SVG string to sanitize
 * @returns {string} - Sanitized SVG
 */
export function sanitizeMarkerSvg(svg) {
  if (!svg || typeof svg !== 'string') {
    return '';
  }

  // Remove script tags and event handlers
  let sanitized = svg
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, 'data-removed=')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, 'data-blocked:');

  // Parse and rebuild SVG with only allowed elements
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'image/svg+xml');

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('SVG parsing error, using fallback');
      return '';
    }

    // Recursively sanitize nodes
    const sanitizeNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        // Remove disallowed tags
        if (!ALLOWED_SVG_TAGS.includes(tagName)) {
          node.remove();
          return;
        }

        // Remove disallowed attributes
        const attrs = Array.from(node.attributes);
        attrs.forEach(attr => {
          const attrName = attr.name.toLowerCase();
          if (!ALLOWED_SVG_ATTRS.includes(attrName)) {
            node.removeAttribute(attr.name);
          }
        });

        // Recursively sanitize children
        Array.from(node.children).forEach(sanitizeNode);
      }
    };

    const svgElement = doc.querySelector('svg');
    if (svgElement) {
      sanitizeNode(svgElement);
      return new XMLSerializer().serializeToString(svgElement);
    }
  } catch (error) {
    console.warn('SVG sanitization error:', error);
  }

  return '';
}

/**
 * Sanitize HTML string for popup content
 * @param {string} html - HTML to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizePopupContent(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // List of allowed tags for popups
  const allowedTags = ['div', 'span', 'p', 'strong', 'em', 'br', 'b', 'i', 'a', 'img'];
  const allowedAttrs = ['class', 'style', 'href', 'target', 'src', 'alt', 'title'];

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, 'data-removed=')
    .replace(/javascript:/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '');

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${sanitized}</div>`, 'text/html');

    const sanitizeNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        if (!allowedTags.includes(tagName)) {
          // Replace with text content
          const text = document.createTextNode(node.textContent || '');
          node.parentNode?.replaceChild(text, node);
          return;
        }

        // Sanitize attributes
        const attrs = Array.from(node.attributes);
        attrs.forEach(attr => {
          if (!allowedAttrs.includes(attr.name.toLowerCase())) {
            node.removeAttribute(attr.name);
          }
          // Validate href/src don't contain javascript:
          if (attr.name === 'href' || attr.name === 'src') {
            if (attr.value.toLowerCase().includes('javascript:')) {
              node.removeAttribute(attr.name);
            }
          }
        });

        // Force target="_blank" and rel="noopener" on links
        if (tagName === 'a') {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }

        Array.from(node.childNodes).forEach(sanitizeNode);
      }
    };

    const container = doc.body.firstChild;
    if (container) {
      Array.from(container.childNodes).forEach(sanitizeNode);
      return container.innerHTML;
    }
  } catch (error) {
    console.warn('HTML sanitization error:', error);
  }

  // Fallback: escape all HTML
  return escapeHtml(html);
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeHtml(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, char => htmlEntities[char]);
}

/**
 * Sanitize address string
 * @param {string} address - Address to sanitize
 * @returns {string} - Sanitized address
 */
export function sanitizeAddress(address) {
  if (!address || typeof address !== 'string') {
    return '';
  }

  return address
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500); // Limit length
}

/**
 * Create safe popup HTML from property data
 * @param {Object} property - Property data
 * @returns {string} - Safe HTML for popup
 */
export function createSafePopupHtml(property) {
  const title = escapeHtml(property.title || 'Property Location');
  const price = escapeHtml(property.price || '');
  const address = escapeHtml(property.address || '');

  let html = `<div class="proprhome-popup">`;
  html += `<div class="popup-title">${title}</div>`;

  if (price) {
    html += `<div class="popup-price">${price}</div>`;
  }

  if (address) {
    html += `<div class="popup-address">${address}</div>`;
  }

  html += `</div>`;

  return html;
}

export default {
  sanitizeMarkerSvg,
  sanitizePopupContent,
  escapeHtml,
  sanitizeAddress,
  createSafePopupHtml,
};
