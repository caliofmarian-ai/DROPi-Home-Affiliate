# Execution backlog

These are repository-local work items, not a claim that external commercial accounts are already approved.

The owner-approved priority is: **finish the employer-independent commerce stream as far as repository work can take it, then return to `Custom Furniture AI Intake` and later `Who Fits It`.**

| ID | Work item | Current state | Done when |
| --- | --- | --- | --- |
| AF-001 | Standalone site and original draft content | IMPLEMENTED | Human editorial/publication approval remains external |
| AF-002 | Source register, candidate search and fit checker | IMPLEMENTED / TESTED | Exact commercial offers later mapped |
| AF-003 | Safe programme/link configuration | IMPLEMENTED FOUNDATION | Real provider approvals and evidence connected |
| AF-004 | Statement ingestion and reconciliation | IMPLEMENTED / DB PERSISTENCE PENDING OWNER APPROVAL | Neon migration applied; real provider statements later connected |
| AF-005 | Private GitHub repository | COMPLETE | Canonical source in `caliofmarian-ai/DROPi-Home-Affiliate` |
| AF-006 | Private deployment and physical-phone QA | COMPLETE FOR PREVIEW | Public commercial launch still separate |
| AF-007 | SUPER_ADMIN authentication | COMPLETE V1 | Future partner/user invitation UI is later work |
| AF-008 | Product-media rights pipeline | IMPLEMENTED FOUNDATION | Real authorised media arrives from approved provider/merchant |
| AF-009 | Awin feed + Link Builder + transaction automation | IMPLEMENTED / NOT CONFIGURED | Publisher/advertiser accepted; variables/secret and exact mappings supplied |
| AF-010 | Amazon.ie provider adapter | POLICY/CACHE FOUNDATION COMPLETE; REAL API ACCESS BLOCKER | Account/API access exists; live API adapter is connected/tested |
| AF-011 | eBay Partner Network adapter | IMPLEMENTED / NOT CONFIGURED | EPN/developer account accepted; credentials/campaign and exact mappings supplied |
| AF-012 | Commercial offer approval gate | IMPLEMENTED RESOLVER / PERSISTENT ADMIN WRITE PENDING DB | SUPER_ADMIN can persist evidence-backed mapping decisions without editing JSON |
| AF-013 | SEO/public organic launch | HOLD | Brand/privacy/editorial/operator/publication gates approved |
| AF-014 | Real analytics/conversion evidence | HOLD | Public launch + consent-compliant measurement available |
| AF-015 | Dropshipping supplier qualification | IMPLEMENTED FOUNDATION / SELLING DISABLED | Supplier passes trade, returns, compliance, media, shipping, sample and margin gates |
| AF-016 | Dropshipping order automation | STATE MACHINE READY / BLOCKED BY APPROVED SUPPLIER | Exact supplier/API chosen and pilot economics approved |
| AF-017 | Independent commerce handoff | ACTIVE | Operational DB decision is resolved and no material repository-controlled work remains without external account/contract/owner action |
| LF-001 | Custom Furniture AI Intake | APPROVED / DEFERRED | Start only after AF-017 condition is reached |
| LF-002 | Manufacturing referral route | HOLD | Written manufacturing/referral/data agreement exists |
| LF-003 | Who Fits It | HOLD | Custom/fitting governance and real partner model approved |

## Current independent-commerce checkpoint

A verified Railway build has passed **128/128 tests with 0 failures**. The provider engine, media-rights gates, Awin/eBay feed adapters, Awin reporting adapter, eBay TDR normaliser, affiliate ledger rules, dropship supplier qualification and dropship order state machine are implemented without pretending that external accounts are live.

The next internal boundary is operational persistence. `db/migrations/001-affiliate-ledger.sql` has been tested on a temporary Neon branch. Applying it to the production database requires explicit owner approval.

### 1. Affiliate

Awin and eBay use exact external identifiers; fuzzy product-title matching cannot activate an offer. A generated provider offer stays non-commercial until programme, site, mapping, evidence, freshness and media-rights gates all pass.

Amazon uses a separate policy foundation: durable ASIN mapping is allowed in the repository, but Product Advertising Content such as images/prices is treated as transient and must be obtained through the account's permitted API/feed path.

No programme is marked live until actual acceptance evidence exists.

### 2. Dropshipping

Dropshipping remains secondary and disabled. It is not activated merely to increase catalogue size. The seller obligations, bulky returns, damage risk and Irish delivery economics must pass `docs/DROPSHIPPING-CHANNEL.md` first.

Local/Irish or EU stock is preferred over opaque non-EU direct fulfilment. No supplier subscription, checkout, sample order or paid plan is authorised yet.

### 3. Deferred local/manufacturing services

The owner-approved AI-assisted custom-furniture concept is preserved in `docs/CUSTOM-FURNITURE-AI-INTAKE.md`. It must not be lost or silently broadened while deferred.

## External blockers are not fake TODOs

The independent stream can reach a legitimate implementation-ready point even while revenue is still zero. The following require owner/external action and cannot be truthfully fabricated in code:

- provider account acceptance;
- KYC/tax/payout setup;
- API tokens;
- advertiser/supplier programme acceptance;
- bank/payment details;
- paid supplier subscriptions;
- final brand/privacy/operator publication approvals;
- sample purchases or trade contracts.

The repository is responsible for making each of those connections safe and low-friction when the real approval exists.

## Commercial validation rule

Do not optimise for catalogue size. Prefer a small set of exact, Ireland-relevant products with authorised media, clear dimensions, dependable fulfilment and measurable attribution.

After public launch, continue only on measured contribution: actual visitors, outbound clicks, approved conversions, reversals, payouts and operating cost. Hypothetical calculator outputs are not business results.
