/**
 * MongoDB model for Users with Property Detective features
 * Includes authentication, SSO, and invite code support
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  // Authentication fields
  password: {
    type: String,
    required: function() {
      // Password required only for local auth (not SSO)
      return this.authProvider === 'local';
    },
    select: false // Don't return password by default
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'linkedin'],
    default: 'local'
  },
  providerId: {
    type: String, // Google/LinkedIn user ID
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  // Email verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // Password reset
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  // Invite code tracking
  inviteCode: {
    type: String,
    default: null
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Company/Organization info
  company: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  // Session tracking
  lastLoginAt: {
    type: Date,
    default: null
  },
  lastLoginIp: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'pro', 'annual'],
      default: 'free'
    },
    plan: {
      type: String,
      enum: ['monthly', 'annual'],
      default: null
    },
    started_at: {
      type: Date,
      default: null
    },
    expires_at: {
      type: Date,
      default: null
    },
    stripe_customer_id: String,
    stripe_subscription_id: String,
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'incomplete'],
      default: 'active'
    }
  },
  credits: {
    balance: {
      type: Number,
      default: 15 // 15 free credits on account creation
    },
    last_recharge_date: {
      type: Date,
      default: null
    },
    total_earned: {
      type: Number,
      default: 15
    },
    total_spent: {
      type: Number,
      default: 0
    }
  },
  usage: {
    detective_analyses_this_month: {
      type: Number,
      default: 0
    },
    last_analysis_at: {
      type: Date,
      default: null
    },
    total_analyses: {
      type: Number,
      default: 0
    },
    referral_count: {
      type: Number,
      default: 0
    },
    bonus_analyses: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.type': 1 });
userSchema.index({ 'usage.detective_analyses_this_month': 1 });

// Virtual for quota status
userSchema.virtual('quota_status').get(function() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Reset monthly usage if it's a new month
  if (this.usage.last_analysis_at && this.usage.last_analysis_at < startOfMonth) {
    this.usage.detective_analyses_this_month = 0;
  }
  
  // Define limits based on subscription type
  let monthlyLimit;
  switch (this.subscription.type) {
    case 'pro':
      monthlyLimit = 1000; // Unlimited for pro
      break;
    case 'annual':
      monthlyLimit = 1000; // Unlimited for annual
      break;
    default:
      monthlyLimit = 3; // Free plan
  }
  
  // Add bonus analyses to the limit
  const bonusAnalyses = this.usage.bonus_analyses || 0;
  const effectiveLimit = monthlyLimit + bonusAnalyses;
  const remaining = Math.max(0, effectiveLimit - this.usage.detective_analyses_this_month);
  
  return {
    used: this.usage.detective_analyses_this_month,
    limit: monthlyLimit,
    remaining,
    subscription: this.subscription.type,
    plan: this.subscription.plan,
    bonusAnalyses,
    effectiveLimit
  };
});

// Method to check if user can perform analysis
userSchema.methods.canAnalyze = function() {
  const quota = this.quota_status;
  return quota.remaining > 0;
};

// Method to increment usage
userSchema.methods.incrementUsage = function() {
  this.usage.detective_analyses_this_month += 1;
  this.usage.total_analyses += 1;
  this.usage.last_analysis_at = new Date();
  return this.save();
};

// Method to check and recharge credits monthly
userSchema.methods.checkAndRechargeCredits = function() {
  const now = new Date();
  const signupDate = this.created_at || now;
  
  // Calculate next recharge date (1 month after signup, then monthly)
  let nextRechargeDate;
  if (!this.credits.last_recharge_date) {
    // First recharge: 1 month after signup
    nextRechargeDate = new Date(signupDate);
    nextRechargeDate.setMonth(nextRechargeDate.getMonth() + 1);
  } else {
    // Subsequent recharges: monthly from last recharge
    nextRechargeDate = new Date(this.credits.last_recharge_date);
    nextRechargeDate.setMonth(nextRechargeDate.getMonth() + 1);
  }
  
  // If recharge date has passed, recharge credits
  if (now >= nextRechargeDate) {
    const creditsToAdd = 15; // 15 credits per month for free tier
    this.credits.balance += creditsToAdd;
    this.credits.total_earned += creditsToAdd;
    this.credits.last_recharge_date = now;
    return true; // Credits were recharged
  }
  
  return false; // No recharge needed yet
};

// Method to deduct credits
userSchema.methods.deductCredits = function(amount = 5) {
  // Check and recharge credits first
  this.checkAndRechargeCredits();
  
  if (this.credits.balance < amount) {
    throw new Error('Insufficient credits');
  }
  
  this.credits.balance -= amount;
  this.credits.total_spent += amount;
  return this.save();
};

// Method to get next recharge date
userSchema.methods.getNextRechargeDate = function() {
  const signupDate = this.created_at || new Date();
  
  if (!this.credits.last_recharge_date) {
    // First recharge: 1 month after signup
    const nextRecharge = new Date(signupDate);
    nextRecharge.setMonth(nextRecharge.getMonth() + 1);
    return nextRecharge;
  } else {
    // Subsequent recharges: monthly from last recharge
    const nextRecharge = new Date(this.credits.last_recharge_date);
    nextRecharge.setMonth(nextRecharge.getMonth() + 1);
    return nextRecharge;
  }
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password')) return next();

  // Don't hash if it's an SSO user
  if (this.authProvider !== 'local') return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function(ip = null) {
  this.lastLoginAt = new Date();
  if (ip) this.lastLoginIp = ip;
  return this.save();
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token; // Return unhashed token for email
};

// Method to verify email token
userSchema.methods.verifyEmailToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  if (this.emailVerificationToken !== hashedToken) {
    return false;
  }

  if (this.emailVerificationExpires < new Date()) {
    return false;
  }

  this.emailVerified = true;
  this.emailVerificationToken = null;
  this.emailVerificationExpires = null;
  return true;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token; // Return unhashed token for email
};

// Method to verify password reset token
userSchema.methods.verifyPasswordResetToken = function(token) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  if (this.passwordResetToken !== hashedToken) {
    return false;
  }

  if (this.passwordResetExpires < new Date()) {
    return false;
  }

  return true;
};

// Method to clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.passwordResetToken = null;
  this.passwordResetExpires = null;
};

// Method to activate subscription
userSchema.methods.activateSubscription = function(plan, stripeCustomerId = null, stripeSubscriptionId = null) {
  const now = new Date();

  this.subscription.type = plan === 'annual' ? 'annual' : 'pro';
  this.subscription.plan = plan;
  this.subscription.started_at = now;
  this.subscription.status = 'active';

  // Set expiration based on plan
  const expiresAt = new Date(now);
  if (plan === 'annual') {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }
  this.subscription.expires_at = expiresAt;

  if (stripeCustomerId) {
    this.subscription.stripe_customer_id = stripeCustomerId;
  }
  if (stripeSubscriptionId) {
    this.subscription.stripe_subscription_id = stripeSubscriptionId;
  }

  return this.save();
};

// Method to cancel subscription
userSchema.methods.cancelSubscription = function() {
  this.subscription.status = 'cancelled';
  // Keep access until expires_at
  return this.save();
};

export default mongoose.model('User', userSchema);
