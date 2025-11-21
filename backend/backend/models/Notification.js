/**
 * MongoDB model for Notifications
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['success', 'warning', 'info', 'error', 'purchase']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['view-analysis', 'view-upgrade', 'view-features', 'view-exports', 'view-reports', null],
    default: null
  },
  action_data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ user_id: 1, read: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, created_at: -1 });

export default mongoose.model('Notification', notificationSchema);

