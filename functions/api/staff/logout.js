import { json, schema, csrfOk, sha256, cookieOf, COOKIE, setCookie } from '../../_shared.js';
export async function onRequestPost({ request, env }) {
  if (!csrfOk(request)) return json({ error: 'csrf' }, 403);
  if (env.DB) {
    await schema(env.DB);
    const raw = cookieOf(request, COOKIE);
    if (raw) await env.DB.prepare('DELETE FROM sessions WHERE h = ?').bind(await sha256(raw)).run();
  }
  return json({ ok: true }, 200, { 'set-cookie': setCookie('', 0) });
}
export const onRequest = () => json({ error: 'method' }, 405);
