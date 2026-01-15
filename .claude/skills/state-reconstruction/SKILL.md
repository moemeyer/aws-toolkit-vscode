---
name: state-reconstruction
description: Reconstruct the current authoritative system state from multiple chats, repos, and artifacts. Use when consolidating scattered work into one coherent platform snapshot.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: core_reasoning
---

# State Reconstruction

## Objective
Reconstruct *the authoritative current state* of a system by reconciling multiple sources without guessing.

## Rules
1) No silent assumptions. If not supported, label **UNKNOWN**.
2) Conflicts must be explicitly surfaced (do not "merge" contradictions).
3) Separate: **Observed facts** vs **Inferences** vs **Unknowns**.

## Output (exact headings)
## Authoritative State (Facts)
## Conflicts
## Unknowns / Missing Inputs
## Next Actions
## Artifacts Indexed
