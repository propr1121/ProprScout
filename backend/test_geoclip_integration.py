#!/usr/bin/env python3
"""
Test GeoCLIP Integration
Test script to verify GeoCLIP is working correctly
"""

import os
import sys
import logging
import requests
import json
from PIL import Image
import tempfile
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_test_image():
    """Create a test image for GeoCLIP"""
    # Create a simple test image
    img = Image.new('RGB', (224, 224), color='red')
    
    # Save to temporary file
    temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
    img.save(temp_file.name, 'JPEG')
    temp_file.close()
    
    return temp_file.name

def test_geoclip_service():
    """Test GeoCLIP service directly"""
    logger.info("Testing GeoCLIP service...")
    
    try:
        from services.geoclip_service import get_geoclip_service
        
        # Get service
        service = get_geoclip_service()
        
        # Test model info
        model_info = service.get_model_info()
        logger.info(f"Model info: {model_info}")
        
        # Create test image
        test_image = create_test_image()
        logger.info(f"Created test image: {test_image}")
        
        try:
            # Test prediction
            result = service.predict_location(test_image)
            logger.info(f"Prediction result: {result}")
            
            # Validate result
            assert 'coordinates' in result
            assert 'lat' in result['coordinates']
            assert 'lon' in result['coordinates']
            assert 'confidence' in result
            
            logger.info("✅ GeoCLIP service test passed")
            return True
            
        finally:
            # Clean up test image
            if os.path.exists(test_image):
                os.remove(test_image)
                
    except Exception as e:
        logger.error(f"❌ GeoCLIP service test failed: {e}")
        return False

def test_flask_api():
    """Test Flask API with GeoCLIP integration"""
    logger.info("Testing Flask API...")
    
    try:
        # Create test image
        test_image = create_test_image()
        
        # Prepare request
        url = 'http://localhost:3001/api/detective/analyze'
        
        with open(test_image, 'rb') as f:
            files = {'image': f}
            data = {'user_id': 'test_user'}
            
            # Make request
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"API response: {json.dumps(result, indent=2)}")
                
                # Validate response
                assert 'coordinates' in result
                assert 'address' in result
                assert 'confidence' in result
                assert 'enrichment' in result
                
                logger.info("✅ Flask API test passed")
                return True
            else:
                logger.error(f"❌ API request failed: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"❌ Flask API test failed: {e}")
        return False
    finally:
        # Clean up test image
        if os.path.exists(test_image):
            os.remove(test_image)

def test_health_endpoint():
    """Test health endpoint"""
    logger.info("Testing health endpoint...")
    
    try:
        response = requests.get('http://localhost:3001/api/health')
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Health check: {result}")
            logger.info("✅ Health endpoint test passed")
            return True
        else:
            logger.error(f"❌ Health check failed: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Health endpoint test failed: {e}")
        return False

def main():
    """Main test function"""
    logger.info("🚀 Starting GeoCLIP integration tests...")
    
    # Test 1: Health endpoint
    if not test_health_endpoint():
        logger.error("❌ Health endpoint test failed")
        return False
    
    # Test 2: GeoCLIP service
    if not test_geoclip_service():
        logger.error("❌ GeoCLIP service test failed")
        return False
    
    # Test 3: Flask API
    if not test_flask_api():
        logger.error("❌ Flask API test failed")
        return False
    
    logger.info("🎉 All tests passed! GeoCLIP integration is working correctly.")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
