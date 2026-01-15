# Anonymous Platform Skills Pack

> **Complete skill bundle for platform consolidation, RAG governance, and API/event unification**

## Overview

This skills pack provides 28 production-ready Claude Code skills organized into 4 categories:

- **Core Reasoning** (8 skills): State reconstruction, chronology, conflicts, assumptions, dependencies
- **Data/RAG** (7 skills): Source ranking, schema alignment, entity normalization, citations, truth maintenance
- **Integrations/APIs** (7 skills): API mapping, webhooks, events, idempotency, secrets, observability
- **Governance/Enforcement** (6 skills): Hard stops, least privilege, prompt injection guards, privacy

## Installation

### Option 1: Project-Local (Recommended)

The skills are already installed in `.claude/skills/` and will be auto-discovered by Claude Code.

**No additional setup required** - just start using Claude Code in this project.

### Option 2: Personal Skills (Cross-Project)

To use these skills across all your projects:

```bash
# Copy skills to your personal skills directory
cp -r .claude/skills/* ~/.claude/skills/
```

### Option 3: Plugin Install (Future)

If using a Claude Code plugin marketplace:

```bash
claude install .claude-plugin/marketplace.json
```

## Quick Start

### 1. Basic Usage

Claude Code will automatically load relevant skills based on your task description. For example:

**Consolidating scattered work:**
```
"Help me reconstruct the current state of our platform from multiple chat logs and repos"
```
→ Activates: `state-reconstruction`, `chronology-resolution`

**Detecting conflicts:**
```
"Check if our API docs match the actual implementation"
```
→ Activates: `conflict-surfacing`, `rag-source-ranking`

**Planning platform work:**
```
"Help me plan the unification of our three separate products into one platform"
```
→ Activates: `scope-lock`, `spec-to-plan`, `api-surface-mapper`

### 2. Explicit Skill Invocation

You can also explicitly request skills:

```
"Use the state-reconstruction skill to analyze our current platform architecture"
```

```
"Apply the no-unknowns-hard-stop skill before proceeding with this database migration"
```

### 3. Platform Contract Setup

**Important**: For best results, populate the platform contract files:

```
platform_contract/
├── services.yaml       # Your services inventory
├── entities.yaml       # Canonical entity definitions
├── events.yaml         # Event contracts and schemas
├── ownership.yaml      # Source of truth rules
├── id_rules.yaml       # ID formats and constraints
└── truth_log.md        # Decision log (append-only)
```

These files provide authoritative reference data that skills will consult first.

## Skill Categories

### Core Reasoning

| Skill | Use When |
|-------|----------|
| `state-reconstruction` | Consolidating scattered work into one coherent state |
| `chronology-resolution` | Building timeline to determine what's current |
| `conflict-surfacing` | Detecting contradictions across sources |
| `assumption-gate` | Requirements/scope unclear; prevent guessing |
| `dependency-graph` | Mapping coupling before refactors |
| `scope-lock` | Defining boundaries before work sprawls |
| `spec-to-plan` | Converting specs into executable plans |
| `delivery-packager` | Packaging outputs for handoff |

### Data/RAG

| Skill | Use When |
|-------|----------|
| `rag-source-ranking` | RAG returns mixed/contradictory results |
| `schema-alignment` | Normalizing data across services |
| `entity-normalization` | Multiple terms for same concept |
| `citation-and-provenance` | Enforcing evidence-based claims |
| `retrieval-query-writer` | Improving RAG search quality |
| `document-diff-and-merge` | Consolidating multiple "final" docs |
| `truth-maintenance-log` | Preventing drift across iterations |

### Integrations/APIs

| Skill | Use When |
|-------|----------|
| `api-surface-mapper` | Unifying products into one platform |
| `webhook-contract-validator` | Validating event/webhook contracts |
| `event-taxonomy-builder` | Normalizing event names/versions |
| `idempotency-and-retry` | Designing safe retry strategies |
| `secrets-and-config-hygiene` | Handling credentials safely |
| `integration-test-harness` | Defining test fixtures and mocks |
| `observability-contracts` | Defining logging/metrics/tracing |

### Governance/Enforcement

| Skill | Use When |
|-------|----------|
| `no-unknowns-hard-stop` | High-stakes changes with unknowns (MUST STOP) |
| `least-privilege-tools` | Enforcing read-only defaults |
| `prompt-injection-guard` | Detecting injection attempts |
| `data-minimization` | Minimizing data collection/retention |
| `privacy-redaction` | Anonymizing before sharing/indexing |
| `change-control-and-audit` | Production changes requiring audit trail |

