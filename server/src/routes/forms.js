import { db } from '../db/index.js';
import { rateLimit } from '../lib/rate-limit.js';
import { sendMail, SALES_INBOX } from '../lib/mail.js';

// Public form intake. Stores the submission and emails the sales inbox plus an
// autoresponder to the visitor, then redirects to the thank-you page so GTM
// conversion tracking fires there.

const THANK_YOU = { cs: '/dekujeme/', en: '/en/thank-you/' };
const HONEYPOT = 'website'; // bots fill hidden fields; humans never see this one
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET ?? '';

// Fields shown to the visitor, in display order.
const FIELDS = [
  ['name', 'Jméno'],
  ['email', 'E-mail'],
  ['phone', 'Telefon'],
  ['company', 'Firma'],
  ['message', 'Zpráva'],
];

const isEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v ?? ''));

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET) return true; // not configured — skip
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token ?? '', remoteip: ip }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

const insertSubmission = db.prepare(
  "INSERT INTO submissions (form_type, payload, status) VALUES (?, ?, 'new')",
);

function notificationEmail(formType, fields) {
  const rows = FIELDS.filter(([key]) => fields[key])
    .map(
      ([key, label]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6f6b82">${label}</td>` +
        `<td style="padding:4px 0"><strong>${escapeHtml(fields[key])}</strong></td></tr>`,
    )
    .join('');
  return `<div style="font-family:Arial,sans-serif;color:#1c1230">
    <h2>Nová poptávka ze signi.com</h2>
    <p>Typ formuláře: <strong>${escapeHtml(formType)}</strong></p>
    <table>${rows}</table>
  </div>`;
}

function autoresponderEmail(name) {
  return `<div style="font-family:Arial,sans-serif;color:#1c1230">
    <h2>Děkujeme za vaši zprávu</h2>
    <p>Dobrý den${name ? ` ${escapeHtml(name)}` : ''},</p>
    <p>vaši poptávku jsme přijali. Ozve se vám náš specialista, obvykle do
       následujícího pracovního dne.</p>
    <p>Tým Signi</p>
  </div>`;
}

export default async function formRoutes(app) {
  app.post('/api/forms', async (request, reply) => {
    const body = request.body ?? {};
    const lang = body.lang === 'en' ? 'en' : 'cs';
    const formType = String(body.form_type ?? 'contact').slice(0, 40);
    const thankYou = `${THANK_YOU[lang]}?form=${encodeURIComponent(formType)}`;

    // Honeypot — a filled hidden field means a bot. Pretend success, store nothing.
    if (body[HONEYPOT]) return reply.redirect(thankYou, 303);

    const ip = request.ip;
    if (!rateLimit(`form:${ip}`, { max: 5, windowMs: 10 * 60 * 1000 })) {
      return reply.code(429).type('text/html').send(
        '<p>Příliš mnoho odeslání. Zkuste to prosím za chvíli.</p>',
      );
    }

    if (!(await verifyTurnstile(body['cf-turnstile-response'], ip))) {
      return reply.code(400).type('text/html').send(
        '<p>Ověření proti spamu selhalo. Vraťte se zpět a zkuste to znovu.</p>',
      );
    }

    const fields = {};
    for (const [key] of FIELDS) {
      const v = String(body[key] ?? '').trim();
      if (v) fields[key] = v.slice(0, 2000);
    }
    if (!fields.name || !isEmail(fields.email)) {
      return reply.code(400).type('text/html').send(
        '<p>Vyplňte prosím jméno a platný e-mail. Vraťte se zpět a zkuste to znovu.</p>',
      );
    }

    insertSubmission.run(formType, JSON.stringify({ ...fields, lang }));

    // Email is best-effort — a delivery failure must not lose the lead, which
    // is already stored above.
    await Promise.allSettled([
      sendMail({
        to: SALES_INBOX,
        subject: `Nová poptávka ze signi.com (${formType})`,
        html: notificationEmail(formType, fields),
        replyTo: fields.email,
      }),
      sendMail({
        to: fields.email,
        subject: 'Děkujeme za vaši zprávu — Signi',
        html: autoresponderEmail(fields.name),
      }),
    ]);

    return reply.redirect(thankYou, 303);
  });
}
