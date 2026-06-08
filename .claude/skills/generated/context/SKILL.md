---
name: context
description: "Skill for the Context area of AndroidCode. 398 symbols across 62 files."
---

# Context

398 symbols | 62 files | Cohesion: 73%

## When to Use

- Working with code in `packages/`
- Understanding how resolveModelVariant, init, id work
- Modifying context-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/app/src/context/directory-sync.ts` | runInflight, touch, tracked, sync, diff (+26) |
| `packages/app/src/context/local.tsx` | handoffKey, clone, init, id, list (+23) |
| `packages/app/src/context/layout.tsx` | init, roots, rootFor, enriched, list (+23) |
| `packages/opencode/src/cli/cmd/tui/context/theme.tsx` | selectedForeground, subtleSyntax, generateSubtleSyntax, getSyntaxRules, listThemes (+21) |
| `packages/app/src/context/terminal.tsx` | all, update, clone, update, workspace (+17) |
| `packages/app/src/context/comments.tsx` | all, setFocus, setActive, add, remove (+14) |
| `packages/opencode/src/cli/cmd/tui/context/local.tsx` | agents, list, current, set, currentModel (+12) |
| `packages/app/src/context/command.tsx` | signature, signatureFromEvent, isAllowedEditableKeybind, palette, keymap (+10) |
| `packages/app/src/context/permission.tsx` | init, isAutoAcceptingDirectory, enableDirectory, disableDirectory, toggleAutoAcceptDirectory (+9) |
| `packages/opencode/src/cli/cmd/tui/context/editor.ts` | parsePort, resolveEditorConnection, resolveEditorLockFile, bestMatchLength, readEditorLockFile (+7) |

## Entry Points

Start here when exploring this area:

- **`resolveModelVariant`** (Function) — `packages/app/src/context/model-variant.ts:30`
- **`init`** (Function) — `packages/app/src/context/local.tsx:55`
- **`id`** (Function) — `packages/app/src/context/local.tsx:62`
- **`list`** (Function) — `packages/app/src/context/local.tsx:63`
- **`pickAgent`** (Function) — `packages/app/src/context/local.tsx:104`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `resolveModelVariant` | Function | `packages/app/src/context/model-variant.ts` | 30 |
| `init` | Function | `packages/app/src/context/local.tsx` | 55 |
| `id` | Function | `packages/app/src/context/local.tsx` | 62 |
| `list` | Function | `packages/app/src/context/local.tsx` | 63 |
| `pickAgent` | Function | `packages/app/src/context/local.tsx` | 104 |
| `scope` | Function | `packages/app/src/context/local.tsx` | 120 |
| `item` | Function | `packages/app/src/context/local.tsx` | 224 |
| `selected` | Function | `packages/app/src/context/local.tsx` | 243 |
| `snapshot` | Function | `packages/app/src/context/local.tsx` | 245 |
| `write` | Function | `packages/app/src/context/local.tsx` | 254 |
| `init` | Function | `packages/app/src/context/notification.tsx` | 109 |
| `updateUnseen` | Function | `packages/app/src/context/notification.tsx` | 135 |
| `removeFromIndex` | Function | `packages/app/src/context/notification.tsx` | 166 |
| `append` | Function | `packages/app/src/context/notification.tsx` | 195 |
| `lookup` | Function | `packages/app/src/context/notification.tsx` | 207 |
| `viewedInCurrentSession` | Function | `packages/app/src/context/notification.tsx` | 218 |
| `handleSessionIdle` | Function | `packages/app/src/context/notification.tsx` | 228 |
| `handleSessionError` | Function | `packages/app/src/context/notification.tsx` | 254 |
| `unsub` | Function | `packages/app/src/context/notification.tsx` | 287 |
| `soundSrc` | Function | `packages/app/src/utils/sound.ts` | 77 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Init → LocalStorageDirect` | cross_community | 9 |
| `Init → LocalStorageWithPrefix` | cross_community | 9 |
| `Init → Score` | cross_community | 8 |
| `Home → UseAuthSession` | cross_community | 7 |
| `Home → UseAuthSession` | cross_community | 7 |
| `Sync → KeyFor` | cross_community | 7 |
| `ModelSection → UseAuthSession` | cross_community | 7 |
| `OnMcp → ViewBox` | cross_community | 7 |
| `OnMcp → Symbol` | cross_community | 7 |
| `OnMcp → IconName` | cross_community | 7 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Components | 19 calls |
| Pages | 12 calls |
| Global-sync | 7 calls |
| Component | 5 calls |
| Session | 2 calls |
| Cluster_255 | 2 calls |
| Cluster_268 | 2 calls |
| Cluster_271 | 2 calls |

## How to Explore

1. `gitnexus_context({name: "resolveModelVariant"})` — see callers and callees
2. `gitnexus_query({query: "context"})` — find related execution flows
3. Read key files listed above for implementation details
