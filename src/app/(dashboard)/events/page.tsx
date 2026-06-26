'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

const mockEvents = Array.from({ length: 200 }, (_, i) => ({
  id: `evt_${i}`,
  name: ['page_view', 'button_click', 'signup', 'purchase', 'search', 'add_to_cart'][Math.floor(Math.random() * 6)],
  timestamp: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
  distinctId: `user_${Math.floor(Math.random() * 100)}`,
  country: ['US', 'FR', 'DE', 'JP', 'BR', 'GB'][Math.floor(Math.random() * 6)],
  browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
  os: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'][Math.floor(Math.random() * 5)],
  device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
  path: ['/', '/pricing', '/docs', '/dashboard', '/settings'][Math.floor(Math.random() * 5)],
}));

const eventNames = [...new Set(mockEvents.map(e => e.name))].sort();

export default function EventsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const limit = 20;

  const filtered = useMemo(() => {
    return mockEvents.filter(e => {
      if (nameFilter && e.name !== nameFilter) return false;
      if (search && !e.name.includes(search) && !e.distinctId.includes(search) && !e.path?.includes(search)) return false;
      return true;
    });
  }, [search, nameFilter]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('events.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('events.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('events.searchPlaceholder')}
            className="w-full h-9 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <select value={nameFilter} onChange={e => { setNameFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none">
          <option value="">{t('events.allEvents')}</option>
          {eventNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t('events.columnEvent')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t('events.columnUser')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">{t('events.columnPath')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">{t('events.columnCountry')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">{t('events.columnDevice')}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t('events.columnTime')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((event) => (
                <motion.tr key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={cn('border-b border-border/50 hover:bg-accent/50 cursor-pointer transition', expanded === event.id && 'bg-accent/30')}
                  onClick={() => setExpanded(expanded === event.id ? null : event.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-mono font-medium">{event.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{event.distinctId}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{event.path}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{event.country}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs">{event.device} · {event.browser}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(event.timestamp).toLocaleString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">{filtered.length} {t('events.eventsCount')}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-accent disabled:opacity-30 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs">{page}/{totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-accent disabled:opacity-30 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
