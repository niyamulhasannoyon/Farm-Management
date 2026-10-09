'use client';

import React, { useState } from 'react';
import { exportSingleFlockExcel, exportAllFlocksExcel } from '@/lib/excel-exporter';
import { exportSingleFlockPDF } from '@/lib/pdf-exporter';
import { computeFlockRecords } from '@/lib/calculations';
import { INITIAL_FLOCKS, getStoredFlockRecords } from '@/lib/mockData';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function ExportPage() {
  const { t, num } = useLocaleTheme();
  const [selectedFlockId, setSelectedFlockId] = useState('flock-2866');
  const [exportScope, setExportScope] = useState<'single' | 'all'>('single');
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const selectedFlock = INITIAL_FLOCKS.find((f) => f.id === selectedFlockId) || INITIAL_FLOCKS[0];
  const rawRecords = getStoredFlockRecords(selectedFlockId);
  const computedRecords = computeFlockRecords(rawRecords);

  const handleExport = () => {
    setExporting(true);
    setExportSuccess(false);

    setTimeout(() => {
      try {
        if (exportScope === 'all') {
          if (exportFormat === 'excel') {
            exportAllFlocksExcel(INITIAL_FLOCKS);
          } else {
            // PDF report for primary flock
            exportSingleFlockPDF(selectedFlock, computedRecords);
          }
        } else {
          if (exportFormat === 'excel') {
            exportSingleFlockExcel(selectedFlock, computedRecords);
          } else {
            exportSingleFlockPDF(selectedFlock, computedRecords);
          }
        }
        setExportSuccess(true);
      } catch (err) {
        console.error('Export error:', err);
      } finally {
        setExporting(false);
      }
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            Reports & Archival
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Export Farm Reports</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Generate production-ready Excel (.xlsx) workbooks and printable PDF weekly performance sheets.
        </p>
      </div>

      {/* Export Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Step 1: Select Scope */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            1. Select Export Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setExportScope('single')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                exportScope === 'single'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                🐔
              </div>
              <div>
                <span className="font-bold text-sm block text-white">Single Flock Report</span>
                <span className="text-xs text-slate-400">
                  Detailed weekly records for one selected flock & shed
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportScope('all')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                exportScope === 'all'
                  ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm block text-white">All Active Flocks (Unit-B)</span>
                <span className="text-xs text-slate-400">
                  Multi-sheet workbook with all active sheds + summary tab
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Flock Picker if single */}
        {exportScope === 'single' && (
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Target Flock:
            </label>
            <select
              value={selectedFlockId}
              onChange={(e) => setSelectedFlockId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              {INITIAL_FLOCKS.map((f) => (
                <option key={f.id} value={f.id}>
                  Flock #{f.flockNo} · Shed {f.shedNo} ({f.breed} breed) · {f.status}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step 2: Select Format */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            2. Choose File Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setExportFormat('excel')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                exportFormat === 'excel'
                  ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm block text-white">Microsoft Excel (.xlsx)</span>
                <span className="text-xs text-slate-400">
                  Full data table grouped identically to LibreOffice sheets
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat('pdf')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                exportFormat === 'pdf'
                  ? 'bg-rose-950/40 border-rose-500 text-white ring-1 ring-rose-500'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm block text-white">Printable PDF Report (.pdf)</span>
                <span className="text-xs text-slate-400">
                  Clean landscape format formatted for manager distribution
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Export Summary Box */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-white block">Summary of Selection:</span>
            <span className="text-slate-400">
              {exportScope === 'single'
                ? `Flock ${selectedFlock.flockNo} (Shed ${selectedFlock.shedNo}) · ${computedRecords.length} recorded weeks`
                : 'All 3 active sheds in Unit-B'}
              {' · '}
              Format: {exportFormat.toUpperCase()}
            </span>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
          >
            {exporting ? (
              <span>Generating...</span>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Generate & Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
