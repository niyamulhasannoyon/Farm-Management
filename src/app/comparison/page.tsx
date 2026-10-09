'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  computeFlockRecords,
  ComputedWeeklyRecord,
  round,
} from '@/lib/calculations';
import {
  INITIAL_FLOCKS,
  getStoredFlockRecords,
  MockFlock,
} from '@/lib/mockData';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import {
  BarChart3,
  Award,
  TrendingDown,
  Scale,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';

interface FlockComparisonSummary {
  flock: MockFlock;
  latestAge: number;
  liveF: number;
  liveM: number;
  cumDepF: number;
  cumDepM: number;
  actualWeightF: number | null;
  stdWeightF: number | null;
  weightDevGF: number | null;
  weightDevPctF: number | null;
  uniformityF: number | null;
  records: ComputedWeeklyRecord[];
}

export default function ComparisonPage() {
  const { t, num } = useLocaleTheme();
  const [breedFilter, setBreedFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'depletion' | 'weight' | 'age'>('depletion');
  const [comparisonData, setComparisonData] = useState<FlockComparisonSummary[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const summaries: FlockComparisonSummary[] = INITIAL_FLOCKS.map((flock) => {
      const raw = getStoredFlockRecords(flock.id);
      const computed = computeFlockRecords(raw);
      const latest = computed[computed.length - 1];

      return {
        flock,
        latestAge: latest ? latest.ageWeeks : 0,
        liveF: latest ? latest.liveAtWeekEndF : 0,
        liveM: latest ? latest.liveAtWeekEndM : 0,
        cumDepF: latest ? latest.cumulativeDepletionPctF : 0,
        cumDepM: latest ? latest.cumulativeDepletionPctM : 0,
        actualWeightF: latest ? latest.actualWeightF : null,
        stdWeightF: latest ? latest.stdWeightF : null,
        weightDevGF: latest ? latest.weightDeviationGF : null,
        weightDevPctF: latest ? latest.weightDeviationPctF : null,
        uniformityF: latest ? latest.uniformityF : null,
        records: computed,
      };
    });

    setComparisonData(summaries);
  }, []);

  // Filter by breed
  const filtered = comparisonData.filter((item) => {
    if (breedFilter === 'ALL') return true;
    return item.flock.breed.toUpperCase() === breedFilter.toUpperCase();
  });

  // Sort flocks
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'depletion') {
      // Lower cumulative depletion ranks better
      return a.cumDepF - b.cumDepF;
    }
    if (sortBy === 'weight') {
      // Closest to 0 deviation ranks better
      const devA = Math.abs(a.weightDevPctF || 0);
      const devB = Math.abs(b.weightDevPctF || 0);
      return devA - devB;
    }
    return b.latestAge - a.latestAge;
  });

  // Prepare chart overlay data by Age Weeks
  const maxAge = Math.max(...comparisonData.map((c) => c.latestAge), 1);
  const chartPoints = [];
  for (let age = 1; age <= maxAge; age++) {
    const point: Record<string, unknown> = { age: `Wk ${age}`, ageNum: age };
    for (const c of comparisonData) {
      const rec = c.records.find((r) => r.ageWeeks === age);
      if (rec) {
        point[`dep_${c.flock.shedNo}`] = round(rec.cumulativeDepletionPctF, 2);
        point[`dev_${c.flock.shedNo}`] = rec.weightDeviationGF !== null ? round(rec.weightDeviationGF, 1) : null;
      }
    }
    chartPoints.push(point);
  }

  const shedColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
              Management Benchmarking
            </span>
            <span className="text-xs text-slate-400 font-medium">Unit-B All Active Sheds</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Flock & Shed Comparison</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare cumulative depletion, body weight trajectory, and rank active sheds across Unit-B.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Breed Filter */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none"
            >
              <option value="ALL">All Breeds</option>
              <option value="ROSS">Ross</option>
              <option value="IR">IR</option>
              <option value="SASSO">SASSO</option>
            </select>
          </div>

          {/* Sort By Picker */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400 mr-2">Rank by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'depletion' | 'weight' | 'age')}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none"
            >
              <option value="depletion">Lowest Depletion %</option>
              <option value="weight">Target Weight Accuracy</option>
              <option value="age">Flock Age (Weeks)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shed Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Active Shed Performance Ranking</h2>
          </div>
          <span className="text-xs text-slate-400">
            {sorted.length} Active Flocks Ranked
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-semibold text-slate-400">
              <tr>
                <th className="py-3 px-3 text-center">Rank</th>
                <th className="py-3 px-3">Shed & Flock</th>
                <th className="py-3 px-3">Breed</th>
                <th className="py-3 px-3 text-center">Current Age</th>
                <th className="py-3 px-3 text-right">Live Birds (F/M)</th>
                <th className="py-3 px-3 text-right text-purple-400">Cum. Depletion % (F)</th>
                <th className="py-3 px-3 text-right">Actual Wt (g)</th>
                <th className="py-3 px-3 text-right">Weight Dev (g)</th>
                <th className="py-3 px-3 text-right">Uniformity</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {sorted.map((item, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                const devG = item.weightDevGF || 0;

                return (
                  <tr key={item.flock.id} className="hover:bg-slate-800/50 transition-colors">
                    {/* Rank Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          isFirst
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : rank === 2
                            ? 'bg-slate-700 text-slate-200'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rank}
                      </span>
                    </td>

                    {/* Shed & Flock */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-white font-sans text-xs">
                        Shed {item.flock.shedNo}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Flock #{item.flock.flockNo}
                      </div>
                    </td>

                    {/* Breed */}
                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                        {item.flock.breed}
                      </span>
                    </td>

                    {/* Current Age */}
                    <td className="py-3 px-3 text-center font-bold text-emerald-400">
                      Wk {num(item.latestAge, 0)}
                    </td>

                    {/* Live Birds */}
                    <td className="py-3 px-3 text-right text-slate-200">
                      <span>{num(item.liveF, 0)}</span>
                      <span className="text-[10px] text-slate-500 ml-1">/ {num(item.liveM, 0)}</span>
                    </td>

                    {/* Cumulative Depletion */}
                    <td className="py-3 px-3 text-right font-bold text-purple-300">
                      {num(item.cumDepF, 2)}%
                    </td>

                    {/* Actual Weight */}
                    <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                      {item.actualWeightF ? `${num(item.actualWeightF, 0)}g` : '—'}
                    </td>

                    {/* Weight Dev */}
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        devG >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.weightDevGF !== null
                        ? `${devG >= 0 ? '+' : ''}${num(devG, 0)}g`
                        : '—'}
                    </td>

                    {/* Uniformity */}
                    <td className="py-3 px-3 text-right text-slate-300">
                      {item.uniformityF ? `${num(item.uniformityF, 1)}%` : '—'}
                    </td>

                    {/* Action Links */}
                    <td className="py-3 px-3 text-center">
                      <Link
                        href={`/flocks/${item.flock.id}/ledger`}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline font-sans"
                      >
                        <span>Ledger</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Overlay Charts */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Cumulative Depletion by Age */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-purple-400" />
                <span>Cumulative Depletion % by Age (All Sheds)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Comparing mortality & depletion progression across sheds
              </p>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartPoints} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                  <XAxis dataKey="age" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {comparisonData.map((c, i) => (
                    <Line
                      key={c.flock.id}
                      type="monotone"
                      dataKey={`dep_${c.flock.shedNo}`}
                      name={`Shed ${c.flock.shedNo} (F-${c.flock.flockNo})`}
                      stroke={shedColors[i % shedColors.length]}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Weight Deviation by Age */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Weight Deviation (g) by Age (All Sheds)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Tracking body weight deviation from breed standard
              </p>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartPoints} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
                  <XAxis dataKey="age" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="g" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {comparisonData.map((c, i) => (
                    <Line
                      key={c.flock.id}
                      type="monotone"
                      dataKey={`dev_${c.flock.shedNo}`}
                      name={`Shed ${c.flock.shedNo} (F-${c.flock.flockNo})`}
                      stroke={shedColors[i % shedColors.length]}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
