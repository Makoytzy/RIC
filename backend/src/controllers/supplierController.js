import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Supplier Controller
 * Handles supplier management operations
 */

export const getSuppliers = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      suppliers: data || [],
      message: 'Suppliers retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({
      supplier: data,
      message: 'Supplier retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplierData = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        ...supplierData,
        created_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'supplier_created',
      entity_type: 'supplier',
      entity_id: data.id,
      details: supplierData
    });

    res.status(201).json({
      supplier: data,
      message: 'Supplier created successfully'
    });
  } catch (error) {
    logger.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('suppliers')
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
      action: 'supplier_updated',
      entity_type: 'supplier',
      entity_id: id,
      details: updateData
    });

    res.json({
      supplier: data,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    logger.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'supplier_deleted',
      entity_type: 'supplier',
      entity_id: id
    });

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    logger.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};
