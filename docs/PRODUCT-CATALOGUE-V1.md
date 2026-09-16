# Affiliate Product Catalogue v1

Status: IMPLEMENTED FOUNDATION / NO LIVE AFFILIATE FEEDS CONNECTED

## Goal

Turn the current research shortlist into a catalogue that can safely display authorised product media and, later, live affiliate offers without inventing commercial facts or copying merchant assets outside their permitted programme terms.

## Product media contract

Existing research candidates may keep `media: null` or omit `media`. A product image is rendered only when `media.status` is `APPROVED` and the record passes the media gate.

Example approved Awin-backed media record:

```json
{
  "media": {
    "status": "APPROVED",
    "source": "AWIN_FEED",
    "url": "https://merchant-cdn.example/product.webp",
    "alt": "Product name and variant",
    "checkedAt": "2026-09-16",
    "rightsEvidenceFile": "docs/evidence/awin-program-approval.md"
  }
}
```

Supported static sources in v1:

- `AWIN_FEED`: image supplied through an authorised Awin product feed available to this publisher account.
- `MERCHANT_PERMISSION`: remote image explicitly licensed/approved for use by the merchant, with evidence retained in the repository.

Amazon Product Advertising Content is deliberately **not** accepted in this static field. Amazon's current Associates policy limits image caching and requires Product Advertising Content to be used within its programme rules. A future Amazon adapter must fetch/refresh content dynamically and preserve the applicable timestamps/disclosures.

## Rendering behaviour

- Every product card now reserves a consistent media area.
- Products without approved media show a neutral placeholder stating that an approved partner feed is pending.
- Approved media is lazy-loaded from the authorised remote URL.
- The site never fabricates a product photo from AI and never treats a manufacturer page discovered during research as automatic permission to reuse its photography.

## Commercial-state separation

Media approval is separate from affiliate-link approval. A product may therefore be:

1. `RESEARCH_ONLY` with no approved image.
2. `RESEARCH_ONLY` with authorised media but no monetised link.
3. `AFFILIATE_ACTIVE` only after programme, site, exact-link and mapping gates all pass.

This separation prevents a photograph or feed record from being treated as evidence that a commission relationship is active.

## Provider direction

### Awin

Awin product feeds expose product names, descriptions, prices, images and deep links to publishers who have access to a feed. This is the preferred first automated image/catalogue source once the DROPi Home publisher account is accepted and an appropriate advertiser feed is available.

### Amazon.ie

Amazon Product Advertising Content must follow the Associates licence, including image caching and refresh restrictions. The repository should store durable identifiers such as ASINs, not downloaded Amazon product images. A future runtime adapter should refresh Product Advertising Content according to the then-current programme rules.

## Next implementation steps

1. Obtain real publisher programme approval.
2. Record programme evidence and account identifiers outside public content.
3. Add an Awin feed ingestion job with feed-update timestamps and allowlisted advertisers.
4. Map feed products to exact existing research candidates, never by loose name match alone.
5. Render authorised image, live price/availability only when source-specific freshness and disclosure rules pass.
6. Add an Amazon dynamic adapter only after account/API access exists.
7. Extend the SUPER_ADMIN panel with product/media review and approval controls.
