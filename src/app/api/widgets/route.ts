import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createWidgetSchema } from '@/lib/validations';

// POST create widget
export const POST = requireAuth(async (req, ctx) => {
  const body = await req.json();
  const { dashboardId, ...widgetData } = body;

  if (!dashboardId) {
    return NextResponse.json({ error: 'dashboardId required' }, { status: 400 });
  }

  const parsed = createWidgetSchema.safeParse(widgetData);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const widget = await prisma.widget.create({
    data: {
      dashboardId,
      type: parsed.data.type,
      title: parsed.data.title,
      config: parsed.data.config,
      position: parsed.data.position || { x: 0, y: 0 },
      size: parsed.data.size || { w: 6, h: 4 },
    },
  });

  return NextResponse.json({ widget }, { status: 201 });
});

// PATCH update widget
export const PATCH = requireAuth(async (req, ctx) => {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'Widget id required' }, { status: 400 });

  const widget = await prisma.widget.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json({ widget });
});

// DELETE widget
export const DELETE = requireAuth(async (req, ctx) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.widget.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
