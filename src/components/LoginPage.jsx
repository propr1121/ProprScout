/**
 * Login Page Component
 * Supports email/password and SSO login
 * Updated to follow ProprScout Design System
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

// Google and LinkedIn SVG icons
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function LoginPage({ onBack, onSwitchToSignup, onSuccess }) {
  const { login, googleAuthUrl, linkedInAuthUrl, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when component mounts or form changes
  useEffect(() => {
    setFormError('');
    clearError();
  }, [formData.email, formData.password, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email) {
      setFormError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setFormError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await login({
      email: formData.email,
      password: formData.password
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess?.();
    } else {
      setFormError(result.error || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = googleAuthUrl;
  };

  const handleLinkedInLogin = () => {
    window.location.href = linkedInAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-emerald-200/30 rotate-45 animate-pulse" />
        <div className="absolute top-40 right-32 w-24 h-24 border border-emerald-300/20 rotate-12 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 border border-emerald-100/40 rotate-90 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your ProprScout account</p>
          </div>

          {/* Error Alert */}
          {(formError || error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{formError || error}</p>
            </div>
          )}

          {/* SSO Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors shadow-sm"
            >
              <GoogleIcon />
              <span className="ml-3 text-gray-700 font-medium">Continue with Google</span>
            </button>

            <button
              onClick={handleLinkedInLogin}
              className="w-full flex items-center justify-center px-4 py-3 bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-colors shadow-sm"
            >
              <LinkedInIcon />
              <span className="ml-3 text-white font-medium">Continue with LinkedIn</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-500/25"
            >
              {(isSubmitting || loading) ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Create account
            </button>
          </p>
        </div>

        {/* Beta Notice */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          ProprScout is currently in beta. By signing in, you agree to our{' '}
          <a href="#" className="text-emerald-600 hover:underline">Terms</a> and{' '}
          <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
