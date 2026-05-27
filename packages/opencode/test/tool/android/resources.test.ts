import { describe, expect, test } from "bun:test"
import { parseResourceDir } from "../../../src/tool/android/resources"

describe("parseResourceDir", () => {
  test("parses a bare resource type", () => {
    expect(parseResourceDir("values")).toEqual({ type: "values", qualifiers: [] })
    expect(parseResourceDir("layout")).toEqual({ type: "layout", qualifiers: [] })
  })

  test("splits configuration qualifiers from the base type", () => {
    expect(parseResourceDir("values-night")).toEqual({ type: "values", qualifiers: ["night"] })
    expect(parseResourceDir("drawable-hdpi")).toEqual({ type: "drawable", qualifiers: ["hdpi"] })
  })

  test("handles multiple qualifiers", () => {
    expect(parseResourceDir("values-night-v23")).toEqual({ type: "values", qualifiers: ["night", "v23"] })
  })
})
