/**
 * Database initialization and connection management
 */

import pkg from 'pg';
const { Pool } = pkg;
import { createTables, createIndexes } from './schema.js';
import logger from '../utils/logger.js';

let pool = null;

/**
 * Initialize database connection
 */
export async function initDatabase() {
  try {
    const config = {
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'proprscout',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    pool = new Pool(config);

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('✅ Database connected successfully');

    // Create tables and indexes
    await createTables(pool);
    await createIndexes(pool);

    logger.info('✅ Database schema initialized');

    return pool;
  } catch (error) {
    logger.warn('⚠️ PostgreSQL connection failed (optional):', error.message);
    logger.info('📝 Using MongoDB as primary database');
    pool = null;
    return null;
  }
}

/**
 * Get database pool
 */
export function getPool() {
  if (!pool) {
    logger.warn('⚠️ PostgreSQL not available, using MongoDB');
    return null;
  }
  return pool;
}

/**
 * Execute query with error handling
 */
export async function query(text, params = []) {
  const pool = getPool();
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute transaction
 */
export async function transaction(callback) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('🔴 Database connection closed');
  }
}

export default { initDatabase, getPool, query, transaction, closeDatabase };
