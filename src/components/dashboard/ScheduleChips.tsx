'use client';

import React from 'react';
import Link from 'next/link';
import { RouteDay } from '@/types';

interface ScheduleChipsProps {
  routes: RouteDay[];
  activeDayId: string;
  onSelectDay?: (dayId: string) => void;
}

export const ScheduleChips: React.FC<ScheduleChipsProps> = ({
  routes,
  activeDayId,
  onSelectDay,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-1.5">
          <span>🗓️</span>
          <span>Jadwal Tersedia</span>
        </div>
        <span className="text-slate-400 font-medium">6 Hari</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {routes.map((route) => {
          const isActive = route.id === activeDayId;

          return (
            <Link
              key={route.id}
              href={`/routes/${route.id}`}
              onClick={() => onSelectDay?.(route.id)}
              className={`py-2 px-2.5 rounded-xl text-center text-xs transition-all duration-150 flex flex-col items-center justify-center border ${
                isActive
                  ? 'bg-[#FF9012] text-white border-[#FF9012] font-bold shadow-sm ring-2 ring-orange-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 font-medium'
              }`}
            >
              <span className="leading-tight">{route.shortName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
