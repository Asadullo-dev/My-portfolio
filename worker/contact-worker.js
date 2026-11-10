// Cloudflare Worker: receives the portfolio contact form and forwards it to Telegram.
// Secrets (never put these in the frontend):
//   TELEGRAM_BOT_TOKEN  - token from @BotFather
//   TELEGRAM_CHAT_ID    - your chat id (or channel id)
// Vars (wrangler.toml):
//   ALLOWED_ORIGIN      - e.g. https://<username>.github.io

const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN;
    const cors = corsHeaders(allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method_not_allowed' }, 405, cors);
    }
    if (origin !== allowed) {
      return json({ ok: false, error: 'forbidden_origin' }, 403, cors);
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      return json({ ok: false, error: 'bad_request' }, 400, cors);
    }

    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const message = String(form.get('message') || '').trim();

    if (name.length < 2 || name.length > MAX_NAME) {
      return json({ ok: false, error: 'invalid_name' }, 422, cors);
    }
    if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL) {
      return json({ ok: false, error: 'invalid_email' }, 422, cors);
    }
    if (message.length < 10 || message.length > MAX_MESSAGE) {
      return json({ ok: false, error: 'invalid_message' }, 422, cors);
    }

    // Plain text (no parse_mode) so user input cannot break Telegram formatting.
    const text = [
      'Yangi xabar (portfolio)',
      '',
      `Ism: ${name}`,
      `Email: ${email}`,
      '',
      message
    ].join('\n');

    const tg = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: text.slice(0, 4096),
          disable_web_page_preview: true
        })
      }
    );

    if (!tg.ok) {
      return json({ ok: false, error: 'telegram_failed' }, 502, cors);
    }
    return json({ ok: true }, 200, cors);
  }
};
