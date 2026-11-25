'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { RouteDay, VisitRecord, AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants';
import { DUMMY_ROUTES } from '@/data/dummy-routes';
import {
  getStoredRoutes,
  getStoredVisits,
  getAppSettings,
  saveStoredVisits,
  saveAppSettings,
  resetAllData,
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

  // Save single visit
  const recordVisit = useCallback(
    (record: VisitRecord) => {
      const visitKey = `${record.dayId}_${record.stallId}`;
      const current = getStoredVisits();
      const updated = {
        ...current,
        [visitKey]: record,
      };
      saveStoredVisits(updated);
    },
    []
  );

  // Update app settings
  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      const current = getAppSettings();
      const updated = { ...current, ...newSettings };
      saveAppSettings(updated);
    },
    []
  );

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
          totalQtyTerjual: 0,
          totalGrossSales: 0,
          isAllCompleted: false,
          progressPercent: 0,
        };
      }

      const totalStalls = dayRoute.stalls.length;
      let completedStalls = 0;
      let totalQtyTerjual = 0;
      let totalGrossSales = 0;

      dayRoute.stalls.forEach((stall) => {
        const key = `${dayId}_${stall.id}`;
        const record = visits[key];
        if (record && record.isCompleted) {
          completedStalls += 1;
          totalQtyTerjual += record.qtyTerjual || 0;
          totalGrossSales += (record.qtyTerjual || 0) * (record.unitPrice || settings.defaultPrice);
        }
      });

      const progressPercent = totalStalls > 0 ? Math.round((completedStalls / totalStalls) * 100) : 0;
      const isAllCompleted = totalStalls > 0 && completedStalls === totalStalls;

      return {
        totalStalls,
        completedStalls,
        totalQtyTerjual,
        totalGrossSales,
        isAllCompleted,
        progressPercent,
      };
    },
    [routes, visits, settings.defaultPrice]
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
    activeRoute,
    recordVisit,
    updateSettings,
    handleReset,
    getDayStats,
  };
};
