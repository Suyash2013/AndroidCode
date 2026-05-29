import { afterEach, describe, expect, test } from "bun:test"
import { Server } from "../../src/server/server"
import { EventPaths } from "../../src/server/routes/instance/httpapi/groups/event"
import * as Log from "@opencode-ai/core/util/log"
import { Effect } from "effect"
import { resetDatabase } from "../fixture/db"
import { disposeAllInstances, tmpdir } from "../fixture/fixture"
import { it } from "../lib/effect"

void Log.init({ print: false })

function app() {
  return Server.Default().app
}

const tmpdirEffect = (options: Parameters<typeof tmpdir>[0]) =>
  Effect.acquireRelease(
    Effect.promise(() => tmpdir(options)),
    (tmp) => Effect.promise(() => tmp[Symbol.asyncDispose]()),
  )

function jsonRpc(directory: string, body: string) {
  return Effect.promise(() =>
    app().request("/jsonrpc", {
      method: "POST",
      headers: { "x-opencode-directory": directory, "content-type": "application/json" },
      body,
    }),
  )
}

afterEach(async () => {
  await disposeAllInstances()
  await resetDatabase()
})

describe("JSON-RPC compatibility", () => {
  it.live(
    "single call returns success envelope",
    Effect.gen(function* () {
      const tmp = yield* tmpdirEffect({ config: { formatter: false, lsp: false } })

      const res = yield* jsonRpc(tmp.path, JSON.stringify({ jsonrpc: "2.0", id: 1, method: "session.list", params: {} }))
      expect(res.status).toBe(200)
      const body = yield* Effect.promise(() => res.json())
      expect(body.jsonrpc).toBe("2.0")
      expect(body.id).toBe(1)
      expect(Array.isArray(body.result)).toBe(true)
    }),
  )

  it.live(
    "unknown method returns method-not-found error",
    Effect.gen(function* () {
      const tmp = yield* tmpdirEffect({ config: { formatter: false, lsp: false } })

      const res = yield* jsonRpc(tmp.path, JSON.stringify({ jsonrpc: "2.0", id: 2, method: "unknown.method" }))
      expect(res.status).toBe(200)
      const body = yield* Effect.promise(() => res.json())
      expect(body.jsonrpc).toBe("2.0")
      expect(body.error.code).toBe(-32601)
    }),
  )

  it.live(
    "malformed JSON returns parse error",
    Effect.gen(function* () {
      const tmp = yield* tmpdirEffect({ config: { formatter: false, lsp: false } })

      const res = yield* jsonRpc(tmp.path, "{ not json")
      expect(res.status).toBe(200)
      const body = yield* Effect.promise(() => res.json())
      expect(body.error.code).toBe(-32700)
    }),
  )

  it.live(
    "batch call returns array of responses",
    Effect.gen(function* () {
      const tmp = yield* tmpdirEffect({ config: { formatter: false, lsp: false } })

      const res = yield* jsonRpc(
        tmp.path,
        JSON.stringify([
          { jsonrpc: "2.0", id: 1, method: "session.list", params: {} },
          { jsonrpc: "2.0", id: 2, method: "unknown.method" },
        ]),
      )
      expect(res.status).toBe(200)
      const body = yield* Effect.promise(() => res.json())
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(2)
      expect(Array.isArray(body[0].result)).toBe(true)
      expect(body[1].error.code).toBe(-32601)
    }),
  )
})

async function readFirstSseFrame(response: Response): Promise<string> {
  if (!response.body) throw new Error("missing response body")
  const reader = response.body.getReader()
  try {
    const result = await Promise.race([
      reader.read(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timed out waiting for event")), 5_000)),
    ])
    if (result.done || !result.value) throw new Error("event stream closed")
    return new TextDecoder().decode(result.value).replace(/^data: /, "").trim()
  } finally {
    await reader.cancel()
  }
}

describe("JSON-RPC event framing", () => {
  test("wraps SSE events in a notification envelope when lsp_framing is enabled", async () => {
    await using tmp = await tmpdir({ git: true, config: { formatter: false, lsp: false, server: { lsp_framing: true } } })
    const response = await app().request(EventPaths.event, { headers: { "x-opencode-directory": tmp.path } })
    expect(response.status).toBe(200)
    const frame = JSON.parse(await readFirstSseFrame(response))
    expect(frame.jsonrpc).toBe("2.0")
    expect(frame.method).toBe("event")
    expect(frame.params).toMatchObject({ type: "server.connected" })
  })

  test("emits plain SSE events when lsp_framing is disabled", async () => {
    await using tmp = await tmpdir({ git: true, config: { formatter: false, lsp: false } })
    const response = await app().request(EventPaths.event, { headers: { "x-opencode-directory": tmp.path } })
    expect(response.status).toBe(200)
    const frame = JSON.parse(await readFirstSseFrame(response))
    expect(frame.jsonrpc).toBeUndefined()
    expect(frame.type).toBe("server.connected")
  })
})
