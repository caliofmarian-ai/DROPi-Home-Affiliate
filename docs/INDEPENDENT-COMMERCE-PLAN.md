# Independent Commerce Plan

Status: ACTIVE PRIORITY

This document defines the work that must be taken as far as possible before implementation returns to employer/manufacturer-dependent custom furniture and fitting services.

## Scope

Independent commerce means revenue paths that do **not** require the current employer or another local manufacturer to participate.

The approved sequence is:

1. affiliate publishing and product feeds;
2. fit-first catalogue and product media;
3. affiliate reporting and automation;
4. employer-independent dropshipping discovery and supplier qualification;
5. optional activation of a dropshipping channel only after supplier, legal and unit-economics gates pass;
6. organic acquisition / SEO / conversion instrumentation once publication gates are approved.

The future `Custom Furniture AI Intake`, manufacturing referrals and `Who Fits It` remain deferred while this stream is active. See `CUSTOM-FURNITURE-AI-INTAKE.md` and `FUTURE-LOCAL-SERVICES.md`.

## What “finished before returning to manufacturing” means

The independent stream does not require pretending external approvals exist. It is complete enough to move on when every repository-controlled capability is implemented and tested, and the remaining blockers are genuinely external owner/account actions such as:

- affiliate-network application/acceptance;
- supplier/trade-account acceptance;
- API tokens that only the account holder can obtain;
- bank/payout/KYC setup;
- final public operator/privacy/brand approvals;
- commercial contracts or paid-plan decisions requiring owner approval.

At that point each external blocker must have a documented checklist and the application/integration must be ready to connect without redesigning the application.

## Revenue channel A — affiliate (primary)

Preferred first channel because DROPi does not take payment for the product, hold inventory, ship, or become the product seller.

Repository-controlled deliverables:

- exact programme/account gates;
- product/feed mapping by stable identifiers;
- authorised product-image pipeline;
- provider freshness timestamps;
- tracking/deep-link adapter;
- disclosure adjacent to promotional links;
- transaction ingestion/reversal-safe ledger;
- feed/report refresh automation with fail-closed behaviour;
- SUPER_ADMIN review state;
- catalogue and `Will it fit?` integration.

Initial provider order:

1. Awin — preferred feed automation path after publisher acceptance.
2. Amazon.ie Associates — valuable Home/Kitchen coverage, but dynamic Product Advertising Content rules require a provider-specific adapter.
3. eBay Partner Network — useful additional Ireland Home & Garden/furniture catalogue after account acceptance; provider-specific API/link rules apply.
4. Other programmes only when they provide Ireland-relevant inventory, clear media rights and measurable attribution.

## Revenue channel B — dropshipping (secondary, inactive by default)

Dropshipping is not the same risk profile as affiliate marketing. DROPi becomes the customer-facing seller when it takes the order/payment, even if a supplier fulfils it. Therefore the channel remains `SELLING_DISABLED` until all gates pass.

Preferred discovery order:

1. Ireland/local-island furniture/home suppliers that explicitly support trade dropshipping and direct delivery.
2. EU-warehouse suppliers with Irish delivery, stock sync, clear returns/defect handling and usable API/feed support.
3. Supplier marketplaces only after exact-SKU quality, delivery and returns testing.
4. Avoid long, opaque cross-border fulfilment for bulky/fragile furniture until demonstrated otherwise.

Supplier qualification gates:

- legal business/trade-account eligibility;
- exact Ireland delivery coverage and surcharge matrix;
- stock synchronisation;
- damaged-in-transit policy;
- returns address and cost responsibility;
- cancellation/refund workflow;
- product safety/compliance evidence where relevant;
- usable product photography/content rights;
- wholesale cost + shipping + payment fees + expected returns leaves positive contribution;
- no customer invoice/packaging conflict that misrepresents the seller;
- sample order for representative high-risk SKUs before scale;
- automated order/tracking flow or a documented low-volume exception.

Large upholstered, fragile, children's and electrically powered products require additional category-specific review before activation.

## Supplier candidates for later owner review

These are research candidates, not approved suppliers or endorsements:

- GIE Ireland / local furniture trade dropshipping — public material describes direct-to-customer furniture dropshipping across Ireland; trade-account verification and commercial terms still required.
- Syncee — supplier marketplace with EU/UK suppliers, automated inventory/order sync and Home & Garden/Furniture categories; exact supplier quality and Ireland delivery vary by supplier.
- BigBuy — EU fulfilment/API candidate frequently used for furniture/home catalogues; pricing/account requirements and exact Irish landed cost must be verified directly before any subscription.
- Other local/EU suppliers discovered later must pass the same gates rather than being activated because they have a large catalogue.

No paid supplier subscription is authorised by this document.

## Automation principles

- GitHub remains canonical for code, configuration contracts, provider mappings and review evidence.
- Credentials live only in deployment/GitHub secret stores, never committed.
- Feed refreshes must be idempotent and fail closed.
- Products never become sellable/affiliate-active merely because they appear in a feed.
- Exact external IDs are required; fuzzy title matching cannot activate a commercial offer.
- Price, availability and image freshness must follow each provider’s current licence/terms.
- No unsupported AI-generated product photo is presented as the real product.
- No paid advertising is enabled without a separate owner decision and programme-policy check.

## Handoff condition to custom manufacturing

Return to the approved `Custom Furniture AI Intake` implementation when:

- independent catalogue/feed architecture is implemented and tested;
- provider application/integration checklists exist;
- dropshipping activation gates and supplier shortlist exist;
- no remaining repository-controlled blocker can materially advance those channels without an external account, contract or owner decision.

At that point custom manufacturing work may start without losing or mixing the independent commerce roadmap.