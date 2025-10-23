/**
 * MongoDB model for Subscription Plans
 */

import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['free', 'pro', 'annual'],
    required: true
  },
  price: {
    monthly: {
      type: Number,
      default: 0
    },
    annual: {
      type: Number,
      default: 0
    }
  },
  features: {
    analyses_per_month: {
      type: Number,
      default: 3
    },
    advanced_features: {
      type: Boolean,
      default: false
    },
    property_type_detection: {
      type: Boolean,
      default: false
    },
    feature_detection: {
      type: Boolean,
      default: false
    },
    neighborhood_analysis: {
      type: Boolean,
      default: false
    },
    comparable_properties: {
      type: Boolean,
      default: false
    },
    export_pdf: {
      type: Boolean,
      default: false
    },
    api_access: {
      type: Boolean,
      default: false
    },
    api_requests_per_hour: {
      type: Number,
      default: 0
    },
    analysis_history_limit: {
      type: Number,
      default: 10
    },
    priority_support: {
      type: Boolean,
      default: false
    },
    no_watermarks: {
      type: Boolean,
      default: false
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Subscription', subscriptionSchema);
