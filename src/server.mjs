import { createServer as httpServer } from 'node:http';
import { timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
function same(a, b) { const x = Buffer.from(a || ''), y = Buffer.from(b || ''); return x.length === y.length && timingSafeEqual(x, y); }
function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]); }
function readBody(req, max = 8192) { return new Promise((resolveBody, reject) => { let size = 0; const chunks = []; req.on('data', chunk => { size += chunk.length; if (size > max) { reject(new Error('Request too large.')); req.destroy(); return; } chunks.push(chunk); }); req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8'))); req.on('error', reject); }); }
function form(body) { const params = new URLSearchParams(body); return Object.fromEntries(params.entries()); }
function page(title, body) { return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(title)} · DROPi Home</title><link rel="stylesheet" href="/styles.css"></head><body><main class="shell" style="max-width:760px;margin:3rem auto;padding:1rem"><h1>${escapeHTML(title)}</h1>${body}</main></body></html>`; }
function loginForm({ setup = false, error = '' } = {}) { return page(setup ? 'Create super-admin account' : 'Admin sign in', `${error ? `<p role="alert"><strong>${escapeHTML(error)}</strong></p>` : ''}<p>${setup ? 'Create the first administrator account. Your password is sent directly to the authentication service and is never committed to GitHub.' : 'Sign in to the private administration area.'}</p><form method="post" action="${setup ? '/admin/setup' : '/admin/login'}"><label>${setup ? 'Display name' : 'Email'}<br><input name="${setup ? 'name' : 'email'}" ${setup ? '' : 'type="email"'} required autocomplete="${setup ? 'name' : 'username'}"></label>${setup ? '<br><br><label>Email<br><input name="email" type="email" required autocomplete="username"></label>' : ''}<br><br><label>Password<br><input name="password" type="password" minlength="12" maxlength="128" required autocomplete="${setup ? 'new-password' : 'current-password'}"></label><br><br><button type="submit">${setup ? 'Create super-admin' : 'Sign in'}</button></form>`); }
function copySetCookies(upstream, res) { const values = typeof upstream.headers.getSetCookie === 'function' ? upstream.headers.getSetCookie() : []; if (values.length) res.setHeader('Set-Cookie', values); else { const cookie = upstream.headers.get('set-cookie'); if (cookie) res.setHeader('Set-Cookie', cookie); } }
function hasSuperAdminRole(user) { const raw = user?.role ?? user?.roles ?? []; const roles = Array.isArray(raw) ? raw : String(raw).split(','); return roles.map(x => String(x).trim().toLowerCase()).includes('super_admin'); }

export function createApp({ root = resolve(process.cwd(), 'dist'), host = '127.0.0.1', token = process.env.PREVIEW_ACCESS_CODE, now = () => new Date(), authBase = process.env.NEON_AUTH_BASE_URL, bootstrap = process.env.ADMIN_BOOTSTRAP_MODE === 'true', fetchImpl = fetch } = {}) {
  const base = realpathSync(root); const meta = JSON.parse(readFileSync(resolve(base, '.build-meta.json'), 'utf8'));
  if (meta.schemaVersion !== 1 || !['public', 'preview'].includes(meta.mode) || !Number.isFinite(Date.parse(meta.expiresAt))) throw new Error('Invalid build metadata. Rebuild before serving.');
  if (meta.mode === 'preview' && !['127.0.0.1', '::1', 'localhost'].includes(host) && (!token || token.length < 32)) throw new Error('Non-loopback preview hosting requires PREVIEW_ACCESS_CODE with at least 32 characters. Noindex is not access control.');
  if (token && token.length < 32) throw new Error('PREVIEW_ACCESS_CODE must have at least 32 characters.');
  if ((bootstrap || process.env.ADMIN_AUTH_REQUIRED === 'true') && !authBase) throw new Error('NEON_AUTH_BASE_URL is required for admin authentication.');
  const assets = new Map();
  for (const [route, file] of Object.entries(meta.routes)) {
    const absolute = realpathSync(resolve(base, file)); if (!absolute.startsWith(base + sep)) throw new Error('Build route escapes output directory.');
    const buffer = readFileSync(absolute); const digest = createHash('sha256').update(buffer).digest('hex');
    if (meta.hashes[file] !== digest) throw new Error('Build integrity check failed. Rebuild before serving.');
    assets.set(route, { buffer, contentType: mime[extname(file)] || 'application/octet-stream' });
  }
  const expected = token ? `Basic ${Buffer.from(`preview:${token}`).toString('base64')}` : null;
  async function auth(path, options = {}) { return fetchImpl(`${authBase}${path}`, { redirect: 'manual', ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } }); }
  async function session(req) { if (!authBase) return null; const upstream = await auth('/get-session', { method: 'GET', headers: { cookie: req.headers.cookie || '' } }); if (!upstream.ok) return null; const data = await upstream.json().catch(() => null); return data?.user ? data : data?.data?.user ? data.data : null; }

  return httpServer({ requestTimeout: 15000, headersTimeout: 10000, maxHeaderSize: 8192 }, async (req, res) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'); res.setHeader('Cache-Control', 'private, no-store');
    if (meta.mode === 'preview') res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    const send = (status, body, type = 'text/plain; charset=utf-8') => { const data = Buffer.isBuffer(body) ? body : Buffer.from(body); res.statusCode = status; res.setHeader('Content-Type', type); res.setHeader('Content-Length', data.length); res.end(req.method === 'HEAD' ? undefined : data); };
    if (meta.mode === 'public' && new Date(now()).getTime() >= Date.parse(meta.expiresAt)) return send(503, 'Public content is awaiting a source/evidence refresh.');
    let path; try { path = decodeURIComponent((req.url || '/').split('?')[0]); } catch { return send(400, 'Invalid path.'); }
    if (!path.startsWith('/') || /[\\\x00%]/.test(path) || path.split('/').some(x => x === '..' || x === '.')) return send(400, 'Invalid path.');
    if (path === '/healthz') return send(200, '{"status":"ok"}', 'application/json; charset=utf-8');
    if (meta.mode === 'preview' && expected && !same(req.headers.authorization, expected)) { res.setHeader('WWW-Authenticate', 'Basic realm="Private preview", charset="UTF-8"'); return send(401, 'Preview authentication required.'); }

    if (path === '/admin/setup' && req.method === 'GET') return bootstrap ? send(200, loginForm({ setup: true }), 'text/html; charset=utf-8') : send(404, 'Setup is closed.');
    if (path === '/admin/setup' && req.method === 'POST') {
      if (!bootstrap) return send(404, 'Setup is closed.');
      try {
        const input = form(await readBody(req));
        if (!input.name?.trim() || !/^\S+@\S+\.\S+$/.test(input.email || '') || String(input.password || '').length < 12) return send(400, loginForm({ setup: true, error: 'Use a valid name, email and a password of at least 12 characters.' }), 'text/html; charset=utf-8');
        const upstream = await auth('/sign-up/email', { method: 'POST', body: JSON.stringify({ name: input.name.trim(), email: input.email.trim().toLowerCase(), password: input.password }) });
        const payload = await upstream.json().catch(() => ({}));
        if (!upstream.ok) return send(400, loginForm({ setup: true, error: payload?.message || payload?.error?.message || 'Account creation failed.' }), 'text/html; charset=utf-8');
        copySetCookies(upstream, res); res.statusCode = 303; res.setHeader('Location', '/admin'); return res.end();
      } catch { return send(400, loginForm({ setup: true, error: 'Could not process the request.' }), 'text/html; charset=utf-8'); }
    }
    if (path === '/admin/login' && req.method === 'GET') return send(200, loginForm(), 'text/html; charset=utf-8');
    if (path === '/admin/login' && req.method === 'POST') {
      try {
        const input = form(await readBody(req));
        const upstream = await auth('/sign-in/email', { method: 'POST', body: JSON.stringify({ email: String(input.email || '').trim().toLowerCase(), password: String(input.password || ''), rememberMe: true }) });
        const payload = await upstream.json().catch(() => ({}));
        if (!upstream.ok) return send(401, loginForm({ error: payload?.message || payload?.error?.message || 'Invalid credentials.' }), 'text/html; charset=utf-8');
        copySetCookies(upstream, res); res.statusCode = 303; res.setHeader('Location', '/admin'); return res.end();
      } catch { return send(400, loginForm({ error: 'Could not process the request.' }), 'text/html; charset=utf-8'); }
    }
    if (path === '/admin/logout' && req.method === 'POST') {
      const upstream = await auth('/sign-out', { method: 'POST', headers: { cookie: req.headers.cookie || '' }, body: '{}' }).catch(() => null);
      if (upstream) copySetCookies(upstream, res); res.statusCode = 303; res.setHeader('Location', '/admin/login'); return res.end();
    }
    if (path === '/admin' && (req.method === 'GET' || req.method === 'HEAD')) {
      const current = await session(req).catch(() => null);
      if (!current?.user) { res.statusCode = 303; res.setHeader('Location', '/admin/login'); return res.end(); }
      if (!bootstrap && !hasSuperAdminRole(current.user)) return send(403, page('Access denied', '<p>This account is authenticated but does not have the SUPER_ADMIN role.</p>'), 'text/html; charset=utf-8');
      const body = `<p><strong>Signed in:</strong> ${escapeHTML(current.user.email || current.user.name || 'administrator')}</p><p><strong>Role:</strong> ${bootstrap ? 'SUPER_ADMIN bootstrap pending promotion' : 'SUPER_ADMIN'}</p><p>The authentication layer is active. Product/catalogue management will be added next.</p><form method="post" action="/admin/logout"><button type="submit">Sign out</button></form>`;
      return send(200, page('Admin', body), 'text/html; charset=utf-8');
    }

    if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return send(405, 'Method not allowed.'); }
    if (!assets.has(path) && assets.has(path + '/')) { res.setHeader('Location', path + '/'); return send(308, 'Use canonical page path.'); }
    const asset = assets.get(path); if (!asset) { const missing = assets.get('/404/'); return send(404, missing.buffer, missing.contentType); }
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
