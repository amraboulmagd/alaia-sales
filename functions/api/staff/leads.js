import { json, requireStaff } from '../../_shared.js';
export async function onRequestGet(ctx) {
  const a = await requireStaff(ctx); if (a.res) return a.res;
  const r = await ctx.env.DB.prepare('SELECT id, unit, tower, floor, area, lang, mode, ts, crm_status, test FROM leads ORDER BY ts DESC LIMIT 500').all();
  return json({ leads: r.results, crm: ctx.env.ENJAZ_ENDPOINT ? 'configured' : 'not_configured' }, 200, { 'set-cookie': a.cookie });
}
