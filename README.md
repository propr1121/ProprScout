# ProprScout Intelligence

A React-based web application for deep property analysis from any listing URL in Portugal, featuring AI-powered insights and geospatial analysis.

## 🚀 Features

### Core Functionality
- **URL Analysis**: Analyze property listings from major Portuguese portals (Idealista, Imovirtual, Supercasa)
- **Property Detective**: Upload property photos for AI-powered location detection using GeoCLIP
- **Mapbox Integration**: Beautiful satellite imagery with custom markers
- **Real-time Analysis**: 30-second analysis with 10+ data points
- **Premium UI**: Modern design with Tailwind CSS

### Supported Platforms
- **Idealista**: Portugal's largest property portal
- **Imovirtual**: Major Portuguese real estate platform  
- **Supercasa**: Portuguese property listings
- **OLX**: General classifieds (property section)

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Mapbox GL JS** for mapping
- **React Dropzone** for file uploads

### Backend
- **Flask** (Python) for GeoCLIP image analysis
- **Express.js** for API and web scraping
- **Anthropic Claude** for AI-powered property insights
- **MongoDB** for data storage
- **GeoCLIP** for image geolocation
- **Puppeteer** for robust scraping

### Infrastructure
- **Development**: Local development servers
- **Production Ready**: Railway/Render deployment
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary for images

## 📁 Project Structure

```
ProprScout-main/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx           # Main landing page component
│   │   ├── PropertyInput.jsx          # URL input component
│   │   ├── PropertyResults.jsx       # Analysis results display
│   │   ├── PropertyDetective.jsx     # Photo upload & analysis
│   │   ├── MapboxMap.jsx             # Mapbox integration
│   │   ├── ProprHomeIcon.jsx         # Logo component
│   │   ├── UpgradeModal.jsx          # Subscription upgrade
│   │   └── SharePrompt.jsx           # Referral system
│   ├── hooks/
│   │   └── usePropertyAnalysis.js    # Analysis logic
│   ├── lib/
│   │   ├── scrapers/
│   │   │   ├── urlParser.js          # URL parsing
│   │   │   └── propertyScraper.js    # Web scraping
│   │   └── analysis/
│   │       └── propertyAnalyzer.js   # Analysis algorithms
│   ├── App.jsx                       # Main application & dashboard
│   └── main.jsx                      # Entry point
├── backend/
│   ├── app.py                        # Flask application
│   ├── services/
│   │   └── geoclip_service.py        # GeoCLIP integration
│   └── requirements.txt              # Python dependencies
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (local or Atlas)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

### Environment Variables
Create `.env.local` in the root directory:
```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
MONGODB_URI=mongodb://localhost:27017/proprscout
GEOCLIP_DEVICE=auto
```

Create `.env` in the `backend/backend/` directory:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
MONGODB_URI=mongodb://localhost:27017/proprscout
REDIS_URL=redis://localhost:6379
```

## 🔧 Configuration

