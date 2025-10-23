/**
 * Database schema definitions
 */

import logger from '../utils/logger.js';

/**
 * Create database tables
 */
export async function createTables(pool) {
  const tables = [
    // Properties table
    `CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      url VARCHAR(500) UNIQUE NOT NULL,
      site VARCHAR(50) NOT NULL,
      property_id VARCHAR(100) NOT NULL,
      title TEXT,
      description TEXT,
      price DECIMAL(12,2),
      area DECIMAL(8,2),
      rooms INTEGER,
      bathrooms INTEGER,
      location TEXT,
      coordinates POINT,
      features TEXT[],
      images TEXT[],
      raw_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Analysis results table
    `CREATE TABLE IF NOT EXISTS analysis_results (
      id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
      overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
      price_analysis JSONB,
      location_analysis JSONB,
      property_analysis JSONB,
      recommendations TEXT[],
      risks TEXT[],
      opportunities TEXT[],
      geolocation_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Geolocation results table
    `CREATE TABLE IF NOT EXISTS geolocation_results (
      id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      predicted_coordinates POINT,
      confidence_score DECIMAL(5,4),
      geocoding_data JSONB,
      reverse_geocoding_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User sessions table
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      request_count INTEGER DEFAULT 0
    )`,

    // Rate limiting table
    `CREATE TABLE IF NOT EXISTS rate_limits (
      id SERIAL PRIMARY KEY,
      ip_address INET NOT NULL,
      endpoint VARCHAR(255) NOT NULL,
      request_count INTEGER DEFAULT 1,
      window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ip_address, endpoint, window_start)
    )`,

    // File uploads table
    `CREATE TABLE IF NOT EXISTS file_uploads (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      cloudinary_url TEXT,
      cloudinary_public_id VARCHAR(255),
      uploaded_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // API usage statistics
    `CREATE TABLE IF NOT EXISTS api_usage (
      id SERIAL PRIMARY KEY,
      endpoint VARCHAR(255) NOT NULL,
      method VARCHAR(10) NOT NULL,
      status_code INTEGER NOT NULL,
      response_time INTEGER,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Detective analyses table
    `CREATE TABLE IF NOT EXISTS detective_analyses (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      image_url TEXT NOT NULL,
      cloudinary_public_id VARCHAR(255),
      location_prediction JSONB,
      address_info JSONB,
      analysis JSONB NOT NULL,
      quota_used INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // User quotas table
    `CREATE TABLE IF NOT EXISTS user_quotas (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      quota_used INTEGER DEFAULT 0,
      quota_limit INTEGER DEFAULT 3,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, created_at)
    )`
  ];

  for (const table of tables) {
    try {
      await pool.query(table);
      logger.info(`✅ Table created/verified: ${table.split(' ')[5]}`);
    } catch (error) {
      logger.error(`❌ Error creating table: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Create database indexes
 */
export async function createIndexes(pool) {
  const indexes = [
    // Properties indexes
    'CREATE INDEX IF NOT EXISTS idx_properties_url ON properties(url)',
    'CREATE INDEX IF NOT EXISTS idx_properties_site ON properties(site)',
    'CREATE INDEX IF NOT EXISTS idx_properties_property_id ON properties(property_id)',
    'CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties USING GIST(coordinates)',
    'CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at)',

    // Analysis results indexes
    'CREATE INDEX IF NOT EXISTS idx_analysis_property_id ON analysis_results(property_id)',
    'CREATE INDEX IF NOT EXISTS idx_analysis_overall_score ON analysis_results(overall_score)',
    'CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_results(created_at)',

    // Geolocation results indexes
    'CREATE INDEX IF NOT EXISTS idx_geolocation_property_id ON geolocation_results(property_id)',
    'CREATE INDEX IF NOT EXISTS idx_geolocation_coordinates ON geolocation_results USING GIST(predicted_coordinates)',
    'CREATE INDEX IF NOT EXISTS idx_geolocation_confidence ON geolocation_results(confidence_score)',

    // User sessions indexes
    'CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON user_sessions(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_sessions_ip_address ON user_sessions(ip_address)',
    'CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON user_sessions(last_activity)',

    // Rate limiting indexes
    'CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint)',
    'CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start)',

    // File uploads indexes
    'CREATE INDEX IF NOT EXISTS idx_uploads_filename ON file_uploads(filename)',
    'CREATE INDEX IF NOT EXISTS idx_uploads_cloudinary_public_id ON file_uploads(cloudinary_public_id)',
    'CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON file_uploads(created_at)',

    // API usage indexes
    'CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint)',
    'CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_api_usage_ip_address ON api_usage(ip_address)'
  ];

  for (const index of indexes) {
    try {
      await pool.query(index);
      logger.info(`✅ Index created/verified: ${index.split(' ')[4]}`);
    } catch (error) {
      logger.error(`❌ Error creating index: ${error.message}`);
      // Don't throw error for index creation failures
    }
  }
}

/**
 * Create database functions
 */
export async function createFunctions(pool) {
  const functions = [
    // Function to update updated_at timestamp
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
     RETURNS TRIGGER AS $$
     BEGIN
       NEW.updated_at = CURRENT_TIMESTAMP;
       RETURN NEW;
     END;
     $$ language 'plpgsql'`,

    // Trigger for properties table
    `DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
     CREATE TRIGGER update_properties_updated_at
       BEFORE UPDATE ON properties
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column()`,

    // Function to clean old rate limit records
    `CREATE OR REPLACE FUNCTION clean_old_rate_limits()
     RETURNS INTEGER AS $$
     DECLARE
       deleted_count INTEGER;
     BEGIN
       DELETE FROM rate_limits 
       WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '1 hour';
       GET DIAGNOSTICS deleted_count = ROW_COUNT;
       RETURN deleted_count;
     END;
     $$ LANGUAGE plpgsql`,

    // Function to clean old API usage records
    `CREATE OR REPLACE FUNCTION clean_old_api_usage()
     RETURNS INTEGER AS $$
     DECLARE
       deleted_count INTEGER;
     BEGIN
       DELETE FROM api_usage 
       WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
       GET DIAGNOSTICS deleted_count = ROW_COUNT;
       RETURN deleted_count;
     END;
     $$ LANGUAGE plpgsql`
  ];

  for (const func of functions) {
    try {
      await pool.query(func);
      logger.info(`✅ Function/Trigger created: ${func.split(' ')[2]}`);
    } catch (error) {
      logger.error(`❌ Error creating function/trigger: ${error.message}`);
      // Don't throw error for function creation failures
    }
  }
}

export default { createTables, createIndexes, createFunctions };
