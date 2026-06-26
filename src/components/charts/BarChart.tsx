'use client';

import { ResponsiveContainer, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: any[];
  bars: { key: string; color: string; name?: string }[];
  xKey?: string;
  height?: number;
  stacked?: boolean;
  className?: string;
}

export default function BarChart({ data, bars, xKey = 'name', height = 300, stacked = false, className }: BarChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBar data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.75rem', fontSize: 12 }} />
          {bars.map((bar) => (
            <Bar key={bar.key} dataKey={bar.key} fill={bar.color} name={bar.name || bar.key} radius={[4, 4, 0, 0]} stackId={stacked ? 'stack' : undefined} />
          ))}
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}
