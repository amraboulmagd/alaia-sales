import { json, requireStaff } from '../../_shared.js';
export async function onRequestGet(ctx) {
  const a = await requireStaff(ctx); if (a.res) return a.res;
  return json({ ok: true, expiresIn: a.s.expiresIn }, 200, { 'set-cookie': a.cookie });
}
