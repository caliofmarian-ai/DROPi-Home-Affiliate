const STATES = new Set([
  'DRAFT_CUSTOMER_INPUT',
  'WAITING_FOR_CUSTOMER_INFO',
  'READY_FOR_HUMAN_REVIEW',
  'NEEDS_SITE_SURVEY',
  'NEEDS_CLARIFICATION',
  'POTENTIALLY_PRODUCIBLE',
  'DECLINED',
  'READY_FOR_QUOTATION',
  'QUOTED',
  'CUSTOMER_ACCEPTED',
  'CUSTOMER_DECLINED',
  'CLOSED'
]);

const TRANSITIONS = new Map([
  ['DRAFT_CUSTOMER_INPUT', new Set(['WAITING_FOR_CUSTOMER_INFO', 'READY_FOR_HUMAN_REVIEW', 'CLOSED'])],
  ['WAITING_FOR_CUSTOMER_INFO', new Set(['READY_FOR_HUMAN_REVIEW', 'CLOSED'])],
  ['READY_FOR_HUMAN_REVIEW', new Set(['NEEDS_SITE_SURVEY', 'NEEDS_CLARIFICATION', 'POTENTIALLY_PRODUCIBLE', 'DECLINED'])],
  ['NEEDS_SITE_SURVEY', new Set(['READY_FOR_HUMAN_REVIEW', 'DECLINED'])],
  ['NEEDS_CLARIFICATION', new Set(['WAITING_FOR_CUSTOMER_INFO', 'READY_FOR_HUMAN_REVIEW', 'DECLINED'])],
  ['POTENTIALLY_PRODUCIBLE', new Set(['NEEDS_SITE_SURVEY', 'NEEDS_CLARIFICATION', 'READY_FOR_QUOTATION', 'DECLINED'])],
  ['READY_FOR_QUOTATION', new Set(['QUOTED', 'NEEDS_CLARIFICATION', 'DECLINED'])],
  ['QUOTED', new Set(['CUSTOMER_ACCEPTED', 'CUSTOMER_DECLINED'])],
  ['CUSTOMER_ACCEPTED', new Set(['CLOSED'])],
  ['CUSTOMER_DECLINED', new Set(['CLOSED'])],
  ['DECLINED', new Set(['CLOSED'])],
  ['CLOSED', new Set()]
]);

const REVIEWER_ONLY_TARGETS = new Set(['NEEDS_SITE_SURVEY', 'NEEDS_CLARIFICATION', 'POTENTIALLY_PRODUCIBLE', 'DECLINED', 'READY_FOR_QUOTATION', 'QUOTED']);
const CUSTOMER_ONLY_TARGETS = new Set(['CUSTOMER_ACCEPTED', 'CUSTOMER_DECLINED']);
const DIMENSION_PROVENANCE = new Set(['CUSTOMER_TYPED', 'CUSTOMER_CONFIRMED', 'PHOTO_SUPPORTING_EVIDENCE', 'SITE_SURVEY_VERIFIED']);
const REVIEW_READY_PROVENANCE = new Set(['CUSTOMER_TYPED', 'CUSTOMER_CONFIRMED', 'SITE_SURVEY_VERIFIED']);
const ROUTES = new Set(['UNDECIDED', 'STANDARD_PRODUCT', 'CUSTOM_MANUFACTURING', 'INSTALLATION_ONLY']);
const ACTORS = new Set(['CUSTOMER', 'AI_INTAKE', 'HUMAN_REVIEWER', 'SYSTEM']);

