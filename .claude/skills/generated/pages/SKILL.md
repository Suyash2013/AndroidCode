---
name: pages
description: "Skill for the Pages area of AndroidCode. 245 symbols across 38 files."
---

# Pages

245 symbols | 38 files | Cohesion: 58%

## When to Use

- Working with code in `packages/`
- Understanding how handleSelect, handleSelect, copyPath work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/app/src/pages/layout.tsx` | setBusy, clearSidebarHoverState, navigateWithSidebarReset, unsub, setWorkspaceName (+76) |
| `packages/app/src/pages/session.tsx` | userMessages, Page, normalizeTab, normalizeTabs, messages (+65) |
| `packages/app/src/pages/home.tsx` | buildHomeSessionRecords, unseenCount, HomeSessionSearchResultRow, title, hasError (+33) |
| `packages/app/src/pages/error.tsx` | formatError, formattedError, ensureFatalErrorRecorded, exportDebugLogs, json (+2) |
| `packages/app/src/pages/directory-layout.tsx` | DirectoryDataProvider, slug, Layout, decodeDirectory, resolved |
| `packages/app/src/pages/layout/helpers.ts` | projectForSession, errorMessage, effectiveWorkspaceOrder, getProjectAvatarSource |
| `packages/app/src/pages/session/helpers.ts` | createOpenReviewFile, createSizing, shouldFocusTerminalOnKeyDown |
| `packages/app/src/components/session/session-header.tsx` | showRequestError, copyPath |
| `packages/app/src/components/settings-providers.tsx` | disableProvider, disconnect |
| `packages/app/src/components/settings-v2/providers.tsx` | disableProvider, disconnect |

## Entry Points

Start here when exploring this area:

- **`handleSelect`** (Function) — `packages/app/src/components/dialog-fork.tsx:57`
- **`handleSelect`** (Function) — `packages/app/src/components/dialog-select-file.tsx:359`
- **`copyPath`** (Function) — `packages/app/src/components/session/session-header.tsx:265`
- **`disableProvider`** (Function) — `packages/app/src/components/settings-v2/providers.tsx:86`
- **`disconnect`** (Function) — `packages/app/src/components/settings-v2/providers.tsx:108`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `handleSelect` | Function | `packages/app/src/components/dialog-fork.tsx` | 57 |
| `handleSelect` | Function | `packages/app/src/components/dialog-select-file.tsx` | 359 |
| `copyPath` | Function | `packages/app/src/components/session/session-header.tsx` | 265 |
| `disableProvider` | Function | `packages/app/src/components/settings-v2/providers.tsx` | 86 |
| `disconnect` | Function | `packages/app/src/components/settings-v2/providers.tsx` | 108 |
| `bootstrapInstance` | Function | `packages/app/src/context/server-sync.tsx` | 326 |
| `projectForSession` | Function | `packages/app/src/pages/layout/helpers.ts` | 66 |
| `errorMessage` | Function | `packages/app/src/pages/layout/helpers.ts` | 80 |
| `effectiveWorkspaceOrder` | Function | `packages/app/src/pages/layout/helpers.ts` | 89 |
| `pathKey` | Function | `packages/app/src/utils/path-key.ts` | 17 |
| `Layout` | Function | `packages/app/src/pages/directory-layout.tsx` | 52 |
| `setBusy` | Function | `packages/app/src/pages/layout.tsx` | 195 |
| `clearSidebarHoverState` | Function | `packages/app/src/pages/layout.tsx` | 341 |
| `navigateWithSidebarReset` | Function | `packages/app/src/pages/layout.tsx` | 346 |
| `unsub` | Function | `packages/app/src/pages/layout.tsx` | 410 |
| `setWorkspaceName` | Function | `packages/app/src/pages/layout.tsx` | 583 |
| `projectRoot` | Function | `packages/app/src/pages/layout.tsx` | 1237 |
| `clearLastProjectSession` | Function | `packages/app/src/pages/layout.tsx` | 1266 |
| `navigateToProject` | Function | `packages/app/src/pages/layout.tsx` | 1287 |
| `canOpen` | Function | `packages/app/src/pages/layout.tsx` | 1295 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `AppBaseProviders → SafeJson` | cross_community | 8 |
| `Page → SessionTreeRequest` | cross_community | 7 |
| `OnSelect → Base64Encode` | cross_community | 7 |
| `OnSelect → IsWindowsPath` | cross_community | 7 |
| `OnSelect → TrimTrailingSlashes` | cross_community | 7 |
| `HandleSubmit → ViewBox` | cross_community | 7 |
| `HandleSubmit → Symbol` | cross_community | 7 |
| `HandleSubmit → IconName` | cross_community | 7 |
| `OnMcp → ViewBox` | cross_community | 7 |
| `OnMcp → Symbol` | cross_community | 7 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Components | 34 calls |
| Session | 18 calls |
| Context | 7 calls |
| Layout | 6 calls |
| Composer | 3 calls |
| Global-sync | 3 calls |
| Component | 2 calls |
| Hooks | 1 calls |

## How to Explore

1. `gitnexus_context({name: "handleSelect"})` — see callers and callees
2. `gitnexus_query({query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
