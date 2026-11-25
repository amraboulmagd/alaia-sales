// Site-wide: keep internal docs/tests off the public site and add baseline security headers.
const BLOCK = /^\/(docs|functions|qa|tests)(\/|$)|\.(md|py|sh)$/i;
export async function onRequest({ request, next }) {
  const u = new URL(request.url);
  if (BLOCK.test(u.pathname)) return new Response('Not found', { status: 404 });
  const res = await next();
  const r = new Response(res.body, res);
  r.headers.set('x-content-type-options', 'nosniff');
  r.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  r.headers.set('x-frame-options', 'SAMEORIGIN');
  r.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  return r;
}
