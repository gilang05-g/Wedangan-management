'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useWMSData } from '@/hooks/useWMSData';
import { formatRupiah } from '@/lib/calculations';

export default function SummaryPage() {
  const { routes, getDayStats } = useWMSData();

  return (
    <div className="flex flex-col min-h-full">
      <TopHeader
        title="Laporan Distribusi"
        subtitle="Rekapitulasi penjualan & setoran"
        showBack={true}
        backHref="/"
      />

      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9012]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Ringkasan Tiap Rute</h2>
              <p className="text-xs text-slate-500 font-medium">Status pencatatan 6 jadwal distribusi</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {routes.map((route) => {
            const stats = getDayStats(route.id);
            return (
              <div
                key={route.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{route.name}</h3>
                    <p className="text-[11px] font-semibold text-slate-400">{route.routeArea}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      stats.isAllCompleted
                        ? 'bg-emerald-50 text-emerald-700'
                        : stats.completedStalls > 0
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {stats.completedStalls} / {stats.totalStalls} Selesai
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Laku</span>
                    <span className="font-bold text-slate-800">{stats.totalQtyTerjual} pcs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Nilai Penjualan</span>
                    <span className="font-bold text-emerald-600">{formatRupiah(stats.totalGrossSales)}</span>
                  </div>
                </div>

                <Link
                  href={`/routes/${route.id}`}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                >
                  <span>Buka Jadwal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
