/**
 * Analyze property data and generate insights
 * @param {Object} propertyData - Property data object
 * @returns {Object} - Analysis results
 */

/**
 * Calculate overall property score (0-100)
 * @param {Object} propertyData - Property data
 * @returns {Object} - Analysis results
 */
export function analyzeProperty(propertyData) {
  console.log('🔍 Analyzing property data:', propertyData);
  
  try {
    const {
      price,
      area,
      rooms,
      bathrooms,
      location,
      features = [],
      coordinates
    } = propertyData;

  // Price efficiency analysis
  const priceAnalysis = analyzePrice(price, area, rooms, location);
  
  // Location analysis
  const locationAnalysis = analyzeLocation(location, coordinates, features);
  
  // Space configuration analysis
  const spaceAnalysis = analyzePropertyFeatures(area, rooms, bathrooms, features);
  
  // Data quality checks
  const dataQuality = checkDataQuality(propertyData);
  
  // Listing quality score
  const listingQuality = assessListingQuality(propertyData);
  
  // Calculate overall score (simplified - focus on efficiency metrics)
  const overallScore = dataQuality.hasCriticalIssues ? 0 : Math.round(
    (priceAnalysis.score * 0.3) + 
    (locationAnalysis.score * 0.3) + 
    (spaceAnalysis.score * 0.4)
  );

  // Generate recommendations
  const recommendations = generateRecommendations(propertyData, {
    priceAnalysis,
    locationAnalysis,
    propertyAnalysis: spaceAnalysis
  });

  // Identify risks and opportunities
  const risks = identifyRisks(propertyData, { priceAnalysis, locationAnalysis, propertyAnalysis: spaceAnalysis });
  const opportunities = identifyOpportunities(propertyData, { priceAnalysis, locationAnalysis, propertyAnalysis: spaceAnalysis });

    return {
      overallScore: {
        score: overallScore,
        explanation: 'Overall score based on price efficiency, location, and space configuration. Score may be 0 if critical data quality issues are detected.'
      },
      priceEfficiency: priceAnalysis,
      spaceConfiguration: spaceAnalysis,
      locationContext: locationAnalysis,
      dataQuality,
      listingQuality,
      recommendations,
      risks,
      opportunities,
      analyzedAt: new Date().toISOString(),
      disclaimer: '⚠️ This analysis is based on listing data only. For market comparisons, investment advice, and validation, consult local real estate professionals.'
    };
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw new Error(`Property analysis failed: ${error.message}`);
  }
}

/**
 * Analyze price efficiency - validated metrics only
 */
function analyzePrice(price, area, rooms, location) {
  if (!price || !area || price <= 0 || area <= 0) {
    return {
      score: 0,
      pricePerM2: null,
      pricePerRoom: null,
      pricePerBedroom: null,
      spaceEfficiency: null,
      costPerBedroom: null,
      dataAvailable: false,
      explanation: 'Price efficiency analysis requires both price and area information. Please verify the property listing contains these details.',
      disclaimer: 'For market comparison, consult local real estate professionals.'
    };
  }

  const pricePerM2 = price / area;
  const pricePerRoom = rooms ? price / rooms : null;
  const pricePerBedroom = rooms ? price / rooms : null; // Assuming rooms = bedrooms for now
  const spaceEfficiency = rooms ? area / rooms : null; // m² per room
  const costPerBedroom = rooms ? price / rooms : null;

  // Calculate efficiency score (0-100) based on space efficiency
  let score = 50;
  if (spaceEfficiency) {
    if (spaceEfficiency > 30) {
      score = 85; // Very spacious
    } else if (spaceEfficiency > 25) {
      score = 70; // Good space
    } else if (spaceEfficiency > 20) {
      score = 60; // Average space
    } else {
      score = 40; // Compact
    }
  }

  return {
    score,
    pricePerM2: Math.round(pricePerM2),
    pricePerRoom: pricePerRoom ? Math.round(pricePerRoom) : null,
    pricePerBedroom: pricePerBedroom ? Math.round(pricePerBedroom) : null,
    spaceEfficiency: spaceEfficiency ? Math.round(spaceEfficiency * 10) / 10 : null,
    costPerBedroom: costPerBedroom ? Math.round(costPerBedroom) : null,
    dataAvailable: true,
    explanation: 'Price efficiency metrics calculated from listing data. These are objective calculations, not market comparisons.',
    disclaimer: '⚠️ For market comparison, consult local real estate professionals or market reports.'
  };
}

/**
 * Analyze location and amenities
 */
