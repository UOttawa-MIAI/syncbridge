import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'syncbridge_session';
export const OTP_CHALLENGE_COOKIE_NAME = 'syncbridge_otp_challenge';

const DEFAULT_SECRET = 'syncbridge_dev_jwt_secret_fallback_key_8f001a_32chars';

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret.padEnd(32, '0'));
}

/**
 * Validates if an email address is authorized in the ADMIN_WHITELIST environment variable.
 */
export function isEmailWhitelisted(email: string): { whitelisted: boolean; isUOttawa: boolean } {
  if (!email || typeof email !== 'string') {
    return { whitelisted: false, isUOttawa: false };
  }

  const cleanEmail = email.trim().toLowerCase();
  const isUOttawa = cleanEmail.endsWith('@uottawa.ca') || cleanEmail.endsWith('@alumni.uottawa.ca');

  const whitelistEnv = process.env.ADMIN_WHITELIST || '';
  const allowedList = whitelistEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // If no whitelist is configured in env, allow any valid @uottawa.ca in local dev fallback
  const whitelisted = allowedList.length > 0 ? allowedList.includes(cleanEmail) : isUOttawa;

  return { whitelisted, isUOttawa };
}

/**
 * Generates a random 6-digit numeric OTP code.
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates a stateless, signed HMAC challenge token containing the OTP and email.
 * Valid for 10 minutes.
 */
export async function createOtpChallengeToken(email: string, code: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  const secret = getJwtSecret();

  return await new SignJWT({
    email: cleanEmail,
    code: code.trim(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m') // 10-minute expiration
    .sign(secret);
}

/**
 * Verifies a stateless HMAC challenge token against the user's submitted email and 6-digit code.
 */
export async function verifyOtpChallengeToken(
  token: string | undefined,
  submittedEmail: string,
  submittedCode: string
): Promise<{ valid: boolean; error?: string }> {
  if (!token) {
    return { valid: false, error: 'No verification session found. Please request a new verification code.' };
  }

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    const tokenEmail = (payload.email as string)?.trim().toLowerCase();
    const tokenCode = (payload.code as string)?.trim();
    const cleanSubmittedEmail = submittedEmail.trim().toLowerCase();
    const cleanSubmittedCode = submittedCode.trim();

    if (tokenEmail !== cleanSubmittedEmail) {
      return { valid: false, error: 'Verification code was requested for a different email address.' };
    }

    if (tokenCode !== cleanSubmittedCode) {
      return { valid: false, error: 'Incorrect verification code. Please check your email and try again.' };
    }

    return { valid: true };
  } catch (err: any) {
    if (err?.code === 'ERR_JWT_EXPIRED') {
      return { valid: false, error: 'Verification code has expired. Please request a new code.' };
    }
    return { valid: false, error: 'Invalid or tampered verification token. Please request a new code.' };
  }
}

/**
 * Creates a signed JWT session cookie payload valid for 7 days.
 */
export async function createSessionToken(email: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  const secret = getJwtSecret();

  return await new SignJWT({ email: cleanEmail })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7-day session
    .sign(secret);
}

/**
 * Verifies a session token string and returns the authenticated user email if valid.
 */
export async function verifySessionToken(token: string): Promise<{ email: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    if (payload && typeof payload.email === 'string') {
      return { email: payload.email };
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts and verifies the current session from an incoming NextRequest.
 */
export async function getSessionFromRequest(req: NextRequest): Promise<{ email: string } | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}
