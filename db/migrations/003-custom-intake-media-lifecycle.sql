BEGIN;

ALTER TABLE dropi_ops.custom_intake_media
  ADD COLUMN IF NOT EXISTS guidance_version text,
  ADD COLUMN IF NOT EXISTS media_consent_version text,
  ADD COLUMN IF NOT EXISTS media_consent_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_attestation_accepted boolean,
  ADD COLUMN IF NOT EXISTS deletion_trigger text NOT NULL DEFAULT 'REQUEST_TERMINAL_CLOSE',
  ADD COLUMN IF NOT EXISTS deletion_reason text,
  ADD COLUMN IF NOT EXISTS purge_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_notification_status text NOT NULL DEFAULT 'NOT_READY',
  ADD COLUMN IF NOT EXISTS deletion_notification_sent_at timestamptz;

ALTER TABLE dropi_ops.custom_intake_media
  DROP CONSTRAINT IF EXISTS custom_intake_media_guidance_consent,
  ADD CONSTRAINT custom_intake_media_guidance_consent CHECK (
    guidance_version IS NOT NULL AND length(btrim(guidance_version)) > 0 AND
    media_consent_version IS NOT NULL AND length(btrim(media_consent_version)) > 0 AND
    media_consent_accepted_at IS NOT NULL AND
    privacy_attestation_accepted = true
  );

ALTER TABLE dropi_ops.custom_intake_media
  DROP CONSTRAINT IF EXISTS custom_intake_media_delete_trigger,
  ADD CONSTRAINT custom_intake_media_delete_trigger CHECK (
    deletion_trigger = 'REQUEST_TERMINAL_CLOSE'
  );

ALTER TABLE dropi_ops.custom_intake_media
  DROP CONSTRAINT IF EXISTS custom_intake_media_notification_status,
  ADD CONSTRAINT custom_intake_media_notification_status CHECK (
    deletion_notification_status IN ('NOT_READY','READY_TO_SEND','SENT','FAILED','NO_EMAIL_AVAILABLE')
  );

ALTER TABLE dropi_ops.custom_intake_media
  DROP CONSTRAINT IF EXISTS custom_intake_media_verified_delete,
  ADD CONSTRAINT custom_intake_media_verified_delete CHECK (
    processing_status <> 'DELETED' OR (
      deleted_at IS NOT NULL AND
      purge_verified_at IS NOT NULL AND
      deletion_reason IS NOT NULL AND length(btrim(deletion_reason)) > 0
    )
  );

CREATE INDEX IF NOT EXISTS custom_intake_media_notification_idx
  ON dropi_ops.custom_intake_media (deletion_notification_status, purge_verified_at)
  WHERE deletion_notification_status IN ('READY_TO_SEND','FAILED');

COMMIT;
