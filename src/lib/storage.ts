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
  return getStoredItem<Record<string, VisitRecord>>(STORAGE_KEYS.VISITS, {});
};

export const saveStoredVisits = (visits: Record<string, VisitRecord>): boolean => {
  return setStoredItem(STORAGE_KEYS.VISITS, visits);
};

export const getStoredExpenses = (): Record<string, ExpenseItem[]> => {
  return getStoredItem<Record<string, ExpenseItem[]>>(STORAGE_KEYS.EXPENSES, {});
};

export const saveStoredExpenses = (expenses: Record<string, ExpenseItem[]>): boolean => {
  return setStoredItem(STORAGE_KEYS.EXPENSES, expenses);
};

// Retrieve previous visit stock for a stall if available
export const getPreviousVisitStock = (stallId: string, currentDayId: string): number | null => {
  const visits = getStoredVisits();
  // Find any completed visit for this stall (not in currentDayId) sorted by updatedAt descending
  const relevantVisits = Object.values(visits).filter(
    (v) => v.stallId === stallId && v.dayId !== currentDayId && v.isCompleted
  );

  if (relevantVisits.length === 0) return null;

  relevantVisits.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return relevantVisits[0].stockAkhir;
};

// Export all data as JSON string for backup
export const exportAllDataAsJSON = (): string => {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    settings: getAppSettings(),
    routes: getStoredRoutes(),
    visits: getStoredVisits(),
    expenses: getStoredExpenses(),
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
    notifySubscribers();
    return true;
  } catch (error) {
    console.error('Error resetting localStorage:', error);
    return false;
  }
};
