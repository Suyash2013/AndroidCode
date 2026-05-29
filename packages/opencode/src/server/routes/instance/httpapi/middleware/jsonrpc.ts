import { Effect } from "effect"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http"
import { OpenApi } from "effect/unstable/httpapi"
import { JsonRpc } from "@/server/jsonrpc"
import { JsonRpcGuards } from "@/server/jsonrpc-guards"
import { Server } from "@/server/server"
import { lazy } from "@/util/lazy"
import { OpenCodeHttpApi } from "../api"

type Route = { method: string; path: string }

// Build a `operationId -> { method, path }` table from the generated OpenAPI
// spec. Effect sets `operationId` from each endpoint's `identifier` annotation
// (e.g. "session.list"), so JSON-RPC method names map 1:1 onto the REST routes
// without a hand-maintained lookup table.
const routeRegistry = lazy(() => {
  const spec = OpenApi.fromApi(OpenCodeHttpApi) as {
    paths?: Record<string, Partial<Record<string, { operationId?: string }>>>
  }
  const map = new Map<string, Route>()
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of ["get", "post", "put", "delete", "patch"] as const) {
      const operation = item[method]
      if (operation?.operationId) map.set(operation.operationId, { method: method.toUpperCase(), path })
    }
  }
  return map
})

// Translate a JSON-RPC method + params into an internal HTTP request shape.
// Path params (`{name}`) are filled from `params`; remaining keys become a query
// string for GET/DELETE or a JSON body otherwise.
function buildInternalRequest(route: Route, params: unknown): { path: string; body?: string } {
  const record = params && typeof params === "object" && !Array.isArray(params) ? (params as Record<string, unknown>) : {}
  const consumed = new Set<string>()
  const path = route.path.replace(/\{([^}]+)\}/g, (_, name: string) => {
    consumed.add(name)
    return encodeURIComponent(String(record[name] ?? ""))
  })

  const leftover: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(record)) if (!consumed.has(key)) leftover[key] = value

  if (route.method === "GET" || route.method === "DELETE") {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(leftover)) {
      if (value === undefined || value === null) continue
      search.set(key, typeof value === "object" ? JSON.stringify(value) : String(value))
    }
    const query = search.toString()
    return { path: query ? `${path}?${query}` : path }
  }

  return { path, body: JSON.stringify(Array.isArray(params) ? params : leftover) }
}

function forwardHeaders(source: Record<string, string | undefined>): Headers {
  const headers = new Headers()
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue
    const lower = key.toLowerCase()
    // Drop hop-by-hop / length headers — the sub-request body has its own size,
    // and `host` is irrelevant since the web handler routes off the URL.
    if (lower === "content-length" || lower === "host" || lower === "connection") continue
    headers.set(key, value)
  }
  headers.set("content-type", "application/json")
  return headers
}

async function dispatchSingle(
  request: JsonRpc.Request,
  headers: Record<string, string | undefined>,
): Promise<JsonRpc.Response> {
  const id = request.id ?? null
  const route = routeRegistry().get(request.method)
  if (!route) return JsonRpc.error(id, -32601, `Method not found: ${request.method}`)

  const internal = buildInternalRequest(route, request.params)
  const subRequest = new Request(new URL(internal.path, "http://localhost"), {
    method: route.method,
    headers: forwardHeaders(headers),
    body: internal.body,
  })

  const response = await Server.Default().app.fetch(subRequest)
  const text = await response.text()
  if (response.status >= 200 && response.status < 300) {
    let result: unknown = null
    try {
      result = text ? JSON.parse(text) : null
    } catch {
      result = text
    }
    return JsonRpc.success(id, result)
  }

  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text || null
  }
  return JsonRpc.error(id, -32603, `Internal error: HTTP ${response.status}`, data)
}

async function dispatchBatch(
  entries: unknown[],
  headers: Record<string, string | undefined>,
): Promise<JsonRpc.Response[]> {
  const responses: JsonRpc.Response[] = []
  for (const entry of entries) {
    if (JsonRpcGuards.isRequest(entry)) {
      responses.push(await dispatchSingle(entry, headers))
    } else if (JsonRpcGuards.isNotification(entry)) {
      // Fire-and-forget: notifications get no response entry.
      await dispatchSingle({ ...entry, id: null } as JsonRpc.Request, headers).catch(() => null)
    } else {
      responses.push(JsonRpc.error(null, -32600, "Invalid Request"))
    }
  }
  return responses
}

export const jsonRpcRoute = HttpRouter.use((router) =>
  Effect.gen(function* () {
    yield* router.add(
      "POST",
      "/jsonrpc",
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest
        const headers = request.headers
        const bodyText = yield* Effect.orDie(request.text)

        let payload: unknown
        try {
          payload = JSON.parse(bodyText)
        } catch {
          return HttpServerResponse.jsonUnsafe(JsonRpc.error(null, -32700, "Parse error"), { status: 200 })
        }

        if (JsonRpcGuards.isBatch(payload)) {
          if (payload.length === 0) {
            return HttpServerResponse.jsonUnsafe(JsonRpc.error(null, -32600, "Invalid Request"), { status: 200 })
          }
          const responses = yield* Effect.promise(() => dispatchBatch(payload, headers))
          // An all-notification batch produces no responses; reply 204 per spec.
          if (responses.length === 0) return HttpServerResponse.empty({ status: 204 })
          return HttpServerResponse.jsonUnsafe(responses, { status: 200 })
        }

        if (JsonRpcGuards.isRequest(payload)) {
          const response = yield* Effect.promise(() => dispatchSingle(payload, headers))
          return HttpServerResponse.jsonUnsafe(response, { status: 200 })
        }

        if (JsonRpcGuards.isNotification(payload)) {
          yield* Effect.promise(() =>
            dispatchSingle({ ...payload, id: null } as JsonRpc.Request, headers).catch(() => null),
          )
          return HttpServerResponse.empty({ status: 204 })
        }

        return HttpServerResponse.jsonUnsafe(JsonRpc.error(null, -32600, "Invalid Request"), { status: 200 })
      }),
    )
  }),
)
