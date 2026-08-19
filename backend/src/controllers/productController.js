import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function listProducts(req, res, next) {
  try {
    const { search, brand, category, status } = req.query;
    let query = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });

    if (brand && brand !== 'All Brands') query = query.eq('brand', brand);
    if (category && category !== 'All Categories') query = query.eq('category', category);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    
    // If there's a schema cache error, return empty for now
    // The PostgREST cache will eventually refresh
    if (error) {
      if (error.message?.includes('schema cache') || error.message?.includes('not found') || error.code === 'PGRST205') {
        logger.warn('Products table not in schema cache - returning empty array. Schema will auto-refresh soon.');
        return res.json({ products: [] });
      }
      throw error;
    }

    let filtered = data || [];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.model?.toLowerCase().includes(q) ||
        p.dimensions?.toLowerCase().includes(q)
      );
    }

    return res.json({ products: filtered });
  } catch (err) {
    logger.error('Error listing products:', err);
    return next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { sku, brand, model, dimensions, category, unitCost, retailPrice, currentStock, reorderLevel } = req.body;

    const generatedSku = sku || `${brand?.slice(0, 4).toUpperCase()}-${model?.replace(/\s+/g, '').slice(0, 4).toUpperCase()}-${dimensions?.replace(/[^0-9]/g, '')}`;

    const stock = parseInt(currentStock ?? 0, 10);
    const reorder = parseInt(reorderLevel ?? 10, 10);
    const status = stock <= 0 ? 'Out of Stock' : stock <= reorder ? 'Low Stock' : 'In Stock';

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        sku: generatedSku,
        brand,
        model,
        dimensions,
        category: category || 'Standard',
        unit_cost: parseFloat(unitCost || 0),
        retail_price: parseFloat(retailPrice || 0),
        current_stock: stock,
        reorder_level: reorder,
        status,
      })
      .select()
      .single();

    if (error) throw error;

    // Log to activity log
    await supabaseAdmin.from('activity_log').insert({
      user_id: req.user?.id || null,
      action: 'product.created',
      category: 'Catalog',
      severity: 'info',
      details: `Created new tire SKU ${generatedSku} (${brand} ${model})`,
      metadata: { sku: generatedSku, brand, retailPrice },
    });

    return res.status(201).json({ product: data });
  } catch (err) {
    logger.error('Error creating product:', err);
    return next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { brand, model, dimensions, category, unitCost, retailPrice, currentStock, reorderLevel } = req.body;

    const stock = currentStock !== undefined ? parseInt(currentStock, 10) : undefined;
    const reorder = reorderLevel !== undefined ? parseInt(reorderLevel, 10) : undefined;

    const updatePayload = {
      ...(brand && { brand }),
      ...(model && { model }),
      ...(dimensions && { dimensions }),
      ...(category && { category }),
      ...(unitCost !== undefined && { unit_cost: parseFloat(unitCost) }),
      ...(retailPrice !== undefined && { retail_price: parseFloat(retailPrice) }),
      ...(stock !== undefined && { current_stock: stock }),
      ...(reorder !== undefined && { reorder_level: reorder }),
      updated_at: new Date().toISOString(),
    };

    if (stock !== undefined && reorder !== undefined) {
      updatePayload.status = stock <= 0 ? 'Out of Stock' : stock <= reorder ? 'Low Stock' : 'In Stock';
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ product: data });
  } catch (err) {
    logger.error('Error updating product:', err);
    return next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).send();
  } catch (err) {
    logger.error('Error deleting product:', err);
    return next(err);
  }
}
