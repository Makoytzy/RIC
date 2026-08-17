import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorMiddleware.js';

// ── Field mapping: camelCase (frontend) ↔ snake_case (database) ─
const toDb = (d) => ({
  name:           d.name,
  contact_person: d.contactPerson ?? d.contact_person,
  email:          d.email,
  phone:          d.phone,
  address:        d.address,
  city:           d.city,
  state:          d.state,
  zip_code:       d.zipCode ?? d.zip_code,
  country:        d.country,
  payment_terms:  d.paymentTerms ?? d.payment_terms,
  tax_id:         d.taxId ?? d.tax_id,
  status:         d.status ?? 'active',
  notes:          d.notes,
});

const toClient = (row) => ({
  id:            row.id,
  name:          row.name,
  contactPerson: row.contact_person,
  email:         row.email,
  phone:         row.phone,
  address:       row.address,
  city:          row.city,
  state:         row.state,
  zipCode:       row.zip_code,
  country:       row.country,
  paymentTerms:  row.payment_terms,
  taxId:         row.tax_id,
  status:        row.status,
  notes:         row.notes,
  totalOrders:   row.total_orders ?? 0,
  totalValue:    row.total_value  ?? 0,
  createdAt:     row.created_at,
  updatedAt:     row.updated_at,
});

// ── GET /api/suppliers ────────────────────────────────────────
export const getSuppliers = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);

    res.json({
      suppliers: (data || []).map(toClient),
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/suppliers/:id ────────────────────────────────────
export const getSupplierById = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Supplier not found' });

    res.json({ supplier: toClient(data) });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/suppliers ───────────────────────────────────────
export const createSupplier = async (req, res, next) => {
  try {
    const payload = { ...toDb(req.body), created_by: req.user.id };

    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .insert(payload)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({ supplier: toClient(data) });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/suppliers/:id ────────────────────────────────────
export const updateSupplier = async (req, res, next) => {
  try {
    const payload = {
      ...toDb(req.body),
      updated_by: req.user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('suppliers')
      .update(payload)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!data)  return res.status(404).json({ error: 'Supplier not found' });

    res.json({ supplier: toClient(data) });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/suppliers/:id ─────────────────────────────────
export const deleteSupplier = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('suppliers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw new AppError(error.message, 400);

    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    next(err);
  }
};
