#!/usr/bin/env python3
"""
Simple GeoCLIP test to understand the correct API
"""

import sys
import logging
from PIL import Image
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_geoclip_simple():
    """Test GeoCLIP with the simplest possible approach"""
    try:
        from geoclip import GeoCLIP
        
        logger.info("Testing GeoCLIP with simple approach...")
        
        # Initialize model
        model = GeoCLIP()
        logger.info("GeoCLIP model initialized")
        
        # Create a test image file
        test_image = Image.new('RGB', (224, 224), color='red')
        test_image_path = 'test_simple.jpg'
        test_image.save(test_image_path)
        logger.info(f"Created test image: {test_image_path}")
        
        # Test 1: Direct predict call
        try:
            logger.info("Test 1: Direct predict call")
            result = model.predict(test_image_path, top_k=1)
            logger.info(f"Result: {result}, type: {type(result)}")
            if hasattr(result, '__len__'):
                logger.info(f"Result length: {len(result)}")
                for i, item in enumerate(result):
                    logger.info(f"  Item {i}: {item}, type: {type(item)}")
        except Exception as e:
            logger.error(f"Test 1 failed: {e}")
        
        # Test 2: Predict with PIL Image
        try:
            logger.info("Test 2: Predict with PIL Image")
            result = model.predict(test_image, top_k=1)
            logger.info(f"Result: {result}, type: {type(result)}")
            if hasattr(result, '__len__'):
                logger.info(f"Result length: {len(result)}")
                for i, item in enumerate(result):
                    logger.info(f"  Item {i}: {item}, type: {type(item)}")
        except Exception as e:
            logger.error(f"Test 2 failed: {e}")
        
        # Test 3: Check model attributes more carefully
        logger.info("Model attributes:")
        for attr in dir(model):
            if not attr.startswith('_'):
                try:
                    obj = getattr(model, attr)
                    if callable(obj):
                        logger.info(f"  {attr}(): {obj}")
                    else:
                        logger.info(f"  {attr}: {obj}")
                except:
                    logger.info(f"  {attr}: <unable to inspect>")
        
        # Clean up
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
            
    except Exception as e:
        logger.error(f"GeoCLIP simple test failed: {e}")

if __name__ == "__main__":
    test_geoclip_simple()
