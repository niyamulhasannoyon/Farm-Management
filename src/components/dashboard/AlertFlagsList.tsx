'use client';

import React from 'react';
import Link from 'next/link';
import { AlertFlag } from '@/lib/alerts';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import { AlertTriangle, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

interface AlertFlagsListProps {
  flags: AlertFlag[];
  flockId: string;
}

export function AlertFlagsList({ flags, flockId }: AlertFlagsListProps) {
  const { num } = useLocaleTheme();

  if (flags.length === 0) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-2xl p-4 sm:p-5 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="text-sm font-semibold text-emerald-300 block">
            All Parameters Healthy
          </span>
          <span className="text-xs text-slate-400">
            No mortality spikes (&gt;1%) or major weight deviations (&gt;10%) detected for this flock.
          </span>
        </div>
      </div>
    );
  }

  const criticalCount = flags.filter((f) => f.severity === 'critical').length;
  const warnCount = flags.filter((f) => f.severity === 'warn').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Performance Flags & Anomalies ({flags.length})
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
              {criticalCount} Critical (≥2x)
            </span>
          )}
          {warnCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              {warnCount} Warning (≥1x)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
        {flags.slice(0, 8).map((flag) => (
          <div
            key={flag.id}
            className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors ${
              flag.severity === 'critical'
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {flag.severity === 'critical' ? (
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Week {num(flag.ageWeeks, 0)}:</span>
                  <span className="font-semibold">{flag.metric}</span>
                  <span
                    className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-bold ${
                      flag.severity === 'critical'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-slate-900'
                    }`}
                  >
                    {flag.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">{flag.message}</p>
              </div>
            </div>

            <Link
              href={`/flocks/${flockId}/entry?age=${flag.ageWeeks}`}
              className="text-[11px] underline hover:text-white shrink-0 self-center flex items-center gap-0.5 opacity-80 hover:opacity-100"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
