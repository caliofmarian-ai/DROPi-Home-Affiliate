# Execution backlog

These are repository-local work items, not a claim that external commercial accounts are already approved.

The owner-approved priority is: **finish the employer-independent commerce stream as far as repository work can take it, then return to `Custom Furniture AI Intake` and later `Who Fits It`.**

| ID | Work item | Current state | Done when |
| --- | --- | --- | --- |
| AF-001 | Standalone site and original draft content | IMPLEMENTED | Human editorial/publication approval remains external |
| AF-002 | Source register, candidate search and fit checker | IMPLEMENTED / TESTED | Exact commercial offers later mapped |
| AF-003 | Safe programme/link configuration | IMPLEMENTED FOUNDATION | Real provider approvals and evidence connected |
| AF-004 | Statement ingestion and reconciliation | SCHEMA + NORMALISERS IMPLEMENTED | Real provider credentials/statements are connected and first payout is reconciled |
| AF-005 | Private GitHub repository | COMPLETE | Canonical source in `caliofmarian-ai/DROPi-Home-Affiliate` |
| AF-006 | Private deployment and physical-phone QA | COMPLETE FOR PREVIEW | Public commercial launch still separate |
| AF-007 | SUPER_ADMIN authentication | COMPLETE V1 | Future partner/user invitation UI is later work |
| AF-008 | Product-media rights pipeline | IMPLEMENTED FOUNDATION | Real authorised media arrives from approved provider/merchant |
| AF-009 | Awin feed + Link Builder + transaction automation | IMPLEMENTED / NOT CONFIGURED | Publisher/advertiser accepted; variables/secret and exact mappings supplied |
| AF-010 | Amazon.ie provider adapter | POLICY/CACHE FOUNDATION COMPLETE; REAL API ACCESS BLOCKER | Account/API access exists; live API adapter is connected/tested |
| AF-011 | eBay Partner Network adapter | IMPLEMENTED / NOT CONFIGURED | EPN/developer account accepted; credentials/campaign and exact mappings supplied |
| AF-012 | Commercial offer approval gate | IMPLEMENTED RESOLVER | Real mappings/offers exist and the owner has actual decisions to approve/revoke |
| AF-013 | Ireland/EU legal release gate | IMPLEMENTED / PUBLIC RELEASE HOLD | Real operator/business-name/tax/privacy/brand/editorial facts and evidence pass the gate |
| AF-014 | Accessibility baseline / EAA scope gate | IMPLEMENTED BASELINE / LEGAL SCOPE HOLD | Real operator/service facts establish whether the microenterprise exemption applies; full in-scope requirements are reviewed if needed |
| AF-015 | SEO/public organic launch | HOLD | AF-013 and AF-014 pass and a deliberate public release is approved |
| AF-016 | Analytics/conversion measurement | HOLD | Consent-compliant ePrivacy/GDPR implementation is designed and approved |
| AF-017 | Dropshipping supplier qualification | IMPLEMENTED FOUNDATION / SELLING DISABLED | Supplier and exact SKUs pass trade, consumer, GPSR, import, media, shipping, sample and landed-margin gates |
| AF-018 | Dropshipping order automation | STATE MACHINE READY / BLOCKED BY APPROVED SUPPLIER | Exact supplier/API chosen, legal contract pack exists and pilot economics pass |
| AF-019 | Independent commerce handoff | NEAR EXTERNAL-BLOCKER BOUNDARY | No material repository-controlled work remains that can be truthful without a real account, counterparty, supplier, tax/operator fact or owner publication decision |
| LF-001 | Custom Furniture AI Intake | APPROVED / DEFERRED | Start only after AF-019 condition is reached |
| LF-002 | Manufacturing referral route | HOLD | Written manufacturing/referral/data agreement exists |
| LF-003 | Who Fits It | HOLD | Custom/fitting governance and real partner model approved |

## Current independent-commerce checkpoint

A verified Railway deployment has passed **141/141 tests with 0 failures** after the Ireland/EU legal audit, counterparty-specific affiliate tax gate and basic accessibility regression baseline.

