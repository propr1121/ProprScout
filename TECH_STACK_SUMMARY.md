# ProprScout Intelligence - Complete Tech Stack Summary

## Overview
ProprScout Intelligence is a full-stack property analysis platform built with a modern JavaScript/React frontend, dual backend architecture (Python Flask + Node.js Express), and comprehensive AI-powered geolocation capabilities.

---

## 🎨 Frontend Stack

### Core Framework
- **React 19.2.0** - Latest React version with concurrent features
- **React DOM 19.2.0** - React rendering library
- **Vite 7.1.11** - Fast build tool and development server
  - ES modules support (`type: "module"`)
  - Hot Module Replacement (HMR)
  - Source maps enabled
  - Port: 3000

### Styling & Design System
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
  - Custom color palette with green primary brand colors (`primary-50` through `primary-950`)
  - Custom animations and keyframes
  - Responsive design utilities
  - Safelist configuration for dynamic classes
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - Browser compatibility
- **Custom Design System**:
  - Primary: Green (#00d185) gradient palette
  - Typography: Poppins (body), Montserrat (headings), JetBrains Mono (code)
  - Components: Cards, buttons, modals with premium styling

### UI Libraries & Icons
- **Lucide React 0.546.0** - Comprehensive icon library
  - 50+ icons used (ArrowRight, Sparkles, TrendingUp, CheckCircle, Activity, etc.)
- **React Dropzone 14.3.8** - File upload component for photos

### Mapping & Geospatial
- **Mapbox GL JS 3.15.0** - Interactive mapping with satellite imagery
- **Leaflet 1.9.4** - Alternative mapping library (backup)
- **React Leaflet 5.0.0** - React wrapper for Leaflet
- **@turf/turf 7.2.0** - Geospatial analysis library

### State Management
- **React Hooks** - useState, useEffect, custom hooks
- **Custom Hooks**:
  - `usePropertyAnalysis.js` - Property analysis logic
- **Component State** - Local state management (no Redux/Zustand)

### HTTP Client
- **Axios 1.12.2** - Promise-based HTTP client
  - RESTful API communication
  - Request/response interceptors

### Utility Libraries
- **clsx 2.1.1** - Conditional className utility
- **delay 6.0.0** - Promise-based delays
- **p-limit 7.2.0** - Promise concurrency control
- **p-retry 7.1.0** - Promise retry logic

---

## 🔧 Backend Stack

### Dual Backend Architecture

#### 1. Python Flask Backend (Port 5000)
**Purpose**: AI/ML processing, GeoCLIP integration, image analysis

**Core Framework**:
- **Flask 2.3.3** - Lightweight Python web framework
- **Flask-CORS 4.0.0** - Cross-Origin Resource Sharing
- **python-dotenv 1.0.0** - Environment variable management

**Database**:
- **PyMongo 4.5.0** - MongoDB Python driver
- **MongoDB** - NoSQL database for property data storage

**AI/ML Stack**:
- **PyTorch 2.0.1** - Deep learning framework
- **torchvision 0.15.2** - Computer vision utilities
- **Pillow 10.0.0** - Image processing
- **NumPy 1.24.3** - Numerical computing
- **OpenCV 4.8.0.76** - Computer vision library
- **GeoCLIP** - Custom geolocation model (git installation)
  - **transformers ≥4.30.0** - Hugging Face transformers
  - **timm ≥0.9.0** - PyTorch image models
  - **einops ≥0.9.0** - Tensor operations
  - **tqdm ≥4.65.0** - Progress bars

**Geocoding**:
- **geopy 2.3.0** - Geocoding library
- **requests 2.31.0** - HTTP library

**Cloud Storage**:
- **cloudinary 1.41.0** - Image hosting and CDN

**Utilities**:
- **python-dateutil 2.8.2** - Date parsing
- **pytz 2023.3** - Timezone handling
- **joblib ≥1.3.0** - Parallel processing and model caching

#### 2. Node.js Express Backend (Port 3001)
**Purpose**: Web scraping, API endpoints, database management, rate limiting

**Core Framework**:
- **Express 4.18.2** - Node.js web framework
- **Express 5.1.0** (root package.json) - Latest Express (ES modules)
- **Node.js ≥18.0.0** - JavaScript runtime

**Middleware & Security**:
- **helmet 7.1.0** - Security headers
- **cors 2.8.5** - Cross-origin resource sharing
- **morgan 1.10.0** - HTTP request logger
- **compression 1.7.4** - Response compression
- **express-rate-limit 7.1.5** - Rate limiting
- **express-validator 7.0.1** - Input validation

**Database Stack**:
- **PostgreSQL** - Primary relational database
  - **pg 8.11.3** - PostgreSQL client for Node.js
  - Spatial data support (POINT types)
  - Full-text search capabilities
- **MongoDB** - NoSQL database (via Mongoose)
  - **mongoose 8.19.2** - MongoDB ODM
- **Redis 4.6.10** - Caching and rate limiting
  - In-memory data store
  - Session management
  - Cache for GeoCLIP results

**File Handling**:
- **multer 1.4.5-lts.1** - Multipart/form-data handling
- **express-fileupload 1.4.3** - File upload middleware
- **sharp 0.33.0** - Image processing

**External Services**:
- **cloudinary 1.41.0** - Image storage and CDN
- **Nominatim** - OpenStreetMap geocoding service
  - Reverse geocoding
  - Address validation
  - Location services

**Web Scraping**:
- **Puppeteer 24.25.0** - Headless Chrome automation
- **puppeteer-extra 3.3.6** - Puppeteer enhancement framework
- **puppeteer-extra-plugin-stealth 2.11.2** - Stealth mode
- **puppeteer-extra-plugin-adblocker 2.13.6** - Ad blocking
- **puppeteer-extra-plugin-anonymize-ua 2.4.6** - User agent anonymization
- **puppeteer-extra-plugin-block-resources 2.4.3** - Resource blocking
- **puppeteer-extra-plugin-recaptcha 3.3.8** - reCAPTCHA handling
- **puppeteer-extra-plugin-user-data-dir 2.4.1** - User data directory
- **cheerio 1.1.2** - Server-side jQuery
- **jsdom 27.0.1** - DOM implementation
- **proxy-chain 2.5.9** - Proxy chain management
- **user-agents 1.1.669** - User agent strings

**Utilities**:
- **dotenv 16.3.1** - Environment variables
- **winston 3.11.0** - Logging
- **node-cron 3.0.3** - Task scheduling

**Development**:
- **nodemon 3.1.10** - Auto-restart on file changes
- **jest 29.7.0** - Testing framework
- **supertest 6.3.3** - HTTP assertions

---

## 🗄️ Database Architecture

### Primary Databases

#### PostgreSQL (Node.js Backend)
**Schema**:
- **properties** - Property listings from scraping
  - Coordinates (POINT type)
  - Price, area, rooms, bathrooms
  - Location, features, images
  - Raw JSONB data
- **analysis_results** - Property analysis outputs
  - Overall score (0-100)
  - Price, location, property analysis (JSONB)
  - Recommendations, risks, opportunities
- **geolocation_results** - Image geolocation predictions
  - Predicted coordinates
  - Confidence scores
  - Geocoding data (JSONB)
- **user_sessions** - Session management
  - IP addresses, user agents
  - Request counts

#### MongoDB (Python Flask Backend)
**Collections**:
- Property documents
- Analysis results
- User data
- Cached GeoCLIP results

#### Redis (Caching Layer)
**Use Cases**:
- GeoCLIP model caching
- Rate limiting counters
- Session storage
- Temporary data

---

## 🤖 AI/ML Stack

### GeoCLIP Integration
- **Purpose**: AI-powered location detection from property photos
- **Model**: Custom GeoCLIP model (git installation from VicenteVivan/geo-clip)
- **Framework**: PyTorch with transformers
- **Caching**: Model results cached in Redis and local `.pkl` files
- **Device**: Auto (CPU/GPU detection)
- **Performance**: Optimized with joblib for parallel processing

### Image Processing
- **OpenCV** - Computer vision operations
- **Pillow** - Image manipulation
- **Sharp** (Node.js) - Server-side image optimization
- **Cloudinary** - Cloud-based image processing and CDN

---

## 🌐 External Services & APIs

### Mapping Services
- **Mapbox** - Interactive maps with satellite imagery
  - Access token required (`VITE_MAPBOX_ACCESS_TOKEN`)
  - Custom markers and styling
- **OpenStreetMap/Nominatim** - Geocoding and reverse geocoding
  - Free, open-source geocoding
  - Rate-limited (requires email for production)

### Cloud Services
- **Cloudinary** - Image hosting and CDN
  - Automatic image optimization
  - Transformations on-the-fly
  - CDN delivery
- **MongoDB Atlas** - Cloud MongoDB (production option)

### Property Portals Scraped
- **Idealista** - Portugal's largest property portal
- **Imovirtual** - Major Portuguese real estate platform
- **Supercasa** - Portuguese property listings
- **OLX** - General classifieds (property section)

---

## 🏗️ Development Tools

### Build Tools
- **Vite** - Frontend build tool
  - Fast HMR
  - Optimized production builds
  - Source maps
- **PostCSS** - CSS processing
- **Autoprefixer** - Browser compatibility

### Code Quality
- **ESLint** - JavaScript linting
  - React plugin
  - JSX support
  - Max warnings: 0
- **Prettier** - Code formatting (implicit)

### Package Management
- **npm** - Node.js package manager
- **pip** - Python package manager
- **Virtual Environment** (Python) - `venv` for isolation

### Development Servers
- **Frontend**: Vite dev server (port 3000)
- **Backend Flask**: Flask development server (port 5000)
- **Backend Express**: Nodemon with Express (port 3001)

---

## 🚀 Deployment Stack

### Infrastructure
- **Railway** - Backend deployment platform
  - Node.js runtime
  - PostgreSQL database
  - Redis cache
- **Render** - Frontend hosting (alternative)
  - Static site hosting
  - CDN delivery

### Containerization
- **Docker** - Containerization support
  - `Dockerfile.frontend` - Frontend container
  - `docker-compose.yml` - Multi-container setup
- **Railway** - Container deployment ready

### Environment Management
- **dotenv** - Environment variable management
  - `.env.local` - Local development
  - `env.example` - Template for configuration

---

## 📊 Monitoring & Logging

### Logging
- **Winston** (Node.js) - Structured logging
  - File logging
  - Console output
  - Error tracking
- **Python logging** - Flask application logging
  - INFO level default
  - Formatted timestamps

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Service status
- `GET /api/health/ready` - Kubernetes readiness
- `GET /api/health/live` - Kubernetes liveness

---

## 🔒 Security Stack

### Backend Security
- **Helmet** - Security headers
  - Content Security Policy
  - XSS protection
  - Frame options
- **CORS** - Cross-origin resource sharing
  - Configurable allowed origins
- **Rate Limiting** - Express rate limiter
  - Window-based limiting
  - IP-based tracking
- **Input Validation** - express-validator
  - Request sanitization
  - Type validation

### File Upload Security
- File size limits (10MB max)
- File type validation
- Secure filename handling
- Upload directory isolation

---

## 📦 Key Dependencies Summary

### Frontend (Root package.json)
- **React & Vite**: Core framework
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Mapbox GL**: Mapping
- **Axios**: HTTP client
- **React Dropzone**: File uploads
- **Puppeteer**: Web scraping (shared)

### Backend Node.js (backend/backend/package.json)
- **Express**: Web framework
- **PostgreSQL**: Primary database
- **MongoDB/Mongoose**: NoSQL database
- **Redis**: Caching
- **Cloudinary**: Image hosting
- **Puppeteer**: Web scraping
- **Helmet**: Security

### Backend Python (backend/requirements.txt)
- **Flask**: Web framework
- **PyTorch**: Deep learning
- **GeoCLIP**: Geolocation AI
- **OpenCV**: Computer vision
- **Cloudinary**: Image hosting
- **MongoDB**: Database

---

## 🔄 Architecture Patterns

### Frontend Architecture
- **Component-Based**: React functional components
- **Custom Hooks**: Reusable logic (`usePropertyAnalysis`)
- **State Management**: Local component state
- **Layout System**: Tailwind utility classes
- **Routing**: Client-side routing (implicit)

### Backend Architecture
- **RESTful API**: Standard HTTP methods
- **Microservices**: Dual backend (Flask + Express)
- **Service Layer**: Separate services (GeoCLIP, Nominatim, Cloudinary)
- **Middleware**: Express middleware stack
- **Error Handling**: Centralized error handlers

### Database Architecture
- **Relational**: PostgreSQL for structured data
- **NoSQL**: MongoDB for flexible documents
- **Cache**: Redis for performance
- **Spatial Data**: PostgreSQL POINT types for coordinates

---

## 🎯 Performance Optimizations

### Frontend
- **Code Splitting**: Vite automatic splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Cloudinary CDN
- **Lazy Loading**: Components on demand

### Backend
- **Caching**: Redis for GeoCLIP results
- **Model Caching**: Joblib pickle files
- **Connection Pooling**: PostgreSQL pools
- **Rate Limiting**: Prevent abuse
- **Compression**: Response compression

---

## 📝 Development Workflow

### Local Development
1. **Frontend**: `npm run dev` (Vite on port 3000)
2. **Backend Flask**: `python app.py` (port 5000)
3. **Backend Express**: `npm run dev` (port 3001)

### Build Process
- **Frontend**: `npm run build` → `dist/` directory
- **Backend**: Node.js runtime, no build required (ES modules)
- **Python**: Virtual environment with dependencies

### Testing
- **Jest**: Node.js backend testing
- **Manual Testing**: Property URL analysis
- **Health Checks**: API endpoint verification

---

## 🌍 Supported Platforms

### Property Portals
- Idealista (Portugal)
- Imovirtual (Portugal)
- Supercasa (Portugal)
- OLX (Portugal)

### Geographic Focus
- **Primary**: Portugal
- **Currency**: Euros (€)
- **Languages**: Portuguese property listings

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Redis for shared state
- Load balancer ready

### Vertical Scaling
- PostgreSQL connection pooling
- Redis memory management
- GeoCLIP model GPU support

### Caching Strategy
- Redis for frequently accessed data
- Joblib for GeoCLIP model caching
- Cloudinary CDN for images

---

**Last Updated**: November 2, 2024  
**Version**: Production-ready MVP  
**License**: Proprietary

---

## Summary Statistics

- **Total Dependencies**: ~60 npm packages + ~25 Python packages
- **Frontend Build Time**: < 5 seconds (Vite)
- **Backend Servers**: 2 (Flask + Express)
- **Databases**: 3 (PostgreSQL + MongoDB + Redis)
- **External APIs**: 4 (Mapbox, Nominatim, Cloudinary, Property portals)
- **AI Models**: 1 (GeoCLIP)
- **Supported Property Sites**: 4
- **Deployment Platforms**: Railway, Render, Docker



