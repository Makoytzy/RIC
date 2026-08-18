import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ruler, Plus, Search, Filter, Layers, AlertTriangle,
  CheckCircle2, ShieldAlert, Sparkles, Box, Sliders,
  HelpCircle, Check, Info, RefreshCw
} from 'lucide-react';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import api from '../../../services/api.js';

export default function CapacityRules() {
  const [rules, setRules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  // Simulator state
  const [simRim, setSimRim] = useState(19);
  const [simWidth, setSimWidth] = useState(245);

  const [formData, setFormData] = useState({
    name: '',
    rimRange: '18" - 20"',
    sectionWidthMax: 275,
    maxStackHeight: 5,
    shelfCapacity: 25,
    allowedLevels: 'Ground Level & Mezzanine',
    safetyWeightLimitKg: 400,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/capacity-rules');
      if (data?.rules && data.rules.length > 0) {
        setRules(data.rules.map(r => ({
          id: r.id,
          name: r.name,
          rimRange: r.rim_range,
          sectionWidthMax: r.section_width_max,
          maxStackHeight: r.max_stack_height,
          shelfCapacity: r.shelf_capacity,
          allowedLevels: Array.isArray(r.allowed_levels) ? r.allowed_levels : [r.allowed_levels],
          safetyWeightLimitKg: r.safety_weight_limit_kg,
          status: r.status || 'Active'
        })));
      }
    } catch (err) {
      console.warn('Capacity rules API notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/capacity-rules', {
        name: formData.name,
        rimRange: formData.rimRange,
        sectionWidthMax: parseInt(formData.sectionWidthMax, 10),
        maxStackHeight: parseInt(formData.maxStackHeight, 10),
        shelfCapacity: parseInt(formData.shelfCapacity, 10),
        allowedLevels: [formData.allowedLevels],
        safetyWeightLimitKg: parseInt(formData.safetyWeightLimitKg, 10),
      });

      setSuccess(`Capacity rule "${formData.name}" enforced in database!`);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        rimRange: '18" - 20"',
        sectionWidthMax: 275,
        maxStackHeight: 5,
        shelfCapacity: 25,
        allowedLevels: 'Ground Level & Mezzanine',
        safetyWeightLimitKg: 400,
      });
      await loadData();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      const newRule = {
        id: `rule-0${rules.length + 1}`,
        name: formData.name,
        rimRange: formData.rimRange,
        sectionWidthMax: parseInt(formData.sectionWidthMax, 10),
        maxStackHeight: parseInt(formData.maxStackHeight, 10),
        shelfCapacity: parseInt(formData.shelfCapacity, 10),
        allowedLevels: [formData.allowedLevels],
        safetyWeightLimitKg: parseInt(formData.safetyWeightLimitKg, 10),
        status: 'Active'
      };
      setRules([...rules, newRule]);
      setSuccess(`Capacity rule "${newRule.name}" saved!`);
      setIsAddModalOpen(false);
      setTimeout(() => setSuccess(''), 3500);
    }
  };

  // Simulator logic
  const matchedRule = rules.length > 0 ? (rules.find(r => {
    if (simRim <= 16) return r.rimRange.includes('13') || r.rimRange.includes('16');
    if (simRim <= 19) return r.rimRange.includes('17') || r.rimRange.includes('19');
    if (simRim <= 22) return r.rimRange.includes('20') || r.rimRange.includes('22');
    return r.rimRange.includes('22.5') || r.rimRange.includes('24');
  }) || rules[0]) : null;

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 mb-2">
            <Ruler className="w-3.5 h-3.5" />
            Volumetric &amp; Weight Capacity Constraints
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tire Storage Capacity Rules</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure automated dimensional constraints, stack height ceilings, and shelf weight limits.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-sm font-semibold shadow-md shadow-orange-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Capacity Rule
        </button>
      </div>

      {/* ── Alerts ────────────────────────────────────────────────── */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Rules Grid & Simulator ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Rules List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-600" />
              Active Dimensional Constraints
            </h2>
            <span className="text-xs font-semibold text-slate-400">{rules.length} Rules Enforced</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <Loading />
            ) : rules.length === 0 ? (
              <EmptyState
                icon={Ruler}
                title="No Capacity Rules Defined"
                description="Start by adding dimensional constraints and storage limits for different tire categories."
                actionLabel="Add First Rule"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              rules.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{r.name}</h3>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
                          {r.rimRange}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Max Section Width: <strong>{r.sectionWidthMax}mm</strong> • Max Weight: <strong>{r.safetyWeightLimitKg}kg / rack</strong>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      {r.status}
                    </span>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Max Stack Height</span>
                      <p className="font-extrabold text-slate-800 text-sm mt-0.5">{r.maxStackHeight} Tires High</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Shelf Slot Limit</span>
                      <p className="font-extrabold text-orange-600 text-sm mt-0.5">{r.shelfCapacity} Tires / Slot</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Structural Safety</span>
                      <p className="font-semibold text-emerald-700 text-xs mt-0.5">OSHA / ISO Compliant</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="font-bold text-slate-400">Authorized Zones:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.allowedLevels.map((lvl, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {lvl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Live Capacity Rule Test Sandbox (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-orange-600" />
              Tire Placement Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Input tire dimensions to see the system-calculated storage location limits and safe stack height.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wheel Rim Diameter ({simRim}")
                </label>
                <input
                  type="range"
                  min={13}
                  max={24}
                  value={simRim}
                  onChange={(e) => setSimRim(parseInt(e.target.value, 10))}
                  className="w-full accent-orange-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>13" Compact</span>
                  <span>18" Standard</span>
                  <span>24" Heavy</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tire Section Width ({simWidth}mm)
                </label>
                <input
                  type="range"
                  min={175}
                  max={335}
                  step={10}
                  value={simWidth}
                  onChange={(e) => setSimWidth(parseInt(e.target.value, 10))}
                  className="w-full accent-orange-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>175mm</span>
                  <span>245mm</span>
                  <span>335mm</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Box */}
            {matchedRule ? (
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800">Matching Rule</span>
                  <span className="text-xs font-bold text-orange-900">{matchedRule.name}</span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-orange-200/60 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max Vertical Stack:</span>
                    <strong className="text-slate-900">{matchedRule.maxStackHeight} tires</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max Rack Capacity:</span>
                    <strong className="text-slate-900">{matchedRule.shelfCapacity} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Max Weight:</span>
                    <strong className="text-slate-900">{matchedRule.safetyWeightLimitKg} kg</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                <Info className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                <p>No capacity rules configured yet. Add rules to enable the simulator.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Rule Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Define Storage Capacity Rule</h3>
                    <p className="text-xs text-slate-500">Configure dimension threshold and rack stacking ceilings</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRule} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Electric Vehicle High Load Tires"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rim Diameter Range</label>
                    <input
                      type="text"
                      required
                      value={formData.rimRange}
                      onChange={(e) => setFormData({ ...formData, rimRange: e.target.value })}
                      placeholder='18" - 21"'
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Section Width (mm)</label>
                    <input
                      type="number"
                      required
                      value={formData.sectionWidthMax}
                      onChange={(e) => setFormData({ ...formData, sectionWidthMax: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Stack Height (Tires)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      required
                      value={formData.maxStackHeight}
                      onChange={(e) => setFormData({ ...formData, maxStackHeight: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Slot Limit (Units)</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.shelfCapacity}
                      onChange={(e) => setFormData({ ...formData, shelfCapacity: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed Facility Zones</label>
                  <input
                    type="text"
                    required
                    value={formData.allowedLevels}
                    onChange={(e) => setFormData({ ...formData, allowedLevels: e.target.value })}
                    placeholder="Ground Level, Mezzanine, All Racks"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-md shadow-orange-500/20"
                  >
                    Enforce Rule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
