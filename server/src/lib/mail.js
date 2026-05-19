// Transactional email via Resend (https://resend.com).
//
// When RESEND_API_KEY is not configured (local dev), mail is logged instead of
// sent, so the form flow works end-to-end without an account.

const RESEND_API = 'https://api.resend.com/emails';

const apiKey = process.env.RESEND_API_KEY ?? '';
export const MAIL_FROM = process.env.MAIL_FROM ?? 'Signi <noreply@signi.com>';
export const SALES_INBOX = process.env.SALES_INBOX ?? 'sales@signi.com';

export const mailEnabled = Boolean(apiKey);

// Sends one email. Resolves to { ok, id? , error? }. Never throws — a mail
// failure must not break the form submission that triggered it.
export async function sendMail({ to, subject, html, replyTo }) {
  if (!apiKey) {
    console.log(`[mail] (not sent — no RESEND_API_KEY) to=${to} subject="${subject}"`);
    return { ok: true, skipped: true };
  }
  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error(`[mail] Resend ${res.status}: ${detail}`);
      return { ok: false, error: `Resend ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, id: data.id };
  } catch (err) {
    console.error('[mail] send failed:', err.message);
    return { ok: false, error: err.message };
  }
}
