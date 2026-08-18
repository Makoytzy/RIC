import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function getSettings(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*');

    if (error) throw error;

    const formatted = {};
    (data || []).forEach(row => {
      formatted[row.category] = row.settings;
    });

    // Provide complete defaults if table is empty
    const defaults = {
      company: {
        companyName: 'Red Indian Customs & Tire Logistics',
        taxId: 'RIC-PH-98214-X',
        supportEmail: 'ops@redindiancustoms.com',
        supportPhone: '+1 (555) 782-9011',
        headquarters: '104 Industrial Sector Parkway, North Hub',
        defaultCurrency: 'USD ($)',
        systemTimezone: 'Asia/Manila (UTC+08:00)',
      },
      security: {
        requireMFA: true,
        sessionTimeoutMinutes: 45,
        maxLoginAttempts: 5,
        enforceStrongPasswords: true,
        auditLoggingLevel: 'Verbose',
      },
      notifications: {
        emailAlertLowStock: true,
        emailAlertDiscrepancy: true,
        discordWebhookUrl: 'https://discord.com/api/webhooks/12345/ric-alerts',
        discordAlertsEnabled: false,
        soundAlertsOnScan: true,
      },
      database: {
        autoBackupDaily: true,
        backupRetentionDays: 30,
        cloudSyncBucket: 'gs://ric-db-backups-primary',
        lastBackupTimestamp: '2024-08-18 03:00:00 UTC',
      }
    };

    return res.json({ settings: { ...defaults, ...formatted } });
  } catch (err) {
    logger.error('Error fetching system settings:', err);
    return next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const { category, settings } = req.body;
    if (!category || !settings) {
      return res.status(400).json({ error: 'Category and settings payload are required' });
    }

    const { data: existing } = await supabaseAdmin
      .from('system_settings')
      .select('id')
      .eq('category', category)
      .maybeSingle();

    let result;
    if (existing?.id) {
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .update({
          settings,
          updated_at: new Date().toISOString(),
          updated_by: req.user?.id || null,
        })
        .eq('category', category)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .insert({
          category,
          settings,
          updated_by: req.user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await supabaseAdmin.from('activity_log').insert({
      user_id: req.user?.id || null,
      action: 'settings.updated',
      category: 'System',
      severity: 'notice',
      details: `Updated settings for category "${category}"`,
      metadata: { category, settings },
    });

    return res.json({ success: true, settings: result });
  } catch (err) {
    logger.error('Error updating system settings:', err);
    return next(err);
  }
}
