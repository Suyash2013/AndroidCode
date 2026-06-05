import { describe, expect, it } from "bun:test"
import { Schema } from "effect"
import {
  ALL_ERROR_CODES,
  AndroidToolResult,
  makeError,
  makeSuccess,
} from "../../src/tool/android-result"

describe("AndroidToolResult", () => {
  describe("makeSuccess", () => {
    it("produces a valid AndroidToolResult with status success", () => {
      const result = makeSuccess({ hello: "android" })
      expect(result.status).toBe("success")
      expect(result.data).toEqual({ hello: "android" })
      expect(result.error).toBeUndefined()
    })

    it("produces a valid AndroidToolResult without data", () => {
      const result = makeSuccess()
      expect(result.status).toBe("success")
      expect(result.data).toBeUndefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe("makeError", () => {
    it("produces a valid AndroidToolResult with status error and error code", () => {
      const result = makeError("NO_DEVICE", "No emulator or device connected")
      expect(result.status).toBe("error")
      expect(result.data).toBeUndefined()
      expect(result.error).toBeDefined()
      expect(result.error!.code).toBe("NO_DEVICE")
      expect(result.error!.message).toBe("No emulator or device connected")
    })

    it("produces a valid AndroidToolResult with detail", () => {
      const result = makeError("BUILD_FAILED", "Build failed", { task: "assembleDebug", exitCode: 1 })
      expect(result.status).toBe("error")
      expect(result.error!.code).toBe("BUILD_FAILED")
      expect(result.error!.message).toBe("Build failed")
      expect(result.error!.detail).toEqual({ task: "assembleDebug", exitCode: 1 })
    })

    it("produces a valid AndroidToolResult for each error code", () => {
      for (const code of ALL_ERROR_CODES) {
        const result = makeError(code, `Error: ${code}`)
        expect(result.status).toBe("error")
        expect(result.error!.code).toBe(code)
        expect(result.error!.message).toBe(`Error: ${code}`)
      }
    })
  })

  describe("JSON round-trip", () => {
    it("preserves success result through JSON encode/decode", () => {
      const result = makeSuccess({ hello: "android" })
      const json = JSON.stringify(result)
      const parsed = JSON.parse(json)
      expect(parsed.status).toBe("success")
      expect(parsed.data).toEqual({ hello: "android" })
    })

    it("preserves error result through JSON encode/decode", () => {
      const result = makeError("NO_DEVICE", "No emulator or device connected", { detail: true })
      const json = JSON.stringify(result)
      const parsed = JSON.parse(json)
      expect(parsed.status).toBe("error")
      expect(parsed.error.code).toBe("NO_DEVICE")
      expect(parsed.error.message).toBe("No emulator or device connected")
      expect(parsed.error.detail).toEqual({ detail: true })
    })
  })

  describe("Schema validation", () => {
    it("decodeUnknown succeeds for valid success result", () => {
      const decoded = Schema.decodeUnknownSync(AndroidToolResult)({
        status: "success",
        data: { hello: "android" },
      })
      expect(decoded.status).toBe("success")
      expect(decoded.data).toEqual({ hello: "android" })
    })

    it("decodeUnknown succeeds for valid error result", () => {
      const decoded = Schema.decodeUnknownSync(AndroidToolResult)({
        status: "error",
        error: { code: "NO_DEVICE", message: "No emulator or device connected" },
      })
      expect(decoded.status).toBe("error")
      expect(decoded.error!.code).toBe("NO_DEVICE")
      expect(decoded.error!.message).toBe("No emulator or device connected")
    })

    it("decodeUnknown succeeds for valid warning result", () => {
      const decoded = Schema.decodeUnknownSync(AndroidToolResult)({
        status: "warning",
      })
      expect(decoded.status).toBe("warning")
    })

    it("decodeUnknown rejects an invalid status string", () => {
      expect(() =>
        Schema.decodeUnknownSync(AndroidToolResult)({
          status: "invalid_status",
        }),
      ).toThrow()
    })

    it("decodeUnknown rejects an unknown error code", () => {
      expect(() =>
        Schema.decodeUnknownSync(AndroidToolResult)({
          status: "error",
          error: { code: "INVALID_CODE", message: "some error" },
        }),
      ).toThrow()
    })
  })
})
