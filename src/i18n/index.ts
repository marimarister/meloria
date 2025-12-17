import { en } from './translations/en';
import { lv } from './translations/lv';

export type Language = 'en' | 'lv';

export const translations = {
  en,
  lv,
} as const;

export type TranslationKeys = typeof en;

// Helper function to get nested translation value
export const getTranslation = (
  translations: TranslationKeys,
  key: string
): string => {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
};
