'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Coins, ArrowRight } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { TodayCard } from '@/components/dashboard/TodayCard';
import { ScheduleChips } from '@/components/dashboard/ScheduleChips';
import { StatCard } from '@/components/ui/StatCard';
import { useWMSData } from '@/hooks/useWMSData';
import { formatRupiah } from '@/lib/calculations';

export default function DashboardPage() {
  const { isHydrated, routes, settings, activeRoute, getDayStats } = useWMSData();

  const activeStats = getDayStats(activeRoute?.id || 'senin-malam');

  return (
    <div className="flex flex-col min-h-full">
      {/* Orange Top Header */}
      <TopHeader
        title="WMS"
        subtitle="Wedangan Management System"
        isDashboard={true}
        showBack={false}
      />

      <div className="p-4 space-y-4 flex-1">
        {/* Today Info Card */}
        <TodayCard
          dayName={activeRoute?.name || 'Senin Malam'}
          dayId={activeRoute?.id || 'senin-malam'}
          formattedDate="Senin, 25 Nov 2026"
        />

        {/* 3 Metric Stat Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            icon={ShoppingBag}
            iconBgColor="bg-sky-50"
            iconColor="text-[#3EB8EB]"
            value={isHydrated ? activeStats.totalStalls : 25}
            label="Wedangan"
          />
          <StatCard
            icon={ShoppingCart}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-500"
            value={isHydrated ? activeStats.totalQtyTerjual : 0}
            label="Total Laku"
          />
          <StatCard
            icon={Coins}
            iconBgColor="bg-amber-50"
            iconColor="text-[#FF9012]"
            value={isHydrated ? formatRupiah(activeStats.totalGrossSales) : 'Rp0'}
            label="Penjualan"
          />
        </div>

        {/* Big Call to Action Button */}
        <Link
          href={`/routes/${activeRoute?.id || 'senin-malam'}`}
          className="w-full bg-[#FF9012] hover:bg-[#E67E08] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-orange-200 active:scale-[0.99] transition-all"
        >
          <span>Lihat Rute Hari Ini</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* 6 Available Route Schedules */}
        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-xs">
          <ScheduleChips
            routes={routes}
            activeDayId={settings.activeDayId}
          />
        </div>

        {/* Route Summary Overview Card */}
        <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/40 border border-orange-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Status Kunjungan</span>
            <span className="text-xs font-semibold text-[#FF9012]">
              {activeStats.completedStalls} / {activeStats.totalStalls} Selesai
            </span>
          </div>
          <div className="w-full bg-orange-100/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#FF9012] h-2 rounded-full transition-all duration-300"
              style={{ width: `${activeStats.progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Rute: <strong className="text-slate-700">{activeRoute?.routeArea}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
