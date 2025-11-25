#!/bin/bash
# ProprScout Flask Backend Startup Script
# Starts the Flask backend with GeoCLIP on port 3001

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export PORT=3001

echo "Starting ProprScout Flask Backend..."
echo "Port: $PORT"
echo "Python: $(which python)"
echo "Python version: $(python --version)"

# Start the Flask app
python app.py
