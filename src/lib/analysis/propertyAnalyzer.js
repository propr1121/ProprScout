/**
 * Property Analyzer - Scoring System for Real Estate Listings
 * Focus: Listing Quality, Data Completeness, Space Efficiency
 *
 * Score Breakdown:
 * - Listing Quality (40%): How complete and professional is the listing
 * - Space Efficiency (35%): Value per square meter and room configuration
 * - Data Completeness (25%): How much information is available
 */

/**
 * Main analysis function
 * @param {Object} propertyData - Property data object
 * @returns {Object} - Analysis results with scores
 */
export function analyzeProperty(propertyData) {
  try {
    const {
      price,
      area,
      rooms,
      bathrooms,
      location,
      features = [],
      images = [],
      description = '',
      coordinates,
      title = ''
    } = propertyData;

    // Core analysis components
    const listingQuality = assessListingQuality(propertyData);
    const spaceEfficiency = analyzeSpaceEfficiency(price, area, rooms, bathrooms);
    const dataCompleteness = assessDataCompleteness(propertyData);
    const locationContext = analyzeLocation(location, coordinates, features);
    const dataQuality = checkDataQuality(propertyData);

    // Calculate overall score with weighted components
    // Only set to 0 if there are critical issues (missing price AND area)
    let overallScore;
    if (dataQuality.hasCriticalIssues && !price && !area) {
      overallScore = 0;
    } else {
      // Weighted score calculation
      overallScore = Math.round(
        (listingQuality.score * 0.40) +    // 40% - Listing Quality
        (spaceEfficiency.score * 0.35) +   // 35% - Space Efficiency
        (dataCompleteness.score * 0.25)    // 25% - Data Completeness
      );

      // Ensure minimum score of 20 if we have at least some data
      if (overallScore < 20 && (price || area || location)) {
        overallScore = 20;
      }
    }

    // Generate smart recommendations based on analysis
    const recommendations = generateRecommendations(propertyData, {
      listingQuality,
      spaceEfficiency,
      locationContext,
      dataCompleteness
    });

    // Identify risks and opportunities
    const risks = identifyRisks(propertyData, { listingQuality, spaceEfficiency, locationContext });
    const opportunities = identifyOpportunities(propertyData, { listingQuality, spaceEfficiency, locationContext });

    return {
      overallScore: {
        score: overallScore,
        breakdown: {
          listingQuality: Math.round(listingQuality.score * 0.40),
          spaceEfficiency: Math.round(spaceEfficiency.score * 0.35),
          dataCompleteness: Math.round(dataCompleteness.score * 0.25)
        },
        explanation: getScoreExplanation(overallScore)
      },
      listingQuality,
      spaceConfiguration: spaceEfficiency, // Alias for backward compatibility
      priceEfficiency: spaceEfficiency,    // Alias for backward compatibility
      locationContext,
      dataQuality,
      dataCompleteness,
      recommendations,
      risks,
      opportunities,
      analyzedAt: new Date().toISOString(),
      disclaimer: 'This analysis is based on listing data only. For market comparisons, investment advice, and validation, consult local real estate professionals.'
    };
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw new Error(`Property analysis failed: ${error.message}`);
  }
}

/**
 * Get explanation for overall score
 */
function getScoreExplanation(score) {
  if (score >= 80) return 'Excellent listing with comprehensive data and good value metrics';
  if (score >= 60) return 'Good listing with solid information - minor improvements possible';
  if (score >= 40) return 'Average listing - some data missing or value concerns';
  if (score >= 20) return 'Basic listing - significant data gaps affect analysis';
  return 'Insufficient data for meaningful analysis';
}

/**
 * Assess Listing Quality (40% of total score)
 * Evaluates: photos, description, features, presentation
 */
