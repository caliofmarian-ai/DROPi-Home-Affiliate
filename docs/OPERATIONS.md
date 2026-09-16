# Operations

## Repeatable checks

```bash
npm run check
npm test
npm run build
npm run audit:content
npm run release:check
```

The last command currently exits **2 with HOLD** because real launch evidence is missing. Do not change approval flags just to get a zero exit. The content audit checks recorded evidence age; it performs no live merchant requests. For an actual recheck, open each source, confirm the exact SKU/variant, dimensions, restrictions, rights and current offer, record the outcome, and update data only where evidence supports it.

A changed article or catalogue invalidates its approval hash. Record a real reviewer, date, content hash and evidence document through `data/reviews.json`. `src/domain.mjs` defines the executable approval contract. Do not copy synthetic test approvals into production data.

## Local commission reports

All programme accounts are unconnected. Until a real programme export exists, `data/ledger.json` remains empty.

The importer accepts a deliberately small normalised JSON array, not arbitrary vendor CSV. Each event requires `provider`, `transactionId`, `status`, `commissionCents`, `currency`, `updatedAt` and `statementRef`. Use integer EUR cents, no customer data, and canonical UTC timestamps. Amount changes for an existing transaction require explicit investigation, not silent overwrite. Non-EUR currencies require a future audited adapter.

For a synthetic smoke test only:

```bash
npm run ledger:import -- examples/synthetic-events.json --out private/example-ledger.json
npm run ledger:import -- examples/synthetic-events.json --out private/example-ledger.json
```

The second run must not duplicate income. The imported file stays under ignored `private/`, uses restrictive permissions and a lock/atomic replacement. Never confuse synthetic output with business results.

## Cost control

The owner explicitly authorised creation and publication of this private Railway preview in chat. No separate recurring spending ceiling was set for this deployment. Keep the service minimal, add no database/volume/paid API/ads without separate need, and monitor Railway usage. The previously discussed €50/month figure remains only a proposed experimental ceiling, not blanket authorisation for other spend.

GitHub Actions files are manual-only; they have not been run. Do not infer CI PASS from local tests.

## Current Railway preview

- Project: `DROPi-Home-Affiliate` (separate from all other Railway projects).
- Source: `caliofmarian-ai/DROPi-Home-Affiliate`, branch `main`.
- Domain: `https://dropi-home-affiliate-production.up.railway.app`.
- Mode: `RELEASE_MODE=preview`.
- Host/port: `0.0.0.0:3000`.
- Access: HTTP Basic username `preview`; password is stored only in Railway as `PREVIEW_ACCESS_CODE`. Never put its value in Git.
- `/healthz` is intentionally unauthenticated for hosting health checks. Preview pages require authentication.

Railway’s Docker build has executed successfully. The real deployment log confirmed the server listening on `0.0.0.0:3000`, matching the service-domain target port.

For any future deployment, keep `RELEASE_MODE=preview` until the launch checklist is satisfied. Only after launch gates pass should an approved `SITE_ORIGIN` and `RELEASE_MODE=public` be used. Runtime-only variable changes do not regenerate static build content; verify the actual build log when changing build-time settings.

## Owner phone acceptance

On physical Android, verify: authentication challenge, home rendering, navigation, search/filter, comparison, fit calculator, disclosure/privacy drafts, owner workspace and absence of checkout/live affiliate claims. Record any failure before public publication.

## Optional UI checks

`python scripts/browser-qa.py http://127.0.0.1:3000 private/browser-qa` needs separately installed Playwright/Chromium and a running local server. `--offline` reads generated HTML and local assets. Offline results do not prove network navigation, CSP enforcement or physical Android behaviour.
