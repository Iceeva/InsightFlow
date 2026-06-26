'use client';

import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#8b5cf6', '#f97316', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#6366f1', '#14b8a6'];

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
  innerRadius?: number;
  showLegend?: boolean;
  className?: string;
}

export default function PieChart({ data, height = 300, innerRadius = 60, showLegend = true, className }: PieChartProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius + 40}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.75rem', fontSize: 12 }} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}
