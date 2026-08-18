import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function listEmployees(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to include phone and assigned_warehouse from metadata
    const employees = (data || []).map(emp => ({
      ...emp,
      phone: emp.metadata?.phone || null,
      assigned_warehouse: emp.metadata?.assigned_warehouse || null
    }));

    return res.json({ employees });
  } catch (err) {
    logger.error('Error listing employees:', err);
    return next(err);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const { fullName, email, phone, employeeCode, role, department, assignedWarehouse } = req.body;

    const code = employeeCode || `EMP-${department === 'Warehouse Operations' ? 'WH' : 'OP'}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Store phone and assignedWarehouse in metadata since they're not in the schema
    const metadata = {};
    if (phone) metadata.phone = phone;
    if (assignedWarehouse) metadata.assigned_warehouse = assignedWarehouse;

    const { data, error } = await supabaseAdmin
      .from('employees')
      .insert({
        full_name: fullName,
        email: email.trim().toLowerCase(),
        employee_code: code,
        employee_position: role || 'operational_staff',
        department: department || 'Warehouse Operations',
        is_used: false,
        metadata: metadata
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('audit_log').insert({
      user_id: req.user?.id || null,
      action: 'employee.registered',
      category: 'Security',
      severity: 'info',
      details: `Generated onboarding employee badge ${code} for ${fullName}`,
      metadata: { employeeCode: code, email, department },
    });

    return res.status(201).json({ employee: data });
  } catch (err) {
    logger.error('Error creating employee code:', err);
    return next(err);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('employees').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).send();
  } catch (err) {
    logger.error('Error deleting employee:', err);
    return next(err);
  }
}
