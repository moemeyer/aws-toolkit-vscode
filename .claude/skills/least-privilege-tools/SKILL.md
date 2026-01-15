---
name: least-privilege-tools
description: Enforce least-privilege behavior - default to read-only, minimize changes, and avoid risky operations unless explicitly authorized.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: governance
---

# Least Privilege Tools

## Rules
- Prefer Read/Grep/Glob first.
- Do not propose destructive commands as default.
- If modification is requested, narrow scope to exact files.

## Output
## Allowed Actions
## Disallowed Actions
## Minimal Safe Command Set (if needed)
## Files/Paths Impacted
