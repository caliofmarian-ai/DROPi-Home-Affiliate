# Execution backlog

These are repository-local work items, not claims that external commercial accounts, suppliers or the current employer are approved.

Owner-approved priority: **take employer-independent commerce to its truthful external-blocker boundary, then implement `Custom Furniture AI Intake`, with `Who Fits It` later.**

| ID | Work item | Current state | Done when |
| --- | --- | --- | --- |
| AF-001 | Standalone site + editorial foundation | IMPLEMENTED | Real editorial/publication approval |
| AF-002 | Source register, catalogue, search, fit checker | IMPLEMENTED / TESTED | Exact live offers mapped |
| AF-003 | Safe affiliate programme/link configuration | IMPLEMENTED FOUNDATION | Real provider approvals/evidence connected |
| AF-004 | Affiliate reporting + ledger | SCHEMA + NORMALISERS IMPLEMENTED | Real provider statements/payouts connected |
| AF-005 | Private GitHub repository | COMPLETE | Canonical source remains GitHub |
| AF-006 | Railway private preview | COMPLETE | Public launch remains separate |
| AF-007 | SUPER_ADMIN authentication | COMPLETE V1 | Future restricted-user invitation UI later |
| AF-008 | Product-media rights pipeline | IMPLEMENTED FOUNDATION | Real authorised media arrives from providers |
| AF-009 | Awin feed/link/reporting automation | IMPLEMENTED / NOT CONFIGURED | Real Awin acceptance and secrets/mappings supplied |
| AF-010 | Amazon.ie foundation | POLICY/CACHE FOUNDATION COMPLETE | Real account/API access enables live adapter |
| AF-011 | eBay/EPN adapter | IMPLEMENTED / NOT CONFIGURED | Real EPN credentials/campaign supplied |
| AF-012 | Commercial offer approval gate | IMPLEMENTED | Real offers exist to approve/revoke |
| AF-013 | Ireland/EU legal release gate | IMPLEMENTED / PUBLIC RELEASE HOLD | Real operator/tax/privacy/brand/editorial facts pass |
| AF-014 | Accessibility baseline/EAA scope gate | IMPLEMENTED BASELINE / SCOPE HOLD | Real operator/service facts reviewed |
| AF-015 | SEO/public launch | HOLD | Legal/publication gates pass |
| AF-016 | Analytics/conversion measurement | HOLD | Consent-compliant implementation approved |
| AF-017 | Dropshipping supplier qualification | IMPLEMENTED FOUNDATION / SELLING DISABLED | Real supplier passes all gates |
| AF-018 | Dropshipping exact-SKU compliance | IMPLEMENTED / EMPTY REGISTRY | Real SKUs pass GPSR/import/EPR/category/sample/margin gates |
| AF-019 | Independent commerce handoff | **EXTERNAL-BLOCKER BOUNDARY REACHED** | Remaining work requires real accounts, counterparties, suppliers or owner legal/publication decisions |
| LF-001 | Custom Furniture AI Intake | **PRIVATE DATA FOUNDATION IMPLEMENTED / COLLECTION OFF** | Controller/privacy/processor/contact gates pass, then private text pilot can be deliberately staged |
| LF-002 | Text-only intake persistence | IMPLEMENTED / ACTIVATION HOLD | Verified controller/contact + final privacy wording + processor review + deliberate activation |
| LF-003 | Privacy/consent/retention | **30-DAY TEXT RETENTION + ARTICLE 6(1)(a) CONSENT OWNER-APPROVED** | Final controller identity/contact and processor/privacy evidence are verified |
| LF-004 | Data-subject access/erasure procedure | **VERIFIED FOR PRIVATE PILOT FOUNDATION** | Keep procedure tested as UI/flows evolve |
| LF-005 | Photo/video guided intake | **PRIVATE STORAGE + SCHEMA + POLICY FOUNDATION COMPLETE / UPLOADS OFF** | Media privacy/processor review + verified privacy email + controlled upload route |
| LF-006 | AI text/voice/media processing | HOLD | Processor/data-use review + private structured intake approved |
| LF-007 | Human reviewer queue | NEXT AFTER TEXT PILOT | Restricted reviewer role and queue available |
| LF-008 | Manufacturing referral route | HOLD | Written manufacturing/referral/data agreement exists |
| LF-009 | Who Fits It | HOLD | Separate fitting governance + real partners |