function assessListingQuality(propertyData) {
  const {
    price, area, rooms, bathrooms, location,
    features = [], images = [], description = '', title = ''
  } = propertyData;

  let score = 0;
  const details = [];
  const missing = [];
  const improvements = [];

  // === PHOTO SCORE (30 points max) ===
  const photoCount = images?.length || 0;
  if (photoCount >= 15) {
    score += 30;
    details.push('Excellent photo coverage (15+)');
  } else if (photoCount >= 10) {
    score += 25;
    details.push('Good photo coverage (10+)');
  } else if (photoCount >= 5) {
    score += 18;
    details.push('Adequate photos (5+)');
  } else if (photoCount >= 3) {
    score += 12;
    details.push('Basic photos (3+)');
  } else if (photoCount >= 1) {
    score += 6;
    details.push('Limited photos');
    improvements.push('Add more property photos (aim for 10+)');
  } else {
    missing.push('Photos');
    improvements.push('Add property photos - listings with photos get 10x more views');
  }

  // === DESCRIPTION SCORE (25 points max) ===
  const descLength = description?.trim()?.length || 0;
  if (descLength >= 500) {
    score += 25;
    details.push('Detailed description');
  } else if (descLength >= 300) {
    score += 20;
    details.push('Good description');
  } else if (descLength >= 150) {
    score += 15;
    details.push('Brief description');
  } else if (descLength >= 50) {
    score += 8;
    details.push('Minimal description');
    improvements.push('Expand property description with more details');
  } else if (descLength > 0) {
    score += 3;
    details.push('Very brief description');
    improvements.push('Add a comprehensive property description');
  } else {
    missing.push('Description');
    improvements.push('Add property description to improve listing appeal');
  }

  // === FEATURES SCORE (25 points max) ===
  const featureCount = features?.length || 0;
  if (featureCount >= 12) {
    score += 25;
    details.push('Comprehensive features list');
  } else if (featureCount >= 8) {
    score += 20;
    details.push('Good features list');
  } else if (featureCount >= 5) {
    score += 15;
    details.push('Basic features list');
  } else if (featureCount >= 2) {
    score += 8;
    details.push('Limited features');
    improvements.push('Add more property features and amenities');
  } else if (featureCount >= 1) {
    score += 4;
    details.push('Minimal features');
    improvements.push('List all property features and amenities');
  } else {
    missing.push('Features');
    improvements.push('Add property features (parking, heating, etc.)');
  }

  // === CORE DATA SCORE (20 points max) ===
  let coreDataScore = 0;
  if (price && price > 0) { coreDataScore += 5; details.push('Price'); } else missing.push('Price');
  if (area && area > 0) { coreDataScore += 5; details.push('Area'); } else missing.push('Area');
  if (location && location.trim()) { coreDataScore += 4; details.push('Location'); } else missing.push('Location');
  if (rooms && rooms > 0) { coreDataScore += 3; details.push('Rooms'); } else missing.push('Rooms');
  if (bathrooms && bathrooms > 0) { coreDataScore += 3; details.push('Bathrooms'); } else missing.push('Bathrooms');
  score += coreDataScore;

  // Determine quality level
  let level;
  if (score >= 80) level = 'excellent';
  else if (score >= 60) level = 'good';
  else if (score >= 40) level = 'fair';
  else level = 'needs improvement';

  return {
    score: Math.min(100, score),
    level,
    details,
    missing,
    improvements: improvements.slice(0, 3), // Top 3 improvements
    photoCount,
    descriptionLength: descLength,
    featureCount
  };
}

/**
 * Analyze Space Efficiency (35% of total score)
 * Evaluates: price per m², space per room, bathroom ratio
 */
