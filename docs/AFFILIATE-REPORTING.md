# Affiliate Reporting and Ledger

Status: REPOSITORY IMPLEMENTED / REAL ACCOUNTS NOT CONNECTED

The reporting layer exists so DROPi Home can reconcile commissions without storing buyer names, email addresses, postal addresses, order contents or other customer identity fields.

## Canonical event shape

Every provider adapter emits only:

```text
provider
transactionId
status
commissionCents
currency
updatedAt
statementRef
```

Allowed states are `PENDING`, `APPROVED`, `PAID`, `REVERSED`.

The generic ledger remains idempotent, refuses stale rewinds, separates approved-unpaid from paid cash and records paid-then-reversed commission as a clawback.

## Awin

Implemented:

- `scripts/fetch-awin-transactions.mjs`
- fetches both transaction-date and amendment-date windows;
- maximum 31-day API window;
- defaults to the most recent 30 days when no explicit range is provided;
- requests no basket-product detail;
- normalises provider transaction states into the DROPi ledger shape;
- output is restricted to ignored `private/` files;
- account credentials absent = clean no-op.

This is ready for the real Awin publisher ID/token after account acceptance.

## eBay Partner Network

Implemented:

- `scripts/normalise-ebay-tdr.mjs`
- parses an EPN Transaction Detail Report CSV;
- retains only transaction ID, status, earnings and update time;
- ignores landing-page, campaign-description and other non-ledger fields;
- output stays under ignored `private/`;
- EUR-only in ledger v1.

A fully automated EPN report-download step is intentionally deferred until a real EPN account exposes the exact reporting method/credentials available to this account. Normalisation and idempotent ledger ingestion are already provider-independent.

## Operational persistence

The repository includes `db/migrations/001-affiliate-ledger.sql` for Neon operational persistence.

It creates private `dropi_ops` tables containing only:

- provider;
- transaction ID;
- commission state/amount/currency;
- provider update timestamp;
- statement reference;
- whether the transaction was ever paid;
- sync cursor/window metadata.

There are deliberately no customer identity columns.

The migration has been tested on a temporary Neon branch. Applying it to the production database requires explicit owner approval. Until then, real report files must remain private and outside GitHub.

## What reporting does not prove

A report adapter existing does not prove:

- an affiliate account has been accepted;
- a sale occurred;
- a commission was approved;
- money was paid;
- the projected business model is profitable.

Only real provider statements and reconciled payouts count as business evidence.