function analyzeLocation(location, coordinates, features) {
  if (!location || location.trim() === '') {
    return {
      score: 0,
      neighborhood: 'Location data not available',
      amenities: [],
      transportScore: 0,
      dataAvailable: false,
      explanation: 'Location analysis requires location information. Please verify the property listing includes the address or area.'
    };
  }

  let score = 50;
  let neighborhood = 'Location analysis limited - no detailed area data available';
  let amenities = [];
  let transportScore = 50;

  // Basic location analysis without mock data
  if (location.toLowerCase().includes('centro') || location.toLowerCase().includes('center')) {
    score = 70;
    neighborhood = 'City center location';
    amenities = ['Central location benefits'];
    transportScore = 80;
  } else if (location.toLowerCase().includes('praia') || location.toLowerCase().includes('beach')) {
    score = 75;
    neighborhood = 'Coastal location';
    amenities = ['Beach access'];
    transportScore = 60;
  } else if (location.toLowerCase().includes('histórico') || location.toLowerCase().includes('historic')) {
    score = 65;
    neighborhood = 'Historic area';
    amenities = ['Cultural significance'];
    transportScore = 60;
  } else {
    score = 50;
    neighborhood = 'Standard residential area';
    amenities = [];
    transportScore = 50;
  }

  // Adjust based on available features
  if (features && features.length > 0) {
    if (features.some(f => f.toLowerCase().includes('estacionamento') || f.toLowerCase().includes('parking'))) {
      transportScore += 10;
      amenities.push('Parking available');
    }
    if (features.some(f => f.toLowerCase().includes('transporte') || f.toLowerCase().includes('transport'))) {
      transportScore += 15;
      amenities.push('Public transport access');
    }
  }

  return {
    score: Math.min(100, score),
    neighborhood,
    amenities,
    transportScore: Math.min(100, transportScore),
    dataAvailable: true,
    explanation: 'Location analysis based on available information. For detailed area insights, consult local knowledge or visit the area.'
  };
}

/**
 * Analyze space configuration - validated metrics only
 */
