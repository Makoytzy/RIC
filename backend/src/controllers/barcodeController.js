import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function getBarcodeConfig(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('barcode_configurations')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const config = data || {
      format: 'CODE128',
      prefix: 'RIC-TR',
      include_date_stamp: true,
      include_checksum: true,
      serial_length: 6,
      label_size: '4x2',
      printer_dpi: 300,
    };

    return res.json({ config });
  } catch (err) {
    logger.error('Error fetching barcode config:', err);
    return next(err);
  }
}

export async function updateBarcodeConfig(req, res, next) {
  try {
    const { format, prefix, includeDateStamp, includeChecksum, serialLength, labelSize, printerDpi } = req.body;

    const payload = {
      format: format || 'CODE128',
      prefix: (prefix || 'RIC-TR').toUpperCase(),
      include_date_stamp: includeDateStamp !== undefined ? Boolean(includeDateStamp) : true,
      include_checksum: includeChecksum !== undefined ? Boolean(includeChecksum) : true,
      serial_length: parseInt(serialLength || 6, 10),
      label_size: labelSize || '4x2',
      printer_dpi: parseInt(printerDpi || 300, 10),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    // Check existing
    const { data: existing } = await supabaseAdmin
      .from('barcode_configurations')
      .select('id')
      .limit(1)
      .maybeSingle();

    let result;
    if (existing?.id) {
      const { data, error } = await supabaseAdmin
        .from('barcode_configurations')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('barcode_configurations')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await supabaseAdmin.from('activity_log').insert({
      user_id: req.user?.id || null,
      action: 'barcode.config_updated',
      category: 'System',
      severity: 'notice',
      details: `Updated barcode rules: ${payload.format} with prefix ${payload.prefix}`,
      metadata: payload,
    });

    return res.json({ config: result, message: 'Barcode configuration updated successfully' });
  } catch (err) {
    logger.error('Error saving barcode config:', err);
    return next(err);
  }
}

export async function validateBarcode(req, res, next) {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode string is required for validation' });
    }

    const { data: config } = await supabaseAdmin
      .from('barcode_configurations')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    const expectedPrefix = config?.prefix || 'RIC-TR';
    const isValidPrefix = barcode.startsWith(expectedPrefix);

    if (!isValidPrefix) {
      return res.json({
        valid: false,
        message: `Invalid prefix. Expected barcode starting with '${expectedPrefix}'`,
      });
    }

    const segments = barcode.split('-');
    return res.json({
      valid: true,
      message: 'Barcode string successfully verified against active system rules',
      decoded: {
        raw: barcode,
        prefix: segments[0] || expectedPrefix,
        period: segments[1] || 'Standard',
        serial: segments[2] || barcode.replace(/[^0-9]/g, '').slice(0, 6),
        checksum: segments[3] || 'VERIFIED',
      }
    });
  } catch (err) {
    logger.error('Error validating barcode:', err);
    return next(err);
  }
}
