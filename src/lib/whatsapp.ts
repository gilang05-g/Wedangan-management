import { RouteDay, VisitRecord, ExpenseItem } from '@/types';
import { formatNumber, formatRupiah } from './calculations';

export interface WhatsAppReportPayload {
  route: RouteDay;
  visits: Record<string, VisitRecord>;
  expenses: ExpenseItem[];
  reportDate?: string;
}

export const generateWhatsAppMessage = ({
  route,
  visits,
  expenses,
  reportDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date()),
}: WhatsAppReportPayload): string => {
  const lines: string[] = [];

  lines.push('LAPORAN DISTRIBUSI');
  lines.push(route.name.toUpperCase());
  lines.push(`Tanggal: ${reportDate}`);
  lines.push('');
  lines.push('RUTE:');
  lines.push(route.routeArea.toUpperCase());
  lines.push('');

  let totalLaku = 0;
  let totalGross = 0;
  let lastPrice = 1500;

  // Stalls breakdown
  route.stalls.forEach((stall, index) => {
    const key = `${route.id}_${stall.id}`;
    const visit = visits[key];

    if (visit && visit.isCompleted) {
      totalLaku += visit.qtyTerjual;
      totalGross += visit.qtyTerjual * visit.unitPrice;
      lastPrice = visit.unitPrice;

      lines.push(`${index + 1}. ${stall.name.toUpperCase()}`);
      lines.push(`   Stock Awal: ${visit.stockAwal}`);
      lines.push(`   Laku: ${visit.qtyTerjual}`);
      lines.push(`   Stock Sisa: ${visit.stockSisa}`);
      lines.push(`   Kirim Baru: ${visit.stockBaru}`);
      lines.push(`   Stock Akhir: ${visit.stockAkhir}`);
      lines.push('');
    } else {
      lines.push(`${index + 1}. ${stall.name.toUpperCase()} (Belum Dicatat)`);
      lines.push('');
    }
  });

  // Total sales
  lines.push('TOTAL:');
  lines.push(`Total Laku: ${formatNumber(totalLaku)} pcs`);
  lines.push(`Harga: ${formatRupiah(lastPrice)}`);
  lines.push(`Total Penjualan: ${formatRupiah(totalGross)}`);
  lines.push('');

  // Expenses breakdown
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  lines.push('PENGELUARAN:');
  if (expenses.length === 0) {
    lines.push('- Tidak ada pengeluaran');
  } else {
    expenses.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.title}: ${formatRupiah(item.amount)}`);
    });
  }
  lines.push('');
  lines.push(`Total Pengeluaran: ${formatRupiah(totalExpenses)}`);
  lines.push('');

  // Total setor
  const totalSetor = totalGross - totalExpenses;
  lines.push('TOTAL SETOR:');
  lines.push(`${formatRupiah(totalGross)} - ${formatRupiah(totalExpenses)} = ${formatRupiah(totalSetor)}`);

  return lines.join('\n');
};

export const getWhatsAppUrl = (message: string): string => {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};
