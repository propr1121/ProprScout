#!/bin/bash

# ProprScout Deployment Script
# Supports Phase 1 (Railway), Phase 2 (Railway Pro), Phase 3 (AWS EC2)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if phase is provided
if [ -z "$1" ]; then
    log_error "Please specify deployment phase: phase1, phase2, or phase3"
    echo "Usage: ./deploy.sh [phase1|phase2|phase3]"
    exit 1
fi

PHASE=$1

case $PHASE in
    "phase1")
        log_info "Deploying Phase 1: Free Tier (Railway + MongoDB Atlas + Cloudinary)"
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            log_error "Railway CLI not found. Please install it first:"
            echo "npm install -g @railway/cli"
            exit 1
        fi
        
        # Login to Railway
        log_info "Logging into Railway..."
        railway login
        
        # Deploy to Railway
        log_info "Deploying to Railway..."
        railway up
        
        log_success "Phase 1 deployment completed!"
        log_info "Your app is now running on Railway free tier"
        ;;
        
    "phase2")
        log_info "Deploying Phase 2: Growth Stage (Railway Pro + MongoDB M10 + Cloudinary Plus)"
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            log_error "Railway CLI not found. Please install it first:"
            echo "npm install -g @railway/cli"
            exit 1
        fi
        
        # Login to Railway
        log_info "Logging into Railway..."
        railway login
        
        # Upgrade to Railway Pro
        log_info "Upgrading to Railway Pro..."
        railway plan:upgrade
        
        # Deploy to Railway Pro
        log_info "Deploying to Railway Pro..."
        railway up
        
        log_success "Phase 2 deployment completed!"
        log_info "Your app is now running on Railway Pro"
        ;;
        
    "phase3")
        log_info "Deploying Phase 3: Scale Stage (AWS EC2 GPU + MongoDB M30 + Cloudinary Advanced)"
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            log_error "Docker not found. Please install Docker first."
            exit 1
        fi
        
        # Check if Docker Compose is installed
        if ! command -v docker-compose &> /dev/null; then
            log_error "Docker Compose not found. Please install Docker Compose first."
            exit 1
        fi
        
        # Build and start services
        log_info "Building Docker images..."
        docker-compose build
        
        log_info "Starting services..."
        docker-compose up -d
        
        # Wait for services to be ready
        log_info "Waiting for services to be ready..."
        sleep 30
        
        # Check health
        log_info "Checking service health..."
        if curl -f http://localhost/api/health; then
            log_success "Phase 3 deployment completed!"
            log_info "Your app is now running on AWS EC2 with GPU support"
        else
            log_error "Health check failed. Please check the logs:"
            echo "docker-compose logs"
            exit 1
        fi
        ;;
        
    *)
        log_error "Invalid phase: $PHASE"
        echo "Usage: ./deploy.sh [phase1|phase2|phase3]"
        exit 1
        ;;
esac

log_success "Deployment completed successfully!"
log_info "Next steps:"
echo "1. Configure your environment variables"
echo "2. Set up your domain and SSL certificates"
echo "3. Configure monitoring and alerts"
echo "4. Test your deployment"
