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
| LF-001 | Custom Furniture AI Intake | **PRIVATE DATA FOUNDATION IMPLEMENTED / COLLECTION OFF** | Controller/privacy/processor/rights gates pass, then private text pilot can be deliberately staged |
| LF-002 | Text-only intake persistence | IMPLEMENTED / ACTIVATION HOLD | Final privacy notice + controller identity + lawful basis + processor review + pilot activation |
| LF-003 | Privacy/consent/retention | **30-DAY RETENTION OWNER-APPROVED / DRAFT VERSIONED** | Final controller details, consent basis and processor review are approved |
| LF-004 | Data-subject access/erasure procedure | **ACCESS VERIFIED / ERASURE TEST PENDING** | Synthetic erasure is verified and procedure evidence is accepted |
| LF-005 | AI text/voice intake | HOLD | Processor review + private structured intake approved |
| LF-006 | Photo/video guided measurement intake | HOLD | Private object storage + processor/privacy review approved |
| LF-007 | Human reviewer queue | NEXT AFTER TEXT PILOT | Restricted reviewer role and queue available |
| LF-008 | Manufacturing referral route | HOLD | Written manufacturing/referral/data agreement exists |
| LF-009 | Who Fits It | HOLD | Separate fitting governance + real partners |

## Current verified checkpoint

Railway remains a private authenticated preview. The latest verified deployment passes **177/177 tests, 0 failures** after the production Custom Furniture schema, text-only persistence foundation, 30-day retention foundation, enhanced privacy/lawful-basis/controller gates and rights-service implementation were added.

Affiliate monetisation, consumer checkout, dropshipping selling, conversion tracking and Custom Furniture customer-data collection all remain disabled.

The production Neon database contains:

- the privacy-minimised affiliate ledger/sync schema;
- `dropi_ops.custom_intake_requests`;
- `dropi_ops.custom_intake_media`;
- `dropi_ops.custom_intake_events`.

The Custom Furniture tables were verified empty immediately after migration. Public access is revoked. Runtime text-intake access uses a dedicated least-privilege database role and receives no media-table access. Retention/erasure uses a separate maintenance role and automated retention remains disabled with `INTAKE_RETENTION_EXECUTE=false`.

## Independent commerce boundary

Repository-controlled foundations are built as far as they can truthfully go without external facts. Remaining independent-commerce blockers include:

- Awin/Amazon/eBay acceptance, IDs, credentials and exact mappings;
- real paying counterparty/VAT treatment;
- KYC/tax/payout/bank setup;
- real operator/trading-name/business-address decision;
- privacy/hosting/brand/editorial/publication approvals;
- real dropship supplier contract, exact SKUs, sample orders and compliance evidence;
- deliberate public-launch decision.

No fake fixture may satisfy these production gates.

## Custom Furniture AI Intake — active implementation stream

Canonical design: `docs/CUSTOM-FURNITURE-AI-INTAKE.md`.
Privacy/consent design: `docs/CUSTOM-INTAKE-PRIVACY-DRAFT.md`.
Processor review: `docs/CUSTOM-INTAKE-PROCESSOR-REVIEW.md`.
Production schema: `db/migrations/002-custom-intake.sql`.
Owner retention/privacy evidence: `docs/evidence/owner-custom-intake-retention-consent-approval-2026-09-17.md`.
Rights-access evidence: `docs/evidence/custom-intake-rights-access-verification-2026-09-17.md`.

Implemented now:

- production private request/media/event schema;
- separate least-privilege application and retention/erasure database roles;
- fail-closed feature policy;
- text-only request preparation/persistence logic;
- explicit affirmative acknowledgement/consent gate before storage;
- versioned draft privacy notice and consent text;
- owner-approved 30-day unconverted-pilot retention rule;
- disabled-by-default retention deletion worker;
- request/state validation and measurement provenance;
- strict target-date validation;
- human-review readiness checks;
- actor-specific state transitions;
- access/export service requiring request ID + matching contact;
- erasure service requiring the separate maintenance role;
- synthetic access verification on an isolated Neon branch; wrong contact produced zero matches;
- AI cannot approve producibility, quote, structural safety, decline or binding orders;
- only the customer may accept/decline a quote;
- `NO_TRAINING` default for customer data.

Still disabled:

- real customer submission;
- public or private-pilot form activation;
- voice/photo/video upload;
- AI processing of customer data;
- manufacturer/employer forwarding;
- quotation/order acceptance;
- automated retention execution;
- `Who Fits It`.

## Privacy/legal activation boundary

The 30-day text-only pilot retention period is an owner-approved operating rule, not a statutory GDPR period. The processing still cannot be activated until the transparency and lawful-basis facts are real.

Current fail-closed statuses:

- `lawfulBasisStatus = CONSENT_MODEL_PROPOSED_NOT_ACTIVATED`;
- `controllerIdentityStatus = MISSING`;
- `privacyContactStatus = MISSING`;
- `rightsProcedureStatus = ACCESS_VERIFIED_ERASURE_PENDING`;
- `privacyReview.approved = false`;
- `processorReview.approved = false`.

Structured submission now fails validation unless the Article 6 basis, controller identity, privacy contact, rights procedure and evidenced privacy review are all approved. This prevents an accidental feature flag from collecting real personal data.

The processor review records that Neon structured storage is in Frankfurt/EU but does not treat regional database placement as a complete GDPR processor/transfer review. Railway publishes a DPA and states that primary processing operations take place in the United States with transfer safeguards described in its DPA. Railway/Neon agreement and transfer evidence must be retained before customer activation.

## Rights verification

A synthetic request was created only on an isolated Neon branch. Exact request ID + matching normalized contact returned the request; the same ID with a wrong contact returned zero matches. No real customer data was used and production was not modified.

End-to-end erasure is deliberately still unverified because testing the DELETE is a destructive database operation. It requires explicit approval even on the isolated test branch. Until then the rights procedure remains non-VERIFIED and blocks structured intake activation.

## Safety rule

Implementation capability does not equal permission to activate it. Real customer data can only be collected after storage, retention, privacy, processor, lawful-basis, controller/contact and rights gates have real evidence. Manufacturer routing remains impossible until a written agreement exists.

## Commercial validation rule

Do not optimise for catalogue size. Prefer a small number of exact, Ireland-relevant, legally supportable offers with authorised media and measurable contribution. Hypothetical calculator results are not revenue evidence.
