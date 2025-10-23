#!/bin/bash

# GeoCLIP Installation Script
# Installs GeoCLIP and dependencies for property geolocation

set -e

echo "🚀 Installing GeoCLIP for Property Detective..."

# Check Python version
echo "Checking Python version..."
python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.8+ required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version: $python_version"

# Check pip
echo "Checking pip..."
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Please install pip first."
    exit 1
fi

echo "✅ pip3 found"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install PyTorch
echo "Installing PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install GeoCLIP dependencies
echo "Installing GeoCLIP dependencies..."
pip install -r requirements_geoclip.txt

# Install GeoCLIP
echo "Installing GeoCLIP from GitHub..."
pip install git+https://github.com/VicenteVivan/geo-clip.git

# Create cache directory
echo "Creating cache directory..."
mkdir -p cache

# Test installation
echo "Testing GeoCLIP installation..."
python3 -c "
try:
    from geoclip import GeoCLIP
    print('✅ GeoCLIP imported successfully')
    
    # Test model initialization
    model = GeoCLIP()
    print('✅ GeoCLIP model initialized successfully')
    
except ImportError as e:
    print(f'❌ GeoCLIP import failed: {e}')
    exit(1)
except Exception as e:
    print(f'❌ GeoCLIP initialization failed: {e}')
    exit(1)
"

echo "🎉 GeoCLIP installation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start your Flask server: python app.py"
echo "2. Test the API: curl -X POST -F 'image=@test.jpg' http://localhost:3001/api/detective/analyze"
echo "3. Check the logs for any issues"
echo ""
echo "For more information, see GEOCLIP_SETUP.md"
