import { describe, expect, test } from "bun:test"
import * as path from "path"
import { Effect, Layer, ManagedRuntime } from "effect"
import { scan, parseVersionCatalogFromPath, Service as IntelService, layer as IntelLayer } from "../../src/project/android-intelligence"
import { generate, forDirectory } from "../../src/project/android-context"
import { Service as ProbeService, type AndroidProbeResult } from "../../src/tool/android/probe"

const fixtures = path.join(import.meta.dir, "../fixtures/android")
const nowInAndroid = path.join(fixtures, "nowinandroid-like")
const minimal = path.join(fixtures, "minimal-single-module")
const kmp = path.join(fixtures, "kmp-shared")
const empty = path.join(fixtures, "this-dir-does-not-exist")

// --- Gradle detection ---
describe("scan() — gradle detection", () => {
  test("detects gradle in nowinandroid-like", () => expect(scan(nowInAndroid).hasGradle).toBe(true))
  test("detects gradlew wrapper", () => expect(scan(nowInAndroid).hasWrapper).toBe(true))
  test("detects kts build script type", () => expect(scan(nowInAndroid).buildScriptType).toBe("kts"))
  test("returns hasGradle=false for non-android dir", () => expect(scan(empty).hasGradle).toBe(false))
})

// --- Version catalog ---
describe("scan() — version catalog", () => {
  test("parses versions from libs.versions.toml", () => {
    const p = scan(nowInAndroid)
    expect(p.versionCatalog?.versions["kotlin"]).toBe("2.0.0")
    expect(p.versionCatalog?.versions["agp"]).toBe("8.4.0")
  })
  test("lists library keys", () => {
    expect(scan(nowInAndroid).versionCatalog?.libraryKeys).toContain("hilt-android")
  })
  test("lists plugin keys", () => {
    expect(scan(nowInAndroid).versionCatalog?.pluginKeys).toContain("android-application")
  })
  test("returns undefined versionCatalog when catalog absent", () => {
    expect(scan(minimal).versionCatalog).toBeUndefined()
  })
  test("parseVersionCatalogFromPath returns null on malformed toml", () => {
    const result = parseVersionCatalogFromPath(path.join(nowInAndroid, "gradle/libs.versions.malformed.toml"))
    expect(result).toBeNull()
  })
})

// --- Module discovery ---
describe("scan() — module discovery", () => {
  test("discovers all modules in nowinandroid-like", () => {
    const names = scan(nowInAndroid).modules.map((m) => m.name)
    expect(names).toContain(":app")
    expect(names).toContain(":feature:home")
    expect(names).toContain(":core:network")
  })
  test("classifies :app as type 'app'", () => {
    expect(scan(nowInAndroid).modules.find((m) => m.name === ":app")?.type).toBe("app")
  })
  test("classifies :feature:home as type 'feature'", () => {
    expect(scan(nowInAndroid).modules.find((m) => m.name === ":feature:home")?.type).toBe("feature")
  })
  test("classifies :core:network as type 'core'", () => {
    expect(scan(nowInAndroid).modules.find((m) => m.name === ":core:network")?.type).toBe("core")
  })
  test("discovers single module in minimal", () => {
    expect(scan(minimal).modules.length).toBe(1)
    expect(scan(minimal).modules[0].name).toBe(":app")
  })
  test("discovers :shared and :androidApp in kmp fixture", () => {
    const names = scan(kmp).modules.map((m) => m.name)
    expect(names).toContain(":shared")
    expect(names).toContain(":androidApp")
  })
})

// --- KMP + convention plugins ---
describe("scan() — KMP and convention plugins", () => {
  test("detects KMP in kmp-shared", () => expect(scan(kmp).isKmp).toBe(true))
  test("no KMP in minimal", () => expect(scan(minimal).isKmp).toBe(false))
  test("detects build-logic dir in nowinandroid-like", () => {
    expect(scan(nowInAndroid).conventionPluginDirs).toContain("build-logic")
  })
  test("empty conventionPluginDirs in minimal", () => {
    expect(scan(minimal).conventionPluginDirs).toHaveLength(0)
  })
})

// --- Effect service ---
function makeProbeLayer(result: AndroidProbeResult) {
  return Layer.succeed(ProbeService, ProbeService.of({ status: () => Effect.succeed(result) }))
}

describe("AndroidIntelligence Effect service", () => {
  test("detect() returns GradleProfile when android describe unavailable", async () => {
    const rt = ManagedRuntime.make(IntelLayer.pipe(Layer.provide(makeProbeLayer({ present: false, availableSubcommands: [], platformCaveats: [] }))))
    const profile = await rt.runPromise(Effect.gen(function* () { const svc = yield* IntelService; return yield* svc.detect(nowInAndroid) }))
    expect(profile.hasGradle).toBe(true)
    expect(profile.androidDescribeOutput).toBeUndefined()
    await rt.dispose()
  })
  test("detect() does not throw when describe available but CLI absent", async () => {
    const rt = ManagedRuntime.make(IntelLayer.pipe(Layer.provide(makeProbeLayer({ present: true, version: "1.0.0", availableSubcommands: ["describe"], platformCaveats: [] }))))
    const profile = await rt.runPromise(Effect.gen(function* () { const svc = yield* IntelService; return yield* svc.detect(minimal) }))
    expect(profile.hasGradle).toBe(true)
    await rt.dispose()
  })
})

// --- YAML generator ---
describe("android-context.ts — YAML generator", () => {
  test("generate() includes android_project: root key", () => {
    expect(generate(scan(nowInAndroid))).toContain("android_project:")
  })
  test("generate() lists module names", () => {
    const yaml = generate(scan(nowInAndroid))
    expect(yaml).toContain(":app")
    expect(yaml).toContain(":feature:home")
  })
  test("generate() includes version catalog versions", () => {
    const yaml = generate(scan(nowInAndroid))
    expect(yaml).toContain('kotlin: "2.0.0"')
  })
  test("generate() marks kmp: false for non-KMP project", () => {
    expect(generate(scan(minimal))).toContain("kmp: false")
  })
  test("generate() marks kmp: true for KMP project", () => {
    expect(generate(scan(kmp))).toContain("kmp: true")
  })
  test("forDirectory() returns YAML for android project", () => {
    expect(forDirectory(nowInAndroid)).toContain("android_project:")
  })
  test("forDirectory() returns null for non-android dir", () => {
    expect(forDirectory(empty)).toBeNull()
  })
})
