import prisma from '@/lib/prisma';

/**
 * InsightFlow AI Engine
 * Provides predictions, anomaly detection, and spike detection
 * using statistical methods (no external AI API needed)
 */

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

// Simple moving average
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

// Standard deviation
function stdDev(data: number[]): number {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const squaredDiffs = data.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / data.length);
}

// Linear regression for trend prediction
function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = data.reduce((a, b) => a + b, 0);
  const xySum = data.reduce((sum, y, x) => sum + x * y, 0);
  const x2Sum = data.reduce((sum, _, x) => sum + x * x, 0);

  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;

  return { slope, intercept };
}

export async function predictTrend(projectId: string, metric: string, days = 7) {
  const data = await getHistoricalCounts(projectId, 30);
  if (data.length < 7) return { predicted: [], confidence: 0, trend: 'stable' as const };

  const values = data.map(d => d.value);
  const { slope, intercept } = linearRegression(values);
  const ma = movingAverage(values, 7);

  // Predict next N days
  const predicted: number[] = [];
  for (let i = 0; i < days; i++) {
    const linearPred = slope * (values.length + i) + intercept;
    const maTrend = ma[ma.length - 1] + (slope * i);
    // Blend linear and MA predictions
    predicted.push(Math.max(0, Math.round((linearPred + maTrend) / 2)));
  }

  const sd = stdDev(values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const confidence = Math.max(0, Math.min(100, Math.round(100 - (sd / mean) * 100)));

  const trend = slope > 0.5 ? 'up' : slope < -0.5 ? 'down' : 'stable';

  return { predicted, confidence, trend };
}

export async function detectAnomalies(projectId: string, sensitivity = 2) {
  const data = await getHistoricalCounts(projectId, 30);
  if (data.length < 7) return [];

  const values = data.map(d => d.value);
  const ma = movingAverage(values, 7);
  const sd = stdDev(values);

  const anomalies: { date: string; value: number; expected: number; severity: 'low' | 'medium' | 'high' }[] = [];

  for (let i = 0; i < values.length; i++) {
    const diff = Math.abs(values[i] - ma[i]);
    if (diff > sd * sensitivity) {
      const severity = diff > sd * 3 ? 'high' : diff > sd * 2.5 ? 'medium' : 'low';
      anomalies.push({
        date: data[i].timestamp.toISOString().split('T')[0],
        value: values[i],
        expected: Math.round(ma[i]),
        severity,
      });
    }
  }

  return anomalies;
}

export async function detectSpikes(projectId: string, threshold = 2) {
  const data = await getHourlyCounts(projectId, 48);
  if (data.length < 12) return [];

  const values = data.map(d => d.value);
  const ma = movingAverage(values, 6);
  const sd = stdDev(values);

  const spikes: { timestamp: string; value: number; baseline: number; multiplier: number }[] = [];

  for (let i = 6; i < values.length; i++) {
    if (ma[i] > 0 && values[i] > ma[i] * threshold) {
      spikes.push({
        timestamp: data[i].timestamp.toISOString(),
        value: values[i],
        baseline: Math.round(ma[i]),
        multiplier: Math.round((values[i] / ma[i]) * 10) / 10,
      });
    }
  }

  return spikes;
}

async function getHistoricalCounts(projectId: string, days: number): Promise<TimeSeriesPoint[]> {
  const start = new Date(Date.now() - days * 86400000);
  const result = await prisma.$queryRawUnsafe(`
    SELECT date_trunc('day', timestamp) as ts, COUNT(*)::int as count
    FROM events WHERE "projectId" = $1 AND timestamp >= $2
    GROUP BY ts ORDER BY ts
  `, projectId, start);
  return (result as any[]).map(r => ({ timestamp: r.ts, value: r.count }));
}

async function getHourlyCounts(projectId: string, hours: number): Promise<TimeSeriesPoint[]> {
  const start = new Date(Date.now() - hours * 3600000);
  const result = await prisma.$queryRawUnsafe(`
    SELECT date_trunc('hour', timestamp) as ts, COUNT(*)::int as count
    FROM events WHERE "projectId" = $1 AND timestamp >= $2
    GROUP BY ts ORDER BY ts
  `, projectId, start);
  return (result as any[]).map(r => ({ timestamp: r.ts, value: r.count }));
}

export async function generateInsights(projectId: string) {
  const [trend, anomalies, spikes] = await Promise.all([
    predictTrend(projectId, 'events'),
    detectAnomalies(projectId),
    detectSpikes(projectId),
  ]);

  const insights: string[] = [];

  if (trend.trend === 'up') insights.push(`📈 Traffic is trending up with ${trend.confidence}% confidence`);
  if (trend.trend === 'down') insights.push(`📉 Traffic is trending down - consider investigating`);
  if (anomalies.length > 0) insights.push(`⚠️ ${anomalies.length} anomaly(ies) detected in the last 30 days`);
  if (spikes.length > 0) insights.push(`🔥 ${spikes.length} traffic spike(s) detected in the last 48 hours`);

  return { trend, anomalies, spikes, insights };
}
