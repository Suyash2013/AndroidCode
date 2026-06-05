---
name: effect
description: "Skill for the Effect area of AndroidCode. 85 symbols across 21 files."
---

# Effect

85 symbols | 21 files | Cohesion: 83%

## When to Use

- Working with code in `packages/`
- Understanding how getTableColumnsRuntime, orderSelectedFields, getViewSelectedFieldsRuntime work
- Modifying effect-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/effect-drizzle-sqlite/src/sqlite-core/effect/session.ts` | get, mapGetResult, getRqbV2, executeWithCache, mapCachedResult (+5) |
| `packages/opencode/src/effect/runner.ts` | next, startRun, finishShell, ensureRunning, startShell (+4) |
| `packages/opencode/src/effect/run-service.ts` | attach, runPromiseExit, runFork, getRuntime, runSync (+3) |
| `packages/effect-drizzle-sqlite/src/sqlite-core/effect/update.ts` | returning, createJoin, set, SQLiteEffectUpdateBase, SQLiteEffectUpdateBase (+2) |
| `packages/opencode/src/effect/bridge.ts` | restoreWorkspace, wrap, promise, fork, run (+2) |
| `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts` | getTableColumnsRuntime, orderSelectedFields, getViewSelectedFieldsRuntime, getTableLikeName, mapResultRow (+1) |
| `packages/effect-drizzle-sqlite/src/sqlite-core/effect/insert.ts` | select, SQLiteEffectInsertBase, returning, SQLiteEffectInsertBase, getSQL (+1) |
| `packages/opencode/src/cli/effect/prompt.ts` | optional, select, autocomplete, text, password |
| `packages/effect-drizzle-sqlite/src/sqlite-core/effect/delete.ts` | returning, SQLiteEffectDeleteBase, getSQL, _prepare |
| `packages/effect-drizzle-sqlite/src/sqlite-core/effect/select.ts` | SQLiteEffectSelectBase, _prepare, from, SQLiteEffectSelectBase |

## Entry Points

Start here when exploring this area:

- **`getTableColumnsRuntime`** (Function) — `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts:20`
- **`orderSelectedFields`** (Function) — `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts:37`
- **`getViewSelectedFieldsRuntime`** (Function) — `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts:24`
- **`getTableLikeName`** (Function) — `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts:115`
- **`mapResultRow`** (Function) — `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts:63`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `SQLiteEffectSelectBase` | Class | `packages/effect-drizzle-sqlite/src/sqlite-core/effect/select.ts` | 180 |
| `Cancelled` | Class | `packages/opencode/src/effect/runner.ts` | 10 |
| `SQLiteEffectDeleteBase` | Class | `packages/effect-drizzle-sqlite/src/sqlite-core/effect/delete.ts` | 138 |
| `SQLiteEffectInsertBase` | Class | `packages/effect-drizzle-sqlite/src/sqlite-core/effect/insert.ts` | 222 |
| `SQLiteEffectUpdateBase` | Class | `packages/effect-drizzle-sqlite/src/sqlite-core/effect/update.ts` | 223 |
| `Service` | Class | `packages/opencode/src/effect/runtime-flags.ts` | 15 |
| `getTableColumnsRuntime` | Function | `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts` | 20 |
| `orderSelectedFields` | Function | `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts` | 37 |
| `getViewSelectedFieldsRuntime` | Function | `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts` | 24 |
| `getTableLikeName` | Function | `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts` | 115 |
| `mapResultRow` | Function | `packages/effect-drizzle-sqlite/src/internal/drizzle-utils.ts` | 63 |
| `select` | Function | `packages/opencode/src/cli/effect/prompt.ts` | 18 |
| `autocomplete` | Function | `packages/opencode/src/cli/effect/prompt.ts` | 21 |
| `text` | Function | `packages/opencode/src/cli/effect/prompt.ts` | 24 |
| `password` | Function | `packages/opencode/src/cli/effect/prompt.ts` | 27 |
| `wrap` | Function | `packages/opencode/src/effect/bridge.ts` | 59 |
| `promise` | Function | `packages/opencode/src/effect/bridge.ts` | 63 |
| `fork` | Function | `packages/opencode/src/effect/bridge.ts` | 65 |
| `run` | Function | `packages/opencode/src/effect/bridge.ts` | 67 |
| `next` | Function | `packages/opencode/src/effect/runner.ts` | 53 |

## How to Explore

1. `gitnexus_context({name: "getTableColumnsRuntime"})` — see callers and callees
2. `gitnexus_query({query: "effect"})` — find related execution flows
3. Read key files listed above for implementation details
