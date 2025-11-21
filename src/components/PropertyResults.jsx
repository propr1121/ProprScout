import React from 'react';
import { 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Star,
  BarChart3,
  Target,
  Lightbulb,
  Sparkles,
  Award,
  Zap,
  Shield,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import MapboxMap from './MapboxMap';

// ProprHome logo component with distinctive house icon
const ProprHomeIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* ProprHome house icon with distinctive extended base/tag shape */}
    <path d="M12 2L3 7v10c0 1.1.9 2 2 2h6v-4h2v4h6c1.1 0 2-.9 2-2V7l-9-5z"/>
    <path d="M8 10h8v6H8v-6z"/>
    <path d="M10 12h4v2h-4v-2z"/>
    {/* Extended base/tag shape on the right side */}
    <path d="M16 12h4v4h-4v-4z"/>
    <path d="M18 14h2v2h-2v-2z"/>
  </svg>
);

/**
 * PropertyResults component to display analysis results
 * @param {Object} props - Component props
 * @param {Object} props.result - Analysis result data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 */
// Helper function to get score color and icon
const getScoreDisplay = (score) => {
  if (score >= 80) return { color: 'text-primary-600', bg: 'bg-primary-50', icon: ArrowUp, trend: 'Excellent' };
  if (score >= 60) return { color: 'text-turquoise-600', bg: 'bg-turquoise-50', icon: ArrowUp, trend: 'Good' };
  if (score >= 40) return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Minus, trend: 'Average' };
  return { color: 'text-red-600', bg: 'bg-red-50', icon: ArrowDown, trend: 'Poor' };
};

// Helper function to get overall score display
const getOverallScoreDisplay = (score) => {
  if (score >= 80) return { 
    color: 'text-primary-600', 
    bg: 'from-primary-500 to-primary-600', 
    icon: Award, 
    label: 'Excellent Investment',
    description: 'This property shows strong potential'
  };
  if (score >= 60) return { 
    color: 'text-turquoise-600', 
    bg: 'from-turquoise-500 to-turquoise-600', 
    icon: Shield, 
    label: 'Good Investment',
    description: 'This property has solid fundamentals'
  };
  if (score >= 40) return { 
    color: 'text-yellow-600', 
    bg: 'from-yellow-500 to-yellow-600', 
    icon: Zap, 
    label: 'Average Investment',
    description: 'This property has mixed potential'
  };
  return { 
    color: 'text-red-600', 
    bg: 'from-red-500 to-red-600', 
    icon: AlertTriangle, 
    label: 'Risky Investment',
    description: 'This property has significant concerns'
  };
};

