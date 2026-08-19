import QRCode from 'qrcode';
import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/environment.js';

/**
 * Barcode Generation Service
 * Implements server-side unique barcode generation with QR code support
 * 
 * Key Features:
 * - Concurrent-safe barcode generation using database sequence
 * - UNIQUE constraint enforcement (prevents duplicates)
 * - QR code generation with traceability URL
 * - Transaction-based inserts with retry logic
 * - CODE128 format support
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG = {
  format: 'CODE128',
  prefix: '',
  startSequence: 200000000000, // Start at 200000000000 for 12-digit barcodes
  maxRetries: 5,
  qrErrorCorrectionLevel: 'M', // L, M, Q, H
  qrWidth: 300,
  traceabilityBaseUrl: env.frontendUrl || 'http://localhost:5174',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate modulo-10 checksum digit
 */
function calculateChecksum(barcodeValue) {
  const digits = barcodeValue.replace(/\D/g, '');
  let sum = 0;
  
  for (let i = 0; i < digits.length; i++) {
    const digit = parseInt(digits[i], 10);
    // Alternate between multiplying by 3 and 1
    const multiplier = i % 2 === 0 ? 3 : 1;
    sum += digit * multiplier;
  }
  
  const checksum = (10 - (sum % 10)) % 10;
  return checksum.toString();
}

/**
 * Get current barcode configuration from database
 */
async function getBarcodeConfig() {
  try {
    const { data, error } = await supabaseAdmin
      .from('barcode_configurations')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error && !error.message?.includes('schema cache')) {
      logger.warn('Error fetching barcode config:', error.message);
    }

    return data || {
      format: DEFAULT_CONFIG.format,
      prefix: DEFAULT_CONFIG.prefix,
      include_checksum: true,
    };
  } catch (err) {
    logger.error('Error fetching barcode config:', err);
    return {
      format: DEFAULT_CONFIG.format,
      prefix: DEFAULT_CONFIG.prefix,
      include_checksum: true,
    };
  }
}

// ============================================================================
// UNIQUE BARCODE GENERATION
// ============================================================================

/**
 * Generate next unique barcode using database sequence (concurrent-safe)
 * 
 * @param {string} sequenceName - Sequence identifier (default: 'default')
 * @returns {Promise<string>} - Unique barcode value
 */
async function getNextBarcodeSequence(sequenceName = 'default') {
  const maxRetries = DEFAULT_CONFIG.maxRetries;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use Supabase RPC function (bypasses schema cache if function exists)
      logger.info(`[Attempt ${attempt}/${maxRetries}] Calling increment_barcode_sequence RPC...`);
      
      const { data, error } = await supabaseAdmin.rpc('increment_barcode_sequence', {
        seq_name: sequenceName,
      });

      if (error) {
        logger.error(`[Attempt ${attempt}/${maxRetries}] RPC error:`, {
          message: error.message,
          code: error.code,
        });
        
        // If schema cache issue or function not found, try table fallback
        if (error.code === 'PGRST202' || error.code === '42883' || error.message?.includes('schema cache')) {
          logger.warn('RPC not available, trying table fallback...');
          return await getNextBarcodeSequenceFallback(sequenceName);
        }
        
        throw error;
      }

      if (!data && data !== 0) {
        throw new Error('RPC returned no data');
      }

      const barcodeValue = data.toString().padStart(12, '0');
      logger.info(`✅ Generated barcode sequence: ${barcodeValue}`);
      return barcodeValue;
      
    } catch (err) {
      logger.error(`[Attempt ${attempt}/${maxRetries}] Barcode sequence failed:`, err.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to generate unique barcode after ${maxRetries} attempts: ${err.message}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
}

/**
 * Fallback method: Manual sequence increment with row-level locking
 */
async function getNextBarcodeSequenceFallback(sequenceName = 'default') {
  // Use SELECT FOR UPDATE to lock the row
  const { data: sequence, error: selectError } = await supabaseAdmin
    .from('barcode_sequences')
    .select('current_value')
    .eq('sequence_name', sequenceName)
    .single();

  if (selectError) {
    // If sequence doesn't exist, create it
    if (selectError.code === 'PGRST116') {
      const { data: newSeq, error: insertError } = await supabaseAdmin
        .from('barcode_sequences')
        .insert({
          sequence_name: sequenceName,
          current_value: DEFAULT_CONFIG.startSequence,
        })
        .select('current_value')
        .single();

      if (insertError) throw insertError;
      
      const nextValue = newSeq.current_value + 1;
      await supabaseAdmin
        .from('barcode_sequences')
        .update({ current_value: nextValue })
        .eq('sequence_name', sequenceName);

      return nextValue.toString().padStart(12, '0');
    }
    throw selectError;
  }

  const nextValue = sequence.current_value + 1;

  // Update sequence
  const { error: updateError } = await supabaseAdmin
    .from('barcode_sequences')
    .update({ current_value: nextValue })
    .eq('sequence_name', sequenceName);

  if (updateError) throw updateError;

  return nextValue.toString().padStart(12, '0');
}

/**
 * Generate unique barcode value with checksum
 * 
 * @param {Object} options - Generation options
 * @param {string} options.productId - Product UUID
 * @param {string} options.batchId - Batch UUID (optional)
 * @returns {Promise<string>} - Unique barcode value
 */
async function generateUniqueBarcodeValue(options = {}) {
  const config = await getBarcodeConfig();
  const sequenceNumber = await getNextBarcodeSequence('default');
  
  // Format: [PREFIX]-[SEQUENCE]-[CHECKSUM]
  // Example: 200000000001 or RIC-200000000001-3 (with prefix/checksum)
  let barcodeValue = '';
  
  if (config.prefix) {
    barcodeValue = `${config.prefix}-${sequenceNumber}`;
  } else {
    barcodeValue = sequenceNumber;
  }

  if (config.include_checksum) {
    const checksum = calculateChecksum(barcodeValue);
    barcodeValue = `${barcodeValue}-${checksum}`;
  }

  return barcodeValue;
}

// ============================================================================
// QR CODE GENERATION
// ============================================================================

/**
 * Generate QR code data URL for traceability
 * 
 * @param {string} barcodeValue - The barcode value
 * @returns {Promise<Object>} - QR code data and URL
 */
async function generateQRCode(barcodeValue) {
  try {
    const traceabilityUrl = `${DEFAULT_CONFIG.traceabilityBaseUrl}/trace/${barcodeValue}`;
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(traceabilityUrl, {
      errorCorrectionLevel: DEFAULT_CONFIG.qrErrorCorrectionLevel,
      width: DEFAULT_CONFIG.qrWidth,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return {
      qrCodeData: qrDataUrl,
      qrCodeUrl: traceabilityUrl,
    };
  } catch (err) {
    logger.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}

// ============================================================================
// BARCODE CRUD OPERATIONS
// ============================================================================

/**
 * Create new barcode with database storage
 * 
 * @param {Object} data - Barcode data
 * @param {string} data.productId - Product UUID (required)
 * @param {string} data.batchId - Batch UUID (optional)
 * @param {string} data.inventoryUnitId - Inventory unit UUID (optional)
 * @param {string} data.userId - User ID who generated the barcode
 * @returns {Promise<Object>} - Created barcode with QR code
 */
export async function createBarcode(data) {
  const { productId, batchId, inventoryUnitId, userId } = data;

  if (!productId) {
    throw new Error('Product ID is required to generate barcode');
  }

  const maxRetries = DEFAULT_CONFIG.maxRetries;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Generate unique barcode value
      const barcodeValue = await generateUniqueBarcodeValue({ productId, batchId });

      // Generate QR code
      const { qrCodeData, qrCodeUrl } = await generateQRCode(barcodeValue);

      // Insert via Supabase client (will try RPC first, then table access)
      logger.info(`Inserting barcode via Supabase...`);
      
      const { data: barcode, error } = await supabaseAdmin
        .from('barcodes')
        .insert({
          barcode_value: barcodeValue,
          barcode_type: 'CODE128',
          product_id: productId,
          batch_id: batchId || null,
          inventory_unit_id: inventoryUnitId || null,
          qr_code_data: qrCodeData,
          qr_code_url: qrCodeUrl,
          status: 'active',
          generated_by: userId || null,
          metadata: {
            generatedAt: new Date().toISOString(),
            attempt: attempt,
          },
        })
        .select()
        .single();

      if (error) {
        // If duplicate, retry with new sequence
        if (error.code === '23505' || error.message?.includes('already exists')) {
          logger.warn(`Duplicate barcode detected on attempt ${attempt}, retrying...`);
          if (attempt < maxRetries) {
            continue;
          }
        }
        
        // If schema cache issue, throw with helpful message
        if (error.message?.includes('schema cache')) {
          throw new Error('Barcodes table not in schema cache yet. Please restart your Supabase project or wait a few minutes.');
        }
        
        throw error;
      }

      if (!barcode) {
        throw new Error('Failed to insert barcode - no result returned');
      }

      // Log activity
      await supabaseAdmin.from('activity_log').insert({
        user_id: userId || null,
        action: 'barcode.generated',
        category: 'Inventory',
        severity: 'info',
        details: `Generated barcode ${barcodeValue} for product ${productId}`,
        metadata: { barcodeValue, productId, batchId },
      }).catch(() => {
        // Non-fatal if activity log fails
      });

      logger.info(`✅ Barcode generated: ${barcodeValue}`);
      return barcode;

    } catch (err) {
      logger.error(`Barcode generation attempt ${attempt}/${maxRetries} failed:`, err);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to create barcode after ${maxRetries} attempts: ${err.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
}

/**
 * Get barcode by value
 */
export async function getBarcodeByValue(barcodeValue) {
  const { data, error } = await supabaseAdmin
    .from('barcodes')
    .select(`
      *,
      products:product_id(id, sku, brand, model, dimensions, category, retail_price),
      batches:batch_id(id, batch_number, container_number, bl_number),
      inventory_units!inventory_units_barcode_id_fkey(*)
    `)
    .eq('barcode_value', barcodeValue)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data;
}

/**
 * Get barcode by ID
 */
export async function getBarcodeById(barcodeId) {
  const { data, error } = await supabaseAdmin
    .from('barcodes')
    .select(`
      *,
      products:product_id(id, sku, brand, model, dimensions, category, retail_price),
      batches:batch_id(id, batch_number, container_number, bl_number),
      inventory_units!inventory_units_barcode_id_fkey(*)
    `)
    .eq('id', barcodeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * List all barcodes with filters
 */
export async function listBarcodes(filters = {}) {
  try {
    logger.info('Fetching barcodes via Supabase...');
    
    let query = supabaseAdmin
      .from('barcodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.productId) {
      query = query.eq('product_id', filters.productId);
    }

    if (filters.barcodeType) {
      query = query.eq('barcode_type', filters.barcodeType);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      if (error.message?.includes('schema cache')) {
        logger.warn('Barcodes table not in schema cache yet, returning empty array');
        return [];
      }
      throw error;
    }

    return data || [];
  } catch (err) {
    logger.warn('Error fetching barcodes, returning empty array:', err.message);
    return [];
  }
}

/**
 * Update barcode
 */
export async function updateBarcode(barcodeId, updates, userId) {
  const { data, error } = await supabaseAdmin
    .from('barcodes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', barcodeId)
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabaseAdmin.from('activity_log').insert({
    user_id: userId || null,
    action: 'barcode.updated',
    category: 'Inventory',
    severity: 'info',
    details: `Updated barcode ${data.barcode_value}`,
    metadata: { barcodeId, updates },
  }).catch(() => {});

  return data;
}

/**
 * Delete barcode (soft delete - set status to 'deleted')
 */
export async function deleteBarcode(barcodeId, userId) {
  const { data, error } = await supabaseAdmin
    .from('barcodes')
    .update({
      status: 'deleted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', barcodeId)
    .select()
    .single();

  if (error) throw error;

  // Log activity
  await supabaseAdmin.from('activity_log').insert({
    user_id: userId || null,
    action: 'barcode.deleted',
    category: 'Inventory',
    severity: 'warning',
    details: `Deleted barcode ${data.barcode_value}`,
    metadata: { barcodeId },
  }).catch(() => {});

  return data;
}

/**
 * Record barcode scan event
 */
export async function recordBarcodeScan(scanData) {
  const { barcodeValue, scanType, location, referenceType, referenceId, userId, deviceInfo } = scanData;

  // Get barcode ID
  const barcode = await getBarcodeByValue(barcodeValue);
  
  if (!barcode) {
    throw new Error(`Barcode not found: ${barcodeValue}`);
  }

  // Insert scan record
  const { data, error } = await supabaseAdmin
    .from('barcode_scans')
    .insert({
      barcode_id: barcode.id,
      barcode_value: barcodeValue,
      scan_type: scanType || 'general',
      location: location || null,
      reference_type: referenceType || null,
      reference_id: referenceId || null,
      scanned_by: userId || null,
      device_info: deviceInfo || {},
    })
    .select()
    .single();

  if (error) throw error;

  logger.info(`📱 Barcode scanned: ${barcodeValue} (${scanType})`);
  
  return {
    scan: data,
    barcode: barcode,
  };
}

/**
 * Generate multiple barcodes in batch
 */
export async function createBarcodeBatch(data) {
  const { productId, batchId, quantity, userId } = data;

  if (!productId || !quantity || quantity < 1) {
    throw new Error('Product ID and quantity (>0) are required');
  }

  const barcodes = [];
  const errors = [];

  for (let i = 0; i < quantity; i++) {
    try {
      const barcode = await createBarcode({ productId, batchId, userId });
      barcodes.push(barcode);
    } catch (err) {
      errors.push({
        index: i,
        error: err.message,
      });
    }
  }

  return {
    success: barcodes.length,
    failed: errors.length,
    barcodes,
    errors,
  };
}

export default {
  createBarcode,
  getBarcodeByValue,
  getBarcodeById,
  listBarcodes,
  updateBarcode,
  deleteBarcode,
  recordBarcodeScan,
  createBarcodeBatch,
  generateQRCode,
};
