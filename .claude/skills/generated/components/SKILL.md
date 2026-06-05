---
name: components
description: "Skill for the Components area of AndroidCode. 1025 symbols across 204 files."
---

# Components

1025 symbols | 204 files | Cohesion: 72%

## When to Use

- Working with code in `packages/`
- Understanding how getNodeLength, getTextLength, getCursorPosition work
- Modifying components-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/ui/src/components/message-part.tsx` | sessionLink, part, hideQuestion, input, partMetadata (+78) |
| `packages/app/src/components/prompt-input.tsx` | PromptInput, scrollCursorIntoView, queueScroll, working, imageAttachments (+59) |
| `packages/ui/src/components/session-turn.tsx` | allMessages, messageIndex, message, pending, pendingUser (+29) |
| `packages/app/src/components/titlebar.tsx` | NewSessionTabItem, tauriApi, currentThemeWindow, Titlebar, useV2Titlebar (+28) |
| `packages/ui/src/components/session-review.tsx` | SessionReview, open, files, hasDiffs, queue (+24) |
| `packages/ui/src/components/file.tsx` | useModeViewer, useSearchHandle, createLineCallbacks, useAnnotationRerender, renderViewer (+22) |
| `packages/ui/src/components/timeline-playground.stories.tsx` | Playground, updateStyle, setCssValue, appendParts, addText (+21) |
| `packages/app/src/components/dialog-connect-provider.tsx` | ApiAuthView, DialogConnectProvider, fallback, methods, method (+20) |
| `packages/app/src/components/dialog-select-server.tsx` | ServerForm, DialogSelectServer, ServerConnectionList, ServerConnectionForm, showRequestError (+18) |
| `packages/app/src/components/dialog-select-directory.tsx` | cleanInput, normalizeDriveRoot, trimTrailing, joinPath, rootOf (+14) |

## Entry Points

Start here when exploring this area:

- **`getNodeLength`** (Function) — `packages/app/src/components/prompt-input/editor-dom.ts:29`
- **`getTextLength`** (Function) — `packages/app/src/components/prompt-input/editor-dom.ts:34`
- **`getCursorPosition`** (Function) — `packages/app/src/components/prompt-input/editor-dom.ts:44`
- **`setCursorPosition`** (Function) — `packages/app/src/components/prompt-input/editor-dom.ts:55`
- **`setRangeEdge`** (Function) — `packages/app/src/components/prompt-input/editor-dom.ts:119`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getNodeLength` | Function | `packages/app/src/components/prompt-input/editor-dom.ts` | 29 |
| `getTextLength` | Function | `packages/app/src/components/prompt-input/editor-dom.ts` | 34 |
| `getCursorPosition` | Function | `packages/app/src/components/prompt-input/editor-dom.ts` | 44 |
| `setCursorPosition` | Function | `packages/app/src/components/prompt-input/editor-dom.ts` | 55 |
| `setRangeEdge` | Function | `packages/app/src/components/prompt-input/editor-dom.ts` | 119 |
| `canNavigateHistoryAtCursor` | Function | `packages/app/src/components/prompt-input/history.ts` | 24 |
| `promptLength` | Function | `packages/app/src/components/prompt-input/history.ts` | 74 |
| `ApiAuthView` | Function | `packages/app/src/components/dialog-connect-provider.tsx` | 392 |
| `DialogEditProject` | Function | `packages/app/src/components/dialog-edit-project.tsx` | 18 |
| `folderName` | Function | `packages/app/src/components/dialog-edit-project.tsx` | 24 |
| `defaultName` | Function | `packages/app/src/components/dialog-edit-project.tsx` | 25 |
| `DialogManageModels` | Function | `packages/app/src/components/dialog-manage-models.tsx` | 12 |
| `DialogSelectFile` | Function | `packages/app/src/components/dialog-select-file.tsx` | 263 |
| `ModelSelectorPopover` | Function | `packages/app/src/components/dialog-select-model.tsx` | 90 |
| `close` | Function | `packages/app/src/components/dialog-select-model.tsx` | 107 |
| `DialogSelectServer` | Function | `packages/app/src/components/dialog-select-server.tsx` | 175 |
| `ServerConnectionList` | Function | `packages/app/src/components/dialog-select-server.tsx` | 539 |
| `ServerConnectionForm` | Function | `packages/app/src/components/dialog-select-server.tsx` | 650 |
| `DialogSettings` | Function | `packages/app/src/components/dialog-settings.tsx` | 12 |
| `PromptInput` | Function | `packages/app/src/components/prompt-input.tsx` | 123 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `AppBaseProviders → SafeJson` | cross_community | 8 |
| `HandleSubmit → ViewBox` | cross_community | 7 |
| `HandleSubmit → Symbol` | cross_community | 7 |
| `HandleSubmit → IconName` | cross_community | 7 |
| `Render → SessionTreeRequest` | cross_community | 7 |
| `HandleSubmit → Fallback` | cross_community | 7 |
| `OnMcp → ViewBox` | cross_community | 7 |
| `OnMcp → Symbol` | cross_community | 7 |
| `OnMcp → IconName` | cross_community | 7 |
| `AppBaseProviders → IsInitError` | cross_community | 7 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Session | 49 calls |
| Component | 38 calls |
| Pages | 27 calls |
| Context | 19 calls |
| Pierre | 12 calls |
| Composer | 6 calls |
| Share | 5 calls |
| Settings-v2 | 4 calls |

## How to Explore

1. `gitnexus_context({name: "getNodeLength"})` — see callers and callees
2. `gitnexus_query({query: "components"})` — find related execution flows
3. Read key files listed above for implementation details
