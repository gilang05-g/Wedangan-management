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

const notifySubscribers = () => {
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
