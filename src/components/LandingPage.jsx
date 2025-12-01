import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Menu, X, Sparkles, ArrowRight, Users, Shield, BarChart3, MapPin, TrendingUp, User, CheckCircle, Calendar, UserPlus, ScanSearch, Navigation2, Target, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

// HubSpot configuration
const HUBSPOT_PORTAL_ID = '145927542';
const HUBSPOT_FORM_ID = '9cee1e3c-909d-40b1-8fe3-ea3088eaa159';
const HUBSPOT_REGION = 'eu1';

function LandingPage({ onEnterApp, onLogin, onSignup }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentCaseStudy, setCurrentCaseStudy] = useState(0);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  // Submit newsletter to HubSpot
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterError('');

    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterError('Please enter a valid email');
      return;
    }

    setNewsletterLoading(true);

    try {
      const response = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            portalId: HUBSPOT_PORTAL_ID,
            formGuid: HUBSPOT_FORM_ID,
            fields: [
              {
                name: 'email',
                value: newsletterEmail
              }
            ],
            context: {
              pageUri: window.location.href,
              pageName: 'ProprScout Landing Page'
            }
          })
        }
      );

      if (response.ok) {
        setNewsletterSuccess(true);
        setNewsletterEmail('');
      } else {
        const data = await response.json();
        setNewsletterError(data.message || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      setNewsletterError('Failed to subscribe. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Case studies data
  const caseStudies = [
    {
      tag: "Investment Success",
      title: "How AI Helped Identify a Profitable Investment in 20 Minutes",
      description: "Learn how ProprScout's AI analysis helped a real estate investor identify an undervalued property and secure a 40% return on investment within 6 months."
    },
    {
      tag: "Market Insights",
      title: "Real-time Market Analysis Powers Faster Decisions",
      description: "A property investment firm used ProprScout's market intelligence to identify emerging neighborhood trends, resulting in a 25% increase in successful acquisitions."
    },
    {
      tag: "Location Intelligence",
      title: "Precision Location Targeting Drives Portfolio Growth",
      description: "By leveraging ProprScout's geospatial analysis, a real estate agency expanded into high-potential markets, growing their portfolio value by 35% in one year."
    }
  ];

  // Handle scroll effects and mouse tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50/40"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
        
        {/* Texture overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 209, 133, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(0, 209, 133, 0.05) 0%, transparent 50%),
                             linear-gradient(45deg, transparent 40%, rgba(0, 209, 133, 0.02) 50%, transparent 60%)`,
            transform: `translate(${mousePosition.x * -0.005}px, ${mousePosition.y * -0.005}px)`,
            transition: 'transform 0.15s ease-out'
          }}
        />
        
        {/* Animated geometric patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 left-20 w-32 h-32 border border-primary-200/20 rotate-45 animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px) rotate(45deg)`,
              transition: 'transform 0.2s ease-out'
            }}
          />
          <div 
            className="absolute top-40 right-32 w-24 h-24 border border-primary-300/30 rotate-12 animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * 0.01}px) rotate(12deg)`,
              transition: 'transform 0.18s ease-out',
              animationDelay: '1s'
            }}
          />
          <div 
            className="absolute bottom-32 left-1/4 w-40 h-40 border border-primary-100/40 rotate-90 animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.01}px) rotate(90deg)`,
              transition: 'transform 0.16s ease-out',
              animationDelay: '2s'
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary-400/20 rounded-full animate-float"
              style={{
                left: `${15 + i * 7}%`,
                top: `${20 + (i % 4) * 15}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + (i % 3)}s`
              }}
            />
          ))}
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={`shape-${i}`}
              className="absolute opacity-10 animate-pulse"
              style={{
                left: `${10 + i * 15}%`,
                top: `${10 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + i}s`
              }}
            >
              {i % 3 === 0 && (
                <div className="w-8 h-8 border-2 border-primary-300 rotate-45" />
              )}
              {i % 3 === 1 && (
                <div className="w-6 h-6 bg-primary-200 rounded-full" />
              )}
              {i % 3 === 2 && (
                <div className="w-4 h-4 border border-primary-400 rotate-12" />
              )}
            </div>
          ))}
        </div>

        {/* Floating lines */}
        <div className="absolute inset-0">
          {[...Array(4)].map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary-300/30 to-transparent animate-pulse"
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + i * 15}%`,
                width: `${100 + i * 20}px`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${6 + i}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <a
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 w-12 h-12 flex items-center justify-center" style={{ padding: '0px' }}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 1200 750"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    display: 'block',
                    width: '48px',
                    height: '48px',
                    transform: 'scale(3)'
                  }}
                >
                  <g fill="#FFFFFF" stroke="none">
                    <path d="M669.6,407.4c0,2.6-2.1,4.8-4.8,4.8H600h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.8-64.8c1.9-1.9,4.9-1.9,6.8,0l64.8,64.8c0.9,0.9,1.4,2.1,1.4,3.4V407.4z" fill="#FFFFFF"/>
                    <path d="M600,342.6l-69.6,69.6l61.4,61.4c3,3,8.2,0.9,8.2-3.4V342.6z" fill="#FFFFFF"/>
                    <path d="M600,412.2h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.5-64.5c1.4-1.4,3.7-0.4,3.7,1.5V412.2z" fill="#FFFFFF"/>
                  </g>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ProprScout</h1>
                <p className="text-xs text-gray-600">Real Estate Intelligence</p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                Features
              </a>
              <a href="#cases" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                Case Studies
              </a>
              <button
                onClick={onLogin || onEnterApp}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={onSignup || onEnterApp}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Free Sign Up
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
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4 pt-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                  Features
                </a>
                <a href="#cases" className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200">
                  Case Studies
                </a>
                <button
                  onClick={onEnterApp}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 w-full flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Free Sign Up
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Premium Business Elements */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 bg-primary-100/80 backdrop-blur-sm text-primary-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-primary-200/50">
              <CheckCircle className="w-4 h-4" />
              Trusted by 500+ Real Estate Professionals
            </div>

            <h1 
              className="text-5xl sm:text-6xl font-bold text-gray-900 font-heading mb-6 leading-relaxed py-2"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(0, 209, 133, 0.1)'
              }}
            >
              AI Property Intelligence Unlocked
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              Convert property listings into actionable market intelligence using enterprise-grade AI
            </p>
            
            {/* Refined CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button 
                onClick={onEnterApp}
                className="group relative bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-base px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 font-semibold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center gap-2">
                  <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Free Sign Up
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
              
              <a 
                href="https://calendar.app.google/iQNpxffmmN6qb4fs6"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 text-base px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 font-semibold border border-gray-200/50 inline-flex items-center justify-center"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Book Demo
                </div>
              </a>
            </div>

            {/* Business metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-primary-600 mb-1">30s</div>
                <div className="text-xs text-gray-600 font-medium">Average Analysis Time</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-primary-600 mb-1">95%</div>
                <div className="text-xs text-gray-600 font-medium">Accuracy Rate</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                <div className="text-2xl font-bold text-primary-600 mb-1">10+</div>
                <div className="text-xs text-gray-600 font-medium">Data Points Analyzed</div>
              </div>
            </div>

          </div>

          {/* Premium Demo Video Section */}
          <div className="relative max-w-6xl mx-auto">
            <div 
              className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border-2 border-white/20"
              style={{
                transform: `scale(${1 + (window.scrollY * 0.0001)})`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              {/* Premium Demo Video */}
              <div className="aspect-video bg-gradient-to-br from-slate-900 via-gray-900 to-primary-900 flex items-center justify-center relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 group-hover:from-primary-500/30 group-hover:to-primary-600/30 transition-all duration-500" />
                
                {/* Animated grid pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                  }} />
                </div>

                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 border-2 border-white/30">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Watch Product Demo</h3>
                  <p className="text-white/80 text-lg mb-4">See ProprScout's AI in action</p>
                  <div className="flex items-center justify-center gap-4 text-sm text-white/60">
                    <span>• Real-time Analysis</span>
                    <span>• Enterprise Security</span>
                    <span>• Advanced AI</span>
                  </div>
                </div>
                
                {/* Premium animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute -top-16 -left-16 w-32 h-32 bg-primary-400/10 rounded-full animate-pulse"
                    style={{ animationDelay: '0s' }}
                  />
                  <div 
                    className="absolute -bottom-16 -right-16 w-40 h-40 bg-primary-300/5 rounded-full animate-pulse"
                    style={{ animationDelay: '1s' }}
                  />
                  <div 
                    className="absolute top-1/2 -right-24 w-20 h-20 bg-white/5 rounded-full animate-pulse"
                    style={{ animationDelay: '2s' }}
                  />
                  <div 
                    className="absolute top-1/4 -left-20 w-16 h-16 bg-primary-200/10 rounded-full animate-pulse"
                    style={{ animationDelay: '3s' }}
                  />
                </div>

                {/* Corner accent elements */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary-400/50" />
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary-400/50" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary-400/50" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary-400/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Enterprise Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 font-heading mb-6">
              For Enterprise Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Delivering up to meter level accuracy, ProprScout is an advanced platform integrating state of the art AI computer vision property analysis models in one easy to use interface.
            </p>
            <p className="text-lg text-gray-500 mt-4">
              Enterprise licensing and pricing information available upon request.
            </p>
            <a 
              href="https://calendar.app.google/iQNpxffmmN6qb4fs6"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              Book Demo
            </a>
            
            {/* Business credibility indicators */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-white/30">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs font-semibold text-gray-700">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-white/30">
                <Shield className="w-3 h-3 text-primary-600" />
                <span className="text-xs font-semibold text-gray-700">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-white/30">
                <Users className="w-3 h-3 text-primary-600" />
                <span className="text-xs font-semibold text-gray-700">500+ Clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Premium Interactions */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 left-10 w-72 h-72 bg-primary-100/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '0s' }}
          />
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
              Transforming data into property intelligence
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced AI models that analyze properties with precision and speed
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Analysis */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 hover:border-primary-200/50 hover:-translate-y-1 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-primary-500 via-primary-500/90 to-primary-600 p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-xl shadow-primary-500/25 ring-1 ring-primary-300/20 group-hover:ring-primary-400/40">
                    <ScanSearch className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-heading">Listing Analysis</h3>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Turn listings into market intelligence</h4>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                ProprScout's cutting edge analysis models allow you to take any property listing URL and determine market value, location insights, and investment potential using only the listing data.
              </p>
            </div>

            {/* Photo Search */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 hover:border-primary-200/50 hover:-translate-y-1 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-primary-500 via-primary-500/90 to-primary-600 p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-xl shadow-primary-500/25 ring-1 ring-primary-300/20 group-hover:ring-primary-400/40">
                    <Navigation2 className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-heading">Photo Search</h3>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Find location from property photos</h4>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                Upload any property photo and our AI will identify the exact location, providing precise geospatial data, neighborhood insights, and proximity to key amenities.
              </p>
            </div>

            {/* Market Insights */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/20 hover:border-primary-200/50 hover:-translate-y-1 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-primary-500 via-primary-500/90 to-primary-600 p-4 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-xl shadow-primary-500/25 ring-1 ring-primary-300/20 group-hover:ring-primary-400/40">
                    <Target className="w-7 h-7 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-heading">Market Insights</h3>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Property targeting</h4>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                Comprehensive market analysis including price trends, comparable properties, and investment opportunities to make informed real estate decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - REMOVED FOR DEMO - Saved in LandingPage_Testimonials_Backup.jsx */}

      {/* Who we are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 font-heading mb-6">
              Made for professionals
            </h2>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Why Real Estate Professionals Deserve the Most Advanced AI
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ProprScout empowers real estate professionals with cutting-edge AI technology to analyze properties faster and more accurately than ever before.
            </p>
            <button className="mt-8 text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200">
              Read More →
            </button>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section id="cases" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg relative">
            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentCaseStudy((prev) => (prev === 0 ? caseStudies.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center group"
              aria-label="Previous insight"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
            </button>
            <button
              onClick={() => setCurrentCaseStudy((prev) => (prev === caseStudies.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center group"
              aria-label="Next insight"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
            </button>

            {/* Case Study Content */}
            <div className="text-center px-12">
              <div className="bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-6 inline-block">
                {caseStudies[currentCaseStudy].tag}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 font-heading mb-6">
                {caseStudies[currentCaseStudy].title}
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {caseStudies[currentCaseStudy].description}
              </p>
              <button className="mt-8 text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200">
                Learn More →
              </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {caseStudies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCaseStudy(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentCaseStudy 
                      ? 'bg-primary-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to insight ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 font-heading mb-6">
              Explore our blog
            </h2>
            <p className="text-xl text-gray-600">
              Hear the latest from the ProprScout community
            </p>
            <button className="mt-4 text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200">
              Check our blog →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="text-sm text-gray-500 mb-2">August 20, 2024</div>
              <h3 className="text-xl font-bold text-gray-900 font-heading mb-3">
                Why Real Estate Professionals Deserve the Most Advanced AI
              </h3>
              <p className="text-gray-600 mb-4 flex-grow">
                Discover how AI is revolutionizing property analysis and market intelligence for real estate professionals.
              </p>
              <button className="text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200 mt-auto">
                Read more →
              </button>
            </article>

            <article className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="text-sm text-gray-500 mb-2">August 1, 2024</div>
              <h3 className="text-xl font-bold text-gray-900 font-heading mb-3">
                Finding Profitable Investments in 20 Minutes: How AI Changes the Game for Real Estate
              </h3>
              <p className="text-gray-600 mb-4 flex-grow">
                Learn how AI-powered property analysis is transforming investment decision-making in real estate.
              </p>
              <button className="text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200 mt-auto">
                Read more →
              </button>
            </article>

            <article className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
              <div className="text-sm text-gray-500 mb-2">April 14, 2024</div>
              <h3 className="text-xl font-bold text-gray-900 font-heading mb-3">
                Getting Started with ProprScout
              </h3>
              <p className="text-gray-600 mb-4 flex-grow">
                ProprScout 1.1 Update - New features and improvements for property analysis.
              </p>
              <button className="text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200 mt-auto">
                Watch Recap →
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* Turn property data into intelligence - Premium CTA */}
      <section 
        className="relative py-32 text-white overflow-hidden"
        style={{
          backgroundImage: 'url(/green-houses-isometric.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto',
          WebkitImageRendering: '-webkit-optimize-quality'
        }}
      >
        {/* Light frosting overlay for text readability and to hide image fidelity issues */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/70 via-primary-500/65 to-primary-600/70"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div 
            className="absolute -inset-16 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.15) 100%)',
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          <div 
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '0s' }}
          />
          <div 
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '3s' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold font-heading mb-6 leading-tight">
            Transforming data into property intelligence.
          </h2>
          <p className="text-lg mb-8 max-w-4xl mx-auto leading-relaxed">
            <strong>ProprScout enables real estate professionals and investors to act swiftly, determining property values and market opportunities within seconds.</strong>
          </p>
          <button 
            onClick={onEnterApp}
            className="group relative bg-white text-primary-600 hover:bg-gray-100 text-base px-8 py-3 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 font-semibold overflow-hidden"
            style={{
              backgroundImage: 'url(/clip-path-group.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
            <div className="relative flex items-center gap-2">
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Try ProprScout
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 w-10 h-10 flex items-center justify-center" style={{ padding: '0px' }}>
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 1200 750"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          display: 'block',
                          width: '36px',
                          height: '36px',
                          transform: 'scale(3)'
                        }}
                      >
                    <g fill="#FFFFFF" stroke="none">
                      <path d="M669.6,407.4c0,2.6-2.1,4.8-4.8,4.8H600h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.8-64.8c1.9-1.9,4.9-1.9,6.8,0l64.8,64.8c0.9,0.9,1.4,2.1,1.4,3.4V407.4z" fill="#FFFFFF"/>
                      <path d="M600,342.6l-69.6,69.6l61.4,61.4c3,3,8.2,0.9,8.2-3.4V342.6z" fill="#FFFFFF"/>
                      <path d="M600,412.2h-69.6v-67.6c0-1.3,0.5-2.5,1.4-3.4l64.5-64.5c1.4-1.4,3.7-0.4,3.7,1.5V412.2z" fill="#FFFFFF"/>
                    </g>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading">ProprScout</h3>
                  <p className="text-sm text-gray-400">Property intelligence</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors duration-200">Terms & Conditions</Link></li>
                <li><Link to="/acceptable-use" className="hover:text-white transition-colors duration-200">Acceptable Use</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 mb-4">Keep up to date with news and content from ProprScout.</p>
              {newsletterSuccess ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Thanks for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit}>
                  <div className="flex">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 rounded-l-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={newsletterLoading}
                    />
                    <button
                      type="submit"
                      disabled={newsletterLoading}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2 rounded-r-lg transition-all duration-200 disabled:opacity-50 flex items-center"
                    >
                      {newsletterLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Subscribe'
                      )}
                    </button>
                  </div>
                  {newsletterError && (
                    <p className="text-red-400 text-sm mt-2">{newsletterError}</p>
                  )}
                </form>
              )}
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-500 text-xs text-center">
              Copyright © 2024 ProprScout, a ProprHome product developed by Hothouse Innovation LDA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage