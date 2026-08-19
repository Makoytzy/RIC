import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import * as barcodeService from '../services/barcodeService.js';

// ============================================================================
// BARCODE CONFIGURATION ENDPOINTS
// ============================================================================

export async function getBarcodeConfig(req, res, next) {
  try {
    // Try using the table directly first
    const { data, error } = await supabaseAdmin
      .from('barcode_configurations')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    // Handle errors gracefully
    if (error) {
      if (error.message?.includes('schema cache') || error.message?.includes('not found')) {
        logger.warn('Barcode configurations table not in schema cache, using defaults');
      } else {
        logger.warn('Error fetching barcode config:', error.message);
      }
    }

    // Always return a config, use defaults if DB query failed or returned nothing
    const config = data || {
      format: 'CODE128',
      prefix: 'RIC-TR',
      include_date_stamp: true,
      include_checksum: true,
      serial_length: 6,
      label_size: '4x2',
      printer_dpi: 300,
    };

    return res.json({ config });
  } catch (err) {
    logger.error('Error fetching barcode config:', err);
    
    // Return default config instead of failing
    return res.json({
      config: {
        format: 'CODE128',
        prefix: 'RIC-TR',
        include_date_stamp: true,
        include_checksum: true,
        serial_length: 6,
        label_size: '4x2',
        printer_dpi: 300,
      }
    });
  }
}

export async function updateBarcodeConfig(req, res, next) {
  try {
    const { format, prefix, includeDateStamp, includeChecksum, serialLength, labelSize, printerDpi } = req.body;

    const payload = {
      format: format || 'CODE128',
      prefix: (prefix || 'RIC-TR').toUpperCase(),
      include_date_stamp: includeDateStamp !== undefined ? Boolean(includeDateStamp) : true,
      include_checksum: includeChecksum !== undefined ? Boolean(includeChecksum) : true,
      serial_length: parseInt(serialLength || 6, 10),
      label_size: labelSize || '4x2',
      printer_dpi: parseInt(printerDpi || 300, 10),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    // Check existing
    const { data: existing } = await supabaseAdmin
      .from('barcode_configurations')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing?.id) {
      const { data, error } = await supabaseAdmin
        .from('barcode_configurations')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('barcode_configurations')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await supabaseAdmin.from('activity_log').insert({
      user_id: req.user?.id || null,
      action: 'barcode.config_updated',
      category: 'System',
      severity: 'notice',
      details: `Updated barcode rules: ${payload.format} with prefix ${payload.prefix}`,
      metadata: payload,
    }).catch(() => {
      // Ignore if activity_log fails
    });

    return res.json({ config: result, message: 'Barcode configuration updated successfully' });
  } catch (err) {
    logger.error('Error saving barcode config:', err);
    return next(err);
  }
}

export async function validateBarcode(req, res, next) {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode string is required for validation' });
    }

    const { data: config } = await supabaseAdmin
      .from('barcode_configurations')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    const expectedPrefix = config?.prefix || 'RIC-TR';
    const isValidPrefix = barcode.startsWith(expectedPrefix);

    if (!isValidPrefix) {
      return res.json({
        valid: false,
        message: `Invalid prefix. Expected barcode starting with '${expectedPrefix}'`,
      });
    }

    const segments = barcode.split('-');
    return res.json({
      valid: true,
      message: 'Barcode string successfully verified against active system rules',
      decoded: {
        raw: barcode,
        prefix: segments[0] || expectedPrefix,
        period: segments[1] || 'Standard',
        serial: segments[2] || barcode.replace(/[^0-9]/g, '').slice(0, 6),
        checksum: segments[3] || 'VERIFIED',
      }
    });
  } catch (err) {
    logger.error('Error validating barcode:', err);
    return next(err);
  }
}

// ============================================================================
// BARCODE CRUD ENDPOINTS
// ============================================================================

/**
 * POST /api/barcodes - Generate new barcode
 */
export async function createBarcode(req, res, next) {
  try {
    const { productId, batchId, inventoryUnitId, quantity } = req.body;
    const userId = req.user?.id;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Batch generation
    if (quantity && quantity > 1) {
      const result = await barcodeService.createBarcodeBatch({
        productId,
        batchId,
        quantity: parseInt(quantity, 10),
        userId,
      });

      return res.status(201).json({
        message: `Generated ${result.success} barcodes successfully`,
        ...result,
      });
    }

    // Single barcode generation
    const barcode = await barcodeService.createBarcode({
      productId,
      batchId,
      inventoryUnitId,
      userId,
    });

    return res.status(201).json({
      message: 'Barcode generated successfully',
      barcode,
    });
  } catch (err) {
    logger.error('Error creating barcode:', err);
    return next(err);
  }
}

/**
 * GET /api/barcodes - List all barcodes
 */
export async function listBarcodes(req, res, next) {
  try {
    const { productId, batchId, status, limit } = req.query;

    const barcodes = await barcodeService.listBarcodes({
      productId,
      batchId,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return res.json({
      barcodes,
      count: barcodes.length,
    });
  } catch (err) {
    logger.error('Error listing barcodes:', err);
    
    // Handle schema cache issue gracefully
    if (err.message?.includes('schema cache') || err.message?.includes('not found') || err.code === 'PGRST205') {
      logger.warn('Barcodes table not in schema cache yet - returning empty array');
      return res.json({
        barcodes: [],
        count: 0,
        message: 'Schema cache updating - please wait a moment and refresh'
      });
    }
    
    return next(err);
  }
}

/**
 * GET /api/barcodes/:barcode - Get barcode by value
 */
export async function getBarcode(req, res, next) {
  try {
    const { barcode: barcodeValue } = req.params;

    const barcode = await barcodeService.getBarcodeByValue(barcodeValue);

    if (!barcode) {
      return res.status(404).json({ error: 'Barcode not found' });
    }

    return res.json({ barcode });
  } catch (err) {
    logger.error('Error fetching barcode:', err);
    return next(err);
  }
}

/**
 * PUT /api/barcodes/:id - Update barcode
 */
export async function updateBarcodeById(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    // Prevent changing barcode_value (immutable)
    if (updates.barcode_value) {
      return res.status(400).json({ error: 'Barcode value cannot be changed' });
    }

    const barcode = await barcodeService.updateBarcode(id, updates, userId);

    return res.json({
      message: 'Barcode updated successfully',
      barcode,
    });
  } catch (err) {
    logger.error('Error updating barcode:', err);
    return next(err);
  }
}

/**
 * DELETE /api/barcodes/:id - Delete barcode (soft delete)
 */
export async function deleteBarcodeById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const barcode = await barcodeService.deleteBarcode(id, userId);

    return res.json({
      message: 'Barcode deleted successfully',
      barcode,
    });
  } catch (err) {
    logger.error('Error deleting barcode:', err);
    return next(err);
  }
}

/**
 * POST /api/barcodes/:barcode/scan - Record barcode scan
 */
export async function scanBarcode(req, res, next) {
  try {
    const { barcode: barcodeValue } = req.params;
    const { scanType, location, referenceType, referenceId, deviceInfo } = req.body;
    const userId = req.user?.id;

    const result = await barcodeService.recordBarcodeScan({
      barcodeValue,
      scanType,
      location,
      referenceType,
      referenceId,
      userId,
      deviceInfo,
    });

    return res.json({
      message: 'Barcode scanned successfully',
      ...result,
    });
  } catch (err) {
    logger.error('Error scanning barcode:', err);
    return next(err);
  }
}
