import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { eventQueue } from '@/lib/queue';
import { rateLimitCheck } from '@/lib/redis';
import { trackEventSchema, trackBatchSchema } from '@/lib/validations';
import { emitToWorkspace } from '@/lib/socket';
import logger from '@/lib/logger';

// POST /api/track - Ingest events (public endpoint, requires API key)
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const allowed = await rateLimitCheck(`ratelimit:track:${ip}`, 100, 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Auth via API key
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required. Include x-api-key header.' }, { status: 401 });
    }

    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { workspace: { include: { projects: { take: 1 } } } },
    });

    if (!key || !key.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 });
    }

    if (key.expiresAt && key.expiresAt < new Date()) {
      return NextResponse.json({ error: 'API key expired' }, { status: 401 });
    }

    // Update last used
    await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });

    const projectId = key.projectId || key.workspace.projects[0]?.id;
    if (!projectId) {
      return NextResponse.json({ error: 'No project found for this API key' }, { status: 400 });
    }

    const body = await req.json();
    const userAgent = req.headers.get('user-agent') || '';

    // Single event or batch
    if (body.events) {
      const parsed = trackBatchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
      }

      for (const event of parsed.data.events) {
        await eventQueue.add('process-event', {
          event: { ...event, projectId },
          ip,
          userAgent,
        });
      }

      // Emit realtime
      emitToWorkspace(key.workspaceId, 'events:batch', {
        count: parsed.data.events.length,
        projectId,
      });

      logger.info(`Batch tracked: ${parsed.data.events.length} events`, { projectId });
      return NextResponse.json({ success: true, count: parsed.data.events.length });
    } else {
      const parsed = trackEventSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
      }

      await eventQueue.add('process-event', {
        event: { ...parsed.data, projectId },
        ip,
        userAgent,
      });

      // Emit realtime
      emitToWorkspace(key.workspaceId, 'event:new', {
        name: parsed.data.name,
        projectId,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    logger.error('Track error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
