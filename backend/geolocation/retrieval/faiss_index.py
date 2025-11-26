"""
FAISS-based retrieval for Portuguese geotagged images
"""

import numpy as np
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Try to import faiss, but allow graceful fallback
try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    logger.warning("FAISS not available - retrieval will be disabled")


class PortugalImageIndex:
    """
    FAISS index for Portuguese geotagged image retrieval.
    Stores embeddings + metadata (lat, lon, source, etc.)
    """

    def __init__(self, index_path: str = None, metadata_path: str = None):
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.index = None
        self.metadata = []
        self.dimension = 768  # CLIP ViT-L-14 dimension

        if index_path and Path(index_path).exists():
            self.load()

    def create_index(self, embeddings: np.ndarray, metadata: list):
        """
        Create new FAISS index from embeddings.

        Args:
            embeddings: numpy array of shape (n, dimension)
            metadata: list of dicts with lat, lon, image_path, source
        """
        if not FAISS_AVAILABLE:
            logger.error("FAISS not available - cannot create index")
            return

        n, d = embeddings.shape
        self.dimension = d

        # Use IVF index for faster search on larger datasets
        if n > 10000:
            nlist = min(int(np.sqrt(n)), 256)
            quantizer = faiss.IndexFlatIP(d)  # Inner product (cosine with normalized vectors)
            self.index = faiss.IndexIVFFlat(quantizer, d, nlist, faiss.METRIC_INNER_PRODUCT)

            # Train the index
            self.index.train(embeddings.astype('float32'))
            self.index.add(embeddings.astype('float32'))
        else:
            # Simple flat index for smaller datasets
            self.index = faiss.IndexFlatIP(d)
            self.index.add(embeddings.astype('float32'))

        self.metadata = metadata
        logger.info(f"Created FAISS index with {n} vectors of dimension {d}")

    def search(self, query_embedding: np.ndarray, top_k: int = 20) -> list:
        """
        Search for similar images.

        Args:
            query_embedding: Query image embedding (1, dimension)
            top_k: Number of results to return

        Returns:
            List of dicts with lat, lon, similarity, metadata
        """
        if not FAISS_AVAILABLE or self.index is None:
            logger.warning("No index available for search")
            return []

        # Ensure correct shape
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)

        # Search
        similarities, indices = self.index.search(
            query_embedding.astype('float32'),
            min(top_k, self.index.ntotal)
        )

        results = []
        for i, (sim, idx) in enumerate(zip(similarities[0], indices[0])):
            if idx >= 0 and idx < len(self.metadata):
                result = {
                    'rank': i + 1,
                    'similarity': float(sim),
                    **self.metadata[idx]
                }
                results.append(result)

        return results

    def save(self, index_path: str = None, metadata_path: str = None):
        """Save index and metadata to disk"""
        if not FAISS_AVAILABLE:
            return

        index_path = index_path or self.index_path
        metadata_path = metadata_path or self.metadata_path

        if self.index and index_path:
            faiss.write_index(self.index, str(index_path))
            logger.info(f"Saved FAISS index to {index_path}")

        if self.metadata and metadata_path:
            with open(metadata_path, 'w') as f:
                json.dump(self.metadata, f)
            logger.info(f"Saved metadata to {metadata_path}")

    def load(self, index_path: str = None, metadata_path: str = None):
        """Load index and metadata from disk"""
        if not FAISS_AVAILABLE:
            return

        index_path = index_path or self.index_path
        metadata_path = metadata_path or self.metadata_path

        if index_path and Path(index_path).exists():
            self.index = faiss.read_index(str(index_path))
            logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors")

        if metadata_path and Path(metadata_path).exists():
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            logger.info(f"Loaded {len(self.metadata)} metadata entries")

    @property
    def is_available(self) -> bool:
        """Check if index is ready for search"""
        return FAISS_AVAILABLE and self.index is not None and self.index.ntotal > 0
