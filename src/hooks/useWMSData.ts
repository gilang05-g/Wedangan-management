'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { RouteDay, VisitRecord, AppSettings, ExpenseItem } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants';
import { DUMMY_ROUTES } from '@/data/dummy-routes';
import {
  getStoredRoutes,
  getStoredVisits,
  getAppSettings,
  getStoredExpenses,
  saveStoredVisits,
  saveAppSettings,
  saveStoredExpenses,
  saveStoredRoutes,
  resetAllData,
  exportAllDataAsJSON,
  importDataFromJSON,
  getPreviousVisitStock,
} from '@/lib/storage';

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('wms-data-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('wms-data-changed', callback);
  };
};

const emptySubscribe = () => () => {};

export const useWMSData = () => {
  // Safe hydration check via useSyncExternalStore
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Sync with localStorage reactively
  const routesJson = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getStoredRoutes()),
    () => JSON.stringify(DUMMY_ROUTES)
  );

  const visitsJson = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getStoredVisits()),
    () => JSON.stringify({})
  );

  const settingsJson = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getAppSettings()),
    () => JSON.stringify(DEFAULT_SETTINGS)
  );

  const expensesJson = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getStoredExpenses()),
    () => JSON.stringify({})
  );

  const routes: RouteDay[] = useMemo(() => {
    try {
      return JSON.parse(routesJson);
    } catch {
      return DUMMY_ROUTES;
    }
  }, [routesJson]);

  const visits: Record<string, VisitRecord> = useMemo(() => {
    try {
      return JSON.parse(visitsJson);
    } catch {
      return {};
    }
  }, [visitsJson]);

  const settings: AppSettings = useMemo(() => {
    try {
      return JSON.parse(settingsJson);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }, [settingsJson]);

  const expenses: Record<string, ExpenseItem[]> = useMemo(() => {
    try {
      return JSON.parse(expensesJson);
    } catch {
      return {};
    }
  }, [expensesJson]);

  // Save single visit
  const recordVisit = useCallback((record: VisitRecord) => {
    const visitKey = `${record.dayId}_${record.stallId}`;
    const current = getStoredVisits();
    const updated = {
      ...current,
      [visitKey]: record,
    };
    saveStoredVisits(updated);
  }, []);

  // Save expenses for a route
  const saveExpenses = useCallback((dayId: string, dayExpenses: ExpenseItem[]) => {
    const current = getStoredExpenses();
    const updated = {
      ...current,
      [dayId]: dayExpenses,
    };
    saveStoredExpenses(updated);
  }, []);

  // Update app settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const current = getAppSettings();
    const updated = { ...current, ...newSettings };
    saveAppSettings(updated);
  }, []);

  // Update stall details in route (for settings page)
  const updateRouteStalls = useCallback((updatedRoutes: RouteDay[]) => {
    saveStoredRoutes(updatedRoutes);
  }, []);

  // Reset all data
  const handleReset = useCallback(() => {
    resetAllData();
  }, []);

  // Calculate stats for a given day
  const getDayStats = useCallback(
    (dayId: string) => {
      const dayRoute = routes.find((r) => r.id === dayId);
      if (!dayRoute) {
        return {
          totalStalls: 0,
          completedStalls: 0,
          totalStockAwal: 0,
          totalStockSisa: 0,
          totalQtyTerjual: 0,
          totalStockBaru: 0,
          totalStockAkhir: 0,
          totalGrossSales: 0,
          totalExpenses: 0,
          totalNetSetor: 0,
          isAllCompleted: false,
          progressPercent: 0,
        };
      }

      const totalStalls = dayRoute.stalls.length;
      let completedStalls = 0;
      let totalStockAwal = 0;
      let totalStockSisa = 0;
      let totalQtyTerjual = 0;
      let totalStockBaru = 0;
      let totalStockAkhir = 0;
      let totalGrossSales = 0;

      dayRoute.stalls.forEach((stall) => {
        const key = `${dayId}_${stall.id}`;
        const record = visits[key];
        if (record && record.isCompleted) {
          completedStalls += 1;
          totalStockAwal += record.stockAwal || 0;
          totalStockSisa += record.stockSisa || 0;
          totalQtyTerjual += record.qtyTerjual || 0;
          totalStockBaru += record.stockBaru || 0;
          totalStockAkhir += record.stockAkhir || 0;
          totalGrossSales += (record.qtyTerjual || 0) * (record.unitPrice || settings.defaultPrice);
        }
      });

      const dayExpenses = expenses[dayId] || [];
      const totalExpenses = dayExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalNetSetor = totalGrossSales - totalExpenses;

      const progressPercent = totalStalls > 0 ? Math.round((completedStalls / totalStalls) * 100) : 0;
      const isAllCompleted = totalStalls > 0 && completedStalls === totalStalls;

      return {
        totalStalls,
        completedStalls,
        totalStockAwal,
        totalStockSisa,
        totalQtyTerjual,
        totalStockBaru,
        totalStockAkhir,
        totalGrossSales,
        totalExpenses,
        totalNetSetor,
        isAllCompleted,
        progressPercent,
      };
    },
    [routes, visits, expenses, settings.defaultPrice]
  );

  // Active day route
  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === settings.activeDayId) || routes[0] || DUMMY_ROUTES[0];
  }, [routes, settings.activeDayId]);

  return {
    isHydrated: isClient,
    routes,
    visits,
    settings,
    expenses,
    activeRoute,
    recordVisit,
    saveExpenses,
    updateSettings,
    updateRouteStalls,
    handleReset,
    getDayStats,
    exportAllDataAsJSON,
    importDataFromJSON,
    getPreviousVisitStock,
  };
};