function analyzeSpaceEfficiency(price, area, rooms, bathrooms) {
  let score = 50; // Start with baseline score
  const metrics = {};
  const notes = [];
  let dataAvailable = false;

  // === PRICE PER M² ANALYSIS ===
  if (price && price > 0 && area && area > 0) {
    dataAvailable = true;
    const pricePerM2 = price / area;
    metrics.pricePerM2 = Math.round(pricePerM2);

    // Score based on Portuguese market context
    // Average in Portugal: €1,500-3,500/m² depending on location
    if (pricePerM2 < 1500) {
      score += 20;
      notes.push('Attractive price per m²');
    } else if (pricePerM2 < 2500) {
      score += 15;
      notes.push('Reasonable price per m²');
    } else if (pricePerM2 < 3500) {
      score += 10;
      notes.push('Standard market pricing');
    } else if (pricePerM2 < 5000) {
      score += 5;
      notes.push('Premium pricing');
    } else {
      score += 0;
      notes.push('Luxury/premium segment pricing');
    }
  }

  // === SPACE PER ROOM ANALYSIS ===
  if (area && area > 0 && rooms && rooms > 0) {
    dataAvailable = true;
    const areaPerRoom = area / rooms;
    metrics.areaPerRoom = Math.round(areaPerRoom * 10) / 10;
    metrics.spaceEfficiency = areaPerRoom;

    // Good space per room: 20-30m² is ideal
    if (areaPerRoom >= 30) {
      score += 15;
      metrics.spaceRating = 'spacious';
      notes.push('Very spacious rooms');
    } else if (areaPerRoom >= 25) {
      score += 12;
      metrics.spaceRating = 'good';
      notes.push('Good room sizes');
    } else if (areaPerRoom >= 20) {
      score += 8;
      metrics.spaceRating = 'standard';
      notes.push('Standard room sizes');
    } else if (areaPerRoom >= 15) {
      score += 4;
      metrics.spaceRating = 'compact';
      notes.push('Compact rooms');
    } else {
      score += 0;
      metrics.spaceRating = 'small';
      notes.push('Small room sizes - verify data accuracy');
    }

    // Price per room
    if (price && price > 0) {
      metrics.pricePerRoom = Math.round(price / rooms);
    }
  }

  // === BATHROOM RATIO ===
  if (bathrooms && bathrooms > 0 && rooms && rooms > 0) {
    dataAvailable = true;
    const bathroomRatio = bathrooms / rooms;
    metrics.bathroomRatio = Math.round(bathroomRatio * 100) / 100;

    if (bathroomRatio >= 1) {
      score += 10;
      metrics.bathroomRating = 'excellent';
      notes.push('Excellent bathroom ratio (1+ per bedroom)');
    } else if (bathroomRatio >= 0.75) {
      score += 8;
      metrics.bathroomRating = 'very good';
      notes.push('Very good bathroom ratio');
    } else if (bathroomRatio >= 0.5) {
      score += 5;
      metrics.bathroomRating = 'good';
      notes.push('Good bathroom ratio');
    } else {
      score += 2;
      metrics.bathroomRating = 'limited';
      notes.push('Limited bathrooms for room count');
    }
  }

  // If no data available, return baseline score
  if (!dataAvailable) {
    return {
      score: 40,
      metrics: {},
      notes: ['Insufficient data for space efficiency analysis'],
      dataAvailable: false,
      explanation: 'Price and area data needed for space efficiency analysis'
    };
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    ...metrics,
    notes,
    dataAvailable: true,
    explanation: notes.join('. ')
  };
}

/**
 * Assess Data Completeness (25% of total score)
 * Evaluates: how much information is provided
 */
function assessDataCompleteness(propertyData) {
  const {
    price, area, rooms, bathrooms, location,
    features = [], images = [], description = '',
    title = '', coordinates
  } = propertyData;

  let score = 0;
  const completeness = {};
  const missingFields = [];

  // Essential fields (60 points)
  if (price && price > 0) { score += 15; completeness.price = true; }
  else { completeness.price = false; missingFields.push('price'); }

  if (area && area > 0) { score += 15; completeness.area = true; }
  else { completeness.area = false; missingFields.push('area'); }

  if (location && location.trim()) { score += 15; completeness.location = true; }
  else { completeness.location = false; missingFields.push('location'); }

  if (rooms && rooms > 0) { score += 8; completeness.rooms = true; }
  else { completeness.rooms = false; missingFields.push('rooms'); }

  if (bathrooms && bathrooms > 0) { score += 7; completeness.bathrooms = true; }
  else { completeness.bathrooms = false; missingFields.push('bathrooms'); }

  // Enhanced fields (40 points)
  if (images && images.length > 0) {
    score += Math.min(12, images.length); // Up to 12 points for photos
    completeness.images = true;
  } else {
    completeness.images = false;
    missingFields.push('photos');
  }

  if (description && description.trim().length > 50) {
    score += 10;
    completeness.description = true;
  } else {
    completeness.description = false;
    missingFields.push('description');
  }

  if (features && features.length > 0) {
    score += Math.min(10, features.length); // Up to 10 points for features
    completeness.features = true;
  } else {
    completeness.features = false;
    missingFields.push('features');
  }

  if (coordinates && coordinates.lat && coordinates.lon) {
    score += 5;
    completeness.coordinates = true;
  } else {
    completeness.coordinates = false;
  }

  if (title && title.trim()) {
    score += 3;
    completeness.title = true;
  } else {
    completeness.title = false;
  }

  // Calculate percentage
  const totalFields = Object.keys(completeness).length;
  const filledFields = Object.values(completeness).filter(v => v).length;
  const percentage = Math.round((filledFields / totalFields) * 100);

  return {
    score: Math.min(100, score),
    percentage,
    completeness,
    missingFields,
    filledFields,
    totalFields,
    level: score >= 80 ? 'complete' : score >= 60 ? 'good' : score >= 40 ? 'partial' : 'incomplete'
  };
}

/**
 * Analyze location context
 */
