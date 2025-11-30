/**
 * Notifications API routes
 */

import express from 'express';
import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get user notifications
 * Uses JWT auth if available, falls back to anonymous for demo access
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Use authenticated user ID if available, otherwise 'anonymous' for demo
    const user_id = req.userId?.toString() || 'anonymous';
    const { limit = 20, unread_only = false } = req.query;
    
    const query = { user_id };
    if (unread_only === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Format time ago
    const formattedNotifications = notifications.map(notif => ({
      ...notif,
      id: notif._id.toString(),
      time: formatTimeAgo(notif.created_at),
      _id: undefined,
      __v: undefined
    }));
    
    const unreadCount = await Notification.countDocuments({ user_id, read: false });
    
    res.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        unreadCount
      }
    });
    
  } catch (error) {
    logger.error('Get notifications failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId?.toString() || 'anonymous';
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    logger.error('Mark notification as read failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', optionalAuth, async (req, res) => {
  try {
    const user_id = req.userId?.toString() || 'anonymous';
    
    const result = await Notification.updateMany(
      { user_id, read: false },
      { read: true }
    );
    
    res.json({
      success: true,
      data: {
        updated: result.modifiedCount
      }
    });
    
  } catch (error) {
    logger.error('Mark all notifications as read failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId?.toString() || 'anonymous';
    
    const notification = await Notification.findOneAndDelete({ _id: id, user_id });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: { id }
    });
    
  } catch (error) {
    logger.error('Delete notification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message
    });
  }
});

/**
 * Helper function to format time ago
 */
function formatTimeAgo(date) {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
}

export default router;

