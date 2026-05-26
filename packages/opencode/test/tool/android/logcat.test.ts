import { describe, expect, test } from "bun:test"
import { parseLogcatLine } from "../../../src/tool/android/logcat"

describe("logcat parseLogcatLine", () => {
  test("parses a threadtime-format log line", () => {
    const e = parseLogcatLine("05-26 12:34:56.789  1234  1250 I MyTag: Hello world")
    expect(e).not.toBeNull()
    expect(e?.date).toBe("05-26")
    expect(e?.time).toBe("12:34:56.789")
    expect(e?.pid).toBe("1234")
    expect(e?.tid).toBe("1250")
    expect(e?.level).toBe("I")
    expect(e?.tag).toBe("MyTag")
    expect(e?.message).toBe("Hello world")
  })

  test("parses error-level lines with dotted tags", () => {
    const e = parseLogcatLine("05-26 09:00:00.001  900  900 E AndroidRuntime: FATAL EXCEPTION: main")
    expect(e?.level).toBe("E")
    expect(e?.tag).toBe("AndroidRuntime")
    expect(e?.message).toBe("FATAL EXCEPTION: main")
  })

  test("returns null for non-log lines", () => {
    expect(parseLogcatLine("--------- beginning of main")).toBeNull()
    expect(parseLogcatLine("")).toBeNull()
    expect(parseLogcatLine("random text")).toBeNull()
  })
})
