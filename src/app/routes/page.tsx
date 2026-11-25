'use client';

import React from 'react';
import { TopHeader } from '@/components/layout/TopHeader';
import { RouteCard } from '@/components/routes/RouteCard';
import { useWMSData } from '@/hooks/useWMSData';

export default function RoutesPage() {
  const { routes, getDayStats } = useWMSData();

  return (
    <div className="flex flex-col min-h-full">
      <TopHeader
        title="Daftar Rute"
        subtitle="Pilih jadwal distribusi yang ingin dikerjakan"
        showBack={true}
        backHref="/"
        showSettings={true}
      />

      <div className="p-4 space-y-3 flex-1">
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-800">
          <p className="font-semibold">Pilih jadwal distribusi:</p>
          <p className="text-sky-600 mt-0.5">
            Tersedia 6 jadwal distribusi reguler dengan ~25 wedangan pada tiap jadwal.
          </p>
        </div>

        <div className="space-y-2.5">
          {routes.map((route) => {
            const stats = getDayStats(route.id);
            return (
              <RouteCard
                key={route.id}
                route={route}
                completedStalls={stats.completedStalls}
                totalStalls={stats.totalStalls}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
