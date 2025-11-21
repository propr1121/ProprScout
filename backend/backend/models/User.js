/**
 * MongoDB model for Users with Property Detective features
 */

import mongoose from 'mongoose';

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

export default mongoose.model('User', userSchema);
