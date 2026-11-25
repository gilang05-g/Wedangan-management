import { Suspense } from 'react';
import { DUMMY_ROUTES } from '@/data/dummy-routes';
import StallFormClient from './StallFormClient';

export function generateStaticParams() {
  return DUMMY_ROUTES.flatMap((route) =>
    route.stalls.map((stall) => ({
      dayId: route.id,
      stallId: stall.id,
    }))
  );
}

interface StallFormPageProps {
  params: Promise<{ dayId: string; stallId: string }>;
}

async function StallFormLoader({ params }: StallFormPageProps) {
  const resolvedParams = await params;
  return (
    <StallFormClient
      dayId={resolvedParams.dayId}
      stallId={resolvedParams.stallId}
    />
  );
}

export default function StallFormPage({ params }: StallFormPageProps) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-xs text-slate-400">Memuat form...</div>}>
      <StallFormLoader params={params} />
    </Suspense>
  );
}
