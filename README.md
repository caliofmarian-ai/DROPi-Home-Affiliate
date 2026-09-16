# DROPi Home Affiliate

**A working, pre-launch affiliate-publishing MVP — not a launched shop or an income claim.**

Working brand: **DROPi Home**. Intended private repository: `caliofmarian-ai/DROPi-Home-Affiliate`.
English editorial content for home organisation and small spaces in Ireland. No stock, checkout, order taking, purchased traffic, live affiliate accounts, or analytics are enabled.

## Delivery status — 15 September 2026

| Layer | Status | Evidence |
| --- | --- | --- |
| Local implementation | IMPLEMENTED | Source files and generated preview |
| Local Node tests | PASS | `docs/evidence/node-tests.tap` |
| Browser UI checks | PASS, OFFLINE HARNESS ONLY | `docs/evidence/browser-qa.json`; limitations below |
| Remote GitHub repository | CREATED / UPLOAD IN PROGRESS | Owner created `caliofmarian-ai/DROPi-Home-Affiliate`; remote initial commit verified |
| GitHub Actions execution | NOT RUN | Workflow definitions are supplied, not CI evidence |
| Public deployment | NOT DEPLOYED | No Railway service or domain provisioned |
| Publication readiness | HOLD | Missing approvals listed by `npm run release:check` |
| Affiliate accounts / earnings | NOT CONNECTED / NOT MEASURED | Empty link and ledger datasets |

The owner created the standalone repository. This source tree is being uploaded there without modifying any existing DROPi game, token, mobile, toolkit or trading repository. Remote verification after upload is required before SOURCE UPLOADED is claimed.

## Run locally

Use Node 22.16+ on the 22.x line, or Node 24.x. Node 24 is the deployment target; the current execution evidence uses Node 22.16.0. There are **zero npm runtime or development dependencies**.

```bash
cd DROPi-Home-Affiliate
npm run check
npm test
npm run build
npm start
```

Open `http://127.0.0.1:3000`. No account or API key is needed for local preview. The supplied `.env.example` documents settings; Node does not automatically load it. Export variables explicitly or use your deployment provider's configuration.

For a network-accessible private preview, set `HOST=0.0.0.0` and a random `PREVIEW_TOKEN` of at least 32 characters, and terminate HTTPS at a trusted host. Basic-auth username is `preview`. A preview is not private merely because it has `noindex`: the server enforces authentication when bound beyond loopback.

## What is implemented

- 19 preview HTML pages: home, guide index, 10 original guide drafts, searchable catalogue, measurement checker, editorial approach, disclosure, privacy draft, owner workspace and 404.
- 16 researched product candidates, each linked to a manufacturer page with a dated specification record. No product photography, prices, stock, delivery guarantees, star ratings, personal testing or retailer partnerships are invented.
- Search, category filters, a three-candidate comparison table and a millimetre-based fit screen with base rotation, clearance and manufacturer minimum-height constraints.
- A private owner workspace with a clearly hypothetical revenue calculator and a local-only report viewer. Report contents are not uploaded or stored by the page.
- An idempotent statement-import command with separate pending, approved, paid and reversed states. It is not connected to Amazon, Awin or a bank.
- Publication and affiliate-link gates, editorial snapshot hashes, source-age audits, direct merchant-host allowlists, protected preview serving, static-output integrity checking and automated regression tests.
- Docker/Railway configuration and manually triggerable GitHub workflows. No deployment or recurring task has been activated.

Public builds exclude `/ops/`. Publishing does not itself enable monetisation. Live approved affiliate links must be supplied later; research links do not earn commission.

## Important boundaries

The brand is not cleared, articles are drafts, and the product list is a **research shortlist, not an affiliate-ready catalogue**. In particular, researching IKEA or Joseph Joseph does not establish that either has an available programme for this account or that the candidate is sold through a permitted Amazon/Awin offer. Programme acceptance, exact offer mapping, rights, current delivery, operator identity and publication approval remain real work.

The source checker flags age and structure; it does **not** browse or refresh merchant pages. A deployment does not automatically attract traffic, create social accounts, or produce income. The €50/month amount is a proposal, not an authorised budget. Authorised new spending is €0.

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
