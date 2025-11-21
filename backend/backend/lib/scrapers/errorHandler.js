/**
 * Comprehensive error handling with clear explanations
 */
export class ErrorHandler {
  constructor() {
    this.errorTypes = {
      SCRAPING_FAILED: 'scraping_failed',
      DATA_INCOMPLETE: 'data_incomplete',
      SITE_BLOCKED: 'site_blocked',
      CAPTCHA_REQUIRED: 'captcha_required',
      RATE_LIMITED: 'rate_limited',
      NETWORK_ERROR: 'network_error',
      PARSING_ERROR: 'parsing_error',
      VALIDATION_ERROR: 'validation_error'
    };
  }

  /**
   * Handle scraping errors with helpful explanations
   */
  handleScrapingError(error, url, site) {
    const errorType = this.categorizeError(error);
    
    switch (errorType) {
      case this.errorTypes.SITE_BLOCKED:
        return this.createBlockedSiteError(url, site);
      
      case this.errorTypes.CAPTCHA_REQUIRED:
        return this.createCaptchaError(url, site);
      
      case this.errorTypes.RATE_LIMITED:
        return this.createRateLimitError(url, site);
      
      case this.errorTypes.NETWORK_ERROR:
        return this.createNetworkError(url, site);
      
      case this.errorTypes.PARSING_ERROR:
        return this.createParsingError(url, site);
      
      default:
        return this.createGenericError(error, url, site);
    }
  }

  /**
   * Categorize error type
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('blocked') || message.includes('forbidden') || message.includes('403')) {
      return this.errorTypes.SITE_BLOCKED;
    }
    
    if (message.includes('captcha') || message.includes('challenge')) {
      return this.errorTypes.CAPTCHA_REQUIRED;
    }
    
    if (message.includes('rate limit') || message.includes('too many requests') || message.includes('429')) {
      return this.errorTypes.RATE_LIMITED;
    }
    
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return this.errorTypes.NETWORK_ERROR;
    }
    
    if (message.includes('parsing') || message.includes('parse') || message.includes('invalid')) {
      return this.errorTypes.PARSING_ERROR;
    }
    
    return this.errorTypes.SCRAPING_FAILED;
  }

  /**
   * Create blocked site error
   */
  createBlockedSiteError(url, site) {
    return {
      type: this.errorTypes.SITE_BLOCKED,
      message: `Unable to access ${site} - the website is blocking automated requests`,
      explanation: `The ${site} website has detected automated access and is blocking our requests. This is a common anti-bot protection measure.`,
      suggestions: [
        'Try again in a few minutes - sometimes the block is temporary',
        'Use a different property URL from the same site',
        'Try a different property portal (Idealista, Imovirtual, or Supercasa)',
        'Contact the property directly if you have the listing details'
      ],
      technicalDetails: 'The website returned a 403 Forbidden or similar blocking response',
      userFriendly: true
    };
  }

  /**
   * Create CAPTCHA error
   */
  createCaptchaError(url, site) {
    return {
      type: this.errorTypes.CAPTCHA_REQUIRED,
      message: `CAPTCHA challenge detected on ${site}`,
      explanation: `The ${site} website is showing a CAPTCHA challenge to verify you're human. Our automated system cannot solve these challenges.`,
      suggestions: [
        'Try again in a few minutes - CAPTCHA challenges are often temporary',
        'Use a different property URL from the same site',
        'Try a different property portal',
        'Access the property listing directly in your browser'
      ],
      technicalDetails: 'CAPTCHA challenge detected during scraping process',
      userFriendly: true
    };
  }

  /**
   * Create rate limit error
   */
  createRateLimitError(url, site) {
    return {
      type: this.errorTypes.RATE_LIMITED,
      message: `Rate limit exceeded for ${site}`,
      explanation: `We've made too many requests to ${site} in a short time. The website is temporarily limiting our access to prevent overload.`,
      suggestions: [
        'Wait 5-10 minutes before trying again',
        'Try a different property URL',
        'Use a different property portal',
        'The rate limit will reset automatically'
      ],
      technicalDetails: 'Rate limiting protection activated by the target website',
      userFriendly: true
    };
  }

