/**
 * ============================================================================
 * BARCODE CONTROLLER
 * ============================================================================
 * Handles HTTP requests for barcode generation and traceability
 * ============================================================================
 */

import {
  createBarcodes,
  getBarcodes,
  getTraceability,
  deactivateBarcode
} from '../services/barcodeService.js';

/**
 * POST /api/barcodes
 * Create new barcodes with complete traceability
 * 
 * Request body:
 * {
 *   productId: "uuid",
 *   batchId: "uuid",
 *   shipmentId: "uuid",
 *   quantity: 1
 * }
 */
export async function createBarcodeController(req, res) {
  try {
    const {
      productId,
      batchId,
      shipmentId,
      quantity = 1
    } = req.body;

    console.log('📦 Barcode generation request:', {
      productId,
      batchId,
      shipmentId,
      quantity
    });

    const result = await createBarcodes({
      productId,
      batchId,
      shipmentId,
      quantity: Number(quantity)
    });

    return res.status(201).json({
      success: true,
      message: `${result.barcodes.length} barcode(s) generated successfully`,
      ...result
    });
  } catch (error) {
    console.error('❌ Barcode generation error:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/barcodes
 * Get list of barcodes with traceability info
 * 
 * Query params:
 * - limit: number (default 50, max 500)
 */
export async function getBarcodesController(req, res) {
  try {
    const limit = req.query.limit || 50;

    console.log(`📋 Loading ${limit} barcodes...`);

    const barcodes = await getBarcodes({ limit });

    return res.json({
      success: true,
      barcodes,
      total: barcodes.length
    });
  } catch (error) {
    console.error('❌ Get barcodes error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to load barcodes',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * GET /api/barcodes/config
 * Get barcode configuration
 */
export async function getBarcodeConfigController(req, res) {
  try {
    // For now, return default config
    // Later this can be fetched from database settings table
    const config = {
      format: 'CODE128',
      prefix: 'RIC',
      include_date_stamp: false,
      include_checksum: true,
      serial_length: 12,
      label_size: '4x2',
      printer_dpi: 300,
      qr_error_correction: 'M',
      qr_size: 300
    };

    return res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('❌ Get config error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load barcode configuration'
    });
  }
}

/**
 * GET /api/barcodes/trace/:barcodeValue
 * Get complete traceability chain for a barcode
 * Used by QR code scanning
 * 
 * Path params:
 * - barcodeValue: string (e.g., RIC000000000001)
 */
export async function getTraceabilityController(req, res) {
  try {
    const { barcodeValue } = req.params;

    if (!barcodeValue) {
      return res.status(400).json({
        success: false,
        error: 'Barcode value is required'
      });
    }

    console.log(`🔍 Traceability lookup: ${barcodeValue}`);

    const traceability = await getTraceability(barcodeValue);

    return res.json({
      success: true,
      traceability
    });
  } catch (error) {
    console.error('❌ Traceability error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve traceability'
    });
  }
}

/**
 * PATCH /api/barcodes/:id/deactivate
 * Deactivate a barcode (soft delete)
 * NEVER hard-delete - preserves traceability for returns/rejection
 * 
 * Path params:
 * - id: barcode UUID
 */
export async function deactivateBarcodeController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Barcode ID is required'
      });
    }

    console.log(`🚫 Deactivating barcode: ${id}`);

    const barcode = await deactivateBarcode(id);

    return res.json({
      success: true,
      message: 'Barcode deactivated successfully',
      barcode
    });
  } catch (error) {
    console.error('❌ Deactivate barcode error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to deactivate barcode'
    });
  }
}
