'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, GripVertical, Maximize2, Trash2, Edit3 } from 'lucide-react';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

export default function DashboardsPage() {
  const { t } = useI18n();
  const [editMode, setEditMode] = useState(false);

  const demoWidgets = [
    { id: '1', titleKey: 'dashboards.eventTrends', type: 'line', size: 'large', data: Array.from({ length: 14 }, (_, i) => ({
      date: `Day ${i + 1}`, events: 1000 + Math.floor(Math.random() * 2000), users: 300 + Math.floor(Math.random() * 500)
    }))},
    { id: '2', titleKey: 'dashboards.topEvents', type: 'bar', size: 'medium', data: [
      { name: 'page_view', count: 12458 }, { name: 'click', count: 4532 },
      { name: 'signup', count: 1245 }, { name: 'purchase', count: 328 },
    ]},
    { id: '3', titleKey: 'dashboards.devices', type: 'pie', size: 'small', data: [
      { name: 'Desktop', value: 58 }, { name: 'Mobile', value: 35 }, { name: 'Tablet', value: 7 },
    ]},
    { id: '4', titleKey: 'dashboards.countries', type: 'pie', size: 'small', data: [
      { name: 'US', value: 45 }, { name: 'FR', value: 18 }, { name: 'DE', value: 12 }, { name: 'Other', value: 25 },
    ]},
    { id: '5', titleKey: 'dashboards.revenueTrend', type: 'line', size: 'medium', data: Array.from({ length: 14 }, (_, i) => ({
      date: `Day ${i + 1}`, revenue: 500 + Math.floor(Math.random() * 1500),
    }))},
    { id: '6', titleKey: 'dashboards.pageViews', type: 'bar', size: 'medium', data: [
      { name: '/', count: 8450 }, { name: '/pricing', count: 3200 },
      { name: '/docs', count: 2800 }, { name: '/blog', count: 1900 },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboards.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('dashboards.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditMode(!editMode)}
            className={cn('px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2',
              editMode ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent')}>
            <Edit3 className="w-3.5 h-3.5" />
            {editMode ? t('dashboards.doneMode') : t('dashboards.editMode')}
          </button>
          <button className="px-3 py-2 rounded-xl text-sm font-medium border border-border hover:bg-accent transition flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            {t('dashboards.addWidget')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {demoWidgets.map((widget, i) => {
          const colSpan = widget.size === 'large' ? 'col-span-12 lg:col-span-8' :
            widget.size === 'medium' ? 'col-span-12 sm:col-span-6' :
            'col-span-12 sm:col-span-6 lg:col-span-3';

          return (
            <motion.div key={widget.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn('rounded-2xl border bg-card p-5 group',
                editMode ? 'border-dashed border-primary/40 cursor-move' : 'border-border', colSpan)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {editMode && <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />}
                  <h3 className="font-medium text-sm">{t(widget.titleKey)}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-accent">
                    <Maximize2 className="w-3 h-3 text-muted-foreground" />
                  </button>
                  {editMode && (
                    <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {widget.type === 'line' && (
                <LineChart data={widget.data}
                  lines={[
                    { key: Object.keys(widget.data[0]).filter(k => k !== 'date')[0], color: '#8b5cf6' },
                    ...(('users' in widget.data[0]) ? [{ key: 'users', color: '#f97316' }] : []),
                  ]}
                  height={widget.size === 'large' ? 280 : 200} />
              )}
              {widget.type === 'bar' && (
                <BarChart data={widget.data} bars={[{ key: 'count', color: '#8b5cf6' }]} height={200} />
              )}
              {widget.type === 'pie' && (
                <PieChart data={widget.data} height={200} innerRadius={40} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
