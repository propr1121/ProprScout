#!/usr/bin/env python3
"""
Test GeoCLIP service directly
"""

import sys
import logging
from PIL import Image
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_geoclip_service():
    """Test GeoCLIP service directly"""
    try:
        # Import the service
        from services.geoclip_service import get_geoclip_service
        
        logger.info("Testing GeoCLIP service directly...")
        
        # Get service instance
        service = get_geoclip_service()
        logger.info("GeoCLIP service initialized")
        
        # Create a test image
        test_image = Image.new('RGB', (224, 224), color='red')
        test_image_path = 'test_service.jpg'
        test_image.save(test_image_path)
        logger.info(f"Created test image: {test_image_path}")
        
        # Test the service
        try:
            result = service.predict_location(test_image_path)
            logger.info(f"Service result: {result}")
            logger.info(f"Result type: {type(result)}")
            
            if 'coordinates' in result:
                coords = result['coordinates']
                logger.info(f"Coordinates: lat={coords.get('lat')}, lon={coords.get('lon')}")
                logger.info(f"Confidence: {result.get('confidence')}")
                logger.info(f"Model: {result.get('model')}")
                
                # Check if it's real data or fallback
                if result.get('model') == 'geoclip-b_v1':
                    logger.info("✅ REAL AI PREDICTION!")
                else:
                    logger.info("❌ FALLBACK DATA")
            else:
                logger.error("No coordinates in result")
                
        except Exception as e:
            logger.error(f"Service prediction failed: {e}")
        
        # Clean up
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            
    except Exception as e:
        logger.error(f"GeoCLIP service test failed: {e}")

if __name__ == "__main__":
    test_geoclip_service()
