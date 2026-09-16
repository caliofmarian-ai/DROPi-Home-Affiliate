# Ireland / EU Legal Compliance Gate

Status: CANONICAL — OWNER-APPROVED SAFETY REQUIREMENT
Last legal source review: 2026-09-16
Scope: employer-independent DROPi Home affiliate publishing, possible future dropshipping, and the deferred custom-furniture intake concept.

This document is an engineering/compliance control, not a substitute for individual legal or tax advice. Where a rule depends on the exact trader, product, supplier, counterparty or tax facts, the repository must fail closed until the fact is verified.

## 1. Core owner rule

The project must not activate a commercial feature merely because the code can do it.

A feature may become commercial only when:

1. the applicable Irish/EU legal obligations are identified;
2. required operator/business/tax facts are real and evidenced;
3. required provider/supplier/product evidence is real and current;
4. consumer-facing wording is transparent and not misleading;
5. privacy/cookie requirements are satisfied;
6. the repository gate passes without invented values.

No employer data, employer intellectual property, employer customer data, employer pricing, employer manufacturing process or employer representation is part of the independent stream.

## 2. Affiliate publishing — permitted model, with mandatory disclosure

DROPi Home may publish editorial content and link to third-party retailers for commission, provided the relationship is made immediately clear.

Irish e-commerce rules require a commercial communication to be clearly identifiable and require the service provider's name, geographic address and contact details to be easily, directly and permanently accessible. Irish CCPC/ASA guidance specifically states that affiliate marketing on websites/blogs should be clearly labelled `#Ad`; a link alone is not enough.

Engineering rules:

- every active affiliate call-to-action must display `#Ad` prominently next to/before the commercial link;
- no hidden affiliate redirect or cloaking which obscures the commercial nature;
- research-only links must not be described as affiliate links;
- retailer/provider price snapshots must be timestamped and must not be represented as guaranteed checkout prices;
- no invented stock, delivery, discount, rating, review or testing claim;
- the affiliate programme, account, site origin and exact product mapping must be approved before a generated provider offer becomes commercial.

Official sources:

- Irish Statute Book — S.I. No. 68/2003, Regulations 7–8: https://www.irishstatutebook.ie/eli/2003/si/68
- CCPC — Influencer advertising and marketing / affiliate marketing: https://www.ccpc.ie/information-for-businesses/guidance-for-businesses/consumer-protection-guidance/influencer-advertising-and-marketing

## 3. Public operator identity and business name

Before public commercial publication, the site must expose a real operator identity suitable for the legal model, including at minimum:

- legal/operator name;
- trading/public name;
- geographic establishment/contact address;
- email contact;
- phone contact if consumer sales are activated.

The repository must not publish a private home address automatically. The owner must deliberately choose the lawful public business/contact address to use.

If an individual carries on business in Ireland under a name that is not their true name, CRO guidance says the business name must be registered. An application is to be submitted within one month of adopting the business name. Registration does not create a separate legal person or limited liability.

Engineering rule: if `DROPi Home` is used as the trading name for commercial activity, public commercial release remains HOLD until business-name treatment is recorded and evidenced.

Official source:

- CRO — Registering a Business Name: https://cro.ie/Registration/Business-Name/

## 4. Tax / Revenue gate

Affiliate commissions and dropshipping profits are business/non-PAYE income and must be declared under the applicable Irish tax rules.

Revenue states that self-assessment registration is mandatory where taxable non-PAYE income exceeds EUR 5,000 or gross non-PAYE income exceeds EUR 30,000; smaller non-PAYE amounts may generally be declared through Form 12. The correct registration can depend on whether the activity is treated as self-employment and on the actual facts.

VAT cannot be reduced to a single turnover threshold in this project. Affiliate commissions may constitute cross-border B2B services. Revenue's place-of-supply rules require the counterparty's status and establishment to be checked; EU B2B supplies can involve VAT-number validation, reverse-charge invoicing and VIES. Services received from abroad for business purposes can also create VAT self-accounting obligations with no registration threshold.

Engineering rules:

- never hard-code "no VAT required" merely because turnover is below the domestic threshold;
- before first commercial payout/invoice, record the provider legal entity/country and the Revenue VAT treatment used;
- each used affiliate programme has its own `taxProfile`; one generic business-tax checkbox cannot authorise all counterparties;
- a reviewed EU B2B reverse-charge profile requires the actual counterparty VAT ID plus evidence;
- preserve invoices/statements and provider business/VAT identifiers required for the chosen treatment;
- do not store PPSN, tax passwords or bank credentials in GitHub.

Official sources:

- Revenue — Income Tax self-assessment: https://www.revenue.ie/en/self-assessment-and-self-employment/guide-to-self-assessment/register-it-self-assessment.aspx
- Revenue — VAT obligations when supplying services abroad: https://www.revenue.ie/en/vat/vat-on-services/when-is-vat-charged-on-services/vat-obligations-of-Irish-traders-supplying-services-to-business-customers-abroad.aspx
- Revenue — general place-of-supply rules: https://www.revenue.ie/en/vat/vat-on-services/when-is-vat-charged-on-services/general-place-of-supply-rules-for-services.aspx
- Revenue — self-accounting for services received from abroad: https://www.revenue.ie/en/vat/vat-on-services/exceptions-general-place-supply-rules-services/received-services/index.aspx
- Revenue — VAT thresholds: https://www.revenue.ie/en/vat/vat-registration/who-should-register-for-vat/vat-thresholds.aspx

