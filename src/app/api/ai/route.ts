import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { predictTrend, detectAnomalies, detectSpikes, generateInsights } from '@/services/ai-engine';

export const GET = requireAuth(async (req, ctx) => {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  const type = url.searchParams.get('type') || 'insights';

  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 });
  }

  try {
    let data: any;

    switch (type) {
      case 'insights':
        data = await generateInsights(projectId);
        break;
      case 'predictions':
        data = await predictTrend(projectId, 'events');
        break;
      case 'anomalies':
        data = await detectAnomalies(projectId);
        break;
      case 'spikes':
        data = await detectSpikes(projectId);
        break;
      default:
        return NextResponse.json({ error: 'Unknown AI type' }, { status: 400 });
    }

    return NextResponse.json({ data, type });
  } catch (error) {
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
});
