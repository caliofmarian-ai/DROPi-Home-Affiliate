import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProject } from '../src/project.mjs';
import { providerOfferDecision, commerceDecision, validateCommercialApprovals } from '../src/commercial-offers.mjs';

const now = new Date('2026-09-16T16:00:00Z');
function fixture(provider = 'awin') {
  const p = loadProject();
  p.evidenceExists = () => true;
  p.site.monetization.enabled = true;
  const product = p.products[0];
  const programId = provider === 'awin' ? 'awin' : 'ebay-epn';
  const program = p.programs.find(x => x.id === programId);
  Object.assign(program, { status: 'APPROVED', accountId: provider === 'awin' ? '12345' : '1234567890', approvalEvidenceFile: 'docs/evidence/fixture.md', approvedSiteOrigin: 'https://fixture.example.org', termsReviewedAt: '2026-09-16', taxProfile: { status: 'REVIEWED', counterpartyLegalName: 'Synthetic Counterparty Ltd', countryCode: 'DE', vatId: 'DE123456789', treatment: 'EU_B2B_REVERSE_CHARGE', evidenceFile: 'docs/evidence/fixture.md' } });
  const mapping = { provider, productId: product.id, externalProductId: provider === 'awin' ? 'AW-100' : 'v1|123|0', status: 'APPROVED', reviewedAt: '2026-09-16', reviewedBy: 'Fixture reviewer', approvalEvidenceFile: 'docs/evidence/fixture.md', mediaApproved: true };
  if (provider === 'awin') mapping.advertiserId = '9876';
  p.providerMappings = [mapping];
  p.providerOffers = [{ provider, status: 'STAGED', productId: product.id, externalProductId: mapping.externalProductId, advertiserId: provider === 'awin' ? '9876' : undefined, campaignId: provider === 'ebay' ? '1234567890' : undefined, title: 'Approved fixture offer', destinationUrl: provider === 'awin' ? 'https://merchant.example/item' : 'https://www.ebay.ie/itm/123', trackingUrl: provider === 'awin' ? 'https://www.awin1.com/cread.php?x=1' : 'https://www.ebay.ie/itm/123?campid=1234567890', imageUrl: 'https://cdn.example/item.webp', price: { amount: 49.95, currency: 'EUR' }, availability: 'IN_STOCK', checkedAt: '2026-09-16' }];
  return { p, product, mapping, program };
}

test('provider offer remains research-only while monetisation is disabled', () => {
  const { p, product } = fixture(); p.site.monetization.enabled = false;
  assert.equal(providerOfferDecision(product, p, 'https://fixture.example.org', now).reason, 'MONETIZATION_DISABLED');
});

test('STAGED feed offer becomes active only behind approved programme mapping and tax profile', () => {
  const { p, product } = fixture('awin');
  const result = providerOfferDecision(product, p, 'https://fixture.example.org', now);
  assert.equal(result.active, true); assert.equal(result.provider, 'awin'); assert.equal(result.price.amount, 49.95); assert.equal(result.media.source, 'AWIN_FEED');
});

test('unreviewed programme tax profile blocks generated offer', () => {
  const { p, product, program } = fixture('awin'); program.taxProfile.status = 'NOT_REVIEWED';
  assert.equal(providerOfferDecision(product, p, 'https://fixture.example.org', now).reason, 'PROGRAM_TAX_PROFILE_NOT_REVIEWED');
});

test('approved eBay mapping uses official provider tracking URL', () => {
  const { p, product } = fixture('ebay');
  const result = providerOfferDecision(product, p, 'https://fixture.example.org', now);
  assert.equal(result.active, true); assert.equal(result.provider, 'ebay'); assert.ok(result.url.includes('ebay.ie'));
});

test('wrong approved site blocks provider offer', () => {
  const { p, product } = fixture();
  assert.equal(providerOfferDecision(product, p, 'https://wrong.example.org', now).active, false);
});

test('PENDING mapping blocks a generated offer even when feed is current', () => {
  const { p, product, mapping } = fixture(); mapping.status = 'PENDING';
  assert.equal(providerOfferDecision(product, p, 'https://fixture.example.org', now).reason, 'PROVIDER_MAPPING_NOT_APPROVED');
});

test('changed external id cannot reuse approval against a different feed item', () => {
  const { p, product, mapping } = fixture(); mapping.externalProductId = 'DIFFERENT';
  assert.equal(providerOfferDecision(product, p, 'https://fixture.example.org', now).reason, 'NO_CURRENT_PROVIDER_OFFER');
});

test('mapping without rights decision never exposes provider image', () => {
  const { p, product, mapping } = fixture(); mapping.mediaApproved = false;
  const result = providerOfferDecision(product, p, 'https://fixture.example.org', now);
  assert.equal(result.active, true); assert.equal(result.media, null);
});

test('approval validator requires named fresh evidence for APPROVED mappings', () => {
  const { p, mapping } = fixture(); mapping.reviewedBy = ''; mapping.approvalEvidenceFile = '';
  const issues = validateCommercialApprovals(p, now);
  assert.ok(issues.some(x => x.includes('reviewedBy'))); assert.ok(issues.some(x => x.includes('evidence')));
});

test('provider mapping becomes authoritative and does not silently fall back to a legacy link', () => {
  const { p, product, mapping } = fixture(); mapping.status = 'PENDING';
  p.links = [{ productId: product.id, programId: 'awin', merchantProgramId: '9876', status: 'APPROVED', url: 'https://www.awin1.com/cread.php?awinaffid=12345&awinmid=9876&ued=https%3A%2F%2Fexample.org', sourceUrl: product.source.url, productSnapshotSha256: 'wrong', reviewedAt: '2026-09-16', approvalEvidenceFile: 'docs/evidence/fixture.md' }];
  assert.equal(commerceDecision(product, p, 'https://fixture.example.org', now).reason, 'PROVIDER_MAPPING_NOT_APPROVED');
});
