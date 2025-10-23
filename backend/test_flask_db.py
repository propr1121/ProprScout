#!/usr/bin/env python3
"""
Test database function in Flask context
"""

import os
import pymongo
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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

def test_database_operations():
    """Test database operations"""
    logger.info("🧪 Testing database operations...")
    
    # Get database connection
    current_db = get_database()
    if current_db is None:
        logger.error("❌ Database connection failed")
        return False
    
    try:
        # Test insert operation
        test_record = {
            'user_id': 'test_user',
            'image_filename': 'test.jpg',
            'analysis': {'test': 'data'},
            'created_at': '2025-10-21T19:51:00.000Z'
        }
        
        result = current_db.detective_analyses.insert_one(test_record)
        logger.info(f"✅ Insert successful: {result.inserted_id}")
        
        # Test count
        count = current_db.detective_analyses.count_documents({})
        logger.info(f"✅ Collection count: {count}")
        
        # Test find
        records = list(current_db.detective_analyses.find({}))
        logger.info(f"✅ Found {len(records)} records")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Database operations failed: {e}")
        return False

if __name__ == "__main__":
    success = test_database_operations()
    
    if success:
        logger.info("🎉 Database operations test passed!")
    else:
        logger.error("💥 Database operations test failed!")
        exit(1)
