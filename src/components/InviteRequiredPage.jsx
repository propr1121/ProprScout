/**
 * Invite Required Page
 * Shown when SSO users try to sign in without an existing account during beta
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertCircle,
  Users,
  ArrowRight,
  Key,
  ExternalLink,
  Lock
} from 'lucide-react';

// Circle community URL
const CIRCLE_COMMUNITY_URL = 'https://comunidade-proprhome.circle.so/join?invitation_token=c6506129244306db30c29cd7d0d39fd1ab193635-221422bd-f77e-4b84-b78c-befe5af7a202';

export default function InviteRequiredPage({ onBack, onHaveCode, onLearnMore }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"
          style={{
            top: '10%',
            left: '5%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div
          className="absolute w-80 h-80 bg-primary-300/15 rounded-full blur-3xl"
          style={{
            bottom: '20%',
            right: '10%',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={onBack}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
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
            </button>

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
          {/* Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center">
                <Lock className="w-10 h-10 text-amber-600" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-heading mb-3">
                Invite Code Required
              </h2>
              <p className="text-gray-600 leading-relaxed">
                ProprScout is currently in private beta. To create an account, you'll need an invite code from our Circle community.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Why do I need an invite code?</p>
                  <p className="text-amber-700">
                    We're limiting access to ensure the best experience for early users and gather valuable feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <a
                href={CIRCLE_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Users className="w-5 h-5" />
                Get Invite Code
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>

              <button
                onClick={onHaveCode}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-primary-400 flex items-center justify-center gap-3"
              >
                <Key className="w-5 h-5" />
                I Already Have an Invite Code
              </button>
            </div>

            {/* Learn More Link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Want to learn more about our beta program?{' '}
              <button
                onClick={onLearnMore}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Learn more
              </button>
            </p>
          </div>

          {/* Bottom text */}
          <p className="mt-6 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <button
              onClick={onBack}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
