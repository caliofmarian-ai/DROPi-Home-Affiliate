import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCustomIntakePolicy,
  validateCustomIntakeRequest,
  missingForHumanReview,
  qualifyCustomIntake,
  intakeTransitionAllowed,
  applyIntakeTransition,
  validateAiIntakeOutput
} from '../src/custom-intake.mjs';

const evidence = () => true;
const enabledPolicy = {
  status: 'PRIVATE_PILOT_READY',
  publicIntakeEnabled: false,
  structuredSubmissionEnabled: true,
  mediaUploadsEnabled: false,
  aiProcessingEnabled: true,
  manufacturerRoutingEnabled: false,
  storageProvider: 'PRIVATE_POSTGRES',
  mediaStorageProvider: 'NOT_PROVISIONED',
  retentionDays: 30,
  privacyNoticeVersion: 'privacy-v1',
  consentVersion: 'intake-consent-v1',
  lawfulBasisStatus: 'CONSENT_APPROVED',
  controllerIdentityStatus: 'VERIFIED',
  privacyContactStatus: 'VERIFIED',
  rightsProcedureStatus: 'VERIFIED',
  aiDataUse: 'NO_TRAINING',
  privacyReview: { approved: true, approvedAt: '2026-09-16T18:00:00Z', approvedBy: 'Owner', evidenceFile: 'docs/evidence/privacy.md' },
  processorReview: { approved: true, approvedAt: '2026-09-16T18:00:00Z', approvedBy: 'Owner', evidenceFile: 'docs/evidence/processor.md' },
  manufacturerAgreement: { approved: false, approvedAt: null, approvedBy: null, evidenceFile: null }
};

const completeRequest = {
  requestId: 'CFR-TEST-0001',
  state: 'WAITING_FOR_CUSTOMER_INFO',
  route: 'CUSTOM_MANUFACTURING',
  createdAt: '2026-09-16T18:10:00Z',
  contactEmail: 'customer@example.org',
  serviceArea: 'Dublin 15',
  roomType: 'Bedroom',
  furnitureType: 'Built-in wardrobe',
  widthMM: 1800,
  heightMM: 2400,
  depthMM: 600,
  measurementProvenance: { width: 'CUSTOMER_CONFIRMED', height: 'CUSTOMER_CONFIRMED', depth: 'CUSTOMER_CONFIRMED' },
  obstacles: ['Skirting board'],
  accessConstraints: [],
  materialPreferences: [],
  finishPreferences: [],
  missingInformation: [],
  riskFlags: [],
  mediaRefs: [],
  consent: {
    accepted: true,
    version: 'intake-consent-v1',
    privacyNoticeVersion: 'privacy-v1',
    acceptedAt: '2026-09-16T18:11:00Z'
  }
};

test('foundation-only intake policy is safe while every collection feature is disabled', () => {
  const policy = {
    status: 'FOUNDATION_ONLY',
    publicIntakeEnabled: false,
    structuredSubmissionEnabled: false,
    mediaUploadsEnabled: false,
    aiProcessingEnabled: false,
    manufacturerRoutingEnabled: false,
    storageProvider: 'NEON_POSTGRES_EU_FRANKFURT',
    mediaStorageProvider: 'NOT_PROVISIONED',
    retentionDays: 30,
    privacyNoticeVersion: 'custom-intake-privacy-v1-draft',
    consentVersion: 'custom-intake-consent-v1-draft',
    lawfulBasisStatus: 'CONSENT_MODEL_PROPOSED_NOT_ACTIVATED',
    controllerIdentityStatus: 'MISSING',
    privacyContactStatus: 'MISSING',
    rightsProcedureStatus: 'MISSING',
    aiDataUse: 'NO_TRAINING',
    privacyReview: { approved: false },
    processorReview: { approved: false },
    manufacturerAgreement: { approved: false }
  };
  assert.deepEqual(validateCustomIntakePolicy(policy, evidence), []);
});

test('structured customer intake fails closed without storage retention consent and privacy review', () => {
  const policy = { ...enabledPolicy, storageProvider: 'NOT_PROVISIONED', retentionDays: null, privacyNoticeVersion: null, consentVersion: null, privacyReview: { approved: false } };
  const issues = validateCustomIntakePolicy(policy, evidence);
  assert.ok(issues.some(x => x.includes('private persistent storage')));
  assert.ok(issues.some(x => x.includes('retentionDays')));
  assert.ok(issues.some(x => x.includes('privacy review')));
});

