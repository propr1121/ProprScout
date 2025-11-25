import { useState, useCallback } from 'react';

// Backend API URL - Node.js backend on port 3002
const API_BASE_URL = 'http://localhost:3002';

/**
 * Custom hook for property analysis workflow
 * Uses backend API for full analysis including AI insights
 * @returns {Object} - { analyze, loading, error, result }
 */
export function usePropertyAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Analyze a property from URL using backend API
   * @param {string} url - Property URL
   */
  const analyze = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {

      // Call the backend analyze-url endpoint
      const response = await fetch(`${API_BASE_URL}/api/properties/analyze-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Analysis failed');
      }

      const { propertyData, analysis, analyzedAt, processingTime } = responseData.data;

      // Set the complete result
      const finalResult = {
        propertyData,
        analysis,
        url,
        analyzedAt,
        processingTime
      };

      setResult(finalResult);
    } catch (err) {
      console.error('Property analysis error:', err);

      // Check if it's a network error (backend not running)
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cannot connect to server. Please ensure the backend is running on port 3002.');
      } else {
        setError(err.message || 'An unexpected error occurred while analyzing the property');
      }

      // If backend fails, try local fallback analysis
      try {
        const { scrapeProperty } = await import('../lib/scrapers/propertyScraper.js');
        const { analyzeProperty } = await import('../lib/analysis/propertyAnalyzer.js');

        const propertyData = await scrapeProperty(url);
        const analysis = analyzeProperty(propertyData);

        // Mark as fallback (no AI)
        analysis.aiAnalysis = {
          error: true,
          message: 'AI analysis unavailable - using local analysis'
        };

        setResult({
          propertyData,
          analysis,
          url,
          analyzedAt: new Date().toISOString(),
          isFallback: true
        });
        setError(null); // Clear error if fallback succeeds
      } catch {
        // Keep original error - fallback also failed
      }
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
