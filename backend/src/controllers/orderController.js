import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Order Controller
 * Handles order management operations
 */

export const getOrders = async (req, res) => {
  try {
    const { status, priority } = req.query;

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      orders: data || [],
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      order: data,
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        created_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'order_created',
      entity_type: 'order',
      entity_id: data.id,
      details: orderData
    });

    res.status(201).json({
      order: data,
      message: 'Order created successfully'
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('orders')
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
      action: 'order_updated',
      entity_type: 'order',
      entity_id: id,
      details: updateData
    });

    res.json({
      order: data,
      message: 'Order updated successfully'
    });
  } catch (error) {
    logger.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
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
      action: 'order_status_updated',
      entity_type: 'order',
      entity_id: id,
      details: { status }
    });

    res.json({
      order: data,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'order_deleted',
      entity_type: 'order',
      entity_id: id
    });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    logger.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// ============================================
// RETURNS
// ============================================

export const getReturns = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('returns')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      returns: data || [],
      message: 'Returns retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching returns:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
};

export const createReturn = async (req, res) => {
  try {
    const returnData = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('returns')
      .insert({
        ...returnData,
        created_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: userId,
      action: 'return_created',
      entity_type: 'return',
      entity_id: data.id,
      details: returnData
    });

    res.status(201).json({
      return: data,
      message: 'Return created successfully'
    });
  } catch (error) {
    logger.error('Error creating return:', error);
    res.status(500).json({ error: 'Failed to create return' });
  }
};

export const updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('returns')
      .update({
        status,
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
      action: 'return_status_updated',
      entity_type: 'return',
      entity_id: id,
      details: { status }
    });

    res.json({
      return: data,
      message: 'Return status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating return status:', error);
    res.status(500).json({ error: 'Failed to update return status' });
  }
};
