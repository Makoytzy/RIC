/**
 * ============================================================================
 * SHIPMENT CONTROLLER
 * ============================================================================
 * Handles shipment CRUD operations for incoming tire shipments
 * ============================================================================
 */

import supabaseAdmin from '../config/supabaseAdmin.js';

/**
 * Get all shipments with filters
 * @route GET /api/shipments
 */
export async function getShipments(req, res) {
  try {
    const { status, supplier_id, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('shipments')
      .select(`
        *,
        suppliers:supplier_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        received_by_user:users!shipments_received_by_fkey (
          id,
          email,
          full_name
        ),
        inspected_by_user:users!shipments_inspected_by_fkey (
          id,
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (supplier_id) {
      query = query.eq('supplier_id', supplier_id);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching shipments:', error);
      return res.status(500).json({
        error: 'Failed to fetch shipments',
        details: error.message
      });
    }

    res.json({
      success: true,
      shipments: data || [],
      total: count || data?.length || 0
    });
  } catch (err) {
    console.error('getShipments error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}

/**
 * Get single shipment by ID
 * @route GET /api/shipments/:id
 */
export async function getShipmentById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('shipments')
      .select(`
        *,
        suppliers:supplier_id (
          id,
          name,
          contact_person,
          email,
          phone,
          address,
          city,
          country
        ),
        received_by_user:users!shipments_received_by_fkey (
          id,
          email,
          full_name
        ),
        inspected_by_user:users!shipments_inspected_by_fkey (
          id,
          email,
          full_name
        ),
        batches:id (
          id,
          batch_number,
          batch_month,
          batch_year,
          status,
          products:product_id (
            id,
            sku,
            brand,
            model,
            dimensions
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Shipment not found'
        });
      }
      console.error('Error fetching shipment:', error);
      return res.status(500).json({
        error: 'Failed to fetch shipment',
        details: error.message
      });
    }

    res.json({
      success: true,
      shipment: data
    });
  } catch (err) {
    console.error('getShipmentById error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}

/**
 * Create new shipment
 * @route POST /api/shipments
 */
export async function createShipment(req, res) {
  try {
    const {
      supplier_id,
      shipment_number,
      container_number,
      bl_number,
      expected_quantity,
      expected_arrival_date,
      notes
    } = req.body;

    // Validation
    if (!supplier_id) {
      return res.status(400).json({ error: 'supplier_id is required' });
    }

    if (!shipment_number) {
      return res.status(400).json({ error: 'shipment_number is required' });
    }

    if (!container_number) {
      return res.status(400).json({ error: 'container_number is required' });
    }

    // Create shipment
    const { data, error } = await supabaseAdmin
      .from('shipments')
      .insert({
        supplier_id,
        shipment_number,
        container_number,
        bl_number,
        expected_quantity: expected_quantity || 0,
        expected_arrival_date,
        status: 'PENDING',
        notes
      })
      .select(`
        *,
        suppliers:supplier_id (
          id,
          name,
          contact_person,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating shipment:', error);
      
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({
          error: 'Shipment number or container number already exists',
          details: error.message
        });
      }

      return res.status(500).json({
        error: 'Failed to create shipment',
        details: error.message
      });
    }

    res.status(201).json({
      success: true,
      shipment: data,
      message: 'Shipment created successfully'
    });
  } catch (err) {
    console.error('createShipment error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}

/**
 * Update shipment
 * @route PUT /api/shipments/:id
 */
export async function updateShipment(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabaseAdmin
      .from('shipments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        suppliers:supplier_id (
          id,
          name,
          contact_person,
          email
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Shipment not found'
        });
      }

      console.error('Error updating shipment:', error);
      return res.status(500).json({
        error: 'Failed to update shipment',
        details: error.message
      });
    }

    res.json({
      success: true,
      shipment: data,
      message: 'Shipment updated successfully'
    });
  } catch (err) {
    console.error('updateShipment error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}

/**
 * Mark shipment as received
 * @route POST /api/shipments/:id/receive
 */
export async function receiveShipment(req, res) {
  try {
    const { id } = req.params;
    const { actual_quantity, notes } = req.body;
    const userId = req.user?.id; // From auth middleware

    const { data, error } = await supabaseAdmin
      .from('shipments')
      .update({
        status: 'RECEIVED',
        actual_quantity: actual_quantity || 0,
        received_date: new Date().toISOString(),
        received_by: userId,
        notes: notes || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error receiving shipment:', error);
      return res.status(500).json({
        error: 'Failed to receive shipment',
        details: error.message
      });
    }

    res.json({
      success: true,
      shipment: data,
      message: 'Shipment marked as received'
    });
  } catch (err) {
    console.error('receiveShipment error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}

/**
 * Delete shipment (soft delete by setting status to CANCELLED)
 * @route DELETE /api/shipments/:id
 */
export async function deleteShipment(req, res) {
  try {
    const { id } = req.params;

    // Check if shipment has batches
    const { data: batches } = await supabaseAdmin
      .from('batches')
      .select('id')
      .eq('shipment_id', id)
      .limit(1);

    if (batches && batches.length > 0) {
      return res.status(409).json({
        error: 'Cannot delete shipment with existing batches',
        message: 'Please delete all batches first'
      });
    }

    // Soft delete by setting status to CANCELLED
    const { data, error } = await supabaseAdmin
      .from('shipments')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting shipment:', error);
      return res.status(500).json({
        error: 'Failed to delete shipment',
        details: error.message
      });
    }

    res.json({
      success: true,
      message: 'Shipment cancelled successfully'
    });
  } catch (err) {
    console.error('deleteShipment error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
}