function analyzePropertyFeatures(area, rooms, bathrooms, features) {
  // Space configuration analysis
  const areaPerRoom = (area && rooms) ? area / rooms : null;
  const bathroomRatio = (bathrooms && rooms) ? bathrooms / rooms : null;
  
  // Space efficiency assessment
  let spaceEfficiency = 'standard';
  let spaceEfficiencyNotes = [];
  
  if (areaPerRoom) {
    if (areaPerRoom > 30) {
      spaceEfficiency = 'spacious';
      spaceEfficiencyNotes.push('Excellent space per room');
    } else if (areaPerRoom > 25) {
      spaceEfficiency = 'good';
      spaceEfficiencyNotes.push('Good space per room');
    } else if (areaPerRoom > 20) {
      spaceEfficiency = 'standard';
      spaceEfficiencyNotes.push('Standard space per room');
    } else {
      spaceEfficiency = 'compact';
      spaceEfficiencyNotes.push('Compact space per room');
    }
    
    // Check for unusual configurations
    if (rooms && areaPerRoom < 18) {
      spaceEfficiencyNotes.push(`Unusual: ${rooms} rooms in ${area}m² (typically ${Math.max(1, Math.floor(area / 20))}-bed space)`);
    }
  }
  
  // Bathroom ratio assessment
  let bathroomAssessment = 'standard';
  let bathroomNotes = [];
  
  if (bathroomRatio) {
    if (bathroomRatio >= 1) {
      bathroomAssessment = 'excellent';
      bathroomNotes.push('Excellent bathroom ratio: 1+ bathroom per bedroom');
    } else if (bathroomRatio >= 0.5) {
      bathroomAssessment = 'good';
      bathroomNotes.push(`Good bathroom ratio: ${Math.round(bathroomRatio * 100)}% bathroom per bedroom`);
    } else {
      bathroomAssessment = 'limited';
      bathroomNotes.push(`Limited bathroom ratio: ${Math.round(bathroomRatio * 100)}% bathroom per bedroom`);
    }
  }
  
  // Feature completeness analysis
  const standardFeatures = ['Estacionamento', 'Parking', 'Garagem', 'Garage', 'Aquecimento', 'Heating', 'Cozinha', 'Kitchen'];
  const premiumFeatures = ['Piscina', 'Pool', 'Jardim', 'Garden', 'Terraço', 'Terrace', 'Vista Mar', 'Sea View', 'Elevador', 'Elevator'];
  const modernFeatures = ['Ar Condicionado', 'Air Conditioning', 'Aquecimento Central', 'Central Heating', 'WiFi', 'Wi-Fi'];
  
  const standardCount = features.filter(f => 
    standardFeatures.some(sf => f.toLowerCase().includes(sf.toLowerCase()))
  ).length;
  
  const premiumCount = features.filter(f => 
    premiumFeatures.some(pf => f.toLowerCase().includes(pf.toLowerCase()))
  ).length;
  
  const modernCount = features.filter(f => 
    modernFeatures.some(mf => f.toLowerCase().includes(mf.toLowerCase()))
  ).length;
  
  const totalFeatures = features.length;
  const completenessScore = Math.min(10, Math.round((standardCount / standardFeatures.length) * 5 + (totalFeatures > 5 ? 3 : totalFeatures > 3 ? 2 : 1)));
  
  const includedFeatures = features.length > 0 ? features : [];
  const missingStandardFeatures = standardFeatures.filter(sf => 
    !features.some(f => f.toLowerCase().includes(sf.toLowerCase()))
  );
  
  // Calculate overall score
  let score = 50;
  if (areaPerRoom) {
    if (areaPerRoom > 30) score += 15;
    else if (areaPerRoom > 25) score += 10;
    else if (areaPerRoom > 20) score += 5;
    else score -= 5;
  }
  
  if (bathroomRatio) {
    if (bathroomRatio >= 1) score += 10;
    else if (bathroomRatio >= 0.5) score += 5;
    else score -= 5;
  }
  
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    spaceEfficiency,
    areaPerRoom: areaPerRoom ? Math.round(areaPerRoom * 10) / 10 : null,
    bathroomRatio: bathroomRatio ? Math.round(bathroomRatio * 10) / 10 : null,
    bathroomAssessment,
    spaceEfficiencyNotes,
    bathroomNotes,
    featureCompleteness: {
      score: completenessScore,
      total: totalFeatures,
      included: includedFeatures,
      premium: premiumCount,
      modern: modernCount,
      missingStandard: missingStandardFeatures.slice(0, 3) // Limit to first 3
    }
  };
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(propertyData, analysis) {
  const recommendations = [];
  const { priceAnalysis, locationAnalysis, propertyAnalysis } = analysis;

  // Price-based recommendations
  if (priceAnalysis.score > 80) {
    recommendations.push('Excellent value - consider making an offer quickly');
  } else if (priceAnalysis.score < 40) {
    recommendations.push('Price appears high - negotiate or verify market comparables');
  }

  // Location-based recommendations
  if (locationAnalysis.transportScore > 80) {
    recommendations.push('Excellent transport connectivity - ideal for commuters');
  } else if (locationAnalysis.transportScore < 50) {
    recommendations.push('Limited transport options - consider vehicle access needs');
  }

  // Property-based recommendations
  if (propertyAnalysis.sizeScore > 80) {
    recommendations.push('Spacious property - great for families or home office');
  } else if (propertyAnalysis.sizeScore < 50) {
    recommendations.push('Compact space - verify it meets your space requirements');
  }

  // Feature-based recommendations
  if (propertyData.features.includes('Piscina')) {
    recommendations.push('Pool maintenance costs should be factored into budget');
  }
  if (propertyData.features.includes('Jardim')) {
    recommendations.push('Garden space adds significant value and lifestyle benefits');
  }

  // General recommendations
  recommendations.push('Verify all property details with official documentation');
  recommendations.push('Consider future resale potential and market trends');

  return recommendations;
}

/**
 * Identify potential risks
 */
function identifyRisks(propertyData, analysis) {
  const risks = [];
  const { priceAnalysis, locationAnalysis, propertyAnalysis } = analysis;

  if (priceAnalysis.score < 30) {
    risks.push('Significantly overpriced - may be difficult to resell');
  }

  if (locationAnalysis.transportScore < 40) {
    risks.push('Limited transport access may affect future resale value');
  }

  if (propertyAnalysis.conditionScore < 40) {
    risks.push('Property may require significant maintenance or renovation');
  }

  if (propertyData.area < 50) {
    risks.push('Very small property may limit resale market');
  }

  return risks;
}

/**
 * Identify opportunities
 */
function identifyOpportunities(propertyData, analysis) {
  const opportunities = [];
  const { priceAnalysis, locationAnalysis, propertyAnalysis } = analysis;

  if (priceAnalysis.score > 80) {
    opportunities.push('Strong value proposition - potential for capital appreciation');
  }

  if (locationAnalysis.score > 80) {
    opportunities.push('Premium location with strong rental and resale potential');
  }

  if (propertyAnalysis.featuresScore > 80) {
    opportunities.push('Well-appointed property with modern amenities');
  }

  if (propertyData.features.includes('Piscina') || propertyData.features.includes('Jardim')) {
    opportunities.push('Outdoor amenities add significant lifestyle and resale value');
  }

  return opportunities;
}

/**
 * Check data quality and detect red flags
 */
