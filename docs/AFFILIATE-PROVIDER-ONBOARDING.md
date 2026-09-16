# Affiliate Provider Onboarding

Status: IMPLEMENTATION READY / EXTERNAL ACCOUNTS NOT YET CONNECTED

Checked against public provider documentation on 16 September 2026. Programme terms, rates, content licences and APIs can change; re-check immediately before account activation and publication.

## Cross-provider commercial gate

No feed/API result becomes an advertisement merely because it exists.

Before any provider offer can become commercial, the repository requires or reserves gates for:

- actual programme/account acceptance;
- exact approved site/channel;
- exact stable product mapping;
- current terms/licence review;
- evidence-backed mapping review;
- media-rights decision;
- real paying counterparty legal entity/country and reviewed VAT/tax treatment;
- current tracking/deep link;
- visible `#Ad` disclosure near the link;
- source freshness.

### Price display is a separate approval

A current provider feed price is **not automatically displayable**. Irish e-commerce rules require clarity around price, tax and delivery-cost treatment. DROPi therefore suppresses feed prices unless the exact product mapping separately records:

- `priceDisplayApproved=true`;
- `priceIncludesTax` as an explicit boolean;
- `deliveryPriceStatus` as `INCLUDED`, `EXCLUDED` or `CALCULATED_AT_CHECKOUT`;
- evidence supporting that presentation.

The link may still be usable as an affiliate advertisement without displaying an unverified price.

## Awin — preferred first automated feed

Why first:

- Publisher product feeds expose product names/descriptions, prices, images and product links.
- Enhanced/Google-format feeds can be downloaded through the publisher API as JSONL.
- Awin provides a publisher Link Builder API for generating trackable deep links.
- This matches DROPi Home's exact-map → stage → review → publish architecture.

Repository support now exists:

- `data/provider-mappings.json` — explicit local-product to provider-product mapping.
- `data/affiliate-offers.generated.json` — generated provider snapshot, never hand-authored as proof of approval.
- `src/provider-offers.mjs` — provider validation and exact mapping.
- `src/commercial-offers.mjs` — fail-closed commercial resolver, including tax/price/media approvals.
- `scripts/sync-awin.mjs` — feed download + link generation.
- `.github/workflows/affiliate-feed-refresh.yml` — daily/manual fail-closed refresh.
- Awin transaction reporting normaliser feeding the privacy-minimised ledger contract.

Required owner/account actions after Awin acceptance:

1. Obtain Awin Publisher ID.
2. Obtain personal API access token from Awin.
3. Join an advertiser programme that has useful Ireland-relevant Home/Furniture products.
4. Confirm access to that advertiser's product feed.
5. Record the exact paying counterparty/country/VAT treatment before commercial activation.
6. Add GitHub repository variables `AWIN_PUBLISHER_ID`, `AWIN_ADVERTISER_ID`, `AWIN_LOCALE`.
7. Add GitHub repository secret `AWIN_ACCESS_TOKEN`.
8. Add explicit reviewed mappings to `data/provider-mappings.json` using stable external product IDs.
9. Record programme/media-rights evidence under `docs/evidence/` before staged media is promoted to approved display state.
10. Approve price presentation only if tax/delivery basis is actually known.

The workflow remains a clean no-op while required credentials are absent.

## Amazon.ie Associates — high-value second provider

Amazon Product Advertising Content has provider-specific licence requirements. The current April 2026 policies state, among other things, that image Product Advertising Content must not be stored/cached; links to images and other Product Advertising Content are subject to short refresh rules, while ASINs can be retained more durably. DROPi Home therefore deliberately does not put Amazon product images/prices into static GitHub catalogue data.

Amazon also requires both:

- a clear/conspicuous link-level affiliate disclosure; and
- the site-level statement: `As an Amazon Associate I earn from qualifying purchases.`

Current Amazon policy material also contains explicit Agent Terms. If an AI agent is ever permitted to interact with Amazon Program Content, it must not disguise itself as a human, defeat CAPTCHAs or similar controls, and must follow Amazon's current agent-identification/technical requirements. This is separate from normal server-to-API use and must be reviewed against the exact account/API path before enabling agent access.

