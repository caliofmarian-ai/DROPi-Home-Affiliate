import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareTextIntake, createIntakeStore } from '../src/intake-store.mjs';

const policy = {
  structuredSubmissionEnabled: true,
  retentionDays: 30,
  privacyNoticeVersion: 'privacy-v1',
  consentVersion: 'consent-v1'
};
const now = new Date('2026-09-17T05:00:00Z');
const complete = {
  consentAccepted: true,
  contactEmail: 'customer@example.org',
  serviceArea: 'Dublin 15',
  roomType: 'Bedroom',
  furnitureType: 'Wardrobe',
  widthMM: '1800',
  heightMM: '2400',
  depthMM: '600',
  obstacles: 'Skirting board\nSocket on right wall',
  accessConstraints: 'One flight of stairs',
  deliveryRequired: true,
  fittingRequired: true,
  customerNotes: 'Text-only private pilot fixture.'
};

test('intake store is inert without a database secret', () => {
  assert.equal(createIntakeStore(''), null);
});

test('text intake refuses storage without explicit consent', () => {
  assert.throws(() => prepareTextIntake({ ...complete, consentAccepted: false }, policy, now), /Explicit consent/);
});

test('text intake refuses storage until structured policy is approved', () => {
  assert.throws(() => prepareTextIntake(complete, { ...policy, structuredSubmissionEnabled: false }, now), /not enabled/);
  assert.throws(() => prepareTextIntake(complete, { ...policy, retentionDays: null }, now), /retention/);
});

test('complete customer-typed dimensions can become ready for human review', () => {
  const result = prepareTextIntake(complete, policy, now);
  assert.match(result.request.requestId, /^DH-[a-f0-9]{24}$/);
  assert.equal(result.request.state, 'READY_FOR_HUMAN_REVIEW');
  assert.deepEqual(result.request.missingInformation, []);
  assert.equal(result.request.measurementProvenance.width, 'CUSTOMER_TYPED');
  assert.equal(result.request.consent.version, 'consent-v1');
  assert.equal(result.request.consent.privacyNoticeVersion, 'privacy-v1');
  assert.equal(result.deleteAfter, '2026-10-17T05:00:00.000Z');
});

test('incomplete text intake is stored only as waiting for customer information', () => {
  const result = prepareTextIntake({ consentAccepted: true, contactEmail: 'customer@example.org', roomType: 'Bedroom' }, policy, now);
  assert.equal(result.request.state, 'WAITING_FOR_CUSTOMER_INFO');
  assert.ok(result.request.missingInformation.includes('serviceArea'));
  assert.ok(result.request.missingInformation.includes('furnitureType'));
  assert.ok(result.request.missingInformation.includes('widthMM'));
  assert.ok(result.request.missingInformation.includes('heightMM'));
  assert.ok(result.request.missingInformation.includes('depthMM'));
});

test('text intake normalises bounded list fields and does not accept media', () => {
  const result = prepareTextIntake({ ...complete, obstacles: ' one \n\n two ', mediaRefs: ['should-not-be-used'] }, policy, now);
  assert.deepEqual(result.request.obstacles, ['one', 'two']);
  assert.equal('mediaRefs' in result.request, false);
});

test('target date is optional but invalid calendar dates fail closed', () => {
  assert.equal(prepareTextIntake({ ...complete, targetDate: '' }, policy, now).request.targetDate, null);
  assert.equal(prepareTextIntake({ ...complete, targetDate: '2026-12-01' }, policy, now).request.targetDate, '2026-12-01');
  for (const bad of ['2026-02-30', '01/12/2026', 'not-a-date', '2026-2-1']) {
    assert.throws(() => prepareTextIntake({ ...complete, targetDate: bad }, policy, now), /targetDate/);
  }
});
