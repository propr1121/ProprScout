/**
 * Anthropic Claude Service for AI-powered Property Analysis
 * Provides intelligent insights and recommendations for Portuguese real estate
 */

import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger.js';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyze a scraped property listing and generate insights
 * @param {Object} listingData - Scraped listing data
 * @returns {Object} AI-generated analysis
 */
export async function analyzeListingWithAI(listingData) {
  const systemPrompt = `You are a Portuguese real estate analyst specializing in the Portuguese property market.
You provide practical, actionable insights for real estate agents.
Always respond in valid JSON format.
Be specific and avoid generic advice.
Focus on the Portuguese market context, including common practices, pricing trends, and regional characteristics.`;

  const userPrompt = `Analyze this Portuguese property listing and provide insights:

LISTING DATA:
- Title: ${listingData.title || 'Not provided'}
- Price: ${listingData.price ? `€${listingData.price.toLocaleString()}` : 'Not provided'}
- Area: ${listingData.area ? `${listingData.area}m²` : 'Not provided'}
- Price/m²: ${listingData.price && listingData.area ? `€${Math.round(listingData.price / listingData.area).toLocaleString()}/m²` : 'Cannot calculate'}
- Location: ${listingData.location || 'Not provided'}
- Bedrooms: ${listingData.rooms || listingData.bedrooms || 'Not specified'}
- Bathrooms: ${listingData.bathrooms || 'Not specified'}
- Description: ${listingData.description?.substring(0, 500) || 'Not provided'}
- Photo Count: ${listingData.images?.length || listingData.photos?.length || 0}
- Features: ${listingData.features?.join(', ') || 'None listed'}
- Source: ${listingData.url || listingData.sourceUrl || 'Unknown'}

Provide your analysis in this exact JSON format:
{
  "listingQuality": {
    "score": <number 0-100>,
    "summary": "<one sentence assessment>",
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"]
  },
  "pricingInsight": {
    "assessment": "<competitive/fair/premium/unclear>",
    "reasoning": "<2-3 sentences explaining your assessment based on the data provided>",
    "caveat": "This is based on listing data only. Verify with local market comparables."
  },
  "opportunities": [
    "<specific opportunity 1 for agents>",
    "<specific opportunity 2 for agents>",
    "<specific opportunity 3 for agents>"
  ],
  "agentTips": [
    "<actionable tip 1>",
    "<actionable tip 2>",
    "<actionable tip 3>"
  ],
  "marketContext": "<brief context about this type of property in Portugal>"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${userPrompt}`
        }
      ],
    });

    const content = response.content[0].text;

    // Extract JSON from the response (handle potential markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    return JSON.parse(jsonContent);
  } catch (error) {
    logger.error('Anthropic analysis error:', error);

    // Return fallback structure if AI fails
    return {
      listingQuality: {
        score: null,
        summary: 'AI analysis temporarily unavailable',
        strengths: [],
        improvements: []
      },
      pricingInsight: {
        assessment: 'unclear',
        reasoning: 'Unable to generate AI insights at this time.',
        caveat: 'Please try again later.'
      },
      opportunities: ['AI analysis temporarily unavailable'],
      agentTips: ['AI analysis temporarily unavailable'],
      marketContext: 'AI analysis temporarily unavailable',
      error: true
    };
  }
}

/**
 * Generate a quick summary for dashboard display
 * @param {Object} listingData - Scraped listing data
 * @returns {string} Quick summary
 */
export async function generateQuickSummary(listingData) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `You are a real estate analyst. Provide a single sentence summary of this listing: ${listingData.title}, €${listingData.price}, ${listingData.area}m² in ${listingData.location || 'Portugal'}`
        }
      ],
    });

    return response.content[0].text;
  } catch (error) {
    logger.error('Quick summary generation failed:', error);
    return `${listingData.title || 'Property'} - ${listingData.location || 'Portugal'}`;
  }
}

/**
 * Generate comparative analysis between multiple properties
 * @param {Array} properties - Array of property data objects
 * @returns {Object} Comparative analysis
 */
export async function compareProperties(properties) {
  if (!properties || properties.length < 2) {
    return { error: 'At least 2 properties required for comparison' };
  }

  const propertiesSummary = properties.map((p, i) => `
Property ${i + 1}:
- Title: ${p.title || 'Unknown'}
- Price: €${p.price?.toLocaleString() || 'N/A'}
- Area: ${p.area || 'N/A'}m²
- Location: ${p.location || 'Unknown'}
- Rooms: ${p.rooms || p.bedrooms || 'N/A'}
`).join('\n');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Compare these Portuguese properties and provide a JSON analysis:

${propertiesSummary}

Respond with valid JSON in this format:
{
  "bestValue": <property number 1-${properties.length}>,
  "bestValueReason": "<explanation>",
  "comparison": {
    "pricePerM2": [<list of €/m² for each property>],
    "winner": <property number with best price/m²>
  },
  "recommendation": "<which property to consider and why>",
  "considerations": ["<consideration 1>", "<consideration 2>"]
}`
        }
      ],
    });

    const content = response.content[0].text;
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    return JSON.parse(jsonContent);
  } catch (error) {
    logger.error('Property comparison failed:', error);
    return { error: 'Comparison analysis failed' };
  }
}

/**
 * Check if Anthropic API is configured
 * @returns {boolean} Whether API key is set
 */
export function isConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

export default {
  analyzeListingWithAI,
  generateQuickSummary,
  compareProperties,
  isConfigured
};
