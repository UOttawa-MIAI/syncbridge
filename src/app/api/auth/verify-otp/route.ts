import { NextRequest, NextResponse } from 'next/server';
import {
  verifyOtpChallengeToken,
  createSessionToken,
  isEmailWhitelisted,
  SESSION_COOKIE_NAME,
  OTP_CHALLENGE_COOKIE_NAME,
  getEnv,
} from '@/lib/auth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, code, challengeToken: bodyToken } = body;

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // 1. Verify email is still on whitelist
    const { whitelisted } = isEmailWhitelisted(cleanEmail);
    if (!whitelisted) {
      return NextResponse.json({ error: 'This email is no longer on the authorized whitelist.' }, { status: 403 });
    }

    // 2. Read the Stateless Challenge Token from HTTP-only Cookie, Request Body, or Header fallback
    const challengeToken =
      req.cookies.get(OTP_CHALLENGE_COOKIE_NAME)?.value ||
      bodyToken ||
      req.headers.get('x-otp-challenge');

    // 3. Cryptographically Verify Challenge
    const verification = await verifyOtpChallengeToken(challengeToken, cleanEmail, cleanCode);
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error || 'Invalid verification code.' }, { status: 400 });
    }

    // 4. Create 7-Day Session Token
    const sessionToken = await createSessionToken(cleanEmail);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: { email: cleanEmail },
    });

    const isSecure = req.url.startsWith('https://') || getEnv('NODE_ENV') === 'production';

    // 5. Attach 7-Day Session Cookie & Clear Challenge Cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set({
      name: OTP_CHALLENGE_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Verify OTP API Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
