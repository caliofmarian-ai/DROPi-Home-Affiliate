# Security and data handling

## Threat model for this MVP

This project is an editorial publisher preview with no account system, checkout, order processing, live affiliate API or analytics. The principal risks are accidental publication of owner data or credentials, serving repository source rather than generated output, unsafe outbound-link substitution, and mistaking synthetic/research data for commercial evidence.

## Controls

- Runtime serves only generated `dist/` output. It does not expose source, `.git`, `.env`, private reports or operational documentation.
- Network-accessible preview mode requires HTTP Basic authentication using a server-side `PREVIEW_TOKEN` of at least 32 characters. Loopback local preview can run without a token.
- Affiliate destinations are disabled by default and are allowed only for an approved programme, exact active product mapping, allowed destination host, fresh product evidence and public release mode.
- External links use safe link attributes. Research links are visually labelled and never treated as affiliate destinations.
- The local report viewer parses a user-selected JSON file in the browser and does not upload it.
- Statement ingestion refuses customer identity fields and stores only transaction-level commission state required for reconciliation.
- Content integrity is checked against stored editorial hashes before commercial links can resolve.
- Real credentials, identity documents, bank exports and vendor statements are excluded from Git and must stay outside this project.

## Credentials

Do not commit tokens or secret keys. Use deployment variables. Never paste production affiliate keys, Meta credentials, email passwords, bank details or identity documents into issues, commits or repository data.

## Reporting

If a secret is accidentally committed, treat it as compromised: revoke/rotate it first, then remove it from the repository history using an appropriate history-rewrite procedure. A later public site should add a dedicated security contact only after the operator identity and domain are approved.
