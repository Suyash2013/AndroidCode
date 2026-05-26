import { describe, expect, test } from "bun:test"
import { parseGradleOutput, buildTaskPath } from "../../../src/tool/android/gradle"

describe("gradle parseGradleOutput", () => {
  test("detects BUILD SUCCESSFUL", () => {
    const r = parseGradleOutput("> Task :app:assembleDebug\nBUILD SUCCESSFUL in 3s", "", 0)
    expect(r.status).toBe("success")
    expect(r.errors).toEqual([])
  })

  test("detects BUILD FAILED and extracts Kotlin compiler errors", () => {
    const stdout = [
      "> Task :app:compileDebugKotlin FAILED",
      "e: /src/Main.kt: (5, 1): unresolved reference: foo",
      "BUILD FAILED in 2s",
    ].join("\n")
    const r = parseGradleOutput(stdout, "", 1)
    expect(r.status).toBe("failed")
    expect(r.errors.some((e) => e.startsWith("e: "))).toBe(true)
    expect(r.errors.some((e) => e.endsWith("FAILED"))).toBe(true)
  })

  test("treats non-zero exit without a marker as failed", () => {
    const r = parseGradleOutput("", "could not resolve dependency", 1)
    expect(r.status).toBe("failed")
  })

  test("reports unknown when there is no marker and a clean exit", () => {
    const r = parseGradleOutput("nothing useful", "", 0)
    expect(r.status).toBe("unknown")
  })
})

describe("gradle buildTaskPath", () => {
  test("qualifies a bare task with a module", () => {
    expect(buildTaskPath("assembleDebug", ":app")).toBe(":app:assembleDebug")
    expect(buildTaskPath("assembleDebug", "app")).toBe(":app:assembleDebug")
  })

  test("leaves already-qualified tasks and module-less tasks untouched", () => {
    expect(buildTaskPath(":app:test")).toBe(":app:test")
    expect(buildTaskPath("test")).toBe("test")
    expect(buildTaskPath(":core:lint", ":app")).toBe(":core:lint")
  })
})
