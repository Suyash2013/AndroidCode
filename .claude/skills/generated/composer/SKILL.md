---
name: composer
description: "Skill for the Composer area of AndroidCode. 73 symbols across 11 files."
---

# Composer

73 symbols | 11 files | Cohesion: 66%

## When to Use

- Working with code in `packages/`
- Understanding how SessionQuestionDock, question, options work
- Modifying composer-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/app/src/pages/session/composer/session-question-dock.tsx` | Mark, Option, SessionQuestionDock, question, options (+27) |
| `packages/app/src/pages/session/composer/session-composer-region.tsx` | SessionComposerRegion, handoffPrompt, parentID, child, showComposer (+6) |
| `packages/app/src/pages/session/composer/session-todo-dock.tsx` | SessionTodoDock, total, done, label, preview (+5) |
| `packages/app/src/pages/session/composer/session-composer-state.ts` | questionRequest, todoState, createSessionComposerState, todos, done (+5) |
| `packages/app/src/pages/session/composer/session-request-tree.ts` | sessionTreeRequest, sessionPermissionRequest, sessionQuestionRequest |
| `packages/app/src/pages/session/composer/session-revert-dock.tsx` | SessionRevertDock, label |
| `packages/app/src/pages/session/handoff.ts` | getSessionHandoff |
| `packages/app/src/pages/session/session-layout.ts` | useSessionKey |
| `packages/app/src/pages/layout/project-avatar-state.ts` | hasPermissions |
| `packages/ui/src/components/dock-prompt.tsx` | DockPrompt |

## Entry Points

Start here when exploring this area:

- **`SessionQuestionDock`** (Function) — `packages/app/src/pages/session/composer/session-question-dock.tsx:60`
- **`question`** (Function) — `packages/app/src/pages/session/composer/session-question-dock.tsx:83`
- **`options`** (Function) — `packages/app/src/pages/session/composer/session-question-dock.tsx:84`
- **`input`** (Function) — `packages/app/src/pages/session/composer/session-question-dock.tsx:85`
- **`on`** (Function) — `packages/app/src/pages/session/composer/session-question-dock.tsx:86`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `SessionQuestionDock` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 60 |
| `question` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 83 |
| `options` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 84 |
| `input` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 85 |
| `on` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 86 |
| `multi` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 87 |
| `customUpdate` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 100 |
| `update` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 167 |
| `customToggle` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 265 |
| `customOpen` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 290 |
| `selectOption` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 349 |
| `commitCustom` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 367 |
| `resizeInput` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 373 |
| `questions` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 64 |
| `count` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 88 |
| `clamp` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 142 |
| `pickFocus` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 144 |
| `focus` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 153 |
| `sending` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 230 |
| `reply` | Function | `packages/app/src/pages/session/composer/session-question-dock.tsx` | 232 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Page → SessionTreeRequest` | cross_community | 7 |
| `SessionQuestionDock → Questions` | cross_community | 7 |
| `Render → SessionTreeRequest` | cross_community | 7 |
| `Nav → Questions` | cross_community | 6 |
| `Nav → On` | cross_community | 5 |
| `Nav → Input` | cross_community | 5 |
| `Nav → Sending` | intra_community | 5 |
| `Page → Todos` | cross_community | 4 |
| `Render → Todos` | cross_community | 4 |
| `Render → Touch` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Components | 13 calls |
| Component | 2 calls |
| Pages | 1 calls |
| Session | 1 calls |

## How to Explore

1. `gitnexus_context({name: "SessionQuestionDock"})` — see callers and callees
2. `gitnexus_query({query: "composer"})` — find related execution flows
3. Read key files listed above for implementation details
