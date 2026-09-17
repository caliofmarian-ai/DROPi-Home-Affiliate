# Custom Furniture Intake — Privacy / Consent / Retention

Status: OWNER-APPROVED RETENTION / CONSENT MODEL DRAFT — REAL CUSTOMER COLLECTION STILL OFF

Last legal-source review: 2026-09-17

This document governs the first proposed **text-only private pilot**. It is deliberately narrower than the full Custom Furniture AI Intake design.

## 1. Approved owner decision

The Project Owner approved on 2026-09-17:

- a **30-day retention period** for private text-only pilot submissions;
- continued implementation of the privacy and consent/acknowledgement layer;
- keeping public intake, media, AI processing, manufacturer routing and employer sharing disabled until their separate gates pass.

Canonical evidence: `docs/evidence/owner-custom-intake-retention-consent-approval-2026-09-17.md`.

The 30-day period is an operational design decision, **not** a statutory GDPR period. The Irish Data Protection Commission states that GDPR does not prescribe one universal retention period; identifiable data should be kept no longer than necessary for the purpose.

## 2. What remains disabled

Until later explicit approval:

- no public customer intake;
- no room photographs;
- no room video;
- no voice/audio upload;
- no AI processing of customer data;
- no automated quotation or manufacturing decision;
- no manufacturer/employer data sharing;
- no advertising/analytics/conversion tracking tied to intake;
- no training or fine-tuning on customer data.

`aiDataUse` remains `NO_TRAINING`.

## 3. Purpose of the text-only pilot

The only purpose is to receive a person's voluntary description of a possible custom-furniture requirement, identify missing information and prepare a structured request for later human review.

Submitting the future form will **not**:

- create a manufacturing contract;
- guarantee that an item can be produced;
- create a final quotation;
- confirm technical or structural safety;
- authorise DROPi Home to order anything;
- send the request to the current employer or another manufacturer.

## 4. Data minimisation

The pilot may collect only what is reasonably needed to understand the request:

- email and/or phone contact;
- broad service area/postcode area;
- room type;
- requested furniture type;
- customer-entered width, height and depth in millimetres;
- obstacles and access constraints;
- material and finish preferences;
- budget range;
- preferred target date;
- delivery/fitting preference;
- free-text notes;
- timestamped privacy/consent version;
- request status and minimal audit events.

Do **not** request PPSN, payment-card data, identity documents, exact birth date, health data or other special-category data for this pilot.

## 5. Lawful-basis model

For this **private text-only pilot**, the proposed model is Article 6(1)(a) consent, because the feature is currently a voluntary intake experiment and is not yet tied to an established manufacturer contract or a defined seller/agent role.

This remains `CONSENT_MODEL_PROPOSED_NOT_ACTIVATED` until the real data-controller identity and privacy contact are fixed.

If the future commercial model becomes a genuine request for steps before entering a contract, Article 6(1)(b) may be more appropriate for some processing. That later change requires a separate review; the system must not silently switch legal basis.

If consent is used, it must be freely given, specific, informed and unambiguous, captured by a clear affirmative action, and withdrawal must be supported.

## 6. Retention

**Approved pilot value: 30 days from submission.**

At expiry, an unconverted pilot request should be securely deleted. Dependent audit records are deleted with the request according to the database relationship.

The automated retention worker exists but remains disabled until the real pilot is deliberately activated. It uses a separate maintenance database role.

If a request later becomes a real quotation, customer relationship, contract, dispute or accounting record, a different retention rule may apply. That future record must not silently inherit the pilot's 30-day policy.

## 7. Storage and access

Structured text intake storage is provisioned in the private Neon PostgreSQL database in Frankfurt, EU.

Runtime access uses a dedicated least-privilege role that can access only the intake request/event tables required for text intake. It has no media-table rights. Retention uses a separate maintenance role.

Customer data must never be committed to GitHub. Railway stores database credentials only as environment secrets; they must not be exposed to the browser, repository or logs.

## 8. Versioned privacy notice

