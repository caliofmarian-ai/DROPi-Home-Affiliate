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
| LF-001 | Custom Furniture AI Intake | **PRIVATE DATA FOUNDATION IMPLEMENTED / COLLECTION OFF** | Owner approves lawful-basis/privacy/retention package, then text-only private pilot can be staged |
| LF-002 | Text-only intake persistence | IMPLEMENTED / ACTIVATION HOLD | Approved privacy notice, lawful basis, retention and deliberate enablement |
| LF-003 | AI text/voice intake | HOLD | Processor review + private structured intake approved |
| LF-004 | Photo/video guided measurement intake | HOLD | Private object storage + processor/privacy review approved |
| LF-005 | Human reviewer queue | NEXT AFTER TEXT PILOT | Restricted reviewer role and queue available |
| LF-006 | Manufacturing referral route | HOLD | Written manufacturing/referral/data agreement exists |
| LF-007 | Who Fits It | HOLD | Separate fitting governance + real partners |

## Current verified checkpoint

Railway is a private authenticated preview. The current build passes **173/173 tests, 0 failures** after the production Custom Furniture schema, text-only persistence foundation, strict target-date handling and disabled-by-default retention worker were added.

Affiliate monetisation, consumer checkout, dropshipping selling, conversion tracking and Custom Furniture customer-data collection all remain disabled.

The production Neon database contains:

- the privacy-minimised affiliate ledger/sync schema;
- `dropi_ops.custom_intake_requests`;
- `dropi_ops.custom_intake_media`;
- `dropi_ops.custom_intake_events`.

The Custom Furniture tables were verified empty immediately after migration. Public access is revoked. Runtime text-intake access uses a dedicated least-privilege database role; media-table access is not granted to that role. Retention uses a separate maintenance role and remains disabled with `INTAKE_RETENTION_EXECUTE=false`.

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
Privacy draft: `docs/CUSTOM-INTAKE-PRIVACY-DRAFT.md`.
Production schema: `db/migrations/002-custom-intake.sql`.

Implemented now:

- production private request/media/event schema;
- separate least-privilege application and retention database roles;
- fail-closed feature policy;
- text-only request preparation/persistence logic;
- explicit acknowledgement gate before storage;
- request/state validation;
- explicit measurement provenance;
- readiness checks;
- actor-specific transitions;
- strict target-date validation;
- proposed 30-day pilot retention, not yet approved as policy;
- disabled-by-default retention deletion worker;
- AI cannot approve producibility, quote, structural safety, decline or binding orders;
- only the customer may accept/decline a quote;
- `NO_TRAINING` default for customer data;
- SUPER_ADMIN visibility of the gates.

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

The DPC does not prescribe a universal fixed retention period. The controller must justify a period based on purpose and delete data when it is no longer needed. The proposed text-only pilot value is **30 days**, subject to owner approval; it is not described as a statutory requirement.

Before any real customer data is collected, the project still needs:

1. real legal operator identity and privacy contact;
2. explicit Article 6 lawful-basis decision for the intake operation;
3. approved retention period;
4. final privacy notice version;
5. final acknowledgement/consent wording and version;
6. Railway/Neon processor and transfer review as applicable;
7. tested rights/deletion handling;
8. recorded owner approval.

Media and AI require additional, separate gates and cannot inherit approval from text-only intake.

## Safety rule

Implementation capability does not equal permission to activate it. Real customer data can only be collected after the corresponding storage, retention, privacy, processor and lawful-basis gates have real evidence. Manufacturer routing remains impossible until a written agreement exists.

## Commercial validation rule

Do not optimise for catalogue size. Prefer a small number of exact, Ireland-relevant, legally supportable offers with authorised media and measurable contribution. Hypothetical calculator results are not revenue evidence.
