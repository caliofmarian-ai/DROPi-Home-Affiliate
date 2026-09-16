import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { once } from 'node:events';
import { request } from 'node:http';
import { build } from '../scripts/build.mjs';
import { createApp } from '../src/server.mjs';
import { loadProject } from '../src/project.mjs';
import { sha256 } from '../src/domain.mjs';
const fixed = new Date('2026-09-15T20:00:00Z');
function fixture() {
  const root = mkdtempSync(resolve(tmpdir(), 'dropi-home-test-'));
  for (const f of ['data', 'content', 'public']) cpSync(resolve(f), resolve(root, f), { recursive: true });
  mkdirSync(resolve(root, 'docs/evidence'), { recursive: true }); return root;
}
function approveSyntheticFixture(root) {
  const p = loadProject(root); const file = 'docs/evidence/synthetic.md';
  writeFileSync(resolve(root, file), 'SYNTHETIC TEST FIXTURE ONLY. Not a real owner, legal or commercial approval.');
  p.site.publication = { approved: true, approvedBy: 'Synthetic test only', approvedAt: '2026-09-15', evidenceFile: file }; p.site.privacyReview = { approved: true, approvedBy: 'Synthetic only', approvedAt: '2026-09-15', evidenceFile: file }; p.site.brandReview = { approved: true, approvedBy: 'Synthetic only', approvedAt: '2026-09-15', evidenceFile: file }; p.site.operator = { publicName: 'Synthetic test only', legalName: 'Synthetic test only', geographicAddress: '1 Fixture Street, Dublin, Ireland', contactEmail: 'fixture@example.org', phone: null, businessNameStatus: 'NOT_REQUIRED', businessNameEvidenceFile: null, taxReviewStatus: 'REVIEWED', taxReviewEvidenceFile: file, accessibilityScopeStatus: 'OUT_OF_SCOPE_REVIEWED', accessibilityScopeEvidenceFile: file };
  for (const g of p.guides) p.reviews[g.slug] = { status: 'APPROVED', reviewer: 'Synthetic test only', reviewedAt: '2026-09-15', sha256: sha256(g), evidenceFile: file };
  p.reviews.catalogue = { status: 'APPROVED', reviewer: 'Synthetic test only', reviewedAt: '2026-09-15', sha256: sha256(p.products), evidenceFile: file };
  writeFileSync(resolve(root, 'data/site.json'), JSON.stringify(p.site)); writeFileSync(resolve(root, 'data/reviews.json'), JSON.stringify(p.reviews));
}
async function listen(app) { app.listen(0, '127.0.0.1'); await once(app, 'listening'); return `http://127.0.0.1:${app.address().port}`; }
async function stop(app) { app.closeAllConnections(); await new Promise(resolve => app.close(resolve)); }
function raw(base, path, method = 'GET') { return new Promise((resolve, reject) => { const r = request(base, { path, method }, res => { const chunks = []; res.on('data', d => chunks.push(d)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() })); }); r.on('error', reject); r.end(); }); }
test('preview builds 19 pages with no private configuration or tracker', () => {
  const root = fixture(); try { const b = build({ root, env: {}, now: fixed }); assert.equal(b.pages, 19); assert.equal(b.guides, 10); assert.equal(b.products, 16); assert.ok(b.routes['/ops/']); assert.ok(b.commerce.publicReleaseBlockerCount > 0); assert.ok(b.commerce.publicReleaseBlockers.some(x => x.includes('accessibility'))); assert.equal(existsSync(resolve(root, 'dist/data/site.json')), false); const home = readFileSync(resolve(root, 'dist/index.html'), 'utf8'); assert.match(home, /noindex,nofollow/); assert.doesNotMatch(home, /posthog|gtag\(|tag=|awinaffid=/); assert.match(readFileSync(resolve(root, 'dist/robots.txt'), 'utf8'), /Disallow: \//); } finally { rmSync(root, { recursive: true }); }
});
test('public build is blocked until approvals exist', () => { const root = fixture(); try { assert.throws(() => build({ root, env: { RELEASE_MODE: 'public', SITE_ORIGIN: 'https://fixture.example.org' }, now: fixed }), /Build blocked/); } finally { rmSync(root, { recursive: true }); } });
test('fully synthetic approved public build excludes owner workspace and includes sitemap', () => { const root = fixture(); try { approveSyntheticFixture(root); const b = build({ root, env: { RELEASE_MODE: 'public', SITE_ORIGIN: 'https://fixture.example.org' }, now: fixed }); assert.equal(b.pages, 18); assert.equal(b.routes['/ops/'], undefined); assert.ok(b.routes['/sitemap.xml']); assert.equal(b.commerce.publicReleaseBlockerCount, 0); const text = readFileSync(resolve(root, 'dist/index.html'), 'utf8'); assert.doesNotMatch(text, /Owner workspace|PRIVATE-PREVIEW/); assert.match(text, /index,follow/); assert.match(text, /1 Fixture Street/); } finally { rmSync(root, { recursive: true }); } });
test('unknown release mode is rejected', () => assert.throws(() => build({ env: { RELEASE_MODE: 'accidental' } }), /RELEASE_MODE/));
test('HTTP page, assets, 404 and security headers', async () => {
  const root = fixture(); let app; try { build({ root, env: {}, now: fixed }); app = createApp({ root: resolve(root, 'dist') }); const base = await listen(app);
    const home = await fetch(base); assert.equal(home.status, 200); assert.match(await home.text(), /A little more room/); assert.equal(home.headers.get('x-content-type-options'), 'nosniff'); assert.equal(home.headers.get('set-cookie'), null); assert.equal(home.headers.get('referrer-policy'), 'no-referrer'); assert.match(home.headers.get('content-security-policy'), /frame-ancestors 'none'/); assert.match(home.headers.get('content-security-policy'), /img-src 'self' https:/);
    for (const route of ['/assets/app.js', '/assets/logic.js', '/assets/styles.css', '/catalogue.json', '/guides/measure-drawer/', '/fit/', '/ops/']) assert.equal((await fetch(base + route)).status, 200);
    for (const route of ['/.env', '/data/site.json', '/data/ledger.json', '/docs/source-plan/original-plan.ro.md', '/.build-meta.json', '/unknown']) assert.equal((await fetch(base + route)).status, 404);
    assert.equal((await fetch(base + '/guides', { redirect: 'manual' })).status, 308); assert.equal((await fetch(base + '/fit/', { method: 'POST' })).status, 405);
    const head = await fetch(base + '/', { method: 'HEAD' }); assert.equal(await head.text(), ''); assert.ok(Number(head.headers.get('content-length')) > 0);
  } finally { if (app) await stop(app); rmSync(root, { recursive: true }); }
});
test('malformed/traversal paths do not escape the route allowlist', async () => { const root = fixture(); let app; try { build({ root, env: {}, now: fixed }); app = createApp({ root: resolve(root, 'dist') }); const base = await listen(app); for (const path of ['/../.env', '/%2e%2e/.env', '/%252e%252e/.env', '/%00', '/%xx', '/..%5c.env']) assert.equal((await raw(base, path)).status, 400, path); } finally { if (app) await stop(app); rmSync(root, { recursive: true }); } });
test('network-exposed preview refuses to start without strong auth', () => { const root = fixture(); try { build({ root, env: {}, now: fixed }); assert.throws(() => createApp({ root: resolve(root, 'dist'), host: '0.0.0.0' }), /PREVIEW_ACCESS_CODE/); assert.throws(() => createApp({ root: resolve(root, 'dist'), token: 'short' }), /32/); } finally { rmSync(root, { recursive: true }); } });
test('preview auth protects both pages and candidate JSON', async () => { const root = fixture(); let app; try { build({ root, env: {}, now: fixed }); const token = 'synthetic-test-only-secret-000000000000000'; app = createApp({ root: resolve(root, 'dist'), host: '0.0.0.0', token }); const base = await listen(app); assert.equal((await fetch(base + '/')).status, 401); assert.equal((await fetch(base + '/catalogue.json')).status, 401); assert.equal((await fetch(base + '/healthz')).status, 200); assert.equal((await fetch(base + '/', { headers: { authorization: 'Basic ' + Buffer.from(`preview:${token}`).toString('base64') } })).status, 200); } finally { if (app) await stop(app); rmSync(root, { recursive: true }); } });
test('changed build files fail integrity at startup', () => { const root = fixture(); try { build({ root, env: {}, now: fixed }); writeFileSync(resolve(root, 'dist/index.html'), 'tampered'); assert.throws(() => createApp({ root: resolve(root, 'dist') }), /integrity/); } finally { rmSync(root, { recursive: true }); } });
test('public source expiry blocks serving rather than carrying stale monetisation', async () => { const root = fixture(); let app; try { approveSyntheticFixture(root); build({ root, env: { RELEASE_MODE: 'public', SITE_ORIGIN: 'https://fixture.example.org' }, now: fixed }); app = createApp({ root: resolve(root, 'dist'), now: () => new Date('2026-10-16T00:00:00Z') }); const base = await listen(app); assert.equal((await fetch(base + '/')).status, 503); assert.equal((await fetch(base + '/healthz')).status, 503); } finally { if (app) await stop(app); rmSync(root, { recursive: true }); } });
test('public server never serves an owner workspace', async () => { const root = fixture(); let app; try { approveSyntheticFixture(root); build({ root, env: { RELEASE_MODE: 'public', SITE_ORIGIN: 'https://fixture.example.org' }, now: fixed }); app = createApp({ root: resolve(root, 'dist'), now: () => fixed }); const base = await listen(app); assert.equal((await fetch(base + '/ops/')).status, 404); assert.equal((await fetch(base + '/')).status, 200); } finally { if (app) await stop(app); rmSync(root, { recursive: true }); } });

test('preview build refuses monetisation even when data flag is changed', () => { const root = fixture(); try { const p = loadProject(root); p.site.monetization.enabled = true; writeFileSync(resolve(root, 'data/site.json'), JSON.stringify(p.site)); assert.throws(() => build({ root, env: {}, now: fixed }), /Preview builds cannot activate/); } finally { rmSync(root, { recursive: true }); } });
