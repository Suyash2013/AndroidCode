---
name: config
description: "Skill for the Config area of AndroidCode. 76 symbols across 23 files."
---

# Config

76 symbols | 23 files | Cohesion: 77%

## When to Use

- Working with code in `packages/`
- Understanding how toolResultOutput, isRecord, direct work
- Modifying config-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/test/config/config.test.ts` | schemaConfig, load, clearEffect, writeConfigEffect, withGlobalConfigDir (+13) |
| `packages/core/src/v1/config/provider-options.ts` | provider, request, direct, body, clone (+7) |
| `packages/opencode/src/config/config.ts` | normalizeLoadedConfig, substituteWellKnownRemoteConfig, patchJsonc, mergeConfig, mergeConfigConcatArrays (+3) |
| `packages/core/src/v1/config/migrate.ts` | migrate, permissions, agents, migrateAgent, mcp (+3) |
| `packages/opencode/src/cli/cmd/tui/config/tui.ts` | normalize, dropUnknownKeybinds, load, loadFile, mergeFile |
| `packages/opencode/src/config/plugin.ts` | pluginSpecifier, resolvePluginSpec, deduplicatePluginOrigins |
| `packages/opencode/src/plugin/shared.ts` | extractExportValue, resolvePackageEntrypoint |
| `packages/opencode/src/config/agent.ts` | load, loadMode |
| `packages/opencode/test/fixture/fixture.ts` | provideInstanceEffect, withTestInstance |
| `packages/opencode/src/cli/cmd/tui/config/tui-schema.ts` | isAttentionSoundName, resolveAttentionSoundPaths |

## Entry Points

Start here when exploring this area:

- **`toolResultOutput`** (Function) — `packages/opencode/src/session/processor.ts:343`
- **`isRecord`** (Function) — `packages/opencode/src/util/record.ts:0`
- **`direct`** (Function) — `packages/core/src/v1/config/provider-options.ts:145`
- **`body`** (Function) — `packages/core/src/v1/config/provider-options.ts:153`
- **`clone`** (Function) — `packages/core/src/v1/config/provider-options.ts:172`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `toolResultOutput` | Function | `packages/opencode/src/session/processor.ts` | 343 |
| `isRecord` | Function | `packages/opencode/src/util/record.ts` | 0 |
| `direct` | Function | `packages/core/src/v1/config/provider-options.ts` | 145 |
| `body` | Function | `packages/core/src/v1/config/provider-options.ts` | 153 |
| `clone` | Function | `packages/core/src/v1/config/provider-options.ts` | 172 |
| `omit` | Function | `packages/core/src/v1/config/provider-options.ts` | 176 |
| `headers` | Function | `packages/core/src/v1/config/provider-options.ts` | 184 |
| `compact` | Function | `packages/core/src/v1/config/provider-options.ts` | 191 |
| `isRecord` | Function | `packages/core/src/v1/config/provider-options.ts` | 208 |
| `migrate` | Function | `packages/core/src/v1/config/migrate.ts` | 35 |
| `permissions` | Function | `packages/core/src/v1/config/migrate.ts` | 74 |
| `agents` | Function | `packages/core/src/v1/config/migrate.ts` | 97 |
| `migrateAgent` | Function | `packages/core/src/v1/config/migrate.ts` | 106 |
| `mcp` | Function | `packages/core/src/v1/config/migrate.ts` | 127 |
| `normalize` | Function | `packages/opencode/src/cli/cmd/tui/config/tui.ts` | 65 |
| `dropUnknownKeybinds` | Function | `packages/opencode/src/cli/cmd/tui/config/tui.ts` | 81 |
| `load` | Function | `packages/opencode/src/cli/cmd/tui/config/tui.ts` | 112 |
| `loadFile` | Function | `packages/opencode/src/cli/cmd/tui/config/tui.ts` | 149 |
| `mergeFile` | Function | `packages/opencode/src/cli/cmd/tui/config/tui.ts` | 172 |
| `load` | Function | `packages/opencode/src/config/agent.ts` | 13 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Run → IsRecord` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Plugin | 4 calls |
| Fixture | 3 calls |
| Cli | 2 calls |
| Cmd | 2 calls |
| Project | 1 calls |

## How to Explore

1. `gitnexus_context({name: "toolResultOutput"})` — see callers and callees
2. `gitnexus_query({query: "config"})` — find related execution flows
3. Read key files listed above for implementation details
