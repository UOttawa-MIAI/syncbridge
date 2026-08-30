import { getEnv } from './auth';

/**
 * Centralized Application Configuration & Fallbacks
 * All public client-side defaults and environment variables are resolved here once.
 */
export const APP_CONFIG = {
  defaultSender: getEnv('NEXT_PUBLIC_SENDER_NAME', 'uOttawa Faculty Desk'),
  defaultRole: getEnv('NEXT_PUBLIC_DISCORD_ROLE_PING', '@everyone'),
  targetChannel: getEnv('NEXT_PUBLIC_DISCORD_CHANNEL', 'school-announcements'),
  supportEmail: getEnv('NEXT_PUBLIC_SUPPORT_EMAIL', 'tchen117@uottawa.ca'),
  accentColor: '#8F001A',
} as const;
