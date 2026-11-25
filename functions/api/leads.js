import { json, schema, ip, sha256, now, CODE_RE } from '../_shared.js';
// Public lead intake ("Request details"). Stores the request server-side; CRM delivery status is tracked truthfully.
export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'server_not_configured' }, 503);
  if (request.headers.get('x-alaia') !== '1') return json({ error: 'bad_request' }, 400);
  if (!(request.headers.get('content-type') || '').includes('application/json')) return json({ error: 'bad_request' }, 415);
  const raw = await request.text(); if (raw.length > 2000) return json({ error: 'too_large' }, 413);
  let b; try { b = JSON.parse(raw); } catch (e) { return json({ error: 'bad_json' }, 400); }
  if (!b || typeof b !== 'object') return json({ error: 'bad_json' }, 400);
  if (b.website) return json({ ok: true, id: 'L0', status: 'received' }); // honeypot field: bots fill it
  if (!CODE_RE.test(b.unitCode || '')) return json({ error: 'invalid_unit' }, 400);
  await schema(env.DB);
  const iph = (await sha256((env.STAFF_PIN_SALT || 'alaia') + ip(request))).slice(0, 32);
  const t = now();
  const rec = await env.DB.prepare('SELECT COUNT(*) n FROM leads WHERE ip_h = ? AND ts > ?').bind(iph, t - 600).first();
  if (rec.n >= 12) return json({ error: 'rate_limited' }, 429, { 'retry-after': '600' });
  const cid = typeof b.clientId === 'string' && /^[A-Za-z0-9]{6,40}$/.test(b.clientId) ? b.clientId : null;
  const id = cid ? 'L' + cid : 'L' + t.toString(36) + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  // duplicate prevention: same client id (retry) or same device+unit within 5 minutes
  const dup = await env.DB.prepare('SELECT id, crm_status FROM leads WHERE id = ? OR (ip_h = ? AND unit = ? AND ts > ?) LIMIT 1').bind(id, iph, b.unitCode, t - 300).first();
  if (dup) return json({ ok: true, id: dup.id, status: 'received', crm: dup.crm_status, duplicate: true });
  const crm = env.ENJAZ_ENDPOINT ? 'pending' : 'not_configured';
  await env.DB.prepare('INSERT INTO leads (id, unit, tower, floor, area, lang, mode, client_ts, ts, ip_h, crm_status, test) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id, b.unitCode, String(b.tower || '').slice(0, 4), Number.isFinite(+b.floor) ? +b.floor : null, Number.isFinite(+b.area) ? +b.area : null,
      b.language === 'ar' ? 'ar' : 'en', b.mode === 'sales' ? 'sales' : 'self-serve', String(b.timestamp || '').slice(0, 40), t, iph, crm, b.test ? 1 : 0).run();
  // TODO(Enjaz): deliver to the CRM here once endpoint, auth and field mapping are supplied; then set crm_status delivered/failed.
  return json({ ok: true, id, status: 'received', crm });
}
export const onRequest = () => json({ error: 'method' }, 405);
