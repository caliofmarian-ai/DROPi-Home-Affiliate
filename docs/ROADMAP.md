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
| LF-001 | Custom Furniture AI Intake | **FOUNDATION IMPLEMENTED / DATA COLLECTION OFF** | Private schema + consent/storage/retention/privacy gates, then staged activation |
| LF-002 | AI text/voice intake | HOLD | Processor review + private structured intake approved |
| LF-003 | Photo/video guided measurement intake | HOLD | Private object storage + processor/privacy review approved |
| LF-004 | Human reviewer queue | NEXT AFTER PRIVATE STORAGE | Restricted reviewer role and queue available |
| LF-005 | Manufacturing referral route | HOLD | Written manufacturing/referral/data agreement exists |
| LF-006 | Who Fits It | HOLD | Separate fitting governance + real partners |

## Current verified checkpoint

The last fully verified Custom Furniture foundation deployment passed **162/162 tests, 0 failures**. The preceding exact-SKU commerce checkpoint passed **151/151 tests, 0 failures**. Railway remains a private authenticated preview; affiliate monetisation, consumer checkout, dropshipping selling, conversion tracking and Custom Furniture customer-data collection all remain disabled.

The production Neon database already contains the privacy-minimised affiliate ledger/sync schema. The new Custom Furniture schema is canonical in `db/migrations/002-custom-intake.sql` and has been tested on a temporary Neon branch, but is **not yet applied to production** without explicit owner approval.

## Independent commerce boundary

Repository-controlled foundations are now built as far as they can truthfully go without external facts. Remaining independent-commerce blockers include:

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

Implemented now:

- fail-closed feature policy;
- request/state validation;
- explicit measurement provenance;
- readiness checks;
- actor-specific transitions;
- AI cannot approve producibility, quote, structural safety, decline or binding orders;
- only the customer may accept/decline a quote;
- `NO_TRAINING` default for customer data;
- proposed private request/media/event database schema;
- SUPER_ADMIN visibility of the gates.

Still disabled:

- real customer submission;
- real customer contact/media storage;
- voice/photo/video upload;
- AI processing of customer data;
- manufacturer/employer forwarding;
- quotation/order acceptance;
- `Who Fits It`.

## Safety rule

Implementation capability does not equal permission to activate it. Real customer data can only be collected after the corresponding storage, retention, privacy, processor and consent gates have real evidence. Manufacturer routing remains impossible until a written agreement exists.

## Commercial validation rule

Do not optimise for catalogue size. Prefer a small number of exact, Ireland-relevant, legally supportable offers with authorised media and measurable contribution. Hypothetical calculator results are not revenue evidence.
