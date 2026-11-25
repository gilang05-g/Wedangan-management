'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Store, CheckCircle, Info, Save, Plus, Minus } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useWMSData } from '@/hooks/useWMSData';
import { calculateStock, formatRupiah } from '@/lib/calculations';
import { VisitRecord } from '@/types';
import { getPreviousVisitStock } from '@/lib/storage';

interface StallFormClientProps {
  dayId: string;
  stallId: string;
}

export default function StallFormClient({ dayId, stallId }: StallFormClientProps) {
  const router = useRouter();
  const { routes, visits, settings, recordVisit } = useWMSData();

  const currentRoute = routes.find((r) => r.id === dayId);
  const currentStall = currentRoute?.stalls.find((s) => s.id === stallId);

  const visitKey = `${dayId}_${stallId}`;
  const existingVisit = visits[visitKey];

  // Prior visit stock or default
  const previousStock = typeof window !== 'undefined' ? getPreviousVisitStock(stallId, dayId) : null;

  // Initialize form state cleanly from existing visit or prior visit or default
  const [stockAwal, setStockAwal] = useState<number>(() => {
    if (existingVisit) return existingVisit.stockAwal;
    if (previousStock !== null) return previousStock;
    return currentStall?.initialStockDefault ?? 20;
  });
  const [stockSisa, setStockSisa] = useState<number>(() => {
    return existingVisit?.stockSisa ?? 0;
  });
  const [stockBaru, setStockBaru] = useState<number>(() => {
    return existingVisit?.stockBaru ?? 10;
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!currentRoute || !currentStall) {
    if (routes.length > 0) return notFound();
    return <div className="p-4 text-center text-xs text-slate-500">Memuat data...</div>;
  }

  // Stock calculations
  const calc = calculateStock({
    stockAwal,
    stockSisa,
    stockBaru,
    unitPrice: settings.defaultPrice,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calc.isValid) {
      setErrorMessage(calc.errorMessage || 'Data tidak valid.');
      return;
    }

    const record: VisitRecord = {
      dayId,
      stallId,
      stockAwal,
      stockSisa,
      qtyTerjual: calc.qtyTerjual,
      stockBaru,
      stockAkhir: calc.stockAkhir,
      unitPrice: settings.defaultPrice, // Snapshot price at time of visit
      isCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    recordVisit(record);
    setSavedSuccess(true);
    setTimeout(() => {
      router.push(`/routes/${dayId}`);
    }, 350);
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopHeader
        title="Form Pencatatan"
        subtitle={currentStall.name}
        showBack={true}
        backHref={`/routes/${dayId}`}
      />

      <div className="p-4 space-y-4 flex-1">
        {/* Stall Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9012]">
              <Store className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-tight">
                {currentStall.sequence}. {currentStall.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Isi data distribusi kunjungan
              </p>
            </div>
          </div>
        </div>

        {/* Notice Info */}
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-sky-800">
          <Info className="w-4 h-4 text-[#3EB8EB] shrink-0 mt-0.5" />
          <p>
            {previousStock !== null && !existingVisit
              ? `Stock awal (${previousStock} pcs) otomatis diambil dari kunjungan sebelumnya.`
              : 'Stock awal otomatis diambil dari kunjungan sebelumnya (jika ada).'}
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="space-y-3">
          {/* Stock Awal */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <label className="text-xs font-bold text-slate-700">Stock Awal</label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStockAwal((v) => Math.max(0, v - 1))}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={0}
                value={stockAwal}
                onChange={(e) => setStockAwal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 text-center font-bold text-slate-900 border border-slate-200 rounded-lg p-1 text-sm focus:border-[#FF9012] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setStockAwal((v) => v + 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-400 w-6 text-right">pcs</span>
            </div>
          </div>

          {/* Stock Sisa */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <label className="text-xs font-bold text-slate-700">Stock Sisa</label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStockSisa((v) => Math.max(0, v - 1))}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={0}
                value={stockSisa}
                onChange={(e) => setStockSisa(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 text-center font-bold text-slate-900 border border-slate-200 rounded-lg p-1 text-sm focus:border-[#FF9012] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setStockSisa((v) => v + 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-400 w-6 text-right">pcs</span>
            </div>
          </div>

          {/* Qty Terjual (Calculated) */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-emerald-800">Qty Terjual</label>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-right font-bold text-emerald-700 text-sm">
                {calc.qtyTerjual}
              </span>
              <span className="text-xs text-emerald-600 font-medium w-6 text-right">pcs</span>
            </div>
          </div>

          {/* Stock Baru / Kirim Baru */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <label className="text-xs font-bold text-slate-700">Stock Baru / Kirim Baru</label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStockBaru((v) => Math.max(0, v - 1))}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={0}
                value={stockBaru}
                onChange={(e) => setStockBaru(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 text-center font-bold text-slate-900 border border-slate-200 rounded-lg p-1 text-sm focus:border-[#FF9012] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setStockBaru((v) => v + 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-400 w-6 text-right">pcs</span>
            </div>
          </div>

          {/* Stock Akhir (Calculated) */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-emerald-800">Stock Akhir</label>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-right font-bold text-emerald-700 text-sm">
                {calc.stockAkhir}
              </span>
              <span className="text-xs text-emerald-600 font-medium w-6 text-right">pcs</span>
            </div>
          </div>

          {/* Price Snapshot Info */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
            <span>Harga Unit: {formatRupiah(settings.defaultPrice)} / pcs</span>
            <span>Perkiraan: {formatRupiah(calc.grossSales)}</span>
          </div>

          {/* Error Message */}
          {(!calc.isValid || errorMessage) && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl font-medium">
              {calc.errorMessage || errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!calc.isValid}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
              calc.isValid
                ? 'bg-[#FF9012] hover:bg-[#E67E08] text-white active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Kunjungan'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
