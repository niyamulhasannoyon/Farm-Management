'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  parseBreederSpreadsheet,
  ImportReport,
  ParsedSheetFlock,
} from '@/lib/excel-importer';
import { saveStoredFlockRecords, INITIAL_RECORDS_2866 } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Check,
  FileText,
} from 'lucide-react';

export default function ImportPage() {
  const router = useRouter();
  const { role } = useAuth();
  const { t, num } = useLocaleTheme();

  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setCommitSuccess(false);

    try {
      const buffer = await file.arrayBuffer();
      const report = parseBreederSpreadsheet(buffer, file.name);
      setImportReport(report);

      // Select first valid flock
      const firstValid = report.flocks.findIndex((f) => f.isFlockSheet && f.records.length > 0);
      if (firstValid !== -1) {
        setSelectedSheetIndex(firstValid);
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setErrorMessage('Failed to parse spreadsheet. Please ensure it is a valid .ods or .xlsx file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommit = () => {
    if (!importReport) return;

    const validFlocks = importReport.flocks.filter((f) => f.isFlockSheet && f.records.length > 0);
    for (const flock of validFlocks) {
      const flockId = `flock-${flock.flockNo}`;
      saveStoredFlockRecords(flockId, flock.records);
    }

    setCommitSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  // Helper to generate a sample LibreOffice .xlsx file for immediate user testing
  const handleDownloadSample = () => {
    const wb = XLSX.utils.book_new();

    // 1. Flock 2866 Sheet (matching real sheet structure)
    const headers = [
      ['UNIT-B POULTRY BREEDER FARM - FLOCK GROWING RECORD'],
      ['Shed No-01', 'Flock No-2866.', 'Breed: Ross', 'House Date: 2025-07-05'],
      [],
      [
        'Date end of week',
        'Age in week',
        'Housing Birds F',
        'Housing Birds M',
        'Weekly Mortality F',
        'Weekly Mortality M',
        'Weekly Sold F',
        'Weekly Sold M',
        'Depletion F %',
        'Depletion M %',
        'Std Weight F',
        'Actual Weight F',
        'Std Weight M',
        'Actual Weight M',
        'Uniformity F',
        'Feed g/bird F',
      ],
    ];

    const dataRows = INITIAL_RECORDS_2866.map((r) => [
      r.weekEndDate,
      r.ageWeeks,
      r.housedF,
      r.housedM,
      r.mortalityF,
      r.mortalityM,
      r.soldF,
      r.soldM,
      '3.04%', // spreadsheet derived formula column (will be ignored & recomputed)
      '3.96%',
      r.stdWeightF,
      r.actualWeightF,
      r.stdWeightM,
      r.actualWeightM,
      r.uniformityF,
      r.feedGPerBirdF,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...dataRows]);
    XLSX.utils.book_append_sheet(wb, ws, '1.F-2866. (Ross)');

    // 2. Summary Sheet (should be skipped by importer)
    const wsSummary = XLSX.utils.aoa_to_sheet([
      ['FARM MANAGEMENT SUMMARY SHEET'],
      ['Total Sheds: 10', 'Unit: B'],
    ]);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    XLSX.writeFile(wb, 'RBCL_Flock_2866_Sample.xlsx');
  };

  const selectedFlock: ParsedSheetFlock | undefined = importReport?.flocks[selectedSheetIndex];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
              Spreadsheet Migration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Import LibreOffice / Excel Sheets</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload your farm .ods or .xlsx workbook. Derived columns will be ignored and safely recomputed.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Sample .xlsx</span>
        </button>
      </div>

      {/* File Upload Dropzone */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
        <input
          type="file"
          id="file-upload"
          accept=".ods,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-950/40 hover:bg-slate-950/80 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <span className="text-sm sm:text-base font-bold text-white mb-1">
            Click to upload or drag & drop LibreOffice spreadsheet
          </span>
          <span className="text-xs text-slate-400">
            Supports .ods (LibreOffice Calc) and .xlsx (Excel) with multiple flock tabs
          </span>
        </label>

        {isProcessing && (
          <div className="mt-4 text-xs font-medium text-emerald-400 animate-pulse">
            Parsing sheets and verifying calculation formulas...
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Validation Report & Sheet Preview */}
      {importReport && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Sheets</span>
              <p className="text-2xl font-bold text-white mt-1">{importReport.totalSheets}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Valid Flock Sheets</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{importReport.validFlockSheets}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Skipped Sheets</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{importReport.skippedSheets}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-purple-400 uppercase font-semibold">Total Records Found</span>
              <p className="text-2xl font-bold text-purple-400 mt-1">{importReport.totalRecords}</p>
            </div>
          </div>

          {/* Sheet Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {importReport.flocks.map((flock, idx) => (
              <button
                key={flock.sheetName}
                onClick={() => setSelectedSheetIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedSheetIndex === idx
                    ? 'bg-emerald-600 text-white shadow-md'
                    : flock.isFlockSheet
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{flock.sheetName}</span>
                {flock.isFlockSheet ? (
                  <span className="text-[10px] opacity-75">({flock.records.length} wks)</span>
                ) : (
                  <span className="text-[10px] text-amber-400">(Skipped)</span>
                )}
              </button>
            ))}
          </div>

          {/* Selected Sheet Details & Preview Table */}
          {selectedFlock && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Sheet: {selectedFlock.sheetName}</span>
                    {selectedFlock.isFlockSheet ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Flock {selectedFlock.flockNo} · Shed {selectedFlock.shedNo} · {selectedFlock.breed}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        {selectedFlock.skipReason}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preview showing recomputed live depletion & deviation metrics
                  </p>
                </div>

                {selectedFlock.isFlockSheet && (
                  <button
                    onClick={handleCommit}
                    disabled={commitSuccess}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
                  >
                    {commitSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Committed Successfully!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Commit Flocks to System</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {selectedFlock.warnings.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-800 p-3 rounded-xl text-xs text-amber-300">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Import Warnings:</span>
                  </div>
                  {selectedFlock.warnings.map((w, i) => (
                    <div key={i} className="pl-4">
                      • {w}
                    </div>
                  ))}
                </div>
              )}

              {/* Data Preview Table */}
              {selectedFlock.computedRecords.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-[10px] uppercase font-semibold text-slate-400">
                      <tr>
                        <th className="py-2.5 px-3">Age</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Housed F</th>
                        <th className="py-2.5 px-3 text-right">Mort F</th>
                        <th className="py-2.5 px-3 text-right text-amber-400">Recomputed Dep %</th>
                        <th className="py-2.5 px-3 text-right text-purple-400">Cum Dep %</th>
                        <th className="py-2.5 px-3 text-right">Std Wt (g)</th>
                        <th className="py-2.5 px-3 text-right text-emerald-400">Actual Wt (g)</th>
                        <th className="py-2.5 px-3 text-right">Dev (g)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      {selectedFlock.computedRecords.slice(0, 10).map((r) => (
                        <tr key={r.ageWeeks} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-bold text-white">Wk {r.ageWeeks}</td>
                          <td className="py-2 px-3 text-slate-400">{String(r.weekEndDate)}</td>
                          <td className="py-2 px-3 text-right">{num(r.housedF, 0)}</td>
                          <td className="py-2 px-3 text-right text-rose-300">{num(r.mortalityF, 0)}</td>
                          <td className="py-2 px-3 text-right font-bold text-amber-400">
                            {r.display.weeklyDepletionPctF}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-purple-300">
                            {r.display.cumulativeDepletionPctF}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-400">{num(r.stdWeightF, 0)}</td>
                          <td className="py-2 px-3 text-right text-emerald-400">{num(r.actualWeightF, 0)}</td>
                          <td className="py-2 px-3 text-right">{r.display.weightDeviationGF}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedFlock.computedRecords.length > 10 && (
                    <div className="p-2 text-center text-xs text-slate-500 bg-slate-950/60 border-t border-slate-800">
                      Showing first 10 rows of {selectedFlock.computedRecords.length} total records
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Non-flock sheet. No weekly rows were parsed.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
