# ProprScout Intelligence - Complete Setup Guide

**Version:** 1.0.0  
**Last Updated:** October 21, 2025

## 🎯 **System Overview**

ProprScout Intelligence is a full-stack web application combining:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Flask + Python + GeoCLIP AI
- **Database**: MongoDB
- **AI**: GeoCLIP for property geolocation

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- Python 3.8+
- MongoDB
- Git

### **1. Clone Repository**
```bash
git clone <repository-url>
cd ProprScout-main
```

### **2. Backend Setup (Flask + GeoCLIP)**

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install GeoCLIP (if not already done)
python setup_geoclip.py

# Start MongoDB (if not running)
brew services start mongodb/brew/mongodb-community

# Start Flask server
PORT=3001 python app.py
```

### **3. Frontend Setup (React)**

```bash
# Navigate to project root
cd /Users/john/Downloads/ProprScout-main

# Install dependencies
npm install

# Start development server
npm run dev
```

### **4. Verify Installation**

```bash
# Test backend health
curl http://localhost:3001/api/health

# Test GeoCLIP with sample image
curl -X POST -F "image=@test_property.jpg" http://localhost:3001/api/detective/analyze

# Frontend should be available at
open http://localhost:5173
```

## 📁 **Project Structure**

```
ProprScout-main/
├── backend/                     # Flask backend
│   ├── app.py                  # Main Flask application
│   ├── services/
│   │   └── geoclip_service.py  # AI geolocation service
│   ├── requirements.txt        # Python dependencies
│   ├── venv/                   # Python virtual environment
│   └── cache/                  # GeoCLIP model cache
├── src/                        # React frontend
│   ├── App.jsx                # Main React component
│   ├── components/
│   │   ├── PropertyDetective.jsx  # AI image analysis
│   │   ├── PropertyInput.jsx      # URL analysis
│   │   └── PropertyResults.jsx # Results display
│   └── hooks/
│       └── usePropertyAnalysis.js # Analysis logic
├── package.json               # Frontend dependencies
└── README.md                  # Project documentation
```

## 🔧 **Configuration**

### **Environment Variables**

Create `.env` file in backend directory:
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/proprscout

# GeoCLIP
GEOCLIP_DEVICE=auto  # auto, cuda, mps, cpu
GEOCLIP_CACHE_DIR=./cache

# Flask
PORT=3001
FLASK_ENV=development
```

### **MongoDB Setup**
```bash
# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Test connection
mongosh --eval "db.runCommand('ping')"
```

## 🧪 **Testing**

### **Backend Tests**
```bash
cd backend
source venv/bin/activate

# Test GeoCLIP service
python test_simple.py

# Test Flask API
curl -X POST -F "image=@test_property.jpg" http://localhost:3001/api/detective/analyze
```

### **Frontend Tests**
```bash
# Start development server
npm run dev

# Open browser
open http://localhost:5173
```

## 🚨 **Known Issues & Solutions**

### **Issue 1: Port Conflicts**
```bash
# Kill existing processes
lsof -i :3001
pkill -f python
pkill -f node

# Restart services
cd backend && source venv/bin/activate && PORT=3001 python app.py
```

### **Issue 2: MongoDB Connection**
```bash
# Check MongoDB status
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community

# Test connection
mongosh --eval "db.runCommand('ping')"
```

### **Issue 3: GeoCLIP Model Loading**
```bash
# Clear cache and reinstall
rm -rf backend/cache/*
cd backend && source venv/bin/activate
python setup_geoclip.py
```

## 📊 **System Status**

### **Current Working Features**
- ✅ GeoCLIP AI geolocation
- ✅ Flask API endpoints
- ✅ React frontend
- ✅ File upload system
- ✅ Map visualization
- ✅ MongoDB database

### **Known Limitations**
- ⚠️ Geolocation accuracy varies
- ⚠️ No confidence threshold validation
- ⚠️ Database connection issues
- ⚠️ Error handling needs improvement

## 🔄 **Development Workflow**

### **Backend Development**
```bash
cd backend
source venv/bin/activate

# Make changes to app.py or services/
# Restart Flask server
PORT=3001 python app.py
```

### **Frontend Development**
```bash
# Make changes to src/
# Hot reload automatically updates
npm run dev
```

### **Database Management**
```bash
# Connect to MongoDB
mongosh proprscout

# View collections
db.detective_analyses.find().count()

# Clear data
db.detective_analyses.deleteMany({})
```

## 🚀 **Production Deployment**

### **Backend (Flask)**
- Deploy to Render/Railway
- Set up MongoDB Atlas
- Configure environment variables
- Set up monitoring

### **Frontend (React)**
- Build production bundle
- Deploy to Vercel/Netlify
- Configure API endpoints
- Set up CDN

## 📈 **Performance Optimization**

### **Current Performance**
- Analysis time: 10-15 seconds
- Model loading: ~10 seconds (first time)
- Cache hit rate: ~80%

### **Optimization Strategies**
- Implement model preloading
- Add progress indicators
- Optimize image processing
- Implement better caching

## 🔒 **Security Considerations**

### **Current Security**
- File type validation
- File size limits (10MB)
- CORS configuration
- Input sanitization

### **Production Security**
- Add authentication
- Implement rate limiting
- Add request validation
- Set up monitoring

## 📞 **Support & Troubleshooting**

### **Common Commands**
```bash
# Check system status
curl http://localhost:3001/api/health

# Test GeoCLIP
cd backend && source venv/bin/activate && python test_simple.py

# View logs
tail -f backend/logs/app.log
```

### **Debug Mode**
```bash
# Enable Flask debug mode
cd backend
source venv/bin/activate
FLASK_DEBUG=1 PORT=3001 python app.py
```

---

**Status**: Core system functional, ready for production optimization and deployment.
