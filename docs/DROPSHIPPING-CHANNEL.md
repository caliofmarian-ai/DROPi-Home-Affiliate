# Dropshipping Channel

Status: DISCOVERY READY / SELLING DISABLED

This channel is employer-independent but materially higher-risk than affiliate marketing because DROPi becomes the customer-facing trader/seller if it accepts the consumer's order/payment, even when a supplier ships the product directly.

## Why it stays disabled

Irish consumer law requires a trader selling goods at distance to provide pre-contract information and to operate cancellation, conformity and remedy processes. A supplier fulfilling the parcel does not transfer DROPi's consumer-law responsibility if DROPi is the trader in the consumer contract.

The repository may prepare supplier/data/order adapters, but `dropshippingSellingEnabled` and `consumerCheckoutEnabled` must remain false until the legal, supplier, product-safety, customs, privacy, returns and landed-economics gates are evidenced.

## Preferred supplier order

### 1. Ireland / island-of-Ireland furniture and home suppliers

Priority goes to suppliers that explicitly support trade dropshipping and direct customer delivery. A local supplier can reduce customs, transit-time and bulky-return problems.

Research candidate: **GIE Ireland**. Public material describes furniture dropshipping/direct delivery and trade-account signup. This remains a candidate for direct commercial and compliance verification, not an approved supplier.

Required checks before activation include:

- Irish delivery coverage by SKU/postcode;
- wholesale pricing and VAT treatment;
- delivery surcharge/assembly rules;
- stock feed/API availability;
- damage and failed-delivery process;
- change-of-mind and faulty-goods operational support;
- return collection cost/address;
- product manufacturer identity;
- GPSR/product-safety evidence;
- EU responsible person where required;
- traceability/product identifier;
- warnings/safety information;
- recall/safety-contact process;
- category-specific conformity rules;
- product image/content licence;
- whether supplier branding/invoices appear in the customer parcel;
- trade account acceptance and payment terms.

### 2. EU-warehouse supplier platforms

Research candidate: **Syncee**. Supplier/platform automation claims do not establish that any selected supplier or SKU meets Irish consumer, product-safety, media-rights or delivery requirements. Each selected supplier/SKU must pass the gate separately.

Research candidate: **BigBuy**. Exact account cost, API access, Irish delivery, returns, category compliance and landed economics must be checked directly before any subscription. No paid plan is authorised by this repository.

## 2026 customs constraint

Revenue Ireland states that from 1 July 2026 the former customs-duty exemption for e-commerce consignments with intrinsic value of EUR 150 or less was removed. A EUR 3 customs duty applies per relevant line item/distinct product type for qualifying non-EU e-commerce consignments, and VAT remains part of the landed-cost analysis. IOSS can still be used for eligible consignments and changes how import VAT is collected.

Do not market a `.ie`/EUR listing as effectively local stock if the exact SKU ships from outside the EU. Shipping origin and consumer charge model must be known before checkout.

Official Revenue sources:

- https://www.revenue.ie/en/customs/individuals/relief-low-value-consignments/index.aspx
- https://www.revenue.ie/en/vat/vat-ecommerce/import-oss/index.aspx
- https://www.revenue.ie/en/customs/businesses/electronic-systems/eori-system.aspx

## Supplier qualification contract

Each supplier record must preserve the operational/legal facts required to decide whether a pilot can proceed. Current machine-enforced fields include:

