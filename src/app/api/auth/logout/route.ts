import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, getEnv } from '@/lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  const isSecure = req.url.startsWith('https://') || getEnv('NODE_ENV') === 'production';

  // Clear session cookie
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
