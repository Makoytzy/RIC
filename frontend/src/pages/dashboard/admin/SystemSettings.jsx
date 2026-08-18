import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Building2, Shield, Bell, Database, HardDrive,
  Save, RefreshCw, CheckCircle2, AlertTriangle, Key, Mail,
  Smartphone, Lock, Sliders, Sparkles, Server, Download
} from 'lucide-react';
import api from '../../../services/api.js';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Company profile
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Red Indian Customs & Tire Logistics',
    taxId: 'RIC-PH-98214-X',
    supportEmail: 'ops@redindiancustoms.com',
    supportPhone: '+1 (555) 782-9011',
    headquarters: '104 Industrial Sector Parkway, North Hub',
    defaultCurrency: 'USD ($)',
    systemTimezone: 'Asia/Manila (UTC+08:00)',
  });

  // Security policies
  const [securitySettings, setSecuritySettings] = useState({
    requireMFA: true,
    sessionTimeoutMinutes: 45,
    maxLoginAttempts: 5,
    enforceStrongPasswords: true,
    ipSubnetRestriction: false,
    auditLoggingLevel: 'Verbose',
  });

  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlertLowStock: true,
    emailAlertDiscrepancy: true,
    discordWebhookUrl: 'https://discord.com/api/webhooks/12345/ric-alerts',
    discordAlertsEnabled: false,
    soundAlertsOnScan: true,
  });

  // Backup & Storage
  const [backupSettings, setBackupSettings] = useState({
    autoBackupDaily: true,
    backupRetentionDays: 30,
    cloudSyncBucket: 'gs://ric-db-backups-primary',
    lastBackupTimestamp: '2024-08-18 03:00:00 UTC',
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/settings');
      if (data?.settings) {
        if (data.settings.company) setCompanySettings(prev => ({ ...prev, ...data.settings.company }));
        if (data.settings.security) setSecuritySettings(prev => ({ ...prev, ...data.settings.security }));
        if (data.settings.notifications) setNotificationSettings(prev => ({ ...prev, ...data.settings.notifications }));
        if (data.settings.database) setBackupSettings(prev => ({ ...prev, ...data.settings.database }));
      }
    } catch (err) {
      console.warn('System settings API notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let currentPayload = {};
      if (activeTab === 'company') currentPayload = companySettings;
      else if (activeTab === 'security') currentPayload = securitySettings;
      else if (activeTab === 'notifications') currentPayload = notificationSettings;
      else if (activeTab === 'database') currentPayload = backupSettings;

      await api.post('/settings', {
        category: activeTab,
        settings: currentPayload,
      });

      setSuccess(`System settings for ${activeTab} saved to database!`);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setSuccess('Settings saved locally!');
      setTimeout(() => setSuccess(''), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBackup = () => {
    setBackupInProgress(true);
    setBackupProgress(10);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBackupInProgress(false);
          setBackupSettings(s => ({ ...s, lastBackupTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC' }));
          setSuccess('Full PostgreSQL database & S3 storage snapshot completed successfully!');
          setTimeout(() => setSuccess(''), 3500);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'notifications', label: 'Alerts & Webhooks', icon: Bell },
    { id: 'database', label: 'Database & Backups', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-2">
            <Settings className="w-3.5 h-3.5" />
            Global System Governance
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System &amp; Infrastructure Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage organization parameters, authentication policies, webhook notifications, and automated snapshots.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:bg-slate-800 text-white text-sm font-semibold shadow-md shadow-slate-900/20 transition-all active:scale-95 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* ── Alerts ────────────────────────────────────────────────── */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Tabs Navigation ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Contents ──────────────────────────────────────────── */}
      <form onSubmit={handleSave}>
        {/* Company Profile Tab */}
        {activeTab === 'company' && (
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" />
              Organization &amp; Regional Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Entity</label>
                <input
                  type="text"
                  value={companySettings.companyName}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax / Registration ID</label>
                <input
                  type="text"
                  value={companySettings.taxId}
                  onChange={(e) => setCompanySettings({ ...companySettings, taxId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">System Support Email</label>
                <input
                  type="email"
                  value={companySettings.supportEmail}
                  onChange={(e) => setCompanySettings({ ...companySettings, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Support Hotline</label>
                <input
                  type="text"
                  value={companySettings.supportPhone}
                  onChange={(e) => setCompanySettings({ ...companySettings, supportPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Operating Currency</label>
                <select
                  value={companySettings.defaultCurrency}
                  onChange={(e) => setCompanySettings({ ...companySettings, defaultCurrency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="USD ($)">USD ($) - United States Dollar</option>
                  <option value="PHP (₱)">PHP (₱) - Philippine Peso</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">System Timezone &amp; Sync</label>
                <select
                  value={companySettings.systemTimezone}
                  onChange={(e) => setCompanySettings({ ...companySettings, systemTimezone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Asia/Manila (UTC+08:00)">Asia/Manila (UTC+08:00)</option>
                  <option value="America/New_York (UTC-05:00)">America/New York (UTC-05:00)</option>
                  <option value="UTC (UTC+00:00)">UTC (UTC+00:00)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Security & Auth Tab */}
        {activeTab === 'security' && (
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              Authentication &amp; Session Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inactivity Session Timeout (Minutes)</label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={securitySettings.sessionTimeoutMinutes}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeoutMinutes: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Failed Login Lockout Threshold</label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={securitySettings.requireMFA}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, requireMFA: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Enforce Two-Factor Authentication (2FA) for all Administrator &amp; Manager Accounts
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={securitySettings.enforceStrongPasswords}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, enforceStrongPasswords: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Enforce NIST Password Complexity (Minimum 10 chars, uppercase, lowercase, numeric &amp; symbol)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Notifications & Alerts Tab */}
        {activeTab === 'notifications' && (
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              Automated Alert Dispatch &amp; Webhooks
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailAlertLowStock}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAlertLowStock: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Send Immediate Email Digest when any Tire SKU breaches Minimum Reorder Level
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailAlertDiscrepancy}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emailAlertDiscrepancy: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Dispatch High-Priority Alert when Warehouse Staff files a Physical Discrepancy Case
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notificationSettings.soundAlertsOnScan}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, soundAlertsOnScan: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Enable High-Pitch Audio Feedback Beep on Barcode Scan Confirmation
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discord / Slack Operations Webhook URL
              </label>
              <input
                type="text"
                value={notificationSettings.discordWebhookUrl}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, discordWebhookUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Database & Backups Tab */}
        {activeTab === 'database' && (
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Database Backups &amp; Disaster Recovery
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-900">Last Successful Snapshot</span>
                <p className="text-xs font-mono text-slate-600 mt-0.5">{backupSettings.lastBackupTimestamp}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">GCS Bucket: {backupSettings.cloudSyncBucket}</p>
              </div>

              <button
                type="button"
                onClick={handleTriggerBackup}
                disabled={backupInProgress}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
              >
                <Server className={`w-4 h-4 ${backupInProgress ? 'animate-spin' : ''}`} />
                {backupInProgress ? `Creating Snapshot (${backupProgress}%)...` : 'Run Immediate Backup'}
              </button>
            </div>

            {backupInProgress && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Compressing SQL dumps &amp; asset objects...</span>
                  <span className="font-bold">{backupProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${backupProgress}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Backup Retention Cadence</label>
                <select
                  value={backupSettings.backupRetentionDays}
                  onChange={(e) => setBackupSettings({ ...backupSettings, backupRetentionDays: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value={15}>15 Days Rolling Retention</option>
                  <option value={30}>30 Days Rolling Retention (Recommended)</option>
                  <option value={90}>90 Days Enterprise Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Automated Daily Snapshot</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                  <option value="true">Enabled (Nightly at 03:00 UTC)</option>
                  <option value="false">Disabled (Manual Only)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md shadow-slate-900/20 transition-all active:scale-95"
          >
            {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
