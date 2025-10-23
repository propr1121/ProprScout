#!/bin/bash

# ProprScout Intelligence - Development Setup Script
# This script sets up the development environment for ProprScout

set -e  # Exit on any error

echo "🚀 Setting up ProprScout Intelligence Development Environment"
echo "=============================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    echo "   Visit: https://python.org/"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "✅ Python $PYTHON_VERSION detected"

# Frontend Setup
echo ""
echo "📦 Setting up Frontend..."
echo "========================="

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Mapbox Access Token (get from https://mapbox.com)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# API Configuration
VITE_API_URL=http://localhost:3002
EOF
    echo "⚠️  Please update .env.local with your Mapbox token"
fi

# Backend Setup
echo ""
echo "🐍 Setting up Backend..."
echo "========================"

# Create virtual environment
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "Installing backend dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Create backend environment file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > backend/.env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/proprscout

# GeoCLIP Configuration
GEOCLIP_DEVICE=auto
GEOCLIP_CACHE_DIR=./cache

# Server Configuration
PORT=3002
FLASK_ENV=development
EOF
    echo "⚠️  Please update backend/.env with your MongoDB URI"
fi

# Create cache directory
mkdir -p backend/cache

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Mapbox token"
echo "2. Update backend/.env with your MongoDB URI"
echo "3. Start the development servers:"
echo ""
echo "   # Terminal 1 - Frontend"
echo "   npm run dev"
echo ""
echo "   # Terminal 2 - Backend"
echo "   cd backend && source venv/bin/activate && python app.py"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "- README.md - Project overview"
echo "- TECHNICAL_DOCS.md - Technical details"
echo "- DEPLOYMENT.md - Production deployment"
echo "- CHANGELOG.md - Version history"
echo ""
echo "Happy coding! 🚀"
