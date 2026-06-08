---
name: session
description: "Skill for the Session area of AndroidCode. 446 symbols across 64 files."
---

# Session

446 symbols | 64 files | Cohesion: 70%

## When to Use

- Working with code in `packages/`
- Understanding how usePathFormatter, FileTabContent, path work
- Modifying session-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx` | use, syntax, TextPart, ToolPart, GenericTool (+74) |
| `packages/app/src/pages/session/message-timeline.tsx` | readTimelineCache, reuseTimelineRows, pace, MessageTimeline, timelineRows (+68) |
| `packages/app/src/pages/session/file-tabs.tsx` | FileTabContent, path, state, contents, cacheKey (+16) |
| `packages/opencode/src/cli/cmd/tui/routes/session/question.tsx` | QuestionPrompt, question, options, custom, other (+16) |
| `packages/app/src/components/session/session-header.tsx` | os, apps, fileManager, options, current (+12) |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/session/preview-pane.tsx` | Header, statusRest, loadMessages, prefetchPreviews, SessionPreviewPane (+11) |
| `packages/app/src/components/session/session-context-tab.tsx` | SessionContextTab, messages, ctx, formatter, counts (+10) |
| `packages/app/src/pages/session/use-session-commands.tsx` | useSessionCommands, shown, contextCmds, viewCmds, permissionsCmds (+10) |
| `packages/app/src/pages/session/session-side-panel.tsx` | SessionSidePanel, fileTreeTab, shown, fileOpen, treeWidth (+6) |
| `packages/app/src/pages/session/use-session-hash-scroll.ts` | useSessionHashScroll, visibleUserMessages, messageById, cancel, scrollToMessage (+4) |

## Entry Points

Start here when exploring this area:

- **`usePathFormatter`** (Function) — `packages/opencode/src/cli/cmd/tui/context/path-format.tsx:19`
- **`FileTabContent`** (Function) — `packages/app/src/pages/session/file-tabs.tsx:173`
- **`path`** (Function) — `packages/app/src/pages/session/file-tabs.tsx:194`
- **`state`** (Function) — `packages/app/src/pages/session/file-tabs.tsx:195`
- **`contents`** (Function) — `packages/app/src/pages/session/file-tabs.tsx:200`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `FileAttachment` | Class | `packages/core/src/session/prompt.ts` | 8 |
| `AgentAttachment` | Class | `packages/core/src/session/prompt.ts` | 26 |
| `ReferenceAttachment` | Class | `packages/core/src/session/prompt.ts` | 31 |
| `usePathFormatter` | Function | `packages/opencode/src/cli/cmd/tui/context/path-format.tsx` | 19 |
| `FileTabContent` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 173 |
| `path` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 194 |
| `state` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 195 |
| `contents` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 200 |
| `cacheKey` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 201 |
| `selectedLines` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 202 |
| `buildPreview` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 220 |
| `addCommentToContext` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 226 |
| `updateCommentInContext` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 252 |
| `fileComments` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 271 |
| `commentedLines` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 277 |
| `activeSelection` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 291 |
| `onSubmit` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 313 |
| `onUpdate` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 318 |
| `onDelete` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 323 |
| `renderFile` | Function | `packages/app/src/pages/session/file-tabs.tsx` | 396 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `SessionContextTab → TokenTotal` | cross_community | 7 |
| `MessageTimeline → SessionID` | cross_community | 5 |
| `RenderTimelineRow → BasenameOf` | cross_community | 5 |
| `RenderTimelineRow → FolderNameVariants` | cross_community | 5 |
| `RenderTimelineRow → ToOpenVariant` | cross_community | 5 |
| `RenderTimelineRow → DottedSuffixesDesc` | cross_community | 5 |
| `UseSessionHashScroll → ScrollToElement` | cross_community | 5 |
| `UseSessionHashScroll → Queue` | cross_community | 5 |
| `RenderAssistantPartGroup → SessionLink` | cross_community | 5 |
| `RenderAssistantPartGroup → ContentWidth` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Components | 48 calls |
| Component | 21 calls |
| Pages | 9 calls |
| System | 6 calls |
| Context | 5 calls |
| Fixture | 2 calls |
| Provider | 2 calls |
| Composer | 2 calls |

## How to Explore

1. `gitnexus_context({name: "usePathFormatter"})` — see callers and callees
2. `gitnexus_query({query: "session"})` — find related execution flows
3. Read key files listed above for implementation details
