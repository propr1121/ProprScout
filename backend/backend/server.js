#!/usr/bin/env node
/**
 * ProprScout Intelligence Backend Server
 * Express.js API with GeoCLIP, Nominatim, PostgreSQL, Redis
 */

// IMPORTANT: Load dotenv FIRST before any other imports that need env vars
// ES modules evaluate all imports before running code, so dotenv must be preloaded
import './dotenv-config.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import passport from 'passport';

// Import routes
import propertyRoutes from './routes/property.js';
import analysisRoutes from './routes/analysis.js';
import geolocationRoutes from './routes/geolocation.js';
import detectiveRoutes from './routes/detective.js';
import pricingRoutes from './routes/pricing.js';
import referralRoutes from './routes/referrals.js';
import healthRoutes from './routes/health.js';
import dashboardRoutes from './routes/dashboard.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import creditsRoutes from './routes/credits.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import inviteRoutes from './routes/invite.js';
import integrationsRoutes from './routes/integrations.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Import passport config
import { configurePassport } from './config/passport.js';

// Import database
import { initDatabase } from './database/init.js';
import { connectMongoDB } from './database/mongodb.js';

// Import services
import { initRedis } from './services/redis.js';
import { initCloudinary } from './services/cloudinary.js';

// Note: dotenv is loaded via ./dotenv-config.js import at the top

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:"],
    },
  },
}));

// CORS configuration - supports multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://proprscout.com',
  'https://www.proprscout.com',
  'https://app.proprscout.com'
].filter(Boolean);

// Add localhost for development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000');
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Initialize Passport
configurePassport();
app.use(passport.initialize());

// Static files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ProprScout Intelligence Backend API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/geolocation', geolocationRoutes);
app.use('/api/detective', detectiveRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/integrations', integrationsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    console.log('🚀 Initializing ProprScout Backend Services...');
    
    // Initialize databases
    console.log('📊 Initializing PostgreSQL database (optional)...');
    const pgPool = await initDatabase();
    if (pgPool) {
    console.log('✅ PostgreSQL database initialized');
    } else {
      console.log('⚠️ PostgreSQL not available, using MongoDB only');
    }
    
    console.log('📊 Initializing MongoDB database...');
    await connectMongoDB();
    console.log('✅ MongoDB database initialized');
    
    // Initialize Redis (optional - gracefully handle if not available)
    if (process.env.REDIS_URL) {
      console.log('🔴 Initializing Redis...');
      try {
        await initRedis();
        console.log('✅ Redis initialized');
      } catch (redisError) {
        console.warn('⚠️ Redis not available, continuing without caching:', redisError.message);
      }
    } else {
      console.log('⚠️ Redis not configured, skipping (caching disabled)');
    }
    
    // Initialize Cloudinary
    console.log('☁️ Initializing Cloudinary...');
    await initCloudinary();
    console.log('✅ Cloudinary initialized');
    
    console.log('🎯 All services initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`🚀 ProprScout Backend Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
      console.log(`🔴 Redis: ${process.env.REDIS_URL ? 'Connected' : 'Not configured'}`);
      console.log(`☁️ Cloudinary: ${process.env.CLOUDINARY_URL ? 'Connected' : 'Not configured'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;