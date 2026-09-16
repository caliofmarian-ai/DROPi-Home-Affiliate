# Accessibility / European Accessibility Act Gate

Status: CANONICAL PRE-LAUNCH GATE
Market: Ireland
Last legal source review: 2026-09-16

## Legal scope

Ireland's European Union (Accessibility Requirements of Products and Services) Regulations 2023 (S.I. No. 636/2023) came into operation on 28 June 2025.

The Regulations define `e-commerce services` as services provided at a distance, through websites/mobile services, by electronic means and at the individual request of a consumer with a view to concluding a consumer contract. E-commerce services are expressly within the service scope.

The Regulations define a `microenterprise` as an enterprise employing fewer than 10 persons and having annual turnover not exceeding EUR 2 million **or** annual balance-sheet total not exceeding EUR 2 million. Regulation 5(4) provides that the service accessibility requirements and Regulation 14 do not apply to a service provided by a microenterprise.

Official source:

- https://www.irishstatutebook.ie/eli/2023/si/636/made/en/print

## DROPi rule

Do not assume the microenterprise exemption from the owner's current personal circumstances or from projected revenue. Before an in-scope consumer-contract/e-commerce service is publicly launched, record the actual operator/entity facts and the resulting scope decision.

The current affiliate editorial model does not itself activate checkout or conclude the consumer's purchase contract on DROPi Home. If the service evolves to DROPi checkout, dropshipping sales, booking or another consumer-contract flow, re-evaluate the exact EAA scope at that time.

## Engineering baseline regardless of exemption

Even where an exemption may ultimately apply, the project treats accessibility as a product-quality requirement. The regression suite must preserve at minimum:

- correct document language;
- descriptive page titles;
- semantic `main` landmark;
- keyboard-usable navigation and controls;
- skip-to-content link;
- visible labels for inputs;
- live/status semantics for dynamic results;
- alternative text for meaningful images;
- no reliance on images for essential text;
- responsive viewport;
- understandable errors/status messages.

`tests/accessibility-contract.test.mjs` currently checks a small static baseline. It is **not** WCAG/EAA certification and must never be described as one.

If an in-scope service without exemption is launched, complete a fuller accessibility review against the applicable statutory requirements, including identification/security/payment functionality where those functions form part of the service.

## Current state

`BASELINE IMPLEMENTED / FORMAL SCOPE DECISION HOLD`

No consumer checkout is enabled, so there is no reason to weaken other release gates while this scope decision remains unresolved.
