import { NextRequest, NextResponse } from 'next/server';
import { isEmailWhitelisted, generateOtpCode, createOtpChallengeToken, OTP_CHALLENGE_COOKIE_NAME, getEnv } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify Domain & Whitelist
    const { whitelisted, isUOttawa } = isEmailWhitelisted(cleanEmail);

    if (!isUOttawa) {
      return NextResponse.json(
        { error: 'Access is restricted to official @uottawa.ca email addresses.' },
        { status: 403 }
      );
    }

    if (!whitelisted) {
      return NextResponse.json(
        {
          error:
            'This @uottawa.ca email is not on the authorized faculty/staff whitelist. Please contact the MIAI Program Director for access.',
        },
        { status: 403 }
      );
    }

    // 2. Generate 6-Digit OTP & Stateless HMAC Challenge Token
    const code = generateOtpCode();
    const challengeToken = await createOtpChallengeToken(cleanEmail, code);

    // 3. Dispatch Email (or log in dev simulation mode)
    const result = await sendOtpEmail(cleanEmail, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Verification code sent to your uOttawa inbox.',
      challengeToken,
      simulated: result.simulated,
      simulatedCode: result.simulatedCode,
    });

    const isSecure = req.url.startsWith('https://') || getEnv('NODE_ENV') === 'production';

    // 4. Attach 10-Minute Stateless Challenge Cookie
    response.cookies.set({
      name: OTP_CHALLENGE_COOKIE_NAME,
      value: challengeToken,
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Send OTP API Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
