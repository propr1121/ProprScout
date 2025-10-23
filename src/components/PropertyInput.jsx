import React, { useState } from 'react';
import { Search, Link2, Loader2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * PropertyInput component for URL input and analysis
 * @param {Object} props - Component props
 * @param {Function} props.onAnalyze - Callback when analyze is clicked
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 */
export default function PropertyInput({ onAnalyze, loading, error }) {
  const [url, setUrl] = useState('');

  const exampleUrls = [
    'https://www.idealista.pt/imovel/33456789/',
    'https://www.imovirtual.com/anuncios/12345678-ID12345678.html',
    'https://www.supercasa.pt/imovel/12345678'
  ];

  const handleAnalyze = () => {
    if (url.trim() && !loading) {
      onAnalyze(url.trim());
    }
  };

  const handleExampleClick = (exampleUrl) => {
    setUrl(exampleUrl);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && url.trim() && !loading) {
      handleAnalyze();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <Search className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Analyze Any Property</h2>
          <p className="text-sm text-gray-500">Get instant intelligence on any listing</p>
        </div>
      </div>

      {/* URL Input */}
      <div className="relative mb-4">
        <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="https://www.idealista.pt/imovel/33456789/"
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-red-900">Could not analyze property</div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <button 
        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-lg font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={handleAnalyze}
        disabled={!url.trim() || loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing property...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Analyze Property</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

              {/* Examples Section */}
              <div className="border-t border-gray-200 my-6">
                <p className="text-sm text-gray-500 mb-4">Try these example formats:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleUrls.map((exampleUrl, index) => (
                    <button
                      key={index}
                      className="text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      onClick={() => handleExampleClick(exampleUrl)}
                      disabled={loading}
                    >
                      {exampleUrl.includes('idealista') ? 'Idealista' : exampleUrl.includes('imovirtual') ? 'Imovirtual' : 'Supercasa'} format →
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Demo Mode:</strong> These are example URL formats, not real property listings.<br />
                    For real analysis, use actual property URLs from Portuguese real estate websites.
                  </p>
                </div>
              </div>

      {/* Feature Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-1">30s</div>
          <div className="text-sm text-gray-600 font-medium">Analysis time</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-1">10+</div>
          <div className="text-sm text-gray-600 font-medium">Data points</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-1">Free</div>
          <div className="text-sm text-gray-600 font-medium">Forever</div>
        </div>
      </div>
    </div>
  );
}
