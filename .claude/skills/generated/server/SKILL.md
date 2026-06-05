---
name: server
description: "Skill for the Server area of AndroidCode. 88 symbols across 29 files."
---

# Server

88 symbols | 29 files | Cohesion: 84%

## When to Use

- Working with code in `packages/`
- Understanding how requestInDirectory, stop, withTimeout work
- Modifying server-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `packages/opencode/test/server/httpapi-sdk.test.ts` | call, capture, captureThrown, expectStatus, firstEvent (+11) |
| `packages/opencode/test/server/httpapi-listen.test.ts` | expectSocketRejected, stop, waitForMessage, authorization, requestTicket (+5) |
| `packages/opencode/test/server/httpapi-workspace-routing.test.ts` | requestURL, listenAdditionalServer, syncResponse, startRemoteWorkspaceHttpServer, listenRemoteWebSocket (+5) |
| `packages/opencode/test/server/httpapi-provider.test.ts` | isRecord, providerList, providerByID, hasNonZeroModelCost, hasProviderMutationMarker (+2) |
| `packages/opencode/test/server/worktree-endpoint-repro.test.ts` | request, json, removeCreatedWorktree, createWorktreeScoped, setProjectStartCommand |
| `packages/opencode/test/server/httpapi-session.test.ts` | createLocalWorkspace, request, requestJson, recordPrompt |
| `packages/opencode/test/server/httpapi-workspace.test.ts` | request, requestDefault, requestServer |
| `packages/opencode/src/server/server.ts` | listenerLayer, startWithPortFallback, startListener |
| `packages/opencode/test/server/httpapi-experimental.test.ts` | request, json, withCreatedWorktree |
| `packages/opencode/test/server/httpapi-ui.test.ts` | uiApp, routeOrderingApp, httpClient |

## Entry Points

Start here when exploring this area:

- **`requestInDirectory`** (Function) — `packages/opencode/test/server/httpapi-layer.ts:28`
- **`stop`** (Function) — `packages/opencode/src/cli/cmd/tui/thread.ts:174`
- **`withTimeout`** (Function) — `packages/opencode/src/util/timeout.ts:0`
- **`registerAdapter`** (Function) — `packages/opencode/src/control-plane/adapters/index.ts:36`
- **`name`** (Function) — `packages/app/src/components/server/server-row.tsx:32`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `requestInDirectory` | Function | `packages/opencode/test/server/httpapi-layer.ts` | 28 |
| `stop` | Function | `packages/opencode/src/cli/cmd/tui/thread.ts` | 174 |
| `withTimeout` | Function | `packages/opencode/src/util/timeout.ts` | 0 |
| `registerAdapter` | Function | `packages/opencode/src/control-plane/adapters/index.ts` | 36 |
| `name` | Function | `packages/app/src/components/server/server-row.tsx` | 32 |
| `tooltipValue` | Function | `packages/app/src/components/server/server-row.tsx` | 53 |
| `serverName` | Function | `packages/app/src/context/server.tsx` | 16 |
| `isAllowedCorsOrigin` | Function | `packages/opencode/src/server/cors.ts` | 10 |
| `isAllowedRequestOrigin` | Function | `packages/opencode/src/server/cors.ts` | 21 |
| `waitGlobalBusEvent` | Function | `packages/opencode/test/server/global-bus.ts` | 3 |
| `request` | Function | `packages/opencode/test/server/httpapi-layer.ts` | 20 |
| `openEventStream` | Function | `packages/opencode/test/server/httpapi-event.test.ts` | 28 |
| `request` | Function | `packages/opencode/test/server/httpapi-workspace.test.ts` | 42 |
| `requestDefault` | Function | `packages/opencode/test/server/httpapi-workspace.test.ts` | 46 |
| `requestServer` | Function | `packages/opencode/test/server/httpapi-workspace.test.ts` | 50 |
| `request` | Function | `packages/opencode/test/server/project-copy.test.ts` | 27 |
| `request` | Function | `packages/opencode/test/server/project-init-git.test.ts` | 28 |
| `request` | Function | `packages/opencode/test/server/session-messages.test.ts` | 81 |
| `expectSocketRejected` | Function | `packages/opencode/test/server/httpapi-listen.test.ts` | 114 |
| `stop` | Function | `packages/opencode/test/server/httpapi-listen.test.ts` | 136 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Fixture | 3 calls |
| Cluster_1173 | 2 calls |
| Acp | 2 calls |
| Component | 1 calls |

## How to Explore

1. `gitnexus_context({name: "requestInDirectory"})` — see callers and callees
2. `gitnexus_query({query: "server"})` — find related execution flows
3. Read key files listed above for implementation details
