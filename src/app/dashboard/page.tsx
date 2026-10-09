'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { KPIStrip } from '@/components/dashboard/KPIStrip';
import { AlertFlagsList } from '@/components/dashboard/AlertFlagsList';
import { FlockCharts } from '@/components/charts/FlockCharts';
import {
  computeFlockRecords,
  ComputedWeeklyRecord,
} from '@/lib/calculations';
import {
  getStoredFlockRecords,
  INITIAL_FLOCKS,
} from '@/lib/mockData';
import { evaluateFlockAlerts } from '@/lib/alerts';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import {
  PlusCircle,
  TableProperties,
  BarChart3,
  FileSpreadsheet,
  FileDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLocaleTheme();
  const [selectedUnit, setSelectedUnit] = useState('B');
  const [selectedFlockId, setSelectedFlockId] = useState('flock-2866');
  const [computedRecords, setComputedRecords] = useState<ComputedWeeklyRecord[]>([]);

  const flock = INITIAL_FLOCKS.find((f) => f.id === selectedFlockId) || INITIAL_FLOCKS[0];

  useEffect(() => {
    const raw = getStoredFlockRecords(selectedFlockId);
    const computed = computeFlockRecords(raw);
    setComputedRecords(computed);
  }, [selectedFlockId]);

  const latestRecord = computedRecords.length > 0 ? computedRecords[computedRecords.length - 1] : null;
  const alertFlags = evaluateFlockAlerts(computedRecords);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner & Selectors */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              RBCL Unit-{selectedUnit} Breeder Farm
            </span>
            <span className="text-xs text-slate-400 font-medium">Status: {flock.status}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Flock {flock.flockNo} Overview (Shed {flock.shedNo} · {flock.breed})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time poultry growth, body weights vs standard curves, and depletion metrics.
          </p>
        </div>

        {/* Selectors and Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Unit Picker */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="B">Unit-B</option>
            <option value="A">Unit-A</option>
          </select>

          {/* Flock Picker */}
          <select
            value={selectedFlockId}
            onChange={(e) => setSelectedFlockId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-emerald-500"
          >
            {INITIAL_FLOCKS.map((f) => (
              <option key={f.id} value={f.id}>
                Flock {f.flockNo} (Shed {f.shedNo} - {f.breed})
              </option>
            ))}
          </select>

          {/* Primary Action Button */}
          <Link
            href={`/flocks/${selectedFlockId}/entry`}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all active:scale-95 ml-auto md:ml-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('newEntry')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <KPIStrip
        latestRecord={latestRecord}
        totalRecordsCount={computedRecords.length}
      />

      {/* Performance Flags List */}
      <AlertFlagsList flags={alertFlags} flockId={selectedFlockId} />

      {/* Flock Charts */}
      <FlockCharts records={computedRecords} />

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href={`/flocks/${selectedFlockId}/ledger`}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center gap-3 transition-colors shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TableProperties className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-white block">{t('ledger')}</span>
            <span className="text-[10px] text-slate-400">All columns grouped</span>
          </div>
        </Link>

        <Link
          href="/comparison"
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center gap-3 transition-colors shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-white block">{t('comparison')}</span>
            <span className="text-[10px] text-slate-400">Rank active sheds</span>
          </div>
        </Link>

        <Link
          href="/import"
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center gap-3 transition-colors shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-white block">{t('import')}</span>
            <span className="text-[10px] text-slate-400">Upload .ods / .xlsx</span>
          </div>
        </Link>

        <Link
          href="/export"
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center gap-3 transition-colors shadow-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-white block">{t('export')}</span>
            <span className="text-[10px] text-slate-400">Excel (.xlsx) & PDF</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
