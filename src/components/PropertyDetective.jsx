/**
 * Property Detective - GeoSpy-Inspired UI
 * Main orchestrator component for image geolocation analysis
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Upload, History, MessageSquare, AlertCircle, Coins } from 'lucide-react';
import axios from 'axios';

// Detective components
import {
  UploadModal,
  SearchingOverlay,
  ResultsSidebar,
  LazyMapView,
  StreetViewComparison
} from './detective';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function PropertyDetective() {
  const { user, token, isAuthenticated } = useAuth();

  // UI State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'street'

  // Data State
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState(null);

  // Fetch user quota on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchQuota();
    }
  }, [isAuthenticated, token]);

  const fetchQuota = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/detective/quota`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setQuota(response.data);
    } catch (err) {
      console.error('Failed to fetch quota:', err);
      // Set default quota for non-authenticated users
      setQuota({
        remaining: user?.credits?.balance || 0,
        limit: 15,
        subscription: user?.subscription?.type || 'free'
      });
    }
  };

  const handleUploadSubmit = useCallback(async ({ file, filename: name }) => {
    if (!isAuthenticated) {
      setError('Please log in to use Property Detective');
      return;
    }

    setShowUploadModal(false);
    setIsSearching(true);
    setError(null);
    setFilename(name);

    // Create preview
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${API_URL}/api/detective/analyze`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const data = response.data;

      // Add quality indicators
      const qualityResult = {
        ...data,
        quality: {
          confidence: data.confidence,
          confidenceLevel: data.confidence > 0.7 ? 'high' : data.confidence > 0.4 ? 'medium' : 'low',
          warning: data.confidence < 0.3 ? 'Low confidence prediction - results may be inaccurate' : null
        }
      };

      setResult(qualityResult);
      setUploadedImage(data.image_url || preview);
      setShowResults(true);

      // Refresh quota
      fetchQuota();
    } catch (err) {
      console.error('Analysis failed:', err);

      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Analysis failed. Please try again.';

      // Check for quota error
      if (err.response?.status === 403 && err.response?.data?.error === 'quota_exceeded') {
        setError({
          type: 'quota',
          message: 'You have used all your free analyses. Please upgrade to continue.'
        });
      } else {
        setError({
          type: 'analysis',
          message: errorMessage
        });
      }
    } finally {
      setIsSearching(false);
    }
  }, [token, isAuthenticated]);

  const handleDownloadPDF = async () => {
    if (!result || !result.analysisId) {
      alert('No analysis result to export');
      return;
    }

    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${API_URL}/api/detective/export/${result.analysisId}`,
        { headers }
      );

      if (response.data.success && response.data.data.html) {
        // Create a new window with the HTML content
        const printWindow = window.open('', '_blank');
        printWindow.document.write(response.data.data.html);
        printWindow.document.close();

        // Give time for images to load, then trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleSearchCity = (city) => {
    // TODO: Navigate to property search with city filter
    console.log('Search in:', city);
    if (city) {
      window.open(`https://www.google.com/maps/search/properties+in+${encodeURIComponent(city)}`, '_blank');
    }
  };

  const handleNewSearch = () => {
    // Reset state for new search
    setResult(null);
    setShowResults(false);
    setShowStreetView(false);
    setError(null);

    // Clean up preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setUploadedImage(null);
    setFilename('');

    // Open upload modal
    setShowUploadModal(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const handleStreetView = () => {
    setShowStreetView(true);
    setShowResults(false);
  };

  const handleBackFromStreetView = () => {
    setShowStreetView(false);
    setShowResults(true);
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="relative h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-[#00d185]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#00d185]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Property Detective</h2>
          <p className="text-gray-400 mb-6">
            Upload any property photo and our AI will predict its location worldwide.
          </p>
          <a
            href="/login"
            className="inline-block bg-[#00d185] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00b574] transition-colors"
          >
            Log in to get started
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Map (always visible in background) - lazy loaded for better initial bundle size */}
      <LazyMapView
        center={result?.coordinates}
        showRadius={!!result}
        confidenceRadius={25000}
        viewMode={viewMode === '3d' ? '3d' : 'map'}
        markerImageUrl={result ? uploadedImage : null}
      />

      {/* Left Sidebar - Action buttons */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-2 space-y-2">
          <button
            onClick={handleNewSearch}
            className="p-3 rounded-lg bg-[#00d185] text-white hover:bg-[#00b574] transition-colors"
            title="New Search"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
            title="Upload Image"
          >
            <Upload size={20} />
          </button>
          <button
            className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
            title="History"
          >
            <History size={20} />
          </button>
          <button
            className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
            title="Chat"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* View Mode Toggle (only when results) */}
      {result && !showStreetView && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-1 flex">
            <button
              onClick={() => setShowStreetView(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showStreetView
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Street View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map' && !showStreetView
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Map View
            </button>
          </div>
        </div>
      )}

      {/* Credits Display */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] px-4 py-2 flex items-center gap-2">
          <Coins size={16} className="text-[#00d185]" />
          <span className="text-gray-400 text-sm">Credits: </span>
          <span className="text-white font-medium">
            {quota?.remaining ?? user?.credits?.balance ?? 0}
          </span>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadSubmit}
      />

      {/* Searching Overlay */}
      <SearchingOverlay
        isVisible={isSearching}
        imagePreview={imagePreview}
      />

      {/* Results Sidebar */}
      <ResultsSidebar
        isOpen={showResults}
        onClose={handleCloseResults}
        result={result}
        imageUrl={uploadedImage}
        filename={filename}
        onSearchCity={handleSearchCity}
        onDownloadPDF={handleDownloadPDF}
        onStreetView={handleStreetView}
      />

      {/* Street View Comparison */}
      <StreetViewComparison
        coordinates={result?.coordinates}
        uploadedImage={uploadedImage}
        onBack={handleBackFromStreetView}
        isVisible={showStreetView}
      />

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            error.type === 'quota'
              ? 'bg-yellow-500/90 text-black'
              : 'bg-red-500/90 text-white'
          }`}>
            <AlertCircle size={20} />
            <span>{error.message}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 font-medium hover:underline"
            >
              Dismiss
            </button>
            {error.type === 'quota' && (
              <a
                href="/pricing"
                className="ml-2 font-medium underline"
              >
                Upgrade
              </a>
            )}
          </div>
        </div>
      )}

      {/* Initial state - prompt to upload */}
      {!result && !isSearching && !showUploadModal && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-[#1a1a1a]/90 backdrop-blur-sm rounded-xl border border-[#2a2a2a] p-8 text-center max-w-md pointer-events-auto">
            <div className="w-16 h-16 bg-[#00d185]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-[#00d185]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Property Detective
            </h2>
            <p className="text-gray-400 mb-6">
              Upload a property photo to discover its location using AI-powered geolocation.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#00d185] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00b574] transition-colors"
            >
              Upload Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
