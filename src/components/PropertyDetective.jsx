// File: src/components/PropertyDetective.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, MapPin, Check, AlertCircle, Lock, Share2 } from 'lucide-react';
import MapboxMap from './MapboxMap';
import UpgradeModal from './UpgradeModal';
import SharePrompt from './SharePrompt';

export default function PropertyDetective() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);

  // Fetch quota on mount
  useEffect(() => {
    fetchQuota();
  }, []);

  async function fetchQuota() {
    try {
      const response = await fetch('http://localhost:3002/api/pricing/user-status?user_id=anonymous');
      const data = await response.json();
      if (data.success) {
        setQuota({
          remaining: data.data.quota.remaining,
          limit: data.data.quota.limit,
          subscription: data.data.subscription
        });
      }
    } catch (error) {
      console.error('Failed to fetch quota:', error);
      // Fallback to mock data
      setQuota({ 
        remaining: 3, 
        limit: 3, 
        subscription: 'free' 
      });
    }
  }

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': ['.jpeg', '.jpg', '.png']},
    maxFiles: 1
  });

  async function handleAnalyze() {
    if (!image) return;
    
    // Check quota before analysis
    if (quota && quota.remaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', image);
      formData.append('user_id', 'anonymous');

      // Call the real Flask backend API
      const response = await fetch('http://localhost:3002/api/detective/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Check if the response contains an error
      if (result.error) {
        throw new Error(`${result.message} (${result.type})`);
      }
      
      // Check if the result has the expected structure
      if (result.coordinates && result.confidence !== undefined) {
        // Add quality indicators
        const qualityResult = {
          ...result,
          quality: {
            confidence: result.confidence,
            confidenceLevel: result.confidence > 0.7 ? 'high' : result.confidence > 0.4 ? 'medium' : 'low',
            warning: result.confidence < 0.3 ? 'Low confidence prediction - results may be inaccurate' : null
          }
        };
        
        setResult(qualityResult);
        setLoading(false);
        
        // Update quota after successful analysis
        if (quota) {
          setQuota(prev => ({
            ...prev,
            remaining: Math.max(0, prev.remaining - 1)
          }));
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setError({
        type: 'analysis',
        message: `Analysis failed: ${error.message}. Please try again or contact support.`
      });
      setLoading(false);
    }
  }

  const handleUpgrade = () => {
    // Redirect to pricing page or handle upgrade
    window.open('/pricing', '_blank');
    setShowUpgradeModal(false);
  };

  const handleCloseModal = () => {
    setShowUpgradeModal(false);
  };

  const handleShowSharePrompt = () => {
    setShowSharePrompt(true);
  };

  const handleCloseSharePrompt = () => {
    setShowSharePrompt(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Property Detective
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Upload any property photo. Get instant location intelligence.
        </p>
        
        {/* Quota Display */}
        {quota && (
          <div className="flex items-center gap-4 justify-center">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full">
              {quota.subscription === 'pro' || quota.subscription === 'annual' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Unlimited Analyses</span>
                </>
              ) : (
                <>
                  <span className="font-medium">
                    {quota.remaining} of {quota.limit} free analyses remaining
                  </span>
                  {quota.remaining === 0 && (
                    <a href="/pricing" className="text-primary-600 hover:underline ml-2">
                      Upgrade →
                    </a>
                  )}
                </>
              )}
            </div>
            
            {/* Share Button */}
            <button
              onClick={handleShowSharePrompt}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="font-medium">Refer & Earn</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload */}
        <div>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-200
              ${isDragActive 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-400 bg-white'
              }
            `}
          >
            <input {...getInputProps()} />
            
            {preview ? (
              <div>
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg shadow-md mb-4"
                />
                <p className="text-sm text-gray-600">
                  Click or drag to replace image
                </p>
              </div>
            ) : (
              <div>
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop property photo here
                </p>
                <p className="text-sm text-gray-600">
                  or click to select from your device
                </p>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!image || loading || (quota && quota.remaining === 0)}
            className="
              w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 
              hover:from-emerald-600 hover:to-emerald-700
              disabled:from-gray-300 disabled:to-gray-400
              text-white text-lg font-semibold py-4 rounded-xl
              shadow-lg hover:shadow-xl
              transform hover:scale-[1.01] active:scale-[0.99]
              transition-all duration-200
              flex items-center justify-center gap-2
              disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing property...</span>
              </>
            ) : quota && quota.remaining === 0 ? (
              <>
                <Lock className="w-5 h-5" />
                <span>Upgrade to Analyze</span>
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                <span>Analyze Property</span>
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className={`mt-4 p-4 rounded-lg ${
              error.type === 'quota' 
                ? 'bg-amber-50 border-l-4 border-amber-500' 
                : 'bg-red-50 border-l-4 border-red-500'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  error.type === 'quota' ? 'text-amber-500' : 'text-red-500'
                }`} />
                <div>
                  <div className={`font-medium ${
                    error.type === 'quota' ? 'text-amber-900' : 'text-red-900'
                  }`}>
                    {error.type === 'quota' ? 'Quota Exceeded' : 'Analysis Failed'}
                  </div>
                  <div className={`text-sm mt-1 ${
                    error.type === 'quota' ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {error.message}
                  </div>
                  {error.type === 'quota' && (
                    <a 
                      href="/pricing" 
                      className="text-sm text-amber-600 hover:underline mt-2 inline-block"
                    >
                      Upgrade for unlimited analyses →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div>
          {result ? (
            <ResultsPanel result={result} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleCloseModal}
        onUpgrade={handleUpgrade}
        userQuota={quota}
      />

      {/* Share Prompt */}
      <SharePrompt
        isOpen={showSharePrompt}
        onClose={handleCloseSharePrompt}
        userQuota={quota}
        userId="anonymous"
      />
    </div>
  );
}

function ResultsPanel({ result }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Map */}
      <MapboxMap 
        coordinates={result.coordinates}
        address={result.address}
        confidence={result.confidence}
      />

      {/* Details */}
      <div className="p-6">
        {/* Quality Warning */}
        {result.quality?.warning && (
          <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800 font-medium">
                  {result.quality.warning}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Location Found
            </h3>
            <p className="text-gray-600">{result.address.formatted}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Confidence</div>
            <div className={`text-2xl font-bold ${
              result.quality?.confidenceLevel === 'high' ? 'text-emerald-500' :
              result.quality?.confidenceLevel === 'medium' ? 'text-amber-500' :
              'text-red-500'
            }`}>
              {(result.confidence * 100).toFixed(0)}%
            </div>
            <div className={`text-xs font-medium ${
              result.quality?.confidenceLevel === 'high' ? 'text-emerald-600' :
              result.quality?.confidenceLevel === 'medium' ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {result.quality?.confidenceLevel === 'high' ? 'High Confidence' :
               result.quality?.confidenceLevel === 'medium' ? 'Medium Confidence' :
               'Low Confidence'}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">City</div>
            <div className="font-medium text-gray-900">
              {result.address.city || 'Unknown'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">District</div>
            <div className="font-medium text-gray-900">
              {result.address.district || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-500 mb-1">GPS Coordinates</div>
          <div className="font-mono text-sm text-gray-900">
            {result.coordinates.lat.toFixed(6)}, {result.coordinates.lon.toFixed(6)}
          </div>
        </div>

        {/* Enrichment Data */}
        {result.enrichment && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Nearby Amenities
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Schools:</span>
                <span className="ml-2 font-medium">{result.enrichment.schools || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Supermarkets:</span>
                <span className="ml-2 font-medium">{result.enrichment.supermarkets || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Restaurants:</span>
                <span className="ml-2 font-medium">{result.enrichment.restaurants || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Transport:</span>
                <span className="ml-2 font-medium">{result.enrichment.transport || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-200 pt-4 mt-4 flex gap-3">
          <button className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium py-2 px-4 rounded-lg transition-colors">
            View Full Report
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium py-2 px-4 rounded-lg transition-colors">
            Save Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center h-full flex items-center justify-center">
      <div>
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Analysis Yet
        </h3>
        <p className="text-gray-600">
          Upload a property photo to get started
        </p>
      </div>
    </div>
  );
}

// Helper function to get auth token (placeholder)
function getToken() {
  // In a real app, this would get the token from localStorage, cookies, etc.
  return 'anonymous-token';
}