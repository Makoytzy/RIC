/**
 * ============================================================================
 * BARCODE SERVICE
 * ============================================================================
 * Handles barcode generation with complete traceability chain
 * 
 * Flow:
 * 1. Verify product, shipment, batch exist
 * 2. Create inventory_units (one per physical tire)
 * 3. Generate unique barcodes using PostgreSQL sequence
 * 4. Create QR codes with traceability URLs
 * 5. Save barcodes to database
 * ============================================================================
 */

import crypto from 'node:crypto';
import QRCode from 'qrcode';
import supabaseAdmin from '../config/supabaseAdmin.js';

const TRACE_BASE_URL = process.env.TRACE_BASE_URL || 'http://localhost:5173/trace';
const BARCODE_PREFIX = 'RIC';

/**
 * Generate barcode value from sequence number
 * Format: RIC000000000001, RIC000000000002, etc.
 */
function generateBarcodeValue(sequence) {
  return `${BARCODE_PREFIX}${String(sequence).padStart(12, '0')}`;
}

/**
 * Create traceability URL for QR code
 * Example: http://localhost:5173/trace/RIC000000000001
 */
function createTraceabilityUrl(barcodeValue) {
  return `${TRACE_BASE_URL}/${encodeURIComponent(barcodeValue)}`;
}

/**
 * Get next barcode sequence from PostgreSQL
 * Uses sequence for concurrent-safe generation
 */
async function getNextBarcodeSequence() {
  const { data, error } = await supabaseAdmin
    .rpc('get_next_barcode_sequence');

  if (error) {
    throw new Error(`Failed to generate barcode sequence: ${error.message}`);
  }

  return Number(data);
}

/**
 * Main service function: Create barcodes with complete traceability
 * Uses transaction-safe PostgreSQL RPC for atomic operation
 * 
 * @param {Object} params
 * @param {string} params.productId - Product UUID
 * @param {string} params.batchId - Batch UUID
 * @param {string} params.shipmentId - Shipment UUID
 * @param {number} params.quantity - Number of barcodes to generate (1-5000)
 * @returns {Object} Created barcodes with traceability info
 */
export async function createBarcodes({
  productId,
  batchId,
  shipmentId,
  quantity
}) {
  // ---------------------------------------------------------
  // 1. VALIDATION
  // ---------------------------------------------------------
  if (!productId) {
    throw new Error('productId is required');
  }

  if (!batchId) {
    throw new Error('batchId is required');
  }

  if (!shipmentId) {
    throw new Error('shipmentId is required');
  }

  const parsedQuantity = Number(quantity);
  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity < 1 ||
    parsedQuantity > 5000
  ) {
    throw new Error('quantity must be an integer between 1 and 5000');
  }

  console.log(`📦 Generating ${parsedQuantity} barcodes via transaction-safe RPC...`);

  // ---------------------------------------------------------
  // 2. CALL TRANSACTION-SAFE RPC
  // ---------------------------------------------------------
  // This creates inventory units + barcodes atomically in PostgreSQL
  // If any step fails, entire operation rolls back
  const { data, error } = await supabaseAdmin.rpc(
    'create_inventory_barcodes',
    {
      p_product_id: productId,
      p_batch_id: batchId,
      p_shipment_id: shipmentId,
      p_quantity: parsedQuantity
    }
  );

  if (error) {
    console.error('❌ Supabase RPC error:', error);
    throw new Error(error.message || 'Failed to generate barcodes');
  }

  if (!data?.success) {
    throw new Error('Barcode generation failed');
  }

  console.log(`✅ RPC completed: ${data.quantity} barcodes created`);

  // ---------------------------------------------------------
  // 3. GENERATE QR CODES FOR EACH BARCODE
  // ---------------------------------------------------------
  // QR generation happens in Node.js (not in PostgreSQL)
  // This is cleaner separation of concerns
  console.log(`🔄 Generating QR codes for ${data.barcodes.length} barcodes...`);

  const barcodesWithQR = await Promise.all(
    data.barcodes.map(async (barcode) => {
      try {
        const qrCodeData = await QRCode.toDataURL(
          barcode.traceability_url,
          {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 300
          }
        );

        // Update barcode with QR code data
        await supabaseAdmin
          .from('barcodes')
          .update({ qr_code_data: qrCodeData })
          .eq('id', barcode.barcode_id);

        return {
          ...barcode,
          qr_code_data: qrCodeData
        };
      } catch (qrError) {
        console.error(`⚠️ QR generation failed for ${barcode.barcode_value}:`, qrError);
        return barcode; // Return without QR if generation fails
      }
    })
  );

  console.log(`✅ QR codes generated successfully`);

  // ---------------------------------------------------------
  // 4. RETURN COMPLETE RESULT
  // ---------------------------------------------------------
  return {
    success: true,
    product_id: data.product_id,
    product_sku: data.product_sku,
    product_name: data.product_name,
    batch_id: data.batch_id,
    batch_number: data.batch_number,
    shipment_id: data.shipment_id,
    shipment_number: data.shipment_number,
    container_number: data.container_number,
    bl_number: data.bl_number,
    quantity: data.quantity,
    barcodes: barcodesWithQR,
    summary: {
      total_barcodes: barcodesWithQR.length,
      total_inventory_units: barcodesWithQR.length,
      barcode_range: barcodesWithQR.length > 0 ? {
        first: barcodesWithQR[0].barcode_value,
        last: barcodesWithQR[barcodesWithQR.length - 1].barcode_value
      } : null,
      shipment_number: data.shipment_number,
      container_number: data.container_number,
      bl_number: data.bl_number,
      batch_number: data.batch_number
    }
  };
}

