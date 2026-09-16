# Affiliate Provider Onboarding

Status: IMPLEMENTATION READY / EXTERNAL ACCOUNTS NOT YET CONNECTED

Checked against public provider documentation on 16 September 2026. Programme terms, rates and APIs can change; re-check immediately before account activation and publication.

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
- `scripts/sync-awin.mjs` — feed download + link generation.
- `.github/workflows/affiliate-feed-refresh.yml` — daily/manual fail-closed refresh.

Required owner/account actions after Awin acceptance:

1. Obtain Awin Publisher ID.
2. Obtain personal API access token from Awin.
3. Join an advertiser programme that has useful Ireland-relevant Home/Furniture products.
4. Confirm access to that advertiser's product feed.
5. Add GitHub repository variables `AWIN_PUBLISHER_ID`, `AWIN_ADVERTISER_ID`, `AWIN_LOCALE`.
6. Add GitHub repository secret `AWIN_ACCESS_TOKEN`.
7. Add explicit reviewed mappings to `data/provider-mappings.json` using stable external product IDs.
8. Record programme/media-rights evidence under `docs/evidence/` before any staged media is promoted to approved display state.

The workflow remains a clean no-op while these values are absent.

## Amazon.ie Associates — high-value second provider

Public Amazon.ie documentation checked on 16 September 2026 listed Home/Kitchen and many related categories at a standard 10% commission rate. This is a current programme fact, not a guaranteed future rate and not an earnings forecast.

Amazon Product Advertising Content has provider-specific licence requirements. In particular, the current policy restricts storing/caching product images and requires timely refresh of Product Advertising Content. DROPi Home therefore deliberately does not put Amazon images into the static `media` field or GitHub.

Required later implementation/account steps:

1. Owner applies for/obtains Amazon.ie Associates approval.
2. Record the real Associate tag and approved site in private configuration/evidence.
3. Confirm current API/Creators API/Data Feed access available to the account.
4. Implement a dynamic Amazon adapter that stores durable identifiers such as ASINs but does not persist prohibited image content.
5. Add provider-specific freshness timestamps adjacent to price/availability where required.
6. Keep Amazon Product Advertising Content linked only to the relevant Amazon destination as required by programme terms.
7. Re-run mobile/site policy review before public activation.

Do not scrape Amazon pages and do not copy Amazon product images into the repository.

## eBay Partner Network — Ireland-compatible third provider

The current EPN agreement lists `www.ebay.ie` as a participating site. Home & Garden includes furniture, home decor, kitchen/dining, housekeeping and related categories. EPN uses category/site-specific rates and its current public material describes a 24-hour qualifying click window for Buy It Now purchases. Exact rates must be read from the active rate card/account before projecting revenue.

Required later steps:

1. Create/approve an EPN account tied to an eBay account.
2. Register the exact DROPi Home site/channel as required.
3. Record programme approval and current rate-card review date.
4. Use official EPN link/API tooling rather than hand-built tracking URLs.
5. Add adjacent affiliate disclosure; EPN requires disclosure to be conspicuous, not hidden only on a legal page.
6. Paid traffic remains disabled unless a provider-specific approval is obtained and the owner separately authorises spend.

## Provider activation rule

A provider is not `APPROVED` merely because:

- an account was created;
- a product exists on the retailer;
- an API returns the product;
- an image URL is present;
- the site can generate a deep link.

Activation requires account acceptance, exact product mapping, approved site/channel, current terms review, correct disclosure and evidence retained in the repository/private configuration contract.

## Security rules

- API tokens and payout/bank details never go in GitHub source.
- Only GitHub/Railway secret stores may hold provider secrets.
- Generated snapshots may contain public product metadata and tracking URLs but never provider API tokens.
- A failed/malformed feed refresh must preserve the previous known-good snapshot rather than emptying the catalogue.
- Scheduled refresh must remain idempotent.

## Sources checked

- Awin Product Feed Publisher Guide Overview: https://help.awin.com/developers/docs/product-feed-publisher-guide-intro
- Awin enhanced feed specification: https://help.awin.com/developers/docs/enhanced-feeds-prod-spec
- Awin publisher enhanced-feed endpoint: https://help.awin.com/apidocs/retail-publisher-productapidocumentation-1
- Awin Link Builder API: https://help.awin.com/apidocs/generatelink
- Amazon.ie Associates policies: https://affiliate-program.amazon.ie/help/operating/policies
- Amazon.ie commission table: https://affiliate-program.amazon.ie/help/node/topic/GRXPHT8U84RAYDXZ
- eBay Partner Network agreement: https://partnernetwork.ebay.com/page/network-agreement
- eBay Home & Garden programme material: https://partnernetwork.ebay.com/solutions/how-to-grow-your-business-with-home-and-garden
