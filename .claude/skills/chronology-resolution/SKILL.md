---
name: chronology-resolution
description: Build a strict chronological timeline of decisions, changes, and outputs across chats/repos. Use to determine what is current vs deprecated.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: core_reasoning
---

# Chronology Resolution

## Objective
Produce a dated timeline that explains how the system evolved and which outputs supersede others.

## Procedure
- Extract dated events (commit timestamps, doc headers, chat timestamps if present).
- If no date exists, label the item **UNDATED** and do not order it confidently.
- Mark each item as: PROPOSED / IMPLEMENTED / DEPRECATED / UNKNOWN.

## Output
## Timeline (Ordered)
## Current "Source of Truth" Candidates
## Deprecated or Conflicting Artifacts
## Unknown Dates / Required Proof
