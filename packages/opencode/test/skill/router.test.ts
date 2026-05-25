import { describe, expect, test } from "bun:test"
import { select } from "../../src/skill/router"
import type { Info } from "../../src/skill"

describe("skill router", () => {
  const makeSkill = (name: string, orch?: Info["orchestration"]): Info => ({
    name,
    description: `Desc for ${name}`,
    location: `/tmp/${name}/SKILL.md`,
    content: `# ${name}`,
    orchestration: orch,
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

    const result = select(skills, { taskType: "debugging", confidence: 0.9, filePatterns: [], contentPatterns: [] }, 5)
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

    const result = select(skills, { taskType: "code-generation", confidence: 0.9, filePatterns: [], contentPatterns: [] }, 3)
    expect(result.selected.length).toBe(3)
  })

  test("includes user overrides regardless of score", () => {
    const skills = [
      makeSkill("low-skill", { priority: 1 }),
      makeSkill("high-skill", { triggers: { task_types: ["debugging"] }, priority: 90 }),
    ]

    const result = select(skills, { taskType: "debugging", confidence: 0.9, filePatterns: [], contentPatterns: [] }, 2, {
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

    const result = select(skills, { taskType: "debugging", confidence: 0.9, filePatterns: [], contentPatterns: [] }, 5, {
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

    const result = select(skills, { taskType: "debugging", confidence: 0.9, filePatterns: [], contentPatterns: [] }, 5)
    expect(result.selected.map((s) => s.name)).toContain("high")
    expect(result.selected.map((s) => s.name)).not.toContain("low")
  })

  test("always loads bootstrap skills regardless of score", () => {
    const skills = [
      makeSkill("android-core", { triggers: { task_types: ["code-generation"] }, priority: 10 }),
      makeSkill("debug-skill", { triggers: { task_types: ["debugging"] }, priority: 50 }),
    ]

    // Task is debugging, so android-core scores 0 and would normally be dropped.
    const result = select(
      skills,
      { taskType: "debugging", confidence: 0.9, filePatterns: [], contentPatterns: [] },
      5,
      { include: [], exclude: [] },
      ["android-core"],
    )
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

    const result = select(
      skills,
      { taskType: "debugging", confidence: 0.9, filePatterns: [], contentPatterns: [] },
      5,
      { include: [], exclude: [] },
      ["bootstrap-skill"],
    )
    // 5 scored + 1 bootstrap = 6, even though maxActive is 5.
    expect(result.selected.length).toBe(6)
    expect(result.selected.map((s) => s.name)).toContain("bootstrap-skill")
  })

  test("user exclusion overrides bootstrap always-load", () => {
    const skills = [makeSkill("android-core", { priority: 10 }), makeSkill("debug-skill", { triggers: { task_types: ["debugging"] }, priority: 50 })]

    const result = select(
      skills,
      { taskType: "debugging", confidence: 0.9, filePatterns: [], contentPatterns: [] },
      5,
      { include: [], exclude: ["android-core"] },
      ["android-core"],
    )
    expect(result.selected.map((s) => s.name)).not.toContain("android-core")
  })

  test("applies dependency bonus", () => {
    const skills = [
      makeSkill("dep", { triggers: { task_types: ["debugging"] }, priority: 50 }),
      makeSkill("main", { depends_on: ["dep"], triggers: { task_types: ["debugging"] }, priority: 50 }),
    ]

    const result = select(skills, { taskType: "debugging", confidence: 0.9, filePatterns: [], contentPatterns: [] }, 5)
    const mainScore = result.scores.find((s) => s.skill.name === "main")
    expect(mainScore?.reasons).toContain("depends_on: dep")
  })
})
