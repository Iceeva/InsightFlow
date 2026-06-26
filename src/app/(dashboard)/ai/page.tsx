'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import LineChart from '@/components/charts/LineChart';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

const predictions = Array.from({ length: 14 }, (_, i) => ({
  date: `Day ${i + 1}`,
  actual: i < 7 ? 2000 + Math.floor(Math.random() * 1000) : undefined,
  predicted: 2200 + i * 80 + Math.floor(Math.random() * 200),
  lower: 1800 + i * 60,
  upper: 2600 + i * 100,
}));

const anomalies = [
  { date: 'Jun 15', value: 4850, expected: 2400, severity: 'high' as const },
  { date: 'Jun 18', value: 890, expected: 2350, severity: 'high' as const },
  { date: 'Jun 20', value: 3200, expected: 2500, severity: 'low' as const },
];

export default function AIPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 1200); }, []);

  const demoInsights = [
    { icon: TrendingUp, color: 'text-green-500 bg-green-500/10', titleKey: 'ai.insight1Title', bodyKey: 'ai.insight1Body' },
    { icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10', titleKey: 'ai.insight2Title', bodyKey: 'ai.insight2Body' },
    { icon: Zap, color: 'text-blue-500 bg-blue-500/10', titleKey: 'ai.insight3Title', bodyKey: 'ai.insight3Body' },
    { icon: TrendingDown, color: 'text-red-500 bg-red-500/10', titleKey: 'ai.insight4Title', bodyKey: 'ai.insight4Body' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('ai.title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t('ai.subtitle')}</p>
          </div>
        </div>
        <button className="px-3 py-2 rounded-xl text-sm font-medium border border-border hover:bg-accent transition flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          {t('ai.refresh')}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {demoInsights.map((insight, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/20 transition cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', insight.color)}>
                <insight.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">{t(insight.titleKey)}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(insight.bodyKey)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{t('ai.trendPrediction')}</h3>
            <p className="text-xs text-muted-foreground">{t('ai.trendPredictionSubtitle')}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {t('ai.upward')}
          </span>
        </div>
        <LineChart data={predictions} lines={[
          { key: 'actual', color: '#8b5cf6', name: t('ai.actual') },
          { key: 'predicted', color: '#f97316', name: t('ai.predicted') },
        ]} height={300} showLegend />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">{t('ai.detectedAnomalies')}</h3>
        <div className="space-y-3">
          {anomalies.map((a, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition">
              <AlertTriangle className={cn('w-4 h-4', a.severity === 'high' ? 'text-red-500' : 'text-amber-500')} />
              <div className="flex-1">
                <span className="text-sm font-medium">{a.date}</span>
                <p className="text-xs text-muted-foreground">
                  {t('ai.value')}: {a.value.toLocaleString()} - {t('ai.expected')}: {a.expected.toLocaleString()}
                  ({a.value > a.expected ? '+' : ''}{Math.round(((a.value - a.expected) / a.expected) * 100)}%)
                </p>
              </div>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium',
                a.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500')}>
                {a.severity}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
