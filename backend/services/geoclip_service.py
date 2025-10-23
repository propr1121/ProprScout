"""
GeoCLIP Service for Property Geolocation
Handles model loading, inference, and caching
"""

import os
import sys
import logging
import hashlib
import pickle
from typing import Optional, Tuple, Dict, Any
import numpy as np
from PIL import Image
import torch
import torchvision.transforms as transforms
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger(__name__)

class GeoCLIPService:
    """GeoCLIP service for property image geolocation"""
    
    def __init__(self, model_path: str = None, device: str = None, cache_dir: str = "cache"):
        """
        Initialize GeoCLIP service
        
        Args:
            model_path: Path to GeoCLIP model (optional)
            device: Device to run on ('cpu', 'cuda', 'auto')
            cache_dir: Directory for caching results
        """
        self.model = None
        self.device = self._detect_device(device)
        self.cache_dir = cache_dir
        self.model_path = model_path
        self.transform = None
        self.cache = {}
        self.cache_ttl = timedelta(hours=24)  # Cache for 24 hours
        
        # Create cache directory
        os.makedirs(cache_dir, exist_ok=True)
        
        # Initialize model
        self._load_model()
    
    def _detect_device(self, device: str = None) -> str:
        """Detect best available device"""
        if device == 'auto' or device is None:
            if torch.cuda.is_available():
                return 'cuda'
            elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                return 'mps'  # Apple Silicon
            else:
                return 'cpu'
        return device
    
    def _load_model(self):
        """Load GeoCLIP model"""
        try:
            logger.info(f"Loading GeoCLIP model on {self.device}...")
            
            # Import GeoCLIP
            try:
                from geoclip import GeoCLIP
            except ImportError:
                logger.error("GeoCLIP not installed. Install with: pip install git+https://github.com/VicenteVivan/geo-clip.git")
                raise ImportError("GeoCLIP not available")
            
            # Initialize model
            self.model = GeoCLIP()
            
            # Move to device
            self.model = self.model.to(self.device)
            self.model.eval()
            
            # Set up image transforms
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                   std=[0.229, 0.224, 0.225])
            ])
            
            logger.info("GeoCLIP model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load GeoCLIP model: {e}")
            self.model = None
            raise
    
    def _get_image_hash(self, image_path: str) -> str:
        """Generate hash for image caching"""
        with open(image_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    
    def _load_from_cache(self, image_hash: str) -> Optional[Dict[str, Any]]:
        """Load result from cache"""
        cache_file = os.path.join(self.cache_dir, f"{image_hash}.pkl")
        
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'rb') as f:
                    cached_data = pickle.load(f)
                
                # Check if cache is still valid
                if datetime.now() - cached_data['timestamp'] < self.cache_ttl:
                    logger.info(f"Using cached result for {image_hash}")
                    return cached_data['result']
                else:
                    # Remove expired cache
                    os.remove(cache_file)
            except Exception as e:
                logger.warning(f"Failed to load cache: {e}")
        
        return None
    
    def _save_to_cache(self, image_hash: str, result: Dict[str, Any]):
        """Save result to cache"""
        cache_file = os.path.join(self.cache_dir, f"{image_hash}.pkl")
        
        try:
            cache_data = {
                'result': result,
                'timestamp': datetime.now()
            }
            
            with open(cache_file, 'wb') as f:
                pickle.dump(cache_data, f)
            
            logger.info(f"Cached result for {image_hash}")
        except Exception as e:
            logger.warning(f"Failed to save cache: {e}")
    
    def _preprocess_image(self, image_path: str) -> torch.Tensor:
        """Preprocess image for GeoCLIP"""
        try:
            # Load and convert image
            image = Image.open(image_path).convert('RGB')
            
            # Apply transforms
            image_tensor = self.transform(image)
            
            # Add batch dimension
            image_tensor = image_tensor.unsqueeze(0)
            
            return image_tensor.to(self.device)
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            raise
    
    def predict_location(self, image_path: str) -> Dict[str, Any]:
        """
        Predict location from property image
        
        Args:
            image_path: Path to property image
            
        Returns:
            Dictionary with coordinates, confidence, and metadata
        """
        try:
            # Check if model is loaded
            if self.model is None:
                raise RuntimeError("GeoCLIP model not loaded")
            
            # Generate cache key
            image_hash = self._get_image_hash(image_path)
            
            # Check cache first
            cached_result = self._load_from_cache(image_hash)
            if cached_result:
                return cached_result
            
            logger.info(f"Analyzing image: {image_path}")
            
            # Preprocess image
            image_tensor = self._preprocess_image(image_path)
            
            # Run inference using GeoCLIP's predict method
            try:
                # GeoCLIP predict method returns (coordinates_tensor, confidence_tensor)
                logger.info("Using GeoCLIP predict method...")
                predictions = self.model.predict(image_path, top_k=1)
                logger.info(f"GeoCLIP predictions: {predictions}")
                logger.info(f"Predictions type: {type(predictions)}")
                
                # Extract coordinates and confidence from tuple
                if isinstance(predictions, tuple) and len(predictions) == 2:
                    coordinates_tensor, confidence_tensor = predictions
                    logger.info(f"Coordinates tensor: {coordinates_tensor}")
                    logger.info(f"Confidence tensor: {confidence_tensor}")
                    
                    # Extract first prediction
                    if len(coordinates_tensor) > 0 and len(confidence_tensor) > 0:
                        # Get first coordinates and confidence
                        coords = coordinates_tensor[0]  # First row: [lat, lon]
                        confidence = float(confidence_tensor[0])
                        
                        # Extract lat, lon from tensor
                        if len(coords) >= 2:
                            lat, lon = float(coords[0]), float(coords[1])
                            logger.info(f"Extracted coordinates: lat={lat}, lon={lon}, confidence={confidence}")
                        else:
                            raise ValueError("Invalid coordinates tensor format")
                    else:
                        raise ValueError("Empty prediction results")
                else:
                    raise ValueError(f"Invalid prediction format: expected tuple with 2 elements, got {type(predictions)}")
                    
            except Exception as e:
                logger.error(f"GeoCLIP prediction failed: {e}")
                raise RuntimeError(f"AI model prediction failed: {str(e)}")
            
            # Validate confidence threshold
            MIN_CONFIDENCE_THRESHOLD = 0.3
            if confidence < MIN_CONFIDENCE_THRESHOLD:
                logger.warning(f"Low confidence prediction: {confidence} < {MIN_CONFIDENCE_THRESHOLD}")
                raise ValueError(f"Prediction confidence too low: {confidence:.3f} (minimum: {MIN_CONFIDENCE_THRESHOLD})")
            
            # Validate coordinates are reasonable (Portugal bounds)
            PORTUGAL_BOUNDS = {
                'lat_min': 36.8, 'lat_max': 42.2,
                'lon_min': -9.5, 'lon_max': -6.2
            }
            
            if not (PORTUGAL_BOUNDS['lat_min'] <= lat <= PORTUGAL_BOUNDS['lat_max'] and 
                    PORTUGAL_BOUNDS['lon_min'] <= lon <= PORTUGAL_BOUNDS['lon_max']):
                logger.warning(f"Coordinates outside Portugal bounds: lat={lat}, lon={lon}")
                raise ValueError(f"Predicted location is outside Portugal: lat={lat:.3f}, lon={lon:.3f}")
            
            logger.info(f"Valid prediction: lat={lat}, lon={lon}, confidence={confidence}")
            
            # Create result
            result = {
                'coordinates': {
                    'lat': lat,
                    'lon': lon
                },
                'confidence': float(confidence),
                'model': 'geoclip',
                'device': self.device,
                'timestamp': datetime.now().isoformat(),
                'image_hash': image_hash
            }
            
            # Save to cache
            self._save_to_cache(image_hash, result)
            
            logger.info(f"Location predicted: {lat:.6f}, {lon:.6f} (confidence: {confidence:.3f})")
            
            return result
            
        except Exception as e:
            logger.error(f"Location prediction failed: {e}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            'model_name': 'GeoCLIP',
            'device': self.device,
            'loaded': self.model is not None,
            'cache_dir': self.cache_dir,
            'cache_ttl_hours': self.cache_ttl.total_seconds() / 3600
        }
    
    def clear_cache(self):
        """Clear all cached results"""
        try:
            for filename in os.listdir(self.cache_dir):
                if filename.endswith('.pkl'):
                    os.remove(os.path.join(self.cache_dir, filename))
            logger.info("Cache cleared")
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")

# Global service instance
geoclip_service = None

def get_geoclip_service() -> GeoCLIPService:
    """Get or create GeoCLIP service instance"""
    global geoclip_service
    
    if geoclip_service is None:
        try:
            geoclip_service = GeoCLIPService(
                model_path=os.getenv('GEOCLIP_MODEL_PATH'),
                device=os.getenv('GEOCLIP_DEVICE', 'auto'),
                cache_dir=os.getenv('GEOCLIP_CACHE_DIR', 'cache')
            )
        except Exception as e:
            logger.error(f"Failed to initialize GeoCLIP service: {e}")
            geoclip_service = None
    
    return geoclip_service

