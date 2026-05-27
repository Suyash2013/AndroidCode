import { describe, expect, test } from "bun:test"
import { JsonRpc } from "../../src/server/jsonrpc"

describe("JsonRpc", () => {
  test("success envelope", () => {
    const r = JsonRpc.success(1, { ok: true })
    expect(r.jsonrpc).toBe("2.0")
    expect(r.id).toBe(1)
    expect(r.result).toEqual({ ok: true })
  })

  test("error envelope", () => {
    const r = JsonRpc.error("req-1", -32600, "Invalid Request")
    expect(r.error.code).toBe(-32600)
    expect(r.error.message).toBe("Invalid Request")
  })

  test("notification envelope", () => {
    const n = JsonRpc.notification("event", { type: "server.connected" })
    expect((n as any).id).toBeUndefined()
    expect(n.method).toBe("event")
  })
})
