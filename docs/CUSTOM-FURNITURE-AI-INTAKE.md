# Custom Furniture AI Intake

Status: APPROVED DESIGN / DEFERRED IMPLEMENTATION

Owner decision: this capability is approved in principle, but implementation must wait until the independent commerce stream (affiliate, catalogue automation and any employer-independent no-stock commerce work) has been taken as far as possible without third-party account approvals or contracts.

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

Measurements should be stored in millimetres and tagged with provenance such as `CUSTOMER_TYPED`, `CUSTOMER_CONFIRMED`, `PHOTO_SUPPORTING_EVIDENCE` or `SITE_SURVEY_VERIFIED`.

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

## Structured request contract

A future canonical request should include at least:

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
photos[]
video[]
transcript
customer_notes
ai_summary
missing_information[]
risk_flags[]
route
manufacturing_status
reviewer_notes
```

Customer contact information and uploaded room media are private operational data and must never be committed to GitHub.

## Status model

Suggested states:

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

`POTENTIALLY_PRODUCIBLE` is not a manufacturing commitment. A qualified human remains responsible for the production decision and quotation.

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
- access must be role-restricted and auditable;
- retention must be documented and limited;
- deletion requests must be supported;
- AI processing must focus on the room, dimensions and requested furniture, not identity inference;
- training/fine-tuning use of customer media is out of scope unless a later explicit lawful consent model is approved.

## Employer/manufacturer dependency gate

This module may be engineered only after the independent commerce work is substantially complete, but it must not send real leads to the current employer or any other manufacturer until a written commercial/data-processing arrangement defines:

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

## Approved implementation sequence

1. Finish employer-independent affiliate/catalogue commerce work.
2. Finish employer-independent dropshipping discovery and activation gates.
3. Keep all custom-manufacturing functionality disabled.
4. Build private intake storage, consent and request state machine.
5. Add AI text/voice intake.
6. Add photo/video intake and guided measurements.
7. Add human review queue.
8. Add manufacturing-partner routing only after a real written agreement exists.
9. Add Who Fits It as a separately governed fitting route.

This document records the owner-approved concept so it is not lost while implementation is intentionally deferred.