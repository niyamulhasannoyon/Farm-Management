'use client';

import React from 'react';
import { ComputedWeeklyRecord } from '@/lib/calculations';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Scale,
  Users,
  AlertOctagon,
  Calendar,
} from 'lucide-react';

interface KPIStripProps {
  latestRecord: ComputedWeeklyRecord | null;
  totalRecordsCount: number;
}

export function KPIStrip({ latestRecord, totalRecordsCount }: KPIStripProps) {
  const { t, num, date } = useLocaleTheme();

  if (!latestRecord) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        No weekly records entered yet for this flock.
      </div>
    );
  }

  const devGF = latestRecord.weightDeviationGF || 0;
  const devGM = latestRecord.weightDeviationGM || 0;
  const devPctF = latestRecord.weightDeviationPctF || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Flock Age & Current Week */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">{t('ageWeeks')}</span>
          <Calendar className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="my-2">
          <span className="text-3xl font-black text-white">{num(latestRecord.ageWeeks, 0)}</span>
          <span className="text-xs text-slate-400 ml-1 font-medium">weeks</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          End: <strong className="text-slate-300 font-mono">{date(latestRecord.weekEndDate)}</strong>
        </div>
      </div>

      {/* 2. Total Live Birds (Housed - Mort - Sold) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">{t('liveBirds')}</span>
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="my-2">
          <span className="text-3xl font-black text-white">
            {num(latestRecord.liveAtWeekEndTotal, 0)}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex justify-between font-mono">
          <span>♀ {num(latestRecord.liveAtWeekEndF, 0)}</span>
          <span>♂ {num(latestRecord.liveAtWeekEndM, 0)}</span>
        </div>
      </div>

      {/* 3. Female Weight vs Standard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Female Wt</span>
          <Scale className="w-4 h-4 text-pink-400" />
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-pink-300">
            {num(latestRecord.actualWeightF, 0)}
          </span>
          <span className="text-xs text-slate-400">g</span>
        </div>
        <div className="text-[11px] flex items-center justify-between">
          <span className="text-slate-400">Std: {num(latestRecord.stdWeightF, 0)}g</span>
          <span
            className={`font-bold font-mono ${
              devGF >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {devGF >= 0 ? `+${num(devGF, 0)}g` : `${num(devGF, 0)}g`}
          </span>
        </div>
      </div>

      {/* 4. Male Weight vs Standard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Male Wt</span>
          <Scale className="w-4 h-4 text-blue-400" />
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-blue-300">
            {latestRecord.actualWeightM ? num(latestRecord.actualWeightM, 0) : '—'}
          </span>
          {latestRecord.actualWeightM && <span className="text-xs text-slate-400">g</span>}
        </div>
        <div className="text-[11px] flex items-center justify-between">
          <span className="text-slate-400">Std: {num(latestRecord.stdWeightM, 0)}g</span>
          <span
            className={`font-bold font-mono ${
              devGM >= 0 ? 'text-cyan-400' : 'text-rose-400'
            }`}
          >
            {latestRecord.actualWeightM ? (devGM >= 0 ? `+${num(devGM, 0)}g` : `${num(devGM, 0)}g`) : '—'}
          </span>
        </div>
      </div>

      {/* 5. Cumulative Depletion */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Cum. Depletion</span>
          <TrendingDown className="w-4 h-4 text-purple-400" />
        </div>
        <div className="my-2 flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-purple-300">
            {latestRecord.display.cumulativeDepletionPctF}
          </span>
          <span className="text-[10px] text-slate-400">(F)</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Male: <strong className="text-slate-200">{latestRecord.display.cumulativeDepletionPctM}</strong>
        </div>
      </div>

      {/* 6. This Week's Mortality */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">This Wk Loss</span>
          <AlertOctagon className="w-4 h-4 text-rose-400" />
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-rose-400">
            {num(latestRecord.mortalityF + latestRecord.mortalityM, 0)}
          </span>
          <span className="text-xs text-slate-400">birds</span>
        </div>
        <div className="text-[11px] text-slate-400 flex justify-between font-mono">
          <span>♀ {latestRecord.display.weeklyMortalityPctF}</span>
          <span>♂ {latestRecord.display.weeklyMortalityPctM}</span>
        </div>
      </div>
    </div>
  );
}
