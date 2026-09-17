# Custom Furniture intake — synthetic rights-access verification

Date: 2026-09-17

Environment: isolated Neon branch cloned from production schema. No real customer data was used.

Synthetic request:

- request id: `DH-RIGHTS-TEST-0001`
- contact: `synthetic-rights@example.org`
- purpose: verify the request-id + matching-contact lookup rule before any real pilot activation.

Verified results:

1. Exact request ID + exact normalized contact returned exactly the synthetic request.
2. The same request ID + a wrong contact returned zero matches.
3. Production was not modified and no real personal data was inserted.
4. The code-level rights service separately requires both request ID and matching contact before returning intake data.
5. Erasure execution has NOT yet been verified end-to-end. It remains pending an explicit destructive-test approval on the isolated branch.

This evidence supports `ACCESS_VERIFIED_ERASURE_PENDING`, not full rights-procedure approval.
