---
name: util
description: "Skill for the Util area of AndroidCode. 130 symbols across 42 files."
---

# Util

130 symbols | 42 files | Cohesion: 83%

## When to Use

- Working with code in `packages/`
- Understanding how code, mono, wall work
- Modifying util-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/src/util/repository.ts` | normalizeRepositoryInput, parseGitHubRemote, trimGitSuffix, parts, buildFileReference (+8) |
| `packages/console/app/src/routes/zen/util/handler.ts` | handler, pump, calculateCost, calculateOccurredCost, trackUsage (+6) |
| `packages/console/app/src/routes/zen/util/error.ts` | AuthError, ModelError, LimitError, RateLimitError, FreeUsageLimitError (+5) |
| `packages/core/src/util/flock.ts` | code, mono, wall, stats, stale (+4) |
| `packages/core/src/util/log.ts` | shouldLog, debug, info, error, warn (+4) |
| `packages/core/src/util/effect-flock.ts` | forceRemove, exclusiveWrite, tryAcquireLockDir, acquireHandle, ReleaseError (+2) |
| `packages/opencode/src/util/filesystem.ts` | isEnoent, write, normalizePath, resolve, windowsPath |
| `packages/opencode/src/util/process.ts` | RunFailedError, spawn, run, text |
| `packages/opencode/src/cli/cmd/tui/util/transcript.ts` | formatTranscript, formatMessage, formatPart, formatAssistantHeader |
| `packages/opencode/src/cli/cmd/tui/util/clipboard.ts` | getClipboardy, read, getCopyMethod |

## Entry Points

Start here when exploring this area:

- **`code`** (Function) — `packages/core/src/util/flock.ts:68`
- **`mono`** (Function) — `packages/core/src/util/flock.ts:108`
- **`wall`** (Function) — `packages/core/src/util/flock.ts:112`
- **`stats`** (Function) — `packages/core/src/util/flock.ts:116`
- **`stale`** (Function) — `packages/core/src/util/flock.ts:126`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `RunFailedError` | Class | `packages/opencode/src/util/process.ts` | 34 |
| `CustomSpeedScroll` | Class | `packages/opencode/src/cli/cmd/tui/util/scroll.ts` | 3 |
| `AuthError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 0 |
| `ModelError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 4 |
| `LimitError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 6 |
| `RateLimitError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 13 |
| `FreeUsageLimitError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 14 |
| `BlackUsageLimitError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 15 |
| `GoUsageLimitError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 18 |
| `CreditsError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 1 |
| `MonthlyLimitError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 2 |
| `UserLimitError` | Class | `packages/console/app/src/routes/zen/util/error.ts` | 3 |
| `NamedError` | Class | `packages/core/src/util/error.ts` | 2 |
| `ReleaseError` | Class | `packages/core/src/util/effect-flock.ts` | 23 |
| `AsyncQueue` | Class | `packages/opencode/src/util/queue.ts` | 0 |
| `code` | Function | `packages/core/src/util/flock.ts` | 68 |
| `mono` | Function | `packages/core/src/util/flock.ts` | 108 |
| `wall` | Function | `packages/core/src/util/flock.ts` | 112 |
| `stats` | Function | `packages/core/src/util/flock.ts` | 116 |
| `stale` | Function | `packages/core/src/util/flock.ts` | 126 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Run → RunFailedError` | cross_community | 5 |
| `Run → Done` | cross_community | 5 |
| `Run → Abort` | cross_community | 5 |
| `Run → IsRecord` | cross_community | 5 |
| `Run → ErrorFormat` | cross_community | 5 |
| `Run → RunFailedError` | cross_community | 5 |
| `Run → GetWhich` | cross_community | 4 |
| `Run → WriteWithStdin` | cross_community | 4 |
| `Run → GetClipboardy` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Context | 3 calls |
| Component | 2 calls |
| Provider | 2 calls |
| Scripts | 1 calls |
| Script | 1 calls |

## How to Explore

1. `gitnexus_context({name: "code"})` — see callers and callees
2. `gitnexus_query({query: "util"})` — find related execution flows
3. Read key files listed above for implementation details