Draft version identifier: `custom-intake-privacy-v1-draft`.

The notice cannot become active until it contains the real controller identity and contact details. Before collection, it must clearly explain at least:

- who the data controller is and how to contact them;
- the purpose of processing;
- the Article 6 lawful basis;
- categories of data collected;
- recipients/processors;
- any relevant non-EEA transfer information/safeguards;
- the 30-day pilot retention period;
- applicable access, rectification, erasure, restriction, portability and objection rights;
- if relying on consent, the right to withdraw it at any time without affecting processing already lawfully carried out;
- the right to complain to the Data Protection Commission;
- whether providing each field is required and what happens if it is not provided;
- whether automated decision-making is used. For this pilot, binding automated decisions are not used.

## 9. Draft concise form notice

This text is for owner review and UI testing only until controller details are inserted:

> **Custom furniture request — private text-only intake**
>
> Use this form to describe what you may want made for your space. This is a request for review, not an order, quotation or promise that the item can be manufactured. Measurements you enter are treated as customer-supplied measurements and may need professional verification before production.
>
> We use the details you submit only to structure and review this request. In this stage we do not accept photos, video or audio, do not send the request to a manufacturer, do not make an automated production decision and do not use the information for AI training.
>
> Unconverted pilot submissions are retained for 30 days and then deleted under the pilot retention rule. The full privacy notice identifies the controller, lawful basis, processors/recipients and your data-protection rights.

## 10. Draft consent text

Draft version identifier: `custom-intake-consent-v1-draft`.

Proposed checkbox wording:

> I have read the Custom Furniture Request privacy information. I consent to DROPi Home processing the information I submit for the sole purpose of structuring and reviewing this non-binding request. I understand that I can withdraw this consent and request deletion, subject to any separate legal reason that may later require specific records to be retained.

The checkbox must be **unticked by default** and submission must fail closed without it while consent is the selected lawful basis.

## 11. Rights and withdrawal implementation requirements

Before activating real customer collection, the system/process must support:

- access to a person's stored intake data;
- correction of inaccurate intake information;
- deletion/erasure where applicable;
- consent withdrawal where consent is relied upon;
- restriction/other applicable rights handling;
- retention expiry deletion;
- an auditable record of the privacy/consent version presented at submission.

No self-service customer portal is required for the first private pilot, but there must be a published privacy contact and an admin procedure that can identify and erase a request safely.

## 12. Remaining activation blockers

Real customer collection remains blocked until all of the following are true:

1. real legal controller identity is supplied;
2. real public privacy/contact email or other contact route is supplied;
3. owner confirms consent as the pilot's Article 6 lawful basis;
4. final privacy notice text/version is approved;
5. final consent wording/version is approved;
6. Railway and Neon processor/data-transfer review is documented as applicable;
7. access/correction/erasure/withdrawal procedure is tested;
8. retention worker is tested and deliberately enabled;
9. owner authorises activation of the private pilot.

## 13. Media and AI are separate later gates

Photo/video/audio and AI analysis add materially different processing. They must not be enabled merely because text intake is approved.

Before those stages, separately review private object storage, processor terms/data locations, media retention/deletion, upload warnings, transcription/vision provider data use, human-review safeguards, role-based access and audit logs.

## 14. Official Irish guidance rechecked

- DPC — Right to be informed / transparency (Articles 13 & 14): https://www.dataprotection.ie/en/individuals/know-your-rights/right-be-informed-transparency-article-13-14-gdpr
- DPC — Definition of key terms / Article 6 lawful bases and consent: https://www.dataprotection.ie/en/organisations/data-protection-basics/definition-key-terms
- DPC — Storage limitation FAQ: https://www.dataprotection.ie/en/faqs/responsibilities-data-controllers/how-long-should-personal-data-be-held-meet-obligations-imposed-gdpr
- DPC — Self-assessment checklist, including consent/withdrawal procedures: https://www.dataprotection.ie/en/organisations/resources-organisations/self-assessment-checklist

These sources should be rechecked immediately before activation if the design, operator or providers change.
