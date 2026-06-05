---
name: system
description: "Skill for the System area of AndroidCode. 193 symbols across 12 files."
---

# System

193 symbols | 12 files | Cohesion: 68%

## When to Use

- Working with code in `packages/`
- Understanding how Spinner, StartupLoading, singlePatchFileIndex work
- Modifying system-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/src/cli/cmd/tui/feature-plugins/system/session-v2.tsx` | content, ReasoningHeader, fg, AssistantTool, input (+59) |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/system/which-key.tsx` | WhichKeyPanel, visible, pendingMode, panelHeight, tabsVisible (+38) |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer.tsx` | files, patchFileIndexes, currentPatchFileIndex, visiblePatchFiles, toggleSelectedFileReviewed (+35) |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | singlePatchFileIndex, orderedPatchFileIndexes, buildFileTree, flattenFileTree, visit (+10) |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/system/plugins.tsx` | Install, showInstall, View, flip, onTrigger (+5) |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree.tsx` | tree, rows, DiffViewerFileTree, scrollSelectedIntoView, fadedColor (+5) |
| `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-ui.tsx` | crossAxis, usePanelGroup, Panel, Separator, axis |
| `packages/opencode/src/cli/cmd/tui/context/thinking.ts` | reasoningSummary, useThinkingMode |
| `packages/opencode/src/cli/cmd/tui/component/spinner.tsx` | Spinner |
| `packages/opencode/src/cli/cmd/tui/component/startup-loading.tsx` | StartupLoading |

## Entry Points

Start here when exploring this area:

- **`Spinner`** (Function) — `packages/opencode/src/cli/cmd/tui/component/spinner.tsx:9`
- **`StartupLoading`** (Function) — `packages/opencode/src/cli/cmd/tui/component/startup-loading.tsx:4`
- **`singlePatchFileIndex`** (Function) — `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts:168`
- **`orderedPatchFileIndexes`** (Function) — `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts:177`
- **`collapseToolOutput`** (Function) — `packages/opencode/src/cli/cmd/tui/util/collapse-tool-output.ts:0`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `Spinner` | Function | `packages/opencode/src/cli/cmd/tui/component/spinner.tsx` | 9 |
| `StartupLoading` | Function | `packages/opencode/src/cli/cmd/tui/component/startup-loading.tsx` | 4 |
| `singlePatchFileIndex` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 168 |
| `orderedPatchFileIndexes` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 177 |
| `collapseToolOutput` | Function | `packages/opencode/src/cli/cmd/tui/util/collapse-tool-output.ts` | 0 |
| `buildFileTree` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 33 |
| `flattenFileTree` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 75 |
| `visit` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 77 |
| `tree` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree.tsx` | 37 |
| `rows` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree.tsx` | 38 |
| `toggleFileTreeDirectory` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 196 |
| `moveFileTreeSelection` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 121 |
| `fileTreeFileSelection` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 159 |
| `moveFileTreeSelectionToFirstChild` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 128 |
| `moveFileTreeSelectionToParent` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 136 |
| `allExpandedFileTreeDirectories` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 192 |
| `setFileTreeDirectoryExpanded` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree-utils.ts` | 204 |
| `DiffViewerFileTree` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree.tsx` | 36 |
| `scrollSelectedIntoView` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree.tsx` | 46 |
| `fadedColor` | Function | `packages/opencode/src/cli/cmd/tui/feature-plugins/system/diff-viewer-file-tree.tsx` | 51 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Run → CollapsedFileTreeDirectoryChain` | cross_community | 6 |
| `Run → AddFileTreeNode` | cross_community | 6 |
| `Run → Files` | cross_community | 5 |
| `Run → SetHighlighted` | cross_community | 5 |
| `Run → OrderedPatchFileIndexes` | cross_community | 5 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Component | 5 calls |
| Session | 2 calls |
| Util | 1 calls |

## How to Explore

1. `gitnexus_context({name: "Spinner"})` — see callers and callees
2. `gitnexus_query({query: "system"})` — find related execution flows
3. Read key files listed above for implementation details
