# Validation — 2026-09-15

## Executed

| Check | Observed result | Evidence |
| --- | --- | --- |
| Node runtime | v22.16.0 | execution.json |
| Source/configuration check | PASS, 10 drafts / 16 candidates | build-and-gates.txt |
| Node unit + local HTTP integration tests | **66 passed, 0 failed** | node-tests.tap |
| Preview build | 19 HTML pages generated | build-and-gates.txt |
| Source-age audit | Recorded sources within configured window on research date | source-age-audit.json.log |
| Public release gate | **HOLD, 16 blockers**, expected exit 2 | build-and-gates.txt |
| Browser DOM/interaction checks | **56 passed**, Chromium 144.0.7559.96 | browser-qa.json |
| Report import smoke | First import 3 transitions; repeat 0 applied, 1 duplicate, 2 stale | synthetic-import.txt |

Evidence paths above are under `docs/evidence/`.

## Browser scope

The environment's Chromium administrator policy blocks navigation, including localhost. The policy was not changed. Browser checks instead rendered the built local HTML, injected the actual local stylesheet and application JavaScript, and substituted the catalogue fetch with the generated catalogue data. This checks the DOM, form logic, filters, comparison, results, layout and local file viewer, **not** real browser networking, native ES-module resolution, CSP enforcement or production hosting. Local HTTP integration tests exercise the actual server separately.

Mobile viewport: 390 × 844 CSS pixels. Desktop viewport: 1440 × 1000. Nine page routes were checked for a main landmark, a single H1 and horizontal overflow. Search (including diacritics), comparison limit, maker minimum-height fit constraints, a hypothetical scenario and synthetic local report viewing were exercised. No script errors were reported. These are not tests on the owner's physical Android phone.

Images `home-mobile.png`, `home-desktop.png` and `fit-mobile.png` were inspected visually; text and major controls are within the checked viewports. The project uses no product imagery or third-party resources.

## Not executed or not established

Remote repository creation/upload, GitHub Actions, Node 24 runtime execution, Docker build/security scanning, Railway deployment, a live hosted browser session, physical Android acceptance, accessibility certification, production performance/load testing, affiliate attribution, payout reconciliation and income generation. Workflow/Docker definitions alone prove none of these.

The passing synthetic public-build and affiliate fixtures are in temporary test directories only. They are explicitly labelled synthetic; no real configuration receives their approval flags. All operational approval records remain unapproved and the live link list remains empty.
