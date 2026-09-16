# Evidence directory

Execution results in this directory are development evidence only. They are **not** editorial, legal, publication, brand or affiliate approvals. No `data/reviews.json` or site approval entry points to them as an approval.

`node-tests.tap` records executed Node tests. `browser-qa.json` describes the offline browser harness and its limitations. `build-and-gates.txt` records the build and expected launch HOLD. `execution.json` summarises the observed local/GitHub/Railway state and missing external evidence.

Three PNG UI screenshots were generated during the implementation session (mobile fit, mobile home and desktop home). The current GitHub connector does not provide a safe direct binary-upload path used by this delivery, so the PNGs remain conversation/download artefacts rather than repository evidence. Do not replace them with fake text files bearing a `.png` extension. The machine-readable browser QA evidence in this directory is canonical for the automated UI run; physical Android acceptance is still missing.

Future approvals must be separately authored, explicit, dated and bound to the exact content/action by the relevant configuration and hashes. Never convert a test PASS or a successful private deployment into business approval.
