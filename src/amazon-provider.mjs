const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function httpsUrl(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port;
  } catch { return false; }
}

export function validateAmazonMapping(mapping, knownProductIds = []) {
  const issues = [];
  if (mapping?.provider !== 'amazon') issues.push('Amazon mapping provider must be amazon.');
  if (!mapping?.productId || (knownProductIds.length && !knownProductIds.includes(mapping.productId))) issues.push('Amazon mapping has unknown or missing local productId.');
  if (!/^[A-Z0-9]{10}$/.test(String(mapping?.externalProductId || ''))) issues.push('Amazon mapping requires a 10-character ASIN.');
  return issues;
}

export function validateAmazonTransientContent(content, { now = new Date() } = {}) {
  const issues = [];
  if (!/^[A-Z0-9]{10}$/.test(String(content?.asin || ''))) issues.push('Amazon transient content requires a 10-character ASIN.');
  if (!httpsUrl(content?.detailPageUrl)) issues.push('Amazon detailPageUrl must be HTTPS.');
  if (content?.imageUrl != null && !httpsUrl(content.imageUrl)) issues.push('Amazon imageUrl must be HTTPS when present.');
  const fetchedAt = Date.parse(content?.fetchedAt || '');
  const nowMs = new Date(now).getTime();
  if (!Number.isFinite(fetchedAt) || !Number.isFinite(nowMs) || fetchedAt > nowMs) issues.push('Amazon fetchedAt is invalid or future-dated.');
  if (Number.isFinite(fetchedAt) && nowMs - fetchedAt >= DAY) issues.push('Amazon Product Advertising Content snapshot exceeded the 24-hour transient-content window.');
  if (content?.price != null) {
    if (content.price.currency !== 'EUR' || !Number.isFinite(content.price.amount) || content.price.amount < 0) issues.push('Amazon v1 price must be a non-negative EUR value.');
    const priceAt = Date.parse(content.price.checkedAt || '');
    if (!Number.isFinite(priceAt) || priceAt > nowMs) issues.push('Amazon price checkedAt is invalid or future-dated.');
    else if (nowMs - priceAt >= HOUR && !content.price.timestampLabel) issues.push('Amazon price refreshed less often than hourly requires an adjacent timestamp label.');
  }
  return issues;
}

export function amazonCacheDirective(content, { now = new Date() } = {}) {
  const issues = validateAmazonTransientContent(content, { now });
  if (issues.length) return { usable: false, ttlMs: 0, issues };
  const fetchedAt = Date.parse(content.fetchedAt);
  return { usable: true, ttlMs: Math.max(0, DAY - (new Date(now).getTime() - fetchedAt)), issues: [] };
}

export function persistableAmazonRecord(content) {
  if (!/^[A-Z0-9]{10}$/.test(String(content?.asin || ''))) throw new Error('A valid ASIN is required.');
  return {
    provider: 'amazon',
    externalProductId: content.asin,
    // Durable mapping only. Product images/prices/titles from Product Advertising Content stay transient.
    persistedAt: new Date().toISOString()
  };
}
