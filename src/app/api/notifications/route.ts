import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { markAsRead, markAllAsRead, getUnreadCount } from '@/services/notification-service';

// GET notifications
export const GET = requireAuth(async (req, ctx) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;

  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: ctx.userId } }),
    getUnreadCount(ctx.userId),
  ]);

  return NextResponse.json({
    notifications,
    unread,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// PATCH mark as read
export const PATCH = requireAuth(async (req, ctx) => {
  const { id, all } = await req.json();

  if (all) {
    await markAllAsRead(ctx.userId);
  } else if (id) {
    await markAsRead(id, ctx.userId);
  }

  return NextResponse.json({ success: true });
});
