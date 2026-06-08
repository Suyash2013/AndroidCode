---
name: run
description: "Skill for the Run area of AndroidCode. 569 symbols across 46 files."
---

# Run

569 symbols | 46 files | Cohesion: 66%

## When to Use

- Working with code in `packages/`
- Understanding how createPromptState, visible, setShellMode work
- Modifying run-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/src/cli/cmd/run/tool.ts` | dict, text, toolPath, fallbackInline, runList (+43) |
| `packages/opencode/src/cli/cmd/run/subagent-data.ts` | createSubagentData, clearFinishedSubagents, ensureDetail, sameSubagentTab, queueSnapshot (+34) |
| `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | clonePrompt, emptyPrompt, createPromptState, visible, setShellMode (+32) |
| `packages/opencode/src/cli/cmd/run/footer.view.tsx` | RunFooterView, hints, command, interrupt, variantCycle (+27) |
| `packages/opencode/src/cli/cmd/run/demo.ts` | createRunDemo, wait, split, take, open (+25) |
| `packages/opencode/src/cli/cmd/run/session-data.ts` | formatUsage, out, queueFooter, queueOut, syncQuestion (+24) |
| `packages/opencode/src/cli/cmd/run/stream.transport.ts` | traceTabs, createLayer, seedBlocker, trackBlocker, messages (+22) |
| `packages/opencode/src/cli/cmd/run/question.shared.ts` | createQuestionBodyState, questionSync, questionSingle, questionTabs, questionConfirm (+20) |
| `packages/opencode/test/cli/run/stream.transport.test.ts` | idle, runningTool, textUpdated, toolUpdated, textDelta (+18) |
| `packages/opencode/src/cli/cmd/run/scrollback.writer.tsx` | entryLayout, separatorRows, RunEntryContent, diffBg, structured (+16) |

## Entry Points

Start here when exploring this area:

- **`createPromptState`** (Function) — `packages/opencode/src/cli/cmd/run/footer.prompt.tsx:274`
- **`visible`** (Function) — `packages/opencode/src/cli/cmd/run/footer.prompt.tsx:303`
- **`setShellMode`** (Function) — `packages/opencode/src/cli/cmd/run/footer.prompt.tsx:305`
- **`options`** (Function) — `packages/opencode/src/cli/cmd/run/footer.prompt.tsx:435`
- **`popup`** (Function) — `packages/opencode/src/cli/cmd/run/footer.prompt.tsx:448`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `RunFooter` | Class | `packages/opencode/src/cli/cmd/run/footer.ts` | 163 |
| `RunScrollbackStream` | Class | `packages/opencode/src/cli/cmd/run/scrollback.surface.ts` | 86 |
| `createPromptState` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 274 |
| `visible` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 303 |
| `setShellMode` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 305 |
| `options` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 435 |
| `popup` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 448 |
| `hide` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 452 |
| `syncRows` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 458 |
| `scheduleRows` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 466 |
| `syncParts` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 478 |
| `clearParts` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 531 |
| `restoreParts` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 539 |
| `restore` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 566 |
| `resetDraft` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 581 |
| `replaceDraft` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 597 |
| `refresh` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 612 |
| `bind` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 663 |
| `syncDraft` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 691 |
| `push` | Function | `packages/opencode/src/cli/cmd/run/footer.prompt.tsx` | 709 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `RunFooterView → PromptSame` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 3 calls |
| Cmd | 2 calls |
| Config | 1 calls |
| Prompt | 1 calls |

## How to Explore

1. `gitnexus_context({name: "createPromptState"})` — see callers and callees
2. `gitnexus_query({query: "run"})` — find related execution flows
3. Read key files listed above for implementation details