export default function PropertyResults({ result, loading, error }) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
            </div>
            
            {/* Score Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-12 bg-gray-200 rounded w-16 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Analysis Failed</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { propertyData, analysis } = result;
  // Support both old and new structure for backward compatibility
  const priceEfficiency = analysis.priceEfficiency || analysis.priceAnalysis;
  const locationContext = analysis.locationContext || analysis.locationAnalysis;
  const spaceConfiguration = analysis.spaceConfiguration || analysis.propertyAnalysis;
  const { overallScore, dataQuality, listingQuality, recommendations, risks, opportunities, disclaimer } = analysis;
  const overallDisplay = getOverallScoreDisplay(overallScore.score);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Demo Data Banner */}
      {propertyData.isDemo && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This analysis uses realistic demo data for demonstration purposes. For real property analysis, use actual property URLs from Portuguese real estate websites.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Property Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <ProprHomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{propertyData.title || 'Property Analysis'}</h2>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{propertyData.location || 'Location Unknown'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-3xl font-bold text-emerald-600 mb-4">
              <DollarSign className="w-8 h-8 mr-2" />
              {propertyData.price ? propertyData.price.toLocaleString() : 'N/A'} €
            </div>
          </div>
          
          {/* Premium Overall Score Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 text-center min-w-[200px]">
            <div className="flex items-center justify-center mb-2">
              <overallDisplay.icon className="w-8 h-8 text-emerald-600 mr-2" />
              <span className="text-sm font-semibold text-emerald-800">{overallDisplay.label}</span>
            </div>
            <div className="text-5xl font-bold text-emerald-600 mb-2">{overallScore.score}</div>
            <div className="text-sm text-emerald-700 mb-2">Overall Score</div>
            <div className="text-xs text-emerald-600">{overallDisplay.description}</div>
          </div>
        </div>
        
        {/* Property Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">{propertyData.area || 'N/A'}m²</div>
            <div className="text-sm text-gray-600 font-medium">Area</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">{propertyData.rooms || 'N/A'}</div>
            <div className="text-sm text-gray-600 font-medium">Rooms</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">{propertyData.bathrooms || 'N/A'}</div>
            <div className="text-sm text-gray-600 font-medium">Bathrooms</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {propertyData.price && propertyData.area ? Math.round(propertyData.price / propertyData.area) : 'N/A'}€/m²
            </div>
            <div className="text-sm text-gray-600 font-medium">Price/m²</div>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner */}
      {disclaimer && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800">{disclaimer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Quality Warnings */}
      {dataQuality && (dataQuality.issues.length > 0 || dataQuality.warnings.length > 0) && (
        <div className={`border-l-4 rounded-lg p-4 ${dataQuality.hasCriticalIssues ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${dataQuality.hasCriticalIssues ? 'text-red-400' : 'text-yellow-400'}`} />
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium mb-2 ${dataQuality.hasCriticalIssues ? 'text-red-800' : 'text-yellow-800'}`}>
                {dataQuality.hasCriticalIssues ? 'Critical Data Issues' : 'Data Quality Warnings'}
              </h3>
              {dataQuality.issues.length > 0 && (
                <ul className="list-disc list-inside space-y-1 mb-2">
                  {dataQuality.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-red-700">{issue}</li>
                  ))}
                </ul>
              )}
              {dataQuality.warnings.length > 0 && (
                <ul className="list-disc list-inside space-y-1">
                  {dataQuality.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-yellow-700">{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Premium Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Price Efficiency Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-heading">Price Efficiency</h3>
                <p className="text-sm text-gray-600">Calculated metrics</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-600">{priceEfficiency.score}</div>
              <div className="text-sm text-gray-600">/100</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Efficiency Score</span>
              <span>{priceEfficiency.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${priceEfficiency.score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {priceEfficiency.explanation && (
              <div className="p-4 bg-primary-50 rounded-xl">
                <div className="text-xs text-primary-700">{priceEfficiency.explanation}</div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {priceEfficiency.pricePerM2 && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{priceEfficiency.pricePerM2.toLocaleString()}€</div>
                  <div className="text-xs text-gray-600">Price/m²</div>
                </div>
              )}
              {priceEfficiency.spaceEfficiency && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{priceEfficiency.spaceEfficiency}m²</div>
                  <div className="text-xs text-gray-600">Space/Room</div>
                </div>
              )}
              {priceEfficiency.pricePerRoom && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{priceEfficiency.pricePerRoom.toLocaleString()}€</div>
                  <div className="text-xs text-gray-600">Price/Room</div>
                </div>
              )}
              {priceEfficiency.disclaimer && (
                <div className="col-span-2 p-3 bg-amber-50 rounded-lg">
                  <div className="text-xs text-amber-700">{priceEfficiency.disclaimer}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location Context Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Location Context</h3>
                <p className="text-sm text-gray-600">Area information</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{locationContext.score}</div>
              <div className="text-sm text-gray-600">/100</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Location Score</span>
              <span>{locationContext.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${locationContext.score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-sm font-semibold text-blue-800 mb-1">{locationContext.neighborhood}</div>
              <div className="text-xs text-blue-600">Area context</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{locationContext.transportScore}</div>
                <div className="text-xs text-gray-600">Transport</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{locationContext.amenities.length}</div>
                <div className="text-xs text-gray-600">Amenities</div>
              </div>
            </div>
            {locationContext.explanation && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-700">{locationContext.explanation}</div>
              </div>
            )}
          </div>
        </div>

        {/* Space Configuration Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <ProprHomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Space Configuration</h3>
                <p className="text-sm text-gray-600">Layout analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-600">{spaceConfiguration.score}</div>
              <div className="text-sm text-gray-600">/100</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Configuration Score</span>
              <span>{spaceConfiguration.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${spaceConfiguration.score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-4">
            {spaceConfiguration.areaPerRoom && (
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-sm font-semibold text-purple-800 mb-1">Area per Room</div>
                <div className="text-lg font-bold text-purple-600">{spaceConfiguration.areaPerRoom}m²</div>
                {spaceConfiguration.spaceEfficiency && (
                  <div className="text-xs text-purple-600 mt-1 capitalize">{spaceConfiguration.spaceEfficiency} space</div>
                )}
              </div>
            )}
            
            {spaceConfiguration.bathroomRatio && (
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-sm font-semibold text-purple-800 mb-1">Bathroom Ratio</div>
                <div className="text-lg font-bold text-purple-600">{spaceConfiguration.bathroomRatio}</div>
                {spaceConfiguration.bathroomAssessment && (
                  <div className="text-xs text-purple-600 mt-1 capitalize">{spaceConfiguration.bathroomAssessment} ratio</div>
                )}
              </div>
            )}
            
            {spaceConfiguration.featureCompleteness && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-semibold text-gray-700 mb-1">Features: {spaceConfiguration.featureCompleteness.total} total</div>
                <div className="text-xs text-gray-600">
                  {spaceConfiguration.featureCompleteness.premium > 0 && `${spaceConfiguration.featureCompleteness.premium} premium`}
                  {spaceConfiguration.featureCompleteness.premium > 0 && spaceConfiguration.featureCompleteness.modern > 0 && ', '}
                  {spaceConfiguration.featureCompleteness.modern > 0 && `${spaceConfiguration.featureCompleteness.modern} modern`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listing Quality Card */}
      {listingQuality && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Listing Quality</h3>
              <p className="text-sm text-gray-600">Data completeness assessment</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-4xl font-bold text-indigo-600">{listingQuality.score}</div>
              <div className="text-sm text-gray-600">/100 - {listingQuality.level}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            {listingQuality.details.length > 0 && (
              <div className="p-4 bg-indigo-50 rounded-xl">
                <div className="text-sm font-semibold text-indigo-800 mb-2">Included:</div>
                <div className="flex flex-wrap gap-2">
                  {listingQuality.details.map((detail, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">{detail}</span>
                  ))}
                </div>
              </div>
            )}
            {listingQuality.missing && listingQuality.missing.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="text-sm font-semibold text-amber-800 mb-2">Missing:</div>
                <div className="flex flex-wrap gap-2">
                  {listingQuality.missing.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">{item}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Smart Recommendations</h3>
              <p className="text-gray-600">AI-powered insights for better decisions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-yellow-800">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Analysis Grid - Responsive layout for better optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Risks */}
        {risks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Potential Risks</h3>
                <p className="text-sm text-gray-600">Important considerations</p>
              </div>
            </div>
            <div className="space-y-3">
              {risks.map((risk, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-red-800">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Opportunities</h3>
                <p className="text-sm text-gray-600">Growth potential</p>
              </div>
            </div>
            <div className="space-y-3">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Target className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-emerald-800">{opportunity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Property Features */}
        {propertyData.features && propertyData.features.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
                <ProprHomeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Property Features</h3>
                <p className="text-sm text-gray-600">Available amenities</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {propertyData.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200"
                >
                  <ProprHomeIcon className="w-3 h-3" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
