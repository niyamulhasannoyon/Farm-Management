'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import { canManageSettings } from '@/lib/auth';
import { ThresholdConfig, DEFAULT_THRESHOLDS } from '@/lib/alerts';
import { ROSS_STANDARD_CURVE } from '@/lib/mockData';
import {
  Settings,
  AlertTriangle,
  Scale,
  Bell,
  CheckCircle2,
  Lock,
  Save,
  Mail,
  Send,
} from 'lucide-react';

export default function SettingsPage() {
  const { role } = useAuth();
  const { t } = useLocaleTheme();
  const isAllowed = canManageSettings(role);

  const [thresholds, setThresholds] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  const [selectedBreed, setSelectedBreed] = useState<'Ross' | 'IR' | 'SASSO'>('Ross');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [managerEmail, setManagerEmail] = useState('manager@rbcl.farm');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rbcl_alert_thresholds');
    if (saved) {
      try {
        setThresholds(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowed) return;

    localStorage.setItem('rbcl_alert_thresholds', JSON.stringify(thresholds));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold uppercase tracking-wider">
            Configuration
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">System Settings & Thresholds</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure alert sensitivity, breed growth standards, and scheduled notification summaries.
        </p>
      </div>

      {!isAllowed && (
        <div className="bg-rose-950/70 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-center gap-3 text-xs">
          <Lock className="w-5 h-5 text-rose-400 shrink-0" />
          <span>
            Settings are restricted. Only <strong>ADMIN</strong> and <strong>MANAGER</strong> accounts can modify thresholds. You are currently viewing in read-only mode.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Alert Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Anomaly Detection Thresholds</h2>
            </div>
            <span className="text-xs text-slate-400">
              Severity: Warn @ 1x · Critical @ 2x
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Weekly Mortality Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                disabled={!isAllowed}
                value={thresholds.weeklyMortalityPct}
                onChange={(e) =>
                  setThresholds({ ...thresholds, weeklyMortalityPct: parseFloat(e.target.value) || 1.0 })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-300 focus:outline-none focus:border-rose-500 disabled:opacity-60"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 1.0% (Critical at 2.0%)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Weight Deviation Threshold (%)
              </label>
              <input
                type="number"
                step="1"
                disabled={!isAllowed}
                value={thresholds.weightDevPct}
                onChange={(e) =>
                  setThresholds({ ...thresholds, weightDevPct: parseFloat(e.target.value) || 10.0 })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-500 disabled:opacity-60"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 10.0% off standard (Critical at 20%)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Evaluating Weight from Week
              </label>
              <input
                type="number"
                disabled={!isAllowed}
                value={thresholds.minAgeForWeight}
                onChange={(e) =>
                  setThresholds({ ...thresholds, minAgeForWeight: parseInt(e.target.value, 10) || 4 })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-slate-500 disabled:opacity-60"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: Week 4 onwards</span>
            </div>
          </div>
        </div>

        {/* Section 2: Breed Standard Weight Curves */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Standard Weight Curves (Breed Standards)</h2>
            </div>
            <select
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value as 'Ross' | 'IR' | 'SASSO')}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 font-semibold"
            >
              <option value="Ross">Ross 308</option>
              <option value="IR">Indian River (IR)</option>
              <option value="SASSO">SASSO</option>
            </select>
          </div>

          <p className="text-xs text-slate-400">
            These weekly targets automatically populate the Standard Weight field during mobile entry.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto pr-1">
            {Object.entries(ROSS_STANDARD_CURVE).map(([age, weights]) => (
              <div key={age} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                <span className="font-bold text-emerald-400 block">Week {age}</span>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>♀ {weights.f}g</span>
                  <span>♂ {weights.m}g</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Manager Scheduled Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Daily Manager Dispatch (Email / WhatsApp)</h2>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              Scheduled Job
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                disabled={!isAllowed}
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-800 border-slate-700"
              />
              <span>Send daily anomaly digest to farm managers at 08:00 AM</span>
            </label>

            <div>
              <label className="block text-slate-400 mb-1">Manager Notification Email:</label>
              <input
                type="email"
                disabled={!isAllowed}
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                className="w-full sm:w-80 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isAllowed && (
          <div className="flex items-center justify-end gap-3 pt-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
