'use client';

import React, { useState } from 'react';
import { Settings, RefreshCw, Check } from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useWMSData } from '@/hooks/useWMSData';
import { formatRupiah } from '@/lib/calculations';

export default function SettingsPage() {
  const { settings, updateSettings, handleReset } = useWMSData();
  const [price, setPrice] = useState<number>(settings.defaultPrice);
  const [saveToast, setSaveToast] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSavePrice = () => {
    updateSettings({ defaultPrice: price });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleConfirmReset = () => {
    handleReset();
    setResetConfirm(false);
    alert('Seluruh data LocalStorage berhasil direset.');
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopHeader
        title="Pengaturan"
        subtitle="Wedangan Management System"
        showBack={true}
        backHref="/"
        showSettings={false}
      />

      <div className="p-4 space-y-4 flex-1">
        {/* Price Configuration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9012]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Harga Produk Default</h3>
              <p className="text-xs text-slate-500">Harga per pcs makanan untuk kunjungan baru</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                min={100}
                step={100}
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-800 border border-slate-200 rounded-xl focus:border-[#FF9012] focus:outline-none"
              />
            </div>
            <button
              onClick={handleSavePrice}
              className="bg-[#FF9012] hover:bg-[#E67E08] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Simpan
            </button>
          </div>

          {saveToast && (
            <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg flex items-center gap-1 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Harga default berhasil disimpan ({formatRupiah(price)}).</span>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Kelola Data LocalStorage</h3>
          <p className="text-xs text-slate-500">
            Aplikasi berjalan 100% di browser tanpa backend eksternal.
          </p>

          <div className="pt-2">
            {!resetConfirm ? (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Seluruh Data</span>
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2">
                <p className="text-xs text-rose-700 font-semibold">
                  Yakin ingin menghapus seluruh data kunjungan lokal?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmReset}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold"
                  >
                    Ya, Reset
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-xs text-slate-400 pt-4">
          <p className="font-semibold text-slate-500">Wedangan Management System (WMS)</p>
          <p>Tahap 1 • Mobile First • Offline-Ready</p>
        </div>
      </div>
    </div>
  );
}
