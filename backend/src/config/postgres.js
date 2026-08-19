/**
 * Direct PostgreSQL Connection
 * 
 * Bypasses Supabase PostgREST entirely - connects directly to PostgreSQL database.
 * Use this when PostgREST schema cache is stuck.
 * 
 * Connection pooling enabled for performance.
 */

import pg from 'pg';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Get database URL from environment
// You need to set this in your .env file from Supabase Dashboard → Settings → Database → Connection pooling
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  logger.warn('⚠️ DATABASE_URL not found in environment variables');
  logger.warn('Direct PostgreSQL connection will not be available');
  logger.warn('Please get it from: Supabase Dashboard → Settings → Database → Connection string');
} else {
  logger.info('Initializing PostgreSQL connection pool...');
  logger.info(`Database host: ${databaseUrl.split('@')[1]?.split(':')[0] || 'unknown'}`);
}

// Create connection pool only if DATABASE_URL exists
let pool = null;

if (databaseUrl) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false, // Supabase uses self-signed certs
      },
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection on startup
    pool.on('connect', () => {
      logger.info('✅ Direct PostgreSQL connection established');
    });

    pool.on('error', (err) => {
      logger.error('❌ PostgreSQL pool error:', err.message);
    });
  } catch (err) {
    logger.error('❌ Failed to create PostgreSQL pool:', err.message);
    pool = null;
  }
}

/**
 * Execute a SQL query directly
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters ($1, $2, etc.)
 * @returns {Promise<Object>} - Query result
 */
export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized - DATABASE_URL missing or invalid');
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result;
  } catch (error) {
    logger.error('PostgreSQL query error:', { sql, params, error: error.message });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get next barcode sequence (direct SQL)
 */
export async function getNextBarcodeSequenceDirect(sequenceName = 'default') {
  const sql = `
    UPDATE barcode_sequences
    SET current_value = current_value + 1, updated_at = NOW()
    WHERE sequence_name = $1
    RETURNING current_value
  `;
  
  const result = await query(sql, [sequenceName]);
  
  if (result.rows.length === 0) {
    // Create sequence if doesn't exist
    const createSql = `
      INSERT INTO barcode_sequences (sequence_name, current_value)
      VALUES ($1, 200000000001)
      RETURNING current_value
    `;
    const createResult = await query(createSql, [sequenceName]);
    return createResult.rows[0].current_value;
  }
  
  return result.rows[0].current_value;
}

/**
 * Insert barcode directly (bypasses PostgREST)
 */
export async function insertBarcodeDirect(barcodeData) {
  const {
    barcode_value,
    barcode_type,
    product_id,
    batch_id,
    inventory_unit_id,
    qr_code_data,
    qr_code_url,
    status,
    generated_by,
    metadata,
  } = barcodeData;

  const sql = `
    INSERT INTO barcodes (
      barcode_value,
      barcode_type,
      product_id,
      batch_id,
      inventory_unit_id,
      qr_code_data,
      qr_code_url,
      status,
      generated_by,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const params = [
    barcode_value,
    barcode_type || 'CODE128',
    product_id || null,
    batch_id || null,
    inventory_unit_id || null,
    qr_code_data || null,
    qr_code_url || null,
    status || 'active',
    generated_by || null,
    metadata ? JSON.stringify(metadata) : null,
  ];

  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Get barcodes list (direct SQL)
 */
export async function getBarcodesDirect(filters = {}) {
  let sql = `
    SELECT 
      b.*,
      p.name as product_name,
      p.sku as product_sku
    FROM barcodes b
    LEFT JOIN products p ON b.product_id = p.id
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (filters.status) {
    sql += ` AND b.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.productId) {
    sql += ` AND b.product_id = $${paramIndex}`;
    params.push(filters.productId);
    paramIndex++;
  }

  if (filters.barcodeType) {
    sql += ` AND b.barcode_type = $${paramIndex}`;
    params.push(filters.barcodeType);
    paramIndex++;
  }

  sql += ` ORDER BY b.created_at DESC`;

  if (filters.limit) {
    sql += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    sql += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Check if barcode exists (direct SQL)
 */
export async function barcodeExistsDirect(barcodeValue) {
  const sql = 'SELECT EXISTS(SELECT 1 FROM barcodes WHERE barcode_value = $1) as exists';
  const result = await query(sql, [barcodeValue]);
  return result.rows[0].exists;
}

/**
 * Close pool (for graceful shutdown)
 */
export async function closePool() {
  await pool.end();
  logger.info('PostgreSQL pool closed');
}

export default {
  query,
  getNextBarcodeSequenceDirect,
  insertBarcodeDirect,
  getBarcodesDirect,
  barcodeExistsDirect,
  closePool,
};
