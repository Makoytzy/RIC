import { supabaseAdmin as supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Warehouse Controller
 * Handles receiving, inspection, picking, packing, and warehouse locations
 */

// ── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Returns true when the Supabase / PostgREST error indicates the table
 * does not exist yet (migration not run).
 */
function isTableMissingError(error) {
  const msg  = (error?.message || '').toLowerCase();
  const hint = (error?.hint    || '').toLowerCase();
  const code =  error?.code    || '';
  return (
    code === '42P01'    ||
    code === 'PGRST116' ||
    code === 'PGRST200' ||
    code === 'PGRST205' ||   // schema cache miss
    msg.includes('does not exist') ||
    msg.includes('relation')       ||
    msg.includes('schema cache')   ||
    hint.includes('does not exist')||
    hint.includes('relation')
  );
}

/** UUID v4 regex — rejects plain integers like '3' before they hit the DB. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id) {
  return UUID_RE.test(id);
}


// ============================================
// RECEIVING
// ============================================

export const getReceivingShipments = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('shipments')
      .select('*')
      .order('expected_date', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      shipments: data || [],
      message: 'Shipments retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
};

export const receiveShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualQuantity, condition, notes, location } = req.body;
    const userId = req.user.id;

    // Update shipment status
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .update({
        status: 'received',
        actual_quantity: actualQuantity,
        condition,
        notes,
        storage_location: location,
        received_by: userId,
        received_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (shipmentError) throw shipmentError;

    // Log the receiving activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'shipment_received',
      entity_type: 'shipment',
      entity_id: id,
      details: { actualQuantity, condition, location }
    });

    res.json({
      shipment,
      message: 'Shipment received successfully'
    });
  } catch (error) {
    logger.error('Error receiving shipment:', error);
    res.status(500).json({ error: 'Failed to receive shipment' });
  }
};

// ============================================
// WAREHOUSE LOCATIONS
// ============================================

export const getLocations = async (req, res) => {
  try {
    const { zone, status } = req.query;

    let query = supabase
      .from('warehouse_locations')
      .select('*')
      .order('code', { ascending: true });

    if (zone) query = query.eq('zone', zone);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      // Log the full error so we can diagnose exactly what's happening
      logger.error('Supabase error fetching warehouse_locations:', {
        code:    error.code,
        message: error.message,
        details: error.details,
        hint:    error.hint,
      });

      // If the table simply doesn't exist yet (migration 008 not run),
      // return an empty list rather than crashing with a 500.
      // Supabase / PostgREST can return the table-missing error in several ways:
      //   - PostgreSQL code 42P01 (undefined_table)
      //   - HTTP 404 from PostgREST with code "PGRST116" or "PGRST200"
      //   - message containing "does not exist", "relation", or "schema cache"
      const errorMsg  = (error.message  || '').toLowerCase();
      const errorCode = (error.code     || '');
      const errorHint = (error.hint     || '').toLowerCase();

      const isTableMissing =
        errorCode === '42P01'                         ||  // pg: undefined_table
        errorCode === 'PGRST116'                      ||  // postgrest: not found
        errorCode === 'PGRST200'                      ||  // postgrest: schema cache miss
        errorMsg.includes('does not exist')           ||
        errorMsg.includes('relation')                 ||
        errorMsg.includes('schema cache')             ||
        errorHint.includes('does not exist')          ||
        errorHint.includes('relation');

      if (isTableMissing) {
        logger.warn('warehouse_locations table not found — run migration 008_warehouse_locations.sql in Supabase');
        return res.json({ locations: [], message: 'Locations table not configured yet' });
      }

      throw error;
    }

    // Map snake_case DB columns → camelCase for the frontend
    const locations = (data || []).map((row) => ({
      id:           row.id,
      code:         row.code,
      name:         row.name,
      zone:         row.zone,
      aisle:        row.aisle,
      rack:         row.rack,
      shelf:        row.shelf,
      capacity:     row.capacity,
      currentStock: row.current_stock,   // ← snake_case → camelCase
      status:       row.status,
      createdAt:    row.created_at,
      updatedAt:    row.updated_at,
    }));

    res.json({
      locations,
      message: 'Locations retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};


export const createLocation = async (req, res) => {
  try {
    const { currentStock, ...rest } = req.body;
    const userId = req.user.id;

    // Translate camelCase → snake_case for DB insert
    const dbPayload = {
      ...rest,
      ...(currentStock !== undefined && { current_stock: Number(currentStock) }),
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('warehouse_locations')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      logger.error('Supabase error creating location:', { code: error.code, message: error.message });
      if (isTableMissingError(error)) {
        return res.status(503).json({ error: 'Warehouse locations table not configured yet. Run migration 008_warehouse_locations.sql in Supabase.' });
      }
      throw error;
    }

    // Log activity (best-effort — don't fail the request if activity_log is missing)
    try {
      await supabase.from('activity_log').insert({
        user_id: userId,
        action: 'location_created',
        entity_type: 'warehouse_location',
        entity_id: data.id,
        details: req.body,
      });
    } catch (logErr) {
      logger.warn('activity_log insert failed (non-fatal):', logErr.message);
    }

    res.status(201).json({
      location: { ...data, currentStock: data.current_stock },
      message: 'Location created successfully',
    });
  } catch (error) {
    logger.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Reject non-UUID ids (e.g. integer mock-data ids like '3')
    if (!isValidUUID(id)) {
      return res.status(400).json({ error: `Invalid location id: '${id}'. Expected a UUID.` });
    }

    const { currentStock, ...rest } = req.body;
    const userId = req.user.id;

    // Translate camelCase → snake_case for DB update
    const dbPayload = {
      ...rest,
      ...(currentStock !== undefined && { current_stock: Number(currentStock) }),
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('warehouse_locations')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Supabase error updating location:', { code: error.code, message: error.message });
      if (isTableMissingError(error)) {
        return res.status(503).json({ error: 'Warehouse locations table not configured yet. Run migration 008_warehouse_locations.sql in Supabase.' });
      }
      throw error;
    }

    // Log activity (best-effort)
    try {
      await supabase.from('activity_log').insert({
        user_id: userId,
        action: 'location_updated',
        entity_type: 'warehouse_location',
        entity_id: id,
        details: req.body,
      });
    } catch (logErr) {
      logger.warn('activity_log insert failed (non-fatal):', logErr.message);
    }

    res.json({
      location: { ...data, currentStock: data.current_stock },
      message: 'Location updated successfully',
    });
  } catch (error) {
    logger.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Reject non-UUID ids (e.g. integer mock-data ids like '3')
    if (!isValidUUID(id)) {
      return res.status(400).json({ error: `Invalid location id: '${id}'. Expected a UUID. This location exists only as mock data and cannot be deleted from the database.` });
    }

    const userId = req.user.id;

    const { error } = await supabase
      .from('warehouse_locations')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Supabase error deleting location:', { code: error.code, message: error.message });
      if (isTableMissingError(error)) {
        return res.status(503).json({ error: 'Warehouse locations table not configured yet. Run migration 008_warehouse_locations.sql in Supabase.' });
      }
      throw error;
    }

    // Log activity (best-effort)
    try {
      await supabase.from('activity_log').insert({
        user_id: userId,
        action: 'location_deleted',
        entity_type: 'warehouse_location',
        entity_id: id,
      });
    } catch (logErr) {
      logger.warn('activity_log insert failed (non-fatal):', logErr.message);
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    logger.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
};

// ============================================
// INSPECTION
// ============================================

export const getInspectionQueue = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('status', 'received')
      .is('inspection_completed', false)
      .order('received_date', { ascending: true });

    if (error) throw error;

    res.json({
      items: data || [],
      message: 'Inspection queue retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching inspection queue:', error);
    res.status(500).json({ error: 'Failed to fetch inspection queue' });
  }
};

export const completeInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const { qualityStatus, defects, notes } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('shipments')
      .update({
        inspection_completed: true,
        quality_status: qualityStatus,
        defects,
        inspection_notes: notes,
        inspected_by: userId,
        inspection_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'inspection_completed',
      entity_type: 'shipment',
      entity_id: id,
      details: { qualityStatus, defects, notes }
    });

    res.json({
      item: data,
      message: 'Inspection completed successfully'
    });
  } catch (error) {
    logger.error('Error completing inspection:', error);
    res.status(500).json({ error: 'Failed to complete inspection' });
  }
};

// ============================================
// PICKING
// ============================================

export const getPickingTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('picking_tasks')
      .select('*, orders(*)')
      .order('created_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      tasks: data || [],
      message: 'Picking tasks retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching picking tasks:', error);
    res.status(500).json({ error: 'Failed to fetch picking tasks' });
  }
};

export const completePicking = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualQuantity, notes } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('picking_tasks')
      .update({
        status: 'completed',
        actual_quantity: actualQuantity,
        notes,
        picked_by: userId,
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'picking_completed',
      entity_type: 'picking_task',
      entity_id: id,
      details: { actualQuantity, notes }
    });

    res.json({
      task: data,
      message: 'Picking task completed successfully'
    });
  } catch (error) {
    logger.error('Error completing picking:', error);
    res.status(500).json({ error: 'Failed to complete picking' });
  }
};

// ============================================
// PACKING
// ============================================

export const getPackingTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('packing_tasks')
      .select('*, orders(*)')
      .order('created_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      tasks: data || [],
      message: 'Packing tasks retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching packing tasks:', error);
    res.status(500).json({ error: 'Failed to fetch packing tasks' });
  }
};

export const completePacking = async (req, res) => {
  try {
    const { id } = req.params;
    const { packageWeight, dimensions, notes } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('packing_tasks')
      .update({
        status: 'completed',
        package_weight: packageWeight,
        dimensions,
        notes,
        packed_by: userId,
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'packing_completed',
      entity_type: 'packing_task',
      entity_id: id,
      details: { packageWeight, dimensions, notes }
    });

    res.json({
      task: data,
      message: 'Packing task completed successfully'
    });
  } catch (error) {
    logger.error('Error completing packing:', error);
    res.status(500).json({ error: 'Failed to complete packing' });
  }
};

// ============================================
// WAREHOUSE FACILITIES
// ============================================

export const getFacilities = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      warehouses: data || [],
      message: 'Warehouse facilities retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching facilities:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse facilities' });
  }
};

export const createFacility = async (req, res) => {
  try {
    const { code, name, location, totalSlots, levelsData } = req.body;

    const { data, error } = await supabase
      .from('warehouses')
      .insert({
        code,
        name,
        location,
        total_slots: parseInt(totalSlots || 500, 10),
        occupied_slots: 0,
        status: 'active',
        levels_data: levelsData || [],
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_log').insert({
      user_id: req.user?.id || null,
      action: 'warehouse.facility_created',
      category: 'Facilities',
      severity: 'notice',
      details: `Created new warehouse facility: ${name} (${code})`,
      metadata: { code, name, totalSlots },
    });

    res.status(201).json({
      facility: data,
      message: 'Warehouse facility created successfully'
    });
  } catch (error) {
    logger.error('Error creating facility:', error);
    res.status(500).json({ error: 'Failed to create warehouse facility' });
  }
};

