---
name: no-unknowns-hard-stop
description: Hard-stop policy - do not proceed when unknowns would materially affect correctness, security, or data integrity. Use for high-stakes changes.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: governance
---

# No-Unknowns Hard Stop

## Trigger
Stop if unknowns affect:
- auth/permissions
- billing/money movement
- data deletion/migration
- security posture or secrets
- cross-system contracts

## Output
## STOP
## Unknowns
## Why They Matter
## Exactly What Evidence/Input Resolves Each
## Safe Alternatives That Avoid Guessing
