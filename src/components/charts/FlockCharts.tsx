'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ComputedWeeklyRecord, round } from '@/lib/calculations';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import { Scale, TrendingDown, Activity, BarChart2 } from 'lucide-react';

interface FlockChartsProps {
  records: ComputedWeeklyRecord[];
}

export function FlockCharts({ records }: FlockChartsProps) {
  const { num } = useLocaleTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'weight' | 'depletion' | 'deviation' | 'mortality'>('weight');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || records.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
        Loading charts...
      </div>
    );
  }

  // Format chart data points
  const chartData = records.map((r) => ({
    ageWeeks: `Wk ${r.ageWeeks}`,
    ageNum: r.ageWeeks,
    stdWeightF: r.stdWeightF,
    actualWeightF: r.actualWeightF,
    stdWeightM: r.stdWeightM,
    actualWeightM: r.actualWeightM,
    weightDevF: r.weightDeviationGF,
    weightDevM: r.weightDeviationGM,
    weeklyDepF: round(r.weeklyDepletionPctF, 2),
    weeklyDepM: round(r.weeklyDepletionPctM, 2),
    cumDepF: round(r.cumulativeDepletionPctF, 2),
    cumDepM: round(r.cumulativeDepletionPctM, 2),
    mortF: round(r.weeklyMortalityPctF, 2),
    mortM: round(r.weeklyMortalityPctM, 2),
  }));

  const tabs = [
    { id: 'weight', label: 'Body Weight (Actual vs Std)', icon: Scale },
    { id: 'depletion', label: 'Cumulative & Weekly Depletion', icon: TrendingDown },
    { id: 'deviation', label: 'Weight Deviation Bars (g)', icon: BarChart2 },
    { id: 'mortality', label: 'Weekly Mortality %', icon: Activity },
  ] as const;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Chart Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">Flock Performance Curves</h2>
          <p className="text-xs text-slate-400">Interactive trends across all growing weeks</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[360px] sm:h-[420px] w-full">
        {/* Tab 1: Body Weight Curves */}
        {activeTab === 'weight' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis dataKey="ageWeeks" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                unit="g"
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {/* Female Actual & Standard */}
              <Line
                type="monotone"
                dataKey="actualWeightF"
                name="Female Actual (g)"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ec4899' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="stdWeightF"
                name="Female Standard (g)"
                stroke="#f472b6"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
              {/* Male Actual & Standard */}
              <Line
                type="monotone"
                dataKey="actualWeightM"
                name="Male Actual (g)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06b6d4' }}
              />
              <Line
                type="monotone"
                dataKey="stdWeightM"
                name="Male Standard (g)"
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Tab 2: Depletion Curves */}
        {activeTab === 'depletion' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis dataKey="ageWeeks" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="cumDepF"
                name="Female Cum. Depletion %"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.2}
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="cumDepM"
                name="Male Cum. Depletion %"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="weeklyDepF"
                name="Female Weekly Depletion %"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* Tab 3: Weight Deviation Bars */}
        {activeTab === 'deviation' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis dataKey="ageWeeks" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="g" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
              <Bar
                dataKey="weightDevF"
                name="Female Dev (g from std)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Tab 4: Weekly Mortality */}
        {activeTab === 'mortality' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
              <XAxis dataKey="ageWeeks" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <ReferenceLine
                y={1.0}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                label={{ value: '1% Threshold', fill: '#f43f5e', fontSize: 11, position: 'right' }}
              />
              <Bar dataKey="mortF" name="Female Mortality %" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mortM" name="Male Mortality %" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
