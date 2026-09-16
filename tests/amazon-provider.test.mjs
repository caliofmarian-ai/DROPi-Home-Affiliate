import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAmazonMapping, validateAmazonTransientContent, amazonCacheDirective, persistableAmazonRecord } from '../src/amazon-provider.mjs';

const now = new Date('2026-09-16T15:00:00Z');
const content = {
  asin: 'B0ABC12345',
  detailPageUrl: 'https://www.amazon.ie/dp/B0ABC12345',
  imageUrl: 'https://m.media-amazon.com/images/I/example.jpg',
  fetchedAt: '2026-09-16T14:30:00Z',
  price: { amount: 49.99, currency: 'EUR', checkedAt: '2026-09-16T14:30:00Z' }
};

test('Amazon mapping keeps a durable ASIN and exact local product', () => {
  assert.deepEqual(validateAmazonMapping({ provider: 'amazon', productId: 'local-product', externalProductId: 'B0ABC12345' }, ['local-product']), []);
});

test('Amazon mapping rejects unknown local product or malformed ASIN', () => {
  const issues = validateAmazonMapping({ provider: 'amazon', productId: 'missing', externalProductId: 'bad' }, ['local-product']);
  assert.ok(issues.some(x => x.includes('local productId')));
  assert.ok(issues.some(x => x.includes('ASIN')));
});

test('fresh transient Product Advertising Content is usable', () => {
  assert.deepEqual(validateAmazonTransientContent(content, { now }), []);
  const directive = amazonCacheDirective(content, { now });
  assert.equal(directive.usable, true);
  assert.ok(directive.ttlMs > 0 && directive.ttlMs <= 24 * 60 * 60 * 1000);
});

test('Amazon transient content fails closed after 24 hours', () => {
  const old = { ...content, fetchedAt: '2026-09-15T14:59:59Z' };
  assert.ok(validateAmazonTransientContent(old, { now }).some(x => x.includes('24-hour')));
  assert.equal(amazonCacheDirective(old, { now }).usable, false);
});

test('Amazon price older than one hour needs an adjacent timestamp label', () => {
  const stalePrice = { ...content, price: { amount: 49.99, currency: 'EUR', checkedAt: '2026-09-16T13:30:00Z' } };
  assert.ok(validateAmazonTransientContent(stalePrice, { now }).some(x => x.includes('timestamp')));
  const labelled = { ...stalePrice, price: { ...stalePrice.price, timestampLabel: 'Price checked 13:30 UTC' } };
  assert.deepEqual(validateAmazonTransientContent(labelled, { now }), []);
});

test('durable Amazon record deliberately excludes title image and price', () => {
  const record = persistableAmazonRecord(content);
  assert.equal(record.externalProductId, 'B0ABC12345');
  assert.equal('imageUrl' in record, false);
  assert.equal('price' in record, false);
  assert.equal('title' in record, false);
});
