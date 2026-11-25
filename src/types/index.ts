export interface Stall {
  id: string;
  name: string;
  sequence: number;
  area?: string;
  initialStockDefault?: number;
}

export interface RouteDay {
  id: string;
  name: string;
  shortName: string;
  timeOfDay: 'pagi' | 'malam';
  dayName: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  routeArea: string;
  stalls: Stall[];
}

export interface VisitRecord {
  stallId: string;
  dayId: string;
  stockAwal: number;
  stockSisa: number;
  qtyTerjual: number;
  stockBaru: number;
  stockAkhir: number;
  unitPrice: number;
  isCompleted: boolean;
  updatedAt: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category?: string;
}

export interface RouteSummary {
  dayId: string;
  date: string;
  totalStalls: number;
  completedStalls: number;
  totalStockAwal: number;
  totalStockSisa: number;
  totalQtyTerjual: number;
  totalStockBaru: number;
  totalStockAkhir: number;
  totalGrossSales: number;
  expenses: ExpenseItem[];
  totalExpenses: number;
  totalNetSetor: number;
  isFinalized: boolean;
}

export interface AppSettings {
  defaultPrice: number;
  appName: string;
  activeDayId: string;
}
