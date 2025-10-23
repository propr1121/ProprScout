#!/usr/bin/env python3
"""
Setup script for GeoCLIP Portuguese Property Location Prediction
Installs dependencies and prepares the environment
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a Python package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up GeoCLIP for Portuguese Property Location Prediction")
    print("="*70)
    
    # Check Python version
    python_version = sys.version_info
    print(f"🐍 Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 7):
        print("❌ Python 3.7+ is required")
        sys.exit(1)
    
    # Install basic dependencies
    print("\n📦 Installing basic dependencies...")
    basic_packages = [
        "torch",
        "torchvision", 
        "pillow",
        "requests",
        "numpy",
        "matplotlib",
        "seaborn",
        "pandas",
        "scikit-learn",
        "tqdm"
    ]
    
    for package in basic_packages:
        install_package(package)
    
    # Install GeoCLIP from GitHub
    print("\n🔧 Installing GeoCLIP from GitHub...")
    geoclip_installed = install_package("git+https://github.com/VicenteVivan/geo-clip.git")
    
    if geoclip_installed:
        print("\n✅ Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Collect 50 Portuguese property images with known addresses")
        print("2. Update the test_properties list in test_geoclip_portuguese.py")
        print("3. Run: python test_geoclip_portuguese.py")
        print("\n🎯 The script will test GeoCLIP accuracy on Portuguese properties")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
