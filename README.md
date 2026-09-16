# DROPi Home Affiliate

**A working, pre-launch affiliate-publishing MVP — not a launched shop or an income claim.**

Working brand: **DROPi Home**. Private repository: `caliofmarian-ai/DROPi-Home-Affiliate`.
English editorial content for home organisation and small spaces in Ireland. No stock, checkout, order taking, purchased traffic, live affiliate accounts, or analytics are enabled.

## Delivery status — 16 September 2026

| Layer | Status | Evidence |
| --- | --- | --- |
| Local implementation | IMPLEMENTED | Source files and generated preview |
| Local Node tests | PASS (66/66 before Admin v1 change) | Test suite is in `tests/`; Admin v1 syntax checked separately |
| Browser UI checks | PASS, OFFLINE HARNESS ONLY | `docs/evidence/browser-qa.json`; limitations below |
| Remote GitHub repository | SOURCE UPLOADED | `main` populated in `caliofmarian-ai/DROPi-Home-Affiliate` |
| GitHub Actions execution | NOT RUN | Workflow definitions are supplied, not CI evidence |
| Private Railway preview | DEPLOYED / AUTHENTICATED | `dropi-home-affiliate-production.up.railway.app`; commercial publication still HOLD |
| Admin authentication v1 | DEPLOYED / BOOTSTRAP OPEN | Neon Auth (Better Auth) in AWS Frankfurt; first SUPER_ADMIN must be created and then explicitly promoted |
| Publication readiness | HOLD | Missing approvals listed by `npm run release:check` |
| Affiliate accounts / earnings | NOT CONNECTED / NOT MEASURED | Empty link and ledger datasets |

The standalone private repository is populated and connected to a separate Railway project. GitHub remains the canonical source. The Railway deployment is an authenticated preview only; this does not approve commercial publication or monetisation.

## Admin authentication v1

Admin identity is now separated from the temporary HTTP Basic preview gate. The first administrator uses `/admin/setup` to choose an email and password directly in the web form. Password material is handled by Neon Auth and is not committed to GitHub or stored in repository configuration. During bootstrap, the authenticated first account can reach `/admin`; after owner verification it must be explicitly assigned the `super_admin` role and bootstrap signup must be closed.

Current auth data is provisioned in a separate Neon PostgreSQL project in `aws-eu-central-1` (Frankfurt). The Railway origin is registered as a trusted auth origin. Planned future roles include `ADMIN`, `EDITOR`, `FITTER_PARTNER`, `MANUFACTURER_PARTNER`, and `SERVICE_PARTNER`; these are not yet enabled.

The old preview Basic Auth remains in front of the entire pre-launch site as a temporary second barrier. It will be rotated or removed only after the SUPER_ADMIN account is verified and the intended public/private routing is implemented.

## Run locally

Use Node 22.16+ on the 22.x line, or Node 24.x. Node 24 is the deployment target. There are **zero npm runtime or development dependencies** in the current application server; admin auth communicates with the managed Neon Auth endpoint over HTTPS.

```bash
cd DROPi-Home-Affiliate
npm run check
npm test
npm run build
npm start
```

Open `http://127.0.0.1:3000`. The supplied `.env.example` documents baseline settings; deployment auth settings are held in Railway, not committed secrets.

For a network-accessible private preview, set `HOST=0.0.0.0` and a random `PREVIEW_ACCESS_CODE` of at least 32 characters, and terminate HTTPS at a trusted host. Basic-auth username is `preview`. A preview is not private merely because it has `noindex`: the server enforces authentication when bound beyond loopback.

## What is implemented

- 19 preview HTML pages: home, guide index, 10 original guide drafts, searchable catalogue, measurement checker, editorial approach, disclosure, privacy draft, owner workspace and 404.
- 16 researched product candidates, each linked to a manufacturer page with a dated specification record. No product photography, prices, stock, delivery guarantees, star ratings, personal testing or retailer partnerships are invented.
- Search, category filters, a three-candidate comparison table and a millimetre-based fit screen with base rotation, clearance and manufacturer minimum-height constraints.
- Admin v1 routes: `/admin/setup`, `/admin/login`, `/admin`, `/admin/logout`, backed by managed email/password authentication and HttpOnly auth sessions.
- A private owner workspace with a clearly hypothetical revenue calculator and a local-only report viewer. Report contents are not uploaded or stored by the page.
- An idempotent statement-import command with separate pending, approved, paid and reversed states. It is not connected to Amazon, Awin or a bank.
- Publication and affiliate-link gates, editorial snapshot hashes, source-age audits, direct merchant-host allowlists, protected preview serving, static-output integrity checking and automated regression tests.
- Docker/Railway configuration and manually triggerable GitHub workflows. A password-protected Railway preview is deployed; no recurring task is activated.

Public builds exclude `/ops/`. Publishing does not itself enable monetisation. Live approved affiliate links must be supplied later; research links do not earn commission.

## Important boundaries

The brand is not cleared, articles are drafts, and the product list is a **research shortlist, not an affiliate-ready catalogue**. In particular, researching IKEA or Joseph Joseph does not establish that either has an available programme for this account or that the candidate is sold through a permitted Amazon/Awin offer. Programme acceptance, exact offer mapping, image/product-content rights, current delivery, operator identity and publication approval remain real work.

The source checker flags age and structure; it does **not** browse or refresh merchant pages. A deployment does not automatically attract traffic, create social accounts, or produce income. The €50/month amount is a proposal, not an authorised budget. Authorised new spending outside the explicitly requested hosting/auth infrastructure remains €0 unless separately approved.

## Documentation

- [Architecture and trust boundaries](docs/ARCHITECTURE.md)
- [Operating the site](docs/OPERATIONS.md)
- [Launch checklist](docs/LAUNCH-CHECKLIST.md)
- [Execution backlog](docs/ROADMAP.md)
- [Source and rights register](docs/SOURCES.md)
- [Security and data handling](SECURITY.md)
- [Verification and its limitations](docs/VALIDATION.md)
- [Next-session handoff](docs/HANDOFF.md)
- [Original owner-facing plan, preserved in Romanian](docs/source-plan/original-plan.ro.md)

Repository documentation is in English. Owner-facing conversation remains in Romanian.