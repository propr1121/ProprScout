# ProprScout Backend API

Complete backend infrastructure for ProprScout Intelligence with PostgreSQL, Redis, and cloud services.

## 🚀 Features

- **Express.js API** with comprehensive error handling
- **PostgreSQL Database** for property and analysis storage
- **Redis Caching** for performance optimization
- **Cloudinary Integration** for image storage and processing
- **Nominatim Integration** for reverse geocoding
- **Rate Limiting** and security middleware
- **Docker Support** for easy deployment
- **Health Checks** for monitoring

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Cloudinary account (free tier available)

## 🛠️ Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/proprscout

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3001
NODE_ENV=development
```

### 3. Database Setup
```bash
# Create database
createdb proprscout

# Run migrations (automatic on startup)
npm start
```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed service status
- `GET /api/health/ready` - Kubernetes readiness
- `GET /api/health/live` - Kubernetes liveness

### Properties
- `POST /api/properties/scrape` - Scrape property from URL
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties` - List properties with pagination
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/stats` - Property statistics

### Analysis
- `POST /api/analysis/analyze` - Analyze property
- `GET /api/analysis/:property_id` - Get analysis results
- `GET /api/analysis` - List analyses with pagination
- `GET /api/analysis/stats` - Analysis statistics

### Geolocation
- `POST /api/geolocation/predict` - Predict location from image
- `POST /api/geolocation/batch-predict` - Batch predict locations
- `POST /api/geolocation/reverse-geocode` - Reverse geocoding
- `POST /api/geolocation/forward-geocode` - Forward geocoding
- `POST /api/geolocation/upload-and-predict` - Upload image and predict
- `GET /api/geolocation/history` - Geolocation history
- `GET /api/geolocation/stats` - Geolocation statistics

## 🗄️ Database Schema

### Properties Table
- Property data from scraping
- Coordinates and location info
- Raw data storage

### Analysis Results Table
- Property analysis results
- Scores and recommendations
- Risk and opportunity data

### Geolocation Results Table
- Image geolocation predictions
- Confidence scores
- Geocoding data

## 🔧 Services

### PostgreSQL
- Property and analysis storage
- Full-text search capabilities
- Spatial data support

### Redis
- Caching for performance
- Rate limiting
- Session management

### Cloudinary
- Image storage and processing
- Automatic optimization
- CDN delivery

### Nominatim
- Reverse geocoding
- Address validation
- Location services

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t proprscout-backend .
```

### Run Container
```bash
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e CLOUDINARY_URL=cloudinary://... \
  proprscout-backend
```

## ☁️ Cloud Deployment

### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Render
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

## 📊 Monitoring

### Health Checks
- Database connectivity
- Redis availability
- Service status
- Performance metrics

### Logging
- Winston logger
- Structured logging
- Error tracking
- Request logging

## 🔒 Security

- Helmet.js security headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- Redis caching
- Database indexing
- Connection pooling
- Compression middleware
- Image optimization

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis connection established
- [ ] Cloudinary configured
- [ ] Health checks passing
- [ ] Monitoring setup
- [ ] SSL certificates
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details
