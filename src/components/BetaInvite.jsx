/**
 * Beta Invite Component
 * For silent beta testing with 50 selected users
 */

import React, { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight, Gift } from 'lucide-react';

const BetaInvite = ({ isOpen, onClose, onJoin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onJoin(email);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              🔍 You're invited: Property Detective Beta
            </h2>
            
            <p className="text-gray-600">
              You're one of 50 agents selected for early access to our newest feature.
            </p>
          </div>

          {/* Beta Benefits */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Beta Benefits:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">5 free analyses (vs 3 for general users)</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Your feedback shapes the final product</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Locked-in pricing when you upgrade</span>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Upload ANY property photo</p>
              <p>2. Get the address + intelligence in 30 seconds</p>
              <p>3. Use this competitive edge wisely</p>
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* CTA Button */}
          <button
            onClick={handleJoin}
            disabled={!email || loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-400 text-white text-lg font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Joining Beta...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Access Beta Now
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-4">
            This is your competitive edge. Use it wisely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BetaInvite;
