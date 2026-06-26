import en from './locales/en.json';
import fr from './locales/fr.json';

export type Locale = 'en' | 'fr';
export type TranslationKey = string;

const translations: Record<Locale, typeof en> = { en, fr };

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en;
}

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'fr'];
