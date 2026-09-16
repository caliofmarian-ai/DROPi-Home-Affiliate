BEGIN;

CREATE SCHEMA IF NOT EXISTS dropi_ops;

CREATE TABLE IF NOT EXISTS dropi_ops.custom_intake_requests (
  request_id text PRIMARY KEY CHECK (request_id ~ '^[A-Za-z0-9-]{8,80}$'),
  state text NOT NULL CHECK (state IN (
    'DRAFT_CUSTOMER_INPUT','WAITING_FOR_CUSTOMER_INFO','READY_FOR_HUMAN_REVIEW',
    'NEEDS_SITE_SURVEY','NEEDS_CLARIFICATION','POTENTIALLY_PRODUCIBLE','DECLINED',
    'READY_FOR_QUOTATION','QUOTED','CUSTOMER_ACCEPTED','CUSTOMER_DECLINED','CLOSED'
  )),
  route text NOT NULL DEFAULT 'UNDECIDED' CHECK (route IN ('UNDECIDED','STANDARD_PRODUCT','CUSTOM_MANUFACTURING','INSTALLATION_ONLY')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  contact_email text,
  contact_phone text,
  service_area text,
  room_type text,
  furniture_type text,

  width_mm numeric(10,2) CHECK (width_mm IS NULL OR (width_mm > 0 AND width_mm <= 100000)),
  height_mm numeric(10,2) CHECK (height_mm IS NULL OR (height_mm > 0 AND height_mm <= 100000)),
  depth_mm numeric(10,2) CHECK (depth_mm IS NULL OR (depth_mm > 0 AND depth_mm <= 100000)),
  width_provenance text CHECK (width_provenance IS NULL OR width_provenance IN ('CUSTOMER_TYPED','CUSTOMER_CONFIRMED','PHOTO_SUPPORTING_EVIDENCE','SITE_SURVEY_VERIFIED')),
  height_provenance text CHECK (height_provenance IS NULL OR height_provenance IN ('CUSTOMER_TYPED','CUSTOMER_CONFIRMED','PHOTO_SUPPORTING_EVIDENCE','SITE_SURVEY_VERIFIED')),
  depth_provenance text CHECK (depth_provenance IS NULL OR depth_provenance IN ('CUSTOMER_TYPED','CUSTOMER_CONFIRMED','PHOTO_SUPPORTING_EVIDENCE','SITE_SURVEY_VERIFIED')),

  obstacles jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(obstacles) = 'array'),
  access_constraints jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(access_constraints) = 'array'),
  material_preferences jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(material_preferences) = 'array'),
  finish_preferences jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(finish_preferences) = 'array'),
  missing_information jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(missing_information) = 'array'),
  risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(risk_flags) = 'array'),

  budget_range text,
  target_date date,
  delivery_required boolean,
  fitting_required boolean,
  customer_notes text,
  transcript text,
  ai_summary text,
  reviewer_notes text,

  consent_accepted boolean NOT NULL DEFAULT false,
  consent_version text,
  privacy_notice_version text,
  consent_accepted_at timestamptz,
  retention_delete_after timestamptz,

  CONSTRAINT custom_intake_consent_evidence CHECK (
    consent_accepted = false OR (
      consent_version IS NOT NULL AND length(btrim(consent_version)) > 0 AND
      privacy_notice_version IS NOT NULL AND length(btrim(privacy_notice_version)) > 0 AND
      consent_accepted_at IS NOT NULL
    )
  ),
  CONSTRAINT custom_intake_contact_present CHECK (
    contact_email IS NULL OR length(contact_email) <= 320
  ),
  CONSTRAINT custom_intake_phone_bounded CHECK (
    contact_phone IS NULL OR length(contact_phone) <= 40
  )
);

CREATE INDEX IF NOT EXISTS custom_intake_requests_review_queue_idx
  ON dropi_ops.custom_intake_requests (state, updated_at DESC);
CREATE INDEX IF NOT EXISTS custom_intake_requests_retention_idx
  ON dropi_ops.custom_intake_requests (retention_delete_after)
  WHERE retention_delete_after IS NOT NULL;

CREATE TABLE IF NOT EXISTS dropi_ops.custom_intake_media (
  media_id text PRIMARY KEY CHECK (media_id ~ '^[A-Za-z0-9-]{8,100}$'),
  request_id text NOT NULL REFERENCES dropi_ops.custom_intake_requests(request_id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('PHOTO','VIDEO','AUDIO')),
  storage_key text NOT NULL CHECK (
    length(storage_key) BETWEEN 8 AND 500 AND
    storage_key !~* '^(https?|ftp)://'
  ),
  mime_type text NOT NULL CHECK (length(mime_type) BETWEEN 3 AND 120),
  size_bytes bigint NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 524288000),
  sha256_hex text NOT NULL CHECK (sha256_hex ~ '^[a-f0-9]{64}$'),
  processing_status text NOT NULL DEFAULT 'NOT_REQUESTED' CHECK (processing_status IN ('NOT_REQUESTED','QUEUED','PROCESSING','COMPLETED','FAILED','DELETED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  delete_after timestamptz NOT NULL,
  deleted_at timestamptz,
  CONSTRAINT custom_intake_media_retention CHECK (delete_after > created_at)
);

CREATE INDEX IF NOT EXISTS custom_intake_media_request_idx
  ON dropi_ops.custom_intake_media (request_id, created_at);
CREATE INDEX IF NOT EXISTS custom_intake_media_retention_idx
  ON dropi_ops.custom_intake_media (delete_after)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS dropi_ops.custom_intake_events (
  event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  request_id text NOT NULL REFERENCES dropi_ops.custom_intake_requests(request_id) ON DELETE CASCADE,
  from_state text,
  to_state text NOT NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('CUSTOMER','AI_INTAKE','HUMAN_REVIEWER','SYSTEM')),
  actor_ref text,
  reason_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (from_state IS NULL OR from_state IN (
    'DRAFT_CUSTOMER_INPUT','WAITING_FOR_CUSTOMER_INFO','READY_FOR_HUMAN_REVIEW',
    'NEEDS_SITE_SURVEY','NEEDS_CLARIFICATION','POTENTIALLY_PRODUCIBLE','DECLINED',
    'READY_FOR_QUOTATION','QUOTED','CUSTOMER_ACCEPTED','CUSTOMER_DECLINED','CLOSED'
  )),
  CHECK (to_state IN (
    'DRAFT_CUSTOMER_INPUT','WAITING_FOR_CUSTOMER_INFO','READY_FOR_HUMAN_REVIEW',
    'NEEDS_SITE_SURVEY','NEEDS_CLARIFICATION','POTENTIALLY_PRODUCIBLE','DECLINED',
    'READY_FOR_QUOTATION','QUOTED','CUSTOMER_ACCEPTED','CUSTOMER_DECLINED','CLOSED'
  ))
);

CREATE INDEX IF NOT EXISTS custom_intake_events_request_idx
  ON dropi_ops.custom_intake_events (request_id, created_at);

REVOKE ALL ON dropi_ops.custom_intake_requests FROM PUBLIC;
REVOKE ALL ON dropi_ops.custom_intake_media FROM PUBLIC;
REVOKE ALL ON dropi_ops.custom_intake_events FROM PUBLIC;
REVOKE ALL ON SEQUENCE dropi_ops.custom_intake_events_event_id_seq FROM PUBLIC;

COMMIT;
