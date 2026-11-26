// Site-wide: keep internal docs/tests off the public site, add security headers, and serve HTTP Range
// requests for video (Cloudflare Pages static assets answer Range with a full 200, which breaks seeking).
const BLOCK = /^\/(docs|functions|qa|tests)(\/|$)|\.(md|py|sh)$/i;
const MEDIA = /\.(mp4|m4v|webm|mp3)$/i;

function sliceStream(body, start, end) {
  // stream bytes [start, end] (inclusive) out of a full-body stream without buffering it all
  let pos = 0; const reader = body.getReader();
  return new ReadableStream({
    async pull(ctrl) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { ctrl.close(); return; }
        const a = pos, b = pos + value.length; pos = b;
        if (b <= start) continue;
        const from = Math.max(0, start - a), to = Math.min(value.length, end + 1 - a);
        if (to > from) ctrl.enqueue(value.subarray(from, to));
        if (pos > end) { ctrl.close(); reader.cancel().catch(() => {}); return; }
        return;
      }
    },
    cancel() { reader.cancel().catch(() => {}); }
  });
}

export async function onRequest({ request, next }) {
  const u = new URL(request.url);
  if (BLOCK.test(u.pathname)) return new Response('Not found', { status: 404 });
  const range = request.headers.get('range');
  const isMedia = MEDIA.test(u.pathname) && (request.method === 'GET' || request.method === 'HEAD');
  const res = await next(isMedia && range ? new Request(request.url, { method: request.method, headers: { accept: request.headers.get('accept') || '*/*' } }) : undefined);
  let r; let whole = null;
  if (isMedia && range && res.status === 200) {
    let total = +res.headers.get('content-length');
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!total && m) { whole = new Uint8Array(await res.arrayBuffer()); total = whole.byteLength; } // no length header (e.g. local dev): buffer once
    if (total && m && (m[1] !== '' || m[2] !== '')) {
      let start, end;
      if (m[1] === '') { start = Math.max(0, total - +m[2]); end = total - 1; }
      else { start = +m[1]; end = m[2] === '' ? total - 1 : Math.min(+m[2], total - 1); }
      if (start >= total || start > end) {
        r = new Response(null, { status: 416, headers: { 'content-range': `bytes */${total}` } });
      } else {
        const h = new Headers(res.headers);
        h.set('content-range', `bytes ${start}-${end}/${total}`); h.set('content-length', String(end - start + 1)); h.set('accept-ranges', 'bytes');
        r = new Response(request.method === 'HEAD' ? null : (whole ? whole.slice(start, end + 1) : sliceStream(res.body, start, end)), { status: 206, headers: h });
      }
    }
  }
  if (!r) r = whole ? new Response(whole, res) : new Response(res.body, res);
  if (isMedia) { r.headers.set('accept-ranges', 'bytes'); if (!r.headers.has('cache-control') || /max-age=0/.test(r.headers.get('cache-control'))) r.headers.set('cache-control', 'public, max-age=86400'); }
  r.headers.set('x-content-type-options', 'nosniff');
  r.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  r.headers.set('x-frame-options', 'SAMEORIGIN');
  r.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  return r;
}
