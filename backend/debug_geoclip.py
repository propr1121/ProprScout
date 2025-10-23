#!/usr/bin/env python3
"""
Debug GeoCLIP Integration
Test GeoCLIP directly to understand the API
"""

import sys
import logging
from PIL import Image
import torch
import torchvision.transforms as transforms
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_geoclip_directly():
    """Test GeoCLIP directly to understand the API"""
    try:
        from geoclip import GeoCLIP
        
        logger.info("Testing GeoCLIP directly...")
        
        # Initialize model
        model = GeoCLIP()
        logger.info("GeoCLIP model initialized")
        
        # Create a test image
        test_image = Image.new('RGB', (224, 224), color='red')
        
        # Preprocess image
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        image_tensor = transform(test_image).unsqueeze(0)
        logger.info(f"Image tensor shape: {image_tensor.shape}")
        
        # Test different API approaches
        logger.info("Testing different GeoCLIP API approaches...")
        
        # Method 1: Direct call
        try:
            logger.info("Method 1: Direct model call")
            result1 = model(image_tensor)
            logger.info(f"Method 1 result: {result1}, type: {type(result1)}")
            if hasattr(result1, 'shape'):
                logger.info(f"Method 1 shape: {result1.shape}")
        except Exception as e:
            logger.error(f"Method 1 failed: {e}")
        
        # Method 2: With location
        try:
            logger.info("Method 2: With location parameter")
            location = torch.tensor([[0.0, 0.0]])
            result2 = model(image_tensor, location)
            logger.info(f"Method 2 result: {result2}, type: {type(result2)}")
            if hasattr(result2, 'shape'):
                logger.info(f"Method 2 shape: {result2.shape}")
        except Exception as e:
            logger.error(f"Method 2 failed: {e}")
        
        # Method 3: Check model attributes
        logger.info("Checking model attributes...")
        logger.info(f"Model type: {type(model)}")
        logger.info(f"Model dir: {[attr for attr in dir(model) if not attr.startswith('_')]}")
        
        # Method 4: Try forward method
        try:
            logger.info("Method 4: Direct forward call")
            result4 = model.forward(image_tensor)
            logger.info(f"Method 4 result: {result4}, type: {type(result4)}")
            if hasattr(result4, 'shape'):
                logger.info(f"Method 4 shape: {result4.shape}")
        except Exception as e:
            logger.error(f"Method 4 failed: {e}")
        
        # Method 5: Try with location in forward
        try:
            logger.info("Method 5: Forward with location")
            location = torch.tensor([[0.0, 0.0]])
            result5 = model.forward(image_tensor, location)
            logger.info(f"Method 5 result: {result5}, type: {type(result5)}")
            if hasattr(result5, 'shape'):
                logger.info(f"Method 5 shape: {result5.shape}")
        except Exception as e:
            logger.error(f"Method 5 failed: {e}")
            
    except Exception as e:
        logger.error(f"GeoCLIP test failed: {e}")

if __name__ == "__main__":
    test_geoclip_directly()
