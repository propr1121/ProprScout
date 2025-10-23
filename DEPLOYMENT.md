# ProprScout Intelligence - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ installed
- Python 3.8+ installed
- MongoDB Atlas account
- Mapbox account
- Railway/Render account (optional)

## 📋 Pre-Deployment Checklist

### Environment Variables
Create `.env.production` file:
```env
# Frontend
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
VITE_API_URL=https://your-backend-url.com

# Backend
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/proprscout
GEOCLIP_DEVICE=auto
GEOCLIP_CACHE_DIR=/tmp/cache
PORT=3002
FLASK_ENV=production
```

### Dependencies Check
```bash
# Frontend dependencies
npm list --depth=0

# Backend dependencies
pip list
```

## 🏗️ Build Process

### Frontend Build
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build
ls -la dist/
```

### Backend Preparation
```bash
# Install Python dependencies
pip install -r requirements.txt

# Test GeoCLIP model loading
python -c "from services.geoclip_service import get_geoclip_service; get_geoclip_service()"
```

## 🌐 Deployment Options

### Option 1: Railway (Recommended)

#### Frontend Deployment
1. **Connect Repository**
   - Go to Railway dashboard
   - Click "New Project"
   - Connect GitHub repository

2. **Configure Build**
   ```json
   // railway.json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/"
     }
   }
   ```

3. **Environment Variables**
   - `VITE_MAPBOX_ACCESS_TOKEN`
   - `VITE_API_URL`

#### Backend Deployment
1. **Create New Service**
   - Add service to existing project
   - Select Python runtime

2. **Configure Dependencies**
   ```txt
   # requirements.txt
   flask==2.3.3
   flask-cors==4.0.0
   pymongo==4.5.0
   python-dotenv==1.0.0
   torch==2.0.1
   torchvision==0.15.2
   pillow==10.0.0
   ```

3. **Start Command**
   ```bash
   python app.py
   ```

### Option 2: Render

#### Frontend Deployment
1. **Create Web Service**
   - Connect GitHub repository
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Start Command: `npm start`

#### Backend Deployment
1. **Create Web Service**
   - Connect GitHub repository
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`

### Option 3: VPS/Cloud Server

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt install python3.8 python3.8-venv python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Application Deployment
```bash
# Clone repository
git clone https://github.com/your-username/proprscout.git
cd proprscout

# Frontend setup
npm install
npm run build

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Process Management
```bash
# Install PM2
npm install -g pm2

# Start frontend
pm2 start "npm start" --name "proprscout-frontend"

# Start backend
pm2 start "python app.py" --name "proprscout-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔧 Configuration

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/proprscout
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring Setup

### Health Checks
```bash
# Frontend health check
curl -f http://localhost:3000/ || exit 1

# Backend health check
curl -f http://localhost:3002/api/health || exit 1
```

### Log Monitoring
```bash
# View PM2 logs
pm2 logs

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Monitoring
```bash
# MongoDB status
sudo systemctl status mongod

# Check database connections
mongo --eval "db.serverStatus().connections"
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build frontend
        run: npm run build
        
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🚨 Troubleshooting

### Common Issues

#### Frontend Not Loading
```bash
# Check if frontend is running
pm2 status
curl http://localhost:3000

# Restart frontend
pm2 restart proprscout-frontend
```

#### Backend Connection Failed
```bash
# Check backend logs
pm2 logs proprscout-backend

# Test API endpoint
curl http://localhost:3002/api/health
```

#### GeoCLIP Model Issues
```bash
# Check disk space
df -h

# Clear cache
rm -rf /tmp/cache/*

# Test model loading
python -c "from services.geoclip_service import get_geoclip_service; print('Model loaded successfully')"
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongo --eval "db.adminCommand('ping')"
```

### Performance Optimization

#### Frontend Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/

# Enable gzip compression
# Add to nginx config:
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### Backend Optimization
```python
# Add to app.py
from flask import Flask
from flask_compress import Compress

app = Flask(__name__)
Compress(app)  # Enable gzip compression
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Nginx or cloud load balancer
- **Multiple Instances**: Run multiple backend instances
- **Database Sharding**: MongoDB sharding for large datasets

### Vertical Scaling
- **Memory**: Increase RAM for GeoCLIP model
- **CPU**: More cores for parallel processing
- **Storage**: SSD for faster model loading

### Caching Strategy
- **CDN**: Cloudflare for static assets
- **Redis**: Session and result caching
- **Database**: MongoDB query optimization

## 🔒 Security Hardening

### Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set PermitRootLogin no
sudo systemctl restart ssh
```

### Application Security
```python
# Add to app.py
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Rate limiting on analysis endpoint
@app.route('/api/detective/analyze', methods=['POST'])
@limiter.limit("10 per hour")
def analyze_property():
    # ... existing code
```

## 📋 Post-Deployment Checklist

- [ ] Frontend accessible at domain
- [ ] Backend API responding
- [ ] Database connection working
- [ ] GeoCLIP model loading
- [ ] Mapbox integration working
- [ ] SSL certificate installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation updated

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: January 2024  
**Compatible With**: ProprScout Intelligence v1.0.0
