import { createHash } from 'node:crypto';
export const DAY = 86400000;
export const sha256 = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]);
export function safeHttps(raw, allowedHosts, pathPrefix = '/') {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && allowedHosts.includes(u.hostname) && u.pathname.startsWith(pathPrefix);
  } catch { return false; }
}
export function dateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
}
export function isFresh(date, maxDays, now = new Date()) {
  const time = dateOnly(date);
  const nowMS = new Date(now).getTime();
  return Number.isFinite(time) && Number.isFinite(nowMS) && Number.isInteger(maxDays) && maxDays > 0 && time <= nowMS && nowMS < time + maxDays * DAY;
}
export function validateProject(p) {
  const issues = [];
  const fail = text => issues.push(text);
  const unique = (list, key, label) => { const ids = new Set(); for (const row of list) { if (!row[key] || ids.has(row[key])) fail(`${label}: missing or duplicate ${key}.`); ids.add(row[key]); } };
  for (const key of ['products', 'merchants', 'programs', 'links', 'guides']) if (!Array.isArray(p[key])) fail(`${key} must be an array.`);
  if (issues.length) return issues;
  for (const [key, name] of [['products', 'id'], ['merchants', 'id'], ['programs', 'id'], ['guides', 'slug']]) unique(p[key], name, key);
  if (!Number.isInteger(p.site?.sourceMaxAgeDays) || p.site.sourceMaxAgeDays < 1 || p.site.sourceMaxAgeDays > 90) fail('sourceMaxAgeDays must be 1–90.');
  if (!Number.isInteger(p.site?.editorialMaxAgeDays) || p.site.editorialMaxAgeDays < 1 || p.site.editorialMaxAgeDays > 365) fail('editorialMaxAgeDays must be 1–365.');
  for (const [label, value] of [['monetization.enabled', p.site?.monetization?.enabled], ['publication.approved', p.site?.publication?.approved], ['privacyReview.approved', p.site?.privacyReview?.approved], ['brandReview.approved', p.site?.brandReview?.approved], ['analytics.enabled', p.site?.analytics?.enabled], ['spending.adsEnabled', p.site?.spending?.adsEnabled]]) if (typeof value !== 'boolean') fail(`${label} must be boolean.`);
  if (p.site?.analytics?.enabled !== false) fail('Analytics are not implemented; leave disabled.');
  if (p.site?.spending?.adsEnabled !== false) fail('Ad buying is not implemented; leave disabled.');
  for (const product of p.products) {
    const label = `Product ${product.id}`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)) fail(`${label}: invalid ID.`);
    const merchant = p.merchants.find(m => m.id === product.merchantId);
    if (!merchant || !safeHttps(product.source?.url, merchant.allowedHosts, merchant.sourcePathPrefix)) fail(`${label}: source must be an allowlisted manufacturer URL.`);
    if (!Number.isFinite(dateOnly(product.source?.checkedAt))) fail(`${label}: invalid source check date.`);
    for (const axis of ['width', 'depth', 'height']) if (!Number.isFinite(product.dimensionsMM?.[axis]) || product.dimensionsMM[axis] <= 0) fail(`${label}: invalid ${axis}.`);
    if (product.maxWidthMM != null && (!Number.isFinite(product.maxWidthMM) || product.maxWidthMM < product.dimensionsMM.width)) fail(`${label}: invalid expansion limit.`);
    if (product.minSpaceHeightMM != null && (!Number.isFinite(product.minSpaceHeightMM) || product.minSpaceHeightMM < product.dimensionsMM.height)) fail(`${label}: invalid minimum space height.`);
    if (!['drawer', 'underbed', 'wardrobe', 'desk', 'shelf'].includes(product.category)) fail(`${label}: invalid category.`);
    if (product.image !== null) fail(`${label}: image rights pipeline is not implemented; use no merchant images.`);
    if (product.handsOnTested !== false) fail(`${label}: hands-on evidence support is not implemented.`);
    for (const forbidden of ['price', 'rating', 'discount', 'reviewCount', 'commissionRate']) if (forbidden in product) fail(`${label}: unsupported commercial field ${forbidden}.`);
  }
  for (const g of p.guides) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.slug)) fail('Invalid guide slug.');
    if (!g.title || !g.summary || !Array.isArray(g.sections) || g.sections.length < 3) fail(`Guide ${g.slug}: incomplete original content.`);
    if (!Array.isArray(g.checklist) || g.checklist.length < 3) fail(`Guide ${g.slug}: incomplete checklist.`);
    if (!Array.isArray(g.productIds) || g.productIds.some(id => !p.products.some(x => x.id === id))) fail(`Guide ${g.slug}: unknown product reference.`);
    if (g.sections?.some(s => typeof s.heading !== 'string' || !Array.isArray(s.paragraphs) || s.paragraphs.some(t => typeof t !== 'string'))) fail(`Guide ${g.slug}: invalid section.`);
  }
  unique(p.links, 'productId', 'affiliate links');
  for (const link of p.links) if (!p.products.some(x => x.id === link.productId) || !p.programs.some(x => x.id === link.programId)) fail('Affiliate link has an unknown product or programme.');
  return issues;
}
function approvedRecord(record, evidenceExists, maxAge, now) {
  return record?.approved === true && typeof record.evidenceFile === 'string' && evidenceExists(record.evidenceFile) && typeof record.approvedBy === 'string' && !!record.approvedBy.trim() && isFresh(record.approvedAt, maxAge, now);
}
export function reviewValid(review, data, p, now = new Date()) {
  return review?.status === 'APPROVED' && typeof review.reviewer === 'string' && !!review.reviewer.trim() && review.sha256 === sha256(data) && isFresh(review.reviewedAt, p.site.editorialMaxAgeDays, now) && p.evidenceExists(review.evidenceFile);
}
export function affiliateDecision(product, p, origin, now = new Date()) {
  const no = reason => ({ active: false, reason, url: product.source.url, kind: 'RESEARCH_ONLY' });
  if (!p.site.monetization.enabled) return no('MONETIZATION_DISABLED');
  if (!isFresh(product.source.checkedAt, p.site.sourceMaxAgeDays, now)) return no('STALE_SOURCE');
  const link = p.links.find(x => x.productId === product.id);
  if (!link) return no('NO_APPROVED_LINK');
  const program = p.programs.find(x => x.id === link.programId);
  if (!program || program.status !== 'APPROVED' || !program.accountId || !p.evidenceExists(program.approvalEvidenceFile)) return no('PROGRAM_NOT_APPROVED');
  if (program.approvedSiteOrigin !== origin || !isFresh(program.termsReviewedAt, p.site.sourceMaxAgeDays, now)) return no('PROGRAM_SITE_OR_TERMS_NOT_VERIFIED');
  if (link.status !== 'APPROVED' || !p.evidenceExists(link.approvalEvidenceFile) || !isFresh(link.reviewedAt, p.site.sourceMaxAgeDays, now)) return no('LINK_NOT_APPROVED');
  if (!safeHttps(link.url, program.allowedHosts)) return no('UNSAFE_LINK');
  if (link.sourceUrl !== product.source.url || link.productSnapshotSha256 !== sha256(product)) return no('PRODUCT_MAPPING_CHANGED');
  const u = new URL(link.url);
  if (program.id === 'amazon-ie' && (u.searchParams.get('tag') !== program.accountId || !/^\/(?:[^/]+\/)?dp\/[A-Z0-9]{10}(?:\/|$)/.test(u.pathname))) return no('INVALID_AMAZON_LINK');
  if (program.id === 'awin' && (u.searchParams.get('awinaffid') !== program.accountId || !link.merchantProgramId || u.searchParams.get('awinmid') !== link.merchantProgramId || u.searchParams.get('ued') !== product.source.url || u.pathname !== '/cread.php')) return no('INVALID_AWIN_LINK');
  return { active: true, reason: 'APPROVED', url: link.url, kind: 'AFFILIATE', programId: program.id };
}
export function publicOrigin(raw) {
  try { const u = new URL(raw); return u.protocol === 'https:' && !u.username && !u.password && !u.port && u.pathname === '/' && !u.search && !u.hash && u.hostname.includes('.') && !/(?:\.example|\.invalid|\.test|localhost)$/.test(u.hostname) ? u.origin : null; } catch { return null; }
}
export function releaseIssues(p, env = {}, now = new Date()) {
  const issues = validateProject(p);
  const origin = publicOrigin(env.SITE_ORIGIN);
  if (!origin) issues.push('Set an approved HTTPS SITE_ORIGIN (not a placeholder).');
  if (!approvedRecord(p.site.publication, p.evidenceExists, p.site.editorialMaxAgeDays, now) || !p.site.publication.approvedBy || !isFresh(p.site.publication.approvedAt, p.site.editorialMaxAgeDays, now)) issues.push('Owner publication approval and evidence are missing or stale.');
  if (!p.site.operator.publicName?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.site.operator.contactEmail ?? '') || /\.(example|invalid|test)$/.test(p.site.operator.contactEmail)) issues.push('Approved public operator identity and contact email are missing.');
  if (!approvedRecord(p.site.privacyReview, p.evidenceExists, p.site.editorialMaxAgeDays, now)) issues.push('Privacy and hosting-log review is not approved.');
  if (!approvedRecord(p.site.brandReview, p.evidenceExists, p.site.editorialMaxAgeDays, now)) issues.push('Working brand/domain clearance is not approved.');
  for (const g of p.guides) if (!reviewValid(p.reviews[g.slug], g, p, now)) issues.push(`Editorial review missing/stale/changed: ${g.slug}.`);
  if (!reviewValid(p.reviews.catalogue, p.products, p, now)) issues.push('Catalogue editorial approval is missing/stale/changed.');
  for (const product of p.products) if (!isFresh(product.source.checkedAt, p.site.sourceMaxAgeDays, now)) issues.push(`Source stale or future-dated: ${product.id}.`);
  if (p.site.monetization.enabled) {
    if (!p.links.length) issues.push('Monetization enabled without approved affiliate links.');
    for (const link of p.links) { const product = p.products.find(x => x.id === link.productId); if (product) { const decision = affiliateDecision(product, p, origin, now); if (!decision.active) issues.push(`Affiliate gate ${link.productId}: ${decision.reason}.`); } }
  }
  return [...new Set(issues)];
}
