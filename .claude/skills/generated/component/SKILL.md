---
name: component
description: "Skill for the Component area of AndroidCode. 267 symbols across 101 files."
---

# Component

267 symbols | 101 files | Cohesion: 72%

## When to Use

- Working with code in `packages/`
- Understanding how createPromptSubmit, useSync, createTuiAttention work
- Modifying component-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/src/cli/cmd/tui/component/logo.tsx` | lerp, ramp, remain, wave, field (+29) |
| `packages/opencode/src/cli/cmd/tui/component/bg-pulse-render.ts` | toRgb, sameRgb, setBackgroundPanel, setLogoBase, setPrimary (+13) |
| `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | normalizeCustomProviderID, createDialogProviderOptions, promptCustomProviderID, onSelect, DialogProvider (+6) |
| `packages/opencode/src/cli/cmd/tui/component/dialog-session-list.tsx` | DialogSessionList, currentSessionID, recover, quickSwitchHint, quickSwitchFooterHints (+6) |
| `packages/console/app/src/component/go-referral.tsx` | GoReferralUsagePreview, GoReferralUsagePreviewRow, CopyInviteLink, inviteUrl, queryGoReferral (+4) |
| `packages/opencode/src/cli/cmd/tui/component/dialog-workspace-create.tsx` | loadWorkspaceAdapters, openWorkspaceSelect, DialogWorkspaceSelect, DialogExistingWorkspaceSelect, warpWorkspaceSession (+3) |
| `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx` | Session, weak, toBottom, run, copy (+3) |
| `packages/console/app/src/component/header.tsx` | Header, starCount, githubData, isDarkMode, fetchSvgContent (+2) |
| `packages/console/app/src/routes/black/subscribe/[plan].tsx` | Failure, Success, IntentForm, BlackSubscribe, enabled (+2) |
| `packages/opencode/src/cli/cmd/tui/app.tsx` | ready, App, offSelectionKeys, currentWorktreeWorkspace, run (+1) |

## Entry Points

Start here when exploring this area:

- **`createPromptSubmit`** (Function) — `packages/app/src/components/prompt-input/submit.ts:203`
- **`useSync`** (Function) — `packages/app/src/context/sync.tsx:110`
- **`createTuiAttention`** (Function) — `packages/opencode/src/cli/cmd/tui/attention.ts:115`
- **`useEvent`** (Function) — `packages/opencode/src/cli/cmd/tui/context/event.ts:9`
- **`copy`** (Function) — `packages/opencode/src/cli/cmd/tui/util/clipboard.ts:174`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `RemoveFailedError` | Class | `packages/opencode/src/worktree/index.ts` | 86 |
| `createPromptSubmit` | Function | `packages/app/src/components/prompt-input/submit.ts` | 203 |
| `useSync` | Function | `packages/app/src/context/sync.tsx` | 110 |
| `createTuiAttention` | Function | `packages/opencode/src/cli/cmd/tui/attention.ts` | 115 |
| `useEvent` | Function | `packages/opencode/src/cli/cmd/tui/context/event.ts` | 9 |
| `copy` | Function | `packages/opencode/src/cli/cmd/tui/util/clipboard.ts` | 174 |
| `copy` | Function | `packages/opencode/src/cli/cmd/tui/util/selection.ts` | 25 |
| `handleSelectionKey` | Function | `packages/opencode/src/cli/cmd/tui/util/selection.ts` | 44 |
| `ready` | Function | `packages/opencode/src/cli/cmd/tui/app.tsx` | 214 |
| `CommandPaletteDialog` | Function | `packages/opencode/src/cli/cmd/tui/component/command-palette.tsx` | 25 |
| `DialogAgent` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-agent.tsx` | 5 |
| `DialogConsoleOrg` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-console-org.tsx` | 21 |
| `DialogMcp` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-mcp.tsx` | 20 |
| `options` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-mcp.tsx` | 27 |
| `DialogModel` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-model.tsx` | 11 |
| `options` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-model.tsx` | 22 |
| `title` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-model.tsx` | 124 |
| `sortModelOptions` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-model.tsx` | 174 |
| `DialogMoveSession` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-move-session.tsx` | 17 |
| `normalizeCustomProviderID` | Function | `packages/opencode/src/cli/cmd/tui/component/dialog-provider.tsx` | 75 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Home → UseAuthSession` | cross_community | 7 |
| `Home → UseAuthSession` | cross_community | 7 |
| `Home → ParseLocale` | cross_community | 6 |
| `Home → Fix` | cross_community | 6 |
| `BlackSubscribe → UseAuthSession` | cross_community | 6 |
| `Download → ParseLocale` | cross_community | 6 |
| `Download → Fix` | cross_community | 6 |
| `Home → ParseLocale` | cross_community | 6 |
| `Home → Fix` | cross_community | 6 |
| `Changelog → ParseLocale` | cross_community | 6 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Session | 30 calls |
| Ui | 11 calls |
| Billing | 10 calls |
| [id] | 7 calls |
| Util | 5 calls |
| Prompt | 4 calls |
| System | 4 calls |
| Context | 4 calls |

## How to Explore

1. `gitnexus_context({name: "createPromptSubmit"})` — see callers and callees
2. `gitnexus_query({query: "component"})` — find related execution flows
3. Read key files listed above for implementation details
