'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, User, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, role, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDemoLogin = (roleKey: 'admin' | 'manager' | 'data_entry' | 'viewer') => {
    switchRole(roleKey);
    setMessage(`Logged in as ${roleKey.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In production this connects to supabase.auth.signInWithPassword
    // For demo/offline, fallback to matching demo account or default staff
    setTimeout(() => {
      if (email.includes('admin')) {
        switchRole('admin');
      } else if (email.includes('manager')) {
        switchRole('manager');
      } else if (email.includes('viewer')) {
        switchRole('viewer');
      } else {
        switchRole('data_entry');
      }
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mb-3 shadow-inner">
            <span className="text-2xl font-black">🐔</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">RBCL Flock Monitor</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Unit-B Breeder Farm Management
          </p>
        </div>

        {/* Quick Demo Role Switcher */}
        <div className="mb-6 bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>Select Demo Role for Instant Access:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('admin')}
              className={`p-2.5 rounded-lg border font-medium flex flex-col items-start transition-all ${
                role === 'ADMIN'
                  ? 'bg-purple-900/40 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                👑 Admin
                {role === 'ADMIN' && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
              </span>
              <span className="text-[10px] text-slate-400">Edit any week & settings</span>
            </button>

            <button
              onClick={() => handleDemoLogin('manager')}
              className={`p-2.5 rounded-lg border font-medium flex flex-col items-start transition-all ${
                role === 'MANAGER'
                  ? 'bg-blue-900/40 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                📊 Manager
                {role === 'MANAGER' && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
              </span>
              <span className="text-[10px] text-slate-400">Full reports & flock controls</span>
            </button>

            <button
              onClick={() => handleDemoLogin('data_entry')}
              className={`p-2.5 rounded-lg border font-medium flex flex-col items-start transition-all ${
                role === 'DATA_ENTRY'
                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                📱 Data Entry
                {role === 'DATA_ENTRY' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </span>
              <span className="text-[10px] text-slate-400">Shed staff (last 2 weeks only)</span>
            </button>

            <button
              onClick={() => handleDemoLogin('viewer')}
              className={`p-2.5 rounded-lg border font-medium flex flex-col items-start transition-all ${
                role === 'VIEWER'
                  ? 'bg-amber-900/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <span className="font-bold flex items-center gap-1">
                👁️ Viewer
                {role === 'VIEWER' && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
              </span>
              <span className="text-[10px] text-slate-400">Read-only auditing</span>
            </button>
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@rbcl.farm"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {message && (
          <div className="mt-4 p-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg text-center">
            {message}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-xs text-slate-500">
          Currently signed in as: <strong className="text-slate-300">{user?.fullName || 'Guest'}</strong> (
          <span className="text-emerald-400 font-mono">{role}</span>)
        </div>
      </div>
    </div>
  );
}
