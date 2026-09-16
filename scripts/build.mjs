import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProject } from '../src/project.mjs';
import { validateProject, releaseIssues, publicOrigin, dateOnly, DAY, sha256 } from '../src/domain.mjs';
import { renderSite } from '../src/render.mjs';
export function build({ root = process.cwd(), outDir = resolve(root, 'dist'), env = process.env, now = new Date() } = {}) {
  if (!['preview', 'public'].includes(env.RELEASE_MODE || 'preview')) throw new Error('RELEASE_MODE must be preview or public.');
  const mode = env.RELEASE_MODE || 'preview'; const p = loadProject(root);
  if (mode === 'preview' && p.site.monetization.enabled) throw new Error('Preview builds cannot activate monetization.');
  const issues = mode === 'public' ? releaseIssues(p, env, now) : validateProject(p);
  if (issues.length) throw new Error(`Build blocked:\n- ${issues.join('\n- ')}`);
  const origin = publicOrigin(env.SITE_ORIGIN); const rendered = renderSite(p, { mode, origin, now });
  // Destructive output cleaning is deliberately restricted to a directory named dist.
  if (outDir !== resolve(root, 'dist')) throw new Error('Output must be the project dist directory.');
  rmSync(outDir, { recursive: true, force: true }); mkdirSync(resolve(outDir, 'assets'), { recursive: true });
  const routes = {};
  for (const [route, html] of rendered.pages) { const file = route === '/' ? 'index.html' : `${route.slice(1)}index.html`; mkdirSync(dirname(resolve(outDir, file)), { recursive: true }); writeFileSync(resolve(outDir, file), html); routes[route] = file; }
  for (const file of ['styles.css', 'app.js', 'logic.js']) { cpSync(resolve(root, 'public', file), resolve(outDir, 'assets', file)); routes[`/assets/${file}`] = `assets/${file}`; }
  writeFileSync(resolve(outDir, 'catalogue.json'), JSON.stringify(rendered.products)); routes['/catalogue.json'] = 'catalogue.json';
  writeFileSync(resolve(outDir, 'robots.txt'), mode === 'preview' ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`); routes['/robots.txt'] = 'robots.txt';
  if (mode === 'public') { const urls = [...rendered.pages.keys()].filter(x => x !== '/404/'); writeFileSync(resolve(outDir, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.map(x => `<url><loc>${origin}${x}</loc></url>`).join('') + '</urlset>'); routes['/sitemap.xml'] = 'sitemap.xml'; }
  const deadlines = p.products.map(x => dateOnly(x.source.checkedAt) + p.site.sourceMaxAgeDays * DAY);
  for (const review of Object.values(p.reviews)) if (review.reviewedAt) deadlines.push(dateOnly(review.reviewedAt) + p.site.editorialMaxAgeDays * DAY);
  for (const record of [p.site.publication, p.site.privacyReview, p.site.brandReview]) if (record.approvedAt) deadlines.push(dateOnly(record.approvedAt) + p.site.editorialMaxAgeDays * DAY);
  if (p.site.monetization.enabled) {
    for (const link of p.links) deadlines.push(dateOnly(link.reviewedAt) + p.site.sourceMaxAgeDays * DAY);
    for (const program of p.programs.filter(x => p.links.some(l => l.programId === x.id))) deadlines.push(dateOnly(program.termsReviewedAt) + p.site.sourceMaxAgeDays * DAY);
  }
  const hashes = Object.fromEntries(Object.values(routes).map(f => [f, sha256(readFileSync(resolve(outDir, f), 'utf8'))]));
  const metadata = { schemaVersion: 1, mode, builtAt: new Date(now).toISOString(), expiresAt: new Date(Math.min(...deadlines)).toISOString(), sourceSnapshotSha256: sha256({ site: p.site, products: p.products, guides: p.guides, links: p.links, programs: p.programs, reviews: p.reviews }), pages: rendered.pages.size, products: p.products.length, guides: p.guides.length, routes, hashes };
  writeFileSync(resolve(outDir, '.build-meta.json'), JSON.stringify(metadata, null, 2));
  return metadata;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { try { const b = build(); console.log(`Built ${b.pages} pages; ${b.guides} guides; ${b.products} candidates. Mode: ${b.mode.toUpperCase()}.`); } catch (err) { console.error(err.message); process.exitCode = 1; } }
