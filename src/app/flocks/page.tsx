'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import { canManageFlocks } from '@/lib/auth';
import { INITIAL_FLOCKS, MockFlock } from '@/lib/mockData';
import {
  Layers,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowRight,
  Calendar,
  Building,
} from 'lucide-react';

export default function FlocksAdminPage() {
  const { role } = useAuth();
  const { t, num } = useLocaleTheme();
  const isAllowed = canManageFlocks(role);

  const [flocks, setFlocks] = useState<MockFlock[]>(INITIAL_FLOCKS);
  const [modalOpen, setModalOpen] = useState(false);

  // New flock form state
  const [flockNo, setFlockNo] = useState('');
  const [shedNo, setShedNo] = useState('04');
  const [breed, setBreed] = useState('Ross');
  const [housingDate, setHousingDate] = useState(new Date().toISOString().split('T')[0]);

  const handleToggleStatus = (id: string) => {
    if (!isAllowed) return;
    setFlocks((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' } : f
      )
    );
  };

  const handleCreateFlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flockNo || !isAllowed) return;

    const newFlock: MockFlock = {
      id: `flock-${flockNo}`,
      flockNo,
      shedNo,
      breed,
      unit: 'B',
      housingDate,
      status: 'ACTIVE',
    };

    setFlocks([...flocks, newFlock]);
    setFlockNo('');
    setModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              Flocks Administration
            </span>
            <span className="text-xs text-slate-400 font-medium">Unit-B Breeder Sheds</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Flock Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Register new flocks, assign sheds, define breeds, and archive closed flocks.
          </p>
        </div>

        {isAllowed && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Flock</span>
          </button>
        )}
      </div>

      {!isAllowed && (
        <div className="bg-rose-950/70 border border-rose-800 text-rose-200 p-4 rounded-xl flex items-center gap-3 text-xs">
          <Lock className="w-5 h-5 text-rose-400 shrink-0" />
          <span>
            Only <strong>ADMIN</strong> and <strong>MANAGER</strong> accounts can register or close flocks.
          </span>
        </div>
      )}

      {/* Flocks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Flocks Directory ({flocks.length})</h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-semibold text-slate-400">
              <tr>
                <th className="py-3 px-4">Flock No</th>
                <th className="py-3 px-4">Shed</th>
                <th className="py-3 px-4">Breed</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Housing Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {flocks.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white font-sans text-sm">
                    Flock {f.flockNo}
                  </td>
                  <td className="py-3 px-4 text-slate-300">Shed {f.shedNo}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-semibold border border-slate-700">
                      {f.breed}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Unit-{f.unit}</td>
                  <td className="py-3 px-4 text-slate-400">{f.housingDate}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}
                    >
                      {f.status === 'ACTIVE' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{f.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/flocks/${f.id}/ledger`}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Ledger
                      </Link>

                      {isAllowed && (
                        <button
                          onClick={() => handleToggleStatus(f.id)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                            f.status === 'ACTIVE'
                              ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {f.status === 'ACTIVE' ? 'Close Flock' : 'Reopen'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Flock Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Register New Flock</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Flock Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2869"
                  value={flockNo}
                  onChange={(e) => setFlockNo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Shed Number
                  </label>
                  <select
                    value={shedNo}
                    onChange={(e) => setShedNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="01">Shed 01</option>
                    <option value="02">Shed 02</option>
                    <option value="03">Shed 03</option>
                    <option value="04">Shed 04</option>
                    <option value="05">Shed 05</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Breed</label>
                  <select
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Ross">Ross 308</option>
                    <option value="IR">Indian River (IR)</option>
                    <option value="SASSO">SASSO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Housing Date
                </label>
                <input
                  type="date"
                  value={housingDate}
                  onChange={(e) => setHousingDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40"
                >
                  Create Flock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
