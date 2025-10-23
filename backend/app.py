#!/usr/bin/env python3
"""
ProprScout Property Detective Backend
Flask application with GeoCLIP integration
"""

import os
import sys
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import pymongo
from datetime import datetime
import json
import tempfile
from werkzeug.utils import secure_filename

# Import GeoCLIP service
from services.geoclip_service import get_geoclip_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Database connection
db = None
mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/proprscout')

def get_database():
    """Get database connection"""
    global db
    if db is None:
        try:
            logger.info(f"Attempting to connect to MongoDB: {mongodb_uri}")
            client = pymongo.MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
            db = client.proprscout
            # Test connection
            client.admin.command('ping')
            logger.info("✅ Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            db = None
    return db

# Initialize database connection
logger.info("Initializing database connection...")
initial_db = get_database()
logger.info(f"Initial database connection result: {initial_db is not None}")

# Initialize GeoCLIP service
try:
    geoclip_service = get_geoclip_service()
    logger.info("GeoCLIP service initialized")
except Exception as e:
    logger.error(f"Failed to initialize GeoCLIP service: {e}")
    geoclip_service = None

# Routes
@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'ProprScout Property Detective API',
        'version': '1.0.0',
        'status': 'running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test-db')
def test_db():
    """Test database connection"""
    try:
        current_db = get_database()
        if current_db is None:
            return jsonify({'error': 'Database connection failed'}), 500
        
        # Test database operations
        test_record = {
            'user_id': 'test_user',
            'image_filename': 'test.jpg',
            'analysis': {'test': 'data'},
            'created_at': datetime.now()
        }
        
        result = current_db.detective_analyses.insert_one(test_record)
        count = current_db.detective_analyses.count_documents({})
        
        return jsonify({
            'success': True,
            'inserted_id': str(result.inserted_id),
            'count': count,
            'message': 'Database operations successful'
        })
        
    except Exception as e:
        logger.error(f"Database test failed: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health')
def health():
    """Health check endpoint"""
    database_status = 'disconnected'
    database_error = None
    
    # Get fresh database connection
    logger.info("Health check - calling get_database()...")
    current_db = get_database()
    logger.info(f"Health check - current_db is None: {current_db is None}")
    logger.info(f"Health check - current_db type: {type(current_db)}")
    
    if current_db is not None:
        try:
            # Test database connection
            logger.info("Health check - testing database ping...")
            current_db.client.admin.command('ping')
            database_status = 'connected'
            logger.info("✅ Database health check successful")
        except Exception as e:
            database_status = 'error'
            database_error = str(e)
            logger.error(f"❌ Database health check failed: {e}")
    else:
        logger.warning("❌ Database is None in health check")
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': database_status,
        'database_error': database_error,
        'geoclip_service': 'available' if geoclip_service else 'unavailable'
    })

