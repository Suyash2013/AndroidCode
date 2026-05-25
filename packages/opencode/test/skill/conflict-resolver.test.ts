import { describe, expect, test } from "bun:test"
import { resolveConflicts } from "../../src/skill/conflict-resolver"
import type { Info, ScoredSkill } from "../../src/skill/types"

const scored = (name: string, orch?: Info["orchestration"]): ScoredSkill => ({
  skill: { name, description: name, location: `/tmp/${name}`, content: `# ${name}`, orchestration: orch },
  score: 50,
  reasons: [],
})

describe("conflict resolver", () => {
  test("drops the lower-priority skill", () => {
    const result = resolveConflicts([
      scored("high", { conflicts_with: ["low"], priority: 80 }),
      scored("low", { conflicts_with: ["high"], priority: 20 }),
    ])
    expect(result.map((s) => s.skill.name)).toEqual(["high"])
  })

  test("on equal priority, drops the broader scope", () => {
    const result = resolveConflicts([
      scored("narrow", { conflicts_with: ["broad"], priority: 50, scope: "file" }),
      scored("broad", { conflicts_with: ["narrow"], priority: 50, scope: "session" }),
    ])
    expect(result.map((s) => s.skill.name)).toEqual(["narrow"])
  })

  test("on equal priority and scope, drops the alphabetically later name", () => {
    const result = resolveConflicts([
      scored("aaa", { conflicts_with: ["zzz"], priority: 50, scope: "project" }),
      scored("zzz", { conflicts_with: ["aaa"], priority: 50, scope: "project" }),
    ])
    expect(result.map((s) => s.skill.name)).toEqual(["aaa"])
  })

  test("keeps non-conflicting skills", () => {
    const result = resolveConflicts([scored("a"), scored("b")])
    expect(result.map((s) => s.skill.name).sort()).toEqual(["a", "b"])
  })
})
