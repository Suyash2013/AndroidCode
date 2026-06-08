---
name: domain
description: "Skill for the Domain area of AndroidCode. 73 symbols across 8 files."
---

# Domain

73 symbols | 8 files | Cohesion: 72%

## When to Use

- Working with code in `packages/`
- Understanding how rowsFromAggregates, rowsFromAggregates, rowsFromAggregates work
- Modifying domain-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/stats/core/src/domain/home.ts` | normalizeStatRow, normalizeProviderRow, normalizeGeoRow, normalizeTier, dateTime (+22) |
| `packages/stats/core/src/domain/stat.ts` | synthesizeAllTierRows, collapseRows, combineRows, rankRowsWithMarketShare, normalizeCountry (+9) |
| `packages/stats/core/src/domain/inference.ts` | toModelAggregate, toGeoAggregate, toProviderAggregate, toStatBaseAggregate, integer (+6) |
| `packages/stats/core/src/honeycomb-backfill.ts` | modelRowsFromAggregates, providerRowsFromAggregates, geoRowsFromAggregates, periodKey, parseTime (+5) |
| `packages/stats/core/src/domain/model-normalization.ts` | normalizeInferenceModel, modelAuthor, statModel, statProvider |
| `packages/stats/core/src/domain/model.ts` | rowsFromAggregates, ModelStatRepo, rankRows |
| `packages/stats/core/src/domain/geo.ts` | rowsFromAggregates, GeoStatRepo |
| `packages/stats/core/src/domain/provider.ts` | rowsFromAggregates, ProviderStatRepo |

## Entry Points

Start here when exploring this area:

- **`rowsFromAggregates`** (Function) — `packages/stats/core/src/domain/geo.ts:195`
- **`rowsFromAggregates`** (Function) — `packages/stats/core/src/domain/model.ts:157`
- **`rowsFromAggregates`** (Function) — `packages/stats/core/src/domain/provider.ts:172`
- **`synthesizeAllTierRows`** (Function) — `packages/stats/core/src/domain/stat.ts:94`
- **`collapseRows`** (Function) — `packages/stats/core/src/domain/stat.ts:107`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `GeoStatRepo` | Class | `packages/stats/core/src/domain/geo.ts` | 55 |
| `ModelStatRepo` | Class | `packages/stats/core/src/domain/model.ts` | 47 |
| `ProviderStatRepo` | Class | `packages/stats/core/src/domain/provider.ts` | 44 |
| `rowsFromAggregates` | Function | `packages/stats/core/src/domain/geo.ts` | 195 |
| `rowsFromAggregates` | Function | `packages/stats/core/src/domain/model.ts` | 157 |
| `rowsFromAggregates` | Function | `packages/stats/core/src/domain/provider.ts` | 172 |
| `synthesizeAllTierRows` | Function | `packages/stats/core/src/domain/stat.ts` | 94 |
| `collapseRows` | Function | `packages/stats/core/src/domain/stat.ts` | 107 |
| `combineRows` | Function | `packages/stats/core/src/domain/stat.ts` | 119 |
| `rankRowsWithMarketShare` | Function | `packages/stats/core/src/domain/stat.ts` | 190 |
| `toModelAggregate` | Function | `packages/stats/core/src/domain/inference.ts` | 159 |
| `toGeoAggregate` | Function | `packages/stats/core/src/domain/inference.ts` | 175 |
| `normalizeInferenceModel` | Function | `packages/stats/core/src/domain/model-normalization.ts` | 18 |
| `modelAuthor` | Function | `packages/stats/core/src/domain/model-normalization.ts` | 22 |
| `statModel` | Function | `packages/stats/core/src/domain/model-normalization.ts` | 29 |
| `statProvider` | Function | `packages/stats/core/src/domain/model-normalization.ts` | 35 |
| `normalizeCountry` | Function | `packages/stats/core/src/domain/stat.ts` | 257 |
| `toProviderAggregate` | Function | `packages/stats/core/src/domain/inference.ts` | 169 |
| `normalizeTier` | Function | `packages/stats/core/src/domain/stat.ts` | 252 |
| `periodKeyFor` | Function | `packages/stats/core/src/domain/stat.ts` | 160 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Cluster_1420 | 3 calls |
| Cluster_1421 | 2 calls |

## How to Explore

1. `gitnexus_context({name: "rowsFromAggregates"})` — see callers and callees
2. `gitnexus_query({query: "domain"})` — find related execution flows
3. Read key files listed above for implementation details
