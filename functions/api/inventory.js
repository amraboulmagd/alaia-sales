import { json, schema } from '../_shared.js';
// Public: availability only (no staff notes). Server is the single source of truth for status overrides.
export async function onRequestGet({ env }) {
  if (!env.DB) return json({ units: {}, source: 'none' });
  await schema(env.DB);
  const r = await env.DB.prepare('SELECT code, st FROM unit_status').all();
  const units = {}; for (const x of r.results) units[x.code] = x.st;
  return json({ units, source: 'server' });
}
