import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncAwin } from '../scripts/sync-awin.mjs';
import { syncEbay } from '../scripts/sync-ebay.mjs';

function rootWith(mappings) {
  const root = mkdtempSync(join(tmpdir(), 'dropi-provider-'));
  mkdirSync(join(root, 'data'));
  writeFileSync(join(root, 'data/provider-mappings.json'), JSON.stringify(mappings));
  writeFileSync(join(root, 'data/affiliate-offers.generated.json'), '[]\n');
  return root;
}
function jsonResponse(value, status = 200) { return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } }); }

const nested = {
  meta: { advertiser_id: 9876, advertiser_name: 'Fixture Merchant' },
  product_basic: { id: 'AW-100', title: 'Storage fixture', link: 'https://merchant.example/aw-100', image_link: 'https://cdn.example/aw-100.webp' },
  price_and_availability: { price: '49.95 EUR', availability: 'in_stock' },
  product_identifiers: { brand: 'Fixture' }
};

test('Awin sync is a no-op without real credentials', async () => {
  const root = rootWith([]);
  const before = readFileSync(join(root, 'data/affiliate-offers.generated.json'), 'utf8');
  const result = await syncAwin({ root, publisherId: '', advertiserId: '', accessToken: '' });
  assert.equal(result.skipped, true);
  assert.equal(readFileSync(join(root, 'data/affiliate-offers.generated.json'), 'utf8'), before);
});

test('Awin sync requires Joined programme then stages exact feed mapping', async () => {
  const root = rootWith([{ provider: 'awin', productId: 'local-product', advertiserId: '9876', externalProductId: 'AW-100' }]);
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push(String(url));
    if (String(url).includes('/programmedetails')) return jsonResponse({ programmeInfo: { id: 9876, name: 'Fixture Merchant', membershipStatus: 'Joined' } });
    if (String(url).includes('/awinfeeds/download/')) return new Response(`${JSON.stringify(nested)}\n`, { status: 200 });
    if (String(url).includes('/linkbuilder/generate')) return jsonResponse({ url: 'https://www.awin1.com/cread.php?awinmid=9876&awinaffid=123' });
    throw new Error(`Unexpected URL ${url}`);
  };
  const result = await syncAwin({ root, publisherId: '123', advertiserId: '9876', accessToken: 'fixture-token', checkedAt: '2026-09-16', fetchImpl });
  assert.equal(result.mappedOffers, 1);
  assert.ok(calls[0].includes('relationship=joined'));
  const saved = JSON.parse(readFileSync(join(root, 'data/affiliate-offers.generated.json'), 'utf8'));
  assert.equal(saved[0].externalProductId, 'AW-100');
  assert.equal(saved[0].trackingUrl.includes('awin1.com'), true);
});

test('Awin sync fails closed when programme relationship is not Joined', async () => {
  const root = rootWith([{ provider: 'awin', productId: 'local-product', advertiserId: '9876', externalProductId: 'AW-100' }]);
  const before = readFileSync(join(root, 'data/affiliate-offers.generated.json'), 'utf8');
  const fetchImpl = async () => jsonResponse({ programmeInfo: { id: 9876, membershipStatus: 'Pending' } });
  await assert.rejects(() => syncAwin({ root, publisherId: '123', advertiserId: '9876', accessToken: 'fixture-token', fetchImpl }), /not confirmed as Joined/);
  assert.equal(readFileSync(join(root, 'data/affiliate-offers.generated.json'), 'utf8'), before);
});

test('eBay sync is a no-op without account credentials', async () => {
  const root = rootWith([]);
  const result = await syncEbay({ root, clientId: '', clientSecret: '', campaignId: '' });
  assert.equal(result.skipped, true);
});

test('eBay sync uses OAuth, EBAY_IE and official affiliate URL from Browse API', async () => {
  const root = rootWith([{ provider: 'ebay', productId: 'local-product', externalProductId: 'v1|123456789012|0' }]);
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url: String(url), headers: options.headers || {} });
    if (String(url).includes('/identity/v1/oauth2/token')) return jsonResponse({ access_token: 'oauth-fixture' });
    if (String(url).includes('/buy/browse/v1/item/')) return jsonResponse({
      itemId: 'v1|123456789012|0', title: 'eBay fixture', itemWebUrl: 'https://www.ebay.ie/itm/123456789012',
      itemAffiliateWebUrl: 'https://www.ebay.ie/itm/123456789012?campid=1234567890&customid=dropi-home-local-product',
      image: { imageUrl: 'https://i.ebayimg.com/images/g/fixture/s-l1600.webp' }, price: { value: '55.00', currency: 'EUR' }
    });
    throw new Error(`Unexpected URL ${url}`);
  };
  const result = await syncEbay({ root, clientId: 'client', clientSecret: 'secret', campaignId: '1234567890', checkedAt: '2026-09-16', fetchImpl });
  assert.equal(result.mappedOffers, 1);
  assert.equal(calls[1].headers['X-EBAY-C-MARKETPLACE-ID'], 'EBAY_IE');
  assert.ok(calls[1].headers['X-EBAY-C-ENDUSERCTX'].includes('affiliateCampaignId=1234567890'));
  const saved = JSON.parse(readFileSync(join(root, 'data/affiliate-offers.generated.json'), 'utf8'));
  assert.equal(saved[0].provider, 'ebay');
});
