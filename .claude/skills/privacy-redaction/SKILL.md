---
name: privacy-redaction
description: Provide anonymization/redaction rules for docs, logs, and artifacts. Use before sharing outputs externally or indexing into RAG.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: governance
---

# Privacy Redaction

## Rules
- Remove identifiers, keys, secrets, unique IDs, addresses, and any linkable metadata.
- Use consistent placeholders (ENTITY_A, SERVICE_1, USER_X).

## Output
## Redaction Map (Token -> Placeholder)
## What Must Never Be Stored
## Safe-to-Store Fields