## 5. Privacy, hosting logs, cookies and tracking

GDPR applies whenever personal data is processed. Each processing operation needs an Article 6 lawful basis, transparency information and data-minimisation. If an external processor is used for personal data, an Article 28-compliant controller/processor arrangement is required where applicable.

For cookies and similar tracking technologies, the Irish DPC states that consent is normally required unless the technology is strictly necessary or falls within the communications exemption. Analytics and conversion-tracking cookies are not exempt merely because they are useful to the business.

Engineering rules for the current public affiliate build:

- keep public analytics, conversion tracking, advertising pixels and non-essential storage OFF;
- do not add a decorative cookie banner while secretly placing trackers;
- if analytics/conversion tracking is later implemented, it must be blocked before consent and consent must be withdrawable as easily as it is given;
- privacy notice must describe actual hosting/logging and processing, not an aspirational template;
- admin authentication is separate from public-visitor tracking;
- affiliate financial ledger stores provider transaction identifiers and commission states only — no purchaser name, email, postal address or order-level customer identity.

Official sources:

- DPC — Cookies and Similar Technologies: https://dataprotection.ie/en/dpc-guidance/guidance-on-cookies-and-similar-technologies
- DPC — analytics cookies require consent: https://www.dataprotection.ie/en/faqs/cookies/do-i-need-consent-analytics-cookies
- DPC — lawful processing: https://www.dataprotection.ie/en/organisations/know-your-obligations/lawful-processing
- DPC — transparency: https://www.dataprotection.ie/en/organisations/know-your-obligations/transparency
- DPC — controller/processor relationships: https://dataprotection.ie/en/organisations/know-your-obligations/controller-and-processor-relationships

## 6. Dropshipping changes the legal role

If DROPi Home takes the consumer's order/payment and the supplier merely fulfils the order, DROPi Home is not "only a website with links". It is the trader/seller in the consumer contract and must handle its own legal obligations even if the supplier ships the box.

Before a distance contract, the Consumer Rights Act 2022 requires extensive information including the goods' main characteristics, trader identity/legal identity, geographic address/contact details, total price/cost information and cancellation information. Online ordering must also show delivery restrictions and accepted payment means at or before the ordering process.

Consumers generally have a statutory right to cancel qualifying distance contracts; exceptions must be assessed product-by-product. Failure to provide cancellation information can extend the cancellation period. Faulty-goods remedies are separate from change-of-mind cancellation rights.

Engineering rules:

- checkout remains disabled until a complete Irish consumer-contract pack exists;
- no supplier terms may be substituted for DROPi Home's own consumer obligations;
- supplier refusal to refund does not erase the seller's obligations to the consumer;
- order state must preserve cancellation, return, defect and refund paths;
- total price, tax, delivery cost and import-charge model must be known before taking payment;
- terms must not attempt to contract out of mandatory consumer rights.

Official sources:

- Consumer Rights Act 2022, section 106: https://www.irishstatutebook.ie/eli/2022/act/37/section/106/enacted/en/html
- Consumer Rights Act 2022, Schedule 3: https://www.irishstatutebook.ie/eli/2022/act/37/schedule/3/enacted/en/html
- Consumer Rights Act 2022, sections 112–118: https://www.irishstatutebook.ie/eli/2022/act/37/enacted/en/index.html
- CCPC — Selling products: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/selling-products

## 7. Product safety / GPSR — mandatory before dropshipping a SKU

The EU General Product Safety Regulation (EU) 2023/988 applies to consumer products within scope. Irish CCPC guidance states that products placed on the EU market must have a responsible person in the EU. Article 19 requires online/distance-sale offers to display specified manufacturer/responsible-person identification, product identification/picture and applicable warnings/safety information.

Engineering rule: no dropship SKU may become sellable merely because the supplier has stock. Each SKU must have a verified compliance record covering at least:

- manufacturer identity/contact details;
- EU responsible person where required;
- product identifier/traceability;
- warnings and safety information appropriate for Ireland;
- recall/safety-contact process;
- category-specific rules where relevant.

Electrical/electronic goods, batteries, children's products, cosmetics, food, medical products and other regulated categories require their own compliance checks. A generic supplier statement is not enough.

Where DROPi Home becomes an importer from outside the EU, importer duties are materially broader. CCPC guidance includes post-import monitoring/corrective-action/recall duties and keeping relevant compliance/safety documentation for 10 years. That role must be explicitly identified before activation; it cannot be hidden behind the word "dropshipping".

Official sources:

