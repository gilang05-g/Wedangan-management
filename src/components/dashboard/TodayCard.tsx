'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ChevronRight } from 'lucide-react';

interface TodayCardProps {
  dayName: string;
  dayId: string;
  formattedDate?: string;
}

export const TodayCard: React.FC<TodayCardProps> = ({
  dayName,
  dayId,
  formattedDate = 'Senin, 25 Nov 2026',
}) => {
  return (
    <Link
      href={`/routes/${dayId}`}
      className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-orange-300 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9012]">
          <Store className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Hari Ini • {dayName}
          </span>
          <h2 className="text-sm font-bold text-slate-800 leading-tight">
            {formattedDate}
          </h2>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
};
