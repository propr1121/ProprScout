/**
 * Private Beta Information Page
 * Explains the beta program, how it works, and how to get access via Circle
 */

import React, { useState, useEffect } from 'react';

// Circle community URL
const CIRCLE_COMMUNITY_URL = 'https://comunidade-proprhome.circle.so/join?invitation_token=c6506129244306db30c29cd7d0d39fd1ab193635-221422bd-f77e-4b84-b78c-befe5af7a202';

import {
  Sparkles,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Gift,
  Zap,
  Lock,
  Star,
  ExternalLink
} from 'lucide-react';

export default function PrivateBetaPage({ onBack, onHaveCode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const benefits = [
    {
      icon: Zap,
      title: 'Early Access',
      description: 'Be among the first to use our AI-powered property analysis tools before public launch.'
    },
    {
      icon: Gift,
      title: 'Free Propr Points',
      description: 'Beta members receive complimentary Propr Points to test all features without any cost.'
    },
    {
      icon: MessageCircle,
      title: 'Direct Feedback Channel',
      description: 'Shape the product by sharing feedback directly with our development team.'
    },
    {
      icon: Users,
      title: 'Exclusive Community',
      description: 'Join a community of real estate professionals and early adopters in our Circle space.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Join Our Circle Community',
      description: 'Sign up for our Circle community where beta testers connect and collaborate.'
    },
    {
      number: '2',
      title: 'Receive Your Invite Code',
      description: 'Once approved, you\'ll receive a unique invite code in your Circle welcome message.'
    },
    {
      number: '3',
      title: 'Start Analyzing Properties',
      description: 'Enter your code on ProprScout and begin using our AI-powered analysis tools.'
    }
  ];

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
      <main className="relative pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Lock className="w-4 h-4" />
              Exclusive Access Program
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
              Join the ProprScout
              <span className="text-primary-600"> Private Beta</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Get exclusive early access to our AI-powered property analysis platform.
              Connect with fellow real estate professionals and help shape the future of property intelligence.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all hover:border-primary-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How It Works Section */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 md:p-12 mb-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 font-heading">
                How to Get Access
              </h2>
              <p className="text-gray-600">
                Join our Circle community to receive your exclusive invite code
              </p>
            </div>

            <div className="space-y-0">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-6">
                  {/* Circle and connecting line container */}
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {step.number}
                    </div>
                    {/* Connecting line - centered under the circle */}
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-16 bg-primary-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-2 pb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={CIRCLE_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <Users className="w-5 h-5" />
                Join Circle Community
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
              <button
                onClick={onHaveCode}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-200 hover:border-primary-300 flex items-center justify-center gap-3"
              >
                I Have an Invite Code
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* What is Circle Section */}
          <div className="bg-gradient-to-br from-primary-50/50 to-white rounded-2xl p-8 border border-primary-100/50">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What is Circle?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Circle is our private community platform where ProprScout beta testers connect,
                  share insights, and get direct support from our team. It's where you'll receive
                  your invite code, product updates, and exclusive content.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>Direct team access</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>Feature announcements</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>Community discussions</span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center font-heading">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <h3 className="font-semibold text-gray-900 mb-2">How do I get an invite code?</h3>
                <p className="text-gray-600">Simply join our Circle community and you'll receive your invite code instantly in the welcome email. No waiting required!</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <h3 className="font-semibold text-gray-900 mb-2">Is the beta free?</h3>
                <p className="text-gray-600">Yes! Beta testers receive complimentary Propr Points to fully test all features during the beta period.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <h3 className="font-semibold text-gray-900 mb-2">What happens after the beta ends?</h3>
                <p className="text-gray-600">Beta testers will receive special launch pricing and priority access to new features as a thank you for early support.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-8 border-t border-gray-200/50 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Questions? Reach out to us at{' '}
            <a href="mailto:info@proprhome.com" className="text-primary-600 hover:text-primary-700 font-medium">
              info@proprhome.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
