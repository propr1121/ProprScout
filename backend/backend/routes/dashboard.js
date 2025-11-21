/**
 * Dashboard API routes
 * Provides real statistics and analytics for the dashboard
 */

import express from 'express';
import mongoose from 'mongoose';
import DetectiveAnalysis from '../models/DetectiveAnalysis.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics from MongoDB
 */
router.get('/stats', async (req, res) => {
  try {
    let { user_id = 'anonymous' } = req.query;

    // Handle anonymous user - use string or null
    const userQuery = user_id === 'anonymous' || !user_id ? null : user_id;

    // Get current date boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Build query - for anonymous users, we'll query without user_id or use a special field
    // For now, let's query all analyses (anonymous users see aggregated data)
    const queryFilter = userQuery ? { user_id: userQuery } : {};

    // Total analyses (all time)
    const totalAnalyses = await DetectiveAnalysis.countDocuments(queryFilter);

    // This month's analyses
    const thisMonthAnalyses = await DetectiveAnalysis.countDocuments({
      ...queryFilter,
      created_at: { $gte: startOfMonth }
    });

    // Last month's analyses
    const lastMonthAnalyses = await DetectiveAnalysis.countDocuments({
      ...queryFilter,
      created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    // Calculate monthly change
    const monthlyChange = lastMonthAnalyses > 0 
      ? thisMonthAnalyses - lastMonthAnalyses 
      : thisMonthAnalyses;

    // Success rate (analyses with confidence > 0.5)
    const successfulAnalyses = await DetectiveAnalysis.countDocuments({
      ...queryFilter,
      confidence: { $gte: 0.5 }
    });
    const successRate = totalAnalyses > 0 
      ? ((successfulAnalyses / totalAnalyses) * 100).toFixed(1)
      : 0;

    // Last month success rate for comparison
    const lastMonthSuccessful = await DetectiveAnalysis.countDocuments({
      ...queryFilter,
      confidence: { $gte: 0.5 },
      created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });
    const lastMonthSuccessRate = lastMonthAnalyses > 0
      ? ((lastMonthSuccessful / lastMonthAnalyses) * 100).toFixed(1)
      : 0;
    const successRateChange = parseFloat(successRate) - parseFloat(lastMonthSuccessRate);

    // Total property value analyzed (sum of estimated values from analyses)
    // For now, we'll estimate based on Portugal average property values
    // In a real system, this would come from property price data
    const analysesWithCoordinates = await DetectiveAnalysis.find(queryFilter).select('_id created_at');
    
    // Estimate: each analysis represents ~€300K average property value in Portugal
    const estimatedValuePerAnalysis = 300000;
    const totalValueAnalyzed = analysesWithCoordinates.length * estimatedValuePerAnalysis;
    
    // Format as millions
    const totalValueInMillions = (totalValueAnalyzed / 1000000).toFixed(1);

    // Credits used this month (assuming 5 credits per analysis)
    const creditsUsedThisMonth = thisMonthAnalyses * 5;

    res.json({
      success: true,
      data: {
        totalAnalyses,
        monthlyAnalyses: thisMonthAnalyses,
        monthlyChange,
        successRate: parseFloat(successRate),
        successRateChange: parseFloat(successRateChange.toFixed(1)),
        totalValueAnalyzed: totalValueInMillions,
        creditsUsedThisMonth
      }
    });

  } catch (error) {
    logger.error('Dashboard stats failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats',
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/activity
 * Get 7-day activity data for chart
 */
router.get('/activity', async (req, res) => {
  try {
    let { user_id = 'anonymous', days = 7 } = req.query;
    const daysCount = parseInt(days);

    // Handle anonymous user
    const userQuery = user_id === 'anonymous' || !user_id ? null : user_id;
    const queryFilter = userQuery ? { user_id: userQuery } : {};

    // Get date range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (daysCount - 1));
    startDate.setHours(0, 0, 0, 0);

    // Get analyses grouped by day
    const analyses = await DetectiveAnalysis.find({
      ...queryFilter,
      created_at: { $gte: startDate }
    }).select('created_at').sort({ created_at: 1 });

    // Initialize daily counts
    const dailyData = [];
    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dailyData.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: 0
      });
    }

    // Count analyses per day
    analyses.forEach(analysis => {
      const analysisDate = new Date(analysis.created_at);
      const dateStr = analysisDate.toISOString().split('T')[0];
      const dayIndex = dailyData.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1) {
        dailyData[dayIndex].count++;
      }
    });

    // Get max value for percentage calculation
    const maxCount = Math.max(...dailyData.map(d => d.count), 1);

    // Add percentage for visualization
    const chartData = dailyData.map(day => ({
      ...day,
      percentage: maxCount > 0 ? (day.count / maxCount) * 100 : 0
    }));

    res.json({
      success: true,
      data: {
        days: chartData,
        total: analyses.length,
        maxCount
      }
    });

  } catch (error) {
    logger.error('Dashboard activity failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity data',
      message: error.message
    });
  }
});

export default router;

