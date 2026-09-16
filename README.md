# DROPi Home Affiliate

**Pre-launch, fit-first commerce platform for Ireland — currently a private preview, not a launched shop and not an income claim.**

Canonical repository: `caliofmarian-ai/DROPi-Home-Affiliate`.

The employer-independent stream is intentionally built first: affiliate catalogue/feeds/reporting plus a fail-closed dropshipping foundation. Employer/manufacturer-dependent custom furniture and fitting are preserved as approved future work but remain disabled.

## Delivery status — 16 September 2026

| Layer | Status | Evidence |
| --- | --- | --- |
| Core preview | IMPLEMENTED | 19 pages, 10 guides, 16 research candidates |
| Railway verification | PASS | 138/138 Node tests, 0 failures, verified deployment SUCCESS |
| GitHub | CANONICAL SOURCE | private `main` branch |
| SUPER_ADMIN auth | ACTIVE | Neon Auth in Frankfurt; one promoted `super_admin`; bootstrap closed |
| Irish/EU legal gate | IMPLEMENTED / PUBLIC RELEASE HOLD | canonical legal control document plus fail-closed code gates |
| Public publication | HOLD | operator/business-name/tax/privacy/brand/editorial facts and approvals still real external work |
| Affiliate monetisation | DISABLED | no real programme/account approval or exact provider mapping yet |
| Awin integration | IMPLEMENTATION READY | exact feed mapping, Link Builder, daily refresh and transaction reporting adapters |
| eBay/EPN integration | IMPLEMENTATION READY | EBAY_IE Browse mapping, official affiliate URL staging and TDR normaliser |
| Amazon.ie integration | POLICY FOUNDATION READY | durable ASIN mapping + transient Product Advertising Content rules; real API/account access required |
| Affiliate ledger | PRODUCTION SCHEMA APPLIED / EMPTY | privacy-minimised Neon ledger and sync-state tables; real provider reporting not connected yet |
| Dropshipping | SELLING DISABLED / LEGAL GATES ADDED | supplier qualification, GPSR/import/consumer gates, order state machine and landed-cost economics |
| Custom Furniture AI Intake | APPROVED / DEFERRED | canonical design preserved; implementation begins only after independent-commerce handoff |
| Who Fits It | HOLD | later, separately governed local fitting route |

The currently served Railway site is a private authenticated preview. Deployment does not equal commercial launch, tax clearance, supplier approval or affiliate-programme acceptance.

## Admin authentication

The project owner has one real account with the `super_admin` role. `/admin/setup` is closed. `/admin` is role-gated and shows a read-only commerce status summary from the verified build.

The temporary HTTP Basic preview gate remains in front of the whole pre-launch site as a second barrier until public/private routing is intentionally changed.

## Irish/EU legal controls

The canonical legal gate is [docs/LEGAL-COMPLIANCE-IRELAND-EU.md](docs/LEGAL-COMPLIANCE-IRELAND-EU.md).

Repository rules now enforce, among other things:

- monetised links must use the visible `#Ad` label;
- public commercial release requires a real legal/operator identity, geographic address and contact email;
- a trading name different from the legal name remains blocked until Irish business-name treatment is evidenced;
- affiliate monetisation requires both an overall tax-filing review and a counterparty-specific VAT/tax profile for every used programme;
- analytics/conversion tracking remain disabled until consent-compliant ePrivacy/GDPR controls exist;
- dropshipping checkout remains disabled;
- a future dropship pilot requires verified product-safety/GPSR, EU responsible-person, traceability, recall, consumer-remedy and customs/VAT evidence;
- non-EU direct fulfilment must have a verified IOSS/DDP/importer-of-record model;
- dropship unit economics include customs duty, import VAT and customs handling rather than hiding them outside the margin calculation.

These controls reduce the chance of accidentally launching an unlawful configuration; they are not a substitute for facts that only the real operator, provider, supplier, Revenue/CRO or a professional adviser can establish.

## Independent commerce architecture

### Affiliate

Provider data never becomes an advertisement merely because an API/feed returned it.

Commercial activation requires:

1. real programme acceptance;
2. exact stable product mapping;
3. approved site/channel;
4. current terms review;
5. evidence-backed mapping review;
6. a reviewed tax/VAT profile for the exact paying counterparty;
7. current provider offer/tracking URL;
8. media-rights approval before an image is exposed;
9. visible `#Ad` disclosure.

Implemented providers/foundations:

