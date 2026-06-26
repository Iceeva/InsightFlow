import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { analyticsQuerySchema } from '@/lib/validations';
import {
  getEventTimeseries, getEventsByName, getTopPages,
  getUniqueUsers, getGeoBreakdown, getDeviceBreakdown,
  getHeatmap, getOverviewStats,
} from '@/services/analytics-engine';

export const GET = requireAuth(async (req, ctx) => {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  const metric = url.searchParams.get('metric') || 'overview';
  const period = url.searchParams.get('period') || '30d';
  const granularity = url.searchParams.get('granularity') || 'day';

  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 });
  }

  try {
    let data: any;

    switch (metric) {
      case 'overview':
        data = await getOverviewStats(projectId);
        break;
      case 'timeseries':
        data = await getEventTimeseries({ projectId, metric, period: period as any, granularity: granularity as any });
        break;
      case 'events_by_name':
        data = await getEventsByName(projectId, period);
        break;
      case 'top_pages':
        data = await getTopPages(projectId, period);
        break;
      case 'unique_users':
        data = { count: await getUniqueUsers(projectId, period) };
        break;
      case 'geo':
        data = await getGeoBreakdown(projectId, period);
        break;
      case 'browsers':
        data = await getDeviceBreakdown(projectId, period, 'browser');
        break;
      case 'os':
        data = await getDeviceBreakdown(projectId, period, 'os');
        break;
      case 'devices':
        data = await getDeviceBreakdown(projectId, period, 'device');
        break;
      case 'heatmap':
        data = await getHeatmap(projectId, period);
        break;
      default:
        return NextResponse.json({ error: 'Unknown metric' }, { status: 400 });
    }

    return NextResponse.json({ data, metric, period });
  } catch (error) {
    return NextResponse.json({ error: 'Analytics query failed' }, { status: 500 });
  }
});
