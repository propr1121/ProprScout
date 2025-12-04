/**
 * Payment API routes
 * Handles Stripe payment integration
 */

import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import {
  sendPaymentConfirmationEmail,
  sendSubscriptionEmail
} from '../utils/email.js';
import { emitCreditsPurchased } from '../services/commandCenter.js';

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

  if (!webhookSecret) {
    logger.warn('Stripe webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    logger.error(`Error processing webhook ${event.type}:`, error);
    // Still return 200 to prevent Stripe retries for application errors
  }

  res.json({ received: true });
});

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  logger.info(`Payment succeeded: ${paymentIntent.id}`);

  const { plan, user_id, user_email } = paymentIntent.metadata || {};

  if (!user_email && !user_id) {
    logger.warn('Payment succeeded but no user identifier in metadata');
    return;
  }

  try {
    // Find user by email or ID
    let user;
    if (user_id) {
      user = await User.findById(user_id);
    } else if (user_email) {
      user = await User.findOne({ email: user_email.toLowerCase() });
    }

    if (!user) {
      logger.warn(`User not found for payment ${paymentIntent.id}`);
      return;
    }

    // Activate subscription
    await user.activateSubscription(
      plan || 'monthly',
      paymentIntent.customer,
      null // No subscription ID for one-time payments
    );

    logger.info(`Subscription activated for user ${user.email}: ${plan}`);

    // Create notification
    await Notification.create({
      user_id: user._id.toString(),
      type: 'payment',
      title: 'Payment Successful',
      message: `Your ${plan === 'annual' ? 'annual' : 'monthly'} subscription is now active. Thank you for upgrading!`,
      icon: 'credit-card',
      read: false
    });

    // Send payment confirmation email
    sendPaymentConfirmationEmail(user.email, user.name, {
      amount: (paymentIntent.amount / 100).toFixed(2),
      currency: paymentIntent.currency?.toUpperCase() || 'EUR',
      plan: plan,
      transactionId: paymentIntent.id
    }).catch(err => {
      logger.error('Failed to send payment confirmation email:', err);
    });

    // Emit Command Center webhook for credits/subscription purchase
    emitCreditsPurchased({
      userId: user._id.toString(),
      email: user.email,
      creditsAdded: plan === 'annual' ? 1000 : 100, // Approximate credits based on plan
      newBalance: user.credits?.balance || 0,
      transactionId: paymentIntent.id,
      paymentMethod: plan === 'annual' ? 'annual_subscription' : 'monthly_subscription'
    }).catch(err => {
      logger.error('Failed to emit credits purchased webhook:', err);
    });

    logger.info(`Payment notification sent to user ${user.email}`);

  } catch (error) {
    logger.error('Error updating user subscription:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  logger.warn(`Payment failed: ${paymentIntent.id}`);

  const { user_id, user_email } = paymentIntent.metadata || {};

  try {
    let user;
    if (user_id) {
      user = await User.findById(user_id);
    } else if (user_email) {
      user = await User.findOne({ email: user_email.toLowerCase() });
    }

    if (user) {
      // Create notification about failed payment
      await Notification.create({
        user_id: user._id.toString(),
        type: 'payment',
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please update your payment method and try again.',
        icon: 'alert-circle',
        read: false
      });

      // Send payment failed email
      sendSubscriptionEmail(user.email, user.name, {
        status: 'payment_failed'
      }).catch(err => {
        logger.error('Failed to send payment failed email:', err);
      });

      logger.info(`Payment failure notification sent to user ${user.email}`);
    }
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

/**
 * Handle subscription updates (created or modified)
 */
async function handleSubscriptionUpdate(subscription) {
  logger.info(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);

  const customerId = subscription.customer;

  try {
    const user = await User.findOne({ 'subscription.stripe_customer_id': customerId });

    if (!user) {
      logger.warn(`User not found for customer ${customerId}`);
      return;
    }

    // Update subscription status
    user.subscription.stripe_subscription_id = subscription.id;
    user.subscription.status = subscription.status === 'active' ? 'active' :
                               subscription.status === 'past_due' ? 'past_due' :
                               subscription.status === 'canceled' ? 'cancelled' : 'incomplete';

    // Update expiration from subscription
    if (subscription.current_period_end) {
      user.subscription.expires_at = new Date(subscription.current_period_end * 1000);
    }

    await user.save();
    logger.info(`Subscription updated for user ${user.email}: ${subscription.status}`);

  } catch (error) {
    logger.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription) {
  logger.info(`Subscription cancelled: ${subscription.id}`);

  const customerId = subscription.customer;

  try {
    const user = await User.findOne({ 'subscription.stripe_customer_id': customerId });

    if (!user) {
      logger.warn(`User not found for customer ${customerId}`);
      return;
    }

    await user.cancelSubscription();

    // Create notification
    await Notification.create({
      user_id: user._id.toString(),
      type: 'subscription',
      title: 'Subscription Cancelled',
      message: `Your subscription has been cancelled. You'll retain access until ${user.subscription.expires_at?.toLocaleDateString() || 'the end of your billing period'}.`,
      icon: 'info',
      read: false
    });

    // Send cancellation email
    sendSubscriptionEmail(user.email, user.name, {
      status: 'cancelled',
      expiresAt: user.subscription.expires_at
    }).catch(err => {
      logger.error('Failed to send cancellation email:', err);
    });

    logger.info(`Subscription cancelled for user ${user.email}`);

  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Handle successful invoice payment (for recurring payments)
 */
async function handleInvoicePaid(invoice) {
  logger.info(`Invoice paid: ${invoice.id}`);

  const customerId = invoice.customer;

  try {
    const user = await User.findOne({ 'subscription.stripe_customer_id': customerId });

    if (!user) {
      return; // Might be a new customer, handled by payment_intent.succeeded
    }

    // Extend subscription
    const plan = user.subscription.plan || 'monthly';
    const expiresAt = new Date();
    if (plan === 'annual') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    user.subscription.expires_at = expiresAt;
    user.subscription.status = 'active';
    await user.save();

    // Create renewal notification
    await Notification.create({
      user_id: user._id.toString(),
      type: 'payment',
      title: 'Subscription Renewed',
      message: `Your ${plan} subscription has been renewed. Next billing date: ${expiresAt.toLocaleDateString()}.`,
      icon: 'check-circle',
      read: false
    });

    // Send renewal email
    sendSubscriptionEmail(user.email, user.name, {
      status: 'renewed',
      plan: plan,
      expiresAt: expiresAt
    }).catch(err => {
      logger.error('Failed to send renewal email:', err);
    });

    logger.info(`Subscription renewed for user ${user.email}`);

  } catch (error) {
    logger.error('Error processing invoice payment:', error);
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoiceFailed(invoice) {
  logger.warn(`Invoice payment failed: ${invoice.id}`);

  const customerId = invoice.customer;

  try {
    const user = await User.findOne({ 'subscription.stripe_customer_id': customerId });

    if (!user) {
      return;
    }

    // Update subscription status
    user.subscription.status = 'past_due';
    await user.save();

    // Create notification
    await Notification.create({
      user_id: user._id.toString(),
      type: 'payment',
      title: 'Payment Failed',
      message: 'We couldn\'t process your subscription payment. Please update your payment method to avoid service interruption.',
      icon: 'alert-triangle',
      read: false
    });

    // Send payment failed email
    sendSubscriptionEmail(user.email, user.name, {
      status: 'payment_failed'
    }).catch(err => {
      logger.error('Failed to send invoice failed email:', err);
    });

    logger.warn(`Invoice payment failed notification sent to user ${user.email}`);

  } catch (error) {
    logger.error('Error handling invoice failure:', error);
  }
}

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

