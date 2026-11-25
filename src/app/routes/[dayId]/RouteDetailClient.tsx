'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StallListItem } from '@/components/visits/StallListItem';
import { useWMSData } from '@/hooks/useWMSData';

interface RouteDetailClientProps {
  dayId: string;
}

export default function RouteDetailClient({ dayId }: RouteDetailClientProps) {
  const { routes, visits, getDayStats } = useWMSData();

  const currentRoute = routes.find((r) => r.id === dayId);
  const stats = getDayStats(dayId);

  if (!currentRoute && routes.length > 0) {
    return notFound();
  }

  const routeName = currentRoute?.name || 'Senin Malam';
  const totalStalls = currentRoute?.stalls.length || 25;
  const completedStalls = stats.completedStalls;

  return (
    <div className="flex flex-col min-h-full">
      <TopHeader
        title="Daftar Wedangan"
        subtitle={routeName}
        showBack={true}
        backHref="/routes"
      />

      <div className="p-4 space-y-4 flex-1">
        {/* Progress & Route Info Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{routeName}</h2>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
                {currentRoute?.routeArea || 'WILAYAH DISTRIBUSI'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-600 block">
                Progress:
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {completedStalls} dari {totalStalls} wedangan
              </span>
            </div>
          </div>

          <ProgressBar current={completedStalls} total={totalStalls} />

          {stats.isAllCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Semua wedangan selesai dicatat!</span>
              </div>
              <Link
                href="/summary"
                className="font-bold text-[#FF9012] underline hover:text-[#E67E08]"
              >
                Lihat Rekap
              </Link>
            </div>
          )}
        </div>

        {/* List of 25 Stalls */}
        <div className="space-y-2">
          {currentRoute?.stalls.map((stall) => {
            const visitKey = `${dayId}_${stall.id}`;
            const visit = visits[visitKey];

            return (
              <StallListItem
                key={stall.id}
                stall={stall}
                dayId={dayId}
                visit={visit}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
