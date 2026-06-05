---
name: cmd
description: "Skill for the Cmd area of AndroidCode. 79 symbols across 15 files."
---

# Cmd

79 symbols | 15 files | Cohesion: 85%

## When to Use

- Working with code in `packages/`
- Understanding how die, dieInteractive, attachSDK work
- Modifying cmd-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/src/cli/cmd/github.handler.ts` | gitRun, commitChanges, restoreGitConfig, checkoutLocalBranch, pushToNewBranch (+15) |
| `packages/opencode/src/cli/cmd/run.ts` | pick, die, dieInteractive, attachSDK, session (+10) |
| `packages/opencode/src/cli/cmd/mcp.ts` | isMcpConfigured, isMcpRemote, configuredServers, oauthServers, listState (+4) |
| `packages/opencode/src/cli/cmd/account.ts` | dim, activeSuffix, formatAccountLabel, formatOrgChoiceLabel, formatOrgLine (+2) |
| `packages/opencode/src/cli/cmd/export.ts` | redact, span, diff, source, filepart (+2) |
| `packages/opencode/src/cli/cmd/uninstall.ts` | handler, collectRemovalTargets, showRemovalSummary, executeUninstall, getDirectorySize |
| `packages/opencode/src/cli/cmd/plug.ts` | spinner, error, info, createPlugTask |
| `packages/opencode/src/cli/cmd/prompt-display.ts` | promptOffsetWidth, displayOffsetIndex, displaySlice, mentionTriggerIndex |
| `packages/opencode/src/cli/cmd/github.shared.ts` | extractResponseText, formatPromptTooLargeError |
| `packages/opencode/test/fixture/plug-worker.ts` | main |

## Entry Points

Start here when exploring this area:

- **`die`** (Function) — `packages/opencode/src/cli/cmd/run.ts:251`
- **`dieInteractive`** (Function) — `packages/opencode/src/cli/cmd/run.ts:255`
- **`attachSDK`** (Function) — `packages/opencode/src/cli/cmd/run.ts:320`
- **`session`** (Function) — `packages/opencode/src/cli/cmd/run.ts:390`
- **`share`** (Function) — `packages/opencode/src/cli/cmd/run.ts:469`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `die` | Function | `packages/opencode/src/cli/cmd/run.ts` | 251 |
| `dieInteractive` | Function | `packages/opencode/src/cli/cmd/run.ts` | 255 |
| `attachSDK` | Function | `packages/opencode/src/cli/cmd/run.ts` | 320 |
| `session` | Function | `packages/opencode/src/cli/cmd/run.ts` | 390 |
| `share` | Function | `packages/opencode/src/cli/cmd/run.ts` | 469 |
| `pickAgent` | Function | `packages/opencode/src/cli/cmd/run.ts` | 595 |
| `execute` | Function | `packages/opencode/src/cli/cmd/run.ts` | 604 |
| `formatAccountLabel` | Function | `packages/opencode/src/cli/cmd/account.ts` | 19 |
| `formatOrgLine` | Function | `packages/opencode/src/cli/cmd/account.ts` | 25 |
| `gitRun` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 454 |
| `commitChanges` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 462 |
| `restoreGitConfig` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 1033 |
| `checkoutLocalBranch` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 1046 |
| `pushToNewBranch` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 1083 |
| `pushToLocalBranch` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 1096 |
| `pushToForkBranch` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 1105 |
| `runLocalEffect` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 383 |
| `subscribeSessionEvents` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 820 |
| `summarize` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 877 |
| `chat` | Function | `packages/opencode/src/cli/cmd/github.handler.ts` | 888 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Plugin | 3 calls |
| Component | 2 calls |
| Cli | 2 calls |
| Prompt | 1 calls |

## How to Explore

1. `gitnexus_context({name: "die"})` — see callers and callees
2. `gitnexus_query({query: "cmd"})` — find related execution flows
3. Read key files listed above for implementation details
