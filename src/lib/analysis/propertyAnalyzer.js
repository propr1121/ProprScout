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

  // Price analysis
  const pricePerM2 = (price && area) ? price / area : null;
  const priceAnalysis = analyzePrice(price, area, location);
  
  // Location analysis
  const locationAnalysis = analyzeLocation(location, coordinates, features);
  
  // Property analysis
  const propertyAnalysis = analyzePropertyFeatures(area, rooms, bathrooms, features);
  
  // Calculate overall score
  const overallScore = Math.round(
    (priceAnalysis.score * 0.3) + 
    (locationAnalysis.score * 0.4) + 
    (propertyAnalysis.score * 0.3)
  );

  // Generate recommendations
  const recommendations = generateRecommendations(propertyData, {
    priceAnalysis,
    locationAnalysis,
    propertyAnalysis
  });

  // Identify risks and opportunities
  const risks = identifyRisks(propertyData, { priceAnalysis, locationAnalysis, propertyAnalysis });
  const opportunities = identifyOpportunities(propertyData, { priceAnalysis, locationAnalysis, propertyAnalysis });

    return {
      overallScore: {
        score: overallScore,
        explanation: 'Overall score is a weighted average of price, location, and property features analysis.'
      },
      priceAnalysis,
      locationAnalysis,
      propertyAnalysis,
      recommendations,
      risks,
      opportunities,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw new Error(`Property analysis failed: ${error.message}`);
  }
}

/**
 * Analyze price and market position
 */
function analyzePrice(price, area, location) {
  if (!price || !area || price <= 0 || area <= 0) {
    return {
      score: 0,
      marketComparison: 'Unable to analyze - missing price or area data',
      valueAssessment: 'Insufficient data for price analysis',
      pricePerM2: null,
      marketAverage: null,
      dataAvailable: false,
      explanation: 'Price analysis requires both price and area information. Please verify the property listing contains these details.'
    };
  }

  const pricePerM2 = price / area;
  
  // Basic price analysis without mock market data
  let score = 50;
  let marketComparison = 'Price analysis limited - no market data available';
  let valueAssessment = 'Unable to compare with market - verify pricing independently';

  // Simple price per m² analysis based on general Portuguese market ranges
  if (pricePerM2 < 1000) {
    score = 90;
    marketComparison = 'Very low price per m²';
    valueAssessment = 'Exceptionally low pricing - verify property condition and location';
  } else if (pricePerM2 < 2000) {
    score = 75;
    marketComparison = 'Low to moderate price per m²';
    valueAssessment = 'Competitive pricing - typical for smaller cities or outskirts';
  } else if (pricePerM2 < 4000) {
    score = 60;
    marketComparison = 'Moderate price per m²';
    valueAssessment = 'Standard pricing for urban areas';
  } else if (pricePerM2 < 6000) {
    score = 40;
    marketComparison = 'High price per m²';
    valueAssessment = 'Premium pricing - typical for prime locations';
  } else {
    score = 20;
    marketComparison = 'Very high price per m²';
    valueAssessment = 'Luxury pricing - verify location and amenities justify cost';
  }

  return {
    score,
    marketComparison,
    valueAssessment,
    pricePerM2: pricePerM2 ? Math.round(pricePerM2) : null,
    marketAverage: null,
    dataAvailable: true,
    explanation: 'Price analysis based on general market ranges. For accurate market comparison, consult local real estate professionals or market reports.'
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
 * Analyze property features and condition
 */
function analyzePropertyFeatures(area, rooms, bathrooms, features) {
  let score = 50;
  let sizeScore = 50;
  let conditionScore = 50;
  let featuresScore = 50;

  // Size analysis
  const areaPerRoom = (area && rooms) ? area / rooms : null;
  if (areaPerRoom && areaPerRoom > 30) {
    sizeScore = 85;
  } else if (areaPerRoom && areaPerRoom > 25) {
    sizeScore = 70;
  } else if (areaPerRoom && areaPerRoom > 20) {
    sizeScore = 60;
  } else if (areaPerRoom) {
    sizeScore = 40;
  } else {
    sizeScore = 50; // Default when no data
  }

  // Bathroom ratio
  const bathroomRatio = (bathrooms && rooms) ? bathrooms / rooms : null;
  if (bathroomRatio && bathroomRatio >= 1) {
    conditionScore += 20;
  } else if (bathroomRatio && bathroomRatio >= 0.5) {
    conditionScore += 10;
  }

  // Features analysis
  const premiumFeatures = ['Piscina', 'Jardim', 'Terraço', 'Vista Mar', 'Elevador'];
  const modernFeatures = ['Ar Condicionado', 'Aquecimento Central', 'WiFi'];
  const convenienceFeatures = ['Estacionamento', 'Garagem', 'Segurança'];

  const premiumCount = features.filter(f => premiumFeatures.includes(f)).length;
  const modernCount = features.filter(f => modernFeatures.includes(f)).length;
  const convenienceCount = features.filter(f => convenienceFeatures.includes(f)).length;

  featuresScore = Math.min(100, 50 + (premiumCount * 15) + (modernCount * 10) + (convenienceCount * 5));

  // Overall property score
  score = Math.round((sizeScore * 0.4) + (conditionScore * 0.3) + (featuresScore * 0.3));

  return {
    score,
    sizeScore,
    conditionScore,
    featuresScore,
    areaPerRoom: areaPerRoom ? Math.round(areaPerRoom * 10) / 10 : null,
    bathroomRatio: bathroomRatio ? Math.round(bathroomRatio * 10) / 10 : null
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
