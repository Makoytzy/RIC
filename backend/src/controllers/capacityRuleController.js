import { supabaseAdmin } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function listCapacityRules(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tire_capacity_rules')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return res.json({ rules: data || [] });
  } catch (err) {
    logger.error('Error listing capacity rules:', err);
    return next(err);
  }
}

export async function createCapacityRule(req, res, next) {
  try {
    const { name, rimRange, sectionWidthMax, maxStackHeight, shelfCapacity, allowedLevels, safetyWeightLimitKg } = req.body;

    const { data, error } = await supabaseAdmin
      .from('tire_capacity_rules')
      .insert({
        name,
        rim_range: rimRange,
        section_width_max: parseInt(sectionWidthMax, 10),
        max_stack_height: parseInt(maxStackHeight, 10),
        shelf_capacity: parseInt(shelfCapacity, 10),
        allowed_levels: Array.isArray(allowedLevels) ? allowedLevels : [allowedLevels],
        safety_weight_limit_kg: parseInt(safetyWeightLimitKg || 400, 10),
        status: 'Active',
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('activity_log').insert({
      user_id: req.user?.id || null,
      action: 'capacity_rule.created',
      category: 'Facilities',
      severity: 'notice',
      details: `Created capacity rule "${name}" (${rimRange})`,
      metadata: { ruleId: data.id, name, rimRange },
    });

    return res.status(201).json({ rule: data });
  } catch (err) {
    logger.error('Error creating capacity rule:', err);
    return next(err);
  }
}

export async function updateCapacityRule(req, res, next) {
  try {
    const { id } = req.params;
    const { name, rimRange, sectionWidthMax, maxStackHeight, shelfCapacity, allowedLevels, safetyWeightLimitKg, status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('tire_capacity_rules')
      .update({
        ...(name && { name }),
        ...(rimRange && { rim_range: rimRange }),
        ...(sectionWidthMax && { section_width_max: parseInt(sectionWidthMax, 10) }),
        ...(maxStackHeight && { max_stack_height: parseInt(maxStackHeight, 10) }),
        ...(shelfCapacity && { shelf_capacity: parseInt(shelfCapacity, 10) }),
        ...(allowedLevels && { allowed_levels: Array.isArray(allowedLevels) ? allowedLevels : [allowedLevels] }),
        ...(safetyWeightLimitKg && { safety_weight_limit_kg: parseInt(safetyWeightLimitKg, 10) }),
        ...(status && { status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ rule: data });
  } catch (err) {
    logger.error('Error updating capacity rule:', err);
    return next(err);
  }
}

export async function deleteCapacityRule(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('tire_capacity_rules').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).send();
  } catch (err) {
    logger.error('Error deleting capacity rule:', err);
    return next(err);
  }
}
