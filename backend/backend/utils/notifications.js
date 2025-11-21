/**
 * Notification helper functions
 */

import Notification from '../models/Notification.js';
import User from '../models/User.js';
import logger from './logger.js';

/**
 * Create a notification
 */
export async function createNotification(userId, notificationData) {
  try {
    const notification = new Notification({
      user_id: userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      action: notificationData.action || null,
      action_data: notificationData.action_data || null,
      read: false
    });
    
    await notification.save();
    logger.info(`✅ Notification created for user ${userId}: ${notificationData.title}`);
    return notification;
  } catch (error) {
    logger.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Check if user has low credits and create warning notification
 */
export async function checkLowCreditsAndNotify(userId) {
  try {
    // For anonymous users, skip (they don't have credits yet)
    if (userId === 'anonymous') {
      return;
    }
    
    let user = await User.findById(userId);
    if (!user) {
      // Create anonymous user with default credits
      user = new User({
        _id: userId,
        email: `${userId}@anonymous.local`,
        name: 'Anonymous User',
        credits: {
          balance: 15,
          total_earned: 15,
          total_spent: 0
        }
      });
      await user.save();
    }
    
    // Check and recharge credits
    user.checkAndRechargeCredits();
    await user.save();
    
    // Check if credits are low (< 20)
    if (user.credits.balance < 20) {
      // Check if we already have a recent low credits notification (within last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      
      const existingNotification = await Notification.findOne({
        user_id: userId,
        type: 'warning',
        title: 'Low Credits Warning',
        created_at: { $gte: oneDayAgo }
      });
      
      if (!existingNotification) {
        await createNotification(userId, {
          type: 'warning',
          title: 'Low Credits Warning',
          message: `You have ${user.credits.balance} credits remaining. Upgrade to get more credits.`,
          action: 'view-upgrade'
        });
      }
    }
  } catch (error) {
    logger.error('Failed to check low credits:', error);
  }
}

/**
 * Create analysis complete notification
 */
export async function notifyAnalysisComplete(userId, analysisData) {
  try {
    const address = analysisData.address?.formatted || 
                   analysisData.address?.city || 
                   'Unknown location';
    
    await createNotification(userId, {
      type: 'success',
      title: 'Analysis Complete',
      message: `Your analysis for ${address} has been completed`,
      action: 'view-analysis',
      action_data: {
        analysisId: analysisData.analysisId || analysisData._id,
        type: analysisData.type || 'property_detective'
      }
    });
  } catch (error) {
    logger.error('Failed to create analysis complete notification:', error);
  }
}