### Mapbox Setup
1. Sign up at [Mapbox](https://mapbox.com)
2. Get your public access token
3. Add to `.env.local` as `VITE_MAPBOX_ACCESS_TOKEN`

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGODB_URI` in your environment

### GeoCLIP Setup
The GeoCLIP model is automatically downloaded on first run. Ensure you have sufficient disk space (~2GB).

## 📊 API Endpoints

### Frontend (Port 4000)
- `/` - Main application
- `/detective` - Property Detective feature

### Backend (Port 3002)
- `GET /api/health` - Health check
- `POST /api/properties/analyze-url` - Full property analysis (scrape + analyze + AI)
- `POST /api/properties/scrape` - Scrape property data from URL
- `POST /api/detective/analyze` - Analyze property photo
- `GET /api/detective/quota` - Get user quota
- `GET /api/detective/history` - Get analysis history

### Authentication Endpoints
- `POST /api/auth/register` - Register new user (requires invite code)
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/linkedin` - LinkedIn OAuth login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user
- `POST /api/invite/validate` - Validate invite code

### Admin Endpoints (requires admin role)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `POST /api/admin/users/:id/credits` - Add credits to user
- `GET /api/admin/invite-codes` - List invite codes
- `POST /api/admin/invite-codes` - Create invite code
- `DELETE /api/admin/invite-codes/:id` - Delete invite code

### Flask Backend (Port 3001)
- `GET /api/health` - Health check with GeoCLIP status
- `POST /api/geoclip/predict` - Image geolocation prediction

## 🎨 Design System

### Colors
- **Primary**: Emerald (#10b981)
- **Secondary**: Teal (#14b8a6)
- **Accent**: Yellow (#f59e0b)
- **Background**: Gray-50 (#f9fafb)

### Typography
- **Headings**: Montserrat (font-heading)
- **Body**: Poppins (default)
- **Sizes**: Responsive from sm to 6xl

### Components
- **Buttons**: Rounded with hover effects
- **Cards**: White background with subtle shadows
- **Forms**: Clean inputs with focus states
- **Maps**: Satellite imagery with custom markers

## 🔒 Security Features

- **CORS Protection**: Configured for production
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitized user inputs
- **Error Handling**: Graceful failure modes
- **No Mock Data**: Real analysis only, no fake results

## 📈 Performance

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Compressed uploads
- **Caching**: GeoCLIP model caching
- **CDN Ready**: Static assets optimized

## 🚀 Deployment

### Frontend Deployment (Vercel)
See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for complete Vercel deployment instructions.

**Quick Start**:
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Backend Deployment (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables (see `backend/backend/env.example`)
3. Deploy automatically on push

### Docker (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🧪 Testing

### Manual Testing
1. **URL Analysis**: Test with Idealista/Imovirtual URLs
2. **Property Detective**: Upload property photos
3. **Map Integration**: Verify Mapbox rendering
4. **Error Handling**: Test with invalid inputs

### Test URLs
- Idealista: `https://www.idealista.pt/imovel/12345678/`
- Imovirtual: `https://www.imovirtual.com/anuncio/12345678/`

## 🐛 Troubleshooting

### Common Issues
1. **Mapbox not loading**: Check `VITE_MAPBOX_ACCESS_TOKEN`
2. **Backend connection failed**: Verify port 3002 is available
3. **Frontend port conflict**: Frontend runs on port 4000 (configurable in vite.config.js)
4. **GeoCLIP errors**: Ensure sufficient disk space and memory
5. **CORS issues**: Check backend CORS configuration

### Debug Mode
```bash
# Frontend debug
npm run dev -- --debug

# Backend debug
FLASK_DEBUG=1 python app.py
```

## 📝 Development Notes

### Recent Changes
- ✅ **Authentication System**: Complete SSO with Google & LinkedIn OAuth
- ✅ **Invite Code Gate**: Beta access control with invite codes (FOUNDER2024, BETA2024)
- ✅ **Admin Dashboard**: Full admin panel for user management, stats, and invite code creation
- ✅ **User Profile**: Dynamic user data display (name, initials, tier)
- ✅ **Anthropic Claude AI Integration**: Smart property analysis with AI-powered insights
- ✅ **New Scoring System**: Weighted scoring (Listing Quality 40%, Space Efficiency 35%, Data Completeness 25%)
- ✅ **URL Analysis Flow**: Combined scrape + analysis + AI in single endpoint
- ✅ **AI Intelligence Report**: New UI section displaying AI analysis results
- ✅ **Mapbox Integration**: Replaced Leaflet with Mapbox GL JS
- ✅ **GeoCLIP Integration**: AI-powered image geolocation
- ✅ **Error Handling**: No mock data, real analysis only
- ✅ **UI/UX**: Premium design system implementation
- ✅ **Logo**: Simple house icon in green square with gradient background
- ✅ **Landing Page**: Complete redesign with premium animations, gradient buttons, case study carousel, and consistent branding
- ✅ **Dashboard Redesign**: Unified design system matching landing page, consolidated sections, intelligent upgrade flow, expandable analysis history, floating action button

### Code Quality
- **ESLint**: Code linting enabled
- **Prettier**: Code formatting
- **TypeScript Ready**: Can be migrated to TypeScript
- **Accessibility**: ARIA labels and keyboard navigation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- Check the troubleshooting section
- Review the API documentation
- Test with the provided sample URLs

---

**ProprScout Intelligence** - Property Analysis Made Simple