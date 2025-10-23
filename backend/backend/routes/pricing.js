/**
 * Pricing and Subscription API routes
 */

import express from 'express';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/pricing/plans
 * Get available subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free Plan',
        type: 'free',
        price: {
          monthly: 0,
          annual: 0
        },
        features: {
          analyses_per_month: 3,
          basic_location_detection: true,
          address_lookup: true,
          map_view: true,
          analysis_history_limit: 10,
          advanced_features: false,
          property_type_detection: false,
          feature_detection: false,
          neighborhood_analysis: false,
          comparable_properties: false,
          export_pdf: false,
          api_access: false,
          priority_support: false,
          no_watermarks: false
        },
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro Plan',
        type: 'pro',
        price: {
          monthly: 29,
          annual: 290
        },
        features: {
          analyses_per_month: 1000, // Unlimited
          basic_location_detection: true,
          address_lookup: true,
          map_view: true,
          analysis_history_limit: -1, // Unlimited
          advanced_features: true,
          property_type_detection: true,
          feature_detection: true,
          neighborhood_analysis: true,
          comparable_properties: true,
          export_pdf: true,
          api_access: true,
          api_requests_per_hour: 10,
          priority_support: true,
          no_watermarks: true
        },
        popular: true
      },
      {
        id: 'annual',
        name: 'Annual Plan',
        type: 'annual',
        price: {
          monthly: 24,
          annual: 290
        },
        features: {
          analyses_per_month: 1000, // Unlimited
          basic_location_detection: true,
          address_lookup: true,
          map_view: true,
          analysis_history_limit: -1, // Unlimited
          advanced_features: true,
          property_type_detection: true,
          feature_detection: true,
          neighborhood_analysis: true,
          comparable_properties: true,
          export_pdf: true,
          api_access: true,
          api_requests_per_hour: 10,
          priority_support: true,
          no_watermarks: true
        },
        popular: false,
        savings: {
          percentage: 17,
          months_free: 2
        }
      }
    ];

    res.json({
      success: true,
      data: {
        plans,
        currency: 'EUR',
        billing_cycle: 'monthly'
      }
    });

  } catch (error) {
    logger.error('Get pricing plans failed:', error);
    res.status(500).json({
      error: 'Get pricing plans failed',
      message: error.message
    });
  }
});

/**
 * GET /api/pricing/features
 * Get feature comparison
 */
router.get('/features', async (req, res) => {
  try {
    const features = [
      {
        name: 'Monthly Analyses',
        free: '3',
        pro: 'Unlimited',
        annual: 'Unlimited'
      },
      {
        name: 'Location Detection',
        free: 'Basic',
        pro: 'Advanced',
        annual: 'Advanced'
      },
      {
        name: 'Address Lookup',
        free: '✓',
        pro: '✓',
        annual: '✓'
      },
      {
        name: 'Map View',
        free: '✓',
        pro: '✓',
        annual: '✓'
      },
      {
        name: 'Analysis History',
        free: 'Last 10',
        pro: 'Unlimited',
        annual: 'Unlimited'
      },
      {
        name: 'Property Type Detection',
        free: '✗',
        pro: '✓',
        annual: '✓'
      },
      {
        name: 'Feature Detection',
        free: '✗',
        pro: '✓',
        annual: '✓'
      },
      {
        name: 'Neighborhood Analysis',
        free: '✗',
        pro: '✓',
        annual: '✓'
      },
      {
        name: 'Comparable Properties',
        free: '✗',
        pro: '✓',
        annual: '✓'
      },
      {
        name: 'PDF Export',
        free: '✗',
        pro: '✓',
        annual: '✓'
      },
      {
        name: 'API Access',
        free: '✗',
        pro: '10/hour',
        annual: '10/hour'
      },
      {
        name: 'Priority Support',
        free: '✗',
        pro: '✓',
        annual: '✓'
      },
      {
        name: 'No Watermarks',
        free: '✗',
        pro: '✓',
        annual: '✓'
      }
    ];

    res.json({
      success: true,
      data: {
        features,
        plans: ['free', 'pro', 'annual']
      }
    });

  } catch (error) {
    logger.error('Get pricing features failed:', error);
    res.status(500).json({
      error: 'Get pricing features failed',
      message: error.message
    });
  }
});

