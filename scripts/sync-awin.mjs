import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseAwinJsonl, stageAwinOffers, attachAwinTracking, validateProviderOffers } from '../src/provider-offers.mjs';

function todayUTC() { return new Date().toISOString().slice(0, 10); }
function json(path) { return JSON.parse(readFileSync(path, 'utf8')); }

async function jsonResponse(response, label) {
  const text = await response.text();
  if (!response.ok) throw new Error(`${label} failed with ${response.status}: ${text.slice(0, 300)}`);
  try { return JSON.parse(text); } catch { throw new Error(`${label} returned invalid JSON.`); }
}

export async function syncAwin({
  root = process.cwd(),
  publisherId = process.env.AWIN_PUBLISHER_ID,
  advertiserId = process.env.AWIN_ADVERTISER_ID,
  accessToken = process.env.AWIN_ACCESS_TOKEN,
  locale = process.env.AWIN_LOCALE || 'en_IE',
  checkedAt = todayUTC(),
  fetchImpl = fetch
} = {}) {
  if (!publisherId || !advertiserId || !accessToken) return { skipped: true, reason: 'AWIN_NOT_CONFIGURED', offers: [] };
  if (!/^\d+$/.test(String(publisherId)) || !/^\d+$/.test(String(advertiserId))) throw new Error('Awin publisher/advertiser IDs must be numeric.');
  if (!/^[a-z]{2}_[A-Z]{2}$/.test(locale)) throw new Error('AWIN_LOCALE must look like en_IE.');

  const authHeaders = { Authorization: `Bearer ${accessToken}` };
  const programmeUrl = `https://api.awin.com/publishers/${publisherId}/programmedetails?advertiserId=${advertiserId}&relationship=joined`;
  const programme = await jsonResponse(await fetchImpl(programmeUrl, { headers: authHeaders }), 'Awin programme preflight');
  const membership = String(programme?.programmeInfo?.membershipStatus || '').toLowerCase();
  if (membership !== 'joined' || String(programme?.programmeInfo?.id || '') !== String(advertiserId)) throw new Error('Awin advertiser programme is not confirmed as Joined for this publisher.');

  const mappingsPath = resolve(root, 'data/provider-mappings.json');
  const outPath = resolve(root, 'data/affiliate-offers.generated.json');
  const mappings = json(mappingsPath);
  const feedUrl = `https://api.awin.com/publishers/${publisherId}/awinfeeds/download/${advertiserId}-retail-${locale}.jsonl`;
  const feedResponse = await fetchImpl(feedUrl, { headers: authHeaders });
  if (!feedResponse.ok) throw new Error(`Awin feed download failed with ${feedResponse.status}.`);
  const rows = parseAwinJsonl(await feedResponse.text());
  let offers = stageAwinOffers({ rows, mappings, advertiserId, checkedAt });

  const tracked = [];
  for (const offer of offers) {
    const endpoint = `https://api.awin.com/publishers/${publisherId}/linkbuilder/generate?accessToken=${encodeURIComponent(accessToken)}`;
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { ...authHeaders, 'content-type': 'application/json' },
      body: JSON.stringify({ advertiserId: Number(advertiserId), destinationUrl: offer.destinationUrl, parameters: { clickref: `dropi-home-${offer.productId}` }, shorten: false })
    });
    const payload = await jsonResponse(response, 'Awin Link Builder');
    if (!payload?.url) throw new Error(`Awin Link Builder returned no tracking URL for ${offer.productId}.`);
    tracked.push(attachAwinTracking(offer, payload.url));
  }
  offers = tracked;
  const issues = validateProviderOffers(offers);
  if (issues.length) throw new Error(`Generated offers failed validation:\n- ${issues.join('\n- ')}`);

  const previous = json(outPath);
  const preserved = previous.filter(x => !(x.provider === 'awin' && String(x.advertiserId) === String(advertiserId)));
  const next = [...preserved, ...offers].sort((a, b) => `${a.provider}:${a.productId}`.localeCompare(`${b.provider}:${b.productId}`));
  writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`);
  return { skipped: false, programme: programme.programmeInfo.name || String(advertiserId), feedProducts: rows.length, mappedOffers: offers.length, offers };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  syncAwin().then(result => {
    if (result.skipped) console.log('SKIP: Awin is not configured; no files changed.');
    else console.log(`PASS: Awin ${result.programme} feed synced; ${result.feedProducts} feed products, ${result.mappedOffers} exact mapped offers.`);
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
