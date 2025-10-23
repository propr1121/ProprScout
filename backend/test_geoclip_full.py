#!/usr/bin/env python3
"""
Test GeoCLIP full functionality
"""

import sys
import logging
from PIL import Image
import torch
import torchvision.transforms as transforms

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_geoclip_full():
    """Test GeoCLIP full functionality"""
    try:
        from geoclip import GeoCLIP
        
        logger.info("Testing GeoCLIP full functionality...")
        
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
        
        # Test predict method with top_k
        try:
            logger.info("Testing predict method with top_k=5...")
            result = model.predict(image_tensor, top_k=5)
            logger.info(f"Predict result: {result}, type: {type(result)}")
            if hasattr(result, 'shape'):
                logger.info(f"Predict shape: {result.shape}")
        except Exception as e:
            logger.error(f"Predict method failed: {e}")
        
        # Test predict method with top_k=1
        try:
            logger.info("Testing predict method with top_k=1...")
            result = model.predict(image_tensor, top_k=1)
            logger.info(f"Predict result: {result}, type: {type(result)}")
            if hasattr(result, 'shape'):
                logger.info(f"Predict shape: {result.shape}")
        except Exception as e:
            logger.error(f"Predict method with top_k=1 failed: {e}")
        
        # Check if there are other methods
        logger.info("Available methods:")
        methods = [attr for attr in dir(model) if not attr.startswith('_') and callable(getattr(model, attr))]
        for method in methods:
            logger.info(f"  - {method}")
            
    except Exception as e:
        logger.error(f"GeoCLIP full test failed: {e}")

if __name__ == "__main__":
    test_geoclip_full()
