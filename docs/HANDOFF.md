# Session handoff — 2026-09-16

## Owner request

Create and populate a standalone GitHub repository for the agreed affiliate-business MVP, connect it to Railway, and provide a real private preview that can be checked from the owner’s phone.

## Current state

Canonical repository: `caliofmarian-ai/DROPi-Home-Affiliate`, branch `main`. The source, tests, editorial drafts, research data and delivery documentation are uploaded. GitHub remains the source of truth.

A separate private Railway project named `DROPi-Home-Affiliate` is connected to `main`. The preview service is deployed at `https://dropi-home-affiliate-production.up.railway.app`, routes to port 3000, and runs in `RELEASE_MODE=preview`. Network preview access is protected by HTTP Basic authentication; the credential lives only in Railway variables and must never be committed.

The Railway deployment is **not** commercial publication. Affiliate links remain inactive, checkout is absent, analytics is absent and publication readiness remains `HOLD`.

## Verified evidence

- Local Node test suite: 66/66 PASS.
- Local static build: 19 pages, 10 guide drafts and 16 researched product candidates.
- Offline Chromium QA harness: PASS; it is not a physical Android test.
- GitHub source: uploaded to `main` and read back through the connected GitHub API.
- Railway: Docker build executed successfully and the container was observed listening on `0.0.0.0:3000`.
- Railway domain: `dropi-home-affiliate-production.up.railway.app`, target port 3000.
- Commercial release check: intentionally `HOLD` until real owner/editorial/privacy/brand/programme approvals exist.

## Owner acceptance still required

1. Open the private Railway preview on the owner’s physical Android phone.
2. Confirm authentication blocks access with a wrong password and allows access with the current Railway-only credential.
3. Check home, Guides, Research shortlist, Will it fit?, disclosure/privacy drafts and owner workspace.
4. Report any wording, layout or navigation changes before public launch work.

## Business work still open

Programme sign-ups, payout setup, real affiliate URLs, operator identity, brand/domain clearance, final privacy/disclosure wording, guide approval, product-offer mapping, analytics consent design, traffic acquisition and revenue verification are not complete. The 16 candidates are a research shortlist, not claimed merchant partnerships. The ten guides are drafts.

## Safety and authority

Do not switch to `RELEASE_MODE=public`, enable indexing, add tracking IDs, invent approvals or activate paid acquisition merely to make the project look launched. Real affiliate credentials and payout details belong only on the relevant official platforms. GitHub remains canonical; Railway is a deployment target.
