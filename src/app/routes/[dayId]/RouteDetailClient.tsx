'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react';
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

          {/* Rekapitulasi Quick Link Banner */}
          {stats.isAllCompleted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Semua wedangan selesai dicatat!</span>
              </div>
              <Link
                href={`/routes/${dayId}/rekap`}
                className="font-bold text-[#FF9012] hover:text-[#E67E08] flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Lihat Rekap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                {totalStalls - completedStalls} tempat belum dicatat
              </span>
              <Link
                href={`/routes/${dayId}/rekap`}
                className="text-[11px] font-bold text-slate-500 hover:text-orange-500 flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                <span>Ringkasan Sementara</span>
              </Link>
            </div>
          )}
        </div>

        {/* CTA Selesaikan Rute when done */}
        {stats.isAllCompleted && (
          <Link
            href={`/routes/${dayId}/rekap`}
            className="w-full bg-[#FF9012] hover:bg-[#E67E08] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-orange-200 active:scale-[0.99] transition-all"
          >
            <span>Selesaikan Rute & Kirim WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}

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
