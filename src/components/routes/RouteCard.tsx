import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import { RouteDay } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface RouteCardProps {
  route: RouteDay;
  completedStalls: number;
  totalStalls: number;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  completedStalls,
  totalStalls,
}) => {
  const isCompleted = totalStalls > 0 && completedStalls === totalStalls;
  const isStarted = completedStalls > 0 && !isCompleted;

  let badgeVariant: 'success' | 'warning' | 'info' | 'default' = 'warning';
  let badgeText = 'Belum Dikerjakan';

  if (isCompleted) {
    badgeVariant = 'success';
    badgeText = 'Selesai';
  } else if (isStarted) {
    badgeVariant = 'info';
    badgeText = `${completedStalls}/${totalStalls} Selesai`;
  } else if (completedStalls === 0 && totalStalls > 0) {
    badgeVariant = 'warning';
    badgeText = 'Belum Dikerjakan';
  }

  return (
    <Link
      href={`/routes/${route.id}`}
      className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-orange-300 transition-colors"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#3EB8EB]">
          <Calendar className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-snug">
            {route.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {totalStalls} Wedangan
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={badgeVariant}>{badgeText}</Badge>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </Link>
  );
};