test('structured intake also fails closed without lawful basis controller contact and rights procedure', () => {
  const policy = {
    ...enabledPolicy,
    lawfulBasisStatus: 'CONSENT_MODEL_PROPOSED_NOT_ACTIVATED',
    controllerIdentityStatus: 'MISSING',
    privacyContactStatus: 'MISSING',
    rightsProcedureStatus: 'MISSING'
  };
  const issues = validateCustomIntakePolicy(policy, evidence);
  assert.ok(issues.some(x => x.includes('Article 6 lawful-basis')));
  assert.ok(issues.some(x => x.includes('controller identity')));
  assert.ok(issues.some(x => x.includes('privacy contact')));
  assert.ok(issues.some(x => x.includes('rights and withdrawal/erasure')));
});

test('manufacturer routing cannot activate without written agreement evidence', () => {
  const policy = { ...enabledPolicy, manufacturerRoutingEnabled: true };
  assert.ok(validateCustomIntakePolicy(policy, evidence).some(x => x.includes('written commercial/data-sharing agreement')));
});

test('complete private intake policy passes structural safety validation', () => {
  assert.deepEqual(validateCustomIntakePolicy(enabledPolicy, evidence), []);
});

test('review readiness requires customer-confirmed contract-critical dimensions', () => {
  const photoOnly = { ...completeRequest, measurementProvenance: { ...completeRequest.measurementProvenance, width: 'PHOTO_SUPPORTING_EVIDENCE' } };
  assert.ok(missingForHumanReview(photoOnly, enabledPolicy).includes('width_customer_confirmed_measurement'));
  assert.deepEqual(missingForHumanReview(completeRequest, enabledPolicy), []);
});

test('AI intake can only promote a complete request to human review', () => {
  const incomplete = { ...completeRequest, widthMM: null };
  assert.throws(() => applyIntakeTransition(incomplete, 'READY_FOR_HUMAN_REVIEW', 'AI_INTAKE', enabledPolicy), /not review-ready/);
  const ready = applyIntakeTransition(completeRequest, 'READY_FOR_HUMAN_REVIEW', 'AI_INTAKE', enabledPolicy);
  assert.equal(ready.state, 'READY_FOR_HUMAN_REVIEW');
});

test('AI cannot make manufacturing quotation or decline decisions', () => {
  assert.equal(intakeTransitionAllowed('READY_FOR_HUMAN_REVIEW', 'POTENTIALLY_PRODUCIBLE', 'AI_INTAKE'), false);
  assert.equal(intakeTransitionAllowed('READY_FOR_HUMAN_REVIEW', 'DECLINED', 'AI_INTAKE'), false);
  assert.equal(intakeTransitionAllowed('READY_FOR_HUMAN_REVIEW', 'POTENTIALLY_PRODUCIBLE', 'HUMAN_REVIEWER'), true);
  assert.equal(intakeTransitionAllowed('READY_FOR_QUOTATION', 'QUOTED', 'HUMAN_REVIEWER'), true);
});

test('only the customer can accept or decline a quotation', () => {
  assert.equal(intakeTransitionAllowed('QUOTED', 'CUSTOMER_ACCEPTED', 'CUSTOMER'), true);
  assert.equal(intakeTransitionAllowed('QUOTED', 'CUSTOMER_ACCEPTED', 'HUMAN_REVIEWER'), false);
});

test('AI output contract rejects binding commercial and inferred-dimension claims', () => {
  assert.ok(validateAiIntakeOutput({ finalQuoteEUR: 1200 }).some(x => x.includes('finalQuoteEUR')));
  assert.ok(validateAiIntakeOutput({ measurements: { width: { value: 1800, provenance: 'AI_INFERRED' } } }).some(x => x.includes('AI-inferred')));
  assert.deepEqual(validateAiIntakeOutput({ summary: 'Customer requests a wardrobe.', missingInformation: ['ceiling height'] }), []);
});

test('request contract rejects final quotation and binding order fields', () => {
  assert.deepEqual(validateCustomIntakeRequest(completeRequest), []);
  const issues = validateCustomIntakeRequest({ ...completeRequest, finalQuoteEUR: 1000, bindingOrderAccepted: true });
  assert.ok(issues.some(x => x.includes('finalQuoteEUR')));
  assert.ok(issues.some(x => x.includes('bindingOrderAccepted')));
});

test('qualifier returns only a readiness suggestion, never a production decision', () => {
  const q = qualifyCustomIntake(completeRequest, enabledPolicy);
  assert.equal(q.suggestedState, 'READY_FOR_HUMAN_REVIEW');
  assert.equal(q.missing.length, 0);
  assert.notEqual(q.suggestedState, 'POTENTIALLY_PRODUCIBLE');
});
