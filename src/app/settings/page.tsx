'use client';

import React, { useState, useRef } from 'react';
import {
  Settings,
  RefreshCw,
  Check,
  Download,
  Upload,
  Store,
  ChevronDown,
  Edit2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useWMSData } from '@/hooks/useWMSData';
import { formatRupiah } from '@/lib/calculations';
import { Stall } from '@/types';

export default function SettingsPage() {
  const {
    settings,
    routes,
    updateSettings,
    updateRouteStalls,
    handleReset,
    exportAllDataAsJSON,
    importDataFromJSON,
  } = useWMSData();

  const [price, setPrice] = useState<number>(settings.defaultPrice);
  const [savePriceToast, setSavePriceToast] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Route & Stall customization
  const [selectedDayId, setSelectedDayId] = useState<string>(routes[0]?.id || 'senin-malam');
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [stallNewName, setStallNewName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedRoute = routes.find((r) => r.id === selectedDayId) || routes[0];

  // Save Price
  const handleSavePrice = () => {
    updateSettings({ defaultPrice: price });
    setSavePriceToast(true);
    setTimeout(() => setSavePriceToast(false), 2000);
  };

  // Export JSON file
  const handleExportJSON = () => {
    try {
      const jsonStr = exportAllDataAsJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengekspor data backup.');
    }
  };

  // Import JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataFromJSON(content);
        setImportStatus(result);
        setTimeout(() => setImportStatus(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Rename stall
  const handleSaveStallName = () => {
    if (!editingStall || !stallNewName.trim()) return;

    const updatedRoutes = routes.map((r) => {
      if (r.id !== selectedDayId) return r;
      return {
        ...r,
        stalls: r.stalls.map((s) => (s.id === editingStall.id ? { ...s, name: stallNewName.trim() } : s)),
      };
    });

    updateRouteStalls(updatedRoutes);
    setEditingStall(null);
    setStallNewName('');
  };

  // Confirm Reset
  const handleConfirmReset = () => {
    handleReset();
    setResetConfirm(false);
    alert('Seluruh data LocalStorage berhasil direset.');
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopHeader
        title="Pengaturan"
        subtitle="Konfigurasi WMS & Data"
        showBack={true}
        backHref="/"
        showSettings={false}
      />

      <div className="p-4 space-y-4 flex-1">
        {/* 1. Price Configuration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF9012]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Harga Produk Default</h3>
              <p className="text-xs text-slate-500">Harga snapshot untuk setiap pencatatan baru</p>
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
              className="bg-[#FF9012] hover:bg-[#E67E08] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-95"
            >
              Simpan
            </button>
          </div>

          {savePriceToast && (
            <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg flex items-center gap-1 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Harga default berhasil diperbarui ({formatRupiah(price)}).</span>
            </div>
          )}
        </div>

        {/* 2. Route & Stall Editor */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#3EB8EB]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Edit Nama Wedangan</h3>
              <p className="text-xs text-slate-500">Ubah nama wedangan per jadwal</p>
            </div>
          </div>

          {/* Select Route */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Jadwal:</label>
            <div className="relative">
              <select
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.stalls.length} Wedangan)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Stall List (Max 5 with scroll) */}
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
            {selectedRoute?.stalls.map((stall) => (
              <div key={stall.id} className="py-2 px-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 truncate pr-2">
                  {stall.sequence}. {stall.name}
                </span>
                <button
                  onClick={() => {
                    setEditingStall(stall);
                    setStallNewName(stall.name);
                  }}
                  className="text-slate-400 hover:text-[#FF9012] p-1 rounded transition-colors shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Backup & Restore (JSON) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Cadangkan & Pulihkan Data</h3>
          <p className="text-xs text-slate-500">
            Simpan file backup JSON ke memori HP agar data kunjungan selalu aman.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleExportJSON}
              className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-sky-100 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-sky-600" />
              <span>Import JSON</span>
            </button>
          </div>

          {importStatus && (
            <div
              className={`text-xs p-2.5 rounded-xl font-semibold flex items-center gap-1.5 ${
                importStatus.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        {/* 4. Reset Zone */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Reset Data</h3>
          <p className="text-xs text-slate-500">
            Menghapus riwayat kunjungan dan transaksi di LocalStorage.
          </p>

          <div className="pt-1">
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
                <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Konfirmasi Hapus Data</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  Data yang dihapus tidak dapat dipulihkan kecuali Anda memiliki file backup JSON.
                </p>
                <div className="flex gap-2 pt-1">
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
        <div className="text-center text-xs text-slate-400 py-4">
          <p className="font-semibold text-slate-500">Wedangan Management System (WMS)</p>
          <p className="text-[11px] mt-0.5">Versi 1.0 • PWA Ready • Local Storage</p>
        </div>
      </div>

      {/* Modal Edit Stall Name */}
      {editingStall && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800">Ubah Nama Wedangan</h3>
              <button
                onClick={() => setEditingStall(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Urutan {editingStall.sequence}
              </label>
              <input
                type="text"
                value={stallNewName}
                onChange={(e) => setStallNewName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:border-[#FF9012] focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveStallName}
                className="flex-1 bg-[#FF9012] text-white py-2 rounded-xl text-xs font-bold"
              >
                Simpan
              </button>
              <button
                onClick={() => setEditingStall(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
