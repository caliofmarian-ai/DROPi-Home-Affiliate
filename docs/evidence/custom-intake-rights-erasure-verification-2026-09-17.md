# Custom Furniture Intake — erasure verification evidence

Date: 2026-09-17
Environment: isolated Neon test branch only
Production customer data affected: NONE

Synthetic request used: `DH-RIGHTS-TEST-0001`

Verified sequence:

1. the synthetic request existed only on the isolated rights-verification branch;
2. exact request ID + matching synthetic contact was previously verified to identify the request, while the same ID with a wrong contact returned zero matches;
3. after explicit owner approval, the synthetic request was deleted;
4. a follow-up query returned `remaining = 0` for `DH-RIGHTS-TEST-0001`;
5. the isolated rights-verification branch was then deleted;
6. the production branch, SUPER_ADMIN account and production Custom Furniture data were not modified by this erasure test.

Conclusion: the controlled database-erasure path and identity-match prerequisite are verified for the private-pilot governance model. Application-level collection remains disabled until the remaining controller/contact/privacy/processor gates pass.
