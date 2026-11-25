'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { Stall, VisitRecord } from '@/types';

interface StallListItemProps {
  stall: Stall;
  dayId: string;
  visit?: VisitRecord;
}

export const StallListItem: React.FC<StallListItemProps> = ({
  stall,
  dayId,
  visit,
}) => {
  const isCompleted = visit?.isCompleted ?? false;

  return (
    <Link
      href={`/routes/${dayId}/${stall.id}`}
      className={`border rounded-2xl p-3.5 flex items-center justify-between transition-colors shadow-xs ${
        isCompleted
          ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300'
          : 'bg-white border-slate-200 hover:border-orange-300'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">
          {isCompleted ? (
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xs">
              <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full border-2 border-slate-300 flex items-center justify-center bg-white">
              <Circle className="w-3.5 h-3.5 text-transparent" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">
            {stall.sequence}. {stall.name}
          </h4>
          <p
            className={`text-[11px] font-medium ${
              isCompleted ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {isCompleted ? 'Sudah dicatat' : 'Belum dicatat'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {isCompleted && visit && (
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-700 block">
              Laku: {visit.qtyTerjual}
            </span>
            <span className="text-[10px] text-slate-400">
              Sisa: {visit.stockAkhir}
            </span>
          </div>
        )}
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </Link>
  );
};
