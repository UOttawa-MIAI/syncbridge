export interface SendOtpResult {
  success: boolean;
  simulated?: boolean;
  simulatedCode?: string;
  error?: string;
}

/**
 * Sends a 6-digit login OTP code to the recipient's uOttawa email address.
 * Calls Resend REST API via Edge-native fetch() or logs to terminal in Simulation Mode.
 */
export async function sendOtpEmail(email: string, otpCode: string): Promise<SendOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'uOttawa MIAI SyncBridge <auth@orbitalassets.net>';

  // Simulation Mode (when no API key is provided)
  if (!apiKey || apiKey.trim() === '') {
    console.log('\n=======================================================');
    console.log('🔑 [SyncBridge AUTH SIMULATOR]');
    console.log(`📩 Recipient: ${cleanEmail}`);
    console.log(`🔐 6-Digit Verification Code: [ ${otpCode} ]`);
    console.log('⏰ Valid for 10 minutes');
    console.log('💡 (To send live emails, set RESEND_API_KEY in .env)');
    console.log('=======================================================\n');

    return {
      success: true,
      simulated: true,
      simulatedCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    };
  }

  // Live Email Dispatch via Resend REST API (Edge-native, zero node-only dependencies)
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SyncBridge Login Code</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color:#8F001A;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">
                🌉 SyncBridge Admin Portal
              </h1>
              <p style="margin:4px 0 0 0;color:#fecdd3;font-size:13px;">
                uOttawa Master of Interdisciplinary AI Community
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:24px;color:#cbd5e1;">
                Hello,
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:24px;color:#cbd5e1;">
                You requested a secure login code to access the <strong>SyncBridge Faculty Announcement Gateway</strong>.
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color:#0f172a;border:1px solid #475569;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px 0;">
                <span style="display:block;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px;">
                  Your 6-Digit Verification Code
                </span>
                <span style="display:inline-block;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#ffffff;padding-left:8px;">
                  ${otpCode}
                </span>
                <span style="display:block;font-size:12px;color:#f43f5e;margin-top:8px;">
                  ⏱️ Expires in 10 minutes
                </span>
              </div>

              <p style="margin:0 0 8px 0;font-size:13px;line-height:20px;color:#94a3b8;">
                If you did not request this code, you can safely ignore this email. No access will be granted without entering this code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background-color:#0f172a;border-top:1px solid #334155;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748b;">
                University of Ottawa MIAI Community • Automated Security System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: cleanEmail,
        subject: `uOttawa MIAI SyncBridge Code: ${otpCode}`,
        html: htmlContent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend API Error:', data);
      return { success: false, error: data?.message || 'Failed to dispatch email' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Email Dispatch Exception:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
}
