import prisma from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/redis';
import type { AnalyticsQuery } from '@/lib/validations';

function getPeriodDates(period: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start: Date;
  const end = endDate ? new Date(endDate) : now;

  switch (period) {
    case '1h': start = new Date(now.getTime() - 3600000); break;
    case '24h': start = new Date(now.getTime() - 86400000); break;
    case '7d': start = new Date(now.getTime() - 7 * 86400000); break;
    case '30d': start = new Date(now.getTime() - 30 * 86400000); break;
    case '90d': start = new Date(now.getTime() - 90 * 86400000); break;
    case 'custom': start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 86400000); break;
    default: start = new Date(now.getTime() - 30 * 86400000);
  }
  return { start, end };
}

export async function getEventTimeseries(query: AnalyticsQuery) {
  const cacheKey = `analytics:timeseries:${JSON.stringify(query)}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;

  const { start, end } = getPeriodDates(query.period, query.startDate, query.endDate);
  const trunc = query.granularity === 'minute' ? 'minute' :
    query.granularity === 'hour' ? 'hour' :
    query.granularity === 'week' ? 'week' :
    query.granularity === 'month' ? 'month' : 'day';

  const result = await prisma.$queryRawUnsafe(`
    SELECT date_trunc('${trunc}', timestamp) as period,
           COUNT(*)::int as count
    FROM events
    WHERE "projectId" = $1
      AND timestamp >= $2
      AND timestamp <= $3
      ${query.filters?.name ? `AND name = '${query.filters.name}'` : ''}
    GROUP BY period
    ORDER BY period
  `, query.projectId, start, end);

  const data = { labels: (result as any[]).map(r => r.period), data: (result as any[]).map(r => r.count) };
  await cacheSet(cacheKey, data, 60);
  return data;
}

export async function getEventsByName(projectId: string, period: string, limit = 10) {
  const { start, end } = getPeriodDates(period);
  const cacheKey = `analytics:byname:${projectId}:${period}:${limit}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;

  const result = await prisma.event.groupBy({
    by: ['name'],
    where: { projectId, timestamp: { gte: start, lte: end } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  const data = result.map(r => ({ name: r.name, count: r._count.id }));
  await cacheSet(cacheKey, data, 120);
  return data;
}

export async function getTopPages(projectId: string, period: string, limit = 10) {
  const { start, end } = getPeriodDates(period);
  const result = await prisma.event.groupBy({
    by: ['path'],
    where: { projectId, timestamp: { gte: start, lte: end }, path: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });
  return result.map(r => ({ path: r.path, count: r._count.id }));
}

export async function getUniqueUsers(projectId: string, period: string) {
  const { start, end } = getPeriodDates(period);
  const result = await prisma.event.findMany({
    where: { projectId, timestamp: { gte: start, lte: end }, distinctId: { not: null } },
    distinct: ['distinctId'],
    select: { distinctId: true },
  });
  return result.length;
}

export async function getGeoBreakdown(projectId: string, period: string) {
  const { start, end } = getPeriodDates(period);
  const result = await prisma.event.groupBy({
    by: ['country'],
    where: { projectId, timestamp: { gte: start, lte: end }, country: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 20,
  });
  const total = result.reduce((sum, r) => sum + r._count.id, 0);
  return result.map(r => ({
    country: r.country,
    count: r._count.id,
    percentage: Math.round((r._count.id / total) * 100),
  }));
}

export async function getDeviceBreakdown(projectId: string, period: string, field: 'browser' | 'os' | 'device') {
  const { start, end } = getPeriodDates(period);
  const result = await prisma.event.groupBy({
    by: [field],
    where: { projectId, timestamp: { gte: start, lte: end }, [field]: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });
  return result.map(r => ({ name: r[field], count: r._count.id }));
}

export async function getHeatmap(projectId: string, period: string) {
  const { start, end } = getPeriodDates(period);
  const result = await prisma.$queryRawUnsafe(`
    SELECT EXTRACT(DOW FROM timestamp)::int as day,
           EXTRACT(HOUR FROM timestamp)::int as hour,
           COUNT(*)::int as value
    FROM events
    WHERE "projectId" = $1 AND timestamp >= $2 AND timestamp <= $3
    GROUP BY day, hour
  `, projectId, start, end);
  return result;
}

export async function getFunnelData(funnelId: string) {
  const funnel = await prisma.funnel.findUnique({ where: { id: funnelId } });
  if (!funnel) return null;

  const steps = JSON.parse(funnel.steps as string) as { name: string; path?: string }[];
  const results: { name: string; count: number; conversionRate: number }[] = [];

  for (let i = 0; i < steps.length; i++) {
    const where: any = { projectId: funnel.projectId, name: steps[i].name };
    if (steps[i].path) where.path = steps[i].path;
    const count = await prisma.event.count({ where });
    const rate = i === 0 ? 100 : results[0].count > 0 ? Math.round((count / results[0].count) * 100) : 0;
    results.push({ name: steps[i].name, count, conversionRate: rate });
  }

  return { funnel, steps: results };
}

export async function getRetentionData(projectId: string, weeks = 8) {
  const result = await prisma.$queryRawUnsafe(`
    WITH cohorts AS (
      SELECT "distinctId",
             date_trunc('week', MIN(timestamp)) as cohort_week
      FROM events
      WHERE "projectId" = $1 AND "distinctId" IS NOT NULL
      GROUP BY "distinctId"
    ),
    activity AS (
      SELECT c."distinctId",
             c.cohort_week,
             date_trunc('week', e.timestamp) as activity_week
      FROM cohorts c
      JOIN events e ON e."distinctId" = c."distinctId" AND e."projectId" = $1
    )
    SELECT cohort_week,
           COUNT(DISTINCT "distinctId")::int as cohort_size,
           EXTRACT(WEEK FROM activity_week - cohort_week)::int as week_number,
           COUNT(DISTINCT CASE WHEN activity_week > cohort_week THEN "distinctId" END)::int as retained
    FROM activity
    GROUP BY cohort_week, week_number
    ORDER BY cohort_week, week_number
    LIMIT $2
  `, projectId, weeks * 10);

  return result;
}

export async function getOverviewStats(projectId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

  const [currentEvents, previousEvents, currentUsers, previousUsers] = await Promise.all([
    prisma.event.count({ where: { projectId, timestamp: { gte: thirtyDaysAgo } } }),
    prisma.event.count({ where: { projectId, timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.event.findMany({
      where: { projectId, timestamp: { gte: thirtyDaysAgo }, distinctId: { not: null } },
      distinct: ['distinctId'], select: { distinctId: true },
    }),
    prisma.event.findMany({
      where: { projectId, timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, distinctId: { not: null } },
      distinct: ['distinctId'], select: { distinctId: true },
    }),
  ]);

  return {
    totalEvents: currentEvents,
    eventsChange: previousEvents > 0 ? Math.round(((currentEvents - previousEvents) / previousEvents) * 100) : 0,
    uniqueUsers: currentUsers.length,
    usersChange: previousUsers.length > 0 ? Math.round(((currentUsers.length - previousUsers.length) / previousUsers.length) * 100) : 0,
  };
}
