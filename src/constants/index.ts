export const APP_VERSION = '1.0.0';
export const STORAGE_PREFIX = 'wms_v1_';

export const STORAGE_KEYS = {
  SETTINGS: `${STORAGE_PREFIX}settings`,
  VISITS: `${STORAGE_PREFIX}visits`,
  ROUTES: `${STORAGE_PREFIX}routes`,
  EXPENSES: `${STORAGE_PREFIX}expenses`,
  SUMMARIES: `${STORAGE_PREFIX}summaries`,
} as const;

export const DEFAULT_PRICE_PER_UNIT = 1500;

export const DEFAULT_SETTINGS = {
  defaultPrice: DEFAULT_PRICE_PER_UNIT,
  appName: 'Wedangan Management System',
  activeDayId: 'senin-malam',
};
