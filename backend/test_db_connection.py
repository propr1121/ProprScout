#!/usr/bin/env python3
"""
Test MongoDB connection for debugging
"""

import os
import pymongo
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_mongodb_connection():
    """Test MongoDB connection"""
    try:
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/proprscout')
        logger.info(f"Testing connection to: {mongodb_uri}")
        
        client = pymongo.MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        db = client.proprscout
        
        # Test connection
        client.admin.command('ping')
        logger.info("✅ MongoDB connection successful")
        
        # Test database operations
        collection = db.detective_analyses
        count = collection.count_documents({})
        logger.info(f"✅ Database operations successful. Collection has {count} documents")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    logger.info("🧪 Testing MongoDB connection...")
    success = test_mongodb_connection()
    
    if success:
        logger.info("🎉 MongoDB connection test passed!")
    else:
        logger.error("💥 MongoDB connection test failed!")
        exit(1)
