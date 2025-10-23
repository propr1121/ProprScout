# ProprScout Intelligence - Quick Start Guide

## 🚀 **Get Started in 5 Minutes**

### **1. Start the Backend Server**
```bash
cd /Users/john/Downloads/ProprScout-main/backend
PORT=3002 node server.js
```
**Expected Output**: `🚀 ProprScout Backend Server running on port 3002`

### **2. Start the Frontend Server**
```bash
cd /Users/john/Downloads/ProprScout-main
npm run dev
```
**Expected Output**: `Local: http://localhost:3003/`

### **3. Open Your Browser**
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:3002/api/health

## 🧪 **Test the Application**

### **Test Backend API**
```bash
# Health check
curl http://localhost:3002/api/health

# Test scraping (will show Idealista is blocked)
curl -X POST http://localhost:3002/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.idealista.pt/en/imovel/32199296/","site":"idealista"}'
```

### **Test Frontend**
1. **Open**: http://localhost:3003
2. **Paste URL**: `https://www.idealista.pt/en/imovel/32199296/`
3. **Click**: "Analyze Property"
4. **Expected**: Error message explaining Idealista limitations

## 🎯 **Current Status**

### **✅ Working**
- **Backend Server** - Running on port 3002
- **Frontend App** - Running on port 3003
- **URL Parsing** - All 4 Portuguese property sites
- **Error Handling** - Clear user feedback
- **Property Analysis** - AI-powered scoring

### **❌ Known Issues**
- **Idealista Scraping** - Blocked by anti-bot protection
- **Alternative Sites** - Need testing (Imovirtual, OLX, Supercasa)

## 🔧 **Development Commands**

```bash
# Frontend development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend development
cd backend
node server.js       # Start production server
```

## 📊 **Test URLs**

### **Idealista** (Currently Blocked)
- `https://www.idealista.pt/en/imovel/32199296/`
- `https://www.idealista.pt/imovel/33518905/`

### **Alternative Sites** (Need Testing)
- **Imovirtual**: `https://www.imovirtual.com/anuncios/12345678-ID12345678.html`
- **OLX**: `https://www.olx.pt/imovel/12345678-ID12345678.html`
- **Supercasa**: `https://www.supercasa.pt/imovel/12345678`

## 🚨 **Troubleshooting**

### **Backend Not Starting**
```bash
# Check if port 3002 is in use
lsof -i :3002

# Kill existing processes
pkill -f "node server.js"

# Start fresh
cd backend && PORT=3002 node server.js
```

### **Frontend Not Starting**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### **API Connection Issues**
- **Check Backend**: http://localhost:3002/api/health
- **Check Frontend**: http://localhost:3003
- **Verify Ports**: Both servers should be running

## 📈 **Next Steps**

1. **Test Alternative Sites** - Try Imovirtual, OLX, Supercasa URLs
2. **Optimize Scraping** - Improve success rates
3. **User Testing** - Get feedback on error messages
4. **Feature Development** - PDF export, user accounts

---

**Status**: Ready for testing alternative Portuguese property sites  
**Priority**: Test Imovirtual, OLX, Supercasa scraping this week
