import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stageEbayOffers, validateProviderOffers } from '../src/provider-offers.mjs';

function json(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function todayUTC() { return new Date().toISOString().slice(0, 10); }

async function accessToken({ clientId, clientSecret, fetchImpl }) {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetchImpl('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`eBay OAuth failed with ${response.status}: ${text.slice(0, 250)}`);
  let payload;
  try { payload = JSON.parse(text); } catch { throw new Error('eBay OAuth returned invalid JSON.'); }
  if (!payload?.access_token) throw new Error('eBay OAuth returned no access token.');
  return payload.access_token;
}

export async function syncEbay({
  root = process.cwd(),
  clientId = process.env.EBAY_CLIENT_ID,
  clientSecret = process.env.EBAY_CLIENT_SECRET,
  campaignId = process.env.EPN_CAMPAIGN_ID,
  marketplace = process.env.EBAY_MARKETPLACE || 'EBAY_IE',
  checkedAt = todayUTC(),
  fetchImpl = fetch
} = {}) {
  if (!clientId || !clientSecret || !campaignId) return { skipped: true, reason: 'EBAY_NOT_CONFIGURED', offers: [] };
  if (marketplace !== 'EBAY_IE') throw new Error('DROPi Home eBay v1 supports only EBAY_IE.');
  if (!/^\d{10}$/.test(String(campaignId))) throw new Error('EPN_CAMPAIGN_ID must be the 10-digit campaign ID.');

  const mappingsPath = resolve(root, 'data/provider-mappings.json');
  const outPath = resolve(root, 'data/affiliate-offers.generated.json');
  const mappings = json(mappingsPath).filter(x => x.provider === 'ebay');
  const token = await accessToken({ clientId, clientSecret, fetchImpl });
  const items = [];

  for (const mapping of mappings) {
    if (!mapping.productId || !mapping.externalProductId) throw new Error('eBay mapping requires productId and externalProductId.');
    const url = `https://api.ebay.com/buy/browse/v1/item/${encodeURIComponent(mapping.externalProductId)}`;
    const context = `affiliateCampaignId=${campaignId},affiliateReferenceId=${encodeURIComponent(`dropi-home-${mapping.productId}`)}`;
    const response = await fetchImpl(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': marketplace,
        'X-EBAY-C-ENDUSERCTX': context
      }
    });
    const text = await response.text();
    if (response.status === 404) continue;
    if (!response.ok) throw new Error(`eBay Browse API failed with ${response.status}: ${text.slice(0, 250)}`);
    let item;
    try { item = JSON.parse(text); } catch { throw new Error('eBay Browse API returned invalid JSON.'); }
    items.push(item);
  }

  const offers = stageEbayOffers({ items, mappings, campaignId, checkedAt });
  const issues = validateProviderOffers(offers);
  if (issues.length) throw new Error(`Generated eBay offers failed validation:\n- ${issues.join('\n- ')}`);

  const previous = json(outPath);
  const next = [...previous.filter(x => x.provider !== 'ebay'), ...offers]
    .sort((a, b) => `${a.provider}:${a.productId}`.localeCompare(`${b.provider}:${b.productId}`));
  writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`);
  return { skipped: false, requestedMappings: mappings.length, mappedOffers: offers.length, offers };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  syncEbay().then(result => {
    if (result.skipped) console.log('SKIP: eBay/EPN is not configured; no files changed.');
    else console.log(`PASS: eBay sync complete; ${result.requestedMappings} mappings requested, ${result.mappedOffers} offers staged.`);
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
