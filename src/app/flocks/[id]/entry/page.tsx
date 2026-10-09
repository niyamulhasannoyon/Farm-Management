'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { WeeklyEntryForm } from '@/components/entry/WeeklyEntryForm';

function EntryFormWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();

  const flockId = (params?.id as string) || 'flock-2866';
  const ageParam = searchParams.get('age');
  const initialAge = ageParam ? parseInt(ageParam, 10) : undefined;

  return <WeeklyEntryForm flockId={flockId} initialAgeWeeks={initialAge} />;
}

export default function EntryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading entry form...</div>}>
      <EntryFormWrapper />
    </Suspense>
  );
}
