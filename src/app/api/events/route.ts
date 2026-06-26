import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const GET = requireAuth(async (req, ctx) => {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const name = url.searchParams.get('name');
  const search = url.searchParams.get('search');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 });
  }

  // Verify workspace access
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const where: any = { projectId };
  if (name) where.name = name;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { path: { contains: search, mode: 'insensitive' } },
      { distinctId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  // Get unique event names for filtering
  const eventNames = await prisma.event.findMany({
    where: { projectId },
    distinct: ['name'],
    select: { name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    events,
    names: eventNames.map(e => e.name),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
