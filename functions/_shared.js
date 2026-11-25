// ALAIA server helpers (Cloudflare Pages Functions). No route: this module exports no onRequest handler.
// Secrets (Pages env, never in source): STAFF_PIN_HASH, STAFF_PIN_SALT. Binding: DB (D1).

export const COOKIE = 'alaia_staff';
const IDLE_S = 600;            // staff idle timeout (10 min), matches kiosk sales-mode idle
const ABS_S = 12 * 3600;       // absolute session lifetime
const FAIL_WINDOW_S = 900;     // 15 min
const FAIL_PER_IP = 5;         // failed PINs per IP per window
const FAIL_GLOBAL = 25;        // failed PINs across all IPs per window (blocks distributed guessing)

const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
export const now = () => Math.floor(Date.now() / 1000);

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}
export const ip = req => req.headers.get('cf-connecting-ip') || 'local';
export async function sha256(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
export async function pbkdf2(pin, saltHex) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256));
}
export function safeEq(a, b) { if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

let schemaReady = false;
export async function schema(db) {
  if (schemaReady) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS sessions (h TEXT PRIMARY KEY, created INTEGER NOT NULL, seen INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS login_fail (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT NOT NULL, ts INTEGER NOT NULL)'),
    db.prepare('CREATE INDEX IF NOT EXISTS login_fail_ts ON login_fail(ts)'),
    db.prepare('CREATE TABLE IF NOT EXISTS unit_status (code TEXT PRIMARY KEY, st TEXT NOT NULL, note TEXT NOT NULL DEFAULT \'\', at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, unit TEXT NOT NULL, tower TEXT, floor INTEGER, area REAL, lang TEXT, mode TEXT, client_ts TEXT, ts INTEGER NOT NULL, ip_h TEXT NOT NULL, crm_status TEXT NOT NULL, crm_attempts INTEGER NOT NULL DEFAULT 0, test INTEGER NOT NULL DEFAULT 0)'),
    db.prepare('CREATE INDEX IF NOT EXISTS leads_ts ON leads(ts)'),
  ]);
  schemaReady = true;
}

export function cookieOf(req, name) {
  const c = req.headers.get('cookie') || ''; const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}
export function setCookie(val, maxAge) {
  return `${COOKIE}=${val}; Path=/api/staff; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

// Origin + custom header check for state-changing requests (CSRF). SameSite=Strict is the first line.
export function csrfOk(req) {
  if (req.headers.get('x-alaia') !== '1') return false;
  const o = req.headers.get('origin'); if (!o) return true; // same-origin fetch from older engines may omit it
  try { return new URL(o).host === new URL(req.url).host; } catch (e) { return false; }
}

export async function failCounts(db, who) {
  const since = now() - FAIL_WINDOW_S;
  await db.prepare('DELETE FROM login_fail WHERE ts < ?').bind(since - 86400).run();
  const r1 = await db.prepare('SELECT COUNT(*) n FROM login_fail WHERE ip = ? AND ts >= ?').bind(who, since).first();
  const r2 = await db.prepare('SELECT COUNT(*) n FROM login_fail WHERE ts >= ?').bind(since).first();
  return { ip: r1.n, all: r2.n, locked: r1.n >= FAIL_PER_IP || r2.n >= FAIL_GLOBAL, retryAfter: FAIL_WINDOW_S };
}
export const recordFail = (db, who) => db.prepare('INSERT INTO login_fail (ip, ts) VALUES (?, ?)').bind(who, now()).run();

export async function newSession(db) {
  const raw = hex(crypto.getRandomValues(new Uint8Array(32)));
  const t = now();
  await db.prepare('DELETE FROM sessions WHERE seen < ? OR created < ?').bind(t - IDLE_S, t - ABS_S).run();
  await db.prepare('INSERT INTO sessions (h, created, seen) VALUES (?, ?, ?)').bind(await sha256(raw), t, t).run();
  return { raw, maxAge: IDLE_S };
}
// Returns session hash when valid (and slides the idle window), else null.
export async function checkSession(db, req, slide = true) {
  const raw = cookieOf(req, COOKIE); if (!raw || !/^[0-9a-f]{64}$/.test(raw)) return null;
  const h = await sha256(raw); const t = now();
  const s = await db.prepare('SELECT created, seen FROM sessions WHERE h = ?').bind(h).first();
  if (!s) return null;
  if (s.seen < t - IDLE_S || s.created < t - ABS_S) { await db.prepare('DELETE FROM sessions WHERE h = ?').bind(h).run(); return null; }
  if (slide) await db.prepare('UPDATE sessions SET seen = ? WHERE h = ?').bind(t, h).run();
  return { h, raw, expiresIn: slide ? IDLE_S : IDLE_S - (t - s.seen) };
}
export async function requireStaff(ctx) {
  const { request, env } = ctx;
  if (!env.DB) return { res: json({ error: 'server_not_configured' }, 503) };
  await schema(env.DB);
  if (request.method !== 'GET' && !csrfOk(request)) return { res: json({ error: 'csrf' }, 403) };
  const peek = new URL(request.url).searchParams.has('peek');
  const s = await checkSession(env.DB, request, !peek);
  if (!s) return { res: json({ error: 'unauthorized' }, 401, { 'set-cookie': setCookie('', 0) }) };
  return { s, cookie: setCookie(s.raw, Math.max(1, s.expiresIn)) };
}

export const STATUSES = ['available', 'reserved', 'sold', 'blocked'];
export const CODE_RE = /^T(0[1-9]|1[0-3])-[A-Z]-(G|[1-9])\d{2}$/;
