# 🚀 ProprScout Property Detective Setup Guide

## **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+ and pip
- Git
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Redis (optional for development)

---

## **1. Clone Repository**
```bash
# Clone the ProprScout repository
git clone https://github.com/your-org/proprhome.git
cd proprhome

# Create feature branch
git checkout -b feature/property-detective
```

---

## **2. Backend Setup**

### **Navigate to Backend**
```bash
cd backend
```

### **Python Environment Setup**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### **Install Python Dependencies**
```bash
# Core dependencies
pip install torch torchvision

# GeoCLIP for image geolocation
pip install git+https://github.com/VicenteVivan/geo-clip.git

# Web framework and utilities
pip install flask flask-cors pymongo redis python-dotenv

# Additional dependencies
pip install requests pillow numpy opencv-python
pip install geopy nominatim
pip install cloudinary
```

### **Create Backend Environment File**
```bash
# Create .env file
cat > .env << EOF
# Application
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proprscout
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# GeoCLIP
GEOCLIP_MODEL_PATH=./models/geoclip
GEOCLIP_DEVICE=cpu

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
EOF
```

---

## **3. Frontend Setup**

### **Navigate to Frontend**
```bash
cd ../frontend
```

### **Install Node.js Dependencies**
```bash
# Install core dependencies
npm install

# Install Property Detective specific dependencies
npm install react-dropzone react-leaflet leaflet

# Install additional dependencies
npm install @turf/turf clsx lucide-react
```

### **Create Frontend Environment File**
```bash
# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
EOF
```

---

## **4. Database Setup**

### **MongoDB Atlas Setup**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string

### **Update Backend .env**
```bash
# Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proprscout
```

---

## **5. Cloudinary Setup**

### **Cloudinary Account Setup**
1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. Get your cloud name, API key, and API secret

### **Update Environment Files**
```bash
# Backend .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend .env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

---

## **6. Redis Setup (Optional)**

### **Local Redis (Development)**
```bash
# On macOS with Homebrew
brew install redis
brew services start redis

# On Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# On Windows
# Download Redis from https://github.com/microsoftarchive/redis/releases
```

### **Redis Cloud (Production)**
1. Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create a free database
3. Get your connection string

---

## **7. Run Development Servers**

### **Terminal 1: Backend Server**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

### **Terminal 2: Frontend Server**
```bash
cd frontend
npm start
```

### **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

---

## **8. Verify Installation**

### **Backend Health Check**
```bash
curl http://localhost:3001/api/health
```

### **Frontend Check**
- Open http://localhost:3000
- Navigate to Property Detective tab
- Upload a test image

### **Database Connection**
```bash
# Test MongoDB connection
curl http://localhost:3001/api/detective/quota?user_id=test
```

---

## **9. Development Workflow**

### **Git Workflow**
```bash
# Make changes
git add .
git commit -m "Add Property Detective feature"

# Push to feature branch
git push origin feature/property-detective

# Create pull request
# Go to GitHub and create PR
```

### **Hot Reload**
- **Frontend**: Automatically reloads on changes
- **Backend**: Restart server after changes
- **Database**: Changes persist between restarts

---

## **10. Troubleshooting**

### **Common Issues**

#### **Backend Issues**
```bash
# Check Python environment
which python
python --version

# Check dependencies
pip list

# Check logs
tail -f backend/logs/app.log
```

#### **Frontend Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000
```

#### **Database Issues**
```bash
# Test MongoDB connection
mongosh "your_connection_string"

# Check Redis connection
redis-cli ping
```

### **Environment Variables**
```bash
# Check environment variables
echo $MONGODB_URI
echo $CLOUDINARY_URL
echo $REDIS_URL
```

---

## **11. Production Deployment**

### **Phase 1: Railway (Free)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

### **Phase 2: Railway Pro**
```bash
# Upgrade to Pro
railway plan:upgrade

# Deploy with Pro features
railway up
```

### **Phase 3: AWS EC2**
```bash
# Build Docker images
docker-compose build

# Deploy to AWS
docker-compose up -d
```

---

## **12. Monitoring & Analytics**

### **Health Checks**
- Backend: `GET /api/health`
- Database: `GET /api/detective/quota`
- Cloudinary: Image upload test

### **Logs**
- Backend: `backend/logs/app.log`
- Frontend: Browser console
- Database: MongoDB Atlas logs

### **Performance**
- Analysis time: <5 seconds
- Accuracy: >85% for Portuguese properties
- Uptime: >99%

---

## **🎉 You're Ready!**

Your ProprScout Property Detective is now set up and ready for development. The application supports:

- ✅ **Image Upload**: Drag-and-drop property photos
- ✅ **Location Detection**: AI-powered geolocation
- ✅ **Address Lookup**: Reverse geocoding
- ✅ **Map Visualization**: Interactive maps
- ✅ **Quota Management**: Free/Pro tier limits
- ✅ **Referral System**: Viral growth mechanics
- ✅ **Subscription Plans**: Revenue generation

**Happy coding! 🚀**
