"""
Complete hybrid geolocation pipeline
Combines coarse prediction, retrieval, and GIS snapping
"""

import numpy as np
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import sklearn for clustering
try:
    from sklearn.cluster import DBSCAN
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logger.warning("scikit-learn not available - clustering will be disabled")


class HybridGeoLocator:
    """
    Main prediction pipeline combining:
    1. Coarse GeoCLIP prediction
    2. Portugal-specific embedding retrieval
    3. Coordinate clustering
    4. Building footprint snapping
    """

    def __init__(
        self,
        coarse_locator=None,
        portugal_embedder=None,
        image_index=None,
        building_snapper=None
    ):
        self.coarse_locator = coarse_locator
        self.portugal_embedder = portugal_embedder
        self.image_index = image_index
        self.building_snapper = building_snapper

        # Configuration
        self.retrieval_top_k = 20
        self.cluster_eps_km = 0.5  # 500m radius for clustering
        self.min_cluster_samples = 2

    def predict(self, image_path: str) -> dict:
        """
        Run complete hybrid geolocation pipeline.

        Args:
            image_path: Path to input image

        Returns:
            Complete prediction result with candidates and confidence
        """
        result = {
            'image_path': image_path,
            'predictions': [],
            'best_prediction': None,
            'coarse_prediction': None,
            'retrieval_candidates': [],
            'building_match': None,
            'confidence': 0.0,
            'method': 'hybrid'
        }

        try:
            # Step 1: Coarse prediction
            if self.coarse_locator:
                coarse = self.coarse_locator.predict(image_path)
                result['coarse_prediction'] = coarse
                logger.info(f"Coarse prediction: {coarse['lat']:.4f}, {coarse['lon']:.4f} "
                           f"(confidence: {coarse.get('confidence', 0):.2f})")

            # Step 2: Get embedding and retrieve similar images
            if self.portugal_embedder and self.image_index and self.image_index.is_available:
                embedding = self.portugal_embedder.get_embedding(image_path)
                candidates = self.image_index.search(embedding, top_k=self.retrieval_top_k)
                result['retrieval_candidates'] = candidates

                if candidates:
                    logger.info(f"Retrieved {len(candidates)} similar images")

                    # Step 3: Cluster candidate coordinates
                    clustered = self._cluster_candidates(candidates)
                    result['predictions'] = clustered

            # Step 4: Determine best prediction
            best = self._select_best_prediction(result)

            # Step 5: Snap to building footprint
            if best and self.building_snapper and self.building_snapper.is_available:
                building = self.building_snapper.snap_to_building(
                    best['lat'], best['lon']
                )
                if building:
                    result['building_match'] = building
                    # Update best prediction with building centroid
                    best['lat'] = building['lat']
                    best['lon'] = building['lon']
                    best['snapped_to_building'] = True

            result['best_prediction'] = best
            result['confidence'] = self._calculate_confidence(result)

        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            result['error'] = str(e)

        return result

    def _cluster_candidates(self, candidates: list) -> list:
        """
        Cluster retrieval candidates to find location modes.

        Args:
            candidates: List of retrieval results with lat/lon

        Returns:
            List of cluster centers with aggregated confidence
        """
        if not SKLEARN_AVAILABLE or len(candidates) < 2:
            return candidates

        # Extract coordinates
        coords = np.array([[c['lat'], c['lon']] for c in candidates])

        # DBSCAN clustering (eps in degrees, ~0.5km at Portugal latitude)
        eps_deg = self.cluster_eps_km / 111  # Rough km to degrees
        clustering = DBSCAN(eps=eps_deg, min_samples=self.min_cluster_samples).fit(coords)

        # Aggregate clusters
        clusters = []
        for label in set(clustering.labels_):
            if label == -1:  # Noise points
                continue

            mask = clustering.labels_ == label
            cluster_coords = coords[mask]
            cluster_candidates = [c for c, m in zip(candidates, mask) if m]

            # Calculate cluster center (weighted by similarity)
            weights = np.array([c['similarity'] for c in cluster_candidates])
            if weights.sum() > 0:
                weights = weights / weights.sum()
            else:
                weights = np.ones(len(weights)) / len(weights)

            center_lat = np.average(cluster_coords[:, 0], weights=weights)
            center_lon = np.average(cluster_coords[:, 1], weights=weights)

            clusters.append({
                'lat': float(center_lat),
                'lon': float(center_lon),
                'cluster_size': int(mask.sum()),
                'avg_similarity': float(np.mean([c['similarity'] for c in cluster_candidates])),
                'sources': cluster_candidates[:5]  # Top 5 sources
            })

        # Sort by cluster size and similarity
        clusters.sort(key=lambda x: (x['cluster_size'], x['avg_similarity']), reverse=True)

        return clusters

    def _select_best_prediction(self, result: dict) -> Optional[dict]:
        """Select the best prediction from all sources"""

        # Priority 1: Strong retrieval cluster
        if result['predictions']:
            top_cluster = result['predictions'][0]
            if top_cluster['cluster_size'] >= 3 and top_cluster['avg_similarity'] > 0.7:
                return {
                    'lat': top_cluster['lat'],
                    'lon': top_cluster['lon'],
                    'source': 'retrieval_cluster',
                    'cluster_size': top_cluster['cluster_size'],
                    'similarity': top_cluster['avg_similarity']
                }

        # Priority 2: High-confidence coarse prediction
        if result['coarse_prediction']:
            coarse = result['coarse_prediction']
            if coarse.get('confidence', 0) > 0.6:
                return {
                    'lat': coarse['lat'],
                    'lon': coarse['lon'],
                    'source': 'coarse_geoclip',
                    'confidence': coarse['confidence']
                }

        # Priority 3: Any retrieval result
        if result['retrieval_candidates']:
            top = result['retrieval_candidates'][0]
            return {
                'lat': top['lat'],
                'lon': top['lon'],
                'source': 'single_retrieval',
                'similarity': top['similarity']
            }

        # Priority 4: Low-confidence coarse (fallback)
        if result['coarse_prediction']:
            coarse = result['coarse_prediction']
            return {
                'lat': coarse['lat'],
                'lon': coarse['lon'],
                'source': 'coarse_fallback',
                'confidence': coarse.get('confidence', 0.3)
            }

        return None

    def _calculate_confidence(self, result: dict) -> float:
        """Calculate overall prediction confidence"""
        confidence = 0.0

        if result['best_prediction']:
            pred = result['best_prediction']

            # Base confidence from source
            if pred['source'] == 'retrieval_cluster':
                confidence = min(0.9, 0.5 + pred.get('similarity', 0) * 0.4)
            elif pred['source'] == 'coarse_geoclip':
                confidence = pred.get('confidence', 0.5) * 0.8
            elif pred['source'] == 'single_retrieval':
                confidence = pred.get('similarity', 0.5) * 0.6
            else:
                confidence = 0.3

            # Boost if snapped to building
            if result.get('building_match'):
                confidence = min(0.95, confidence + 0.1)

        return round(confidence, 3)