function nonBlank(value) { return typeof value === 'string' && value.trim().length > 0; }
function validIso(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function evidenceApproved(record, evidenceExists) {
  return record?.approved === true && nonBlank(record.approvedBy) && validIso(record.approvedAt) && nonBlank(record.evidenceFile) && evidenceExists(record.evidenceFile);
}

export function validateCustomIntakePolicy(policy, evidenceExists = () => false) {
  const issues = [];
  if (!policy || typeof policy !== 'object') return ['Custom intake policy is required.'];
  if (!['FOUNDATION_ONLY', 'PRIVATE_PILOT_READY', 'ACTIVE'].includes(policy.status)) issues.push('Custom intake policy has invalid status.');
  for (const field of ['publicIntakeEnabled', 'structuredSubmissionEnabled', 'mediaUploadsEnabled', 'aiProcessingEnabled', 'manufacturerRoutingEnabled']) {
    if (typeof policy[field] !== 'boolean') issues.push(`${field} must be boolean.`);
  }
  if (policy.aiDataUse !== 'NO_TRAINING') issues.push('Customer intake data must remain NO_TRAINING unless a later explicit lawful model is approved.');

  if (policy.structuredSubmissionEnabled) {
    if (!nonBlank(policy.storageProvider) || policy.storageProvider === 'NOT_PROVISIONED') issues.push('Structured intake requires private persistent storage.');
    if (!Number.isInteger(policy.retentionDays) || policy.retentionDays < 1 || policy.retentionDays > 365) issues.push('Structured intake requires an approved retentionDays value from 1 to 365.');
    if (!nonBlank(policy.privacyNoticeVersion) || !nonBlank(policy.consentVersion)) issues.push('Structured intake requires versioned privacy notice and consent text.');
    if (!evidenceApproved(policy.privacyReview, evidenceExists)) issues.push('Structured intake privacy review is not approved/evidenced.');
  }
  if (policy.publicIntakeEnabled && !policy.structuredSubmissionEnabled) issues.push('Public intake cannot be enabled before structured submission is enabled.');
  if (policy.mediaUploadsEnabled) {
    if (!policy.structuredSubmissionEnabled) issues.push('Media uploads require structured submission first.');
    if (!nonBlank(policy.mediaStorageProvider) || policy.mediaStorageProvider === 'NOT_PROVISIONED') issues.push('Media uploads require private object storage.');
    if (!evidenceApproved(policy.processorReview, evidenceExists)) issues.push('Media uploads require processor/data-transfer review evidence.');
  }
  if (policy.aiProcessingEnabled) {
    if (!policy.structuredSubmissionEnabled) issues.push('AI processing requires structured submission first.');
    if (!evidenceApproved(policy.processorReview, evidenceExists)) issues.push('AI processing requires processor/data-transfer review evidence.');
  }
  if (policy.manufacturerRoutingEnabled && !evidenceApproved(policy.manufacturerAgreement, evidenceExists)) issues.push('Manufacturer routing requires a written commercial/data-sharing agreement.');
  return issues;
}

function validDimension(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 100000;
}

export function validateCustomIntakeRequest(request) {
  const issues = [];
  if (!request || typeof request !== 'object') return ['Custom intake request is required.'];
  if (!nonBlank(request.requestId) || !/^[A-Za-z0-9-]{8,80}$/.test(request.requestId)) issues.push('requestId is invalid.');
  if (!STATES.has(request.state)) issues.push('Request state is invalid.');
  if (!ROUTES.has(request.route || 'UNDECIDED')) issues.push('Request route is invalid.');
  if (request.createdAt != null && !validIso(request.createdAt)) issues.push('createdAt must be a valid timestamp.');
  if (request.contactEmail != null && (!nonBlank(request.contactEmail) || !/^\S+@\S+\.\S+$/.test(request.contactEmail))) issues.push('contactEmail is invalid.');
  if (request.contactPhone != null && (!nonBlank(request.contactPhone) || request.contactPhone.length > 40)) issues.push('contactPhone is invalid.');
  for (const field of ['roomType', 'furnitureType', 'serviceArea']) if (request[field] != null && (!nonBlank(request[field]) || request[field].length > 120)) issues.push(`${field} is invalid.`);
  for (const axis of ['widthMM', 'heightMM', 'depthMM']) if (request[axis] != null && !validDimension(request[axis])) issues.push(`${axis} is invalid.`);
  const provenance = request.measurementProvenance || {};
  for (const axis of ['width', 'height', 'depth']) if (provenance[axis] != null && !DIMENSION_PROVENANCE.has(provenance[axis])) issues.push(`measurementProvenance.${axis} is invalid.`);
  for (const field of ['obstacles', 'accessConstraints', 'materialPreferences', 'finishPreferences', 'missingInformation', 'riskFlags']) {
    if (request[field] != null && (!Array.isArray(request[field]) || request[field].some(x => !nonBlank(x) || x.length > 500))) issues.push(`${field} must be an array of bounded non-empty strings.`);
  }
  if (request.consent != null) {
    if (typeof request.consent.accepted !== 'boolean') issues.push('consent.accepted must be boolean.');
    if (request.consent.accepted && (!nonBlank(request.consent.version) || !nonBlank(request.consent.privacyNoticeVersion) || !validIso(request.consent.acceptedAt))) issues.push('Accepted consent requires versioned notice and timestamp evidence.');
  }
  if (request.mediaRefs != null && (!Array.isArray(request.mediaRefs) || request.mediaRefs.some(x => !nonBlank(x) || x.length > 250))) issues.push('mediaRefs must contain private storage references only.');
  for (const forbidden of ['finalQuoteEUR', 'manufacturingGuaranteed', 'bindingOrderAccepted', 'aiInferredWidthMM', 'aiInferredHeightMM', 'aiInferredDepthMM']) if (forbidden in request) issues.push(`AI intake request cannot contain forbidden field ${forbidden}.`);
  return issues;
}

export function missingForHumanReview(request, policy) {
  const missing = [];
  if (!request?.consent?.accepted) missing.push('consent');
  if (request?.consent?.accepted && policy) {
    if (request.consent.version !== policy.consentVersion) missing.push('current_consent_version');
    if (request.consent.privacyNoticeVersion !== policy.privacyNoticeVersion) missing.push('current_privacy_notice_version');
  }
  if (!nonBlank(request?.contactEmail) && !nonBlank(request?.contactPhone)) missing.push('customer_contact');
  for (const field of ['serviceArea', 'roomType', 'furnitureType']) if (!nonBlank(request?.[field])) missing.push(field);
  const provenance = request?.measurementProvenance || {};
  for (const [field, axis] of [['widthMM', 'width'], ['heightMM', 'height'], ['depthMM', 'depth']]) {
    if (!validDimension(request?.[field])) missing.push(field);
    if (!REVIEW_READY_PROVENANCE.has(provenance[axis])) missing.push(`${axis}_customer_confirmed_measurement`);
  }
  return [...new Set(missing)];
}

export function qualifyCustomIntake(request, policy) {
  const requestIssues = validateCustomIntakeRequest(request);
  const policyIssues = validateCustomIntakePolicy(policy, () => true);
  const missing = missingForHumanReview(request, policy);
  return {
    valid: requestIssues.length === 0 && policyIssues.length === 0,
    missing,
    suggestedState: missing.length ? 'WAITING_FOR_CUSTOMER_INFO' : 'READY_FOR_HUMAN_REVIEW',
    requestIssues,
    policyIssues
  };
}

export function intakeTransitionAllowed(from, to, actor) {
  if (!STATES.has(from) || !STATES.has(to) || !ACTORS.has(actor) || !TRANSITIONS.get(from)?.has(to)) return false;
  if (REVIEWER_ONLY_TARGETS.has(to) && actor !== 'HUMAN_REVIEWER') return false;
  if (CUSTOMER_ONLY_TARGETS.has(to) && actor !== 'CUSTOMER') return false;
  if (to === 'READY_FOR_HUMAN_REVIEW' && !['AI_INTAKE', 'HUMAN_REVIEWER', 'SYSTEM'].includes(actor)) return false;
  if (to === 'WAITING_FOR_CUSTOMER_INFO' && !['AI_INTAKE', 'HUMAN_REVIEWER', 'SYSTEM'].includes(actor)) return false;
  if (to === 'CLOSED' && !['HUMAN_REVIEWER', 'SYSTEM'].includes(actor)) return false;
  return true;
}

export function applyIntakeTransition(request, to, actor, policy) {
  if (!request || !STATES.has(request.state)) throw new Error('Request has invalid current state.');
  if (!intakeTransitionAllowed(request.state, to, actor)) throw new Error(`Invalid intake transition ${request.state} -> ${to} by ${actor}.`);
  if (to === 'READY_FOR_HUMAN_REVIEW') {
    const missing = missingForHumanReview(request, policy);
    if (missing.length) throw new Error(`Request is not review-ready: ${missing.join(', ')}.`);
  }
  return { ...request, state: to };
}

export function validateAiIntakeOutput(output) {
  if (!output || typeof output !== 'object' || Array.isArray(output)) return ['AI intake output must be an object.'];
  const issues = [];
  const forbidden = ['finalQuoteEUR', 'pricePromise', 'manufacturingGuaranteed', 'structuralSafetyApproved', 'bindingOrderAccepted', 'factoryAccepted'];
  for (const key of forbidden) if (key in output) issues.push(`AI output cannot set ${key}.`);
  if (output.measurements && Object.values(output.measurements).some(x => x?.provenance === 'AI_INFERRED')) issues.push('AI-inferred dimensions cannot become contract-critical measurements.');
  return issues;
}

export const CUSTOM_INTAKE_STATES = Object.freeze([...STATES]);
