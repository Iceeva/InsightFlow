'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowDown, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

export default function FunnelsPage() {
  const { t } = useI18n();

  const demoFunnels = [
    {
      id: '1',
      name: t('funnels.signupFlow'),
      steps: [
        { name: 'Landing Page', count: 50000, rate: 100 },
        { name: 'Signup Click', count: 12500, rate: 25 },
        { name: 'Form Filled', count: 8750, rate: 17.5 },
        { name: 'Email Verified', count: 6125, rate: 12.3 },
        { name: 'Onboarding Complete', count: 4288, rate: 8.6 },
      ],
    },
    {
      id: '2',
      name: t('funnels.purchaseFlow'),
      steps: [
        { name: 'Product View', count: 30000, rate: 100 },
        { name: 'Add to Cart', count: 9000, rate: 30 },
        { name: 'Checkout Start', count: 5400, rate: 18 },
        { name: 'Payment Info', count: 3780, rate: 12.6 },
        { name: 'Purchase Complete', count: 2646, rate: 8.8 },
      ],
    },
  ];

  const [activeFunnel, setActiveFunnel] = useState(demoFunnels[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('funnels.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('funnels.subtitle')}</p>
        </div>
        <button className="px-3 py-2 rounded-xl text-sm font-medium border border-border hover:bg-accent transition flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" />
          {t('funnels.newFunnel')}
        </button>
      </div>

      <div className="flex gap-2">
        {demoFunnels.map(f => (
          <button key={f.id} onClick={() => setActiveFunnel(f)}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium transition',
              activeFunnel.id === f.id ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent')}>
            {f.name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <h3 className="font-semibold mb-8">{activeFunnel.name}</h3>
        <div className="space-y-1">
          {activeFunnel.steps.map((step, i) => {
            const dropOff = i > 0 ? activeFunnel.steps[i - 1].count - step.count : 0;
            const dropRate = i > 0 ? Math.round((dropOff / activeFunnel.steps[i - 1].count) * 100) : 0;
            return (
              <div key={i}>
                {i > 0 && (
                  <div className="flex items-center gap-3 py-2 ml-4">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      -{dropOff.toLocaleString()} ({dropRate}% {t('funnels.drop')})
                    </span>
                  </div>
                )}
                <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.4 }} className="origin-left">
                  <div className="h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center px-4 justify-between transition-all"
                    style={{ width: `${Math.max(step.rate, 15)}%` }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                      <span className="text-sm font-medium">{step.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{step.count.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">({step.rate}%)</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('funnels.totalConversion')}</p>
            <p className="text-2xl font-bold text-primary">{activeFunnel.steps[activeFunnel.steps.length - 1].rate}%</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('funnels.biggestDrop')}</p>
            <p className="text-2xl font-bold text-red-500">
              {Math.max(...activeFunnel.steps.slice(1).map((s, i) =>
                Math.round(((activeFunnel.steps[i].count - s.count) / activeFunnel.steps[i].count) * 100)
              ))}%
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('funnels.steps')}</p>
            <p className="text-2xl font-bold">{activeFunnel.steps.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
