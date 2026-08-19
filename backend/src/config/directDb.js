import pg from 'pg';
import { env } from './environment.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Extract project reference from Supabase URL
const projectRef = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

// Direct PostgreSQL connection pool (bypasses PostgREST)
// Use this as fallback when PostgREST schema cache has issues
let pool = null;

export function getDirectDbPool() {
  if (!pool) {
    // Get password and URL encode it to handle special characters
    const dbPassword = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || '');
    
    // Correct Supabase direct connection format (not pooler)
    // Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
    const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
    
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      logger.error('Direct DB pool error:', err);
    });

    logger.info('Direct PostgreSQL connection pool initialized');
  }

  return pool;
}

// Helper function to query directly
export async function queryDirect(sql, params = []) {
  try {
    const pool = getDirectDbPool();
    const client = await pool.connect();
    
    try {
      const result = await client.query(sql, params);
      return { data: result.rows, error: null, count: result.rowCount };
    } catch (error) {
      logger.error('Direct query execution error:', error.message);
      return { data: null, error, count: 0 };
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Direct DB connection error:', error.message);
    return { data: null, error, count: 0 };
  }
}
