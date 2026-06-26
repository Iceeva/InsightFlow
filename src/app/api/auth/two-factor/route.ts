import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// POST: Enable or verify 2FA
export const POST = requireAuth(async (req, ctx) => {
  const { action, code } = await req.json();

  if (action === 'setup') {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(ctx.email, 'InsightFlow', secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: ctx.userId },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({ secret, qrCode });
  }

  if (action === 'verify') {
    const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!user?.twoFactorSecret || !code) {
      return NextResponse.json({ error: 'Setup 2FA first' }, { status: 400 });
    }

    const valid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
    if (!valid) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: ctx.userId },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ success: true, message: '2FA enabled' });
  }

  if (action === 'disable') {
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: '2FA not enabled' }, { status: 400 });
    }

    const valid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
    if (!valid) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: ctx.userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return NextResponse.json({ success: true, message: '2FA disabled' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
});
