/**
 * Invite Code Page Component
 * Gate page for beta access - requires valid invite code to proceed
 */

import React, { useState, useEffect } from 'react';
import { Key, ArrowRight, CheckCircle, AlertCircle, Loader2, Sparkles, Shield, Users, Lock } from 'lucide-react';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function InviteCodePage({ onValidCode, onBack }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [codeData, setCodeData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Check for code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite') || urlParams.get('code');
    if (inviteCode) {
      setCode(inviteCode.toUpperCase());
      // Auto-validate if code is in URL
      validateCode(inviteCode);
    }
  }, []);

  // Mouse tracking for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateCode = async (codeToValidate = code) => {
    if (!codeToValidate || codeToValidate.length < 4) {
      setError('Please enter a valid invite code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/invite/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: codeToValidate.toUpperCase() })
      });

      const data = await response.json();

      if (data.valid) {
        setSuccess(true);
        setCodeData(data.data);
        // Store the valid code for signup
        sessionStorage.setItem('validInviteCode', codeToValidate.toUpperCase());
        // Wait a moment to show success state
        setTimeout(() => {
          onValidCode(codeToValidate.toUpperCase(), data.data);
        }, 1500);
      } else {
        setError(data.message || 'Invalid or expired invite code');
      }
    } catch (err) {
      setError('Unable to validate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateCode();
  };

  const handleCodeChange = (e) => {
    // Only allow alphanumeric and auto-uppercase
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setCode(value);
    setError('');
  };

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

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(#00d185 1px, transparent 1px),
                           linear-gradient(90deg, #00d185 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 w-12 h-12 flex items-center justify-center">
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
            </div>

            {/* Beta Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Private Beta
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-lg">
          {/* Main Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                success
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600'
              }`}>
                {success ? (
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                ) : (
                  <Lock className="w-10 h-10" />
                )}
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {success ? 'Access Granted!' : 'Private Beta Access'}
              </h2>
              <p className="text-gray-600">
                {success
                  ? 'Welcome to ProprScout. Redirecting you...'
                  : 'Enter your invite code to access ProprScout during our exclusive beta period.'
                }
              </p>
            </div>

            {!success && (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Code Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invite Code
                    </label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={code}
                        onChange={handleCodeChange}
                        placeholder="XXXXXXXX"
                        maxLength={20}
                        className={`w-full pl-12 pr-4 py-4 text-lg font-mono tracking-widest uppercase bg-gray-50 border-2 rounded-xl transition-all duration-300 ${
                          error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200'
                        } focus:ring-4 focus:outline-none`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !code}
                    className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-8">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-gray-400 text-sm">Don't have an invite code?</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* Request Access */}
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Join our waitlist to get early access when spots become available.
                  </p>
                  <a
                    href="mailto:miguel@proprhome.com?subject=Beta%20access%20request%20to%20ProprScout&body=Hi%20Miguel%2C%0A%0AI%20would%20like%20to%20request%20access%20to%20the%20ProprScout%20Beta%20programme.%0A%0AThank%20you!"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Request Access
                  </a>
                </div>
              </>
            )}

            {/* Success State - Code Benefits */}
            {success && codeData && (
              <div className="space-y-4 mt-6">
                {codeData.bonusCredits > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">+{codeData.bonusCredits} Bonus Credits</p>
                      <p className="text-sm text-green-700">Added to your account</p>
                    </div>
                  </div>
                )}
                {codeData.grantsTier && codeData.grantsTier !== 'free' && (
                  <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary-900">{codeData.grantsTier.charAt(0).toUpperCase() + codeData.grantsTier.slice(1)} Access</p>
                      <p className="text-sm text-primary-700">Premium features unlocked</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50">
              <div className="text-2xl font-bold text-primary-600 mb-1">AI</div>
              <div className="text-xs text-gray-600">Powered Analysis</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50">
              <div className="text-2xl font-bold text-primary-600 mb-1">30s</div>
              <div className="text-xs text-gray-600">Per Analysis</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50">
              <div className="text-2xl font-bold text-primary-600 mb-1">10+</div>
              <div className="text-xs text-gray-600">Data Points</div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            ProprScout is currently in private beta.{' '}
            <a href="#" className="text-primary-600 hover:underline">Learn more</a>
          </p>
        </div>
      </main>
    </div>
  );
}
