import { Suspense } from 'react';
import { DUMMY_ROUTES } from '@/data/dummy-routes';
import RekapClient from './RekapClient';

export function generateStaticParams() {
  return DUMMY_ROUTES.map((route) => ({
    dayId: route.id,
  }));
}

interface RekapPageProps {
  params: Promise<{ dayId: string }>;
}

async function RekapLoader({ params }: RekapPageProps) {
  const resolvedParams = await params;
  return <RekapClient dayId={resolvedParams.dayId} />;
}

export default function RekapPage({ params }: RekapPageProps) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-xs text-slate-400">Memuat rekap...</div>}>
      <RekapLoader params={params} />
    </Suspense>
  );
}
