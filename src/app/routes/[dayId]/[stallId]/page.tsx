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

export default async function StallFormPage({ params }: StallFormPageProps) {
  const resolvedParams = await params;
  return (
    <StallFormClient
      dayId={resolvedParams.dayId}
      stallId={resolvedParams.stallId}
    />
  );
}
