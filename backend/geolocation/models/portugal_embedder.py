"""
Portugal-specific image embedder
Fine-tuned on Portuguese architecture and streetscapes
"""

import torch
import torch.nn as nn
from PIL import Image
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class PortugalEmbedder:
    """
    Fine-tuned embedding model for Portuguese properties.
    Uses transfer learning from GeoCLIP/CLIP.
    """

    def __init__(self, model_path: str = None, device: str = None):
        self.device = device or ('cuda' if torch.cuda.is_available() else
                                  'mps' if torch.backends.mps.is_available() else 'cpu')
        self.model_path = model_path
        self.model = None
        self.preprocess = None
        self.is_fine_tuned = False
        self._load_model()

    def _load_model(self):
        """Load fine-tuned Portugal model or base model"""
        try:
            import open_clip

            # Load base CLIP model
            self.model, _, self.preprocess = open_clip.create_model_and_transforms(
                'ViT-L-14', pretrained='openai'
            )

            # Load fine-tuned weights if available
            if self.model_path and Path(self.model_path).exists():
                logger.info(f"Loading fine-tuned weights from {self.model_path}")
                state_dict = torch.load(self.model_path, map_location=self.device)
                self.model.load_state_dict(state_dict, strict=False)
                self.is_fine_tuned = True
            else:
                logger.info("Using base CLIP model (no fine-tuned weights found)")
                self.is_fine_tuned = False

            self.model.to(self.device)
            self.model.eval()
            logger.info(f"PortugalEmbedder loaded on {self.device}")

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.model = None

    def get_embedding(self, image_path: str) -> np.ndarray:
        """
        Get Portugal-optimized embedding for image.

        Args:
            image_path: Path to image file

        Returns:
            numpy array of embeddings (768 or 1024 dim)
        """
        if self.model is None:
            logger.warning("No model loaded, returning zero embedding")
            return np.zeros(768)

        try:
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.preprocess(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                embedding = self.model.encode_image(image_tensor)
                # Normalize for cosine similarity
                embedding = embedding / embedding.norm(dim=-1, keepdim=True)
                return embedding.cpu().numpy().flatten()

        except Exception as e:
            logger.error(f"Embedding failed: {e}")
            return np.zeros(768)

    def batch_embed(self, image_paths: list) -> np.ndarray:
        """
        Embed multiple images efficiently.

        Args:
            image_paths: List of image paths

        Returns:
            numpy array of shape (n_images, embedding_dim)
        """
        if self.model is None:
            return np.zeros((len(image_paths), 768))

        embeddings = []
        batch_size = 32

        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i+batch_size]
            batch_tensors = []

            for path in batch_paths:
                try:
                    img = Image.open(path).convert('RGB')
                    batch_tensors.append(self.preprocess(img))
                except Exception as e:
                    logger.warning(f"Failed to load {path}: {e}")
                    continue

            if batch_tensors:
                batch = torch.stack(batch_tensors).to(self.device)
                with torch.no_grad():
                    batch_emb = self.model.encode_image(batch)
                    batch_emb = batch_emb / batch_emb.norm(dim=-1, keepdim=True)
                    embeddings.append(batch_emb.cpu().numpy())

        return np.vstack(embeddings) if embeddings else np.zeros((0, 768))