function analyzeLocation(location, coordinates, features = []) {
  if (!location || location.trim() === '') {
    return {
      score: 30,
      neighborhood: 'Location not specified',
      amenities: [],
      transportScore: 30,
      dataAvailable: false,
      explanation: 'Location data needed for analysis'
    };
  }

  let score = 50;
  let neighborhood = 'Residential area';
  let amenities = [];
  let transportScore = 50;
  const locationLower = location.toLowerCase();

  // Location type detection
  if (locationLower.includes('centro') || locationLower.includes('center') || locationLower.includes('downtown')) {
    score = 75;
    neighborhood = 'City center';
    amenities.push('Central location');
    transportScore = 85;
  } else if (locationLower.includes('praia') || locationLower.includes('beach') || locationLower.includes('costa')) {
    score = 80;
    neighborhood = 'Coastal area';
    amenities.push('Beach proximity');
    transportScore = 60;
  } else if (locationLower.includes('lisboa') || locationLower.includes('lisbon')) {
    score = 70;
    neighborhood = 'Lisbon metropolitan area';
    transportScore = 75;
  } else if (locationLower.includes('porto')) {
    score = 70;
    neighborhood = 'Porto metropolitan area';
    transportScore = 75;
  } else if (locationLower.includes('algarve') || locationLower.includes('faro')) {
    score = 72;
    neighborhood = 'Algarve region';
    amenities.push('Tourist area');
    transportScore = 55;
  } else if (locationLower.includes('histórico') || locationLower.includes('historic') || locationLower.includes('alfama')) {
    score = 68;
    neighborhood = 'Historic district';
    amenities.push('Cultural heritage');
    transportScore = 65;
  }

  // Feature-based adjustments
  if (features && features.length > 0) {
    const featuresLower = features.map(f => f.toLowerCase());

    if (featuresLower.some(f => f.includes('estacionamento') || f.includes('parking') || f.includes('garagem'))) {
      transportScore += 10;
      amenities.push('Parking available');
    }
    if (featuresLower.some(f => f.includes('piscina') || f.includes('pool'))) {
      score += 5;
      amenities.push('Pool');
    }
    if (featuresLower.some(f => f.includes('jardim') || f.includes('garden'))) {
      score += 3;
      amenities.push('Garden');
    }
    if (featuresLower.some(f => f.includes('vista') || f.includes('view'))) {
      score += 5;
      amenities.push('Views');
    }
  }

  return {
    score: Math.min(100, score),
    neighborhood,
    amenities,
    transportScore: Math.min(100, transportScore),
    dataAvailable: true,
    explanation: `${neighborhood} with ${amenities.length} notable amenities`
  };
}

/**
 * Check data quality and detect red flags
 */
