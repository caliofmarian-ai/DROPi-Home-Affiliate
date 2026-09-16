import { createServer as httpServer } from 'node:http';
import { timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
function same(a, b) { const x = Buffer.from(a || ''), y = Buffer.from(b || ''); return x.length === y.length && timingSafeEqual(x, y); }
export function createApp({ root = resolve(process.cwd(), 'dist'), host = '127.0.0.1', token = process.env.PREVIEW_TOKEN, now = () => new Date() } = {}) {
  const base = realpathSync(root); const meta = JSON.parse(readFileSync(resolve(base, '.build-meta.json'), 'utf8'));
  if (meta.schemaVersion !== 1 || !['public', 'preview'].includes(meta.mode) || !Number.isFinite(Date.parse(meta.expiresAt))) throw new Error('Invalid build metadata. Rebuild before serving.');
  if (meta.mode === 'preview' && !['127.0.0.1', '::1', 'localhost'].includes(host) && (!token || token.length < 32)) throw new Error('Non-loopback preview hosting requires PREVIEW_TOKEN with at least 32 characters. Noindex is not access control.');
  if (token && token.length < 32) throw new Error('PREVIEW_TOKEN must have at least 32 characters.');
  const assets = new Map();
  for (const [route, file] of Object.entries(meta.routes)) {
    const absolute = realpathSync(resolve(base, file)); if (!absolute.startsWith(base + sep)) throw new Error('Build route escapes output directory.');
    const buffer = readFileSync(absolute); const digest = createHash('sha256').update(buffer).digest('hex');
    if (meta.hashes[file] !== digest) throw new Error('Build integrity check failed. Rebuild before serving.');
    assets.set(route, { buffer, contentType: mime[extname(file)] || 'application/octet-stream' });
  }
  const expected = token ? `Basic ${Buffer.from(`preview:${token}`).toString('base64')}` : null;
  return httpServer({ requestTimeout: 15000, headersTimeout: 10000, maxHeaderSize: 8192 }, (req, res) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'); res.setHeader('Cache-Control', 'private, no-store');
    if (meta.mode === 'preview') res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    const send = (status, body, type = 'text/plain; charset=utf-8') => { const data = Buffer.isBuffer(body) ? body : Buffer.from(body); res.statusCode = status; res.setHeader('Content-Type', type); res.setHeader('Content-Length', data.length); res.end(req.method === 'HEAD' ? undefined : data); };
    if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return send(405, 'Method not allowed.'); }
    if (meta.mode === 'public' && new Date(now()).getTime() >= Date.parse(meta.expiresAt)) return send(503, 'Public content is awaiting a source/evidence refresh.');
    let path;
    try { path = decodeURIComponent((req.url || '/').split('?')[0]); } catch { return send(400, 'Invalid path.'); }
    if (!path.startsWith('/') || /[\\\x00%]/.test(path) || path.split('/').some(x => x === '..' || x === '.')) return send(400, 'Invalid path.');
    if (path === '/healthz') return send(200, '{"status":"ok"}', 'application/json; charset=utf-8');
    if (meta.mode === 'preview' && expected && !same(req.headers.authorization, expected)) { res.setHeader('WWW-Authenticate', 'Basic realm="Private preview", charset="UTF-8"'); return send(401, 'Preview authentication required.'); }
    if (!assets.has(path) && assets.has(path + '/')) { res.setHeader('Location', path + '/'); return send(308, 'Use canonical page path.'); }
    const asset = assets.get(path);
    if (!asset) { const missing = assets.get('/404/'); return send(404, missing.buffer, missing.contentType); }
    send(200, asset.buffer, asset.contentType);
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const host = process.env.HOST || '127.0.0.1'; const port = Number(process.env.PORT || 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
    const app = createApp({ host });
    app.listen(port, host, () => console.log(`DROPi Home server listening on ${host}:${port}.`));
    app.on('error', err => { console.error(`Server error: ${err.code || 'UNKNOWN'}`); process.exitCode = 1; });
    const close = () => { app.close(() => process.exit(0)); setTimeout(() => process.exit(1), 5000).unref(); };
    process.on('SIGINT', close); process.on('SIGTERM', close);
  } catch (err) { console.error(err.message); process.exitCode = 1; }
}
