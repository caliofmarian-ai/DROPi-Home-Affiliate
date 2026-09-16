import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAwinJsonl, normaliseAwinProduct, stageAwinOffers, attachAwinTracking, normaliseEbayItem, stageEbayOffers, validateProviderOffers } from '../src/provider-offers.mjs';

const row = {
  id: 'AW-100',
  title: 'Compact storage unit',
  link: 'https://merchant.example/products/aw-100',
  image_link: 'https://cdn.merchant.example/aw-100.webp',
  price: '49.95 EUR',
  availability: 'in_stock',
  brand: 'Example',
  gtin: '1234567890123',
  mpn: 'M-100'
};
const mapping = [{ provider: 'awin', productId: 'local-product', advertiserId: '9876', externalProductId: 'AW-100' }];
const ebayItem = {
  itemId: 'v1|123456789012|0',
  title: 'Compact storage item',
  itemWebUrl: 'https://www.ebay.ie/itm/123456789012',
  itemAffiliateWebUrl: 'https://www.ebay.ie/itm/123456789012?campid=1234567890&customid=dropi-home-local-product',
  image: { imageUrl: 'https://i.ebayimg.com/images/g/example/s-l1600.webp' },
  price: { value: '59.95', currency: 'EUR' },
  estimatedAvailabilities: [{ estimatedAvailabilityStatus: 'IN_STOCK' }]
};
const ebayMapping = [{ provider: 'ebay', productId: 'local-product', externalProductId: 'v1|123456789012|0' }];

test('Awin JSONL parser accepts one JSON object per line', () => {
  assert.deepEqual(parseAwinJsonl(`${JSON.stringify(row)}\n\n`).map(x => x.id), ['AW-100']);
});

test('Awin JSONL parser rejects malformed lines', () => {
  assert.throws(() => parseAwinJsonl('{bad json}\n'), /line 1/);
});

test('Awin product normalization requires HTTPS destinations', () => {
  assert.equal(normaliseAwinProduct(row).price.currency, 'EUR');
  assert.throws(() => normaliseAwinProduct({ ...row, link: 'http://merchant.example/x' }), /HTTPS/);
});

test('Awin mapping is exact by external product id', () => {
  const offers = stageAwinOffers({ rows: [row], mappings: mapping, advertiserId: '9876', checkedAt: '2026-09-16' });
  assert.equal(offers.length, 1);
  assert.equal(offers[0].productId, 'local-product');
  assert.equal(offers[0].externalProductId, 'AW-100');
  assert.equal(offers[0].status, 'STAGED');
});

test('unmapped Awin feed products never create catalogue offers', () => {
  const offers = stageAwinOffers({ rows: [{ ...row, id: 'OTHER' }], mappings: mapping, advertiserId: '9876', checkedAt: '2026-09-16' });
  assert.equal(offers.length, 0);
});

test('tracking URL must stay on known Awin hosts', () => {
  const [offer] = stageAwinOffers({ rows: [row], mappings: mapping, advertiserId: '9876', checkedAt: '2026-09-16' });
  assert.equal(attachAwinTracking(offer, 'https://www.awin1.com/cread.php?x=1').trackingUrl.includes('awin1.com'), true);
  assert.throws(() => attachAwinTracking(offer, 'https://evil.example/track'), /Unexpected/);
});

test('v1 rejects non-EUR commercial price snapshots', () => {
  const [offer] = stageAwinOffers({ rows: [{ ...row, price: '49.95 GBP' }], mappings: mapping, advertiserId: '9876', checkedAt: '2026-09-16' });
  assert.ok(validateProviderOffers([offer]).some(x => x.includes('EUR')));
});

test('valid staged mapped Awin offer passes provider validation', () => {
  const [offer] = stageAwinOffers({ rows: [row], mappings: mapping, advertiserId: '9876', checkedAt: '2026-09-16' });
  const tracked = attachAwinTracking(offer, 'https://www.awin1.com/cread.php?awinmid=9876&awinaffid=123');
  assert.deepEqual(validateProviderOffers([tracked]), []);
});

test('eBay normalizer requires official Ireland item and affiliate URLs', () => {
  const item = normaliseEbayItem(ebayItem);
  assert.equal(item.price.currency, 'EUR');
  assert.equal(item.externalProductId, ebayItem.itemId);
  assert.throws(() => normaliseEbayItem({ ...ebayItem, itemAffiliateWebUrl: 'https://evil.example/x' }), /ebay.ie/);
});

test('eBay exact mapping stages official itemAffiliateWebUrl', () => {
  const offers = stageEbayOffers({ items: [ebayItem], mappings: ebayMapping, campaignId: '1234567890', checkedAt: '2026-09-16' });
  assert.equal(offers.length, 1);
  assert.equal(offers[0].trackingUrl, ebayItem.itemAffiliateWebUrl);
  assert.deepEqual(validateProviderOffers(offers), []);
});

test('eBay mapping never falls back to a similar item', () => {
  const offers = stageEbayOffers({ items: [{ ...ebayItem, itemId: 'v1|999999999999|0' }], mappings: ebayMapping, campaignId: '1234567890', checkedAt: '2026-09-16' });
  assert.equal(offers.length, 0);
});

test('eBay campaign IDs fail closed unless exactly 10 digits', () => {
  assert.throws(() => stageEbayOffers({ items: [ebayItem], mappings: ebayMapping, campaignId: '123', checkedAt: '2026-09-16' }), /10-digit/);
});
