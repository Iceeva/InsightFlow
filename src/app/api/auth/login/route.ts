import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateTokens } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { authenticator } from 'otplib';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password, code } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2FA check
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!code) {
        return NextResponse.json({ requires2FA: true }, { status: 200 });
      }
      const valid2FA = authenticator.verify({ token: code, secret: user.twoFactorSecret });
      if (!valid2FA) {
        return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
      }
    }

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

    // Get workspaces
    const memberships = await prisma.member.findMany({
      where: { userId: user.id },
      include: { workspace: true },
    });

    logger.info(`User logged in: ${user.email}`);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, role: user.role, twoFactorEnabled: user.twoFactorEnabled },
      workspaces: memberships.map(m => ({ ...m.workspace, role: m.role })),
      ...tokens,
    });
  } catch (error) {
    logger.error('Login error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
