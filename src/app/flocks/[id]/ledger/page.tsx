'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { WeeklyLedgerTable } from '@/components/ledger/WeeklyLedgerTable';

export default function LedgerPage() {
  const params = useParams();
  const flockId = (params?.id as string) || 'flock-2866';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <WeeklyLedgerTable flockId={flockId} />
    </div>
  );
}
