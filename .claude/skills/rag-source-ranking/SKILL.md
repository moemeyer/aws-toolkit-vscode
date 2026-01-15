---
name: rag-source-ranking
description: Rank sources returned by retrieval and decide authority order. Use when RAG returns mixed/contradictory results or stale docs.
license: MIT
allowed-tools: [Read, Grep, Glob]
metadata:
  category: data_rag
---

# RAG Source Ranking

## Authority Order
1) canonical contracts (OpenAPI, migrations, platform_contract)
2) enforcing code (validators, runtime checks)
3) CI tests/fixtures
4) deployment config (IaC, env templates)
5) design docs/tickets
6) chat narratives

## Output
## Ranked Sources Used
## Conflicts Detected
## Retrieval Filters Recommended (paths/tags)
