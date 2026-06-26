import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateApiKey } from '@/lib/utils';

// GET list API keys
export const GET = requireAuth(async (req, ctx) => {
  if (!ctx.workspaceId) {
    return NextResponse.json({ error: 'Workspace required' }, { status: 400 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  // Mask key values
  const masked = keys.map(k => ({
    ...k,
    key: k.key.slice(0, 7) + '...' + k.key.slice(-4),
  }));

  return NextResponse.json({ keys: masked });
});

// POST create API key
export const POST = requireAuth(async (req, ctx) => {
  if (!ctx.workspaceId) {
    return NextResponse.json({ error: 'Workspace required' }, { status: 400 });
  }

  const { name, scopes = ['track'], projectId } = await req.json();

  const key = await prisma.apiKey.create({
    data: {
      name: name || 'API Key',
      key: generateApiKey(),
      workspaceId: ctx.workspaceId,
      projectId,
      scopes,
    },
  });

  // Return full key only on creation
  return NextResponse.json({ key }, { status: 201 });
});

// DELETE revoke API key
export const DELETE = requireAuth(async (req, ctx) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.apiKey.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
