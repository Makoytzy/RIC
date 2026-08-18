import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse, Plus, Search, Filter, Layers, MapPin,
  CheckCircle2, AlertTriangle, ArrowRight, RefreshCw,
  Box, Edit3, Trash2, Shield, Sparkles, Ruler, LayoutGrid
} from 'lucide-react';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/common/EmptyState.jsx';
import api from '../../../services/api.js';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('wh-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  const [newWhForm, setNewWhForm] = useState({
    name: '',
    code: '',
    location: '',
    totalSlots: 500,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/warehouse/facilities');
      if (data?.warehouses && data.warehouses.length > 0) {
        setWarehouses(data.warehouses.map(w => ({
          id: w.id,
          name: w.name,
          code: w.code,
          location: w.location || 'Industrial Sector Logistics Park',
          totalSlots: w.total_slots || 500,
          occupiedSlots: w.occupied_slots || 0,
          levels: Array.isArray(w.levels_data) && w.levels_data.length > 0 ? w.levels_data : [
            {
              id: `lvl-${w.id}`,
              name: 'Primary Storage Bay',
              code: 'LVL-01',
              racks: [
                { id: `rk-1`, code: `${w.code}-R01`, capacity: Math.floor(w.total_slots / 2), occupied: Math.floor(w.occupied_slots / 2), tireSizes: 'Standard All-Size' },
                { id: `rk-2`, code: `${w.code}-R02`, capacity: Math.ceil(w.total_slots / 2), occupied: Math.ceil(w.occupied_slots / 2), tireSizes: 'SUV & Light Truck' }
              ]
            }
          ]
        })));
        if (data.warehouses.length > 0) {
          setSelectedWarehouseId(data.warehouses[0].id);
        }
      }
    } catch (err) {
      console.warn('Warehouse API notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedWarehouse = warehouses.length > 0 ? (warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0]) : null;

  const totalCapacityAll = warehouses.reduce((acc, w) => acc + w.totalSlots, 0);
  const totalOccupiedAll = warehouses.reduce((acc, w) => acc + w.occupiedSlots, 0);
  const overallPct = totalCapacityAll > 0 ? Math.round((totalOccupiedAll / totalCapacityAll) * 100) : 0;

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    try {
      const code = newWhForm.code || `WH-RIC-0${warehouses.length + 1}`;
      const payload = {
        name: newWhForm.name,
        code,
        location: newWhForm.location,
        totalSlots: parseInt(newWhForm.totalSlots, 10),
        levelsData: [
          {
            id: `lvl-${Date.now()}`,
            name: 'Primary Storage Bay',
            code: 'LVL-01',
            racks: [
              { id: `rk-${Date.now()}`, code: `${code}-R01`, capacity: parseInt(newWhForm.totalSlots, 10), occupied: 0, tireSizes: 'Standard All-Size' }
            ]
          }
        ]
      };

      await api.post('/warehouse/facilities', payload);
      setSuccess(`Warehouse facility ${newWhForm.name} successfully registered in database!`);
      setIsAddModalOpen(false);
      setNewWhForm({ name: '', code: '', location: '', totalSlots: 500 });
      await loadData();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      // Optimistic local add
      const newWh = {
        id: `wh-0${warehouses.length + 1}`,
        name: newWhForm.name,
        code: newWhForm.code || `WH-RIC-0${warehouses.length + 1}`,
        location: newWhForm.location,
        totalSlots: parseInt(newWhForm.totalSlots, 10),
        occupiedSlots: 0,
        levels: [
          {
            id: `lvl-${Date.now()}`,
            name: 'Primary Storage Bay',
            code: 'LVL-01',
            racks: [
              { id: `rk-${Date.now()}`, code: 'RACK-01', capacity: parseInt(newWhForm.totalSlots, 10), occupied: 0, tireSizes: 'Standard All-Size' }
            ]
          }
        ]
      };
      setWarehouses([...warehouses, newWh]);
      setSuccess(`Warehouse facility ${newWh.name} registered!`);
      setIsAddModalOpen(false);
      setSelectedWarehouseId(newWh.id);
      setTimeout(() => setSuccess(''), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
            <Warehouse className="w-3.5 h-3.5" />
            Storage Facilities &amp; Hierarchy Architecture
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Warehouse &amp; Storage Hierarchy</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage physical facilities, structural levels, storage racks, and shelf layouts.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white text-sm font-semibold shadow-md shadow-teal-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Warehouse Facility
        </button>
      </div>

      {/* ── Global Metrics ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Facilities</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{warehouses.length} Active Hubs</p>
          <p className="text-xs text-slate-500 mt-1">Multi-tier hierarchical mapping</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Slot Capacity</span>
          <p className="mt-2 text-2xl font-extrabold text-teal-600">{totalOccupiedAll.toLocaleString()} / {totalCapacityAll.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{totalCapacityAll - totalOccupiedAll} slots currently vacant</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fleet Occupancy Index</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{overallPct}% Full</p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────────────────── */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Warehouse Selector Tabs ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {warehouses.map((wh) => {
          const isSelected = selectedWarehouseId === wh.id;
          const pct = Math.round((wh.occupiedSlots / wh.totalSlots) * 100);

          return (
            <button
              key={wh.id}
              onClick={() => setSelectedWarehouseId(wh.id)}
              className={`p-4 rounded-2xl text-left transition-all border relative ${
                isSelected
                  ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {wh.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pct > 90 ? 'bg-rose-100 text-rose-700' : pct > 75 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {pct}% Full
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{wh.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{wh.occupiedSlots} / {wh.totalSlots} tires</p>
            </button>
          );
        })}
      </div>

      {/* ── Selected Warehouse Detailed Hierarchy View ────────────── */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{selectedWarehouse.name}</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                {selectedWarehouse.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {selectedWarehouse.location}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Occupancy Rate: </span>
            <span className="text-sm font-extrabold text-slate-900">
              {Math.round((selectedWarehouse.occupiedSlots / selectedWarehouse.totalSlots) * 100)}%
            </span>
          </div>
        </div>

        {/* Structural Levels & Racks Breakdown */}
        <div className="space-y-6">
          {selectedWarehouse.levels.map((lvl) => (
            <div key={lvl.id} className="p-5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-800">{lvl.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-600">{lvl.code}</span>
                </div>
                <span className="text-xs text-slate-500">{lvl.racks.length} Storage Racks</span>
              </div>

              {/* Racks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lvl.racks.map((rk) => {
                  const rackPct = Math.round((rk.occupied / rk.capacity) * 100);

                  return (
                    <div key={rk.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Box className="w-4 h-4 text-slate-500" />
                          <span className="text-xs font-bold text-slate-900 font-mono">{rk.code}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rackPct > 90 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {rk.occupied} / {rk.capacity}
                        </span>
                      </div>

                      {/* Visual slot fill bar */}
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            rackPct > 90 ? 'bg-rose-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${rackPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Configured Tire Sizes:</span>
                        <strong className="font-semibold text-slate-700">{rk.tireSizes}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Warehouse Modal ───────────────────────────────────── */}
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
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add Warehouse Facility</h3>
                    <p className="text-xs text-slate-500">Configure a new physical storage warehouse node</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddWarehouse} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name</label>
                  <input
                    type="text"
                    required
                    value={newWhForm.name}
                    onChange={(e) => setNewWhForm({ ...newWhForm, name: e.target.value })}
                    placeholder="e.g. West Coast Annex - Warehouse E"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Code</label>
                    <input
                      type="text"
                      required
                      value={newWhForm.code}
                      onChange={(e) => setNewWhForm({ ...newWhForm, code: e.target.value })}
                      placeholder="WH-WEST-05"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Total Tire Slot Capacity</label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={newWhForm.totalSlots}
                      onChange={(e) => setNewWhForm({ ...newWhForm, totalSlots: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Location / Address</label>
                  <input
                    type="text"
                    required
                    value={newWhForm.location}
                    onChange={(e) => setNewWhForm({ ...newWhForm, location: e.target.value })}
                    placeholder="e.g. Sector 7, Gate 12 Logistics Expressway"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
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
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
                  >
                    Register Facility
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