## Current verified checkpoint

Railway remains a private authenticated preview. The media-policy checkpoint passed **184/184 tests, 0 failures** before the latest retention/storage reconciliation changes; every subsequent deployment remains subject to the same build-time test gate.

Affiliate monetisation, consumer checkout, dropshipping selling, conversion tracking and all real Custom Furniture customer-data collection/media uploads remain disabled.

## Production data and media foundation

The production Neon database contains the privacy-minimised affiliate ledger/sync schema plus:

- `dropi_ops.custom_intake_requests`;
- `dropi_ops.custom_intake_media`;
- `dropi_ops.custom_intake_events`.

Public database access is revoked. Runtime text-intake access uses a dedicated least-privilege database role. Retention/erasure uses a separate maintenance role. Automated retention remains disabled with `INTAKE_RETENTION_EXECUTE=false`.

`db/migrations/003-custom-intake-media-lifecycle.sql` was tested on an isolated migration branch and, after explicit owner approval, applied successfully to production on 2026-09-17. Its temporary branch was deleted automatically.

Neon private Object Storage is now provisioned in `eu-central-1` with private bucket `dropi-custom-intake-media`. A dedicated storage credential with only `storage:read` and `storage:write` scopes is stored as Railway secrets. `MEDIA_UPLOADS_ENABLED=false` remains in force.

## Independent commerce boundary

Repository-controlled foundations are built as far as they can truthfully go without external facts. Remaining independent-commerce blockers include:

- Awin/Amazon/eBay acceptance, IDs, credentials and exact mappings;
- real paying counterparty/VAT treatment;
- KYC/tax/payout/bank setup;
- real operator/trading-name/business-address evidence;
- privacy/hosting/brand/editorial/publication approvals;
- real dropship supplier contract, exact SKUs, sample orders and compliance evidence;
- deliberate public-launch decision.

No fake fixture may satisfy these production gates.

## Custom Furniture AI Intake — canonical implementation stream

Canonical design: `docs/CUSTOM-FURNITURE-AI-INTAKE.md`.
Privacy/consent design: `docs/CUSTOM-INTAKE-PRIVACY-DRAFT.md`.
Photo/video lifecycle: `docs/CUSTOM-INTAKE-MEDIA-POLICY.md`.
Processor review: `docs/CUSTOM-INTAKE-PROCESSOR-REVIEW.md`.
Sole-trader operator checklist: `docs/OPERATOR-SOLE-TRADER-IRELAND.md`.
Production base schema: `db/migrations/002-custom-intake.sql`.
Production media lifecycle schema: `db/migrations/003-custom-intake-media-lifecycle.sql`.
Owner retention/privacy evidence: `docs/evidence/owner-custom-intake-retention-consent-approval-2026-09-17.md`.
Owner operator/media evidence: `docs/evidence/owner-custom-intake-operator-media-decisions-2026-09-17.md`.
Owner media/erasure approval: `docs/evidence/owner-custom-intake-media-erasure-approval-2026-09-17.md`.
Rights-access evidence: `docs/evidence/custom-intake-rights-access-verification-2026-09-17.md`.
Rights-erasure evidence: `docs/evidence/custom-intake-rights-erasure-verification-2026-09-17.md`.

Implemented now:

