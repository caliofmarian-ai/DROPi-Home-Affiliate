# Dropshipping Channel

Status: DISCOVERY READY / SELLING DISABLED

This channel is employer-independent but materially higher-risk than affiliate marketing because DROPi becomes the customer-facing seller if it accepts the order/payment, even when a supplier ships the product directly.

## Why it stays disabled initially

Irish consumer-law guidance requires a trader selling goods to consumers to handle conformity, cancellation, repair/replacement/refund and related obligations. Online buyers generally have a 14-day withdrawal right, subject to statutory exceptions. A dropship supplier fulfilling the parcel does not remove DROPi's obligations to the buyer if DROPi is the seller.

For this reason the repository may prepare supplier/data/order adapters, but `SELLING_ENABLED` must remain false until the legal, supplier, returns and unit-economics gates are all evidenced.

## Preferred supplier order

### 1. Ireland / island-of-Ireland furniture and home suppliers

Priority goes to suppliers that explicitly support trade dropshipping and direct customer delivery. A local supplier can reduce customs, transit-time and bulky-return problems.

Research candidate: **GIE Ireland**. Public material currently describes trade furniture dropshipping, direct delivery across Ireland, no stockholding by the retailer, and categories including beds, sofas/chairs, garden furniture, lamps, mirrors and home accessories. This is a candidate for direct commercial verification, not an approved supplier.

Required checks before activation:

- Irish delivery coverage by SKU/postcode;
- wholesale pricing and VAT treatment;
- delivery surcharge/assembly rules;
- stock feed/API availability;
- damage and failed-delivery process;
- return collection cost;
- cancellation timing;
- product compliance/safety evidence;
- product image/content licence;
- whether supplier branding/invoices appear in the customer parcel;
- trade account acceptance and payment terms.

### 2. EU-warehouse supplier platforms

Research candidate: **Syncee**. Public material describes a dropshipping/wholesale marketplace with EU/UK suppliers, Home & Garden/Furniture categories, inventory/order automation and supplier-direct fulfilment. Exact shipping speed, return terms and product quality vary by the selected supplier and must be checked at SKU level.

Research candidate: **BigBuy**. It is commonly positioned as an EU fulfilment/API supplier for home/furniture categories, but the exact account cost, API access and Irish landed economics must be checked directly before any subscription. No BigBuy paid plan is authorised by this repository.

## 2026 customs constraint

Revenue Ireland states that from 1 July 2026 a €3 customs duty per item applies to most e-commerce parcels valued at €150 or less arriving in Ireland from outside the EU, in addition to VAT rules. This strengthens the preference for Irish/EU stock for low-touch dropshipping.

Do not market a `.ie`/EUR listing as effectively local stock if the exact SKU ships from outside the EU. Shipping origin must be explicit in the commercial record.

## Supplier qualification contract

Each supplier must have a structured record with at least:

```text
supplier_id
legal_name
trading_name
warehouse_countries[]
ships_to_ireland
shipping_origin_by_sku_required
trade_account_status
api_or_feed
stock_sync
order_automation
tracking_automation
returns_address
change_of_mind_return_terms
defect_damage_terms
failed_delivery_terms
customer_invoice_branding
media_rights_status
product_compliance_evidence
vat_model
currency
sample_order_status
commercial_terms_reviewed_at
status
```

Allowed statuses:

- `RESEARCH_ONLY`
- `APPLICATION_REQUIRED`
- `TRADE_ACCOUNT_PENDING`
- `TECHNICAL_REVIEW`
- `SAMPLE_TEST_REQUIRED`
- `APPROVED_FOR_PILOT`
- `SUSPENDED`
- `REVOKED`

No supplier record may become `APPROVED_FOR_PILOT` from web research alone.

## Product activation gate

A supplier being approved does not approve every product. Each SKU additionally needs:

- current supplier SKU;
- current wholesale cost;
- current delivery cost to Ireland;
- expected payment processing cost;
- realistic damage/return allowance;
- legal/compliance category check;
- exact shipping origin;
- stock availability mechanism;
- authorised imagery/content;
- acceptable delivery promise;
- contribution margin after all known costs.

Large upholstered furniture, children's furniture, bunk/high beds, powered furniture, lighting/electrical items and fragile glass-heavy products require additional specialist checks.

## Order architecture (future, still disabled)

When a supplier is approved, the intended automated flow is:

`Customer checkout` → `payment authorised` → `supplier order API` → `supplier acceptance` → `tracking sync` → `customer updates` → `delivery` → `returns/defect state if needed`.

The system must not mark an order confirmed merely because payment succeeded. Supplier acceptance/stock confirmation must be a separate state.

Suggested states:

- `CHECKOUT_STARTED`
- `PAYMENT_AUTHORISED`
- `SUPPLIER_ORDER_PENDING`
- `SUPPLIER_ACCEPTED`
- `SUPPLIER_REJECTED`
- `DISPATCHED`
- `DELIVERED`
- `RETURN_REQUESTED`
- `RETURN_IN_TRANSIT`
- `REFUNDED`
- `DEFECT_CLAIM`
- `CLOSED`

## Automation requirement

The purpose of using dropshipping is to avoid stock handling, not to create a manual order-forwarding job for the owner. A supplier is a poor fit for scale if orders, stock and tracking cannot be automated or reduced to a documented low-volume exception.

## No-spend rule

No supplier subscription, Shopify plan, marketplace fee, sample order, API plan or paid app is authorised merely by being listed here. Paid activation requires a separate owner decision after unit economics are shown.

## Current decision

Affiliate remains the first monetisation route. Dropshipping is prepared as a secondary route for products where supplier quality, Irish delivery and margin justify accepting the additional seller obligations.

## Sources checked 16 September 2026

- CCPC selling products guidance: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/selling-products
- Revenue low-value consignment change: https://www.revenue.ie/en/customs/individuals/relief-low-value-consignments/index.aspx
- Revenue VAT e-commerce overview: https://www.revenue.ie/en/vat/vat-ecommerce/ecommerce-rules-010721/index.aspx
- GIE Ireland dropshipping overview: https://gieireland.com/Blog/what-is-drop-shipping-and-how-it-works-for-furniture-retailers
- Syncee marketplace overview: https://www.syncee.com/
