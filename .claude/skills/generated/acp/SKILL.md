---
name: acp
description: "Skill for the Acp area of AndroidCode. 93 symbols across 18 files."
---

# Acp

93 symbols | 18 files | Cohesion: 80%

## When to Use

- Working with code in `packages/`
- Understanding how create, parseModelSelection, promptContentToParts work
- Modifying acp-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/src/acp/tool.ts` | toToolKind, pendingToolCall, completedToolUpdate, errorToolUpdate, completedToolRawOutput (+12) |
| `packages/opencode/src/acp/service.ts` | make, makeSessionService, makeDirectoryService, makeUsageService, request (+9) |
| `packages/opencode/src/acp/event.ts` | handleToolPart, toolStart, clearTool, replayMessage, replayContentPart (+9) |
| `packages/opencode/src/acp/config-option.ts` | parseModelSelection, buildModelSelectOption, buildModeSelectOption, buildConfigOptions, variantsForModel (+5) |
| `packages/opencode/src/acp/content.ts` | promptContentToParts, contentBlockToParts, resourceLinkToPart, uriToFilePart, filenameFromUri (+3) |
| `packages/opencode/test/cli/acp/helpers.ts` | verifierConfig, initialize, newSession, expectSelectOption, expectAlternateValue |
| `packages/opencode/test/acp/event.test.ts` | messages, assistantToolMessage, completedTool, createEventStream, createHarness |
| `packages/opencode/src/acp/agent.ts` | create, Agent, run |
| `packages/opencode/src/acp/permission.ts` | process, reply, writeProposedEdit |
| `packages/opencode/test/cli/acp/acp-test-client.ts` | expectOk, selectConfigOption, flattenSelectOptions |

## Entry Points

Start here when exploring this area:

- **`create`** (Function) — `packages/opencode/src/acp/agent.ts:25`
- **`parseModelSelection`** (Function) — `packages/opencode/src/acp/config-option.ts:114`
- **`promptContentToParts`** (Function) — `packages/opencode/src/acp/content.ts:25`
- **`make`** (Function) — `packages/opencode/src/acp/service.ts:75`
- **`toToolKind`** (Function) — `packages/opencode/src/acp/tool.ts:36`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `Agent` | Class | `packages/opencode/src/acp/agent.ts` | 31 |
| `create` | Function | `packages/opencode/src/acp/agent.ts` | 25 |
| `parseModelSelection` | Function | `packages/opencode/src/acp/config-option.ts` | 114 |
| `promptContentToParts` | Function | `packages/opencode/src/acp/content.ts` | 25 |
| `make` | Function | `packages/opencode/src/acp/service.ts` | 75 |
| `toToolKind` | Function | `packages/opencode/src/acp/tool.ts` | 36 |
| `pendingToolCall` | Function | `packages/opencode/src/acp/tool.ts` | 120 |
| `completedToolUpdate` | Function | `packages/opencode/src/acp/tool.ts` | 175 |
| `errorToolUpdate` | Function | `packages/opencode/src/acp/tool.ts` | 191 |
| `completedToolRawOutput` | Function | `packages/opencode/src/acp/tool.ts` | 218 |
| `buildModelSelectOption` | Function | `packages/opencode/src/acp/config-option.ts` | 30 |
| `buildModeSelectOption` | Function | `packages/opencode/src/acp/config-option.ts` | 71 |
| `buildConfigOptions` | Function | `packages/opencode/src/acp/config-option.ts` | 89 |
| `buildEffortSelectOption` | Function | `packages/opencode/src/acp/config-option.ts` | 51 |
| `formatCurrentModelId` | Function | `packages/opencode/src/acp/config-option.ts` | 147 |
| `formatVariantName` | Function | `packages/opencode/src/acp/config-option.ts` | 158 |
| `contentBlockToParts` | Function | `packages/opencode/src/acp/content.ts` | 29 |
| `partsToContentChunks` | Function | `packages/opencode/src/acp/content.ts` | 99 |
| `exists` | Function | `packages/opencode/src/util/filesystem.ts` | 11 |
| `completedToolContent` | Function | `packages/opencode/src/acp/tool.ts` | 99 |

## How to Explore

1. `gitnexus_context({name: "create"})` — see callers and callees
2. `gitnexus_query({query: "acp"})` — find related execution flows
3. Read key files listed above for implementation details