- production private request/media/event schema;
- separate least-privilege application and retention/erasure database roles;
- fail-closed feature policy;
- text-only request preparation/persistence logic;
- owner-approved Article 6(1)(a) consent model for the private text pilot;
- owner-approved 30-day retention for unconverted text-pilot submissions;
- planned controller model: Project Owner as individual/sole trader;
- dedicated privacy email intentionally pending rather than invented;
- versioned draft privacy notice and text consent;
- request/state validation and measurement provenance;
- strict target-date validation;
- human-review readiness checks and actor-specific state transitions;
- access/export service requiring request ID + matching contact;
- synthetic access verification and synthetic erasure verification on isolated Neon branches;
- synthetic erasure left `remaining = 0`; the rights-verification branch was then deleted;
- privacy-first photo/video capture guidance and separate media-consent contract;
- private EU-region object storage foundation and scoped runtime credential;
- production media-lifecycle schema for consent versioning, verified purge and deletion-email status;
- media lifecycle rule: completion/cancellation/decline/other terminal closure requires purge;
- owner-approved **30-day inactivity fallback** for abandoned **pre-contract** media;
- accepted/active work is not silently purged merely because 30 days elapsed;
- deletion email can only be queued after every media object is verified absent;
- critical dimensions cannot become authoritative from AI/photo inference alone;
- AI cannot approve producibility, final quote, structural safety, decline or binding orders;
- `NO_TRAINING` default for all customer intake/media.

Still disabled:

- real customer submission;
- public or private-pilot form activation;
- photo/video upload;
- standalone voice/audio upload;
- AI processing of customer data/media;
- manufacturer/employer forwarding;
- quotation/order acceptance;
- automated retention/media purge execution;
- deletion-confirmation email sending;
- `Who Fits It`.

## Current privacy/legal statuses

- `lawfulBasisStatus = CONSENT_APPROVED` for the private text-only pilot;
- `controllerModel = INDIVIDUAL_SOLE_TRADER_PLANNED`;
- `controllerIdentityStatus = PENDING_REGISTRATION_AND_PUBLIC_DETAILS`;
- `privacyContactStatus = PENDING_DEDICATED_EMAIL`;
- `rightsProcedureStatus = VERIFIED`;
- `mediaStorageProvider = NEON_PRIVATE_OBJECT_STORAGE_EU_CENTRAL_1`;
- `mediaFallbackRetentionStatus = APPROVED`;
- `abandonedMediaRetentionDays = 30`;
- `deletionEmailStatus = MISSING`;
- `privacyReview.approved = false`;
- `mediaPrivacyReview.approved = false`;
- `processorReview.approved = false`;
- `manufacturerAgreement.approved = false`.

The processor review records that regional storage placement is not treated as a complete GDPR processor/transfer review. Railway/Neon agreement and transfer evidence must be retained before customer activation.

## Rights verification

The synthetic rights request was deleted only after explicit owner approval. A follow-up query returned zero rows for that request, and the isolated rights-verification branch was deleted. Production customer data, production auth and the SUPER_ADMIN account were not touched.

## Media privacy / lifecycle boundary

The owner approved future photo/video capability with separate consent and privacy guidance. Customers must be instructed to capture only what is needed and avoid people/children, faces/reflections, identity documents, mail, screens, family photos, medical/financial documents and unrelated private content.

Primary rule: original media is deleted after the related job/request is terminally closed and a deletion-confirmation email is sent only after the purge has been technically verified.

Fallback rule: media attached to an abandoned pre-contract request is purged after **30 days of inactivity**. Active accepted work does not inherit this inactivity purge.

## Safety rule

Implementation capability does not equal permission to activate it. Real customer data can only be collected after storage, retention, privacy, processor, lawful-basis, controller/contact and rights gates have real evidence. Manufacturer routing remains impossible until a written agreement exists.

## Commercial validation rule

Do not optimise for catalogue size. Prefer a small number of exact, Ireland-relevant, legally supportable offers with authorised media and measurable contribution. Hypothetical calculator results are not revenue evidence.