## Common Workflows

### Full Platform Consolidation

```
1. state-reconstruction       (understand current state)
2. chronology-resolution      (establish timeline)
3. conflict-surfacing         (find contradictions)
4. dependency-graph           (map coupling)
5. api-surface-mapper         (inventory APIs)
6. schema-alignment           (unify data models)
7. scope-lock                 (define phases)
8. spec-to-plan               (execution plan)
9. delivery-packager          (handoff)
```

### RAG Quality Improvement

```
1. rag-source-ranking         (authority order)
2. retrieval-query-writer     (better queries)
3. citation-and-provenance    (evidence enforcement)
4. truth-maintenance-log      (prevent drift)
```

### Integration Design

```
1. api-surface-mapper         (inventory)
2. event-taxonomy-builder     (event contracts)
3. webhook-contract-validator (validate contracts)
4. idempotency-and-retry      (safe retries)
5. integration-test-harness   (testing)
6. observability-contracts    (monitoring)
```

## Decision Matrix

See `SKILL_CALL_MATRIX.md` for complete decision tree and combinations.

**Key principle**: When in doubt, start with `state-reconstruction`.

## Authority Hierarchy

Skills follow this authority order (highest to lowest):

1. `platform_contract/*.yaml` (canonical truth)
2. OpenAPI specs / database migrations
3. Enforcing code (validators, runtime checks)
4. CI tests and fixtures
5. Deployment config (IaC, env templates)
6. Design docs and tickets
7. Chat logs and narratives

## Security & Governance

### Hard-Stop Policy

The `no-unknowns-hard-stop` skill **MUST** be used for:
- Auth/permissions changes
- Billing/money movement
- Data deletion/migration
- Security posture changes
- Cross-system contract updates

### Privacy by Default

All skills respect:
- `data-minimization`: Collect only what's needed
- `privacy-redaction`: Anonymize before sharing
- `secrets-and-config-hygiene`: Never expose credentials
- `least-privilege-tools`: Default to read-only

### Prompt Injection Protection

The `prompt-injection-guard` skill detects:
- Requests to ignore instructions
- Tool-use coercion without justification
- Hidden directives in data (HTML comments, base64, etc.)

## Maintenance

### Updating Platform Contracts

All changes to `platform_contract/*.yaml` must:
1. Go through `change-control-and-audit`
2. Append decision to `truth_log.md` with evidence
3. Update any affected skills

### Quarterly Review

- Review all `truth_log.md` entries
- Archive deprecated decisions (don't delete)
- Update authority sources as system evolves

## Troubleshooting

### Skills Not Loading

1. Check file paths: `.claude/skills/<skill-name>/SKILL.md`
2. Verify frontmatter has required keys (`name`, `description`)
3. Restart Claude Code

### Incorrect Authority Sources

1. Update `platform_contract/*.yaml` files
2. Run `rag-source-ranking` to re-establish order
3. Append changes to `truth_log.md`

### Unknowns Blocking Progress

1. Use `assumption-gate` to list all unknowns
2. For high-stakes: use `no-unknowns-hard-stop`
3. Document safe alternatives

## Advanced Usage

### Custom Skill Combinations

Skills are composable. Create your own workflows:

```
# Example: Pre-deployment checklist
1. conflict-surfacing          (check for contradictions)
2. integration-test-harness    (verify tests pass)
3. observability-contracts     (logging/metrics ready)
4. change-control-and-audit    (approval + rollback plan)
```

### Tool Restrictions

All skills use `allowed-tools: [Read, Grep, Glob]` for safety.

To modify or extend, edit the `allowed-tools` array in each `SKILL.md` frontmatter.

### Extending the Pack

To add a new skill:

1. Create `.claude/skills/<new-skill>/SKILL.md`
2. Follow frontmatter spec (see existing skills)
3. Update `SKILL_CALL_MATRIX.md`
4. Append decision to `truth_log.md`

## References

- **Skill Specification**: See any `SKILL.md` for format
- **Decision Matrix**: `SKILL_CALL_MATRIX.md`
- **Platform Contracts**: `PLATFORM_CONTRACT_GUIDE.md`
- **Truth Log**: `platform_contract/truth_log.md`

## Support

For issues or questions:
1. Check `SKILL_CALL_MATRIX.md` for correct skill usage
2. Review `platform_contract/truth_log.md` for decisions
3. Verify Claude Code is running latest version

## License

MIT (see individual `SKILL.md` files)

---

**Version**: 1.0.0
**Last Updated**: 2025-01-15
