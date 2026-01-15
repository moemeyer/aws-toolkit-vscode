---
name: assumption-gate
description: Prevent silent assumptions. Use when requirements, ownership, scope, environment, dates, or schemas are unclear and guessing would derail execution.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: core_reasoning
---

# Assumption Gate

## Trigger Conditions
Activate if any required element is unclear:
- requirements / acceptance criteria
- "current" vs "planned"
- source-of-truth repo/environment
- entity IDs, schemas, event contracts
- permissions, ownership, boundaries

## Procedure
1) List potential assumptions as explicit questions.
2) Convert each into a verification step (file path, grep query, test, config check).
3) If verification not possible: output **STOP** + missing inputs + safe fallback.

## Output
## Assumption Audit
## Verification Plan
## STOP (if needed)
