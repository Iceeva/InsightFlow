import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createDashboardSchema, updateLayoutSchema } from '@/lib/validations';

// GET all dashboards for workspace
export const GET = requireAuth(async (req, ctx) => {
  if (!ctx.workspaceId) {
    return NextResponse.json({ error: 'Workspace required' }, { status: 400 });
  }

  const dashboards = await prisma.dashboard.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { widgets: true },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ dashboards });
});

// POST create dashboard
export const POST = requireAuth(async (req, ctx) => {
  if (!ctx.workspaceId) {
    return NextResponse.json({ error: 'Workspace required' }, { status: 400 });
  }

  const body = await req.json();
  const parsed = createDashboardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const dashboard = await prisma.dashboard.create({
    data: {
      ...parsed.data,
      workspaceId: ctx.workspaceId,
    },
    include: { widgets: true },
  });

  return NextResponse.json({ dashboard }, { status: 201 });
});

// PATCH update dashboard layout
export const PATCH = requireAuth(async (req, ctx) => {
  const body = await req.json();
  const { dashboardId, layout, name } = body;

  if (!dashboardId) {
    return NextResponse.json({ error: 'dashboardId required' }, { status: 400 });
  }

  const updateData: any = {};
  if (layout) updateData.layout = layout;
  if (name) updateData.name = name;

  const dashboard = await prisma.dashboard.update({
    where: { id: dashboardId },
    data: updateData,
    include: { widgets: true },
  });

  return NextResponse.json({ dashboard });
});

// DELETE dashboard
export const DELETE = requireAuth(async (req, ctx) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.dashboard.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
