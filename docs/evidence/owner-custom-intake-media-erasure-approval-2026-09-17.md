# Owner approval — Custom Furniture media lifecycle and erasure

Date: 2026-09-17
Status: OWNER APPROVED

The Project Owner explicitly approved all of the following:

1. deletion of the synthetic rights-verification request and cleanup of its isolated Neon test branch;
2. application of `db/migrations/003-custom-intake-media-lifecycle.sql` to the production Neon database;
3. a **30-day inactivity fallback** for media attached to abandoned **pre-contract** custom-furniture requests;
4. the previously approved primary media rule: original customer photos/videos are deleted after terminal closure of the related request/work (completion, customer cancellation, decline or other closure where the media is no longer needed), with deletion-confirmation email only after purge is technically verified;
5. future customer photo/video capability remains subject to separate privacy guidance, explicit media acknowledgement/consent, private storage and the other activation gates.

This approval does **not** enable public intake, real customer media upload, AI processing, manufacturer/employer sharing, quotation automation or checkout. Those remain independently gated.
