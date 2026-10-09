'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLocaleTheme } from '@/context/LocaleThemeContext';
import { INITIAL_FLOCKS } from '@/lib/mockData';
import {
  LayoutDashboard,
  TableProperties,
  PlusCircle,
  BarChart3,
  FileSpreadsheet,
  FileDown,
  Settings,
  Shield,
  Sun,
  Moon,
  Globe,
  Wifi,
  WifiOff,
  ChevronDown,
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user, role, switchRole } = useAuth();
  const { theme, locale, toggleTheme, toggleLocale, t } = useLocaleTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [selectedFlockId, setSelectedFlockId] = useState('flock-2866');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: `/flocks/${selectedFlockId}/ledger`, label: t('ledger'), icon: TableProperties },
    { href: `/flocks/${selectedFlockId}/entry`, label: t('newEntry'), icon: PlusCircle, highlight: true },
    { href: '/comparison', label: t('comparison'), icon: BarChart3 },
    { href: '/import', label: t('import'), icon: FileSpreadsheet },
    { href: '/export', label: t('export'), icon: FileDown },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      {/* Offline Alert Strip if offline */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>{t('offline')}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Flock Selector */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                🐔
              </div>
              <div className="hidden min-[420px]:block">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white block leading-tight">
                  RBCL Flock Monitor
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
                  Unit-B Breeder
                </span>
              </div>
            </Link>

            {/* Active Flock Picker */}
            <div className="ml-1 sm:ml-4 relative">
              <select
                value={selectedFlockId}
                onChange={(e) => setSelectedFlockId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {INITIAL_FLOCKS.map((f) => (
                  <option key={f.id} value={f.id}>
                    Flock {f.flockNo} (Shed {f.shedNo} - {f.breed})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center Nav for larger screens */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    item.highlight
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Utilities: i18n, Theme, Role Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Toggle (EN / BN) */}
            <button
              onClick={toggleLocale}
              title="Toggle Bengali / English numbers and labels"
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{locale === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Light / Dark mode"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              )}
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  role === 'ADMIN'
                    ? 'bg-purple-950/60 border-purple-700 text-purple-300'
                    : role === 'MANAGER'
                    ? 'bg-blue-950/60 border-blue-700 text-blue-300'
                    : role === 'DATA_ENTRY'
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-700 text-amber-300'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">{role}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700/80">
                    Switch Active Role
                  </div>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>👑 Admin</span>
                    {role === 'ADMIN' && <span className="text-purple-400 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('manager');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>📊 Manager</span>
                    {role === 'MANAGER' && <span className="text-blue-400 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('data_entry');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>📱 Data Entry (Staff)</span>
                    {role === 'DATA_ENTRY' && <span className="text-emerald-400 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('viewer');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center justify-between"
                  >
                    <span>👁️ Viewer</span>
                    {role === 'VIEWER' && <span className="text-amber-400 font-bold">✓</span>}
                  </button>
                  <div className="border-t border-slate-700/80 mt-1 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setRoleMenuOpen(false)}
                      className="block px-3 py-1.5 text-slate-400 hover:text-white"
                    >
                      Login Details
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800 bg-slate-900 px-2 py-1 text-[11px]">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg font-medium transition-colors ${
                item.highlight
                  ? 'text-emerald-400 font-bold'
                  : isActive
                  ? 'text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
