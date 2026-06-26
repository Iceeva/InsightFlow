import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import type { MemberRole, GlobalRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh';

export interface JWTPayload {
  userId: string;
  email: string;
  role: GlobalRole;
}

export interface AuthContext {
  userId: string;
  email: string;
  role: GlobalRole;
  workspaceId?: string;
  memberRole?: MemberRole;
}

export function generateTokens(payload: JWTPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  // Check Bearer token
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) {
      const workspaceId = req.headers.get('x-workspace-id') || undefined;
      let memberRole: MemberRole | undefined;
      if (workspaceId) {
        const member = await prisma.member.findUnique({
          where: { userId_workspaceId: { userId: payload.userId, workspaceId } },
        });
        memberRole = member?.role;
      }
      return { ...payload, workspaceId, memberRole };
    }
  }

  // Check API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) {
    const key = await prisma.apiKey.findUnique({ where: { key: apiKey } });
    if (key && key.isActive) {
      await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
      return {
        userId: 'api-key',
        email: 'api',
        role: 'USER',
        workspaceId: key.workspaceId,
        memberRole: 'MEMBER',
      };
    }
  }

  return null;
}

export function requireAuth(handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, auth);
  };
}

export function requireRole(...roles: MemberRole[]) {
  return (handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>) => {
    return requireAuth(async (req, ctx) => {
      if (ctx.memberRole && !roles.includes(ctx.memberRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      return handler(req, ctx);
    });
  };
}
