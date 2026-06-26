import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { inviteMemberSchema } from '@/lib/validations';
import { notify } from '@/services/notification-service';

// GET team members
export const GET = requireAuth(async (req, ctx) => {
  if (!ctx.workspaceId) {
    return NextResponse.json({ error: 'Workspace required' }, { status: 400 });
  }

  const [members, invitations] = await Promise.all([
    prisma.member.findMany({
      where: { workspaceId: ctx.workspaceId },
      include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } }, team: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.invitation.findMany({
      where: { workspaceId: ctx.workspaceId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({ members, invitations });
});

// POST invite member
export const POST = requireAuth(async (req, ctx) => {
  if (!ctx.workspaceId) {
    return NextResponse.json({ error: 'Workspace required' }, { status: 400 });
  }

  // Only OWNER and ADMIN can invite
  if (ctx.memberRole && !['OWNER', 'ADMIN'].includes(ctx.memberRole)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Check if already a member
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    const membership = await prisma.member.findUnique({
      where: { userId_workspaceId: { userId: existing.id, workspaceId: ctx.workspaceId } },
    });
    if (membership) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
    }
  }

  const invitation = await prisma.invitation.create({
    data: {
      email: parsed.data.email,
      workspaceId: ctx.workspaceId,
      role: parsed.data.role as any,
      expiresAt: new Date(Date.now() + 7 * 86400000), // 7 days
    },
  });

  // Send notification to inviter
  await notify({
    userId: ctx.userId,
    type: 'INVITATION',
    title: 'Invitation Sent',
    body: `Invitation sent to ${parsed.data.email}`,
    channels: ['IN_APP'],
  });

  return NextResponse.json({ invitation }, { status: 201 });
});

// PATCH update member role
export const PATCH = requireAuth(async (req, ctx) => {
  if (!ctx.workspaceId || !['OWNER', 'ADMIN'].includes(ctx.memberRole || '')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { memberId, role } = await req.json();
  const member = await prisma.member.update({
    where: { id: memberId },
    data: { role },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  return NextResponse.json({ member });
});

// DELETE remove member
export const DELETE = requireAuth(async (req, ctx) => {
  if (!ctx.workspaceId || !['OWNER', 'ADMIN'].includes(ctx.memberRole || '')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const url = new URL(req.url);
  const memberId = url.searchParams.get('id');
  if (!memberId) return NextResponse.json({ error: 'Member id required' }, { status: 400 });

  await prisma.member.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
});
