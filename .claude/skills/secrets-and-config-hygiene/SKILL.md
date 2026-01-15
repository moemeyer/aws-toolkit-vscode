---
name: secrets-and-config-hygiene
description: Enforce safe handling of secrets and configuration across environments. Use whenever env vars, API keys, signing secrets, or credentials appear.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: integrations
---

# Secrets & Config Hygiene

## Rules
- Never print secrets.
- Prefer secret managers over committed config.
- Separate dev/stage/prod; no shared keys.
- Rotate on exposure risk.

## Output
## Secret Inventory (redacted)
## Where Each Secret Must Live
## Environment Separation Rules
## Rotation & Incident Steps
