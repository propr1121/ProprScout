#!/usr/bin/env python3
"""
Direct GeoCLIP test to understand predict method output
"""

import sys
import logging
from PIL import Image
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_geoclip_direct():
    """Test GeoCLIP predict method directly"""
    try:
        from geoclip import GeoCLIP
        
        logger.info("Testing GeoCLIP predict method directly...")
        
        # Initialize model
        model = GeoCLIP()
        logger.info("GeoCLIP model initialized")
        
        # Create a test image file
        test_image = Image.new('RGB', (224, 224), color='red')
        test_image_path = 'test_direct.jpg'
        test_image.save(test_image_path)
        logger.info(f"Created test image: {test_image_path}")
        
        # Test predict method with different top_k values
        for top_k in [1, 3, 5]:
            try:
                logger.info(f"Testing predict with top_k={top_k}")
                result = model.predict(test_image_path, top_k=top_k)
                logger.info(f"Result: {result}")
                logger.info(f"Result type: {type(result)}")
                logger.info(f"Result length: {len(result) if hasattr(result, '__len__') else 'N/A'}")
                
                if hasattr(result, '__len__') and len(result) > 0:
                    logger.info(f"First item: {result[0]}")
                    logger.info(f"First item type: {type(result[0])}")
                    if hasattr(result[0], '__len__'):
                        logger.info(f"First item length: {len(result[0])}")
                        for i, item in enumerate(result[0]):
                            logger.info(f"  Item {i}: {item}, type: {type(item)}")
                
            except Exception as e:
                logger.error(f"Predict with top_k={top_k} failed: {e}")
        
        # Clean up
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            
    except Exception as e:
        logger.error(f"GeoCLIP direct test failed: {e}")

if __name__ == "__main__":
    test_geoclip_direct()
