#!/usr/bin/env python3
"""
Test Flask app GeoCLIP integration directly
"""

import sys
import logging
import os
import tempfile
from PIL import Image

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_flask_geoclip():
    """Test Flask app GeoCLIP integration"""
    try:
        # Import the Flask app components
        from app import geoclip_service, get_address_from_coordinates, generate_enrichment_data
        
        logger.info("Testing Flask app GeoCLIP integration...")
        
        # Check if GeoCLIP service is available
        if geoclip_service:
            logger.info("✅ GeoCLIP service is available")
        else:
            logger.error("❌ GeoCLIP service is not available")
            return
        
        # Create a test image
        test_image = Image.new('RGB', (224, 224), color='red')
        test_image_path = os.path.join(tempfile.gettempdir(), 'test_flask.jpg')
        test_image.save(test_image_path)
        logger.info(f"Created test image: {test_image_path}")
        
        # Test GeoCLIP service directly
        try:
            logger.info("Testing GeoCLIP service directly...")
            result = geoclip_service.predict_location(test_image_path)
            logger.info(f"GeoCLIP result: {result}")
            
            if result and 'coordinates' in result:
                coordinates = result.get('coordinates', {})
                confidence = result.get('confidence', 0.0)
                model = result.get('model', 'unknown')
                
                logger.info(f"Coordinates: {coordinates}")
                logger.info(f"Confidence: {confidence}")
                logger.info(f"Model: {model}")
                
                if model == 'geoclip':
                    logger.info("✅ REAL AI PREDICTION!")
                else:
                    logger.info("❌ FALLBACK DATA")
                
                # Test address generation
                address_info = get_address_from_coordinates(
                    coordinates.get('lat', 0), 
                    coordinates.get('lon', 0)
                )
                logger.info(f"Address info: {address_info}")
                
                # Test enrichment data
                enrichment_data = generate_enrichment_data(coordinates)
                logger.info(f"Enrichment data: {enrichment_data}")
                
            else:
                logger.error("No coordinates in GeoCLIP result")
                
        except Exception as e:
            logger.error(f"GeoCLIP service test failed: {e}")
        
        # Clean up
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            
    except Exception as e:
        logger.error(f"Flask GeoCLIP test failed: {e}")

if __name__ == "__main__":
    test_flask_geoclip()
