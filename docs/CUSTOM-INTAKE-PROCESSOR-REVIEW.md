# Custom Furniture Intake — Processor / Cloud Review

Status: IN PROGRESS / ACTIVATION BLOCKER

Review date: 2026-09-17

Scope: the future text-only Custom Furniture intake only. Photo/video/audio and AI providers require a separate later review.

## 1. Controller responsibility

Irish Data Protection Commission guidance on cloud services states that, where a cloud provider processes personal data on behalf of a controller, the controller must ensure the provider offers sufficient guarantees, must have a written binding Article 28 arrangement, and must establish where/how the data is handled. Extra safeguards may be needed for processing/transfers outside the EEA.

Official DPC sources:

- https://www.dataprotection.ie/en/faqs/responsibilities-data-controllers/can-i-use-cloud-service-process-my-data
- https://www.dataprotection.ie/en/dpc-guidance/guidance-organisations-engaging-cloud-service-providers

This project therefore does not treat an EU application/database region by itself as a complete GDPR processor review.

## 2. Neon

Current project fact:

- structured intake database project is provisioned in Neon Frankfurt / EU;
- runtime application uses a dedicated least-privilege role;
- retention/erasure uses a separate maintenance role;
- media-table access is not granted to the text-intake application role.

Neon publishes a Data Processing Agreement covering Neon acting as a processor for Customer Data:

- https://neon.tech/pdf/DPA.pdf

Before activation:

- confirm how the user's Neon account accepts/executes the DPA;
- retain evidence of the applicable DPA/version;
- review applicable subprocessors and international-transfer mechanisms;
- confirm that the intended text-only fields are compatible with the account/service terms.

The Frankfurt database location must not be represented as proof that every Neon support/control-plane/subprocessor operation stays exclusively inside the EEA unless Neon documentation/contracts establish that fact.

## 3. Railway

Current project fact:

- DROPi Home application is deployed on Railway in a European Railway region;
- persistent Custom Furniture intake data is not stored on the container filesystem;
- database credentials are Railway environment secrets;
- public customer intake is still disabled.

Railway publishes GDPR compliance guidance and a standard DPA:

- https://docs.railway.com/enterprise/compliance
- https://railway.com/legal/dpa

Railway's DPA identifies the customer as controller (or processor where applicable) and Railway as processor/subprocessor for customer personal data. The published DPA also states that Railway's primary processing operations take place in the United States and provides transfer mechanisms including the EU-U.S. Data Privacy Framework where applicable and EU Standard Contractual Clauses.

Before activation:

- execute/accept Railway's standard DPA through the supported account process;
- retain evidence of the DPA/version and execution date;
- review Railway's current subprocessor list;
- document the transfer mechanism applicable to this project;
- ensure application logs do not intentionally contain intake payloads, contact data or database secrets.

## 4. Current decision

`processorReview.approved` remains `false`.

This is intentional. Infrastructure being technically functional does not satisfy the Article 28 / transfer review by itself.

## 5. Separate future gates

Do not reuse this review automatically for:

- photos or room video;
- voice/audio transcription;
- AI/LLM processing;
- object storage;
- manufacturer/employer sharing;
- fitter partner access.

Each adds providers, recipients, purposes or risks and requires a separate documented review before activation.
