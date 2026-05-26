import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import {
  analyze,
  applyClassifier,
  extractContentPatterns,
  TASK_TYPES,
  type Analysis,
  type TaskClassifier,
} from "../../src/skill/task-analyzer"

function makeAnalysis(overrides: Partial<Analysis> = {}): Analysis {
  return {
    taskType: "general",
    confidence: 0.3,
    message: "do something",
    filePatterns: [],
    contentPatterns: [],
    toolsInUse: [],
    ...overrides,
  }
}

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

  test("classifies review tasks", () => {
    const result = analyze("Review this pull request before we merge", [])
    expect(result.taskType).toBe("review")
    expect(result.confidence).toBeGreaterThanOrEqual(0.5)
  })

  test("classifies planning tasks", () => {
    const result = analyze("Design the architecture and plan the modularization approach", [])
    expect(result.taskType).toBe("planning")
    expect(result.confidence).toBeGreaterThanOrEqual(0.5)
  })

  test("exposes the raw user message and tools-in-use", () => {
    const result = analyze("Fix the crash", [], ["gradle", "read"])
    expect(result.message).toBe("Fix the crash")
    expect(result.toolsInUse).toEqual(["gradle", "read"])
  })

  test("extracts content patterns from file contents", () => {
    const contents = new Map<string, string>([
      ["A.kt", "package com.example\nimport androidx.compose.material3.Button\nimport kotlinx.coroutines.flow.Flow"],
      ["b.ts", 'import { useState } from "react"\nimport http from "node:http"'],
    ])
    const patterns = extractContentPatterns(contents)
    expect(patterns).toContain("androidx.compose.material3.Button")
    expect(patterns).toContain("Button")
    expect(patterns).toContain("react")
    expect(patterns).toContain("node:http")
  })

  test("populates contentPatterns through analyze when file contents are provided", () => {
    const contents = new Map<string, string>([["MainActivity.kt", "import androidx.activity.ComponentActivity"]])
    const result = analyze("look at this", ["MainActivity.kt"], [], contents)
    expect(result.contentPatterns).toContain("androidx.activity.ComponentActivity")
  })
})

describe("gated Stage 2 classifier (applyClassifier)", () => {
  test("exposes every keyword task type as a candidate label", () => {
    expect(TASK_TYPES).toContain("debugging")
    expect(TASK_TYPES).toContain("review")
    expect(TASK_TYPES).toContain("planning")
  })

  test("skips the classifier when keyword confidence is already high", async () => {
    let called = false
    const classify: TaskClassifier = () => {
      called = true
      return Effect.succeed("debugging")
    }
    const result = await Effect.runPromise(applyClassifier(makeAnalysis({ confidence: 0.9, taskType: "testing" }), classify))
    expect(called).toBe(false)
    expect(result.taskType).toBe("testing")
  })

  test("overrides the task type with a valid low-confidence classification", async () => {
    const classify: TaskClassifier = () => Effect.succeed("Debugging")
    const result = await Effect.runPromise(applyClassifier(makeAnalysis({ confidence: 0.25 }), classify))
    expect(result.taskType).toBe("debugging")
    expect(result.confidence).toBeGreaterThanOrEqual(0.8)
  })

  test("ignores an out-of-vocabulary classification", async () => {
    const classify: TaskClassifier = () => Effect.succeed("not-a-real-label")
    const result = await Effect.runPromise(applyClassifier(makeAnalysis({ confidence: 0.25, taskType: "general" }), classify))
    expect(result.taskType).toBe("general")
  })

  test("falls back to the keyword result when the classifier fails", async () => {
    const classify: TaskClassifier = () => Effect.die(new Error("model unavailable"))
    const result = await Effect.runPromise(applyClassifier(makeAnalysis({ confidence: 0.25, taskType: "general" }), classify))
    expect(result.taskType).toBe("general")
  })

  test("is a no-op when no classifier is provided", async () => {
    const result = await Effect.runPromise(applyClassifier(makeAnalysis({ confidence: 0.1, taskType: "general" }), undefined))
    expect(result.taskType).toBe("general")
  })
})
