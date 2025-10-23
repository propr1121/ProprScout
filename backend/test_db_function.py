#!/usr/bin/env python3
"""
Test database function for debugging
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

def test_database_function():
    """Test the database function"""
    logger.info("🧪 Testing database function...")
    
    # Test 1: Initial connection
    current_db = get_database()
    logger.info(f"First call - current_db is None: {current_db is None}")
    
    # Test 2: Second call (should use cached connection)
    current_db2 = get_database()
    logger.info(f"Second call - current_db2 is None: {current_db2 is None}")
    
    # Test 3: Database operations
    if current_db is not None:
        try:
            current_db.client.admin.command('ping')
            logger.info("✅ Database ping successful")
            
            # Test collection operations
            collection = current_db.detective_analyses
            count = collection.count_documents({})
            logger.info(f"✅ Collection operations successful. Count: {count}")
            
        except Exception as e:
            logger.error(f"❌ Database operations failed: {e}")
            return False
    else:
        logger.error("❌ Database is None")
        return False
    
    return True

if __name__ == "__main__":
    success = test_database_function()
    
    if success:
        logger.info("🎉 Database function test passed!")
    else:
        logger.error("💥 Database function test failed!")
        exit(1)
