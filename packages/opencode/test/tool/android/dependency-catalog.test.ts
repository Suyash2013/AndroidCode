import { describe, expect, test } from "bun:test"
import { setCatalogVersion } from "../../../src/tool/android/dependency-catalog"

const CATALOG = `[versions]
kotlin = "1.9.0"
agp = "8.2.0"

[libraries]
core-ktx = { module = "androidx.core:core-ktx", version.ref = "kotlin" }
`

describe("setCatalogVersion", () => {
  test("updates an existing version in place", () => {
    const updated = setCatalogVersion(CATALOG, "kotlin", "2.0.21")
    expect(updated).toContain(`kotlin = "2.0.21"`)
    expect(updated).not.toContain(`kotlin = "1.9.0"`)
    // Other entries and sections are preserved.
    expect(updated).toContain(`agp = "8.2.0"`)
    expect(updated).toContain("[libraries]")
  })

  test("inserts a new version into the existing [versions] table", () => {
    const updated = setCatalogVersion(CATALOG, "compose", "1.6.0")
    expect(updated).toContain(`compose = "1.6.0"`)
    // Inserted before the [libraries] section, still inside [versions].
    expect(updated.indexOf("compose")).toBeLessThan(updated.indexOf("[libraries]"))
  })

  test("creates a [versions] table when none exists", () => {
    const updated = setCatalogVersion(`[libraries]\nx = "y"\n`, "kotlin", "2.0.0")
    expect(updated).toContain("[versions]")
    expect(updated).toContain(`kotlin = "2.0.0"`)
  })

  test("does not partially match similarly-named keys", () => {
    const updated = setCatalogVersion(CATALOG, "kotlinx", "1.0.0")
    expect(updated).toContain(`kotlin = "1.9.0"`)
    expect(updated).toContain(`kotlinx = "1.0.0"`)
  })
})
