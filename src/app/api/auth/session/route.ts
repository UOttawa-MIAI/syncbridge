import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, isEmailWhitelisted } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    if (!session || !session.email) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Verify user is still on the whitelist
    const { whitelisted } = isEmailWhitelisted(session.email);
    if (!whitelisted) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: { email: session.email },
    });
  } catch (err: any) {
    console.error('Session Check API Error:', err);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
