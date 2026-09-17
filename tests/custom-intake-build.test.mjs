import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { build } from '../scripts/build.mjs';

function fixture() {
  const root = mkdtempSync(resolve(tmpdir(), 'dropi-intake-build-'));
  for (const f of ['data', 'content', 'public']) cpSync(resolve(f), resolve(root, f), { recursive: true });
  mkdirSync(resolve(root, 'docs/evidence'), { recursive: true });
  return root;
}

test('current build records provisioned private storage but keeps all customer processing disabled', () => {
  const root = fixture();
  try {
    const b = build({ root, env: {}, now: new Date('2026-09-17T05:00:00Z') });
    assert.equal(b.commerce.customIntake.status, 'FOUNDATION_ONLY');
    assert.equal(b.commerce.customIntake.publicIntakeEnabled, false);
    assert.equal(b.commerce.customIntake.structuredSubmissionEnabled, false);
    assert.equal(b.commerce.customIntake.mediaUploadsEnabled, false);
    assert.equal(b.commerce.customIntake.aiProcessingEnabled, false);
    assert.equal(b.commerce.customIntake.manufacturerRoutingEnabled, false);
    assert.equal(b.commerce.customIntake.storageProvider, 'NEON_POSTGRES_EU_FRANKFURT');
    assert.equal(b.commerce.customIntake.mediaStorageProvider, 'NOT_PROVISIONED');
  } finally {
    rmSync(root, { recursive: true });
  }
});
