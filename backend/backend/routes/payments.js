/**
 * Payment API routes
 * Handles Stripe payment integration
 */

import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize Stripe with secret key
// Only initialize if key is provided to avoid errors
let stripe = null;
try {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && stripeKey !== 'sk_test_...' && stripeKey.startsWith('sk_') && stripeKey.length > 10) {
    stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }
} catch (error) {
  logger.warn('Stripe initialization failed:', error.message);
}

/**
 * POST /api/payments/create-intent
 * Create a Stripe Payment Intent
 */
router.post('/create-intent', async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe API key is not configured',
        message: 'Please set STRIPE_SECRET_KEY in backend/backend/.env file. See STRIPE_SETUP.md for instructions.'
      });
    }

    const { plan } = req.body; // 'annual' or 'monthly'

    if (!plan || !['annual', 'monthly'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan. Must be "annual" or "monthly"'
      });
    }

    // Pricing in cents (convert euros to cents)
    const prices = {
      annual: 29000, // €290 = 29,000 cents
      monthly: 2900, // €29 = 2,900 cents
    };

    const amount = prices[plan];

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always', // Enable PayPal and other redirect-based payment methods
      },
      metadata: {
        plan: plan,
        plan_type: plan === 'annual' ? 'annual' : 'monthly',
      },
    });

    logger.info(`Payment intent created: ${paymentIntent.id} for plan: ${plan}`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    logger.error('Payment intent creation failed:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create payment intent';
    if (error.message && error.message.includes('Invalid API Key')) {
      errorMessage = 'Stripe API key is not configured. Please set STRIPE_SECRET_KEY in backend/.env';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      message: error.message || 'Payment intent creation failed'
    });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      logger.info(`Payment succeeded: ${paymentIntent.id}`);
      // TODO: Update user subscription in database
      // TODO: Send confirmation email
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      logger.warn(`Payment failed: ${failedPayment.id}`);
      // TODO: Handle failed payment
      break;
    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * GET /api/payments/status/:paymentIntentId
 * Get payment status
 */
router.get('/status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    });

  } catch (error) {
    logger.error('Payment status retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment status',
      message: error.message
    });
  }
});

export default router;

