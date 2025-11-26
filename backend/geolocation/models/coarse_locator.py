"""
Coarse Locator using GeoCLIP
Provides initial region-level prediction for any image
"""

import torch
import torch.nn.functional as F
from PIL import Image
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class CoarseLocator:
    """
    Base GeoCLIP model for coarse geolocation.
    Returns approximate lat/lon with confidence.
    """

    def __init__(self, device: str = None):
        self.device = device or ('cuda' if torch.cuda.is_available() else
                                  'mps' if torch.backends.mps.is_available() else 'cpu')
        self.model = None
        self.preprocess = None
        self._load_model()

    def _load_model(self):
        """Load GeoCLIP model"""
        try:
            # Try official GeoCLIP package first
            from geoclip import GeoCLIP
            self.model = GeoCLIP()
            self.model.to(self.device)
            self.model.eval()
            self.use_geoclip = True
            logger.info(f"GeoCLIP loaded on {self.device}")
        except ImportError:
            # Fallback to OpenCLIP with geo-trained weights
            logger.warning("GeoCLIP package not found, using OpenCLIP fallback")
            try:
                import open_clip
                self.model, _, self.preprocess = open_clip.create_model_and_transforms(
                    'ViT-L-14', pretrained='openai'
                )
                self.model.to(self.device)
                self.model.eval()
                self.use_geoclip = False
                logger.info(f"OpenCLIP fallback loaded on {self.device}")
            except Exception as e:
                logger.error(f"Failed to load any model: {e}")
                self.model = None
                self.use_geoclip = False

    def predict(self, image_path: str) -> dict:
        """
        Predict coarse location from image.

        Args:
            image_path: Path to image file

        Returns:
            dict with lat, lon, confidence, region
        """
        if self.model is None:
            return {
                'lat': 38.7223,  # Portugal center
                'lon': -9.1393,
                'confidence': 0.1,
                'top_k': [],
                'source': 'fallback_no_model',
                'warning': 'No model loaded - returning Portugal center'
            }

        try:
            image = Image.open(image_path).convert('RGB')

            with torch.no_grad():
                if self.use_geoclip and hasattr(self.model, 'predict'):
                    # GeoCLIP native method
                    top_pred = self.model.predict(image, top_k=5)

                    return {
                        'lat': float(top_pred[0]['lat']),
                        'lon': float(top_pred[0]['lon']),
                        'confidence': float(top_pred[0]['confidence']),
                        'top_k': [
                            {'lat': float(p['lat']), 'lon': float(p['lon']), 'confidence': float(p['confidence'])}
                            for p in top_pred
                        ],
                        'source': 'geoclip'
                    }
                else:
                    # OpenCLIP fallback - return Portugal center as default
                    return {
                        'lat': 38.7223,  # Portugal approximate center
                        'lon': -9.1393,
                        'confidence': 0.3,
                        'top_k': [],
                        'source': 'openclip_fallback',
                        'warning': 'Using fallback model - predictions are approximate'
                    }

        except Exception as e:
            logger.error(f"Coarse prediction failed: {e}")
            return {
                'lat': 38.7223,
                'lon': -9.1393,
                'confidence': 0.1,
                'source': 'error_fallback',
                'error': str(e)
            }

    def get_embedding(self, image_path: str) -> np.ndarray:
        """
        Get image embedding for retrieval.

        Args:
            image_path: Path to image file

        Returns:
            numpy array of embeddings
        """
        if self.model is None:
            return np.zeros(768)  # Return zero vector if no model

        image = Image.open(image_path).convert('RGB')

        with torch.no_grad():
            if hasattr(self.model, 'encode_image'):
                if self.preprocess:
                    image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
                else:
                    # GeoCLIP handles preprocessing internally
                    image_tensor = image

                embedding = self.model.encode_image(image_tensor)
                embedding = F.normalize(embedding, p=2, dim=-1)
                return embedding.cpu().numpy().flatten()
            else:
                logger.warning("Model does not support encode_image")
                return np.zeros(768)