@app.route('/api/detective/analyze', methods=['POST'])
def analyze_property():
    """Analyze property image for location detection using GeoCLIP"""
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
        if not ('.' in image_file.filename and 
                image_file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, WEBP allowed.'}), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(image_file.filename)
        temp_path = os.path.join(tempfile.gettempdir(), filename)
        image_file.save(temp_path)
        
        try:
            # Use GeoCLIP for location prediction
            if geoclip_service:
                logger.info("Using GeoCLIP for location prediction")
                try:
                    geolocation_result = geoclip_service.predict_location(temp_path)
                    logger.info(f"GeoCLIP result: {geolocation_result}")
                    
                    # Extract coordinates
                    coordinates = geolocation_result.get('coordinates', {})
                    confidence = geolocation_result.get('confidence', 0.0)
                    model_info = geolocation_result.get('model', 'unknown')
                    
                    logger.info(f"Extracted coordinates: {coordinates}, confidence: {confidence}, model: {model_info}")
                    
                    # Use reverse geocoding to get address (mock for now)
                    address_info = get_address_from_coordinates(
                        coordinates.get('lat', 0), 
                        coordinates.get('lon', 0)
                    )
                    
                    # Generate enrichment data
                    enrichment_data = generate_enrichment_data(coordinates)
                    
                except ValueError as validation_error:
                    # Handle validation errors (low confidence, outside Portugal, etc.)
                    logger.warning(f"GeoCLIP validation failed: {validation_error}")
                    return jsonify({
                        'error': 'Analysis failed',
                        'message': str(validation_error),
                        'type': 'validation_error',
                        'suggestion': 'Please try a different image or ensure the property is in Portugal'
                    }), 422
                    
                except RuntimeError as model_error:
                    # Handle model errors (AI prediction failed)
                    logger.error(f"GeoCLIP model error: {model_error}")
                    return jsonify({
                        'error': 'AI analysis failed',
                        'message': 'The AI model could not analyze this image',
                        'type': 'model_error',
                        'suggestion': 'Please try a clearer image or contact support'
                    }), 500
                    
                except Exception as geoclip_error:
                    # Handle unexpected errors
                    logger.error(f"Unexpected GeoCLIP error: {geoclip_error}")
                    import traceback
                    logger.error(f"GeoCLIP error traceback: {traceback.format_exc()}")
                    return jsonify({
                        'error': 'Analysis failed',
                        'message': 'An unexpected error occurred during analysis',
                        'type': 'unexpected_error',
                        'suggestion': 'Please try again or contact support'
                    }), 500
            else:
                logger.error("GeoCLIP service not available")
                return jsonify({
                    'error': 'Service unavailable',
                    'message': 'AI analysis service is currently unavailable',
                    'type': 'service_unavailable',
                    'suggestion': 'Please try again later or contact support'
                }), 503
            
            # Create analysis result
            analysis_result = {
                'coordinates': coordinates,
                'address': address_info,
                'confidence': confidence,
                'enrichment': enrichment_data,
                'model_info': model_info,
                'timestamp': datetime.now().isoformat()
            }
            
            # Save analysis to database
            try:
                current_db = get_database()
                if current_db is not None:
                    analysis_record = {
                        'user_id': request.form.get('user_id', 'anonymous'),
                        'image_filename': image_file.filename,
                        'image_hash': geolocation_result.get('image_hash', ''),
                        'analysis': analysis_result,
                        'geolocation_raw': geolocation_result if geoclip_service else None,
                        'created_at': datetime.now()
                    }
                    current_db.detective_analyses.insert_one(analysis_record)
                    logger.info("Analysis saved to database")
                else:
                    logger.warning("Database not available for saving analysis")
            except Exception as db_error:
                logger.warning(f"Database save failed: {db_error}")
                # Continue without database
            
            logger.info(f"Analysis completed: {coordinates} (confidence: {confidence})")
            return jsonify(analysis_result)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return jsonify({'error': 'Analysis failed', 'details': str(e)}), 500

@app.route('/api/detective/quota', methods=['GET'])
def get_quota():
    """Get user quota information"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        
        # Mock quota for now
        quota = {
            'remaining': 3,
            'limit': 3,
            'subscription': 'free'
        }
        
        return jsonify({
            'success': True,
            'data': quota
        })
        
    except Exception as e:
        logger.error(f"Get quota failed: {e}")
        return jsonify({'error': 'Get quota failed'}), 500

@app.route('/api/detective/history', methods=['GET'])
def get_history():
    """Get user analysis history"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        limit = int(request.args.get('limit', 10))
        
        if db:
            analyses = list(db.detective_analyses.find(
                {'user_id': user_id}
            ).sort('created_at', -1).limit(limit))
        else:
            analyses = []
        
        return jsonify({
            'success': True,
            'data': {
                'analyses': analyses
            }
        })
        
    except Exception as e:
        logger.error(f"Get history failed: {e}")
        return jsonify({'error': 'Get history failed'}), 500

@app.route('/api/pricing/plans', methods=['GET'])
def get_pricing_plans():
    """Get subscription plans"""
    plans = [
        {
            'id': 'free',
            'name': 'Free Plan',
            'type': 'free',
            'price': {'monthly': 0, 'annual': 0},
            'features': {
                'analyses_per_month': 3,
                'basic_location_detection': True,
                'address_lookup': True,
                'map_view': True,
                'analysis_history_limit': 10
            }
        },
        {
            'id': 'pro',
            'name': 'Pro Plan',
            'type': 'pro',
            'price': {'monthly': 29, 'annual': 290},
            'features': {
                'analyses_per_month': 1000,
                'basic_location_detection': True,
                'address_lookup': True,
                'map_view': True,
                'analysis_history_limit': -1,
                'advanced_features': True,
                'property_type_detection': True,
                'feature_detection': True,
                'neighborhood_analysis': True,
                'comparable_properties': True,
                'export_pdf': True,
                'api_access': True,
                'priority_support': True,
                'no_watermarks': True
            },
            'popular': True
        }
    ]
    
    return jsonify({
        'success': True,
        'data': {
            'plans': plans,
            'currency': 'EUR'
        }
    })

@app.route('/api/pricing/user-status', methods=['GET'])
def get_user_status():
    """Get user subscription status"""
    user_id = request.args.get('user_id', 'anonymous')
    
    return jsonify({
        'success': True,
        'data': {
            'subscription': 'free',
            'plan': None,
            'quota': {
                'remaining': 3,
                'limit': 3
            },
            'features': {
                'analyses_per_month': 3,
                'analysis_history_limit': 10
            }
        }
    })

# Helper functions
def get_address_from_coordinates(lat, lon):
    """Get address from coordinates using reverse geocoding"""
    try:
        # For now, return mock address data
        # In production, integrate with Nominatim or Google Geocoding API
        
        # Simple mock based on coordinates
        if 38.5 <= lat <= 39.0 and -9.5 <= lon <= -8.5:
            # Lisbon area
            return {
                'formatted': f'Lisboa, Portugal',
                'city': 'Lisboa',
                'district': 'Centro',
                'postcode': '1000-001'
            }
        elif 41.0 <= lat <= 41.5 and -8.8 <= lon <= -8.3:
            # Porto area
            return {
                'formatted': f'Porto, Portugal',
                'city': 'Porto',
                'district': 'Norte',
                'postcode': '4000-001'
            }
        else:
            # Default Portugal address
            return {
                'formatted': f'Portugal',
                'city': 'Unknown',
                'district': 'Unknown',
                'postcode': '0000-000'
            }
    except Exception as e:
        logger.error(f"Address lookup failed: {e}")
        return {
            'formatted': 'Unknown location',
            'city': 'Unknown',
            'district': 'Unknown',
            'postcode': '0000-000'
        }

def generate_enrichment_data(coordinates):
    """Generate enrichment data for coordinates"""
    try:
        # Mock enrichment data based on coordinates
        # In production, integrate with real data sources
        
        lat = coordinates.get('lat', 0)
        lon = coordinates.get('lon', 0)
        
        # Generate deterministic "random" data based on coordinates
        import hashlib
        coord_hash = hashlib.md5(f"{lat:.6f},{lon:.6f}".encode()).hexdigest()
        hash_int = int(coord_hash[:8], 16)
        
        return {
            'schools': (hash_int % 5) + 1,
            'supermarkets': (hash_int % 3) + 1,
            'restaurants': (hash_int % 8) + 2,
            'transport': (hash_int % 4) + 1,
            'hospitals': (hash_int % 2) + 1,
            'parks': (hash_int % 3) + 1
        }
    except Exception as e:
        logger.error(f"Enrichment data generation failed: {e}")
        return {
            'schools': 0,
            'supermarkets': 0,
            'restaurants': 0,
            'transport': 0,
            'hospitals': 0,
            'parks': 0
        }

if __name__ == '__main__':
    # Create uploads directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Get port from environment or default to 3001
    port = int(os.getenv('PORT', 3001))
    
    # Run the app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('NODE_ENV') == 'development'
    )
