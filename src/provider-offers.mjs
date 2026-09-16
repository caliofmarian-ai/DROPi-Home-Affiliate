function safeHttps(raw) {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && !!u.hostname;
  } catch { return false; }
}

function dateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ms = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value;
}

function ebayIrelandHost(raw) {
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return host === 'ebay.ie' || host.endsWith('.ebay.ie');
  } catch { return false; }
}

export function parseAwinJsonl(text) {
  if (typeof text !== 'string') throw new Error('Awin feed must be text.');
  const rows = [];
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line) continue;
    let value;
    try { value = JSON.parse(line); } catch { throw new Error(`Invalid Awin JSONL at line ${index + 1}.`); }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid Awin product at line ${index + 1}.`);
    rows.push(value);
  }
  return rows;
}

export function normaliseAwinProduct(row) {
  if (!row?.id || !row?.title || !safeHttps(row.link)) throw new Error('Awin product requires id, title and HTTPS link.');
  if (row.image_link && !safeHttps(row.image_link)) throw new Error('Awin image_link must be HTTPS before DROPi can stage it.');
  const priceMatch = typeof row.price === 'string' ? row.price.trim().match(/^([0-9]+(?:\.[0-9]{1,2})?)\s+([A-Z]{3})$/) : null;
  return {
    externalProductId: String(row.id),
    title: String(row.title),
    destinationUrl: row.link,
    imageUrl: row.image_link || null,
    availability: typeof row.availability === 'string' ? row.availability : null,
    brand: typeof row.brand === 'string' ? row.brand : null,
    gtin: typeof row.gtin === 'string' ? row.gtin : null,
    mpn: typeof row.mpn === 'string' ? row.mpn : null,
    price: priceMatch ? { amount: Number(priceMatch[1]), currency: priceMatch[2] } : null
  };
}

export function stageAwinOffers({ rows, mappings, advertiserId, checkedAt }) {
  if (!Array.isArray(rows) || !Array.isArray(mappings)) throw new Error('Rows and mappings must be arrays.');
  if (!String(advertiserId || '').match(/^\d+$/)) throw new Error('Awin advertiserId must be numeric.');
  if (!dateOnly(checkedAt)) throw new Error('checkedAt must be YYYY-MM-DD.');
  const byId = new Map(rows.map(row => {
    const n = normaliseAwinProduct(row);
    return [n.externalProductId, n];
  }));
  const out = [];
  for (const mapping of mappings) {
    if (mapping.provider !== 'awin' || String(mapping.advertiserId) !== String(advertiserId)) continue;
    if (!mapping.productId || !mapping.externalProductId) throw new Error('Awin mapping requires productId and externalProductId.');
    const row = byId.get(String(mapping.externalProductId));
    if (!row) continue;
    out.push({
      provider: 'awin',
      status: 'STAGED',
      productId: String(mapping.productId),
      advertiserId: String(advertiserId),
      externalProductId: row.externalProductId,
      title: row.title,
      destinationUrl: row.destinationUrl,
      trackingUrl: null,
      imageUrl: row.imageUrl,
      price: row.price,
      availability: row.availability,
      brand: row.brand,
      gtin: row.gtin,
      mpn: row.mpn,
      checkedAt
    });
  }
  return out.sort((a, b) => a.productId.localeCompare(b.productId));
}

export function attachAwinTracking(offer, url) {
  if (!offer || offer.provider !== 'awin') throw new Error('Only Awin offers are supported.');
  if (!safeHttps(url)) throw new Error('Awin tracking URL must be HTTPS.');
  const host = new URL(url).hostname;
  if (!['www.awin1.com', 'awin1.com', 'tidd.ly'].includes(host)) throw new Error('Unexpected Awin tracking host.');
  return { ...offer, trackingUrl: url };
}

export function normaliseEbayItem(item) {
  if (!item?.itemId || !item?.title || !safeHttps(item.itemWebUrl) || !safeHttps(item.itemAffiliateWebUrl)) throw new Error('eBay item requires itemId, title, itemWebUrl and itemAffiliateWebUrl.');
  if (!ebayIrelandHost(item.itemWebUrl) || !ebayIrelandHost(item.itemAffiliateWebUrl)) throw new Error('eBay v1 item URLs must resolve to ebay.ie.');
  const imageUrl = item.image?.imageUrl || null;
  if (imageUrl && !safeHttps(imageUrl)) throw new Error('eBay item image must be HTTPS.');
  const price = item.price && Number.isFinite(Number(item.price.value)) && typeof item.price.currency === 'string'
    ? { amount: Number(item.price.value), currency: item.price.currency }
    : null;
  return {
    externalProductId: String(item.itemId),
    title: String(item.title),
    destinationUrl: item.itemWebUrl,
    trackingUrl: item.itemAffiliateWebUrl,
    imageUrl,
    price,
    availability: typeof item.estimatedAvailabilities?.[0]?.estimatedAvailabilityStatus === 'string' ? item.estimatedAvailabilities[0].estimatedAvailabilityStatus : null,
    brand: null,
    gtin: item.gtin || null,
    mpn: item.mpn || null
  };
}

export function stageEbayOffers({ items, mappings, campaignId, checkedAt }) {
  if (!Array.isArray(items) || !Array.isArray(mappings)) throw new Error('Items and mappings must be arrays.');
  if (!/^\d{10}$/.test(String(campaignId || ''))) throw new Error('eBay campaignId must be the 10-digit EPN campaign ID.');
  if (!dateOnly(checkedAt)) throw new Error('checkedAt must be YYYY-MM-DD.');
  const byId = new Map(items.map(item => {
    const n = normaliseEbayItem(item);
    return [n.externalProductId, n];
  }));
  const out = [];
  for (const mapping of mappings) {
    if (mapping.provider !== 'ebay') continue;
    if (!mapping.productId || !mapping.externalProductId) throw new Error('eBay mapping requires productId and externalProductId.');
    const item = byId.get(String(mapping.externalProductId));
    if (!item) continue;
    out.push({
      provider: 'ebay',
      status: 'STAGED',
      productId: String(mapping.productId),
      campaignId: String(campaignId),
      externalProductId: item.externalProductId,
      title: item.title,
      destinationUrl: item.destinationUrl,
      trackingUrl: item.trackingUrl,
      imageUrl: item.imageUrl,
      price: item.price,
      availability: item.availability,
      brand: item.brand,
      gtin: item.gtin,
      mpn: item.mpn,
      checkedAt
    });
  }
  return out.sort((a, b) => a.productId.localeCompare(b.productId));
}

export function validateProviderOffers(offers) {
  const issues = [];
  const seen = new Set();
  for (const offer of offers || []) {
    const key = `${offer.provider}:${offer.productId}`;
    if (seen.has(key)) issues.push(`Duplicate provider offer ${key}.`);
    seen.add(key);
    if (!['awin', 'ebay'].includes(offer.provider)) issues.push(`${key}: unsupported provider.`);
    if (!['STAGED', 'APPROVED', 'REVOKED'].includes(offer.status)) issues.push(`${key}: invalid status.`);
    if (!offer.productId || !offer.externalProductId) issues.push(`${key}: missing stable identifiers.`);
    if (offer.provider === 'awin' && !String(offer.advertiserId || '').match(/^\d+$/)) issues.push(`${key}: invalid Awin advertiser ID.`);
    if (offer.provider === 'ebay' && !String(offer.campaignId || '').match(/^\d{10}$/)) issues.push(`${key}: invalid eBay campaign ID.`);
    if (!safeHttps(offer.destinationUrl)) issues.push(`${key}: invalid destination URL.`);
    if (offer.imageUrl && !safeHttps(offer.imageUrl)) issues.push(`${key}: invalid image URL.`);
    if (offer.trackingUrl) {
      try {
        const host = new URL(offer.trackingUrl).hostname;
        if (offer.provider === 'awin' && !['www.awin1.com', 'awin1.com', 'tidd.ly'].includes(host)) issues.push(`${key}: unexpected Awin tracking host.`);
        if (offer.provider === 'ebay' && !(host === 'ebay.ie' || host.endsWith('.ebay.ie'))) issues.push(`${key}: unexpected eBay tracking host.`);
      } catch { issues.push(`${key}: invalid tracking URL.`); }
    }
    if (!dateOnly(offer.checkedAt)) issues.push(`${key}: invalid checkedAt.`);
    if (offer.price && (offer.price.currency !== 'EUR' || !Number.isFinite(offer.price.amount) || offer.price.amount < 0)) issues.push(`${key}: only non-negative EUR price snapshots are accepted in v1.`);
  }
  return issues;
}
