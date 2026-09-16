# Custom Furniture AI Intake

Status: FOUNDATION IMPLEMENTED / CUSTOMER DATA COLLECTION DISABLED

Owner decision: this capability is approved in principle. The employer-independent commerce stream has now reached the legitimate external-blocker boundary, so foundation implementation has started. No real customer intake, room-media upload, AI processing, manufacturer routing or employer integration is active yet.

## Current implementation checkpoint — 16 September 2026

Implemented in source:

- `data/custom-intake-policy.json` — fail-closed feature policy;
- `src/custom-intake.mjs` — request validation, readiness logic, actor permissions and state machine;
- `tests/custom-intake.test.mjs` — safety/regression coverage;
- `db/migrations/002-custom-intake.sql` — proposed private persistence schema;
- SUPER_ADMIN build metadata/dashboard visibility for the intake gates.

Current policy is deliberately:

- public intake: **OFF**;
- structured customer submission: **OFF**;
- photo/video/audio uploads: **OFF**;
- AI processing: **OFF**;
- manufacturer routing: **OFF**;
- private request storage: **NOT PROVISIONED**;
- private media storage: **NOT PROVISIONED**;
- AI training use of customer data: **NO_TRAINING**.

The proposed database migration has been exercised on a temporary Neon branch only. Applying it to production requires a separate explicit owner approval. Creating empty private tables does not itself authorise collection of customer data; the feature policy remains OFF until privacy, retention, processor and storage gates are deliberately completed.

## Purpose

Allow a potential custom-furniture customer to submit enough structured evidence without requiring the project owner to personally handle every first-contact conversation.

The intended flow is:

`Customer describes the space and need` → `AI intake asks follow-up questions` → `structured request is produced` → `human manufacturing review` → `customer receives accept / clarify / survey / decline response`.

The AI is an intake and qualification layer. It is not the manufacturer, surveyor, structural engineer, final estimator or contracting seller.

## Customer input channels

The future intake may accept:

- room video;
- room photographs;
- typed description;
- voice description, transcribed to text;
- explicit measurements entered by the customer;
- photographs showing a tape measure / laser measurement where useful;
- postcode/service area;
- preferred use, finish, budget range and timing;
- delivery and fitting requirements.

Video is contextual evidence, not a substitute for reliable dimensions. The system must never infer a contract-critical dimension from an image or video when the client has not supplied or confirmed it.

## Guided measurement flow

The intake should actively request missing measurements, for example:

1. clear wall width;
2. floor-to-ceiling height;
3. maximum usable depth;
4. skirting/plinth dimensions;
5. door/window clearances;
6. radiator, socket, pipe and service positions;
7. access route and stair/lift constraints where relevant;
8. floor/wall irregularities that require a professional survey.

Measurements are stored in millimetres and tagged with provenance such as `CUSTOMER_TYPED`, `CUSTOMER_CONFIRMED`, `PHOTO_SUPPORTING_EVIDENCE` or `SITE_SURVEY_VERIFIED`.

`PHOTO_SUPPORTING_EVIDENCE` alone is not sufficient to make a request human-review-ready for contract-critical dimensions. The current code requires customer-entered/confirmed or site-survey-verified dimensions.

## AI responsibilities

The AI intake layer may:

- transcribe voice;
- summarise a video/photo/text submission;
- detect missing required fields;
- ask the customer targeted follow-up questions;
- classify the request by room and furniture type;
- distinguish standard-product intent from custom-manufacturing intent;
- route a standard need back to the affiliate catalogue where suitable;
- build a structured manufacturing brief;
- acknowledge receipt;
- explain that the request is pending human manufacturing review;
- prepare a concise reviewer summary.

The AI must not:

- promise that a factory can produce the item;
- issue a binding final quotation;
- confirm structural safety;
- guarantee fit from customer video/photos alone;
- approve regulated/high-risk furniture designs automatically;
- represent a third-party branded design as freely copyable;
- accept a consumer contract on behalf of a future manufacturing partner unless an explicit later commercial agreement authorises that role.

The code explicitly rejects AI output fields that attempt to make binding quotation, manufacturing-guarantee, structural-safety or order-acceptance decisions.

