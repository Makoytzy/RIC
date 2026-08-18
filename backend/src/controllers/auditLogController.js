import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function listAuditLogs(req, res, next) {
  try {
    const { category, severity, search, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('activity_log')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (category && category !== 'All Categories') {
      query = query.eq('category', category);
    }
    if (severity && severity !== 'All Severities') {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;
    if (error) throw error;

    let logs = data || [];

    // Map user details cleanly
    logs = logs.map(l => ({
      id: l.id,
      action: l.action,
      category: l.category || 'System',
      severity: l.severity || 'info',
      user: l.users?.full_name || 'System Operator',
      userEmail: l.users?.email || 'system@ric.com',
      details: l.details || 'System event recorded',
      timestamp: l.created_at,
      ipAddress: l.ip_address || '127.0.0.1',
      metadata: l.metadata || {},
    }));

    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.action?.toLowerCase().includes(q) ||
        l.user?.toLowerCase().includes(q) ||
        l.userEmail?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q) ||
        l.ipAddress?.includes(q)
      );
    }

    return res.json({ logs });
  } catch (err) {
    logger.error('Error listing audit logs:', err);
    return next(err);
  }
}

export async function createAuditLog(req, res, next) {
  try {
    const { action, category, severity, details, metadata } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    const { data, error } = await supabaseAdmin
      .from('activity_log')
      .insert({
        user_id: req.user?.id || null,
        action: action || 'system.manual_event',
        category: category || 'System',
        severity: severity || 'info',
        details: details || 'Manual event logged',
        ip_address: ipAddress,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ log: data });
  } catch (err) {
    logger.error('Error creating audit log:', err);
    return next(err);
  }
}
