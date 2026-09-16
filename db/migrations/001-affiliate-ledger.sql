CREATE SCHEMA IF NOT EXISTS dropi_ops;
REVOKE ALL ON SCHEMA dropi_ops FROM PUBLIC;

CREATE TABLE IF NOT EXISTS dropi_ops.affiliate_ledger_current (
  provider text NOT NULL CHECK (provider IN ('awin','ebay','amazon')),
  transaction_id text NOT NULL CHECK (transaction_id ~ '^[A-Za-z0-9_.-]{1,120}$'),
  status text NOT NULL CHECK (status IN ('PENDING','APPROVED','PAID','REVERSED')),
  commission_cents bigint NOT NULL CHECK (commission_cents >= 0),
  currency char(3) NOT NULL CHECK (currency = 'EUR'),
  updated_at timestamptz NOT NULL,
  statement_ref text NOT NULL CHECK (statement_ref ~ '^[A-Za-z0-9_.-]{1,120}$'),
  ever_paid boolean NOT NULL DEFAULT false,
  imported_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, transaction_id)
);

CREATE TABLE IF NOT EXISTS dropi_ops.affiliate_sync_state (
  provider text PRIMARY KEY CHECK (provider IN ('awin','ebay','amazon')),
  cursor_text text,
  window_start timestamptz,
  window_end timestamptz,
  last_success_at timestamptz,
  last_statement_ref text CHECK (last_statement_ref IS NULL OR last_statement_ref ~ '^[A-Za-z0-9_.-]{1,120}$'),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (window_start IS NULL OR window_end IS NULL OR window_start <= window_end)
);

CREATE INDEX IF NOT EXISTS affiliate_ledger_current_status_idx
  ON dropi_ops.affiliate_ledger_current (provider, status, updated_at DESC);

REVOKE ALL ON ALL TABLES IN SCHEMA dropi_ops FROM PUBLIC;
