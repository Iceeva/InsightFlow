import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const tokens = generateTokens({ userId: payload.userId, email: payload.email, role: payload.role });
    return NextResponse.json(tokens);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
