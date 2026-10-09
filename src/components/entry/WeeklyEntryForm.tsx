'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { weeklyRecordSchema, WeeklyRecordFormData } from '@/lib/schemas/weeklyRecord';
import {
  calculateSingleWeekPreview,
  validateWeeklyRecordInputs,
  WeeklyInputData,
  computeFlockRecords,
} from '@/lib/calculations';
import {
  getStoredFlockRecords,
  saveStoredFlockRecords,
  getNextWeekPrefill,
  INITIAL_FLOCKS,
} from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import { canEditWeeklyRecord } from '@/lib/auth';
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingDown,
  Scale,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WeeklyEntryFormProps {
  flockId: string;
  initialAgeWeeks?: number;
  onSuccess?: () => void;
}

export function WeeklyEntryForm({ flockId, initialAgeWeeks, onSuccess }: WeeklyEntryFormProps) {
  const router = useRouter();
  const { role } = useAuth();
  const { t, num, date, locale } = useLocaleTheme();

  const [existingRecords, setExistingRecords] = useState<WeeklyInputData[]>([]);
  const [maxAgeWeeks, setMaxAgeWeeks] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const flock = INITIAL_FLOCKS.find((f) => f.id === flockId) || INITIAL_FLOCKS[0];

  // Load existing records
  useEffect(() => {
    const records = getStoredFlockRecords(flockId);
    setExistingRecords(records);
    if (records.length > 0) {
      const maxAge = Math.max(...records.map((r) => r.ageWeeks));
      setMaxAgeWeeks(maxAge);
    }
  }, [flockId]);

  // Compute prefill values or find existing record for editing
  const isEditing = initialAgeWeeks !== undefined;
  const existingRecordToEdit = isEditing
    ? existingRecords.find((r) => r.ageWeeks === initialAgeWeeks)
    : null;

  const prefill = getNextWeekPrefill(flockId, flock.breed);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WeeklyRecordFormData>({
    resolver: zodResolver(weeklyRecordSchema),
    defaultValues: {
      flockId,
      ageWeeks: existingRecordToEdit?.ageWeeks ?? (initialAgeWeeks || prefill.ageWeeks),
      weekEndDate: existingRecordToEdit?.weekEndDate
        ? new Date(existingRecordToEdit.weekEndDate).toISOString().split('T')[0]
        : prefill.weekEndDate,
      housedF: existingRecordToEdit?.housedF ?? prefill.housedF,
      housedM: existingRecordToEdit?.housedM ?? prefill.housedM,
      mortalityF: existingRecordToEdit?.mortalityF ?? 0,
      mortalityM: existingRecordToEdit?.mortalityM ?? 0,
      soldF: existingRecordToEdit?.soldF ?? 0,
      soldM: existingRecordToEdit?.soldM ?? 0,
      stdWeightF: existingRecordToEdit?.stdWeightF ?? prefill.stdWeightF,
      actualWeightF: existingRecordToEdit?.actualWeightF ?? null,
      stdWeightM: existingRecordToEdit?.stdWeightM ?? prefill.stdWeightM,
      actualWeightM: existingRecordToEdit?.actualWeightM ?? null,
      uniformityF: existingRecordToEdit?.uniformityF ?? null,
      uniformityM: existingRecordToEdit?.uniformityM ?? null,
      feedGPerBirdF: existingRecordToEdit?.feedGPerBirdF ?? null,
      feedGPerBirdM: existingRecordToEdit?.feedGPerBirdM ?? null,
    },
  });

  // Watch form fields for live math calculations
  const formValues = watch();

  // Check role permission for this age
  useEffect(() => {
    const age = Number(formValues.ageWeeks) || 1;
    const authCheck = canEditWeeklyRecord(role, age, maxAgeWeeks);
    if (!authCheck.allowed) {
      setPermissionError(authCheck.reason || 'You do not have permission to edit this week.');
    } else {
      setPermissionError(null);
    }
  }, [formValues.ageWeeks, role, maxAgeWeeks]);

  // Compute prior cumulative depletion for live preview
  const priorRecords = existingRecords.filter((r) => r.ageWeeks < (formValues.ageWeeks || 1));
  const priorComputed = computeFlockRecords(priorRecords);
  const lastPrior = priorComputed[priorComputed.length - 1];
  const prevCumDepF = lastPrior ? lastPrior.cumulativeDepletionPctF : 0;
  const prevCumDepM = lastPrior ? lastPrior.cumulativeDepletionPctM : 0;

  // Live calculation preview
  const livePreview = calculateSingleWeekPreview(
    {
      ageWeeks: Number(formValues.ageWeeks) || 1,
      weekEndDate: formValues.weekEndDate || '',
      housedF: Number(formValues.housedF) || 0,
      housedM: Number(formValues.housedM) || 0,
      mortalityF: Number(formValues.mortalityF) || 0,
      mortalityM: Number(formValues.mortalityM) || 0,
      soldF: Number(formValues.soldF) || 0,
      soldM: Number(formValues.soldM) || 0,
      stdWeightF: formValues.stdWeightF ? Number(formValues.stdWeightF) : null,
      actualWeightF: formValues.actualWeightF ? Number(formValues.actualWeightF) : null,
      stdWeightM: formValues.stdWeightM ? Number(formValues.stdWeightM) : null,
      actualWeightM: formValues.actualWeightM ? Number(formValues.actualWeightM) : null,
      uniformityF: formValues.uniformityF ? Number(formValues.uniformityF) : null,
      uniformityM: formValues.uniformityM ? Number(formValues.uniformityM) : null,
      feedGPerBirdF: formValues.feedGPerBirdF ? Number(formValues.feedGPerBirdF) : null,
      feedGPerBirdM: formValues.feedGPerBirdM ? Number(formValues.feedGPerBirdM) : null,
    },
    prevCumDepF,
    prevCumDepM
  );

  // Live sanity warnings
  const sanityCheck = validateWeeklyRecordInputs({
    housedF: Number(formValues.housedF) || 0,
    housedM: Number(formValues.housedM) || 0,
    mortalityF: Number(formValues.mortalityF) || 0,
    mortalityM: Number(formValues.mortalityM) || 0,
    soldF: Number(formValues.soldF) || 0,
    soldM: Number(formValues.soldM) || 0,
    actualWeightF: formValues.actualWeightF ? Number(formValues.actualWeightF) : null,
    actualWeightM: formValues.actualWeightM ? Number(formValues.actualWeightM) : null,
    existingAges: isEditing
      ? existingRecords.filter((r) => r.ageWeeks !== initialAgeWeeks).map((r) => r.ageWeeks)
      : existingRecords.map((r) => r.ageWeeks),
    ageWeeks: Number(formValues.ageWeeks) || 1,
  });

  const onSubmit = (data: WeeklyRecordFormData) => {
    if (permissionError) return;

    const newRecord: WeeklyInputData = {
      ageWeeks: Number(data.ageWeeks),
      weekEndDate: data.weekEndDate,
      housedF: Number(data.housedF),
      housedM: Number(data.housedM),
      mortalityF: Number(data.mortalityF) || 0,
      mortalityM: Number(data.mortalityM) || 0,
      soldF: Number(data.soldF) || 0,
      soldM: Number(data.soldM) || 0,
      stdWeightF: data.stdWeightF ? Number(data.stdWeightF) : null,
      actualWeightF: data.actualWeightF ? Number(data.actualWeightF) : null,
      stdWeightM: data.stdWeightM ? Number(data.stdWeightM) : null,
      actualWeightM: data.actualWeightM ? Number(data.actualWeightM) : null,
      uniformityF: data.uniformityF ? Number(data.uniformityF) : null,
      uniformityM: data.uniformityM ? Number(data.uniformityM) : null,
      feedGPerBirdF: data.feedGPerBirdF ? Number(data.feedGPerBirdF) : null,
      feedGPerBirdM: data.feedGPerBirdM ? Number(data.feedGPerBirdM) : null,
    };

    // Filter out previous version of this week if updating
    const updated = existingRecords.filter((r) => r.ageWeeks !== newRecord.ageWeeks);
    updated.push(newRecord);
    updated.sort((a, b) => a.ageWeeks - b.ageWeeks);

    saveStoredFlockRecords(flockId, updated);
    setSaveSuccess(true);

    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/flocks/${flockId}/ledger`);
      }
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Top Banner / Heading */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Flock {flock.flockNo} · Shed {flock.shedNo}
              </span>
              <span className="text-xs text-slate-400 font-medium">Breed: {flock.breed}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {isEditing ? `Edit Week ${initialAgeWeeks} Record` : 'New Weekly Entry'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Optimized for mobile touch entry. Formulas calculate live as you enter values.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/flocks/${flockId}/ledger`)}
            className="self-start sm:self-auto px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
          >
            ← View Ledger
          </button>
        </div>
      </div>

      {/* Permission Restriction Alert */}
      {permissionError && (
        <div className="mb-6 bg-rose-950/80 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-start gap-3 text-xs shadow-lg">
          <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-sm font-bold text-rose-300 mb-0.5">Editing Locked</strong>
            <p>{permissionError}</p>
          </div>
        </div>
      )}

      {/* Sanity Error & Warning Callouts */}
      {sanityCheck.errors.length > 0 && (
        <div className="mb-6 bg-red-950/70 border border-red-800 text-red-200 p-4 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-red-300">
            <AlertTriangle className="w-4 h-4" />
            <span>Impossible values detected:</span>
          </div>
          {sanityCheck.errors.map((err, i) => (
            <div key={i} className="pl-5">
              • {err}
            </div>
          ))}
        </div>
      )}

      {/* Live Auto-Calculation Preview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            End Live Birds
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white">
              {num(livePreview.liveAtWeekEndTotal, 0)}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>F: {num(livePreview.liveAtWeekEndF, 0)}</span>
            <span>M: {num(livePreview.liveAtWeekEndM, 0)}</span>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Weekly Depletion %
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {livePreview.display.weeklyDepletionPctF}
            </span>
            <span className="text-xs text-slate-400">(F)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Male: <strong className="text-slate-200">{livePreview.display.weeklyDepletionPctM}</strong>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Cumulative Depletion
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-purple-400">
              {livePreview.display.cumulativeDepletionPctF}
            </span>
            <span className="text-xs text-slate-400">(F)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Male: <strong className="text-slate-200">{livePreview.display.cumulativeDepletionPctM}</strong>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 sm:p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Weight Deviation (F)
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-xl sm:text-2xl font-black ${
                (livePreview.weightDeviationGF || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {livePreview.display.weightDeviationGF} g
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Diff: <strong className="text-slate-200">{livePreview.display.weightDeviationPctF}</strong>
          </div>
        </div>
      </div>

      {/* Main Entry Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Week & Date Identification */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>1. Week Timeline & Schedule</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('ageWeeks')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                {...register('ageWeeks')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. 20"
              />
              {errors.ageWeeks && (
                <p className="text-rose-400 text-xs mt-1">{errors.ageWeeks.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('weekEndDate')} <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                {...register('weekEndDate')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-base font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {errors.weekEndDate && (
                <p className="text-rose-400 text-xs mt-1">{errors.weekEndDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Female Birds (Housed, Mortality, Sold, Weight, Uniformity, Feed) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
              <span>♀️ {t('female')} Birds (মাদি)</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Live At End:{' '}
              <strong className="text-pink-300 font-bold">{num(livePreview.liveAtWeekEndF, 0)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Housed F */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('housed')} <span className="text-xs text-slate-500">(Start)</span>
              </label>
              <input
                type="number"
                {...register('housedF')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-pink-500"
              />
              {errors.housedF && (
                <p className="text-rose-400 text-[10px] mt-0.5">{errors.housedF.message}</p>
              )}
            </div>

            {/* Mortality F */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('mortality')}
              </label>
              <input
                type="number"
                {...register('mortalityF')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold text-rose-300 focus:outline-none focus:border-rose-500"
              />
              {errors.mortalityF && (
                <p className="text-rose-400 text-[10px] mt-0.5">{errors.mortalityF.message}</p>
              )}
            </div>

            {/* Sold F */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('sold')}
              </label>
              <input
                type="number"
                {...register('soldF')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Actual Weight F */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('actualWeight')} <span className="text-slate-500">(g)</span>
              </label>
              <input
                type="number"
                step="any"
                {...register('actualWeightF')}
                placeholder={`Std: ${formValues.stdWeightF || '—'}`}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Standard Weight F */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('stdWeight')} <span className="text-slate-500">(g)</span>
              </label>
              <input
                type="number"
                step="any"
                {...register('stdWeightF')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Uniformity F */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('uniformity')}
              </label>
              <input
                type="number"
                step="any"
                {...register('uniformityF')}
                placeholder="e.g. 85"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Feed g per bird F */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('feed')}
              </label>
              <input
                type="number"
                step="any"
                {...register('feedGPerBirdF')}
                placeholder="e.g. 110"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Male Birds (Housed, Mortality, Sold, Weight, Uniformity, Feed) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <span>♂️ {t('male')} Birds (মোরগ)</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Live At End:{' '}
              <strong className="text-blue-300 font-bold">{num(livePreview.liveAtWeekEndM, 0)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Housed M */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('housed')} <span className="text-xs text-slate-500">(Start)</span>
              </label>
              <input
                type="number"
                {...register('housedM')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-blue-500"
              />
              {errors.housedM && (
                <p className="text-rose-400 text-[10px] mt-0.5">{errors.housedM.message}</p>
              )}
            </div>

            {/* Mortality M */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('mortality')}
              </label>
              <input
                type="number"
                {...register('mortalityM')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold text-rose-300 focus:outline-none focus:border-rose-500"
              />
              {errors.mortalityM && (
                <p className="text-rose-400 text-[10px] mt-0.5">{errors.mortalityM.message}</p>
              )}
            </div>

            {/* Sold M */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('sold')}
              </label>
              <input
                type="number"
                {...register('soldM')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Actual Weight M */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('actualWeight')} <span className="text-slate-500">(g)</span>
              </label>
              <input
                type="number"
                step="any"
                {...register('actualWeightM')}
                placeholder={`Std: ${formValues.stdWeightM || '—'}`}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base sm:text-lg font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Standard Weight M */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('stdWeight')} <span className="text-slate-500">(g)</span>
              </label>
              <input
                type="number"
                step="any"
                {...register('stdWeightM')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Uniformity M */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('uniformity')}
              </label>
              <input
                type="number"
                step="any"
                {...register('uniformityM')}
                placeholder="e.g. 85"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Feed g per bird M */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t('feed')}
              </label>
              <input
                type="number"
                step="any"
                {...register('feedGPerBirdM')}
                placeholder="e.g. 120"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push(`/flocks/${flockId}/ledger`)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            {t('cancel')}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !!permissionError || !sanityCheck.isValid}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
              permissionError || !sanityCheck.isValid
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <span>{t('saving')}</span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-white" /> Saved Successfully!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {t('save')}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
