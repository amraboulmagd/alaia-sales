import { json, requireStaff, now, STATUSES, CODE_RE } from '../../_shared.js';
// Staff read: statuses with private notes. Staff write: set status (and note) for one or many units.
export async function onRequestGet(ctx) {
  const a = await requireStaff(ctx); if (a.res) return a.res;
  const r = await ctx.env.DB.prepare('SELECT code, st, note, at FROM unit_status').all();
  return json({ units: r.results }, 200, { 'set-cookie': a.cookie });
}
export async function onRequestPost(ctx) {
  const a = await requireStaff(ctx); if (a.res) return a.res;
  let b = null; try { b = await ctx.request.json(); } catch (e) {}
  const items = Array.isArray(b && b.items) ? b.items : (b ? [b] : []);
  if (!items.length || items.length > 500) return json({ error: 'invalid' }, 400);
  const st = [];
  for (const it of items) {
    if (!it || !CODE_RE.test(it.code || '') || !STATUSES.includes(it.st)) return json({ error: 'invalid', code: it && it.code }, 400);
    const note = typeof it.note === 'string' ? it.note.slice(0, 300) : '';
    st.push(ctx.env.DB.prepare('INSERT INTO unit_status (code, st, note, at) VALUES (?, ?, ?, ?) ON CONFLICT(code) DO UPDATE SET st=excluded.st, note=excluded.note, at=excluded.at').bind(it.code, it.st, note, now()));
  }
  await ctx.env.DB.batch(st);
  return json({ ok: true, n: st.length }, 200, { 'set-cookie': a.cookie });
}
