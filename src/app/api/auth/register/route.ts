import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateTokens } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, name, passwordHash, emailVerified: new Date() },
    });

    // Create default workspace
    const slug = generateSlug(name || email.split('@')[0]);
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name || email.split('@')[0]}'s Workspace`,
        slug: `${slug}-${Date.now().toString(36)}`,
      },
    });

    await prisma.member.create({
      data: { userId: user.id, workspaceId: workspace.id, role: 'OWNER' },
    });

    const tokens = generateTokens({ userId: user.id, email: user.email, role: user.role });

    logger.info(`New user registered: ${email}`);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      workspace: { ...workspace, role: 'OWNER' },
      ...tokens,
    }, { status: 201 });
  } catch (error) {
    logger.error('Registration error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