function checkDataQuality(propertyData) {
  const issues = [];
  const warnings = [];
  let hasCriticalIssues = false;

  const { price, area, rooms, bathrooms, location, features = [], images = [], description } = propertyData;

  // Critical issues - only if BOTH price AND area are missing
  if ((!price || price <= 0) && (!area || area <= 0)) {
    issues.push('Missing both price and area - analysis limited');
    hasCriticalIssues = true;
  }

  // Individual warnings (not critical)
  if (!price || price <= 0) {
    warnings.push('Price not specified');
  } else if (price < 10000) {
    warnings.push('Price seems unusually low - verify data');
  } else if (price > 10000000) {
    warnings.push('Luxury property - limited market comparison');
  }

  if (!area || area <= 0) {
    warnings.push('Area not specified');
  } else if (area < 20) {
    warnings.push('Very small area - verify data');
  } else if (area > 1000) {
    warnings.push('Very large property - verify data');
  }

  if (!location || location.trim() === '') {
    warnings.push('Location not specified');
  }

  // Consistency checks
  if (price && price > 0 && area && area > 0) {
    const pricePerM2 = price / area;
    if (pricePerM2 < 200) {
      warnings.push('Price per m² unusually low - verify data');
    } else if (pricePerM2 > 15000) {
      warnings.push('Price per m² very high - luxury segment');
    }
  }

  if (area && area > 0 && rooms && rooms > 0) {
    const areaPerRoom = area / rooms;
    if (areaPerRoom < 12) {
      warnings.push('Very small room sizes - verify room count');
    }
  }

  // Missing data notes
  if (!rooms) warnings.push('Room count not specified');
  if (!bathrooms) warnings.push('Bathroom count not specified');
  if (!features || features.length === 0) warnings.push('No features listed');
  if (!images || images.length === 0) warnings.push('No photos available');

  return {
    hasCriticalIssues,
    issues,
    warnings,
    completeness: {
      price: !!(price && price > 0),
      area: !!(area && area > 0),
      location: !!(location && location.trim()),
      rooms: !!(rooms && rooms > 0),
      bathrooms: !!(bathrooms && bathrooms > 0),
      features: !!(features && features.length > 0),
      images: !!(images && images.length > 0),
      description: !!(description && description.trim().length > 50)
    }
  };
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(propertyData, analysis) {
  const recommendations = [];
  const { listingQuality, spaceEfficiency, locationContext, dataCompleteness } = analysis;

  // Listing quality recommendations
  if (listingQuality.score >= 80) {
    recommendations.push('Well-presented listing - ready for client viewing');
  } else if (listingQuality.score < 50) {
    recommendations.push('Request additional photos and property details from seller');
  }

  if (listingQuality.improvements && listingQuality.improvements.length > 0) {
    recommendations.push(`Listing improvement: ${listingQuality.improvements[0]}`);
  }

  // Space efficiency recommendations
  if (spaceEfficiency.pricePerM2) {
    if (spaceEfficiency.pricePerM2 < 2000) {
      recommendations.push('Competitive pricing - strong value proposition');
    } else if (spaceEfficiency.pricePerM2 > 4000) {
      recommendations.push('Premium pricing - verify comparable properties');
    }
  }

  if (spaceEfficiency.spaceRating === 'spacious') {
    recommendations.push('Spacious layout - highlight in marketing');
  }

  // Location recommendations
  if (locationContext.score >= 75) {
    recommendations.push('Strong location - emphasize in presentations');
  }

  // Data completeness recommendations
  if (dataCompleteness.missingFields && dataCompleteness.missingFields.length > 0) {
    const missing = dataCompleteness.missingFields.slice(0, 2).join(', ');
    recommendations.push(`Request missing information: ${missing}`);
  }

  // Always include these
  recommendations.push('Verify all details with official property documentation');

  return recommendations.slice(0, 6); // Limit to 6 recommendations
}

/**
 * Identify potential risks
 */
function identifyRisks(propertyData, analysis) {
  const risks = [];
  const { listingQuality, spaceEfficiency, locationContext } = analysis;

  if (listingQuality.score < 40) {
    risks.push('Low listing quality may indicate issues with the property');
  }

  if (spaceEfficiency.pricePerM2 && spaceEfficiency.pricePerM2 > 5000) {
    risks.push('High price per m² - ensure market justification');
  }

  if (spaceEfficiency.spaceRating === 'small') {
    risks.push('Small room sizes may limit buyer appeal');
  }

  if (locationContext.transportScore < 50) {
    risks.push('Limited transport access may affect resale value');
  }

  if (propertyData.area && propertyData.area < 50) {
    risks.push('Compact property - niche market appeal');
  }

  if (!propertyData.images || propertyData.images.length < 3) {
    risks.push('Limited photos - request property viewing before proceeding');
  }

  return risks.slice(0, 4); // Limit to 4 risks
}

/**
 * Identify opportunities
 */
function identifyOpportunities(propertyData, analysis) {
  const opportunities = [];
  const { listingQuality, spaceEfficiency, locationContext } = analysis;

  if (spaceEfficiency.pricePerM2 && spaceEfficiency.pricePerM2 < 2500) {
    opportunities.push('Below-market pricing - potential value opportunity');
  }

  if (locationContext.score >= 75) {
    opportunities.push('Prime location - strong rental and resale potential');
  }

  if (spaceEfficiency.spaceRating === 'spacious' || spaceEfficiency.spaceRating === 'good') {
    opportunities.push('Good space configuration - family market appeal');
  }

  if (spaceEfficiency.bathroomRating === 'excellent') {
    opportunities.push('Excellent bathroom ratio - premium feature');
  }

  const features = propertyData.features || [];
  const featuresLower = features.map(f => f.toLowerCase());

  if (featuresLower.some(f => f.includes('piscina') || f.includes('pool'))) {
    opportunities.push('Pool amenity - high demand feature');
  }

  if (featuresLower.some(f => f.includes('vista mar') || f.includes('sea view'))) {
    opportunities.push('Sea views - premium value driver');
  }

  if (featuresLower.some(f => f.includes('renovado') || f.includes('renovated') || f.includes('novo') || f.includes('new'))) {
    opportunities.push('Recently renovated - reduced maintenance concerns');
  }

  return opportunities.slice(0, 4); // Limit to 4 opportunities
}
