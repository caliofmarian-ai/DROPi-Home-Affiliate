# Custom Furniture Intake — Privacy / Consent / Retention Draft

Status: DRAFT FOR OWNER REVIEW — NOT AN ACTIVE PRIVACY NOTICE

Date reviewed against DPC guidance: 2026-09-17

This document defines the first proposed **text-only private pilot**. It is deliberately narrower than the full Custom Furniture AI Intake design.

## 1. What remains disabled

Until a later explicit approval:

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

## 2. Purpose of the proposed text-only pilot

The only purpose is to receive a customer's voluntary description of a possible custom-furniture requirement, identify missing information and prepare a structured request for later human review.

Submitting the form would **not**:

- create a manufacturing contract;
- guarantee that an item can be produced;
- create a final quotation;
- confirm technical or structural safety;
- authorise DROPi Home to order anything;
- send the request to the current employer or another manufacturer.

## 3. Proposed data fields

The pilot would collect only data reasonably needed to understand the request:

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
- timestamped acknowledgement/consent version;
- request status and minimal audit events.

Do not request PPSN, payment data, identity documents, exact birth date, health data or other special-category data.

## 4. Lawful-basis decision remains OPEN

The production feature must not claim a GDPR Article 6 basis until DROPi Home's real legal/operator and contracting role is fixed.

Possible bases to review before activation include:

- Article 6(1)(b), where processing is genuinely necessary to take steps at the person's request before entering a contract; or
- Article 6(1)(a) consent, where consent is the appropriate freely given, specific, informed and withdrawable basis.

The interface may require an affirmative acknowledgement before submission as an engineering safeguard, but that checkbox must not be described as the legal basis unless the legal-basis review concludes that consent is in fact being relied upon.

## 5. Retention proposal for the private text-only pilot

**Proposed value: 30 days from submission.**

This is an operational proposal, not a statutory GDPR period. The purpose is to give enough time to inspect a pilot request while keeping identifiable data for a short period.

Before any real customer activation the owner must approve this period or replace it with a justified alternative.

If a future request becomes a real quotation, customer relationship, contract, dispute or accounting record, a different retention basis/period may apply. That future record must not silently inherit the pilot's 30-day policy.

Expired pilot requests should be securely deleted, including dependent audit/media records where applicable.

## 6. Storage and access

Structured intake data is planned for the private Neon PostgreSQL database in the EU (Frankfurt project). Runtime access uses a dedicated least-privilege role rather than the database-owner role.

The text-only role currently has access only to the request/event tables needed for intake. It does not receive media-table rights.

Customer data must never be committed to GitHub.

The Railway application stores only its database connection as a secret environment variable; it must not expose that value to the browser or logs.

## 7. Draft customer-facing transparency text

The final notice must identify the real legal operator and contact details. Until those facts are approved, this draft must not be published as a completed legal notice.

Suggested concise form notice:

> **Custom furniture request — private intake**
>
> Use this form to describe what you may want made for your space. This is a request for review, not an order, quotation or promise that the item can be manufactured. Measurements you enter are treated as customer-supplied measurements and may need professional verification before production.
>
> We will use the details you submit only to structure and review this request. In this text-only stage we do not accept photos, video or audio, do not send your request to a manufacturer and do not use your information for AI training.
>
> The proposed pilot retention period is 30 days. The full privacy notice will explain the legal basis, operator identity, recipients, retention, your data-protection rights and how to contact us.

Suggested acknowledgement checkbox for the pilot, subject to final legal-basis review:

> I have read the Custom Furniture Request privacy information and understand that this submission is non-binding, uses customer-supplied measurements and is stored only for the stated intake/review purpose.

## 8. Required owner/legal facts before activation

All of the following remain blocking:

1. real legal operator identity;
2. real public contact details/privacy contact;
3. chosen Article 6 lawful basis for this processing operation;
4. approved retention period;
5. final privacy notice version;
6. final acknowledgement/consent wording and version;
7. Railway/Neon processor and international-transfer review as applicable;
8. documented handling of access, correction, erasure, restriction and other applicable rights;
9. deletion/retention execution path tested;
10. owner approval recorded in repository evidence.

## 9. Media and AI are separate later gates

Photo/video/audio and AI analysis add materially different processing. They must not be enabled simply because text intake is approved.

Before those stages, separately review:

- private object storage;
- processor terms and data locations/transfers;
- media retention/deletion;
- content warning to avoid filming people, documents and unrelated private items;
- transcription/vision provider data use;
- human review and automated-decision safeguards;
- role-based access and audit logs.

## 10. Official guidance used

- Irish Data Protection Commission — Guidance on Legal Bases for Processing Personal Data
- Irish Data Protection Commission — Lawful Processing
- Irish Data Protection Commission — Transparency
- Irish Data Protection Commission — Storage Limitation FAQ
- Irish Data Protection Commission — Principles of Data Protection
- Irish Data Protection Commission — How do I make a privacy policy?

The canonical URLs are recorded in `docs/LEGAL-COMPLIANCE-IRELAND-EU.md` / project legal source notes and should be rechecked immediately before activation.
