#!/usr/bin/env python3
"""
Simple GeoCLIP Test
Quick test to verify GeoCLIP integration
"""

import os
import sys
import logging
from PIL import Image
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_geoclip_import():
    """Test if GeoCLIP can be imported"""
    try:
        from geoclip import GeoCLIP
        logger.info("✅ GeoCLIP imported successfully")
        return True
    except ImportError as e:
        logger.error(f"❌ GeoCLIP import failed: {e}")
        return False

def test_geoclip_model():
    """Test if GeoCLIP model can be initialized"""
    try:
        from geoclip import GeoCLIP
        model = GeoCLIP()
        logger.info("✅ GeoCLIP model initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ GeoCLIP model initialization failed: {e}")
        return False

def test_geoclip_service():
    """Test if our GeoCLIP service works"""
    try:
        from services.geoclip_service import get_geoclip_service
        service = get_geoclip_service()
        logger.info("✅ GeoCLIP service initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ GeoCLIP service initialization failed: {e}")
        return False

def test_image_processing():
    """Test image processing with GeoCLIP"""
    try:
        from services.geoclip_service import get_geoclip_service
        
        # Create a simple test image
        img = Image.new('RGB', (224, 224), color='red')
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        img.save(temp_file.name, 'JPEG')
        temp_file.close()
        
        # Test service
        service = get_geoclip_service()
        result = service.predict_location(temp_file.name)
        
        # Clean up
        os.remove(temp_file.name)
        
        logger.info(f"✅ Image processing test passed: {result}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Image processing test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("🧪 Running GeoCLIP integration tests...")
    
    tests = [
        ("GeoCLIP Import", test_geoclip_import),
        ("GeoCLIP Model", test_geoclip_model),
        ("GeoCLIP Service", test_geoclip_service),
        ("Image Processing", test_image_processing)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        logger.info(f"Running {test_name} test...")
        if test_func():
            passed += 1
        else:
            logger.error(f"{test_name} test failed")
    
    logger.info(f"Tests completed: {passed}/{total} passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! GeoCLIP integration is working.")
        return True
    else:
        logger.error("❌ Some tests failed. Check the logs above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
