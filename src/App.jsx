import React, { useState } from 'react'
import { ArrowRight, Sparkles, TrendingUp, Menu, X, CheckCircle, Camera } from 'lucide-react'
import PropertyInput from './components/PropertyInput'
import PropertyResults from './components/PropertyResults'
import PropertyDetective from './components/PropertyDetective'
import LandingPage from './components/LandingPage'
import { usePropertyAnalysis } from './hooks/usePropertyAnalysis'


function App() {
  const { analyze, loading, error, result, reset } = usePropertyAnalysis();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'detective'
  const [showLandingPage, setShowLandingPage] = useState(true);

  // Show landing page first
  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <header className="bg-gradient-to-br from-primary-50 via-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-500 w-12 h-12 shadow-md" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="44" height="44" viewBox="0 0 1200 750" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'block'}}>
                  <g fill="#FFFFFF" stroke="none">
                    <path d="M669.6,407.4c0,2.6-2.1,4.8-4.8,4.8H600h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.8-64.8c1.9-1.9,4.9-1.9,6.8,0l64.8,64.8c0.9,0.9,1.4,2.1,1.4,3.4V407.4z" fill="#FFFFFF"/>
                    <path d="M600,342.6l-69.6,69.6l61.4,61.4c3,3,8.2,0.9,8.2-3.4V342.6z" fill="#FFFFFF"/>
                    <path d="M600,412.2h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.5-64.5c1.4-1.4,3.7-0.4,3.7,1.5V412.2z" fill="#FFFFFF"/>
                  </g>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-heading">ProprScout</h1>
                <p className="text-xs text-gray-600 -mt-1">Intelligence</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                Features
              </a>
              <button 
                onClick={() => {
                  document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                  Features
                </a>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 w-full"
                >
                  Get Started
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          {/* Hero Title with Gradient */}
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 bg-clip-text text-transparent animate-fade-in font-heading">
            Property Intelligence in Seconds
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-delay">
            Analyze any Portuguese property listing with AI-powered insights. Discover hidden value, verify claims, and make smarter decisions.
          </p>

          {/* CTA Button */}
          <button 
            onClick={() => {
              // Scroll to the property input section
              document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mb-16 animate-fade-in-delay-2"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Start Analyzing
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-fade-in-delay-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">30s</div>
              <div className="text-sm text-gray-600">Analysis time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">10+</div>
              <div className="text-sm text-gray-600">Data points</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">Free</div>
              <div className="text-sm text-gray-600">Forever</div>
            </div>
          </div>
        </div>
      </section>

              {/* Main Content */}
              <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab Navigation */}
                {!result && (
                  <div className="mb-8">
                    <div className="flex justify-center">
                      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                        <button
                          onClick={() => setActiveTab('url')}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                            activeTab === 'url'
                              ? 'bg-primary-500 text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          URL Analysis
                        </button>
                        <button
                          onClick={() => setActiveTab('detective')}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                            activeTab === 'detective'
                              ? 'bg-primary-500 text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Camera className="w-4 h-4" />
                          Property Detective
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Input Component - Hide when results are shown */}
                {!result && activeTab === 'url' && (
                  <PropertyInput 
                    onAnalyze={analyze}
                    loading={loading}
                    error={error}
                  />
                )}

                {/* Property Detective Component */}
                {!result && activeTab === 'detective' && (
                  <PropertyDetective />
                )}

                {/* Success Message */}
                {result && (
                  <div className="mb-8 bg-green-50 border-l-4 border-green-500 rounded-lg p-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-green-900">Analysis Complete!</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Property data has been successfully analyzed. Review the results below.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={reset}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        New Analysis
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                {result && (
                  <PropertyResults 
                    result={result}
                    loading={loading}
                    error={error}
                  />
                )}
              </main>
    </div>
  )
}

export default App
