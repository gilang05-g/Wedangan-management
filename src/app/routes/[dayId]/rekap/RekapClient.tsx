'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  Coins,
  Plus,
  Trash2,
  Calculator,
  Copy,
  Send,
  Utensils,
  Fuel,
  SquareParking,
  Receipt,
  X,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { TopHeader } from '@/components/layout/TopHeader';
import { useWMSData } from '@/hooks/useWMSData';
import { formatNumber, formatRupiah } from '@/lib/calculations';
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import { ExpenseItem } from '@/types';

interface RekapClientProps {
  dayId: string;
}

export default function RekapClient({ dayId }: RekapClientProps) {
  const router = useRouter();
  const { routes, visits, expenses, saveExpenses, settings, getDayStats } = useWMSData();

  const currentRoute = routes.find((r) => r.id === dayId);
  const stats = getDayStats(dayId);

  // Active step view: 'rekap' | 'pengeluaran'
  const [activeStep, setActiveStep] = useState<'rekap' | 'pengeluaran'>('rekap');

  // Modal expense state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseCategory, setExpenseCategory] = useState<'makan' | 'bensin' | 'parkir' | 'lainnya'>('makan');

  // Preview WhatsApp text drawer/modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Copy toast notification
  const [copyToast, setCopyToast] = useState(false);

  if (!currentRoute) {
    if (routes.length > 0) return notFound();
    return <div className="p-4 text-center text-xs text-slate-500">Memuat data...</div>;
  }

  const routeExpenses = expenses[dayId] || [];

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount || Number(expenseAmount) <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: expenseTitle.trim(),
      amount: Number(expenseAmount),
      category: expenseCategory,
    };

    const updated = [...routeExpenses, newExpense];
    saveExpenses(dayId, updated);

    // Reset modal
    setExpenseTitle('');
    setExpenseAmount('');
    setIsModalOpen(false);
  };

  // Delete Expense
  const handleDeleteExpense = (expenseId: string) => {
    const updated = routeExpenses.filter((item) => item.id !== expenseId);
    saveExpenses(dayId, updated);
  };

  // WhatsApp Message
  const waMessage = generateWhatsAppMessage({
    route: currentRoute,
    visits,
    expenses: routeExpenses,
  });

  // Copy to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(waMessage);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    } catch {
      alert('Gagal menyalin. Silakan gunakan tombol Kirim via WhatsApp.');
    }
  };

  // Quick category select
  const selectQuickCategory = (cat: 'makan' | 'bensin' | 'parkir' | 'lainnya', title: string) => {
    setExpenseCategory(cat);
    setExpenseTitle(title);
  };

  const getExpenseIcon = (cat?: string) => {
    switch (cat) {
      case 'bensin':
        return <Fuel className="w-4 h-4 text-amber-500" />;
      case 'parkir':
        return <SquareParking className="w-4 h-4 text-sky-500" />;
      case 'makan':
        return <Utensils className="w-4 h-4 text-rose-500" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopHeader
        title={activeStep === 'rekap' ? 'Rekapitulasi' : 'Pengeluaran & Kirim'}
        subtitle={currentRoute.name}
        showBack={true}
        backHref={activeStep === 'rekap' ? `/routes/${dayId}` : undefined}
      />

      <div className="p-4 space-y-4 flex-1">
        {/* Toggle Step Tab Bar */}
        <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold text-center">
          <button
            onClick={() => setActiveStep('rekap')}
            className={`py-2 rounded-lg transition-all ${
              activeStep === 'rekap'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Rekapitulasi
          </button>
          <button
            onClick={() => setActiveStep('pengeluaran')}
            disabled={!stats.isAllCompleted}
            className={`py-2 rounded-lg transition-all ${
              activeStep === 'pengeluaran'
                ? 'bg-white text-slate-800 shadow-xs'
                : stats.isAllCompleted
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 opacity-50 cursor-not-allowed'
            }`}
          >
            2. Pengeluaran & Kirim
          </button>
        </div>

        {/* ================= STEP 1: REKAPITULASI ================= */}
        {activeStep === 'rekap' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Completion Banner */}
            {stats.isAllCompleted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 leading-tight">
                    Semua Wedangan Selesai!
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Seluruh 25 wedangan telah dicatat. Berikut ringkasan distribusi:
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900 leading-tight">
                    Belum Semua Dicatat
                  </h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Baru {stats.completedStalls} dari {stats.totalStalls} wedangan yang selesai dicatat. Selesaikan seluruh kunjungan sebelum mengirim laporan.
                  </p>
                </div>
              </div>
            )}

            {/* Metrics Breakdown Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs divide-y divide-slate-100 space-y-2.5">
              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="font-medium text-slate-600">Total Stock Awal</span>
                <span className="font-bold text-slate-800">{formatNumber(stats.totalStockAwal)} pcs</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="font-medium text-slate-600">Total Stock Sisa</span>
                <span className="font-bold text-slate-800">{formatNumber(stats.totalStockSisa)} pcs</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="font-semibold text-emerald-700">Total Laku</span>
                <span className="font-bold text-emerald-700 text-sm">{formatNumber(stats.totalQtyTerjual)} pcs</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="font-medium text-slate-600">Total Kirim Baru</span>
                <span className="font-bold text-slate-800">{formatNumber(stats.totalStockBaru)} pcs</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="font-medium text-slate-600">Total Stock Akhir</span>
                <span className="font-bold text-slate-800">{formatNumber(stats.totalStockAkhir)} pcs</span>
              </div>
            </div>

            {/* Golden Total Sales Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-[#FF9012] shrink-0">
                <Coins className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Total Penjualan
                </span>
                <div className="text-xl font-extrabold text-slate-900 leading-tight">
                  {formatRupiah(stats.totalGrossSales)}
                </div>
                <p className="text-[11px] text-amber-700/90 font-medium">
                  ({stats.totalQtyTerjual} pcs × {formatRupiah(settings.defaultPrice)})
                </p>
              </div>
            </div>

            {/* Action CTA */}
            {stats.isAllCompleted ? (
              <button
                onClick={() => setActiveStep('pengeluaran')}
                className="w-full bg-[#FF9012] hover:bg-[#E67E08] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
              >
                <span>Lanjut ke Pengeluaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => router.push(`/routes/${dayId}`)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Lanjutkan Pencatatan ({stats.totalStalls - stats.completedStalls} Tersisa)</span>
              </button>
            )}
          </div>
        )}

        {/* ================= STEP 2: PENGELUARAN & KIRIM ================= */}
        {activeStep === 'pengeluaran' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header section with Add Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Catatan Pengeluaran</h3>
                <p className="text-[11px] text-slate-500">Makan, bensin, parkir, dan operasional</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#3EB8EB] hover:bg-sky-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah</span>
              </button>
            </div>

            {/* Expenses List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
              {routeExpenses.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Belum ada catatan pengeluaran.
                  <br />
                  Tekan <strong className="text-sky-600">+ Tambah</strong> bila ada pengeluaran operasional.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {routeExpenses.map((exp) => (
                    <div key={exp.id} className="py-2.5 flex items-center justify-between first:pt-1 last:pb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                          {getExpenseIcon(exp.category)}
                        </div>
                        <span className="text-xs font-bold text-slate-800 capitalize">
                          {exp.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-800">
                          {formatRupiah(exp.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded transition-colors"
                          aria-label="Hapus Pengeluaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Pengeluaran Subtotal */}
              <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Total Pengeluaran</span>
                <span className="font-bold text-rose-600 text-sm">
                  {formatRupiah(stats.totalExpenses)}
                </span>
              </div>
            </div>

            {/* Green Total Setor Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Calculator className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Total Setor
                </span>
                <div className="text-xl font-extrabold text-emerald-700 leading-tight">
                  {formatRupiah(stats.totalNetSetor)}
                </div>
                <p className="text-[11px] text-emerald-800/80 font-medium">
                  ({formatRupiah(stats.totalGrossSales)} - {formatRupiah(stats.totalExpenses)})
                </p>
              </div>
            </div>

            {/* Quick Preview Message Toggle */}
            <button
              onClick={() => setShowPreviewModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Format Pesan WhatsApp</span>
            </button>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleCopy}
                className="py-3 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-slate-50 active:scale-[0.99] transition-all"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Salin Laporan</span>
              </button>

              <a
                href={getWhatsAppUrl(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.99] transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Kirim via WhatsApp</span>
              </a>
            </div>

            {/* Copy Notification Toast */}
            {copyToast && (
              <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded-xl text-center shadow-lg animate-in fade-in slide-in-from-bottom-2">
                ✓ Laporan berhasil disalin ke clipboard!
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL TAMBAH PENGELUARAN ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Tambah Pengeluaran</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick chips */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Pilih Cepat:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => selectQuickCategory('makan', 'Makan')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100 hover:bg-rose-100"
                >
                  🍽️ Makan
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickCategory('bensin', 'Bensin')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 hover:bg-amber-100"
                >
                  ⛽ Bensin
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickCategory('parkir', 'Parkir')}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100 hover:bg-sky-100"
                >
                  🅿️ Parkir
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickCategory('lainnya', 'Plastik / Kantong')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-200"
                >
                  🛍️ Plastik
                </button>
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama / Keterangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bensin, Makan, Parkir"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl focus:border-[#FF9012] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nominal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    required
                    placeholder="15000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-bold text-slate-800 border border-slate-200 rounded-xl focus:border-[#FF9012] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#FF9012] hover:bg-[#E67E08] text-white py-2.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  Simpan Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PREVIEW PESAN WHATSAPP MODAL ================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl p-5 flex flex-col shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Preview Pesan WhatsApp</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-3 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] whitespace-pre-wrap text-slate-800 leading-relaxed">
              {waMessage}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks</span>
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
