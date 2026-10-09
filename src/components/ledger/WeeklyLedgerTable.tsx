'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  computeFlockRecords,
  ComputedWeeklyRecord,
  WeeklyInputData,
} from '@/lib/calculations';
import {
  getStoredFlockRecords,
  INITIAL_FLOCKS,
} from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import { canEditWeeklyRecord } from '@/lib/auth';
import {
  Edit3,
  Lock,
  PlusCircle,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Calendar,
} from 'lucide-react';

interface WeeklyLedgerTableProps {
  flockId: string;
}

export function WeeklyLedgerTable({ flockId }: WeeklyLedgerTableProps) {
  const router = useRouter();
  const { role } = useAuth();
  const { t, num, date } = useLocaleTheme();

  const [records, setRecords] = useState<WeeklyInputData[]>([]);
  const [computedRecords, setComputedRecords] = useState<ComputedWeeklyRecord[]>([]);
  const [maxAgeWeeks, setMaxAgeWeeks] = useState<number>(0);

  const flock = INITIAL_FLOCKS.find((f) => f.id === flockId) || INITIAL_FLOCKS[0];

  useEffect(() => {
    const raw = getStoredFlockRecords(flockId);
    setRecords(raw);
    const computed = computeFlockRecords(raw);
    setComputedRecords(computed);
    if (computed.length > 0) {
      setMaxAgeWeeks(Math.max(...computed.map((r) => r.ageWeeks)));
    }
  }, [flockId]);

  const handleRowClick = (ageWeeks: number) => {
    router.push(`/flocks/${flockId}/entry?age=${ageWeeks}`);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Ledger Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Flock {flock.flockNo} · Shed {flock.shedNo}
            </span>
            <span className="text-xs text-slate-400 font-medium">Breed: {flock.breed}</span>
            <span className="text-xs text-slate-500">· {computedRecords.length} Weeks Recorded</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Weekly Growing Ledger
          </h1>
          <p className="text-xs text-slate-400">
            Grouped identically to LibreOffice farm spreadsheet. Click any row to view or edit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/flocks/${flockId}/entry`)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('newEntry')}</span>
          </button>
        </div>
      </div>

      {/* Ledger Table Container with horizontal scroll and sticky column */}
      <div className="relative overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl max-h-[75vh]">
        <table className="w-full text-xs text-left text-slate-300 border-collapse min-w-[1300px]">
          {/* Header Tier 1: Block Grouping */}
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] sticky top-0 z-20 shadow-sm">
            <tr>
              <th
                colSpan={2}
                className="py-3 px-3 text-center border-b border-r border-slate-800 bg-slate-950 sticky left-0 z-30"
              >
                Week Timeline
              </th>
              <th
                colSpan={10}
                className="py-3 px-3 text-center border-b border-r border-slate-800 bg-pink-950/40 text-pink-300 font-bold tracking-wide"
              >
                ♀️ Female Birds Block (মাদি)
              </th>
              <th
                colSpan={10}
                className="py-3 px-3 text-center border-b border-r border-slate-800 bg-blue-950/40 text-blue-300 font-bold tracking-wide"
              >
                ♂️ Male Birds Block (মোরগ)
              </th>
              <th className="py-3 px-3 text-center border-b border-slate-800 bg-slate-950">
                Action
              </th>
            </tr>

            {/* Header Tier 2: Individual Column Names */}
            <tr className="bg-slate-900 text-[10px] text-slate-400 border-b border-slate-800 tracking-wider">
              {/* Sticky Columns: Age and Date */}
              <th className="py-2.5 px-3 font-bold text-white border-r border-slate-800 bg-slate-900 sticky left-0 z-30 w-16 text-center">
                {t('ageWeeks')}
              </th>
              <th className="py-2.5 px-3 border-r border-slate-800 w-24 text-center">
                {t('weekEndDate')}
              </th>

              {/* Female Columns */}
              <th className="py-2.5 px-2.5 text-right font-medium">{t('housed')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium text-rose-300">{t('mortality')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium text-amber-300">{t('sold')}</th>
              <th className="py-2.5 px-2.5 text-right font-bold text-amber-400">{t('depletionPct')}</th>
              <th className="py-2.5 px-2.5 text-right font-bold text-purple-400">{t('cumDepletionPct')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium">{t('stdWeight')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium text-emerald-400">{t('actualWeight')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium">{t('weightDev')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium">{t('uniformity')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium border-r border-slate-800">{t('feed')}</th>

              {/* Male Columns */}
              <th className="py-2.5 px-2.5 text-right font-medium">{t('housed')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium text-rose-300">{t('mortality')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium text-amber-300">{t('sold')}</th>
              <th className="py-2.5 px-2.5 text-right font-bold text-amber-400">{t('depletionPct')}</th>
              <th className="py-2.5 px-2.5 text-right font-bold text-purple-400">{t('cumDepletionPct')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium">{t('stdWeight')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium text-cyan-400">{t('actualWeight')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium">{t('weightDev')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium">{t('uniformity')}</th>
              <th className="py-2.5 px-2.5 text-right font-medium border-r border-slate-800">{t('feed')}</th>

              {/* Action Column */}
              <th className="py-2.5 px-3 text-center">Edit</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
            {computedRecords.map((row) => {
              const editPerm = canEditWeeklyRecord(role, row.ageWeeks, maxAgeWeeks);
              const isLocked = !editPerm.allowed;

              // Threshold alert flags:
              // Weekly mortality > 1.0%
              const mortAlertF = row.weeklyMortalityPctF > 1.0;
              const mortAlertM = row.weeklyMortalityPctM > 1.0;
              // Weight deviation off standard by > 10% from week 4
              const wtAlertF = row.ageWeeks >= 4 && Math.abs(row.weightDeviationPctF || 0) > 10;

              return (
                <tr
                  key={row.ageWeeks}
                  onClick={() => !isLocked && handleRowClick(row.ageWeeks)}
                  className={`hover:bg-slate-800/60 transition-colors group ${
                    isLocked ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {/* Sticky Age Column */}
                  <td className="py-2 px-3 font-bold text-emerald-400 bg-slate-900 group-hover:bg-slate-850 sticky left-0 z-10 border-r border-slate-800 text-center">
                    {num(row.ageWeeks, 0)}
                  </td>

                  {/* Week End Date */}
                  <td className="py-2 px-3 text-slate-400 border-r border-slate-800 text-center whitespace-nowrap">
                    {date(row.weekEndDate)}
                  </td>

                  {/* Female Block */}
                  <td className="py-2 px-2.5 text-right text-slate-200">{num(row.housedF, 0)}</td>
                  <td
                    className={`py-2 px-2.5 text-right font-semibold ${
                      mortAlertF ? 'text-rose-400 bg-rose-950/40 rounded' : 'text-rose-300'
                    }`}
                  >
                    {num(row.mortalityF, 0)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-amber-300">{num(row.soldF, 0)}</td>
                  <td className="py-2 px-2.5 text-right font-bold text-amber-400">
                    {num(row.weeklyDepletionPctF, 2)}%
                  </td>
                  <td className="py-2 px-2.5 text-right font-bold text-purple-300">
                    {num(row.cumulativeDepletionPctF, 2)}%
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-400">{num(row.stdWeightF, 0)}</td>
                  <td
                    className={`py-2 px-2.5 text-right font-bold ${
                      wtAlertF ? 'text-amber-400 bg-amber-950/30 rounded' : 'text-emerald-400'
                    }`}
                  >
                    {num(row.actualWeightF, 0)}
                  </td>
                  <td
                    className={`py-2 px-2.5 text-right ${
                      (row.weightDeviationGF || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {row.weightDeviationGF !== null
                      ? `${(row.weightDeviationGF || 0) >= 0 ? '+' : ''}${num(row.weightDeviationGF, 1)}`
                      : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-300">
                    {row.uniformityF ? `${num(row.uniformityF, 1)}%` : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-300 border-r border-slate-800">
                    {num(row.feedGPerBirdF, 0)}
                  </td>

                  {/* Male Block */}
                  <td className="py-2 px-2.5 text-right text-slate-200">{num(row.housedM, 0)}</td>
                  <td
                    className={`py-2 px-2.5 text-right font-semibold ${
                      mortAlertM ? 'text-rose-400 bg-rose-950/40 rounded' : 'text-rose-300'
                    }`}
                  >
                    {num(row.mortalityM, 0)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-amber-300">{num(row.soldM, 0)}</td>
                  <td className="py-2 px-2.5 text-right font-bold text-amber-400">
                    {num(row.weeklyDepletionPctM, 2)}%
                  </td>
                  <td className="py-2 px-2.5 text-right font-bold text-purple-300">
                    {num(row.cumulativeDepletionPctM, 2)}%
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-400">{num(row.stdWeightM, 0)}</td>
                  <td className="py-2 px-2.5 text-right font-bold text-cyan-400">
                    {num(row.actualWeightM, 0)}
                  </td>
                  <td
                    className={`py-2 px-2.5 text-right ${
                      (row.weightDeviationGM || 0) >= 0 ? 'text-cyan-400' : 'text-rose-400'
                    }`}
                  >
                    {row.weightDeviationGM !== null
                      ? `${(row.weightDeviationGM || 0) >= 0 ? '+' : ''}${num(row.weightDeviationGM, 1)}`
                      : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-300">
                    {row.uniformityM ? `${num(row.uniformityM, 1)}%` : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-300 border-r border-slate-800">
                    {num(row.feedGPerBirdM, 0)}
                  </td>

                  {/* Actions / Lock Status */}
                  <td className="py-2 px-3 text-center">
                    {isLocked ? (
                      <span title={editPerm.reason} className="inline-flex items-center text-slate-600">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row.ageWeeks);
                        }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
