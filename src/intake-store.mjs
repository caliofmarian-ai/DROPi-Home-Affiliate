import { randomUUID } from 'node:crypto';
import postgres from 'postgres';
import { validateCustomIntakeRequest, missingForHumanReview } from './custom-intake.mjs';

const DAY = 86_400_000;
const clean = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const optional = (value, max = 500) => clean(value, max) || null;
const bool = value => value === true || value === 'true' || value === 'on' || value === 'yes';
function positiveNumber(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 100000 ? n : null;
}
function lines(value, maxItems = 30) {
  if (Array.isArray(value)) return value.map(x => clean(x)).filter(Boolean).slice(0, maxItems);
  return String(value || '').split(/\r?\n/).map(x => clean(x)).filter(Boolean).slice(0, maxItems);
}
function requiredPolicy(policy) {
  if (!policy?.structuredSubmissionEnabled) throw new Error('Structured intake is not enabled by policy.');
  if (!Number.isInteger(policy.retentionDays) || policy.retentionDays < 1 || policy.retentionDays > 365) throw new Error('An approved retention period is required.');
  if (!clean(policy.privacyNoticeVersion, 120) || !clean(policy.consentVersion, 120)) throw new Error('Versioned privacy notice and consent text are required.');
}

export function prepareTextIntake(input, policy, now = new Date()) {
  requiredPolicy(policy);
  if (!bool(input?.consentAccepted)) throw new Error('Explicit consent is required before storing an intake request.');
  const acceptedAt = new Date(now).toISOString();
  const widthMM = positiveNumber(input?.widthMM);
  const heightMM = positiveNumber(input?.heightMM);
  const depthMM = positiveNumber(input?.depthMM);
  const request = {
    requestId: `DH-${randomUUID().replaceAll('-', '').slice(0, 24)}`,
    state: 'DRAFT_CUSTOMER_INPUT',
    route: 'UNDECIDED',
    createdAt: acceptedAt,
    contactEmail: optional(input?.contactEmail, 320),
    contactPhone: optional(input?.contactPhone, 40),
    serviceArea: optional(input?.serviceArea, 120),
    roomType: optional(input?.roomType, 120),
    furnitureType: optional(input?.furnitureType, 120),
    widthMM,
    heightMM,
    depthMM,
    measurementProvenance: {
      width: widthMM == null ? null : 'CUSTOMER_TYPED',
      height: heightMM == null ? null : 'CUSTOMER_TYPED',
      depth: depthMM == null ? null : 'CUSTOMER_TYPED'
    },
    obstacles: lines(input?.obstacles),
    accessConstraints: lines(input?.accessConstraints),
    materialPreferences: lines(input?.materialPreferences),
    finishPreferences: lines(input?.finishPreferences),
    missingInformation: [],
    riskFlags: [],
    budgetRange: optional(input?.budgetRange, 120),
    targetDate: optional(input?.targetDate, 20),
    deliveryRequired: bool(input?.deliveryRequired),
    fittingRequired: bool(input?.fittingRequired),
    customerNotes: optional(input?.customerNotes, 5000),
    consent: {
      accepted: true,
      version: policy.consentVersion,
      privacyNoticeVersion: policy.privacyNoticeVersion,
      acceptedAt
    }
  };
  const issues = validateCustomIntakeRequest(request);
  if (issues.length) throw new Error(issues.join(' '));
  const missing = missingForHumanReview(request, policy);
  request.missingInformation = missing;
  request.state = missing.length ? 'WAITING_FOR_CUSTOMER_INFO' : 'READY_FOR_HUMAN_REVIEW';
  const deleteAfter = new Date(new Date(now).getTime() + policy.retentionDays * DAY).toISOString();
  return { request, deleteAfter };
}

export function createIntakeStore(connectionString = process.env.INTAKE_DATABASE_URL) {
  if (!connectionString) return null;
  const sql = postgres(connectionString, { max: 2, idle_timeout: 20, connect_timeout: 8, prepare: true });
  return {
    async status() {
      const [row] = await sql`
        SELECT
          (SELECT count(*)::int FROM dropi_ops.custom_intake_requests) AS requests,
          (SELECT count(*)::int FROM dropi_ops.custom_intake_requests WHERE state = 'READY_FOR_HUMAN_REVIEW') AS ready_for_review,
          (SELECT count(*)::int FROM dropi_ops.custom_intake_events) AS events
      `;
      return row;
    },
    async createTextRequest(input, policy, now = new Date()) {
      const { request, deleteAfter } = prepareTextIntake(input, policy, now);
      await sql.begin(async tx => {
        await tx`
          INSERT INTO dropi_ops.custom_intake_requests (
            request_id, state, route, created_at, updated_at,
            contact_email, contact_phone, service_area, room_type, furniture_type,
            width_mm, height_mm, depth_mm, width_provenance, height_provenance, depth_provenance,
            obstacles, access_constraints, material_preferences, finish_preferences,
            missing_information, risk_flags, budget_range, target_date,
            delivery_required, fitting_required, customer_notes,
            consent_accepted, consent_version, privacy_notice_version, consent_accepted_at,
            retention_delete_after
          ) VALUES (
            ${request.requestId}, ${request.state}, ${request.route}, ${request.createdAt}, ${request.createdAt},
            ${request.contactEmail}, ${request.contactPhone}, ${request.serviceArea}, ${request.roomType}, ${request.furnitureType},
            ${request.widthMM}, ${request.heightMM}, ${request.depthMM}, ${request.measurementProvenance.width}, ${request.measurementProvenance.height}, ${request.measurementProvenance.depth},
            ${tx.json(request.obstacles)}, ${tx.json(request.accessConstraints)}, ${tx.json(request.materialPreferences)}, ${tx.json(request.finishPreferences)},
            ${tx.json(request.missingInformation)}, ${tx.json(request.riskFlags)}, ${request.budgetRange}, ${request.targetDate || null},
            ${request.deliveryRequired}, ${request.fittingRequired}, ${request.customerNotes},
            true, ${request.consent.version}, ${request.consent.privacyNoticeVersion}, ${request.consent.acceptedAt},
            ${deleteAfter}
          )
        `;
        await tx`
          INSERT INTO dropi_ops.custom_intake_events (request_id, from_state, to_state, actor_type, reason_code)
          VALUES (${request.requestId}, NULL, ${request.state}, 'SYSTEM', 'TEXT_INTAKE_CREATED')
        `;
      });
      return { requestId: request.requestId, state: request.state, missingInformation: request.missingInformation, deleteAfter };
    },
    async close() { await sql.end({ timeout: 2 }); }
  };
}
