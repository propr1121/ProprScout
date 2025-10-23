#!/usr/bin/env python3
"""
Test GeoCLIP predict method
"""

import sys
import logging
from PIL import Image
import torch
import torchvision.transforms as transforms

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_geoclip_predict():
    """Test GeoCLIP predict method"""
    try:
        from geoclip import GeoCLIP
        
        logger.info("Testing GeoCLIP predict method...")
        
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
        
        # Test predict method
        try:
            logger.info("Testing predict method...")
            result = model.predict(image_tensor)
            logger.info(f"Predict result: {result}, type: {type(result)}")
            if hasattr(result, 'shape'):
                logger.info(f"Predict shape: {result.shape}")
        except Exception as e:
            logger.error(f"Predict method failed: {e}")
        
        # Test predict with location
        try:
            logger.info("Testing predict with location...")
            location = torch.tensor([[0.0, 0.0]])
            result = model.predict(image_tensor, location)
            logger.info(f"Predict with location result: {result}, type: {type(result)}")
            if hasattr(result, 'shape'):
                logger.info(f"Predict with location shape: {result.shape}")
        except Exception as e:
            logger.error(f"Predict with location failed: {e}")
            
    except Exception as e:
        logger.error(f"GeoCLIP predict test failed: {e}")

if __name__ == "__main__":
    test_geoclip_predict()