function checkDataQuality(propertyData) {
  const issues = [];
  const warnings = [];
  let hasCriticalIssues = false;
  
  const { price, area, rooms, bathrooms, location, features = [], images = [], description } = propertyData;
  
  // Critical data checks
  if (!price || price <= 0) {
    issues.push('Missing or invalid price');
    hasCriticalIssues = true;
  } else if (price < 1000) {
    warnings.push('Price seems unusually low - verify data accuracy');
  } else if (price > 10000000) {
    warnings.push('Price seems unusually high - verify data accuracy');
  }
  
  if (!area || area <= 0) {
    issues.push('Missing or invalid area');
    hasCriticalIssues = true;
  } else if (area < 20) {
    warnings.push('Area seems unusually small - verify data accuracy');
  } else if (area > 1000) {
    warnings.push('Area seems unusually large - verify data accuracy');
  }
  
  if (!location || location.trim() === '') {
    issues.push('Missing location');
    hasCriticalIssues = true;
  }
  
  // Consistency checks
  if (price && area && rooms) {
    const pricePerM2 = price / area;
    const areaPerRoom = area / rooms;
    
    if (pricePerM2 < 100) {
      warnings.push('Price per m² seems unusually low - verify property condition');
    } else if (pricePerM2 > 10000) {
      warnings.push('Price per m² seems unusually high - verify location and amenities');
    }
    
    if (areaPerRoom < 10) {
      warnings.push(`Area per room (${areaPerRoom.toFixed(1)}m²) seems small for ${rooms} rooms - verify data accuracy`);
    } else if (areaPerRoom > 100) {
      warnings.push(`Area per room (${areaPerRoom.toFixed(1)}m²) seems large for ${rooms} rooms - verify data accuracy`);
    }
  }
  
  // Missing data checks
  if (!rooms) {
    warnings.push('Room count not specified');
  }
  
  if (!bathrooms) {
    warnings.push('Bathroom count not specified');
  }
  
  if (!features || features.length === 0) {
    warnings.push('No features listed');
  }
  
  if (!images || images.length === 0) {
    warnings.push('No images available');
  } else if (images.length < 3) {
    warnings.push('Limited images available');
  }
  
  if (!description || description.trim().length < 50) {
    warnings.push('Description is missing or too brief');
  }
  
  return {
    hasCriticalIssues,
    issues,
    warnings,
    completeness: {
      price: !!price,
      area: !!area,
      location: !!location,
      rooms: !!rooms,
      bathrooms: !!bathrooms,
      features: features && features.length > 0,
      images: images && images.length > 0,
      description: !!description && description.trim().length > 50
    }
  };
}

/**
 * Assess listing quality score
 */
function assessListingQuality(propertyData) {
  const { price, area, rooms, bathrooms, location, features = [], images = [], description } = propertyData;
  
  let score = 0;
  const details = [];
  const missing = [];
  
  // Data completeness (40 points)
  if (price) { score += 5; details.push('Price'); } else missing.push('Price');
  if (area) { score += 5; details.push('Area'); } else missing.push('Area');
  if (location) { score += 5; details.push('Location'); } else missing.push('Location');
  if (rooms) { score += 5; details.push('Rooms'); } else missing.push('Rooms');
  if (bathrooms) { score += 5; details.push('Bathrooms'); } else missing.push('Bathrooms');
  if (features && features.length > 0) { score += 10; details.push(`${features.length} features`); } else missing.push('Features');
  if (images && images.length > 0) { score += 5; details.push(`${images.length} photos`); } else missing.push('Photos');
  
  // Description quality (20 points)
  if (description) {
    const descLength = description.trim().length;
    if (descLength > 500) {
      score += 20;
      details.push('Detailed description');
    } else if (descLength > 200) {
      score += 15;
      details.push('Good description');
    } else if (descLength > 50) {
      score += 10;
      details.push('Brief description');
    } else {
      score += 5;
      details.push('Minimal description');
    }
  } else {
    missing.push('Description');
  }
  
  // Photo quality indicators (20 points)
  if (images && images.length > 0) {
    if (images.length >= 10) {
      score += 20;
      details.push('Excellent photos');
    } else if (images.length >= 5) {
      score += 15;
      details.push('Good photos');
    } else if (images.length >= 3) {
      score += 10;
      details.push('Adequate photos');
    } else {
      score += 5;
      details.push('Limited photos');
    }
  }
  
  // Feature specificity (20 points)
  if (features && features.length > 0) {
    if (features.length >= 10) {
      score += 20;
      details.push('Comprehensive features');
    } else if (features.length >= 5) {
      score += 15;
      details.push('Good feature list');
    } else if (features.length >= 3) {
      score += 10;
      details.push('Basic features');
    } else {
      score += 5;
      details.push('Minimal features');
    }
  }
  
  score = Math.min(100, score);
  
  return {
    score,
    details,
    missing,
    level: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'
  };
}
