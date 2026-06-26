'use client';

import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export default function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary', loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-4 w-24 bg-muted animate-shimmer rounded" />
        <div className="h-8 w-20 bg-muted animate-shimmer rounded" />
        <div className="h-3 w-16 bg-muted animate-shimmer rounded" />
      </div>
    );
  }

  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : Minus;
  const trendColor = change && change > 0 ? 'text-green-500' : change && change < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 hover:border-primary/20 transition group"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={cn('w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center', iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-1 text-xs', trendColor)}>
          <TrendIcon className="w-3 h-3" />
          <span>{change > 0 ? '+' : ''}{change}% vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