/**
 * Get barcodes with full traceability information
 * Returns empty array until schema cache is ready
 * 
 * @param {Object} params
 * @param {number} params.limit - Max number of barcodes to return
 * @returns {Array} Barcodes with nested product, batch, shipment info
 */
export async function getBarcodes({ limit }) {
  // If limit is provided, use it; otherwise fetch all barcodes
  const useLimit = limit !== undefined;
  const safeLimit = useLimit ? Number(limit) : 10000; // High default for "all"

  try {
    // Try using RPC function first
    const { data: rpcData, error: rpcError } = await supabaseAdmin
      .rpc('get_barcodes_with_traceability', { p_limit: safeLimit });

    if (!rpcError && rpcData && rpcData.length > 0) {
      // Transform RPC result to expected format
      return rpcData.map(row => ({
        id: row.barcode_id,
        barcode_value: row.barcode_value,
        barcode_type: row.barcode_type,
        traceability_url: row.traceability_url,
        qr_code_data: row.qr_code_data,
        status: row.status,
        created_at: row.created_at,
        products: row.product_id ? {
          id: row.product_id,
          sku: row.product_sku,
          brand: row.product_brand,
          model: row.product_model
        } : null,
        batches: row.batch_id ? {
          id: row.batch_id,
          batch_number: row.batch_number,
          shipments: row.shipment_number ? {
            container_number: row.container_number,
            bl_number: row.bl_number,
            shipment_number: row.shipment_number,
            suppliers: row.supplier_name ? {
              name: row.supplier_name
            } : null
          } : null
        } : null,
        inventory_units: row.inventory_unit_id ? {
          id: row.inventory_unit_id,
          inventory_unit_code: row.inventory_unit_code,
          status: row.unit_status
        } : null
      }));
    }

    // Fallback: Query table directly
    console.warn('⚠️ RPC not available, using direct table query');
    console.log('Attempting to query barcodes table...');
    
    const query = supabaseAdmin
      .from('barcodes')
      .select(`
        id,
        barcode_value,
        barcode_type,
        traceability_url,
        qr_code_data,
        status,
        created_at,
        product_id,
        batch_id,
        inventory_unit_id
      `)
      .order('created_at', { ascending: false });
    
    // Only apply limit if explicitly provided
    if (useLimit) {
      query.limit(safeLimit);
    }
    
    const { data: tableData, error: tableError } = await query;

    console.log('Query result:', { 
      hasData: !!tableData, 
      count: tableData?.length || 0,
      hasError: !!tableError,
      errorMsg: tableError?.message 
    });

    if (tableError) {
      console.error('❌ Table query error:', tableError);
      return [];
    }

    if (!tableData || tableData.length === 0) {
      return [];
    }

    // Return simplified format (without joins)
    return tableData.map(row => ({
      id: row.id,
      barcode_value: row.barcode_value,
      barcode_type: row.barcode_type,
      traceability_url: row.traceability_url,
      qr_code_data: row.qr_code_data,
      status: row.status,
      created_at: row.created_at,
      product_id: row.product_id,
      batch_id: row.batch_id,
      inventory_unit_id: row.inventory_unit_id
    }));
  } catch (err) {
    console.error('❌ getBarcodes error:', err.message);
    // Return empty array instead of crashing
    return [];
  }
}

/**
 * Get complete traceability for a single barcode
 * Used by QR code scanning
 * 
 * @param {string} barcodeValue - Barcode value (e.g., RIC000000000001)
 * @returns {Object} Complete traceability chain
 */
export async function getTraceability(barcodeValue) {
  if (!barcodeValue) {
    throw new Error('Barcode value is required');
  }

  const { data, error } = await supabaseAdmin
    .from('barcodes')
    .select(`
      id,
      barcode_value,
      barcode_type,
      traceability_url,
      qr_code_data,
      status,
      created_at,
      products (
        id,
        sku,
        brand,
        model,
        product_name,
        dimensions,
        category
      ),
      batches (
        id,
        batch_number,
        batch_month,
        batch_year,
        manufactured_date,
        expiry_date,
        status,
        shipments:shipment_id (
          id,
          shipment_number,
          container_number,
          bl_number,
          expected_quantity,
          actual_quantity,
          expected_arrival_date,
          received_date,
          status,
          suppliers:supplier_id (
            id,
            name,
            supplier_code,
            contact_person,
            email,
            phone
          )
        )
      ),
      inventory_units (
        id,
        inventory_unit_code,
        quantity,
        status,
        warehouse_id,
        level,
        rack,
        shelf,
        section,
        received_at,
        last_scanned_at,
        warehouses:warehouse_id (
          id,
          name,
          code,
          location
        )
      )
    `)
    .eq('barcode_value', barcodeValue)
    .single();

  if (error || !data) {
    throw new Error(`Barcode not found: ${barcodeValue}`);
  }

  return data;
}

/**
 * Deactivate a barcode (soft delete - preserves for returns/rejection)
 * NEVER hard-delete barcodes
 * 
 * @param {string} barcodeId - Barcode UUID
 * @returns {Object} Updated barcode
 */
export async function deactivateBarcode(barcodeId) {
  if (!barcodeId) {
    throw new Error('Barcode ID is required');
  }

  const { data, error } = await supabaseAdmin
    .from('barcodes')
    .update({
      status: 'inactive',
      updated_at: new Date().toISOString()
    })
    .eq('id', barcodeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to deactivate barcode: ${error.message}`);
  }

  return data;
}
