import { json, ip, pbkdf2, safeEq, schema, csrfOk, failCounts, recordFail, newSession, setCookie } from '../../_shared.js';
// Staff PIN login. PIN is verified server-side against a PBKDF2 hash held in Pages secrets.
export async function onRequestPost({ request, env }) {
  if (!env.DB || !env.STAFF_PIN_HASH || !env.STAFF_PIN_SALT) return json({ error: 'server_not_configured' }, 503);
  if (!csrfOk(request)) return json({ error: 'csrf' }, 403);
  await schema(env.DB);
  const who = ip(request);
  const fc = await failCounts(env.DB, who);
  if (fc.locked) return json({ error: 'locked', retryAfter: fc.retryAfter }, 429, { 'retry-after': String(fc.retryAfter) });
  let body = null; try { body = await request.json(); } catch (e) {}
  const pin = body && typeof body.pin === 'string' ? body.pin : '';
  if (!/^\d{6,10}$/.test(pin)) { await recordFail(env.DB, who); return json({ error: 'invalid' }, 401); }
  const h = await pbkdf2(pin, env.STAFF_PIN_SALT);
  if (!safeEq(h, env.STAFF_PIN_HASH)) { await recordFail(env.DB, who); return json({ error: 'invalid' }, 401); }
  const s = await newSession(env.DB);
  return json({ ok: true, expiresIn: s.maxAge }, 200, { 'set-cookie': setCookie(s.raw, s.maxAge) });
}
export const onRequest = () => json({ error: 'method' }, 405);
