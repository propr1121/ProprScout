#!/usr/bin/env python3
"""
ProprScout Geolocation API Server
Flask application serving the hybrid geolocation pipeline
"""

import os
import sys
import logging
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import traceback

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# Initialize components (lazy loading)
_pipeline = None
_initialization_error = None


def get_pipeline():
    """Lazy load the geolocation pipeline"""
    global _pipeline, _initialization_error

    if _initialization_error:
        raise _initialization_error

    if _pipeline is None:
        logger.info("Initializing geolocation pipeline...")

        try:
            from models.coarse_locator import CoarseLocator
            from models.portugal_embedder import PortugalEmbedder
            from retrieval.faiss_index import PortugalImageIndex
            from gis.building_snapper import BuildingSnapper
            from pipeline.hybrid_predictor import HybridGeoLocator

            # Initialize components
            coarse = CoarseLocator()
            embedder = PortugalEmbedder()

            # Load index if exists
            data_dir = Path(__file__).parent / 'data'
            index_path = data_dir / 'indexes' / 'portugal.faiss'
            meta_path = data_dir / 'indexes' / 'portugal_meta.json'

            if index_path.exists() and meta_path.exists():
                image_index = PortugalImageIndex(str(index_path), str(meta_path))
                logger.info("FAISS index loaded")
            else:
                logger.warning("No FAISS index found - retrieval disabled")
                image_index = PortugalImageIndex()  # Empty index

            snapper = BuildingSnapper(cache_dir=str(data_dir / 'gis_cache'))

            _pipeline = HybridGeoLocator(
                coarse_locator=coarse,
                portugal_embedder=embedder,
                image_index=image_index,
                building_snapper=snapper
            )

            logger.info("Geolocation pipeline initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize pipeline: {e}")
            logger.error(traceback.format_exc())
            _initialization_error = e
            raise

    return _pipeline


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = {
        'status': 'healthy',
        'service': 'proprscout-geolocation',
        'version': '1.0.0'
    }

    # Check pipeline status
    try:
        pipeline = get_pipeline()
        status['pipeline'] = 'ready'
        status['components'] = {
            'coarse_locator': pipeline.coarse_locator is not None,
            'portugal_embedder': pipeline.portugal_embedder is not None,
            'image_index': pipeline.image_index.is_available if pipeline.image_index else False,
            'building_snapper': pipeline.building_snapper.is_available if pipeline.building_snapper else False
        }
    except Exception as e:
        status['pipeline'] = 'error'
        status['error'] = str(e)

    return jsonify(status)


@app.route('/api/geolocation/analyze', methods=['POST'])
@app.route('/api/geoclip/predict', methods=['POST'])
def analyze_image():
    """
    Main geolocation endpoint.
    Accepts image file or image URL.
    """
    image_path = None

    try:
        pipeline = get_pipeline()

        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400

            if not allowed_file(file.filename):
                return jsonify({'error': 'Invalid file type'}), 400

            # Save to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                file.save(tmp.name)
                image_path = tmp.name

        # Handle URL
        elif request.json and 'image_url' in request.json:
            import requests as req
            from PIL import Image
            from io import BytesIO

            image_url = request.json['image_url']
            response = req.get(image_url, timeout=30)
            response.raise_for_status()

            img = Image.open(BytesIO(response.content))

            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                img.save(tmp.name)
                image_path = tmp.name

        # Handle base64
        elif request.json and 'image_base64' in request.json:
            import base64
            from PIL import Image
            from io import BytesIO

            image_data = base64.b64decode(request.json['image_base64'])
            img = Image.open(BytesIO(image_data))

            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                img.save(tmp.name)
                image_path = tmp.name

        else:
            return jsonify({'error': 'No image provided'}), 400

        # Run prediction
        logger.info(f"Processing image: {image_path}")
        result = pipeline.predict(image_path)

        # Format response
        response = {
            'success': True,
            'coordinates': None,
            'confidence': result['confidence'],
            'method': result['method'],
            'building': result.get('building_match'),
            'candidates': []
        }

        if result['best_prediction']:
            response['coordinates'] = {
                'lat': result['best_prediction']['lat'],
                'lon': result['best_prediction']['lon']
            }
            response['prediction_source'] = result['best_prediction'].get('source')

        # Add top candidates
        if result['predictions']:
            response['candidates'] = [
                {
                    'lat': p['lat'],
                    'lon': p['lon'],
                    'cluster_size': p.get('cluster_size', 1),
                    'similarity': p.get('avg_similarity', 0)
                }
                for p in result['predictions'][:5]
            ]

        return jsonify(response)

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

    finally:
        # Clean up temp file
        if image_path:
            try:
                os.unlink(image_path)
            except Exception:
                pass


@app.route('/api/geolocation/feedback', methods=['POST'])
def submit_feedback():
    """
    Accept human correction for failed predictions.
    Used for model improvement.
    """
    try:
        data = request.json

        required = ['image_id', 'correct_lat', 'correct_lon']
        if not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400

        # Save feedback for training
        feedback_dir = Path(__file__).parent / 'data' / 'feedback'
        feedback_dir.mkdir(parents=True, exist_ok=True)

        import json
        from datetime import datetime

        feedback_file = feedback_dir / 'corrections.jsonl'
        with open(feedback_file, 'a') as f:
            feedback = {
                'timestamp': datetime.utcnow().isoformat(),
                'image_id': data['image_id'],
                'predicted_lat': data.get('predicted_lat'),
                'predicted_lon': data.get('predicted_lon'),
                'correct_lat': data['correct_lat'],
                'correct_lon': data['correct_lon'],
                'notes': data.get('notes', '')
            }
            f.write(json.dumps(feedback) + '\n')

        return jsonify({'success': True, 'message': 'Feedback recorded'})

    except Exception as e:
        logger.error(f"Feedback failed: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    debug = os.environ.get('FLASK_ENV') == 'development'

    logger.info(f"Starting ProprScout Geolocation API on port {port}")

    # Pre-initialize pipeline on startup
    try:
        get_pipeline()
    except Exception as e:
        logger.error(f"Pipeline initialization failed: {e}")
        # Continue anyway - will retry on first request

    app.run(host='0.0.0.0', port=port, debug=debug)
