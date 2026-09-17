import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MEDIA_CAPTURE_GUIDANCE_VERSION,
  MEDIA_CONSENT_VERSION,
  MEDIA_DELETE_RULE,
  MEDIA_DELETE_NOTICE_RULE,
  mediaActivationIssues,
  validateMediaSubmission,
  mediaPurgePlan,
  confirmMediaPurge,
  buildMediaDeletionEmail
} from '../src/custom-media.mjs';

const active = {
  structuredSubmissionEnabled: true,
  mediaUploadsEnabled: true,
  mediaStorageProvider: 'PRIVATE_OBJECT_STORAGE',
  mediaGuidanceVersion: MEDIA_CAPTURE_GUIDANCE_VERSION,
  mediaConsentVersion: MEDIA_CONSENT_VERSION,
  mediaDeletionRule: MEDIA_DELETE_RULE,
  mediaDeletionNotification: MEDIA_DELETE_NOTICE_RULE,
  mediaFallbackRetentionStatus: 'APPROVED',
  deletionEmailStatus: 'VERIFIED',
  aiDataUse: 'NO_TRAINING',
  mediaPrivacyReview: { approved: true, approvedBy: 'Owner', approvedAt: '2026-09-17T08:00:00Z', evidenceFile: 'docs/evidence/media-review.md' },
  processorReview: { approved: true, approvedBy: 'Owner', approvedAt: '2026-09-17T08:00:00Z', evidenceFile: 'docs/evidence/processor.md' }
};

test('media remains blocked without private storage processor review fallback retention and deletion email', () => {
  const policy = {
    ...active,
    mediaStorageProvider: 'NOT_PROVISIONED',
    mediaFallbackRetentionStatus: 'OPEN',
    deletionEmailStatus: 'MISSING',
    processorReview: { approved: false },
    mediaPrivacyReview: { approved: false }
  };
  const issues = mediaActivationIssues(policy, () => true);
  assert.ok(issues.some(x => x.includes('private object storage')));
  assert.ok(issues.some(x => x.includes('processor/data-transfer')));
  assert.ok(issues.some(x => x.includes('fallback retention')));
  assert.ok(issues.some(x => x.includes('deletion-confirmation email')));
});

test('photo/video submission requires current guidance separate media consent and privacy attestation', () => {
  const issues = validateMediaSubmission({ requestId: 'DH-TEST-0001', kind: 'PHOTO', mimeType: 'image/jpeg', sizeBytes: 1000 }, active);
  assert.ok(issues.some(x => x.includes('capture guidance')));
  assert.ok(issues.some(x => x.includes('media consent')));
  assert.ok(issues.some(x => x.includes('private information')));
});

test('valid guided photo submission passes structural checks', () => {
  const issues = validateMediaSubmission({
    requestId: 'DH-TEST-0001', kind: 'PHOTO', mimeType: 'image/jpeg', sizeBytes: 1000,
    guidanceAccepted: true, guidanceVersion: MEDIA_CAPTURE_GUIDANCE_VERSION,
    mediaConsentAccepted: true, mediaConsentVersion: MEDIA_CONSENT_VERSION,
    privacyAttestationAccepted: true
  }, active);
  assert.deepEqual(issues, []);
});

test('standalone audio is not accepted in the first media pilot', () => {
  const issues = validateMediaSubmission({
    requestId: 'DH-TEST-0001', kind: 'AUDIO', mimeType: 'audio/mpeg', sizeBytes: 1000,
    guidanceAccepted: true, guidanceVersion: MEDIA_CAPTURE_GUIDANCE_VERSION,
    mediaConsentAccepted: true, mediaConsentVersion: MEDIA_CONSENT_VERSION,
    privacyAttestationAccepted: true
  }, active);
  assert.ok(issues.some(x => x.includes('Unsupported media kind')));
});

test('closing completed cancelled or declined request creates purge requirement', () => {
  for (const closeReason of ['JOB_COMPLETED', 'CUSTOMER_CANCELLED', 'DECLINED']) {
    const plan = mediaPurgePlan({ requestId: 'DH-TEST-0001', mediaIds: ['M-1', 'M-2'], closeReason, customerEmail: 'customer@example.org' });
    assert.equal(plan.state, 'PURGE_REQUIRED');
    assert.equal(plan.deletionNotification, 'QUEUE_AFTER_CONFIRMED_PURGE');
  }
});

test('deletion email cannot be queued before every object is verified absent', () => {
  const plan = mediaPurgePlan({ requestId: 'DH-TEST-0001', mediaIds: ['M-1', 'M-2'], closeReason: 'JOB_COMPLETED', customerEmail: 'customer@example.org' });
  const incomplete = confirmMediaPurge(plan, [{ mediaId: 'M-1', deleted: true, verifiedAbsent: true }, { mediaId: 'M-2', deleted: true, verifiedAbsent: false }]);
  assert.equal(incomplete.state, 'PURGE_INCOMPLETE');
  const done = confirmMediaPurge(plan, [{ mediaId: 'M-1', deleted: true, verifiedAbsent: true }, { mediaId: 'M-2', deleted: true, verifiedAbsent: true }], new Date('2026-09-17T09:00:00Z'));
  assert.equal(done.state, 'PURGED_CONFIRMED');
  assert.equal(done.deletionNotification, 'READY_TO_SEND');
});

test('deletion confirmation email requires verified privacy address', () => {
  assert.throws(() => buildMediaDeletionEmail({ requestId: 'DH-TEST-0001', customerEmail: 'customer@example.org', privacyEmail: '' }), /privacy email/);
  const email = buildMediaDeletionEmail({ requestId: 'DH-TEST-0001', customerEmail: 'customer@example.org', privacyEmail: 'privacy@example.org' });
  assert.equal(email.to, 'customer@example.org');
  assert.match(email.subject, /deleted/i);
});
