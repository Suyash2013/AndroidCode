import { describe, expect, test } from "bun:test"
import { compareVersions, isMajorConflict, parseMajor, resolveSkillPrecedence } from "../../src/skill/version"

describe("compareVersions", () => {
  test("orders by numeric components", () => {
    expect(compareVersions("2.0.0", "1.9.9")).toBeGreaterThan(0)
    expect(compareVersions("1.2.0", "1.10.0")).toBeLessThan(0)
    expect(compareVersions("1.2.3", "1.2.3")).toBe(0)
  })

  test("treats a missing version as lowest", () => {
    expect(compareVersions(undefined, "1.0.0")).toBeLessThan(0)
    expect(compareVersions("1.0.0", undefined)).toBeGreaterThan(0)
    expect(compareVersions(undefined, undefined)).toBe(0)
  })

  test("tolerates v-prefixes and pre-release suffixes", () => {
    expect(compareVersions("v2.0.0", "2.0.0")).toBe(0)
    expect(compareVersions("1.0.0-beta", "1.0.0")).toBe(0)
  })
})

describe("parseMajor / isMajorConflict", () => {
  test("extracts the major component", () => {
    expect(parseMajor("3.4.5")).toBe(3)
    expect(parseMajor(undefined)).toBeUndefined()
  })

  test("only flags conflicts when both majors are present and differ", () => {
    expect(isMajorConflict("1.0.0", "2.0.0")).toBe(true)
    expect(isMajorConflict("1.0.0", "1.5.0")).toBe(false)
    expect(isMajorConflict(undefined, "2.0.0")).toBe(false)
  })
})

describe("resolveSkillPrecedence", () => {
  test("built-in entries are always replaced", () => {
    expect(resolveSkillPrecedence({ isBuiltin: true }, { source: "local" })).toBe("replace")
  })

  test("local wins over cached regardless of version", () => {
    expect(resolveSkillPrecedence({ source: "cached", version: "9.0.0" }, { source: "local", version: "1.0.0" })).toBe(
      "replace",
    )
    expect(resolveSkillPrecedence({ source: "local", version: "1.0.0" }, { source: "cached", version: "9.0.0" })).toBe(
      "keep-existing",
    )
  })

  test("within the same source the higher version wins", () => {
    expect(resolveSkillPrecedence({ source: "local", version: "1.0.0" }, { source: "local", version: "2.0.0" })).toBe(
      "replace",
    )
    expect(resolveSkillPrecedence({ source: "cached", version: "2.0.0" }, { source: "cached", version: "1.0.0" })).toBe(
      "keep-existing",
    )
  })

  test("equal versions keep the existing entry (order-independent)", () => {
    expect(resolveSkillPrecedence({ source: "local", version: "1.0.0" }, { source: "local", version: "1.0.0" })).toBe(
      "keep-existing",
    )
  })
})
