/**
 * InviteCode Model
 * Manages invite codes for beta access control
 */

import mongoose from 'mongoose';
import crypto from 'crypto';

const inviteCodeSchema = new mongoose.Schema({
  // The unique invite code
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },

  // Code metadata
  name: {
    type: String,
    default: null,
    trim: true
  },

  description: {
    type: String,
    default: null
  },

  // Usage limits
  maxUses: {
    type: Number,
    default: 1,
    min: 1
  },

  currentUses: {
    type: Number,
    default: 0
  },

  // Bonus credits given to users who use this code
  bonusCredits: {
    type: Number,
    default: 5
  },

  // Code validity
  isActive: {
    type: Boolean,
    default: true
  },

  expiresAt: {
    type: Date,
    default: null
  },

  // Who created this code
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Users who have used this code
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Code type
  type: {
    type: String,
    enum: ['beta', 'partner', 'founder', 'promo', 'referral'],
    default: 'beta'
  },

  // Optional: tier/subscription upgrade on use
  grantsTier: {
    type: String,
    enum: ['free', 'pro', 'annual', null],
    default: null
  },

  // Integration metadata (for HubSpot, Circle, etc.)
  metadata: {
    email: { type: String, default: null, index: true },
    name: { type: String, default: null },
    hubspot_contact_id: { type: String, default: null },
    source: { type: String, default: null },
    created_via: { type: String, default: null }
  },

  // Timestamps
  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
inviteCodeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Check if code is valid for use
inviteCodeSchema.methods.isValid = function() {
  // Check if active
  if (!this.isActive) {
    return { valid: false, reason: 'Code is no longer active' };
  }

  // Check if expired
  if (this.expiresAt && new Date() > this.expiresAt) {
    return { valid: false, reason: 'Code has expired' };
  }

  // Check usage limit
  if (this.currentUses >= this.maxUses) {
    return { valid: false, reason: 'Code has reached maximum uses' };
  }

  return { valid: true };
};

// Use the code for a user
inviteCodeSchema.methods.useCode = async function(userId) {
  const validation = this.isValid();
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  // Check if user already used this code
  const alreadyUsed = this.usedBy.some(
    usage => usage.user.toString() === userId.toString()
  );

  if (alreadyUsed) {
    throw new Error('You have already used this invite code');
  }

  // Record usage
  this.usedBy.push({
    user: userId,
    usedAt: new Date()
  });
  this.currentUses += 1;

  await this.save();
  return this;
};

// Generate a random code
inviteCodeSchema.statics.generateCode = function(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like O/0, I/1
  let code = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
};

// Create a new invite code with auto-generated code
inviteCodeSchema.statics.createCode = async function(options = {}) {
  const {
    name = null,
    description = null,
    maxUses = 1,
    bonusCredits = 5,
    expiresAt = null,
    createdBy = null,
    type = 'beta',
    grantsTier = null,
    customCode = null
  } = options;

  let code = customCode?.toUpperCase() || this.generateCode();

  // Ensure code is unique
  let attempts = 0;
  while (await this.findOne({ code }) && attempts < 10) {
    code = this.generateCode();
    attempts++;
  }

  if (attempts >= 10 && !customCode) {
    throw new Error('Failed to generate unique invite code');
  }

  const inviteCode = new this({
    code,
    name,
    description,
    maxUses,
    bonusCredits,
    expiresAt,
    createdBy,
    type,
    grantsTier
  });

  await inviteCode.save();
  return inviteCode;
};

// Find valid code by code string
inviteCodeSchema.statics.findValidCode = async function(code) {
  const inviteCode = await this.findOne({
    code: code.toUpperCase().trim(),
    isActive: true
  });

  if (!inviteCode) {
    return null;
  }

  const validation = inviteCode.isValid();
  if (!validation.valid) {
    return null;
  }

  return inviteCode;
};

// Get statistics
inviteCodeSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true });
  const expired = await this.countDocuments({
    expiresAt: { $lt: new Date() }
  });
  const fullyUsed = await this.aggregate([
    { $match: { $expr: { $gte: ['$currentUses', '$maxUses'] } } },
    { $count: 'count' }
  ]);

  const totalUses = await this.aggregate([
    { $group: { _id: null, total: { $sum: '$currentUses' } } }
  ]);

  return {
    total,
    active,
    expired,
    fullyUsed: fullyUsed[0]?.count || 0,
    totalUses: totalUses[0]?.total || 0
  };
};

const InviteCode = mongoose.model('InviteCode', inviteCodeSchema);

export default InviteCode;
