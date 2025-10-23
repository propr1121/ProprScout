/**
 * Upgrade Modal Component
 * Shown when user exceeds free quota
 */

import React from 'react';
import { X, Check, Crown, Star, Zap, ArrowRight } from 'lucide-react';

const UpgradeModal = ({ isOpen, onClose, onUpgrade, userQuota }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              You've used all {userQuota?.limit || 3} free analyses this month! 🎉
            </h3>
            
            <p className="text-gray-600">
              Upgrade to Pro for unlimited property intelligence
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">Unlimited analyses</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">Advanced features coming soon</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">Full analysis history</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">Property type detection</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">PDF export</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">Priority support</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-primary-700">Most Popular</span>
              </div>
              
              <div className="text-3xl font-bold text-gray-900 mb-1">
                €29<span className="text-lg text-gray-600">/month</span>
              </div>
              
              <div className="text-sm text-gray-600">
                or €290/year (save 17%)
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-lg font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 mb-4"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Pro - €29/month
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Guarantee */}
          <p className="text-center text-sm text-gray-500">
            14-day money-back guarantee
          </p>

          {/* Alternative */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Need more time? Your quota resets next month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
