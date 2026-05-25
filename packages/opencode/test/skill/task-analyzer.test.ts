import { describe, expect, test } from "bun:test"
import { analyze } from "../../src/skill/task-analyzer"

describe("task analyzer", () => {
  test("classifies debugging tasks", () => {
    const result = analyze("Fix the crash in the login flow", [])
    expect(result.taskType).toBe("debugging")
    expect(result.confidence).toBeGreaterThanOrEqual(0.5)
  })

  test("classifies code generation tasks", () => {
    const result = analyze("Build a new Gradle module for analytics", [])
    expect(result.taskType).toBe("code-generation")
    expect(result.confidence).toBeGreaterThanOrEqual(0.5)
  })

  test("classifies testing tasks", () => {
    const result = analyze("Write unit tests for the ViewModel", [])
    expect(result.taskType).toBe("testing")
    expect(result.confidence).toBeGreaterThanOrEqual(0.5)
  })

  test("extracts file patterns from recent files", () => {
    const result = analyze("Look at this file", ["src/main/java/com/example/MainActivity.kt", "build.gradle.kts"])
    expect(result.filePatterns).toContain("*.kt")
    expect(result.filePatterns).toContain("build.gradle.kts")
  })

  test("falls back to general for unknown messages", () => {
    const result = analyze("hello", [])
    expect(result.confidence).toBeLessThan(0.7)
  })
})
