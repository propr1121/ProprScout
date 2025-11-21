/**
 * Share Prompt Component
 * Referral system with incentives
 */

import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, Gift, Crown, Share2, ArrowRight } from 'lucide-react';

const SharePrompt = ({ isOpen, onClose, userQuota, userId = 'anonymous' }) => {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Generate referral link
      const baseUrl = window.location.origin;
      const referralCode = generateReferralCode(userId);
      setReferralLink(`${baseUrl}?ref=${referralCode}`);
      
      // Fetch user's referral count
      fetchReferralCount(userId);
    }
  }, [isOpen, userId]);

  const generateReferralCode = (userId) => {
    // Generate a unique referral code
    return btoa(userId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  };

  const fetchReferralCount = async (userId) => {
    try {
      // Mock referral count for now
      setReferralCount(Math.floor(Math.random() * 3));
    } catch (error) {
      console.error('Failed to fetch referral count:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = (platform) => {
    const text = "Check out ProprScout Photo Location Search - upload any property photo and get instant location intelligence! 🏠";
    const url = referralLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Check out ProprScout Photo Location Search&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-fade-in">
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
              <Share2 className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Found this useful? Refer a colleague!
            </h2>
            
            <p className="text-gray-600">
              Share ProprScout and earn bonus analyses for both of you
            </p>
          </div>

          {/* Referral Link */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your referral link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Incentive Box */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Referral Rewards
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">They get 1 bonus analysis</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">You get 1 bonus analysis</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">At 5 referrals, upgrade to Pro FREE for 1 month</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          {referralCount > 0 && (
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-700">Your referrals</span>
                <span className="text-sm text-primary-600">{referralCount}/5</span>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(referralCount / 5) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-primary-600 mt-2">
                {5 - referralCount} more referrals to unlock free Pro month
              </p>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Share on social media</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <div className="w-5 h-5 bg-blue-600 rounded"></div>
                LinkedIn
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <div className="w-5 h-5 bg-blue-400 rounded"></div>
                Twitter
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
              >
                <div className="w-5 h-5 bg-green-500 rounded"></div>
                WhatsApp
              </button>
              
              <button
                onClick={() => handleShare('email')}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
              >
                <div className="w-5 h-5 bg-gray-500 rounded"></div>
                Email
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Share with your network and earn bonus analyses!
            </p>
            
            <button
              onClick={onClose}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Continue analyzing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePrompt;
