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

export default async function RouteDetailPage({ params }: RouteDetailPageProps) {
  const resolvedParams = await params;
  return <RouteDetailClient dayId={resolvedParams.dayId} />;
}
