# Truth Maintenance Log

> **Append-only log of platform decisions with evidence**
>
> Never delete entries. Mark deprecated decisions as `[DEPRECATED]` and reference the superseding decision.

## Format

Each entry must include:
- **Date**: ISO 8601 format (YYYY-MM-DD)
- **Claim/Decision**: What was decided
- **Evidence**: File paths, commit hashes, or other proof
- **Status**: Proposed | Accepted | Deprecated
- **Owner**: Team or person responsible
- **Follow-up**: Next actions or review date

---

## Entries

### Example Entry (delete this after adding real entries)

**Date**: 2025-01-15
**Claim**: User entity uses UUID v4 for primary identifier
**Evidence**:
- `platform_contract/entities.yaml` line 12
- `services/identity/src/models/user.ts` line 23
- Migration `20250115_add_user_uuid.sql`

**Status**: Accepted
**Owner**: Identity Team
**Follow-up**: Review if performance issues arise; consider ULID if ordering needed

---

<!-- Add new entries below in reverse chronological order (newest first) -->
