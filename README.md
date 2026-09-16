# DROPi Home Affiliate

**Pre-launch, fit-first commerce platform for Ireland — currently a private preview, not a launched shop and not an income claim.**

Canonical repository: `caliofmarian-ai/DROPi-Home-Affiliate`.

The employer-independent stream is intentionally built first: affiliate catalogue/feeds/reporting plus a fail-closed dropshipping foundation. Employer/manufacturer-dependent custom furniture and fitting are preserved as approved future work but remain disabled.

## Delivery status — 16 September 2026

| Layer | Status | Evidence |
| --- | --- | --- |
| Core preview | IMPLEMENTED | 19 pages, 10 guides, 16 research candidates |
| Railway verification | PASS | 128/128 Node tests, 0 failures, latest verified functional deployment SUCCESS |
| GitHub | CANONICAL SOURCE | private `main` branch |
| SUPER_ADMIN auth | ACTIVE | Neon Auth in Frankfurt; one promoted `super_admin`; bootstrap closed |
| Public publication | HOLD | brand/privacy/editorial/operator approvals still real external work |
| Affiliate monetisation | DISABLED | no real programme/account approval or provider mapping yet |
| Awin integration | IMPLEMENTATION READY | exact feed mapping, Link Builder, daily refresh and transaction reporting adapters |
| eBay/EPN integration | IMPLEMENTATION READY | EBAY_IE Browse mapping, official affiliate URL staging and TDR normaliser |
| Amazon.ie integration | POLICY FOUNDATION READY | durable ASIN mapping + transient Product Advertising Content rules; real API/account access required |
| Affiliate ledger | IMPLEMENTED LOCALLY; DB MIGRATION PENDING OWNER APPROVAL | idempotent pending/approved/paid/reversed model; privacy-minimised Neon schema tested on a temporary branch |
| Dropshipping | SELLING DISABLED | supplier registry, qualification gates, order state machine and unit-economics checks implemented |
| Custom Furniture AI Intake | APPROVED / DEFERRED | canonical design preserved; implementation begins only after independent-commerce handoff |
| Who Fits It | HOLD | later, separately governed local fitting route |

The currently served Railway site is a private authenticated preview. Deployment does not equal commercial launch or programme acceptance.

## Admin authentication

The project owner has one real account with the `super_admin` role. `/admin/setup` is closed. `/admin` is role-gated and shows a read-only commerce status summary from the verified build.

The temporary HTTP Basic preview gate remains in front of the whole pre-launch site as a second barrier until public/private routing is intentionally changed.

## Independent commerce architecture

### Affiliate

Provider data never becomes an advertisement merely because an API/feed returned it.

Commercial activation requires:

1. real programme acceptance;
2. exact stable product mapping;
3. approved site/channel;
4. current terms review;
5. evidence-backed mapping review;
6. current provider offer/tracking URL;
7. media-rights approval before an image is exposed;
8. adjacent affiliate disclosure.

Implemented providers/foundations:

- **Awin** — enhanced product feed, exact external-ID mapping, Link Builder, scheduled refresh, transaction API reporting.
- **eBay Partner Network** — Ireland marketplace Browse API, official `itemAffiliateWebUrl`, exact item mapping, TDR reporting normaliser.
- **Amazon.ie Associates** — ASIN mapping and transient-content/cache policy foundation. Product Advertising Content is not copied into GitHub.

`data/provider-mappings.json` and `data/affiliate-offers.generated.json` are intentionally empty until real accounts and exact products exist.

### Product media

No arbitrary retailer/manufacturer images are copied into the repository. Static catalogue media is accepted only from evidence-backed approved sources such as Awin feeds, eBay Browse API or direct merchant permission. Amazon Product Advertising Content is handled as a separate dynamic/transient integration.

Until authorised media exists, product cards show a placeholder rather than a fabricated image.

### Affiliate reporting

Awin/eBay adapters emit only privacy-minimised ledger fields:

`provider`, `transactionId`, `status`, `commissionCents`, `currency`, `updatedAt`, `statementRef`.

Customer names, addresses, emails, baskets and order contents are deliberately excluded.

A canonical Neon migration is in `db/migrations/001-affiliate-ledger.sql`. It has been tested on a temporary branch but has **not** been applied to production without owner approval.

### Dropshipping

Dropshipping is a secondary channel and is disabled by default. Research candidates do not become approved suppliers from web research alone.

The code requires supplier/trade verification, Ireland delivery, stock/order automation, returns/damage terms, media rights, compliance evidence, a passed sample order and positive contribution margin before a pilot can become eligible.

Current research-only supplier candidates are stored in `data/dropship-suppliers.json`. No supplier subscription, checkout or paid plan is authorised.

## Existing user-facing tools

- original home-organisation guides;
- research catalogue;
- search and category filters;
- comparison of up to three candidates;
- `Will it fit?` millimetre-based geometric checker;
- clear distinction between research links and future affiliate advertisements;
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

Secrets, payout/bank data and private reports must never be committed.

## Important boundaries

- No active affiliate account is claimed.
- No real affiliate sale or payout is claimed.
- No dropshipping supplier is approved.
- No checkout/order taking is active.
- No paid advertising is authorised.
- Product availability and Irish delivery are not invented.
- Public launch remains HOLD.
- Custom manufacturing/fitting must not be connected to the current employer until a real written commercial/data arrangement exists.

## Canonical documentation

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
