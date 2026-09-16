import test from 'node:test';
import assert from 'node:assert/strict';
import { loadProject } from '../src/project.mjs';
import { safeRemoteImage, validateCatalogueMedia, displayableMedia } from '../src/catalogue-media.mjs';

function project() { const p = loadProject(); p.evidenceExists = path => path === 'docs/evidence/synthetic-media.md'; return p; }

test('seed catalogue media contract passes with no approved images yet', () => {
  const p = project();
  assert.deepEqual(validateCatalogueMedia(p), []);
});

test('arbitrary scraped-looking image without rights evidence is blocked', () => {
  const p = project();
  p.products[0].media = { status: 'APPROVED', source: 'MERCHANT_PERMISSION', url: 'https://images.example.org/item.jpg', alt: 'Product', checkedAt: '2026-09-16', rightsEvidenceFile: 'missing.md' };
  assert.ok(validateCatalogueMedia(p).some(x => x.includes('rights evidence')));
});

test('synthetic Awin feed media with evidence is displayable', () => {
  const p = project();
  p.products[0].media = { status: 'APPROVED', source: 'AWIN_FEED', url: 'https://cdn.example.org/item.webp', alt: 'Synthetic product image', checkedAt: '2026-09-16', rightsEvidenceFile: 'docs/evidence/synthetic-media.md' };
  assert.deepEqual(validateCatalogueMedia(p), []);
  assert.equal(displayableMedia(p.products[0]).source, 'AWIN_FEED');
});

test('Amazon static media is rejected until a dynamic policy-compliant integration exists', () => {
  const p = project();
  p.products[0].media = { status: 'APPROVED', source: 'AMAZON_API', url: 'https://images.example.org/amazon.jpg', alt: 'Synthetic Amazon image', checkedAt: '2026-09-16', rightsEvidenceFile: 'docs/evidence/synthetic-media.md' };
  assert.ok(validateCatalogueMedia(p).some(x => x.includes('future dynamic integration')));
});

test('remote image URLs must be HTTPS and credential-free', () => {
  assert.equal(safeRemoteImage('https://cdn.example.org/a.jpg'), true);
  assert.equal(safeRemoteImage('http://cdn.example.org/a.jpg'), false);
  assert.equal(safeRemoteImage('https://user:pass@cdn.example.org/a.jpg'), false);
});
