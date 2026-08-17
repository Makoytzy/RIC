import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Warehouse Controller
 * Handles receiving, inspection, picking, packing, and warehouse locations
 */

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

    if (error) throw error;

    res.json({
      locations: data || [],
      message: 'Locations retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

export const createLocation = async (req, res) => {
  try {
    const locationData = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('warehouse_locations')
      .insert({
        ...locationData,
        created_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'location_created',
      entity_type: 'warehouse_location',
      entity_id: data.id,
      details: locationData
    });

    res.status(201).json({
      location: data,
      message: 'Location created successfully'
    });
  } catch (error) {
    logger.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('warehouse_locations')
      .update({
        ...updateData,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'location_updated',
      entity_type: 'warehouse_location',
      entity_id: id,
      details: updateData
    });

    res.json({
      location: data,
      message: 'Location updated successfully'
    });
  } catch (error) {
    logger.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('warehouse_locations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'location_deleted',
      entity_type: 'warehouse_location',
      entity_id: id
    });

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
