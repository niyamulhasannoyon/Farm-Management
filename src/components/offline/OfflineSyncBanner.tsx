'use client';

import React, { useState, useEffect } from 'react';
import { getPendingOfflineCount, syncOfflineQueue } from '@/lib/dexie';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export function OfflineSyncBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const checkPending = async () => {
    const count = await getPendingOfflineCount();
    setPendingCount(count);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const { syncedCount } = await syncOfflineQueue();
      await checkPending();
      if (syncedCount > 0) {
        setSyncStatusMsg(`Successfully synced ${syncedCount} offline records!`);
        setTimeout(() => setSyncStatusMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to sync offline queue:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    checkPending();

    // Register PWA Service Worker in production/supported environments
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration note:', err));
    }

    const handleOnline = () => {
      setIsOnline(true);
      handleSync(); // Auto-sync on reconnection!
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkPending, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0 && !syncStatusMsg) {
    return null;
  }

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {!isOnline ? (
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You are currently offline. New weekly records are stored locally in Dexie IndexedDB.</span>
          </div>
        ) : pendingCount > 0 ? (
          <div className="flex items-center gap-2 text-blue-300 font-semibold">
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-400" />
            <span>Online. {pendingCount} offline records queued in IndexedDB.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {isOnline && pendingCount > 0 && (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