## Structured request contract

The canonical request is designed to include at least:

```text
request_id
created_at
customer_contact
consent_status
service_area
room_type
furniture_type
width_mm
height_mm
depth_mm
measurement_provenance
obstacles[]
access_constraints[]
material_preferences[]
finish_preferences[]
budget_range
target_date
delivery_required
fitting_required
media_refs[]
transcript
customer_notes
ai_summary
missing_information[]
risk_flags[]
route
manufacturing_status
reviewer_notes
```

Customer contact information and room media are private operational data and must never be committed to GitHub.

## Status model

Canonical states:

- `DRAFT_CUSTOMER_INPUT`
- `WAITING_FOR_CUSTOMER_INFO`
- `READY_FOR_HUMAN_REVIEW`
- `NEEDS_SITE_SURVEY`
- `NEEDS_CLARIFICATION`
- `POTENTIALLY_PRODUCIBLE`
- `DECLINED`
- `READY_FOR_QUOTATION`
- `QUOTED`
- `CUSTOMER_ACCEPTED`
- `CUSTOMER_DECLINED`
- `CLOSED`

`POTENTIALLY_PRODUCIBLE` is not a manufacturing commitment. The current state machine reserves manufacturing/quotation/decline decisions for `HUMAN_REVIEWER`; an `AI_INTAKE` actor cannot make them. Only the `CUSTOMER` actor may accept or decline a quotation.

## Routing with existing DROPi Home flows

The intake should be reached only after simpler routes are considered:

`Standard product fits` → affiliate offer

`Standard product may fit` → Will it fit? / clarification

`No suitable standard product` → Custom Furniture AI Intake

`Installation only` → future Who Fits It

A request may later branch to both manufacturing and fitting, but the responsibilities and contracts must stay separate.

## Human reviewer role

If a showroom/order-desk employee becomes available later, that person should receive a restricted role such as `CUSTOM_ORDERS_REVIEWER` rather than full administration access.

Their queue should prioritise only qualified requests:

- ready for review;
- needs survey decision;
- needs technical clarification;
- ready for quotation.

The AI should continue handling routine missing-information loops so the reviewer does not become a chat operator.

## Media, privacy and retention rules

Because customers may upload images or video from inside their homes:

- uploads must be private by default;
- the user must be warned not to film people, documents, screens or unrelated sensitive belongings where avoidable;
- files must be stored outside GitHub in private object storage;
- database media records store private storage keys, not public URLs;
- access must be role-restricted and auditable;
- retention must be documented and limited;
- deletion requests must be supported;
- AI processing must focus on the room, dimensions and requested furniture, not identity inference;
- training/fine-tuning use of customer media remains out of scope unless a later explicit lawful model is approved.

Enabling structured intake requires an approved retention period, versioned privacy notice and consent text, and evidence-backed privacy review. Enabling photo/video/audio or AI processing additionally requires processor/data-transfer review evidence.

## Employer/manufacturer dependency gate

This module must not send real leads to the current employer or any other manufacturer until a written commercial/data-processing arrangement defines:

- referral/agency/reseller status;
- customer-contract owner;
- quotation authority;
- measurement and survey responsibility;
- commission attribution;
- manufacturing, delivery and fitting responsibility;
- warranty/defect responsibility;
- customer-data sharing;
- media/brand permission;
- conflict-of-interest/employment approval where relevant.

The code has a separate `manufacturerRoutingEnabled` gate and refuses activation without agreement evidence.

## Approved implementation sequence

1. Employer-independent affiliate/catalogue and dropshipping foundations — **reached external-blocker boundary**.
2. Request state machine, consent/privacy gates and private schema — **foundation implemented; production schema pending owner approval**.
3. Provision private persistent request storage and approve retention/privacy model.
4. Add private text-only customer intake first.
5. Add AI text/voice intake only after processor review.
6. Provision private object storage and add photo/video intake plus guided measurements.
7. Add restricted human review queue.
8. Add manufacturing-partner routing only after a real written agreement exists.
9. Add `Who Fits It` as a separately governed fitting route.

The project remains fail-closed: implementation progress does not by itself authorise processing real customer data or imply any relationship with the owner's employer.
