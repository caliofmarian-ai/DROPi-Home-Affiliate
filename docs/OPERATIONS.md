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

The importer accepts a deliberately small normalised JSON array, not arbitrary vendor CSV. Each event requires `provider`, `transactionId`, `status`, `commissionCents`, `currency`, `updatedAt` and `statementRef`. Use integer EUR cents, no customer data, and canonical UTC timestamps such as `2026-09-15T12:00:00.000Z`. Amount changes for an existing transaction require explicit investigation, not silent overwrite. Non-EUR currencies must be handled by a future audited adapter.

For a synthetic smoke test only:

```bash
npm run ledger:import -- examples/synthetic-events.json --out private/example-ledger.json
npm run ledger:import -- examples/synthetic-events.json --out private/example-ledger.json
```

The second run must not duplicate income. The imported file stays under ignored `private/`, uses restrictive permissions and a lock/atomic replacement. Back it up privately outside Git as appropriate. Never confuse the synthetic example with business results. The local owner workspace can open the resulting JSON file; it reads it in the browser without uploading it. It labels all totals as report-based, not bank-reconciled.

## Cost control

Authorised new monthly spend: **€0**. Proposed experimental ceiling: €50/month, pending owner approval. No paid APIs, cron jobs, ads or asset-generation calls are invoked. GitHub Actions files are manual-only until running CI is authorised within an account quota/budget. A run still consumes runner minutes; no claim about free remaining account quota is made.

## Hosting procedure — later, after authorisation

1. Approve a separate Railway service and an explicit cost ceiling. Do not reuse an existing project's service, database, volume or secrets.
2. Keep `RELEASE_MODE=preview`. Use a cryptographically random `PREVIEW_TOKEN` of at least 32 characters in Railway variables and HTTPS at its proxy. Never commit or print the real token. Network host is `0.0.0.0`.
3. Build and run the supplied Dockerfile; configure `/healthz`. Verify unauthenticated page access is 401, authenticated preview works, and private files cannot be retrieved. Docker has not been executed in the current environment.
4. Record real deployment SHA, URL, timestamp and health results. Test on the owner's physical Android phone.
5. Only after launch gates pass, build explicitly with `RELEASE_MODE=public` and approved `SITE_ORIGIN`. Docker accepts those build arguments. Runtime-only variable changes do not regenerate the static build. Do not assume Railway forwards build settings until verified in its actual build log.

No production rollback automation is connected. Keep a previous reviewed build, but do not roll back to content whose evidence has expired.

## Optional UI checks

`python scripts/browser-qa.py http://127.0.0.1:3000 private/browser-qa` needs separately installed Playwright/Chromium and a running local server. This is not an npm application dependency. `--offline` instead reads the generated HTML, injects CSS and application JS and substitutes the catalogue request with local build data. Offline results do not prove module loading, CSP enforcement, HTTP navigation or physical Android behaviour.
