import test from 'node:test';
import assert from 'node:assert/strict';
import { retentionExecutionEnabled, runRetention } from '../scripts/intake-retention.mjs';

test('retention execution is disabled unless the exact true flag is present', () => {
  for (const value of [undefined, '', 'false', 'TRUE', '1', 'yes']) assert.equal(retentionExecutionEnabled({ INTAKE_RETENTION_EXECUTE: value }), false);
  assert.equal(retentionExecutionEnabled({ INTAKE_RETENTION_EXECUTE: 'true' }), true);
});

test('disabled retention is a database-free no-op', async () => {
  const messages = [];
  const result = await runRetention({ env: { INTAKE_RETENTION_EXECUTE: 'false' }, log: message => messages.push(message) });
  assert.deepEqual(result, { executed: false, deleted: 0 });
  assert.match(messages[0], /NO-OP/);
});

test('enabled retention refuses to run without the dedicated maintenance database secret', async () => {
  await assert.rejects(() => runRetention({ env: { INTAKE_RETENTION_EXECUTE: 'true' }, log: () => {} }), /INTAKE_MAINTENANCE_DATABASE_URL/);
});