```text
supplier_id
status
website
checked_at
ireland_delivery
stock_sync
order_automation
returns_terms
media_rights
trade_account
gpsr_compliance
eu_responsible_person
product_traceability
recall_process
consumer_remedy_support
customs_vat_model
category_compliance
non_eu_fulfilment
paid_plan_approved
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

No supplier may become `APPROVED_FOR_PILOT` from web research alone. Machine validation rejects pilot approval while the safety, responsible-person, traceability, recall, consumer-remedy, customs/VAT or category-compliance evidence is still unverified.

For non-EU fulfilment, a generic "ships to Ireland" statement is insufficient. The project requires a verified `IOSS`, `DDP` or other reviewed importer-of-record model before pilot approval.

## Product activation gate

Supplier approval does not approve every product. Each SKU additionally needs:

- exact supplier SKU and product identifier;
- manufacturer identity/contact details;
- EU responsible person where required;
- current wholesale cost;
- current delivery cost to Ireland;
- exact shipping origin;
- realistic payment-processing cost;
- customs duty/import VAT/handling where applicable;
- realistic return/damage/support allowance;
- category-specific legal/compliance check;
- stock-availability mechanism;
- authorised imagery/content;
- warnings/safety information required in the online offer;
- acceptable delivery promise;
- passed real sample order;
- positive contribution margin after all known variable costs.

Large upholstered furniture, children's furniture, bunk/high beds, powered furniture, lighting/electrical items, batteries and fragile glass-heavy products require additional category-specific checks. The generic GPSR gate is not treated as a substitute for specific CE/conformity rules where they apply.

## Consumer-contract pack before checkout

Before accepting a consumer order, the exact checkout must provide the information required for Irish distance contracts, including trader identity/legal identity, geographic/contact details, main product characteristics, total price/cost information, cancellation information, delivery restrictions and accepted payment methods. Supplier terms cannot replace DROPi's own mandatory consumer obligations if DROPi is the seller.

The order architecture must preserve cancellation, faulty/non-conforming goods and refund paths; it must not only model successful fulfilment.

Official sources:

- Consumer Rights Act 2022, section 106: https://www.irishstatutebook.ie/eli/2022/act/37/section/106/enacted/en/html
- Consumer Rights Act 2022, Schedule 3: https://www.irishstatutebook.ie/eli/2022/act/37/schedule/3/enacted/en/html
- CCPC selling products: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/selling-products

## Product safety / importer role

General Product Safety Regulation evidence is a mandatory SKU/supplier gate. If DROPi becomes the importer for goods from outside the EU, importer obligations extend beyond simply paying customs: product-safety verification, traceability, corrective action/recalls and record retention become relevant. The importer role must therefore be known before a pilot is approved.

Official sources:

- CCPC GPSR: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/product-safety/general-product-safety-regulations
- CCPC importer guidance: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/product-safety/product-safety-guidance/guidance-for-importing-products

## Privacy / customer data

Affiliate reporting deliberately avoids customer identities. Dropshipping cannot use the same privacy model because order fulfilment requires names, addresses, contact details and order/shipping information.

Before checkout, the system therefore needs a separate order-data architecture with lawful basis, privacy notice, supplier/carrier/payment processor data-sharing rules, access control, retention/deletion and incident handling. No real customer order data is authorised in the current affiliate ledger.

## Order architecture (future, still disabled)

When a supplier and exact SKUs are legally/commercially approved, the intended automated flow is:

`Customer checkout` → `payment authorised` → `supplier order pending` → `supplier acceptance` → `tracking` → `delivery` → `return/defect/refund if needed`.

The system must not mark an order confirmed merely because payment succeeded. Supplier acceptance/stock confirmation remains a separate state.

Implemented state vocabulary:

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

## Landed contribution model

The code does not treat `(retail price - supplier price)` as profit. Current variable-cost fields include:

- wholesale cost;
- shipping;
- payment fee;
- return/damage reserve;
- support reserve;
- customs duty;
- import VAT;
- customs handling;
- other variable cost.

A pilot also requires a passed real sample and `legalComplianceStatus=PASS`.

## Automation requirement

The purpose of dropshipping is to avoid stock handling, not to create a manual order-forwarding job for the owner. A supplier is a poor fit for scale if orders, stock and tracking cannot be automated or reduced to a documented low-volume exception.

## No-spend rule

No supplier subscription, Shopify plan, marketplace fee, sample order, API plan or paid app is authorised merely by being listed here. Paid activation requires a separate owner decision after the legal gate and unit economics are shown.

## Current decision

Affiliate remains the first monetisation route. Dropshipping is prepared as a secondary route only for exact products where supplier quality, Irish delivery, safety/compliance, consumer support and landed margin justify accepting the additional seller obligations.

## Sources checked 16 September 2026

- Consumer Rights Act 2022: https://www.irishstatutebook.ie/eli/2022/act/37/enacted/en/html
- CCPC selling products: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/selling-products
- CCPC GPSR: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/product-safety/general-product-safety-regulations
- CCPC importer guidance: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/product-safety/product-safety-guidance/guidance-for-importing-products
- Revenue low-value consignments: https://www.revenue.ie/en/customs/individuals/relief-low-value-consignments/index.aspx
- Revenue IOSS: https://www.revenue.ie/en/vat/vat-ecommerce/import-oss/index.aspx
- Revenue EORI: https://www.revenue.ie/en/customs/businesses/electronic-systems/eori-system.aspx
- GIE Ireland: https://gieireland.com/
- Syncee: https://www.syncee.com/