  /**
   * Create network error
   */
  createNetworkError(url, site) {
    return {
      type: this.errorTypes.NETWORK_ERROR,
      message: `Network connection failed for ${site}`,
      explanation: `We couldn't establish a stable connection to ${site}. This could be due to network issues or the website being temporarily unavailable.`,
      suggestions: [
        'Check your internet connection',
        'Try again in a few minutes',
        'Verify the property URL is correct',
        'Try a different property portal'
      ],
      technicalDetails: 'Network timeout or connection failure',
      userFriendly: true
    };
  }

  /**
   * Create parsing error
   */
  createParsingError(url, site) {
    return {
      type: this.errorTypes.PARSING_ERROR,
      message: `Unable to extract property data from ${site}`,
      explanation: `We successfully accessed ${site}, but couldn't extract the property information. This might be due to changes in the website's structure.`,
      suggestions: [
        'Try a different property URL from the same site',
        'Try a different property portal',
        'The website may have updated its layout',
        'Contact us if this persists'
      ],
      technicalDetails: 'Data extraction failed - website structure may have changed',
      userFriendly: true
    };
  }

  /**
   * Create generic error
   */
  createGenericError(error, url, site) {
    return {
      type: this.errorTypes.SCRAPING_FAILED,
      message: `Property analysis failed for ${site}`,
      explanation: `We encountered an unexpected issue while trying to analyze the property from ${site}.`,
      suggestions: [
        'Try again in a few minutes',
        'Use a different property URL',
        'Try a different property portal',
        'Contact support if the issue persists'
      ],
      technicalDetails: error.message,
      userFriendly: true
    };
  }

  /**
   * Create data incomplete error
   */
  createDataIncompleteError(propertyData, missingFields) {
    return {
      type: this.errorTypes.DATA_INCOMPLETE,
      message: 'Property data is incomplete',
      explanation: `We successfully accessed the property listing, but some important information is missing: ${missingFields.join(', ')}.`,
      suggestions: [
        'Check the original property listing for complete information',
        'Contact the property agent for missing details',
        'Try a different property with more complete information',
        'Some analysis features may be limited due to missing data'
      ],
      technicalDetails: `Missing fields: ${missingFields.join(', ')}`,
      userFriendly: true,
      partialData: propertyData
    };
  }

  /**
   * Create validation error
   */
  createValidationError(validationErrors) {
    return {
      type: this.errorTypes.VALIDATION_ERROR,
      message: 'Property data validation failed',
      explanation: 'The property data we extracted contains invalid or suspicious information that we cannot process safely.',
      suggestions: [
        'Verify the property listing information',
        'Try a different property URL',
        'Contact the property agent to verify details',
        'Some data may need manual verification'
      ],
      technicalDetails: `Validation errors: ${validationErrors.join(', ')}`,
      userFriendly: true
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error) {
    if (error.userFriendly) {
      return error.message;
    }
    
    // Convert technical errors to user-friendly messages
    const technicalMessages = {
      'Failed to fetch': 'Unable to connect to the property website',
      'Network Error': 'Connection to the property website failed',
      'Timeout': 'The request took too long to complete',
      'CORS': 'Cross-origin request blocked by the website',
      '404': 'Property listing not found',
      '500': 'Property website is experiencing technical issues'
    };
    
    for (const [technical, friendly] of Object.entries(technicalMessages)) {
      if (error.message.includes(technical)) {
        return friendly;
      }
    }
    
    return 'An unexpected error occurred while analyzing the property';
  }

  /**
   * Get error suggestions
   */
  getErrorSuggestions(error) {
    if (error.suggestions) {
      return error.suggestions;
    }
    
    return [
      'Try again in a few minutes',
      'Use a different property URL',
      'Try a different property portal',
      'Contact support if the issue persists'
    ];
  }

  /**
   * Check if error is recoverable
   */
  isRecoverableError(error) {
    const recoverableTypes = [
      this.errorTypes.RATE_LIMITED,
      this.errorTypes.NETWORK_ERROR,
      this.errorTypes.CAPTCHA_REQUIRED
    ];
    
    return recoverableTypes.includes(error.type);
  }

  /**
   * Get retry delay for error type
   */
  getRetryDelay(error) {
    switch (error.type) {
      case this.errorTypes.RATE_LIMITED:
        return 300000; // 5 minutes
      case this.errorTypes.CAPTCHA_REQUIRED:
        return 60000; // 1 minute
      case this.errorTypes.NETWORK_ERROR:
        return 30000; // 30 seconds
      default:
        return 10000; // 10 seconds
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
