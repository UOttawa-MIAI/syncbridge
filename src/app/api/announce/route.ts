import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, isEmailWhitelisted } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request
    const session = await getSessionFromRequest(req);
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in with your authorized @uottawa.ca email.' },
        { status: 401 }
      );
    }

    // 2. Validate Whitelist Status
    const { whitelisted } = isEmailWhitelisted(session.email);
    if (!whitelisted) {
      return NextResponse.json(
        { error: 'Forbidden. Your @uottawa.ca account is not on the authorized faculty whitelist.' },
        { status: 403 }
      );
    }

    const payload = await req.json();
    const { title, body, targetChannel, rolePing, accentColor, bannerUrl, senderName } = payload;

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and content are required.' },
        { status: 400 }
      );
    }

    // Determine Webhook URL from environment variables based on channel
    let webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    // If webhook is not configured yet, simulate successful test mode
    if (!webhookUrl) {
      console.log('⚠️ [TEST MODE] No DISCORD_WEBHOOK_URL configured in .env. Simulating delivery:');
      console.log(`👤 Verified Sender: ${session.email}`);
      console.log(JSON.stringify(payload, null, 2));

      return NextResponse.json({
        success: true,
        testMode: true,
        message: 'Simulated dispatch successful! (Add DISCORD_WEBHOOK_URL in .env for live Discord delivery)',
        dispatchedAt: new Date().toISOString(),
        sender: session.email,
      });
    }

    // Convert HEX color to Discord Decimal
    const cleanHex = (accentColor || '#8F001A').replace('#', '');
    const decimalColor = parseInt(cleanHex, 16) || 0x8f001a;

    // Validate and format optional banner URL
    const isValidBanner = bannerUrl && (bannerUrl.startsWith('http://') || bannerUrl.startsWith('https://'));

    // Build Discord REST Webhook Payload
    const discordPayload: any = {
      username: senderName || process.env.NEXT_PUBLIC_SENDER_NAME || 'uOttawa Faculty Desk',
      content: rolePing && rolePing !== 'none' ? rolePing : undefined,
      embeds: [
        {
          title: title,
          description: body,
          color: decimalColor,
          image: isValidBanner ? { url: bannerUrl } : undefined,
          footer: {
            text: `uOttawa MIAI Community Bridge • Authorized by ${session.email}`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    // Execute HTTP POST to Discord Webhook
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error('Discord API Error:', errorText);
      return NextResponse.json(
        { error: `Discord Webhook Error: ${discordResponse.statusText}` },
        { status: discordResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      dispatchedAt: new Date().toISOString(),
      channel: targetChannel,
      sender: session.email,
    });
  } catch (error: any) {
    console.error('SyncBridge API Handler Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
