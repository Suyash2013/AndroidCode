---
name: main
description: "Skill for the Main area of AndroidCode. 77 symbols across 15 files."
---

# Main

77 symbols | 15 files | Cohesion: 80%

## When to Use

- Working with code in `packages/`
- Understanding how runDesktopMenuAction, registerIpcHandlers, migrate work
- Modifying main-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/desktop/src/main/windows.ts` | setTitlebar, updateTitlebar, setPinchZoomEnabled, getPinchZoomEnabled, wireZoom (+18) |
| `packages/desktop/src/main/logging.ts` | getLogger, initCrashReporter, write, initLogging, initRunDirectory (+8) |
| `packages/desktop/src/main/server.ts` | preferAppEnv, spawnLocalServer, refreshTimeout, ready, fail (+2) |
| `packages/desktop/src/main/shell-env.ts` | parseShellEnv, probe, isNushell, loadShellEnv, resolveUserShell (+1) |
| `packages/desktop/src/main/updater.ts` | setupAutoUpdater, checkUpdate, checkAndDownloadUpdate, installUpdate, checkForUpdates |
| `packages/desktop/src/main/apps.ts` | exists, checkMacosApp, resolveWindowsAppPath, hasExt, resolveCmd |
| `packages/desktop/src/main/menu.ts` | createMenu, template, nativeItem, nativeRole |
| `packages/desktop/src/main/unresponsive.ts` | schedule, collect, stopAndFlush |
| `packages/desktop/src/main/desktop-menu-actions.ts` | runDesktopMenuAction, setZoom |
| `packages/desktop/src/main/migrate.ts` | migrateFile, migrate |

## Entry Points

Start here when exploring this area:

- **`runDesktopMenuAction`** (Function) — `packages/desktop/src/main/desktop-menu-actions.ts:9`
- **`registerIpcHandlers`** (Function) — `packages/desktop/src/main/ipc.ts:38`
- **`migrate`** (Function) — `packages/desktop/src/main/migrate.ts:68`
- **`getStore`** (Function) — `packages/desktop/src/main/store.ts:11`
- **`setTitlebar`** (Function) — `packages/desktop/src/main/windows.ts:89`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `runDesktopMenuAction` | Function | `packages/desktop/src/main/desktop-menu-actions.ts` | 9 |
| `registerIpcHandlers` | Function | `packages/desktop/src/main/ipc.ts` | 38 |
| `migrate` | Function | `packages/desktop/src/main/migrate.ts` | 68 |
| `getStore` | Function | `packages/desktop/src/main/store.ts` | 11 |
| `setTitlebar` | Function | `packages/desktop/src/main/windows.ts` | 89 |
| `updateTitlebar` | Function | `packages/desktop/src/main/windows.ts` | 94 |
| `setPinchZoomEnabled` | Function | `packages/desktop/src/main/windows.ts` | 99 |
| `getPinchZoomEnabled` | Function | `packages/desktop/src/main/windows.ts` | 109 |
| `getLogger` | Function | `packages/desktop/src/main/logging.ts` | 19 |
| `setupAutoUpdater` | Function | `packages/desktop/src/main/updater.ts` | 10 |
| `checkUpdate` | Function | `packages/desktop/src/main/updater.ts` | 27 |
| `installUpdate` | Function | `packages/desktop/src/main/updater.ts` | 73 |
| `checkForUpdates` | Function | `packages/desktop/src/main/updater.ts` | 89 |
| `initCrashReporter` | Function | `packages/desktop/src/main/logging.ts` | 35 |
| `write` | Function | `packages/desktop/src/main/logging.ts` | 74 |
| `schedule` | Function | `packages/desktop/src/main/unresponsive.ts` | 20 |
| `collect` | Function | `packages/desktop/src/main/unresponsive.ts` | 26 |
| `stopAndFlush` | Function | `packages/desktop/src/main/unresponsive.ts` | 37 |
| `registerRendererProtocol` | Function | `packages/desktop/src/main/windows.ts` | 183 |
| `createMainWindow` | Function | `packages/desktop/src/main/windows.ts` | 119 |

## How to Explore

1. `gitnexus_context({name: "runDesktopMenuAction"})` — see callers and callees
2. `gitnexus_query({query: "main"})` — find related execution flows
3. Read key files listed above for implementation details
