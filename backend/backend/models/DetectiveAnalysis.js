/**
 * MongoDB model for Property Detective analyses
 */

import mongoose from 'mongoose';

const detectiveAnalysisSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    default: 'property_detective',
    enum: ['property_detective']
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lon: {
      type: Number,
      required: true
    }
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  address: {
    formatted: {
      type: String,
      required: true
    },
    street: String,
    city: String,
    district: String,
    postcode: String
  },
  enrichment: {
    schools: {
      type: Number,
      default: 0
    },
    supermarkets: {
      type: Number,
      default: 0
    },
    restaurants: {
      type: Number,
      default: 0
    },
    transport: {
      type: Number,
      default: 0
    }
  },
  image_url: {
    type: String,
    required: true
  },
  cloudinary_public_id: String,
  analysis_metadata: {
    processing_time: Number,
    model_version: String,
    features_detected: [String]
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
detectiveAnalysisSchema.index({ user_id: 1, created_at: -1 });
detectiveAnalysisSchema.index({ coordinates: '2dsphere' });
detectiveAnalysisSchema.index({ type: 1, created_at: -1 });

export default mongoose.model('DetectiveAnalysis', detectiveAnalysisSchema);
