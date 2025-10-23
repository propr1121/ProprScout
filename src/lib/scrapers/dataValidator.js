/**
 * Data validation and sanitization service
 */
export class DataValidator {
  constructor() {
    this.validationRules = {
      title: {
        minLength: 5,
        maxLength: 200,
        required: true,
        patterns: [/^[^<>]*$/, /^.{5,200}$/] // No HTML tags, reasonable length
      },
      price: {
        pattern: /^[\d\.,\s€$]+$/,
        min: 1000,
        max: 50000000,
        required: true
      },
      location: {
        minLength: 3,
        maxLength: 100,
        required: true,
        patterns: [/^[A-Za-z\s,.-]+$/] // Only letters, spaces, commas, dots, hyphens
      },
      bedrooms: {
        pattern: /^\d+$/,
        min: 0,
        max: 20,
        required: false
      },
      bathrooms: {
        pattern: /^\d+$/,
        min: 0,
        max: 20,
        required: false
      },
      area: {
        pattern: /^\d+$/,
        min: 10,
        max: 10000,
        required: false
      }
    };
  }

  /**
   * Validate and sanitize property data
   */
  validatePropertyData(data) {
    const validated = {};
    const errors = [];

    // Validate title
    if (this.validationRules.title.required && !data.title) {
      errors.push('Title is required');
    } else if (data.title) {
      validated.title = this.sanitizeTitle(data.title);
      const titleErrors = this.validateField('title', validated.title);
      errors.push(...titleErrors);
    }

    // Validate price
    if (this.validationRules.price.required && !data.price) {
      errors.push('Price is required');
    } else if (data.price) {
      validated.price = this.sanitizePrice(data.price);
      const priceErrors = this.validateField('price', validated.price);
      errors.push(...priceErrors);
    }

    // Validate location
    if (this.validationRules.location.required && !data.location) {
      errors.push('Location is required');
    } else if (data.location) {
      validated.location = this.sanitizeLocation(data.location);
      const locationErrors = this.validateField('location', validated.location);
      errors.push(...locationErrors);
    }

    // Validate optional fields
    if (data.bedrooms) {
      validated.bedrooms = this.sanitizeNumber(data.bedrooms);
      const bedroomErrors = this.validateField('bedrooms', validated.bedrooms);
      errors.push(...bedroomErrors);
    }

    if (data.bathrooms) {
      validated.bathrooms = this.sanitizeNumber(data.bathrooms);
      const bathroomErrors = this.validateField('bathrooms', validated.bathrooms);
      errors.push(...bathroomErrors);
    }

    if (data.area) {
      validated.area = this.sanitizeNumber(data.area);
      const areaErrors = this.validateField('area', validated.area);
      errors.push(...areaErrors);
    }

    // Validate features array
    if (data.features && Array.isArray(data.features)) {
      validated.features = this.sanitizeFeatures(data.features);
    }

    // Validate images array
    if (data.images && Array.isArray(data.images)) {
      validated.images = this.sanitizeImages(data.images);
    }

    // Add metadata
    validated.url = data.url;
    validated.scrapedAt = data.scrapedAt || new Date().toISOString();
    validated.site = data.site;
    validated.propertyId = data.propertyId;

    return {
      data: validated,
      errors: errors,
      isValid: errors.length === 0
    };
  }

  /**
   * Validate individual field
   */
  validateField(fieldName, value) {
    const rules = this.validationRules[fieldName];
    if (!rules) return [];

    const errors = [];

    // Check required
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${fieldName} is required`);
      return errors;
    }

    if (!value) return errors; // Skip validation for empty optional fields

    // Check length
    if (rules.minLength && value.toString().length < rules.minLength) {
      errors.push(`${fieldName} is too short (min: ${rules.minLength})`);
    }

    if (rules.maxLength && value.toString().length > rules.maxLength) {
      errors.push(`${fieldName} is too long (max: ${rules.maxLength})`);
    }

    // Check patterns
    if (rules.patterns) {
      for (const pattern of rules.patterns) {
        if (!pattern.test(value.toString())) {
          errors.push(`${fieldName} format is invalid`);
          break;
        }
      }
    }

    // Check numeric ranges
    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push(`${fieldName} is too small (min: ${rules.min})`);
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      errors.push(`${fieldName} is too large (max: ${rules.max})`);
    }

    return errors;
  }

  /**
   * Sanitize title
   */
  sanitizeTitle(title) {
    return title
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 200); // Truncate if too long
  }

  /**
   * Sanitize price
   */
  sanitizePrice(price) {
    const cleaned = price.toString()
      .replace(/[^\d\.,€$]/g, '') // Keep only digits, dots, commas, euro, dollar
      .replace(/,/g, '.') // Replace commas with dots
      .replace(/\.(?=\d*\.)/g, ''); // Remove all dots except the last one

    const number = parseFloat(cleaned);
    return isNaN(number) ? null : number;
  }

  /**
   * Sanitize location
   */
  sanitizeLocation(location) {
    return location
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Truncate if too long
  }

  /**
   * Sanitize number
   */
  sanitizeNumber(value) {
    const number = parseInt(value.toString().replace(/\D/g, ''));
    return isNaN(number) ? null : number;
  }

  /**
   * Sanitize features array
   */
  sanitizeFeatures(features) {
    return features
      .filter(feature => typeof feature === 'string' && feature.trim().length > 0)
      .map(feature => feature.trim().substring(0, 50)) // Limit length
      .filter((feature, index, array) => array.indexOf(feature) === index) // Remove duplicates
      .slice(0, 20); // Limit to 20 features
  }

  /**
   * Sanitize images array
   */
  sanitizeImages(images) {
    return images
      .filter(img => typeof img === 'string' && this.isValidUrl(img))
      .slice(0, 10); // Limit to 10 images
  }

  /**
   * Check if URL is valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get validation statistics
   */
  getValidationStats() {
    return {
      rules: Object.keys(this.validationRules),
      totalRules: Object.keys(this.validationRules).length,
      requiredFields: Object.values(this.validationRules).filter(rule => rule.required).length
    };
  }
}

// Export singleton instance
export const dataValidator = new DataValidator();
