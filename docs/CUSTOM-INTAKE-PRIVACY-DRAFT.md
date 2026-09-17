# Custom Furniture Intake — Privacy / Consent / Retention

Status: OWNER-APPROVED RETENTION + TEXT CONSENT MODEL / REAL CUSTOMER COLLECTION STILL OFF

Last legal-source review: 2026-09-17

This document governs the first proposed **text-only private pilot**. Photo/video is governed separately by `docs/CUSTOM-INTAKE-MEDIA-POLICY.md` and remains OFF.

## 1. Approved owner decisions

The Project Owner approved on 2026-09-17:

- a **30-day retention period** for private text-only pilot submissions;
- Article 6(1)(a) **consent** as the chosen lawful-basis model for the private text-only pilot;
- the initial controller/operator model as the Project Owner operating personally / as an Irish sole trader, subject to completing the relevant Revenue/business-name/public-identity steps before commercial public launch;
- creation of a separate dedicated privacy/business email, address still pending and not to be invented;
- future photo/video intake with separate guidance and consent;
- deletion of customer media on terminal closure/completion/cancellation/decline when the media is no longer needed, followed by a customer email only after deletion is technically confirmed;
- keeping AI processing and manufacturer/employer sharing disabled until separate later gates pass.

Canonical evidence:

- `docs/evidence/owner-custom-intake-retention-consent-approval-2026-09-17.md`
- `docs/evidence/owner-custom-intake-operator-media-decisions-2026-09-17.md`

The 30-day text period is an operational design decision, **not** a statutory GDPR period. The Irish Data Protection Commission states that GDPR does not prescribe one universal retention period; identifiable data should be kept no longer than necessary for the purpose.

## 2. What remains disabled

Until later activation approval:

- no public customer intake;
- no real private-pilot customer submission;
- no room photo/video upload;
- no standalone voice/audio upload;
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

For this **private text-only pilot**, the Project Owner selected **Article 6(1)(a) consent**.

Engineering status: `CONSENT_APPROVED`, but real collection remains OFF until the controller's verified public identity/contact, final notice wording, processor review and rights/erasure verification are complete.

The consent must be freely given, specific, informed and unambiguous, captured by a clear affirmative action and capable of being withdrawn.

If the future commercial model becomes a genuine request for steps before entering a contract, Article 6(1)(b) may become more appropriate for some processing. Any future change requires a separate documented review; the system must not silently switch legal basis.

## 6. Retention

**Approved text-only pilot value: 30 days from submission.**

At expiry, an unconverted pilot request should be securely deleted. Dependent audit records are deleted with the request according to the database relationship.

The automated retention worker exists but remains disabled until the real pilot is deliberately activated. It uses a separate maintenance database role.

If a request later becomes a real quotation, customer relationship, contract, dispute or accounting record, a different retention rule may apply. That future record must not silently inherit the pilot's 30-day policy.

Photo/video uses a separate lifecycle. See `docs/CUSTOM-INTAKE-MEDIA-POLICY.md`.

## 7. Storage and access

Structured text intake storage is provisioned in the private Neon PostgreSQL database in Frankfurt, EU.

Runtime access uses a dedicated least-privilege role that can access only the intake request/event tables required for text intake. It has no media-table rights. Retention uses a separate maintenance role.

Customer data must never be committed to GitHub. Railway stores database credentials only as environment secrets; they must not be exposed to the browser, repository or logs.

## 8. Controller / operator model

Initial intended model: **individual / sole trader**, with the Project Owner as controller/operator.

Before activation/publication the project still requires the real legal identity as it must appear in the notice, a real contact route and any Revenue/CRO steps applicable to trading. If `DROPi Home` is used as a public business name different from the owner's true name, the required business-name registration must be completed before relying on that public identity.

A company can be reconsidered later if liability, tax, staffing, investment or scale make incorporation more appropriate; the pilot does not require inventing a company that does not exist.

## 9. Versioned privacy notice

Draft version identifier: `custom-intake-privacy-v1-draft`.

The notice cannot become active until it contains the real controller identity and contact details. Before collection, it must clearly explain at least:

- who the data controller is and how to contact them;
- the purpose of processing;
- Article 6(1)(a) consent for the text-only pilot;
- categories of data collected;
- recipients/processors;
- any relevant non-EEA transfer information/safeguards;
- the 30-day pilot retention period;
- applicable access, rectification, erasure, restriction, portability and objection rights;
- the right to withdraw consent at any time without affecting processing already lawfully carried out;
- the right to complain to the Data Protection Commission;
- whether providing each field is required and what happens if it is not provided;
- whether automated decision-making is used. For this pilot, binding automated decisions are not used.

## 10. Draft concise form notice

This text is for owner review and UI testing only until controller details are inserted:

> **Custom furniture request — private text-only intake**
>
> Use this form to describe what you may want made for your space. This is a request for review, not an order, quotation or promise that the item can be manufactured. Measurements you enter are treated as customer-supplied measurements and may need professional verification before production.
>
> We use the details you submit only to structure and review this request. In this stage we do not accept photos, video or audio, do not send the request to a manufacturer, do not make an automated production decision and do not use the information for AI training.
>
> Unconverted pilot submissions are retained for 30 days and then deleted under the pilot retention rule. The full privacy notice identifies the controller, processors/recipients and your data-protection rights.

## 11. Draft consent text

Draft version identifier: `custom-intake-consent-v1-draft`.

Proposed checkbox wording:

> I have read the Custom Furniture Request privacy information. I consent to the named controller processing the information I submit for the sole purpose of structuring and reviewing this non-binding request. I understand that I can withdraw this consent and request deletion, subject to any separate legal reason that may later require specific records to be retained.

The checkbox must be **unticked by default** and submission must fail closed without it while consent is the selected lawful basis.

## 12. Rights and withdrawal implementation

Implemented foundation:

- request lookup requires both request ID and matching contact detail;
- access export is implemented;
- an erasure function exists and uses the separate maintenance database role;
- access identity matching was verified with synthetic data on an isolated Neon branch.

Still required before real collection:

- destructive erasure verification using only the synthetic test row, after explicit owner approval;
- correction/restriction handling procedure;
- verified privacy contact route;
- retention-expiry execution test;
- published withdrawal instructions.

## 13. Remaining activation blockers

Real text-only customer collection remains blocked until all of the following are true:

1. controller identity/public business details are verified;
2. dedicated privacy contact email is supplied and verified;
3. final privacy notice text/version is approved;
4. final text consent wording/version is approved;
5. Railway and Neon processor/data-transfer review is approved/evidenced;
6. access/correction/erasure/withdrawal procedure is fully tested;
7. retention worker is tested and deliberately enabled;
8. owner authorises activation of the private pilot.

The lawful-basis choice and 30-day text retention are no longer open decisions; they are owner-approved for this private text-only pilot.

## 14. Photo/video is a separate gate

The owner approved the *design* of photo/video intake, not activation.

Canonical media policy: `docs/CUSTOM-INTAKE-MEDIA-POLICY.md`.

Before media activation, private object storage, media-specific consent/guidance, processor review, deletion verification, deletion-confirmation email and an abandoned-request fallback retention rule must all be operational. Enabling text intake must never automatically enable media.

## 15. Official Irish guidance rechecked

- DPC — Right to be informed / transparency (Articles 13 & 14)
- DPC — Lawful processing / Article 6 bases
- DPC — Storage limitation
- DPC — Principles of data protection
- DPC — What is personal data (including photos/audio/video where identifiable)
- DPC — Video recording guidance

Canonical source URLs are maintained in the project's legal source notes and should be rechecked immediately before activation if the design, operator or providers change.
