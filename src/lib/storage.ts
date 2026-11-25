import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/constants';
import { AppSettings, VisitRecord, RouteDay, ExpenseItem } from '@/types';
import { DUMMY_ROUTES } from '@/data/dummy-routes';

// Safe LocalStorage helpers with try/catch and SSR hydration safety

export const getStoredItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const notifySubscribers = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wms-data-changed'));
  }
};

export const setStoredItem = <T>(key: string, value: T): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

// Helper: Format local date string (YYYY-MM-DD) based on local timezone
export const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Otomatis menghapus data sementara (visits & expenses) jika sudah melewati jam 12 malam (00:00).
 * Sebelum dihapus, stok akhir terakhir dari setiap wedangan diarsipkan ke PREVIOUS_STOCKS
 * agar form pencatatan di hari baru tetap dapat mengambil stok awal dari kunjungan sebelumnya.
 */
export const checkAndPurgeExpiredData = (): boolean => {
  if (typeof window === 'undefined') return false;

  const todayKey = getTodayDateKey();
  const storedSessionDate = getStoredItem<string | null>(STORAGE_KEYS.SESSION_DATE, null);

  // Jika belum ada session date (pertama kali dibuka), inisialisasi dengan tanggal hari ini
  if (!storedSessionDate) {
    window.localStorage.setItem(STORAGE_KEYS.SESSION_DATE, JSON.stringify(todayKey));
    return false;
  }

  // Jika tanggal yang tersimpan berbeda dari tanggal hari ini (sudah lewat jam 12 malam)
  if (storedSessionDate !== todayKey) {
    try {
      // 1. Simpan snapshot stok akhir terakhir dari setiap wedangan yang sudah selesai
      const currentVisits = getStoredItem<Record<string, VisitRecord>>(STORAGE_KEYS.VISITS, {});
      const previousStocks = getStoredItem<Record<string, number>>(STORAGE_KEYS.PREVIOUS_STOCKS, {});

      Object.values(currentVisits).forEach((visit) => {
        if (visit && visit.isCompleted && typeof visit.stockAkhir === 'number') {
          previousStocks[visit.stallId] = visit.stockAkhir;
        }
      });
      window.localStorage.setItem(STORAGE_KEYS.PREVIOUS_STOCKS, JSON.stringify(previousStocks));

      // 2. Hapus data sementara hari sebelumnya (kunjungan stok & pengeluaran)
      window.localStorage.removeItem(STORAGE_KEYS.VISITS);
      window.localStorage.removeItem(STORAGE_KEYS.EXPENSES);

      // 3. Perbarui session date ke tanggal hari ini
      window.localStorage.setItem(STORAGE_KEYS.SESSION_DATE, JSON.stringify(todayKey));

      // Beri tahu subscriber UI agar tampilan ter-refresh bersih
      notifySubscribers();
      return true;
    } catch (error) {
      console.error('Error saat mereset data kadaluarsa jam 12 malam:', error);
      return false;
    }
  }

  return false;
};

export const getAppSettings = (): AppSettings => {
  return getStoredItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

export const saveAppSettings = (settings: AppSettings): boolean => {
  return setStoredItem(STORAGE_KEYS.SETTINGS, settings);
};

export const getStoredRoutes = (): RouteDay[] => {
  return getStoredItem<RouteDay[]>(STORAGE_KEYS.ROUTES, DUMMY_ROUTES);
};

export const saveStoredRoutes = (routes: RouteDay[]): boolean => {
  return setStoredItem(STORAGE_KEYS.ROUTES, routes);
};

export const getStoredVisits = (): Record<string, VisitRecord> => {
  checkAndPurgeExpiredData();
  return getStoredItem<Record<string, VisitRecord>>(STORAGE_KEYS.VISITS, {});
};

export const saveStoredVisits = (visits: Record<string, VisitRecord>): boolean => {
  checkAndPurgeExpiredData();
  return setStoredItem(STORAGE_KEYS.VISITS, visits);
};

export const getStoredExpenses = (): Record<string, ExpenseItem[]> => {
  checkAndPurgeExpiredData();
  return getStoredItem<Record<string, ExpenseItem[]>>(STORAGE_KEYS.EXPENSES, {});
};

export const saveStoredExpenses = (expenses: Record<string, ExpenseItem[]>): boolean => {
  checkAndPurgeExpiredData();
  return setStoredItem(STORAGE_KEYS.EXPENSES, expenses);
};

// Retrieve previous visit stock for a stall if available
export const getPreviousVisitStock = (stallId: string, currentDayId: string): number | null => {
  checkAndPurgeExpiredData();

  // 1. Cek dari kunjungan hari ini yang sudah selesai (di rute lain)
  const visits = getStoredItem<Record<string, VisitRecord>>(STORAGE_KEYS.VISITS, {});
  const relevantVisits = Object.values(visits).filter(
    (v) => v.stallId === stallId && v.dayId !== currentDayId && v.isCompleted
  );

  if (relevantVisits.length > 0) {
    relevantVisits.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return relevantVisits[0].stockAkhir;
  }

  // 2. Jika hari baru (setelah jam 12 malam), ambil dari arsip stok terakhir hari kemarin
  const previousStocks = getStoredItem<Record<string, number>>(STORAGE_KEYS.PREVIOUS_STOCKS, {});
  if (typeof previousStocks[stallId] === 'number') {
    return previousStocks[stallId];
  }

  return null;
};

// Export all data as JSON string for backup
export const exportAllDataAsJSON = (): string => {
  checkAndPurgeExpiredData();
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    sessionDate: getStoredItem<string>(STORAGE_KEYS.SESSION_DATE, getTodayDateKey()),
    settings: getAppSettings(),
    routes: getStoredRoutes(),
    visits: getStoredVisits(),
    expenses: getStoredExpenses(),
    previousStocks: getStoredItem<Record<string, number>>(STORAGE_KEYS.PREVIOUS_STOCKS, {}),
  };
  return JSON.stringify(data, null, 2);
};

// Import backup JSON string with validation
export const importDataFromJSON = (jsonString: string): { success: boolean; message: string } => {
  if (typeof window === 'undefined') return { success: false, message: 'Window tidak tersedia' };
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Format file JSON tidak valid.' };
    }

    if (parsed.settings) setStoredItem(STORAGE_KEYS.SETTINGS, parsed.settings);
    if (parsed.routes && Array.isArray(parsed.routes)) setStoredItem(STORAGE_KEYS.ROUTES, parsed.routes);
    if (parsed.visits && typeof parsed.visits === 'object') setStoredItem(STORAGE_KEYS.VISITS, parsed.visits);
    if (parsed.expenses && typeof parsed.expenses === 'object') setStoredItem(STORAGE_KEYS.EXPENSES, parsed.expenses);
    if (parsed.sessionDate) setStoredItem(STORAGE_KEYS.SESSION_DATE, parsed.sessionDate);
    if (parsed.previousStocks) setStoredItem(STORAGE_KEYS.PREVIOUS_STOCKS, parsed.previousStocks);

    notifySubscribers();
    return { success: true, message: 'Data backup berhasil dipulihkan.' };
  } catch (error) {
    return { success: false, message: `Gagal membaca file: ${(error as Error).message}` };
  }
};

export const resetAllData = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
    });
    // Set ulang session date ke hari ini
    window.localStorage.setItem(STORAGE_KEYS.SESSION_DATE, JSON.stringify(getTodayDateKey()));
    notifySubscribers();
    return true;
  } catch (error) {
    console.error('Error resetting localStorage:', error);
    return false;
  }
};
