import { describe, expect, test } from "bun:test"
import { select } from "../../src/skill/router"
import type { Info } from "../../src/skill"
import type { Analysis } from "../../src/skill/task-analyzer"

describe("skill router", () => {
  const makeSkill = (name: string, orch?: Info["orchestration"]): Info => ({
    name,
    description: `Desc for ${name}`,
    location: `/tmp/${name}/SKILL.md`,
    content: `# ${name}`,
    orchestration: orch,
  })

  const makeAnalysis = (over: Partial<Analysis>): Analysis => ({
    taskType: "general",
    confidence: 0.9,
    message: "",
    filePatterns: [],
    contentPatterns: [],
    toolsInUse: [],
    ...over,
  })

  test("selects skills by task type match", () => {
    const skills = [
      makeSkill("debug-skill", {
        category: "analysis",
        triggers: { task_types: ["debugging"] },
        priority: 50,
      }),
      makeSkill("build-skill", {
        category: "implementation",
        triggers: { task_types: ["code-generation"] },
        priority: 50,
      }),
    ]

    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 5)
    expect(result.selected.map((s) => s.name)).toEqual(["debug-skill"])
    expect(result.scores[0].score).toBeGreaterThanOrEqual(20)
  })

  test("respects max_active_skills limit", () => {
    const skills = Array.from({ length: 10 }, (_, i) =>
      makeSkill(`skill-${i}`, {
        triggers: { task_types: ["code-generation"] },
        priority: i,
      }),
    )

    const result = select(skills, makeAnalysis({ taskType: "code-generation" }), 3)
    expect(result.selected.length).toBe(3)
  })

  test("includes user overrides regardless of score", () => {
    const skills = [
      makeSkill("low-skill", { priority: 1 }),
      makeSkill("high-skill", { triggers: { task_types: ["debugging"] }, priority: 90 }),
    ]

    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 2, {
      include: ["low-skill"],
      exclude: [],
    })
    expect(result.selected.map((s) => s.name)).toContain("low-skill")
  })

  test("excludes excluded skills", () => {
    const skills = [
      makeSkill("a", { triggers: { task_types: ["debugging"] }, priority: 50 }),
      makeSkill("b", { triggers: { task_types: ["debugging"] }, priority: 50 }),
    ]

    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 5, {
      include: [],
      exclude: ["a"],
    })
    expect(result.selected.map((s) => s.name)).not.toContain("a")
  })

  test("resolves conflicts by priority", () => {
    const skills = [
      makeSkill("high", { conflicts_with: ["low"], priority: 80, triggers: { task_types: ["debugging"] } }),
      makeSkill("low", { conflicts_with: ["high"], priority: 20, triggers: { task_types: ["debugging"] } }),
    ]

    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 5)
    expect(result.selected.map((s) => s.name)).toContain("high")
    expect(result.selected.map((s) => s.name)).not.toContain("low")
  })

  test("always loads bootstrap skills regardless of score", () => {
    const skills = [
      makeSkill("android-core", { triggers: { task_types: ["code-generation"] }, priority: 10 }),
      makeSkill("debug-skill", { triggers: { task_types: ["debugging"] }, priority: 50 }),
    ]

    // Task is debugging, so android-core scores 0 and would normally be dropped.
    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 5, { include: [], exclude: [] }, ["android-core"])
    const names = result.selected.map((s) => s.name)
    expect(names).toContain("android-core")
    expect(names).toContain("debug-skill")
    const bootstrap = result.scores.find((s) => s.skill.name === "android-core")
    expect(bootstrap?.reasons).toContain("bootstrap")
  })

  test("bootstrap skills load beyond the maxActive cap", () => {
    const skills = [
      ...Array.from({ length: 5 }, (_, i) => makeSkill(`hit-${i}`, { triggers: { task_types: ["debugging"] }, priority: 50 })),
      makeSkill("bootstrap-skill"),
    ]

    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 5, { include: [], exclude: [] }, ["bootstrap-skill"])
    // 5 scored + 1 bootstrap = 6, even though maxActive is 5.
    expect(result.selected.length).toBe(6)
    expect(result.selected.map((s) => s.name)).toContain("bootstrap-skill")
  })

  test("user exclusion overrides bootstrap always-load", () => {
    const skills = [makeSkill("android-core", { priority: 10 }), makeSkill("debug-skill", { triggers: { task_types: ["debugging"] }, priority: 50 })]

    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 5, { include: [], exclude: ["android-core"] }, ["android-core"])
    expect(result.selected.map((s) => s.name)).not.toContain("android-core")
  })

  test("applies dependency bonus", () => {
    const skills = [
      makeSkill("dep", { triggers: { task_types: ["debugging"] }, priority: 50 }),
      makeSkill("main", { depends_on: ["dep"], triggers: { task_types: ["debugging"] }, priority: 50 }),
    ]

    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 5)
    const mainScore = result.scores.find((s) => s.skill.name === "main")
    expect(mainScore?.reasons).toContain("depends_on: dep")
  })

  test("content_patterns match the user message, not the task type", () => {
    const skills = [
      makeSkill("compose-skill", {
        triggers: { content_patterns: ["jetpack compose"] },
        priority: 50,
      }),
    ]

    // taskType is "general" and does not contain the pattern; the message does.
    const result = select(
      skills,
      makeAnalysis({ taskType: "general", message: "Help me with Jetpack Compose recomposition" }),
      5,
    )
    const score = result.scores.find((s) => s.skill.name === "compose-skill")
    expect(score?.reasons).toContain("content_pattern: jetpack compose")
  })

  test("tools_in_use matches against the analysis toolsInUse list", () => {
    const skills = [makeSkill("gradle-skill", { triggers: { tools_in_use: ["gradle"] }, priority: 50 })]

    const result = select(skills, makeAnalysis({ taskType: "general", toolsInUse: ["gradle", "read"] }), 5)
    const score = result.scores.find((s) => s.skill.name === "gradle-skill")
    expect(score?.reasons).toContain("tool: gradle")
  })

  test("orders equal-scoring skills by category (process before tooling)", () => {
    const skills = [
      makeSkill("tool-skill", { category: "tooling", triggers: { task_types: ["debugging"] }, priority: 50 }),
      makeSkill("proc-skill", { category: "process", triggers: { task_types: ["debugging"] }, priority: 50 }),
    ]

    const result = select(skills, makeAnalysis({ taskType: "debugging" }), 5)
    // Same score and priority; category breaks the tie with process first.
    expect(result.selected.map((s) => s.name)).toEqual(["proc-skill", "tool-skill"])
  })
})
