---
name: plugin
description: "Skill for the Plugin area of AndroidCode. 114 symbols across 13 files."
---

# Plugin

114 symbols | 13 files | Cohesion: 72%

## When to Use

- Working with code in `packages/`
- Understanding how accessTokenIsExpiring, requestDeviceCode, pollDeviceCodeToken work
- Modifying plugin-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/src/cli/cmd/tui/plugin/runtime.ts` | fail, createMeta, dispose, activatePluginEntry, activatePluginById (+24) |
| `packages/opencode/src/plugin/shared.ts` | resolveTargetDirectory, resolvePluginEntrypoint, checkPluginCompatibility, readPluginPackage, createPluginEntry (+15) |
| `packages/opencode/src/plugin/xai.ts` | authHeaders, accessTokenIsExpiring, exchangeCodeForTokens, refreshAccessToken, requestDeviceCode (+12) |
| `packages/opencode/src/plugin/meta.ts` | storePath, lock, read, next, touchMany (+5) |
| `packages/opencode/src/plugin/install.ts` | patchPluginConfig, resolve, patchPluginList, installPlugin, patchOne (+5) |
| `packages/opencode/src/plugin/index.ts` | getServerPlugin, getLegacyPlugins, applyPlugin, error, experimentalWebSocketsEnabled (+1) |
| `packages/opencode/src/plugin/digitalocean.ts` | buildAuthorizeUrl, startOAuthServer, authorize, listRouters, models (+1) |
| `packages/opencode/src/plugin/loader.ts` | resolve, isRetryableResolveError, attempt, loadExternal |
| `packages/opencode/test/plugin/openai-ws.test.ts` | createWebSocketServer, createRejectingWebSocketServer, createHttpServer, websocketServerHandle |
| `packages/core/test/plugin/provider-cloudflare-workers-ai.test.ts` | cloudflareLanguage, cloudflareURL, cloudflareHeaders |

## Entry Points

Start here when exploring this area:

- **`accessTokenIsExpiring`** (Function) — `packages/opencode/src/plugin/xai.ts:120`
- **`requestDeviceCode`** (Function) — `packages/opencode/src/plugin/xai.ts:218`
- **`pollDeviceCodeToken`** (Function) — `packages/opencode/src/plugin/xai.ts:257`
- **`callback`** (Function) — `packages/opencode/src/plugin/xai.ts:680`
- **`touchMany`** (Function) — `packages/opencode/src/plugin/meta.ts:141`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `accessTokenIsExpiring` | Function | `packages/opencode/src/plugin/xai.ts` | 120 |
| `requestDeviceCode` | Function | `packages/opencode/src/plugin/xai.ts` | 218 |
| `pollDeviceCodeToken` | Function | `packages/opencode/src/plugin/xai.ts` | 257 |
| `callback` | Function | `packages/opencode/src/plugin/xai.ts` | 680 |
| `touchMany` | Function | `packages/opencode/src/plugin/meta.ts` | 141 |
| `setTheme` | Function | `packages/opencode/src/plugin/meta.ts` | 168 |
| `list` | Function | `packages/opencode/src/plugin/meta.ts` | 182 |
| `resolve` | Function | `packages/opencode/src/plugin/loader.ts` | 85 |
| `checkPluginCompatibility` | Function | `packages/opencode/src/plugin/shared.ts` | 193 |
| `readPluginPackage` | Function | `packages/opencode/src/plugin/shared.ts` | 214 |
| `createPluginEntry` | Function | `packages/opencode/src/plugin/shared.ts` | 223 |
| `resolvePluginId` | Function | `packages/opencode/src/plugin/shared.ts` | 305 |
| `readPluginId` | Function | `packages/opencode/src/plugin/shared.ts` | 263 |
| `readV1Plugin` | Function | `packages/opencode/src/plugin/shared.ts` | 271 |
| `parsePluginSpecifier` | Function | `packages/opencode/src/plugin/shared.ts` | 21 |
| `isPathPluginSpec` | Function | `packages/opencode/src/plugin/shared.ts` | 170 |
| `list` | Function | `packages/opencode/src/plugin/shared.ts` | 244 |
| `patchPluginConfig` | Function | `packages/opencode/src/plugin/install.ts` | 420 |
| `installPlugin` | Function | `packages/opencode/src/plugin/install.ts` | 258 |
| `isRetryableResolveError` | Function | `packages/opencode/src/plugin/loader.ts` | 70 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Config | 9 calls |
| Component | 5 calls |
| Context | 2 calls |

## How to Explore

1. `gitnexus_context({name: "accessTokenIsExpiring"})` — see callers and callees
2. `gitnexus_query({query: "plugin"})` — find related execution flows
3. Read key files listed above for implementation details
