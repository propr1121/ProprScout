import { useState, useCallback } from 'react';
import { parsePropertyUrl } from '../lib/scrapers/urlParser';
import { scrapeProperty } from '../lib/scrapers/propertyScraper';
import { analyzeProperty } from '../lib/analysis/propertyAnalyzer';

/**
 * Custom hook for property analysis workflow
 * @returns {Object} - { analyze, loading, error, result }
 */
export function usePropertyAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Analyze a property from URL
   * @param {string} url - Property URL
   */
  const analyze = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Scrape property data using robust scraper
      const propertyData = await scrapeProperty(url);
      
            // Analyze the property data
            console.log('🔍 Starting analysis for property data:', propertyData);
            const analysis = analyzeProperty(propertyData);
            console.log('✅ Analysis completed:', analysis);
            
            // Set the complete result
            const result = { 
              propertyData, 
              analysis,
              url: url,
              analyzedAt: new Date().toISOString()
            };
            console.log('📊 Setting result:', result);
            setResult(result);
    } catch (err) {
      console.error('Property analysis error:', err);
      // Ensure we always set a user-friendly error message
      const errorMessage = err.message || 'An unexpected error occurred while analyzing the property';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset the analysis state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  /**
   * Clear only the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    analyze, 
    reset,
    clearError,
    loading, 
    error, 
    result 
  };
}
