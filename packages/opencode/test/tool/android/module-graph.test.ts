import { describe, expect, test } from "bun:test"
import { parseModuleDependencies } from "../../../src/tool/android/module-graph"

describe("parseModuleDependencies", () => {
  test("extracts Kotlin DSL project dependencies", () => {
    const script = `
      dependencies {
        implementation(project(":core:common"))
        api(project(":core:ui"))
        ksp(project(":core:processor"))
        implementation("androidx.core:core-ktx:1.12.0")
      }
    `
    const deps = parseModuleDependencies(script)
    expect(deps).toContain(":core:common")
    expect(deps).toContain(":core:ui")
    expect(deps).toContain(":core:processor")
    expect(deps).toHaveLength(3)
  })

  test("extracts Groovy DSL project dependencies", () => {
    const script = `
      dependencies {
        implementation project(':feature:login')
        testImplementation project(':test:fixtures')
      }
    `
    const deps = parseModuleDependencies(script)
    expect(deps).toContain(":feature:login")
    expect(deps).toContain(":test:fixtures")
  })

  test("deduplicates repeated dependencies", () => {
    const script = `implementation(project(":core")) ; debugImplementation(project(":core"))`
    expect(parseModuleDependencies(script)).toEqual([":core"])
  })

  test("returns empty for a script with no module deps", () => {
    expect(parseModuleDependencies(`implementation("androidx.core:core-ktx:1.12.0")`)).toEqual([])
  })
})