The production Neon database contains the privacy-minimised affiliate ledger/sync schema. It is deliberately empty until real provider reporting exists. Applying schema did not activate monetisation or create any transaction data.

The legal source of truth is `docs/LEGAL-COMPLIANCE-IRELAND-EU.md`; owner/external actions are separated in `docs/OWNER-LEGAL-ACTION-CHECKLIST.md`. The application remains fail-closed: public commercial release, tracking and dropshipping selling cannot be activated merely by changing a provider feed. `SUPER_ADMIN` now receives the current public/legal blocker count and blocker list from build metadata.

### 1. Affiliate

Awin and eBay use exact external identifiers; fuzzy product-title matching cannot activate an offer. A generated provider offer stays non-commercial until programme, site, mapping, evidence, freshness, media-rights **and counterparty-specific VAT/tax** gates pass.

Every future monetised link is rendered with a visible `#Ad` label. Public commercial pages also require the real operator identity, geographic address and contact details before build/release gates can pass.

Amazon uses a separate policy foundation: durable ASIN mapping is allowed in the repository, but Product Advertising Content such as images/prices is treated as transient and must be obtained through the account's permitted API/feed path.

No programme is marked live until actual acceptance evidence exists.

### 2. Dropshipping

Dropshipping remains secondary and disabled. It is not activated merely to increase catalogue size.

A pilot supplier fails closed unless the evidence includes Ireland fulfilment, returns, supplier/trade terms, media rights, GPSR/product-safety status, EU responsible person, traceability, recall process, consumer-remedy support, category-specific product rules and a lawful customs/VAT model. Non-EU fulfilment additionally requires a verified IOSS/DDP/importer-of-record model.

The contribution model includes customs duty, import VAT and customs handling. A cheap supplier price is therefore not treated as profit.

Local/Irish or EU stock remains preferred over opaque non-EU direct fulfilment. No supplier subscription, checkout, sample order or paid plan is authorised yet.

### 3. Legal/compliance boundary

Current official-source review covers Irish e-commerce disclosures, affiliate advertising disclosure, CRO business-name registration, Revenue self-assessment and cross-border VAT issues, GDPR/ePrivacy tracking rules, Consumer Rights Act distance-sales duties, GPSR/product safety, IOSS/customs/EORI, intellectual-property/brand-content risks and the European Accessibility Act implementation in Ireland.

The accessibility test suite is only a regression baseline; it is not represented as legal certification. E-commerce service scope and the statutory microenterprise exemption depend on the real operator/service facts and remain an explicit launch-gate decision.

The gate intentionally does **not** invent the operator's final legal/tax facts. Before commercial release we still need the actual legal operator/trading-name decision, public business contact address, provider paying entities/VAT treatment, privacy/hosting review and publication approval.

### 4. Deferred local/manufacturing services

The owner-approved AI-assisted custom-furniture concept is preserved in `docs/CUSTOM-FURNITURE-AI-INTAKE.md`. It must not be lost or silently broadened while deferred. Its future launch requires its own upload/privacy, processor, referral/contract-role and human-confirmation gates.

## External blockers are not fake TODOs

The independent stream can reach a legitimate implementation-ready point even while revenue is still zero. The following require owner/external action and cannot be truthfully fabricated in code:

- provider account acceptance;
- KYC/tax/payout setup;
- exact paying counterparty and VAT treatment;
- API tokens;
- advertiser/supplier programme acceptance;
- bank/payment details;
- paid supplier subscriptions;
- real operator/trading-name/business-address decision;
- final brand/privacy/editorial/publication approvals;
- accessibility microenterprise/scope facts where relevant;
- sample purchases, SKU compliance evidence or trade contracts.

The repository is responsible for making each connection safe and low-friction when the real approval/evidence exists.

## Commercial validation rule

Do not optimise for catalogue size. Prefer a small set of exact, Ireland-relevant products with authorised media, clear dimensions, dependable fulfilment and measurable attribution.

After public launch, continue only on measured contribution: actual visitors, outbound clicks, approved conversions, reversals, payouts and operating cost. Hypothetical calculator outputs are not business results.
