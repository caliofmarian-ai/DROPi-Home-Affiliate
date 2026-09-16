# Owner Legal / Commercial Action Checklist

Status: CANONICAL PRE-LAUNCH CHECKLIST
Market: Ireland
Last source review: 2026-09-16

This checklist separates actions that require a real owner/counterparty/government fact from repository work. Nothing below should be marked complete from an assumption.

## A. Before any public commercial affiliate launch

### A1. Decide the legal operator

Record the real person/entity that will operate the site and receive affiliate income.

Required evidence in the repository should contain only non-secret proof/status, never PPSN, passwords, bank details or full tax credentials.

### A2. Decide the public trading name

If the operator will trade as `DROPi Home` rather than under the operator's true/legal name, verify the Irish business-name requirement and register where required before relying on the name commercially.

CRO source: https://cro.ie/Registration/Business-Name/

### A3. Choose a lawful public contact address

Irish e-commerce rules require the geographic establishment address to be easily, directly and permanently accessible. The repository intentionally leaves it blank rather than publishing a private home address from memory or another source.

Irish Statute Book source: https://www.irishstatutebook.ie/eli/2003/si/68

### A4. Tax registration / filing treatment

Determine the operator's correct Irish Income Tax/self-assessment status for the real level/type of non-PAYE income.

Revenue source: https://www.revenue.ie/en/self-assessment-and-self-employment/guide-to-self-assessment/register-it-self-assessment.aspx

### A5. Review VAT for every real affiliate counterparty

For each programme that is actually accepted, record:

- paying legal entity;
- country of establishment;
- business/VAT identifier where relevant;
- whether the transaction is Irish domestic, EU B2B reverse charge, non-EU B2B or another reviewed treatment;
- evidence/source used for that decision.

Do not assume that being below a domestic VAT turnover threshold makes cross-border service VAT irrelevant.

Revenue source: https://www.revenue.ie/en/vat/vat-on-services/when-is-vat-charged-on-services/vat-obligations-of-Irish-traders-supplying-services-to-business-customers-abroad.aspx

### A6. Affiliate programme acceptance

For Awin / eBay / Amazon or another provider, preserve evidence of:

- account approval;
- exact site/channel approval;
- publisher/associate/campaign ID;
- current terms;
- exact product mapping rules;
- content/image/price licence rules.

Do not put access tokens in GitHub.

### A7. Advertising disclosure

Every monetised website/blog affiliate link is rendered as `#Ad` before the link. Do not remove or replace it with a vague disclosure hidden elsewhere.

CCPC source: https://www.ccpc.ie/information-for-businesses/guidance-for-businesses/consumer-protection-guidance/influencer-advertising-and-marketing

### A8. Privacy / tracking

Before public launch, review actual hosting logs and processors. Keep analytics, conversion pixels and non-essential storage off unless a consent mechanism meeting Irish ePrivacy/DPC requirements is implemented.

DPC sources:

- https://www.dataprotection.ie/en/dpc-guidance/guidance-cookies-and-other-tracking-technologies
- https://www.dataprotection.ie/en/faqs/cookies/do-i-need-consent-analytics-cookies

### A9. Brand/IP clearance

Do not treat CRO business-name registration as trade-mark clearance. Search Irish/EU trade-mark databases for the intended brand/classes and preserve the result. Do not copy third-party photos/descriptions/logos unless the commercial licence permits it.

IPOI sources:

- https://www.ipoi.gov.ie/en/understanding-ip/ip-infringement/infringing-others-ip/
- https://www.ipoi.gov.ie/en/types-of-ip/trade-marks/using-the-trade-mark-search-tools/
- https://www.ipoi.gov.ie/en/types-of-ip/copyright1/understanding-copyright/what-is-copyright/

### A10. Publication approval

Only after the above facts and the editorial/privacy/brand evidence are current should `publication.approved` or `monetization.enabled` be considered for a public build.

## B. Before accepting a single dropshipping consumer order

Do **not** activate checkout simply because an API integration works.

### B1. Seller role and terms

Confirm who the consumer contracts with. If DROPi takes payment/order as seller, prepare the trader information, terms, cancellation information/form, delivery restrictions, payment methods and confirmation process required for Irish distance selling.

Sources:

- https://www.irishstatutebook.ie/eli/2022/act/37/section/106/enacted/en/html
- https://www.irishstatutebook.ie/eli/2022/act/37/schedule/3/enacted/en/html

### B2. Returns / faults / refunds

Document operational routes for change-of-mind cancellations where applicable, failed delivery, damaged goods, non-conforming goods, repairs/replacements, price reductions and refunds. Supplier policy cannot be used to remove mandatory consumer rights.

CCPC source: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/selling-products

### B3. Product safety per SKU

Before a SKU is sellable, verify at minimum:

- manufacturer identity;
- EU responsible person where required;
- product identifier/traceability;
- safety/warnings information;
- category-specific conformity/CE rules where applicable;
- recall contact/process;
- supply-chain/compliance-document availability.

CCPC sources:

- https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/product-safety/general-product-safety-regulations
- https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/product-safety/product-safety-guidance/guidance-for-importing-products

### B4. Import / customs role

For any non-EU shipping origin, determine before checkout:

- importer of record;
- IOSS/DDP/other model;
- customs duty;
- import VAT;
- handling/clearance costs;
- EORI requirement;
- consumer-facing landed price/charge disclosure.

Revenue sources:

- https://www.revenue.ie/en/vat/vat-ecommerce/import-oss/index.aspx
- https://www.revenue.ie/en/customs/businesses/electronic-systems/eori-system.aspx

### B5. Customer-data architecture

Unlike affiliate reporting, dropshipping necessarily requires customer/order/shipping data. Before checkout, define:

- lawful basis;
- privacy notice;
- processor contracts;
- supplier/shipping/payment data sharing;
- access controls;
- retention/deletion;
- breach/incident handling.

Do not reuse the privacy-minimised affiliate ledger as an order database.

### B6. Sample order and landed economics

Run a real sample order before pilot approval and record the real fulfilment, packaging, delivery, tracking, damage/return process and landed cost. No synthetic sample may satisfy this gate.

## C. European Accessibility Act review

Irish accessibility regulations apply from 28 June 2025 to specified services including e-commerce services, with a service exemption for qualifying microenterprises. Before a checkout/e-commerce-service launch, record whether the operator meets the statutory microenterprise definition and whether the exact service is in scope. Do not silently assume exemption.

Irish Statute Book source: https://www.irishstatutebook.ie/eli/2023/si/636/made/en/print

Regardless of exemption, keep semantic HTML, keyboard operation, text labels, alternative text, understandable forms and accessible error/status output as engineering requirements.

## D. Deferred Custom Furniture AI Intake

Before real customer uploads are accepted:

- identify DROPi's legal role: referral/introduction vs contracting seller/service provider;
- define lawful basis for photo/video/voice/contact processing;
- define upload retention/deletion;
- document AI/cloud processors and any data transfers;
- obtain a real manufacturer/referral/data-sharing agreement before sending customer material to another company;
- state clearly that AI interpretation/measurements are estimates and require human/customer confirmation;
- do not create a binding manufacturing order automatically from AI output.

## Release rule

A missing fact is `HOLD`, not a value to guess.
