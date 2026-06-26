'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Moon, Sun, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAnalyticsStore } from '@/stores/analytics-store';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

const periods = [
  { value: '1h', label: '1h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
] as const;

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { filters, setFilters, isLive, liveCount } = useAnalyticsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono">
            <Command className="w-2.5 h-2.5 inline" />K
          </kbd>
        </button>

        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live · {liveCount}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Period selector */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setFilters({ period: p.value })}
              className={cn(
                'px-2.5 py-1 text-xs font-medium transition',
                filters.period === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
