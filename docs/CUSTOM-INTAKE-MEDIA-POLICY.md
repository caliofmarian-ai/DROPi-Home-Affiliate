# Custom Furniture Intake — Photo / Video Privacy & Lifecycle Policy

Status: APPROVED DESIGN / PRIVATE STORAGE PROVISIONED / UPLOADS NOT ACTIVE
Date: 2026-09-17

This policy covers customer-supplied room photographs and video for future custom-furniture requests. It is separate from the text-only pilot.

## Purpose

Media may be used only to understand the room/space, visible access constraints, obstacles and customer-supplied measurements relevant to a furniture request. Media is supporting evidence and must never become an AI-guaranteed measurement, structural-safety approval, final quotation or manufacturing commitment.

## Activation gates

Photo/video upload remains OFF until all of the following are real and evidenced:

- text intake is lawfully activated;
- private object storage is provisioned and access-controlled;
- media-specific privacy notice and affirmative acknowledgement/consent are versioned;
- processor / data-location / international-transfer review is approved;
- deletion lifecycle has been tested end-to-end;
- deletion-confirmation email route is configured and tested;
- controller identity and privacy contact are verified;
- no manufacturer forwarding occurs without a written agreement.

Current storage foundation: a private Neon Object Storage bucket named `dropi-custom-intake-media` is provisioned in `eu-central-1`. Runtime storage credentials are held only as Railway secrets and are not committed to GitHub or exposed to the browser. `MEDIA_UPLOADS_ENABLED=false` remains in force.

## Customer capture guidance — required before upload

The interface must present a short guided capture sequence. The customer must acknowledge it before upload.

1. Film/photograph the room or wall area needed for the furniture request, not the whole household unless necessary.
2. Ask other people, especially children, to leave the frame.
3. Avoid faces, reflections containing people and voices unrelated to the request.
4. Move or cover identity documents, passports, driving licences, mail, bank/medical papers, screens, family photographs and unrelated private items.
5. Do not deliberately record neighbours or other people through windows/doors.
6. If narrating, discuss only the room, furniture need, measurements and obstacles; avoid names and unrelated personal information.
7. For measurements, show the measuring tape/laser result where practical and also type the critical dimension into the form. Photo/video is supporting evidence, not the authoritative dimension by itself.
8. Capture relevant obstacles separately: skirting, sockets, radiators, pipes, windows, doors, ceiling slopes and access route.
9. Review the media before upload and re-record if it contains unnecessary private information.

Suggested acknowledgement:

> I have reviewed the capture guidance and, to the best of my knowledge, this media contains only information reasonably needed for my furniture request. I understand that media is supporting evidence, not a final professional measurement or manufacturing guarantee.

## Allowed media

Initial media pilot scope:

- `PHOTO` — JPEG/PNG/WebP;
- `VIDEO` — MP4/WebM;
- no standalone audio upload in the first media pilot.

Video may contain narration, but audio is not required.

## Data minimisation

- Original media stays in private object storage, never GitHub.
- No public URL is stored as the canonical reference.
- Access should be via short-lived authorised download URLs.
- Only roles that need the request may access the media.
- No media is used for advertising, model training or unrelated analytics.
- `aiDataUse` remains `NO_TRAINING`.

## Measurement rule

Photo/video may support a measurement but cannot silently create a contract-critical dimension. Critical dimensions must remain `CUSTOMER_TYPED`, `CUSTOMER_CONFIRMED` or later `SITE_SURVEY_VERIFIED` before manufacturing review.

## Media lifecycle

Owner-approved primary rule:

**Delete original media when the related request/work is terminally closed — including completed work, customer cancellation, decline or other closure where the media is no longer needed.**

Required lifecycle:

1. request enters a terminal close state with a reason;
2. all media objects for that request move to `PURGE_REQUIRED`;
3. storage deletion is attempted;
4. deletion is verified against object storage;
5. database media metadata is marked `DELETED` with deletion timestamp/reason;
6. a deletion-confirmation email is queued;
7. email is marked sent only after the configured provider reports successful submission/acceptance.

The system must not claim that media was deleted merely because a request was marked closed.

### Abandoned pre-contract requests

The Project Owner approved a **30-day inactivity fallback** for media belonging to a request that has not reached customer acceptance/contract stage and has been abandoned without formal cancellation. The 30-day timer is based on the last customer activity relevant to the request.

This fallback does **not** silently purge media for an accepted/active job merely because 30 calendar days elapsed. Once the customer has accepted the work, closure/review governs the media lifecycle.

## Customer deletion notice

Suggested subject:

`Your DROPi Home request media has been deleted`

Suggested body:

> The photos/videos associated with your custom furniture request have been removed from our active storage because the request/work has been closed. We retain only any minimal non-media record that we are required or permitted to keep for the stated business/legal purpose. If you have questions about your data, contact the privacy address shown in our privacy notice.

The final wording must contain the real controller/privacy contact before activation.

## AI / computer vision

AI analysis of media remains a separate later gate. Enabling uploads does not enable AI vision. Any future AI provider must undergo processor/data-use/transfer review and may not train on customer media under the approved policy.

## Manufacturer sharing

Media must not be forwarded to the current employer or any manufacturer until:

- the customer is transparently informed of the recipient/purpose;
- the relevant lawful basis and sharing role are documented;
- a written manufacturing/referral/data agreement exists;
- the minimum necessary media is selected for sharing.

## Production schema status

`db/migrations/003-custom-intake-media-lifecycle.sql` was tested on a temporary Neon branch and, after explicit owner approval, applied successfully to the production database on 2026-09-17. The migration records guidance/consent versions, privacy acknowledgement, verified purge metadata and deletion-email lifecycle state. It does not enable uploads by itself.
