---
name: gen
description: "Skill for the Gen area of AndroidCode. 106 symbols across 3 files."
---

# Gen

106 symbols | 3 files | Cohesion: 93%

## When to Use

- Working with code in `packages/`
- Understanding how buildClientParams, Auth, App work
- Modifying gen-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/sdk/js/src/v2/gen/sdk.gen.ts` | HeyApiClient, Auth, App, ControlPlane, Console (+76) |
| `packages/sdk/js/src/gen/sdk.gen.ts` | _HeyApiClient, Global, Project, Pty, Config (+19) |
| `packages/sdk/js/src/v2/gen/core/params.gen.ts` | buildClientParams |

## Entry Points

Start here when exploring this area:

- **`buildClientParams`** (Function) — `packages/sdk/js/src/v2/gen/core/params.gen.ts:104`
- **`Auth`** (Class) — `packages/sdk/js/src/v2/gen/sdk.gen.ts:374`
- **`App`** (Class) — `packages/sdk/js/src/v2/gen/sdk.gen.ts:430`
- **`ControlPlane`** (Class) — `packages/sdk/js/src/v2/gen/sdk.gen.ts:537`
- **`Console`** (Class) — `packages/sdk/js/src/v2/gen/sdk.gen.ts:580`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `Auth` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 374 |
| `App` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 430 |
| `ControlPlane` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 537 |
| `Console` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 580 |
| `Session` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 689 |
| `Resource` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 737 |
| `ProjectCopy` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 773 |
| `Adapter` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 909 |
| `Workspace` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 945 |
| `Experimental` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1182 |
| `Config` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1214 |
| `Global` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1252 |
| `Event` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1319 |
| `Config2` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1351 |
| `Tool` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1450 |
| `Worktree` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1516 |
| `Find` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1659 |
| `File` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1763 |
| `Instance` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1859 |
| `Path` | Class | `packages/sdk/js/src/v2/gen/sdk.gen.ts` | 1891 |

## How to Explore

1. `gitnexus_context({name: "buildClientParams"})` — see callers and callees
2. `gitnexus_query({query: "gen"})` — find related execution flows
3. Read key files listed above for implementation details
