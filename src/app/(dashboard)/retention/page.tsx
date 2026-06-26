'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

const weeks = ['Jun 1', 'Jun 8', 'Jun 15', 'Jun 22', 'Jun 29', 'Jul 6', 'Jul 13', 'Jul 20'];
const cohorts = weeks.map((week, i) => {
  const size = 500 + Math.floor(Math.random() * 300);
  const retention = [100];
  for (let w = 1; w < 8 - i; w++) {
    retention.push(Math.max(5, Math.round(retention[w - 1] * (0.5 + Math.random() * 0.35))));
  }
  return { week, size, retention };
});

function getCellColor(value: number): string {
  if (value >= 80) return 'bg-primary/90 text-primary-foreground';
  if (value >= 60) return 'bg-primary/70 text-primary-foreground';
  if (value >= 40) return 'bg-primary/50 text-primary-foreground';
  if (value >= 20) return 'bg-primary/30 text-foreground';
  if (value >= 10) return 'bg-primary/15 text-foreground';
  return 'bg-primary/5 text-muted-foreground';
}

export default function RetentionPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('retention.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('retention.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t('retention.week1Avg')}</p>
          <p className="text-2xl font-bold mt-1">42%</p>
          <p className="text-xs text-green-500 mt-1">+3% {t('retention.vsPrevious')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t('retention.week4Avg')}</p>
          <p className="text-2xl font-bold mt-1">18%</p>
          <p className="text-xs text-red-500 mt-1">-2% {t('retention.vsPrevious')}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t('retention.overallRetention')}</p>
          <p className="text-2xl font-bold mt-1">24%</p>
          <p className="text-xs text-muted-foreground mt-1">{t('retention.avgAcrossAll')}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{t('retention.cohort')}</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{t('retention.users')}</th>
                {Array.from({ length: 7 }, (_, i) => (
                  <th key={i} className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">
                    {t('retention.week')} {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50">
                  <td className="px-4 py-2 text-xs font-medium whitespace-nowrap">{cohort.week}</td>
                  <td className="px-4 py-2 text-xs text-center text-muted-foreground">{cohort.size}</td>
                  {cohort.retention.slice(1).map((value, j) => (
                    <td key={j} className="px-1 py-1 text-center">
                      <div className={cn('mx-auto w-14 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition', getCellColor(value))}>
                        {value}%
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 7 - cohort.retention.length + 1 }, (_, j) => (
                    <td key={`empty-${j}`} className="px-1 py-1" />
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
