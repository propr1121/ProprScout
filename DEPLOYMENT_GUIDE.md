# ProprScout Deployment Guide

Complete guide for deploying ProprScout Intelligence to production with Railway/Render and Cloudinary.

## 🚀 Quick Start

### 1. Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Deploy from backend directory
   cd backend
   railway up
   ```

3. **Configure Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   CLOUDINARY_URL=cloudinary://...
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### 2. Frontend Deployment (Render)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Connect GitHub repository
   - Select "Static Site"
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Configure Environment**
   ```env
   VITE_API_URL=https://your-backend-railway-url.com
   ```

### 3. Database Setup (Railway PostgreSQL)

1. **Add PostgreSQL Service**
   - In Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Copy connection string

2. **Run Migrations**
   ```bash
   # Backend will auto-migrate on startup
   # Or run manually:
   railway run npm run migrate
   ```

### 4. Redis Setup (Railway Redis)

1. **Add Redis Service**
   - In Railway dashboard
   - Click "New" → "Database" → "Redis"
   - Copy connection string

### 5. Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account (25GB storage)

2. **Get Credentials**
   - Dashboard → Settings → API Keys
   - Copy Cloud Name, API Key, API Secret

3. **Configure Backend**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## 🏗️ Infrastructure Overview

### Backend (Railway)
- **Express.js API** with comprehensive endpoints
- **PostgreSQL** for data persistence
- **Redis** for caching and rate limiting
- **Cloudinary** for image storage
- **Nominatim** for geocoding
- **Docker** containerization

### Frontend (Render)
- **React** with Vite build system
- **Tailwind CSS** for styling
- **Leaflet** for maps
- **React Dropzone** for file uploads
- **Static hosting** with CDN

### Database Schema
```sql
-- Properties table
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) UNIQUE NOT NULL,
  site VARCHAR(50) NOT NULL,
  property_id VARCHAR(100) NOT NULL,
  title TEXT,
  description TEXT,
  price DECIMAL(12,2),
  area DECIMAL(8,2),
  rooms INTEGER,
  bathrooms INTEGER,
  location TEXT,
  coordinates POINT,
  features TEXT[],
  images TEXT[],
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis results table
CREATE TABLE analysis_results (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  overall_score INTEGER,
  price_analysis JSONB,
  location_analysis JSONB,
  property_analysis JSONB,
  recommendations TEXT[],
  risks TEXT[],
  opportunities TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Backend Environment Variables
```env
# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Redis
REDIS_URL=redis://username:password@host:port

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nominatim
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=ProprScout/1.0.0
NOMINATIM_EMAIL=your-email@example.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
```env
# API Configuration
VITE_API_URL=https://your-backend-railway-url.com
VITE_APP_NAME=ProprScout Intelligence
VITE_APP_VERSION=1.0.0
```

## 📊 Monitoring & Health Checks

### Backend Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Service status
- `GET /api/health/ready` - Kubernetes readiness
- `GET /api/health/live` - Kubernetes liveness

### Monitoring Setup
1. **Railway Monitoring**
   - Built-in metrics and logs
   - Performance monitoring
   - Error tracking

2. **Render Monitoring**
   - Uptime monitoring
   - Performance metrics
   - Error tracking

3. **Custom Monitoring**
   - Health check endpoints
   - Database monitoring
   - Redis monitoring

## 🔒 Security Configuration

### Backend Security
- **Helmet.js** security headers
- **CORS** configuration
- **Rate limiting** (100 requests/15min)
- **Input validation**
- **SQL injection protection**

### Frontend Security
- **Content Security Policy**
- **HTTPS enforcement**
- **Secure headers**

## 🚀 Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all files are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy Backend (Railway)
```bash
cd backend
railway login
railway init
railway up
```

### 3. Configure Services
- Add PostgreSQL database
- Add Redis cache
- Set environment variables
- Configure domain

### 4. Deploy Frontend (Render)
- Connect GitHub repository
- Configure build settings
- Set environment variables
- Deploy

### 5. Test Deployment
```bash
# Test backend health
curl https://your-backend-url.com/api/health

# Test frontend
curl https://your-frontend-url.com
```

## 📈 Performance Optimization

### Backend Optimizations
- **Redis caching** for frequent requests
- **Database indexing** for queries
- **Connection pooling** for PostgreSQL
- **Compression middleware**
- **Image optimization** with Cloudinary

### Frontend Optimizations
- **Vite build** optimization
- **Code splitting** for better loading
- **Image optimization**
- **CDN delivery** through Render

## 🔄 CI/CD Pipeline

### Automatic Deployments
- **Railway**: Auto-deploy on git push
- **Render**: Auto-deploy on git push
- **Environment**: Production on main branch

### Manual Deployments
```bash
# Backend
railway up

# Frontend
npm run build
# Deploy dist/ folder to Render
```

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL
   - Verify PostgreSQL service
   - Check network connectivity

2. **Redis Connection Failed**
   - Check REDIS_URL
   - Verify Redis service
   - Check authentication

3. **Cloudinary Upload Failed**
   - Check CLOUDINARY_URL
   - Verify API credentials
   - Check image format

4. **Frontend Build Failed**
   - Check Node.js version
   - Verify dependencies
   - Check build logs

### Debug Commands
```bash
# Check backend logs
railway logs

# Check database
railway run psql $DATABASE_URL

# Check Redis
railway run redis-cli -u $REDIS_URL
```

## 📋 Production Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis connection established
- [ ] Cloudinary configured
- [ ] Health checks passing
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Logging configured
- [ ] Monitoring setup

### Frontend
- [ ] Build successful
- [ ] Environment variables set
- [ ] API URL configured
- [ ] HTTPS enabled
- [ ] CDN configured
- [ ] Error tracking setup

### Database
- [ ] Tables created
- [ ] Indexes applied
- [ ] Constraints set
- [ ] Backup configured
- [ ] Monitoring enabled

## 🎯 Next Steps

1. **Set up monitoring** with external services
2. **Configure backups** for database
3. **Set up staging** environment
4. **Implement CI/CD** pipeline
5. **Add error tracking** (Sentry)
6. **Set up analytics** (Google Analytics)

## 📞 Support

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)
- **Cloudinary**: [cloudinary.com/documentation](https://cloudinary.com/documentation)

---

**🎉 Your ProprScout Intelligence platform is now deployed and ready for production!**
