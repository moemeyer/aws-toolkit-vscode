---
name: conflict-surfacing
description: Detect and present contradictions across specs, code, tests, and docs without resolving them silently. Use whenever two sources disagree.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: core_reasoning
---

# Conflict Surfacing

## Rules
- Preserve both claims verbatim (paraphrase ok, but keep meaning exact).
- Identify impact: data loss, incorrect billing, auth failure, broken integration, etc.
- Recommend resolution path: update spec, update code, or add tests/validators.

## Output
## Conflict Table (Topic | Claim A | Source A | Claim B | Source B | Impact)
## Recommended Resolution Actions
