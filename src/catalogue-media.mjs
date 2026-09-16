const ALLOWED_SOURCES = new Set(['AWIN_FEED', 'EBAY_BROWSE_API', 'MERCHANT_PERMISSION']);

function validDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

export function safeRemoteImage(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && !!url.hostname;
  } catch {
    return false;
  }
}

export function validateCatalogueMedia(project) {
  const issues = [];
  const evidenceExists = typeof project.evidenceExists === 'function' ? project.evidenceExists : () => false;
  for (const product of project.products || []) {
    const media = product.media;
    if (media == null) continue;
    const label = `Product ${product.id} media`;
    if (!media || typeof media !== 'object' || Array.isArray(media)) { issues.push(`${label}: media must be an object or null.`); continue; }
    if (media.status !== 'APPROVED') issues.push(`${label}: only APPROVED media may be rendered.`);
    if (!ALLOWED_SOURCES.has(media.source)) issues.push(`${label}: unsupported media source. Amazon Product Advertising Content must use a future dynamic integration, not this static catalogue field.`);
    if (!safeRemoteImage(media.url)) issues.push(`${label}: image URL must be a direct HTTPS remote URL.`);
    if (typeof media.alt !== 'string' || media.alt.trim().length < 3) issues.push(`${label}: meaningful alt text is required.`);
    if (!validDateOnly(media.checkedAt)) issues.push(`${label}: checkedAt must be a valid YYYY-MM-DD date.`);
    if (typeof media.rightsEvidenceFile !== 'string' || !media.rightsEvidenceFile.trim() || !evidenceExists(media.rightsEvidenceFile)) issues.push(`${label}: rights evidence file is missing.`);
  }
  return issues;
}

export function displayableMedia(product) {
  return product?.media?.status === 'APPROVED' && ALLOWED_SOURCES.has(product.media.source) && safeRemoteImage(product.media.url) ? product.media : null;
}
