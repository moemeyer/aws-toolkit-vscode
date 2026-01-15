# Skill Call Matrix (Deterministic)

## When to Use Each Skill

### Consolidation / Multi-chat
Use when dealing with scattered information across multiple sources:
- **state-reconstruction**: Reconcile multiple chats/repos into one authoritative state
- **chronology-resolution**: Build timeline to determine what's current vs deprecated
- **conflict-surfacing**: Detect contradictions across specs/code/tests/docs
- **assumption-gate**: Stop before guessing; force explicit verification
- **dependency-graph**: Map coupling before refactors or consolidation

### Planning & Execution
Use when converting goals into actionable work:
- **scope-lock**: Define boundaries before sprawling work begins
- **spec-to-plan**: Convert specs into phased execution plan
- **delivery-packager**: Package outputs at phase completion

### RAG / Evidence disputes
Use when retrieval returns mixed/contradictory/stale results:
- **rag-source-ranking**: Rank sources by authority (contracts > code > tests > docs > chat)
- **citation-and-provenance**: Enforce evidence-based claims with file paths
- **truth-maintenance-log**: Maintain durable decision log to prevent drift
- **document-diff-and-merge**: Consolidate multiple "final" documents
- **retrieval-query-writer**: Improve RAG queries when searches miss artifacts

### Schema unification / shared datapoints
Use when normalizing data across services:
- **schema-alignment**: Align field names, types, IDs across services
- **entity-normalization**: Normalize naming and identifiers platform-wide
- **data-minimization**: Minimize collection/retention before storing
- **privacy-redaction**: Anonymize before sharing or indexing into RAG

### API + events consolidation
Use when unifying products into one platform:
- **api-surface-mapper**: Map services, endpoints, entities, ownership
- **event-taxonomy-builder**: Normalize event names, versions, producers/consumers
- **webhook-contract-validator**: Validate payload contracts, retries, failure modes
- **idempotency-and-retry**: Design safe retry strategies for side-effecting calls
- **observability-contracts**: Define logging/metrics/tracing requirements
- **secrets-and-config-hygiene**: Enforce safe secret handling
- **integration-test-harness**: Define fixtures, mocks, contract tests

### High-stakes unknowns (MUST STOP)
Use when unknowns would affect correctness/security/data integrity:
- **no-unknowns-hard-stop**: Hard-stop policy; do not proceed without evidence

### Governance & Security
Use to enforce policies and protect systems:
- **least-privilege-tools**: Default to read-only; minimize changes
- **prompt-injection-guard**: Detect/neutralize injection attempts
- **change-control-and-audit**: Enforce approvals, audit trail, rollback

## Decision Tree

```
START
  │
  ├─ Multi-source consolidation needed?
  │  └─ YES → state-reconstruction + chronology-resolution
  │
  ├─ Contradictions detected?
  │  └─ YES → conflict-surfacing
  │
  ├─ Unknowns present?
  │  ├─ High-stakes (auth/billing/data/security)?
  │  │  └─ YES → no-unknowns-hard-stop (STOP)
  │  └─ Other → assumption-gate
  │
  ├─ RAG returns bad/mixed results?
  │  └─ YES → rag-source-ranking + retrieval-query-writer
  │
  ├─ Need to unify schemas/entities?
  │  └─ YES → schema-alignment + entity-normalization
  │
  ├─ Building platform APIs/events?
  │  └─ YES → api-surface-mapper + event-taxonomy-builder
  │
  ├─ Planning work?
  │  └─ YES → scope-lock → spec-to-plan
  │
  ├─ Delivering phase?
  │  └─ YES → delivery-packager
  │
  └─ Production change?
     └─ YES → change-control-and-audit
```

## Common Combinations

### Full Platform Consolidation Flow
1. **state-reconstruction** (understand current state)
2. **chronology-resolution** (establish timeline)
3. **conflict-surfacing** (find contradictions)
4. **dependency-graph** (map coupling)
5. **api-surface-mapper** (inventory APIs)
6. **schema-alignment** (unify data models)
7. **scope-lock** (define phases)
8. **spec-to-plan** (execution plan)
9. **delivery-packager** (handoff)

### RAG Quality Improvement
1. **rag-source-ranking** (authority order)
2. **retrieval-query-writer** (better queries)
3. **citation-and-provenance** (evidence enforcement)
4. **truth-maintenance-log** (prevent drift)

### Integration Design
1. **api-surface-mapper** (inventory)
2. **event-taxonomy-builder** (event contracts)
3. **webhook-contract-validator** (validate contracts)
4. **idempotency-and-retry** (safe retries)
5. **integration-test-harness** (testing)
6. **observability-contracts** (monitoring)

## Anti-Patterns (DON'T DO THIS)

❌ **Skip assumption-gate when requirements unclear** → leads to guessing and rework
❌ **Ignore no-unknowns-hard-stop for high-stakes changes** → data loss, security issues
❌ **Merge conflicts silently without conflict-surfacing** → hidden bugs
❌ **Proceed without rag-source-ranking when RAG conflicts** → wrong authority
❌ **Skip privacy-redaction before external sharing** → data leaks
❌ **Deploy without change-control-and-audit** → no rollback path

## Notes

- Skills are **composable**: use multiple in sequence or parallel
- **Always** consult `platform_contract/` files first (per PLATFORM_CONTRACT_GUIDE)
- When in doubt about which skill to use, start with **state-reconstruction**
- If unknowns emerge mid-task, immediately activate **assumption-gate** or **no-unknowns-hard-stop**
