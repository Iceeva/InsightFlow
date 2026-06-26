'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Clock, MousePointerClick, Globe, Monitor } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { useI18n } from '@/i18n/context';

function generateTimeseries(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    events: Math.floor(2000 + Math.random() * 3000 + i * 50),
    users: Math.floor(500 + Math.random() * 800 + i * 15),
  }));
}

const topEvents = [
  { name: 'page_view', count: 124580 },
  { name: 'button_click', count: 45320 },
  { name: 'signup', count: 12450 },
  { name: 'purchase', count: 3280 },
  { name: 'add_to_cart', count: 8920 },
  { name: 'search', count: 18650 },
  { name: 'logout', count: 6780 },
];

const geoData = [
  { name: 'United States', value: 45 },
  { name: 'France', value: 18 },
  { name: 'Germany', value: 12 },
  { name: 'Japan', value: 8 },
  { name: 'Brazil', value: 7 },
  { name: 'Other', value: 10 },
];

const deviceData = [
  { name: 'Desktop', value: 58 },
  { name: 'Mobile', value: 35 },
  { name: 'Tablet', value: 7 },
];

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [data] = useState(generateTimeseries(30));
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('analytics.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('analytics.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('analytics.totalEvents')} value={2437850} change={12} icon={Activity} loading={loading} />
        <StatCard title={t('analytics.uniqueUsers')} value={148320} change={8} icon={Users} loading={loading} />
        <StatCard title={t('analytics.avgSession')} value="4m 32s" change={3} icon={Clock} loading={loading} />
        <StatCard title={t('analytics.clickRate')} value="3.2%" change={-2} icon={MousePointerClick} loading={loading} />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{t('analytics.eventTrends')}</h3>
            <p className="text-xs text-muted-foreground">{t('analytics.eventTrendsSubtitle')}</p>
          </div>
        </div>
        <LineChart data={data} lines={[
          { key: 'events', color: '#8b5cf6', name: t('analytics.events') },
          { key: 'users', color: '#f97316', name: t('analytics.users') },
        ]} xKey="date" height={350} showLegend />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">{t('analytics.topEvents')}</h3>
          <div className="space-y-3">
            {topEvents.map((event, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium font-mono">{event.name}</span>
                    <span className="text-xs text-muted-foreground">{event.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(event.count / topEvents[0].count) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">{t('analytics.countries')}</h3>
          </div>
          <PieChart data={geoData} height={220} innerRadius={50} showLegend />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">{t('analytics.devices')}</h3>
          </div>
          <PieChart data={deviceData} height={220} innerRadius={50} showLegend />
        </motion.div>
      </div>
    </div>
  );
}
