import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, mkdirSync, readFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { build } from '../scripts/build.mjs';

const fixed = new Date('2026-09-15T20:00:00Z');
function fixture() {
  const root = mkdtempSync(resolve(tmpdir(), 'dropi-a11y-'));
  for (const f of ['data', 'content', 'public']) cpSync(resolve(f), resolve(root, f), { recursive: true });
  mkdirSync(resolve(root, 'docs/evidence'), { recursive: true });
  return root;
}
function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry); const s = statSync(path);
    if (s.isDirectory()) out.push(...htmlFiles(path)); else if (entry.endsWith('.html')) out.push(path);
  }
  return out;
}

test('every generated page has language title main landmark and viewport', () => {
  const root = fixture();
  try {
    build({ root, env: {}, now: fixed });
    const files = htmlFiles(resolve(root, 'dist'));
    assert.equal(files.length, 19);
    for (const file of files) {
      const html = readFileSync(file, 'utf8');
      assert.match(html, /<html lang="en-IE">/, file);
      assert.match(html, /<title>[^<]+<\/title>/, file);
      assert.match(html, /<meta name="viewport" content="width=device-width,initial-scale=1">/, file);
      assert.match(html, /<main id="main"/, file);
      assert.match(html, /<a class="skip" href="#main">Skip to content<\/a>/, file);
    }
  } finally { rmSync(root, { recursive: true }); }
});

test('interactive tools expose labels and live status output', () => {
  const root = fixture();
  try {
    build({ root, env: {}, now: fixed });
    const fit = readFileSync(resolve(root, 'dist/fit/index.html'), 'utf8');
    assert.match(fit, /<label>Candidate<select id="fit-product">/);
    assert.match(fit, /id="fit-result" role="status" aria-live="polite"/);
    const catalogue = readFileSync(resolve(root, 'dist/catalogue/index.html'), 'utf8');
    assert.match(catalogue, /id="result-count" aria-live="polite"/);
    assert.match(catalogue, /aria-label="Main navigation"/);
  } finally { rmSync(root, { recursive: true }); }
});

test('approved dynamic product images must receive alternative text and no-referrer policy', () => {
  const app = readFileSync(resolve('public/app.js'), 'utf8');
  assert.match(app, /img\.alt\s*=\s*product\.media\.alt/);
  assert.match(app, /img\.referrerPolicy\s*=\s*'no-referrer'/);
});
