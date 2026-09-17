import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntakeRightsService, validateRightsLookup } from '../src/intake-rights.mjs';

test('rights service is inert without read database access', () => {
  assert.equal(createIntakeRightsService({ readConnectionString: '' }), null);
});

test('rights lookup requires both request id and matching contact', () => {
  assert.ok(validateRightsLookup({ requestId: '', contact: '' }).issues.length >= 2);
  assert.ok(validateRightsLookup({ requestId: 'DH-12345678', contact: 'not-an-email' }).issues.length >= 1);
  assert.deepEqual(validateRightsLookup({ requestId: 'DH-12345678', contact: 'Customer@Example.org' }), {
    issues: [],
    requestId: 'DH-12345678',
    contact: 'customer@example.org'
  });
});

test('phone lookup accepts a bounded phone shape', () => {
  assert.deepEqual(validateRightsLookup({ requestId: 'DH-12345678', contact: '+353 87 123 4567' }).issues, []);
});