- EUR-Lex — Regulation (EU) 2023/988, Article 19: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:32023R0988
- CCPC — General Product Safety Regulations: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/product-safety/general-product-safety-regulations
- CCPC — Guidance for importing products: https://www.ccpc.ie/information-for-businesses/selling-goods-and-services/product-safety/product-safety-guidance/guidance-for-importing-products

## 8. Imports, IOSS, customs and EORI

For non-EU fulfilment, the project must know who is importer of record and what the customer will pay before checkout.

As of 1 July 2026, Revenue states that the previous EUR 150 customs-duty exemption for low-value consignments has been removed and a EUR 3 customs duty is charged per line item for consignments with intrinsic value up to EUR 150. IOSS can still be used for eligible goods up to EUR 150 to collect/remit import VAT at point of sale. Where IOSS is not used, import VAT/charges may be collected on arrival.

A trader importing/exporting goods into/out of the EU needs an EORI number for customs interactions.

Engineering rules:

- no opaque "customer pays whatever customs asks" checkout;
- every non-EU supplier/SKU needs a documented DDP/IOSS/importer-of-record model or is blocked;
- landed-cost calculation must include known duty/VAT/shipping/handling consequences;
- if DROPi Home is the importer, EORI/customs and product-compliance obligations must be confirmed before pilot.

Official sources:

- Revenue — Import One Stop Shop: https://www.revenue.ie/en/vat/vat-ecommerce/import-oss/index.aspx
- Revenue — buying goods from outside the EU: https://www.revenue.ie/en/customs/individuals/buying-online-personal/outside-eu.aspx
- Revenue — EORI: https://www.revenue.ie/en/customs/businesses/electronic-systems/eori-system.aspx

## 9. Online marketplace boundary

The current affiliate site is not designed as an online marketplace: third parties do not list offers and conclude contracts with consumers through DROPi Home.

If `Who Fits It` or another future feature evolves into a marketplace where third-party fitters/manufacturers/traders offer services through the platform, additional marketplace duties apply. The Consumer Rights Act 2022 section 107 includes duties around ranking parameters and whether a third-party seller is a trader. Digital Services Act and other platform rules may also become relevant depending on the exact functionality.

Rule: marketplace status must be re-audited before third-party listing/booking/contracting is enabled.

Official source:

- Consumer Rights Act 2022, section 107: https://www.irishstatutebook.ie/eli/2022/act/37/section/107/enacted/en/html

## 10. Intellectual property, brand names and product content

Product names, photos, descriptions, logos and website copy are not "free" merely because they are visible online. IPOI guidance notes that copyright arises automatically in protected works, including photographs and original written material, and advises obtaining permission before using third-party copyright material where an exception does not apply. IPOI also warns businesses to search existing intellectual-property rights before adopting a company/brand/product name; ignorance of an existing protected right is not a defence to infringement.

Engineering rules:

- write original editorial descriptions rather than copying retailer/manufacturer marketing copy;
- do not download and republish arbitrary product photography;
- expose product media only through a provider/feed/licence/merchant permission path whose terms allow that use;
- do not use retailer/manufacturer logos as DROPi branding and do not imply endorsement or partnership;
- preserve source/rights evidence for each commercial media path;
- keep `DROPi Home` under `brandReview.approved=false` until Irish/EU trade-mark searches and the intended commercial classes have been reviewed;
- business-name registration at CRO is not treated as trade-mark clearance.

Official sources:

- IPOI — Infringing others' IP: https://www.ipoi.gov.ie/en/understanding-ip/ip-infringement/infringing-others-ip/
- IPOI — Copyright basics: https://www.ipoi.gov.ie/en/types-of-ip/copyright1/understanding-copyright/what-is-copyright/
- IPOI — Trade Mark search tools: https://www.ipoi.gov.ie/en/types-of-ip/trade-marks/using-the-trade-mark-search-tools/

## 11. Deferred Custom Furniture AI Intake

The concept remains approved but deferred. Before enabling uploads from real customers, its separate launch gate must cover:

- lawful basis and privacy notice for photos/video/voice/contact details;
- upload retention/deletion periods;
- cloud/AI processor contracts and international transfers where relevant;
- clear statement that AI measurements/interpretations are estimates requiring human/customer confirmation;
- no automatic binding manufacturing order from AI output;
- supplier/manufacturer data-sharing agreement before forwarding customer data;
- consumer/service terms if DROPi becomes the contracting party rather than a referral/introduction service.

No employer/manufacturer relationship is to be implied without a real written agreement.

## 12. Current legal release status

### Affiliate publishing

`TECHNICALLY READY / LEGALLY HOLD FOR PUBLIC COMMERCIAL RELEASE`

The code may continue to be developed and provider accounts may be researched. Commercial public release requires real operator/business/tax/privacy/brand/editorial/provider facts.

### Dropshipping

`SELLING DISABLED / LEGAL AND SUPPLIER GATES REQUIRED`

No checkout, payment or consumer order is authorised yet.

### Custom Furniture AI Intake / Who Fits It

`APPROVED CONCEPT / DEFERRED`

Start only after the employer-independent commerce stream has reached its legitimate external-blocker boundary and the feature's own privacy/contract role has been defined.
