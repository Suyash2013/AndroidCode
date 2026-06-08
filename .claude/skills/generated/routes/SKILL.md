---
name: routes
description: "Skill for the Routes area of AndroidCode. 100 symbols across 8 files."
---

# Routes

100 symbols | 8 files | Cohesion: 73%

## When to Use

- Working with code in `packages/`
- Understanding how StatsHome, githubStars, data work
- Modifying routes-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/stats/app/src/routes/index.tsx` | StatsHome, githubStars, applyThemePreference, StatsLoading, SectionTitle (+75) |
| `packages/console/app/src/routes/black.tsx` | BlackLayout, githubData, starCount, svgLightingValues, svgLightingStyle |
| `packages/console/app/src/routes/workspace-picker.tsx` | getWorkspaces, WorkspacePicker, workspaces, currentWorkspace |
| `packages/console/support/src/routes/lookup.tsx` | getLookup, LookupPage, identifier, data |
| `packages/console/app/src/routes/workspace.tsx` | getUserEmail, WorkspaceLayout, userEmail |
| `packages/console/support/src/lib/lookup.ts` | lookup, formatDate |
| `packages/console/app/src/component/dropdown.tsx` | Dropdown |
| `packages/console/app/src/routes/user-menu.tsx` | UserMenu |

## Entry Points

Start here when exploring this area:

- **`StatsHome`** (Function) — `packages/stats/app/src/routes/index.tsx:146`
- **`githubStars`** (Function) — `packages/stats/app/src/routes/index.tsx:155`
- **`data`** (Function) — `packages/stats/app/src/routes/index.tsx:154`
- **`Dropdown`** (Function) — `packages/console/app/src/component/dropdown.tsx:14`
- **`UserMenu`** (Function) — `packages/console/app/src/routes/user-menu.tsx:23`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `StatsHome` | Function | `packages/stats/app/src/routes/index.tsx` | 146 |
| `githubStars` | Function | `packages/stats/app/src/routes/index.tsx` | 155 |
| `data` | Function | `packages/stats/app/src/routes/index.tsx` | 154 |
| `Dropdown` | Function | `packages/console/app/src/component/dropdown.tsx` | 14 |
| `UserMenu` | Function | `packages/console/app/src/routes/user-menu.tsx` | 23 |
| `WorkspaceLayout` | Function | `packages/console/app/src/routes/workspace.tsx` | 19 |
| `userEmail` | Function | `packages/console/app/src/routes/workspace.tsx` | 22 |
| `BlackLayout` | Function | `packages/console/app/src/routes/black.tsx` | 12 |
| `githubData` | Function | `packages/console/app/src/routes/black.tsx` | 15 |
| `starCount` | Function | `packages/console/app/src/routes/black.tsx` | 16 |
| `svgLightingValues` | Function | `packages/console/app/src/routes/black.tsx` | 31 |
| `svgLightingStyle` | Function | `packages/console/app/src/routes/black.tsx` | 55 |
| `WorkspacePicker` | Function | `packages/console/app/src/routes/workspace-picker.tsx` | 47 |
| `workspaces` | Function | `packages/console/app/src/routes/workspace-picker.tsx` | 50 |
| `currentWorkspace` | Function | `packages/console/app/src/routes/workspace-picker.tsx` | 55 |
| `lookup` | Function | `packages/console/support/src/lib/lookup.ts` | 40 |
| `LookupPage` | Function | `packages/console/support/src/routes/lookup.tsx` | 19 |
| `identifier` | Function | `packages/console/support/src/routes/lookup.tsx` | 21 |
| `data` | Function | `packages/console/support/src/routes/lookup.tsx` | 22 |
| `applyThemePreference` | Function | `packages/stats/app/src/routes/index.tsx` | 230 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `BlackLayout → ParseLocale` | cross_community | 6 |
| `BlackLayout → Fix` | cross_community | 6 |
| `StatsHome → StatsMark` | intra_community | 4 |
| `StatsHome → Update` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Component | 9 calls |
| Cluster_393 | 2 calls |
| Billing | 2 calls |
| Components | 1 calls |

## How to Explore

1. `gitnexus_context({name: "StatsHome"})` — see callers and callees
2. `gitnexus_query({query: "routes"})` — find related execution flows
3. Read key files listed above for implementation details
