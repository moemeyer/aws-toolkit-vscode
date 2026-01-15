# Platform Contract Guide (Canonical)

## Purpose
All "one platform" decisions must land in `platform_contract/*.yaml` so the system has a stable source of truth.

## Authority
platform_contract > OpenAPI > migrations > validators > tests > deployment config > docs > chat logs

## Required files
- **services.yaml**: list services + ownership
- **entities.yaml**: canonical entities + keys + lifecycle
- **events.yaml**: canonical events + versions + payload schema pointers
- **ownership.yaml**: source of truth per entity + conflict resolution rules
- **id_rules.yaml**: ID formats + constraints + idempotency keys
- **truth_log.md**: append-only decisions w/ evidence

## Usage
1. All skills that need authoritative data MUST consult these files first
2. Conflicts between these files and code/docs trigger `conflict-surfacing`
3. Updates require `change-control-and-audit` approval
4. All changes append to `truth_log.md` with evidence

## Maintenance
- Review quarterly
- Update on major platform changes
- Archive deprecated entries (don't delete)
- Keep all historical decisions for chronology

## Skills That Use This
- state-reconstruction
- rag-source-ranking
- schema-alignment
- entity-normalization
- api-surface-mapper
- event-taxonomy-builder
- citation-and-provenance