Required later implementation/account steps:

1. Owner applies for/obtains Amazon.ie Associates approval.
2. Record the real Associate tag and approved site in private configuration/evidence.
3. Record the actual Amazon paying legal entity/country and reviewed tax/VAT treatment.
4. Confirm current Creators API / PA API / approved Data Feed access available to the account.
5. Implement a dynamic Amazon adapter that stores durable identifiers such as ASINs but does not persist prohibited Product Advertising Content.
6. Keep Product Advertising Content within current cache/refresh limits.
7. Render `#Ad` near every Amazon affiliate link and the required Amazon Associate statement on the site when Amazon is active.
8. Keep Amazon Product Advertising Content linked only to permitted Amazon destinations under current programme terms.
9. Re-run mobile/site and any applicable Agent-policy review before public activation.

Do not scrape Amazon pages, do not copy Amazon product images into the repository, do not automatically redirect visitors to Amazon, and do not bypass provider access controls.

## eBay Partner Network — Ireland-compatible third provider

The current EPN agreement lists `www.ebay.ie` as a participating site. EPN uses category/site-specific rates and its public material describes attribution rules that must be rechecked from the active agreement/rate card before projecting revenue.

Repository support uses the Ireland Browse API marketplace and stages the official `itemAffiliateWebUrl`; it does not invent a tracking URL from a normal eBay item URL.

Required later steps:

1. Create/approve an EPN account tied to an eBay account.
2. Register the exact DROPi Home site/channel as required.
3. Record programme approval and current rate-card review date.
4. Record the exact paying legal entity/country/VAT treatment.
5. Configure API credentials and EPN campaign ID using secrets/private configuration.
6. Add exact item mappings; no fuzzy title match may activate an offer.
7. Keep adjacent `#Ad` disclosure; disclosure must not be hidden only on a legal page.
8. Approve image or price presentation only when the current EPN/API licence and tax/delivery basis support it.
9. Paid traffic remains disabled unless provider terms permit it and the owner separately authorises spend.

## Provider activation rule

A provider is not `APPROVED` merely because:

- an account was created;
- a product exists on the retailer;
- an API returns the product;
- an image URL is present;
- a price appears in a feed;
- the site can generate a deep link.

Activation requires account acceptance, exact product mapping, approved site/channel, current terms review, correct disclosure, tax/VAT review for the paying counterparty and retained evidence.

## Security rules

- API tokens and payout/bank details never go in GitHub source.
- Only approved secret stores may hold provider secrets.
- Generated snapshots may contain permitted public product metadata/tracking URLs but never provider API tokens.
- A failed/malformed feed refresh must preserve the previous known-good snapshot rather than emptying the catalogue.
- Scheduled refresh must remain idempotent.
- Provider-specific content licences override any generic convenience of storing/caching data.

## Sources checked

- Irish e-commerce Regulations: https://www.irishstatutebook.ie/eli/2003/si/68
- CCPC affiliate advertising guidance: https://www.ccpc.ie/information-for-businesses/guidance-for-businesses/consumer-protection-guidance/influencer-advertising-and-marketing
- Awin Product Feed Publisher Guide Overview: https://help.awin.com/developers/docs/product-feed-publisher-guide-intro
- Awin enhanced feed specification: https://help.awin.com/developers/docs/enhanced-feeds-prod-spec
- Awin publisher enhanced-feed endpoint: https://help.awin.com/apidocs/retail-publisher-productapidocumentation-1
- Awin Link Builder API: https://help.awin.com/apidocs/generatelink
- Amazon.ie Associates disclosure guidance: https://affiliate-program.amazon.ie/help/node/topic/GHQNZAU6669EZS98
- Amazon.ie Associates policies (updated 14 April 2026): https://affiliate-program.amazon.ie/help/operating/policies
- eBay Partner Network agreement: https://partnernetwork.ebay.com/page/network-agreement
