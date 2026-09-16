import { loadProject } from '../src/project.mjs';
import { isFresh, sha256, reviewValid } from '../src/domain.mjs';
const p = loadProject();
const report = { generatedAt: new Date().toISOString(), products: p.products.map(x => ({ id: x.id, source: x.source.url, checkedAt: x.source.checkedAt, sourceState: isFresh(x.source.checkedAt, p.site.sourceMaxAgeDays) ? 'CURRENT' : 'STALE', catalogueSnapshotSha256: sha256(p.products) })), guides: p.guides.map(g => ({ slug: g.slug, sha256: sha256(g), state: reviewValid(p.reviews[g.slug], g, p) ? 'REVIEWED' : 'NEEDS_REVIEW' })) };
console.log(JSON.stringify(report, null, 2));
// Offline freshness only. This does not fetch links, verify stock or refresh dates.
if (report.products.some(x => x.sourceState === 'STALE')) process.exitCode = 2;