/**
 * GET /api/pricing/user-status
 * Get user's current subscription status
 */
router.get('/user-status', async (req, res) => {
  try {
    const { user_id = 'anonymous' } = req.query;
    
    const user = await User.findById(user_id);
    if (!user) {
      return res.json({
        success: true,
        data: {
          subscription: 'free',
          plan: null,
          quota: {
            used: 0,
            limit: 3,
            remaining: 3
          },
          features: {
            analyses_per_month: 3,
            analysis_history_limit: 10
          }
        }
      });
    }

    const quota = user.quota_status;
    
    res.json({
      success: true,
      data: {
        subscription: user.subscription.type,
        plan: user.subscription.plan,
        quota: {
          used: quota.used,
          limit: quota.limit,
          remaining: quota.remaining
        },
        features: {
          analyses_per_month: quota.limit,
          analysis_history_limit: user.subscription.type === 'free' ? 10 : -1
        },
        expires_at: user.subscription.expires_at,
        status: user.subscription.status
      }
    });

  } catch (error) {
    logger.error('Get user status failed:', error);
    res.status(500).json({
      error: 'Get user status failed',
      message: error.message
    });
  }
});

/**
 * POST /api/pricing/upgrade
 * Handle subscription upgrade
 */
router.post('/upgrade', async (req, res) => {
  try {
    const { user_id, plan_type, billing_cycle } = req.body;
    
    if (!user_id || !plan_type) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'user_id and plan_type are required'
      });
    }

    // For now, return a mock upgrade response
    // In production, this would integrate with Stripe
    const upgradeResponse = {
      success: true,
      data: {
        subscription_id: `sub_${Date.now()}`,
        plan_type,
        billing_cycle,
        status: 'pending',
        checkout_url: `https://checkout.stripe.com/pay/cs_${Date.now()}`,
        message: 'Redirect to Stripe checkout to complete upgrade'
      }
    };

    res.json(upgradeResponse);

  } catch (error) {
    logger.error('Upgrade subscription failed:', error);
    res.status(500).json({
      error: 'Upgrade subscription failed',
      message: error.message
    });
  }
});

/**
 * GET /api/pricing/faq
 * Get frequently asked questions
 */
router.get('/faq', async (req, res) => {
  try {
    const faq = [
      {
        question: 'How many analyses can I perform with the Free plan?',
        answer: 'The Free plan includes 3 property analyses per month. Each analysis includes location detection, address lookup, and map visualization.'
      },
      {
        question: 'What happens if I exceed my monthly limit?',
        answer: 'If you exceed your monthly limit, you\'ll need to wait until the next month or upgrade to a Pro or Annual plan for unlimited analyses.'
      },
      {
        question: 'Can I cancel my subscription anytime?',
        answer: 'Yes, you can cancel your subscription anytime. You\'ll continue to have access to Pro features until the end of your current billing period.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our secure Stripe payment processor.'
      },
      {
        question: 'Is there a free trial for Pro features?',
        answer: 'Yes! New users get 3 free analyses to try our service. After that, you can upgrade to Pro for unlimited analyses and advanced features.'
      },
      {
        question: 'What\'s the difference between Pro and Annual plans?',
        answer: 'Both plans include the same features, but the Annual plan saves you 17% (€58 per year) and includes 2 months free compared to monthly Pro billing.'
      }
    ];

    res.json({
      success: true,
      data: { faq }
    });

  } catch (error) {
    logger.error('Get FAQ failed:', error);
    res.status(500).json({
      error: 'Get FAQ failed',
      message: error.message
    });
  }
});

export default router;
