import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProject } from '../src/project.mjs';
import { validateProject, releaseIssues, publicOrigin, dateOnly, DAY, sha256 } from '../src/domain.mjs';
import { validateCatalogueMedia } from '../src/catalogue-media.mjs';
import { validateProviderMappings, validateProviderOffers } from '../src/provider-offers.mjs';
import { validateCommercialApprovals } from '../src/commercial-offers.mjs';
import { validateDropshipSuppliers } from '../src/dropship.mjs';
import { validateDropshipSkus } from '../src/dropship-sku.mjs';
import { validateCustomIntakePolicy } from '../src/custom-intake.mjs';
import { renderSite } from '../src/render.mjs';

function counts(list, key = 'status') {
  return Object.fromEntries([...new Set((list || []).map(x => x?.[key] ?? 'UNKNOWN'))].sort().map(value => [value, (list || []).filter(x => (x?.[key] ?? 'UNKNOWN') === value).length]));
}

export function build({ root = process.cwd(), outDir = resolve(root, 'dist'), env = process.env, now = new Date() } = {}) {
  if (!['preview', 'public'].includes(env.RELEASE_MODE || 'preview')) throw new Error('RELEASE_MODE must be preview or public.');
  const mode = env.RELEASE_MODE || 'preview'; const p = loadProject(root);
  if (mode === 'preview' && p.site.monetization.enabled) throw new Error('Preview builds cannot activate monetization.');
  const publicReleaseBlockers = releaseIssues(p, env, now);
  const issues = [
    ...(mode === 'public' ? publicReleaseBlockers : validateProject(p)),
    ...validateCatalogueMedia(p),
    ...validateProviderMappings(p.providerMappings, p.products.map(x => x.id)),
    ...validateProviderOffers(p.providerOffers),
    ...validateCommercialApprovals(p, now),
    ...validateDropshipSuppliers(p.dropshipSuppliers),
    ...validateDropshipSkus(p.dropshipSkus, p.dropshipSuppliers),
    ...validateCustomIntakePolicy(p.customIntakePolicy, p.evidenceExists)
  ];
  if (issues.length) throw new Error(`Build blocked:\n- ${issues.join('\n- ')}`);
  const origin = publicOrigin(env.SITE_ORIGIN); const rendered = renderSite(p, { mode, origin, now });
  if (outDir !== resolve(root, 'dist')) throw new Error('Output must be the project dist directory.');
  rmSync(outDir, { recursive: true, force: true }); mkdirSync(resolve(outDir, 'assets'), { recursive: true });
  const routes = {};
  for (const [route, html] of rendered.pages) { const file = route === '/' ? 'index.html' : `${route.slice(1)}index.html`; mkdirSync(dirname(resolve(outDir, file)), { recursive: true }); writeFileSync(resolve(outDir, file), html); routes[route] = file; }
  const combinedStyles = readFileSync(resolve(root, 'public', 'styles.css'), 'utf8') + '\n' + readFileSync(resolve(root, 'public', 'catalogue-media.css'), 'utf8');
  writeFileSync(resolve(outDir, 'assets', 'styles.css'), combinedStyles); routes['/assets/styles.css'] = 'assets/styles.css';
  for (const file of ['app.js', 'logic.js']) { cpSync(resolve(root, 'public', file), resolve(outDir, 'assets', file)); routes[`/assets/${file}`] = `assets/${file}`; }
  writeFileSync(resolve(outDir, 'catalogue.json'), JSON.stringify(rendered.products)); routes['/catalogue.json'] = 'catalogue.json';
  writeFileSync(resolve(outDir, 'robots.txt'), mode === 'preview' ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`); routes['/robots.txt'] = 'robots.txt';
  if (mode === 'public') { const urls = [...rendered.pages.keys()].filter(x => x !== '/404/'); writeFileSync(resolve(outDir, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.map(x => `<url><loc>${origin}${x}</loc></url>`).join('') + '</urlset>'); routes['/sitemap.xml'] = 'sitemap.xml'; }
  const deadlines = p.products.map(x => dateOnly(x.source.checkedAt) + p.site.sourceMaxAgeDays * DAY);
  for (const product of p.products) if (product.media?.checkedAt) deadlines.push(dateOnly(product.media.checkedAt) + p.site.sourceMaxAgeDays * DAY);
  for (const review of Object.values(p.reviews)) if (review.reviewedAt) deadlines.push(dateOnly(review.reviewedAt) + p.site.editorialMaxAgeDays * DAY);
  for (const record of [p.site.publication, p.site.privacyReview, p.site.brandReview]) if (record.approvedAt) deadlines.push(dateOnly(record.approvedAt) + p.site.editorialMaxAgeDays * DAY);
  if (p.site.monetization.enabled) {
    for (const link of p.links) deadlines.push(dateOnly(link.reviewedAt) + p.site.sourceMaxAgeDays * DAY);
    for (const program of p.programs.filter(x => p.links.some(l => l.programId === x.id))) deadlines.push(dateOnly(program.termsReviewedAt) + p.site.sourceMaxAgeDays * DAY);
    for (const mapping of p.providerMappings.filter(x => x.status === 'APPROVED' && x.reviewedAt)) deadlines.push(dateOnly(mapping.reviewedAt) + p.site.sourceMaxAgeDays * DAY);
    for (const offer of p.providerOffers.filter(x => x.checkedAt)) deadlines.push(dateOnly(offer.checkedAt) + p.site.sourceMaxAgeDays * DAY);
  }
  const hashes = Object.fromEntries(Object.values(routes).map(f => [f, sha256(readFileSync(resolve(outDir, f), 'utf8'))]));
  const commerce = {
    monetizationEnabled: p.site.monetization.enabled,
    affiliatePrograms: counts(p.programs),
    providerMappings: p.providerMappings.length,
    providerMappingsByStatus: counts(p.providerMappings),
    providerOffers: counts(p.providerOffers),
    dropshipSuppliers: counts(p.dropshipSuppliers),
    dropshipSkuCount: p.dropshipSkus.length,
    dropshipSkusByStatus: counts(p.dropshipSkus),
    dropshipPilotSkuCount: p.dropshipSkus.filter(x => x.status === 'APPROVED_FOR_PILOT').length,
    dropshippingSellingEnabled: p.site.legalControls?.dropshippingSellingEnabled === true,
    consumerCheckoutEnabled: p.site.legalControls?.consumerCheckoutEnabled === true,
    conversionTrackingEnabled: p.site.legalControls?.conversionTrackingEnabled === true,
    publicReleaseBlockerCount: publicReleaseBlockers.length,
    publicReleaseBlockers,
    customIntake: {
      status: p.customIntakePolicy.status,
      publicIntakeEnabled: p.customIntakePolicy.publicIntakeEnabled,
      structuredSubmissionEnabled: p.customIntakePolicy.structuredSubmissionEnabled,
      mediaUploadsEnabled: p.customIntakePolicy.mediaUploadsEnabled,
      aiProcessingEnabled: p.customIntakePolicy.aiProcessingEnabled,
      manufacturerRoutingEnabled: p.customIntakePolicy.manufacturerRoutingEnabled,
      storageProvider: p.customIntakePolicy.storageProvider,
      mediaStorageProvider: p.customIntakePolicy.mediaStorageProvider
    }
  };
  const metadata = {
    schemaVersion: 1,
    mode,
    builtAt: new Date(now).toISOString(),
    expiresAt: new Date(Math.min(...deadlines)).toISOString(),
    sourceSnapshotSha256: sha256({ site: p.site, products: p.products, guides: p.guides, links: p.links, programs: p.programs, reviews: p.reviews, providerMappings: p.providerMappings, providerOffers: p.providerOffers, dropshipSuppliers: p.dropshipSuppliers, dropshipSkus: p.dropshipSkus, customIntakePolicy: p.customIntakePolicy }),
    pages: rendered.pages.size,
    products: p.products.length,
    guides: p.guides.length,
    commerce,
    routes,
    hashes
  };
  writeFileSync(resolve(outDir, '.build-meta.json'), JSON.stringify(metadata, null, 2));
  return metadata;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { try { const b = build(); console.log(`Built ${b.pages} pages; ${b.guides} guides; ${b.products} candidates. Mode: ${b.mode.toUpperCase()}.`); } catch (err) { console.error(err.message); process.exitCode = 1; } }
