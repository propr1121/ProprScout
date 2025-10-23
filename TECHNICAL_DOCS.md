# ProprScout Intelligence - Technical Documentation

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Flask)       │◄──►│   Services      │
│   Port 3000     │    │   Port 3002     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mapbox GL     │    │   MongoDB       │    │   GeoCLIP       │
│   (Maps)        │    │   (Database)    │    │   (AI Model)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Component Architecture

### Frontend Components

#### App.jsx
- **Purpose**: Main application container
- **State**: Mobile menu, active tab (URL/Detective)
- **Features**: Header, navigation, tab switching
- **Dependencies**: All major components

#### PropertyInput.jsx
- **Purpose**: URL input and validation
- **Props**: `onAnalyze`, `loading`, `error`
- **Features**: URL examples, error display, analyze button
- **Validation**: URL format checking

#### PropertyResults.jsx
- **Purpose**: Display analysis results
- **Props**: `result`, `loading`, `error`, `onReset`
- **Features**: Map display, property details, reset functionality
- **Integration**: MapboxMap component

#### PropertyDetective.jsx
- **Purpose**: Photo upload and AI analysis
- **Features**: Drag & drop, quota management, upgrade modal
- **State**: Image preview, analysis results, user quota
- **API**: Calls Flask backend for GeoCLIP analysis

#### MapboxMap.jsx
- **Purpose**: Interactive map display
- **Props**: `coordinates`, `address`, `confidence`
- **Features**: Satellite imagery, custom markers, popups
- **Styling**: Professional map presentation

### Backend Services

#### Flask App (app.py)
- **Purpose**: Main backend application
- **Routes**: Health check, analysis, quota, history
- **Features**: CORS, error handling, file upload
- **Integration**: GeoCLIP service, MongoDB

#### GeoCLIP Service
- **Purpose**: AI-powered image geolocation
- **Features**: Model loading, inference, caching
- **Validation**: Confidence thresholds, Portugal bounds
- **Error Handling**: No fallback data, real analysis only

## 🗄️ Database Schema

### MongoDB Collections

#### detective_analyses
```javascript
{
  _id: ObjectId,
  user_id: String,
  image_filename: String,
  image_hash: String,
  analysis: {
    coordinates: { lat: Number, lon: Number },
    address: { formatted: String, city: String, district: String },
    confidence: Number,
    enrichment: Object,
    model_info: String,
    timestamp: String
  },
  geolocation_raw: Object,
  created_at: Date
}
```

#### users
```javascript
{
  _id: ObjectId,
  email: String,
  subscription: String, // 'free', 'pro', 'annual'
  quota: {
    remaining: Number,
    limit: Number
  },
  features: Object,
  created_at: Date,
  updated_at: Date
}
```

## 🔌 API Documentation

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "geoclip_service": "available"
}
```

### Analyze Property Photo
```http
POST /api/detective/analyze
Content-Type: multipart/form-data

FormData:
- image: File (required)
- user_id: String (optional)
```
**Success Response:**
```json
{
  "coordinates": { "lat": 38.7223, "lon": -9.1393 },
  "address": { "formatted": "Lisboa, Portugal" },
  "confidence": 0.85,
  "enrichment": { "schools": 2, "supermarkets": 1 },
  "model_info": "geoclip",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
**Error Response:**
```json
{
  "error": "Analysis failed",
  "message": "Prediction confidence too low: 0.2 (minimum: 0.3)",
  "type": "validation_error",
  "suggestion": "Please try a different image"
}
```

### Get User Quota
```http
GET /api/detective/quota?user_id=anonymous
```
**Response:**
```json
{
  "success": true,
  "data": {
    "remaining": 3,
    "limit": 3,
    "subscription": "free",
    "plan": "free"
  }
}
```

## 🎨 Styling System

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          800: '#065f46'
        }
      },
      fontFamily: {
        'heading': ['Montserrat', 'sans-serif']
      }
    }
  }
}
```

### CSS Variables
```css
:root {
  --primary-50: #ecfdf5;
  --primary-500: #10b981;
  --primary-600: #059669;
  --primary-800: #065f46;
}
```

## 🔒 Security Implementation

### CORS Configuration
```python
from flask_cors import CORS
CORS(app)  # Enable CORS for all routes
```

### Input Validation
```python
# File type validation
allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
if not ('.' in image_file.filename and
        image_file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
    return jsonify({'error': 'Invalid file type'}), 400
```

### Error Handling
```python
try:
    result = geoclip_service.predict_location(image_path)
except ValueError as e:
    return jsonify({
        'error': 'Analysis failed',
        'message': str(e),
        'type': 'validation_error'
    }), 422
```

## 📊 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed uploads
- **Bundle Analysis**: Vite build optimization
- **Caching**: Static asset caching

### Backend Optimizations
- **Model Caching**: GeoCLIP model loaded once
- **Result Caching**: Analysis results cached for 24 hours
- **Database Indexing**: Optimized MongoDB queries
- **Memory Management**: Proper cleanup of temporary files

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Component testing
import { render, screen } from '@testing-library/react'
import PropertyInput from './PropertyInput'

test('renders analyze button', () => {
  render(<PropertyInput onAnalyze={jest.fn()} loading={false} />)
  expect(screen.getByText('Analyze Property')).toBeInTheDocument()
})
```

### Integration Tests
```python
# Backend API testing
def test_analyze_property():
    with app.test_client() as client:
        response = client.post('/api/detective/analyze', 
                             data={'image': test_image})
        assert response.status_code == 200
        assert 'coordinates' in response.json
```

### Manual Testing Checklist
- [ ] URL analysis with valid Idealista URLs
- [ ] Property Detective with property photos
- [ ] Mapbox integration and marker display
- [ ] Error handling with invalid inputs
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 🚀 Deployment Guide

### Environment Setup
```bash
# Frontend
npm install
npm run build

# Backend
pip install -r requirements.txt
python app.py
```

### Production Configuration
```python
# app.py
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB
app.config['UPLOAD_FOLDER'] = 'uploads'
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Monitoring & Analytics

### Health Monitoring
- **Frontend**: Vite dev server health
- **Backend**: Flask health endpoint
- **Database**: MongoDB connection status
- **AI Model**: GeoCLIP service availability

### Error Tracking
- **Frontend**: Console error logging
- **Backend**: Python logging with levels
- **Database**: MongoDB error handling
- **API**: HTTP status code monitoring

## 🔄 Development Workflow

### Git Workflow
1. **Feature Branch**: Create from main
2. **Development**: Implement features
3. **Testing**: Run tests and manual checks
4. **Review**: Code review process
5. **Merge**: Merge to main branch
6. **Deploy**: Automatic deployment

### Code Standards
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Documentation**: Update docs with changes

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: ProprScout Development Team