- **Awin** — enhanced product feed, exact external-ID mapping, Link Builder, scheduled refresh, transaction API reporting.
- **eBay Partner Network** — Ireland marketplace Browse API, official `itemAffiliateWebUrl`, exact item mapping, TDR reporting normaliser.
- **Amazon.ie Associates** — ASIN mapping and transient-content/cache policy foundation. Product Advertising Content is not copied into GitHub.

`data/provider-mappings.json` and `data/affiliate-offers.generated.json` are intentionally empty until real accounts and exact products exist. `data/programs.json` also keeps each programme's real paying entity/country/VAT treatment in `NOT_REVIEWED` state until evidence exists.

### Product media

No arbitrary retailer/manufacturer images are copied into the repository. Catalogue media is exposed only through an approved provider/merchant rights path. Remote partner images are HTTPS-only and the application keeps script/connect origins locked to itself.

Until authorised media exists, product cards show a placeholder rather than a fabricated image.

### Affiliate reporting

Awin/eBay adapters emit only privacy-minimised ledger fields:

`provider`, `transactionId`, `status`, `commissionCents`, `currency`, `updatedAt`, `statementRef`.

Customer names, addresses, emails, baskets and order contents are deliberately excluded from the affiliate ledger.

The production Neon database now contains the canonical `dropi_ops.affiliate_ledger_current` and `dropi_ops.affiliate_sync_state` schema from `db/migrations/001-affiliate-ledger.sql`. The tables are empty until real provider statements exist; PUBLIC privileges are revoked.

### Dropshipping

Dropshipping is a secondary channel and is disabled by default. Research candidates do not become approved suppliers from web research alone.

The code requires supplier/trade verification, Ireland delivery, stock/order automation, returns/damage terms, media rights, GPSR/product-safety evidence, EU responsible-person/traceability/recall controls, category-specific compliance, a lawful customs/VAT model where relevant, a passed sample order and positive landed contribution margin before a pilot can become eligible.

Current research-only supplier candidates are stored in `data/dropship-suppliers.json`. No supplier subscription, checkout or paid plan is authorised.

## Existing user-facing tools

- original home-organisation guides;
- research catalogue;
- search and category filters;
- comparison of up to three candidates;
- `Will it fit?` millimetre-based geometric checker;
- clear distinction between research links and future `#Ad` affiliate advertisements;
- private owner workspace with hypothetical scenario calculator and local-only ledger viewer.

## Run locally

Node 22.16+ or Node 24.x. Node 24 is the deployment target.

```bash
cd DROPi-Home-Affiliate
npm run check
npm test
npm run build
npm start
```

Provider helpers are inert without real credentials:

```bash
npm run sync:awin
npm run sync:ebay
npm run report:awin
npm run report:ebay -- private/tdr.csv --out private/epn-events.json
```

Secrets, payout/bank data, tax credentials and private reports must never be committed.

## Important boundaries

- No active affiliate account is claimed.
- No real affiliate sale or payout is claimed.
- No dropshipping supplier is approved.
- No checkout/order taking is active.
- No paid advertising is authorised.
- Product availability and Irish delivery are not invented.
- Public commercial launch remains HOLD.
- Custom manufacturing/fitting must not be connected to the current employer until a real written commercial/data arrangement exists.

## Canonical documentation

- [Ireland / EU legal compliance gate](docs/LEGAL-COMPLIANCE-IRELAND-EU.md)
- [Independent commerce plan](docs/INDEPENDENT-COMMERCE-PLAN.md)
- [Affiliate provider onboarding](docs/AFFILIATE-PROVIDER-ONBOARDING.md)
- [Affiliate reporting and ledger](docs/AFFILIATE-REPORTING.md)
- [Product catalogue/media contract](docs/PRODUCT-CATALOGUE-V1.md)
- [Dropshipping channel gates](docs/DROPSHIPPING-CHANNEL.md)
- [Approved/deferred Custom Furniture AI Intake](docs/CUSTOM-FURNITURE-AI-INTAKE.md)
- [Future local services](docs/FUTURE-LOCAL-SERVICES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Operations](docs/OPERATIONS.md)
- [Launch checklist](docs/LAUNCH-CHECKLIST.md)
- [Roadmap](docs/ROADMAP.md)
- [Security](SECURITY.md)
- [Validation](docs/VALIDATION.md)
- [Original owner-facing plan](docs/source-plan/original-plan.ro.md)

Repository documentation/site content is English. Owner-facing conversation remains Romanian.
