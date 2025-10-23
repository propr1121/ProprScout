# ProprScout Intelligence - API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3001`  
**Last Updated:** October 21, 2025

## 🎯 **API Overview**

The ProprScout Intelligence API provides endpoints for property analysis using AI-powered geolocation and web scraping capabilities.

## 📡 **Endpoints**

### **Health Check**
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T17:40:03.216945",
  "database": "connected"
}
```

### **Property Detective Analysis**
```http
POST /api/detective/analyze
```

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `image` (file): Property image file (PNG, JPG, JPEG, WEBP)
  - `user_id` (string): User identifier (optional)

**Response:**
```json
{
  "coordinates": {
    "lat": 53.447776794433594,
    "lon": 8.111944198608398
  },
  "address": {
    "formatted": "Portugal",
    "city": "Unknown",
    "district": "Unknown",
    "postcode": "0000-000"
  },
  "confidence": 0.001309536979533732,
  "enrichment": {
    "hospitals": 2,
    "parks": 1,
    "restaurants": 7,
    "schools": 2,
    "supermarkets": 1,
    "transport": 2
  },
  "model_info": "geoclip",
  "timestamp": "2025-10-21T17:37:13.790651"
}
```

**Error Response:**
```json
{
  "error": "Analysis failed",
  "details": "Error message here"
}
```

### **User Quota Status**
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

### **Analysis History**
```http
GET /api/detective/history?user_id=anonymous
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "coordinates": {"lat": 38.7223, "lon": -9.1393},
        "confidence": 0.85,
        "address": {"formatted": "Rua Augusta, Lisboa, Portugal"},
        "enrichment": {"schools": 2, "supermarkets": 1},
        "image_url": "https://example.com/mock_image1.jpg",
        "created_at": "2025-10-21T17:37:13.790651"
      }
    ],
    "total": 1
  }
}
```

### **User Status**
```http
GET /api/pricing/user-status?user_id=anonymous
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": "free",
    "plan": null,
    "quota": {
      "remaining": 3,
      "limit": 3
    },
    "features": {
      "analyses_per_month": 3,
      "analysis_history_limit": 10
    }
  }
}
```

## 🔧 **Request Examples**

### **cURL Examples**

**Health Check:**
```bash
curl -X GET http://localhost:3001/api/health
```

**Property Analysis:**
```bash
curl -X POST \
  -F "image=@property.jpg" \
  -F "user_id=test_user" \
  http://localhost:3001/api/detective/analyze
```

**Get Quota:**
```bash
curl -X GET "http://localhost:3001/api/detective/quota?user_id=anonymous"
```

### **JavaScript Examples**

**Property Analysis:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('user_id', 'anonymous');

const response = await fetch('http://localhost:3001/api/detective/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

**Get User Status:**
```javascript
const response = await fetch('http://localhost:3001/api/pricing/user-status?user_id=anonymous');
const data = await response.json();
console.log(data);
```

## 📊 **Response Fields**

### **Coordinates Object**
```json
{
  "lat": 53.447776794433594,  // Latitude (float)
  "lon": 8.111944198608398    // Longitude (float)
}
```

### **Address Object**
```json
{
  "formatted": "Portugal",     // Full formatted address
  "city": "Unknown",          // City name
  "district": "Unknown",      // District/region
  "postcode": "0000-000"      // Postal code
}
```

### **Enrichment Object**
```json
{
  "hospitals": 2,      // Number of hospitals nearby
  "parks": 1,          // Number of parks nearby
  "restaurants": 7,    // Number of restaurants nearby
  "schools": 2,        // Number of schools nearby
  "supermarkets": 1,   // Number of supermarkets nearby
  "transport": 2       // Number of transport options nearby
}
```

## ⚠️ **Error Handling**

### **HTTP Status Codes**
- `200` - Success
- `400` - Bad Request (invalid file, missing parameters)
- `500` - Internal Server Error (analysis failed, model error)

### **Error Response Format**
```json
{
  "error": "Error type",
  "details": "Detailed error message"
}
```

### **Common Errors**

**Invalid File Type:**
```json
{
  "error": "Invalid file type. Only PNG, JPG, JPEG, WEBP allowed."
}
```

**Analysis Failed:**
```json
{
  "error": "Analysis failed",
  "details": "GeoCLIP model prediction failed"
}
```

**No Image Provided:**
```json
{
  "error": "No image file provided"
}
```

## 🔒 **Authentication**

Currently, the API uses simple user identification:
- `user_id` parameter for tracking
- No authentication required for development
- Production deployment will require proper authentication

## 📈 **Rate Limiting**

### **Current Limits**
- Free users: 3 analyses per month
- No rate limiting implemented yet
- Production will require rate limiting

### **Quota Management**
- Quota checked before analysis
- Remaining quota returned in responses
- Upgrade required when quota exceeded

## 🧪 **Testing**

### **Test Images**
Use any property image for testing:
- Minimum size: 224x224 pixels
- Supported formats: PNG, JPG, JPEG, WEBP
- Maximum size: 10MB

### **Test Commands**
```bash
# Health check
curl http://localhost:3001/api/health

# Test analysis
curl -X POST -F "image=@test_property.jpg" http://localhost:3001/api/detective/analyze

# Check quota
curl "http://localhost:3001/api/detective/quota?user_id=test"
```

## 🔄 **Webhooks & Events**

Currently not implemented. Future versions will include:
- Analysis completion webhooks
- Quota limit notifications
- Error event notifications

## 📊 **Analytics & Monitoring**

### **Current Metrics**
- Analysis success rate
- Average processing time
- Error frequency
- User quota usage

### **Monitoring Endpoints**
- Health check: `/api/health`
- System status: Available in health response
- Database status: Included in health check

## 🚀 **Production Considerations**

### **Scaling**
- GeoCLIP model caching
- Database connection pooling
- Load balancing for multiple instances
- CDN for static assets

### **Security**
- Input validation
- File type restrictions
- Rate limiting
- Authentication & authorization

### **Monitoring**
- Error tracking
- Performance metrics
- User analytics
- System health monitoring

---

**Note:** This API is currently in development. Production deployment will include additional security, monitoring, and scaling features.
