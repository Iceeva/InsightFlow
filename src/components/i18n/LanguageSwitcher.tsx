'use client';

import { useI18n } from '@/i18n/context';
import { Locale } from '@/i18n/index';

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`flex items-center rounded-lg border border-border overflow-hidden ${className ?? ''}`}>
      {(['en', 'fr'] as Locale[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={`px-2.5 py-1 text-xs font-medium transition uppercase ${
            locale === lang
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
