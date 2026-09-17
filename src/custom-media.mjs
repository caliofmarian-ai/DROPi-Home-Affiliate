const MEDIA_KINDS = new Set(['PHOTO', 'VIDEO']);
const MEDIA_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']);
const TERMINAL_CLOSE_REASONS = new Set(['JOB_COMPLETED', 'CUSTOMER_CANCELLED', 'DECLINED', 'OTHER_CLOSED']);

function nonBlank(v) { return typeof v === 'string' && v.trim().length > 0; }

export const MEDIA_CAPTURE_GUIDANCE_VERSION = 'custom-media-guidance-v1';
export const MEDIA_CONSENT_VERSION = 'custom-media-consent-v1-draft';
export const MEDIA_DELETE_RULE = 'DELETE_ON_TERMINAL_CLOSE';
export const MEDIA_DELETE_NOTICE_RULE = 'EMAIL_AFTER_CONFIRMED_PURGE';

export function mediaActivationIssues(policy, evidenceExists = () => false) {
  const issues = [];
  if (!policy?.mediaUploadsEnabled) return issues;
  if (!policy.structuredSubmissionEnabled) issues.push('Media uploads require structured text intake first.');
  if (!nonBlank(policy.mediaStorageProvider) || policy.mediaStorageProvider === 'NOT_PROVISIONED') issues.push('Media uploads require private object storage.');
  if (policy.mediaGuidanceVersion !== MEDIA_CAPTURE_GUIDANCE_VERSION) issues.push('Media uploads require the current capture guidance version.');
  if (policy.mediaConsentVersion !== MEDIA_CONSENT_VERSION) issues.push('Media uploads require the current media consent version.');
  if (policy.mediaDeletionRule !== MEDIA_DELETE_RULE) issues.push('Media uploads require terminal-close purge policy.');
  if (policy.mediaDeletionNotification !== MEDIA_DELETE_NOTICE_RULE) issues.push('Media uploads require confirmed-purge email notification policy.');
  if (policy.aiDataUse !== 'NO_TRAINING') issues.push('Media may not be used for model training under the approved policy.');
  const review = policy.mediaPrivacyReview;
  if (!(review?.approved === true && nonBlank(review.approvedBy) && Number.isFinite(Date.parse(review.approvedAt)) && nonBlank(review.evidenceFile) && evidenceExists(review.evidenceFile))) {
    issues.push('Media uploads require approved media privacy review evidence.');
  }
  const processor = policy.processorReview;
  if (!(processor?.approved === true && nonBlank(processor.approvedBy) && Number.isFinite(Date.parse(processor.approvedAt)) && nonBlank(processor.evidenceFile) && evidenceExists(processor.evidenceFile))) {
    issues.push('Media uploads require approved processor/data-transfer review evidence.');
  }
  if (policy.mediaFallbackRetentionStatus !== 'APPROVED') issues.push('Media uploads require an approved fallback retention rule for abandoned requests.');
  if (policy.deletionEmailStatus !== 'VERIFIED') issues.push('Media uploads require a verified deletion-confirmation email route.');
  return issues;
}

export function validateMediaSubmission(input, policy) {
  const issues = mediaActivationIssues(policy, () => true);
  if (!input || typeof input !== 'object') return [...issues, 'Media submission is required.'];
  if (!MEDIA_KINDS.has(input.kind)) issues.push('Unsupported media kind.');
  if (!MEDIA_MIME.has(input.mimeType)) issues.push('Unsupported media MIME type.');
  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes < 1 || input.sizeBytes > 524288000) issues.push('Media size is invalid or exceeds 500 MiB.');
  if (input.guidanceAccepted !== true || input.guidanceVersion !== MEDIA_CAPTURE_GUIDANCE_VERSION) issues.push('Current capture guidance must be acknowledged.');
  if (input.mediaConsentAccepted !== true || input.mediaConsentVersion !== MEDIA_CONSENT_VERSION) issues.push('Current media consent must be accepted.');
  if (input.privacyAttestationAccepted !== true) issues.push('Customer must confirm they reviewed the media for unnecessary private information.');
  if (!nonBlank(input.requestId) || !/^[A-Za-z0-9-]{8,80}$/.test(input.requestId)) issues.push('requestId is invalid.');
  return [...new Set(issues)];
}

export function mediaPurgePlan({ requestId, mediaIds = [], closeReason, customerEmail }) {
  if (!nonBlank(requestId)) throw new Error('requestId is required.');
  if (!TERMINAL_CLOSE_REASONS.has(closeReason)) throw new Error('A terminal close reason is required before media purge.');
  if (!Array.isArray(mediaIds) || mediaIds.some(x => !nonBlank(x))) throw new Error('mediaIds must be a list of ids.');
  if (customerEmail != null && !/^\S+@\S+\.\S+$/.test(customerEmail)) throw new Error('customerEmail is invalid.');
  return {
    requestId,
    closeReason,
    mediaIds: [...new Set(mediaIds)],
    state: mediaIds.length ? 'PURGE_REQUIRED' : 'NOTHING_TO_PURGE',
    deletionNotification: customerEmail ? 'QUEUE_AFTER_CONFIRMED_PURGE' : 'NO_EMAIL_AVAILABLE'
  };
}

export function confirmMediaPurge(plan, results, now = new Date()) {
  if (!plan || plan.state !== 'PURGE_REQUIRED') throw new Error('A purge-required plan is needed.');
  if (!Array.isArray(results)) throw new Error('Purge results are required.');
  const byId = new Map(results.map(x => [x?.mediaId, x]));
  const missing = plan.mediaIds.filter(id => byId.get(id)?.deleted !== true || byId.get(id)?.verifiedAbsent !== true);
  if (missing.length) return { ...plan, state: 'PURGE_INCOMPLETE', missing };
  return {
    ...plan,
    state: 'PURGED_CONFIRMED',
    purgedAt: new Date(now).toISOString(),
    deletionNotification: plan.deletionNotification === 'QUEUE_AFTER_CONFIRMED_PURGE' ? 'READY_TO_SEND' : plan.deletionNotification
  };
}

export function buildMediaDeletionEmail({ requestId, privacyEmail, customerEmail }) {
  if (!nonBlank(requestId)) throw new Error('requestId is required.');
  if (!/^\S+@\S+\.\S+$/.test(customerEmail || '')) throw new Error('customerEmail is required.');
  if (!/^\S+@\S+\.\S+$/.test(privacyEmail || '')) throw new Error('Verified privacy email is required before deletion email can be sent.');
  return {
    to: customerEmail,
    subject: 'Your DROPi Home request media has been deleted',
    text: `The photos/videos associated with your custom furniture request ${requestId} have been removed from active storage because the request/work has been closed. We retain only any minimal non-media record that we are required or permitted to keep for the stated business/legal purpose. Questions about your data: ${privacyEmail}`
  };
}

export const CUSTOM_MEDIA_KINDS = Object.freeze([...MEDIA_KINDS]);
