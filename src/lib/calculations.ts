// Currency & Numeric formatting utilities for WMS

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export interface StockCalculationInput {
  stockAwal: number;
  stockSisa: number;
  stockBaru: number;
  unitPrice?: number;
}

export interface StockCalculationResult {
  qtyTerjual: number;
  stockAkhir: number;
  grossSales: number;
  isValid: boolean;
  errorMessage?: string;
}

export const calculateStock = ({
  stockAwal,
  stockSisa,
  stockBaru,
  unitPrice = 1500,
}: StockCalculationInput): StockCalculationResult => {
  // Validations
  if (stockAwal < 0 || stockSisa < 0 || stockBaru < 0) {
    return {
      qtyTerjual: 0,
      stockAkhir: 0,
      grossSales: 0,
      isValid: false,
      errorMessage: 'Angka stock tidak boleh negatif.',
    };
  }

  if (stockSisa > stockAwal) {
    return {
      qtyTerjual: 0,
      stockAkhir: 0,
      grossSales: 0,
      isValid: false,
      errorMessage: 'Stock Sisa tidak boleh melebihi Stock Awal.',
    };
  }

  const qtyTerjual = stockAwal - stockSisa;
  const stockAkhir = stockSisa + stockBaru;
  const grossSales = qtyTerjual * unitPrice;

  return {
    qtyTerjual,
    stockAkhir,
    grossSales,
    isValid: true,
  };
};
