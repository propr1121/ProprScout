#!/bin/bash

# ProprScout Geolocation Service Startup Script
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "ProprScout Geolocation Service"
echo "=========================================="

# Check Python version
PYTHON_CMD=""
for cmd in python3.11 python3.10 python3; do
    if command -v $cmd &> /dev/null; then
        version=$($cmd --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
        major=$(echo $version | cut -d. -f1)
        minor=$(echo $version | cut -d. -f2)
        if [ "$major" -eq 3 ] && [ "$minor" -ge 10 ]; then
            PYTHON_CMD=$cmd
            break
        fi
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    echo "Error: Python 3.10+ required"
    exit 1
fi

echo "Using Python: $PYTHON_CMD"

# Create virtual environment if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create data directories
mkdir -p data/portugal data/indexes data/feedback data/gis_cache

# Set environment
export FLASK_APP=app.py
export FLASK_ENV=${FLASK_ENV:-production}
export PORT=${PORT:-3001}

# Start server
echo "Starting server on port $PORT..."
if [ "$FLASK_ENV" = "development" ]; then
    python app.py
else
    gunicorn -w 2 -b 0.0.0.0:$PORT app:app
fi
