---
name: idempotency-and-retry
description: Design idempotency keys, retry strategies, and deduplication rules for APIs and events. Use for billing, provisioning, and webhook receivers.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: integrations
---

# Idempotency & Retry

## Rules
- Every side-effecting call must be idempotent or safely deduplicated.
- Retries must distinguish transient vs permanent failures.
- Store idempotency keys with TTL and result hash.

## Output
## Idempotency Key Design
## Retry Policy (backoff + limits)
## Deduplication Storage Rules
## Edge Cases & Tests
