import { Suspense } from 'react';
import { DUMMY_ROUTES } from '@/data/dummy-routes';
import RouteDetailClient from './RouteDetailClient';

export function generateStaticParams() {
  return DUMMY_ROUTES.map((route) => ({
    dayId: route.id,
  }));
}

interface RouteDetailPageProps {
  params: Promise<{ dayId: string }>;
}

async function RouteDetailLoader({ params }: RouteDetailPageProps) {
  const resolvedParams = await params;
  return <RouteDetailClient dayId={resolvedParams.dayId} />;
}

export default function RouteDetailPage({ params }: RouteDetailPageProps) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-xs text-slate-400">Memuat rute...</div>}>
      <RouteDetailLoader params={params} />
    </Suspense>
  );
}
