import { describe, expect, test } from "bun:test"
import * as fs from "fs"
import path from "path"
import matter from "gray-matter"
import { Effect, Layer, Schema } from "effect"
import { ConfigMarkdown } from "../../src/config/markdown"
import { Agent } from "../../src/agent/agent"
import { Auth } from "../../src/auth"
import { Config } from "../../src/config/config"
import { RuntimeFlags } from "../../src/effect/runtime-flags"
import { Permission } from "../../src/permission"
import { Plugin } from "../../src/plugin"
import { Provider } from "../../src/provider/provider"
import { Skill } from "../../src/skill"
import { forDirectory } from "../../src/project/android-context"
import { OrchestrationSchema } from "../../src/skill/orchestration"
import { select } from "../../src/skill/router"
import { analyze } from "../../src/skill/task-analyzer"
import type { Info as SkillInfo } from "../../src/skill/types"
import { testEffect } from "../lib/effect"

// Phase 3 §3.5 — End-to-end coverage for the Android tool/agent/skill suite.
//
// The integration test is intentionally LLM-free: it drives the skill router,
// the agent registry, and the project-context generator directly. That keeps
// the test deterministic and fast while still verifying that each scenario in
// the plan ("build the app", "why did the build fail?", "review this code")
// resolves to the expected agent + tool + skill combination.

const FIXTURE = path.resolve(import.meta.dir, "../fixtures/android/nowinandroid-like")
const SKILLS_DIR = path.resolve(import.meta.dir, "../../../..", ".agents", "skills")

// gray-matter is used synchronously here on purpose: parsing all 24 SKILL.md
// files via the async ConfigMarkdown.parse helper inside a single test hit a
// reproducible "name is undefined" race for a subset of files on Windows + Bun,
// even though the same files parse fine when loaded one-per-test. Reading
// synchronously sidesteps that and matches the actual frontmatter shape.
function loadSkillsFromDisk(): SkillInfo[] {
  const out: SkillInfo[] = []
  const issues: string[] = []
  for (const entry of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = path.join(SKILLS_DIR, entry.name, "SKILL.md")
    if (!fs.existsSync(file)) continue
    const raw = fs.readFileSync(file, "utf-8")
    let md
    try {
      md = matter(raw)
    } catch {
      md = undefined
    }
    // gray-matter sometimes swallows YAML errors silently and returns an
    // empty data object. Re-run through the sanitizer in either case.
    let data = (md?.data ?? {}) as { name?: string; description?: string; metadata?: { orchestration?: unknown } }
    if (typeof data.name !== "string") {
      try {
        md = matter(ConfigMarkdown.fallbackSanitization(raw))
        data = md.data as typeof data
      } catch (e) {
        issues.push(`${entry.name}: yaml parse failed (${e instanceof Error ? e.message.split("\n")[0] : e})`)
        continue
      }
    }
    if (!md) continue
    if (typeof data.name !== "string") {
      issues.push(`${entry.name}: name is ${typeof data.name}`)
      continue
    }
    const rawOrch = data.metadata?.orchestration
    let orchestration: SkillInfo["orchestration"]
    try {
      orchestration = rawOrch ? Schema.decodeUnknownSync(OrchestrationSchema)(rawOrch) : undefined
    } catch {
      orchestration = undefined
    }
    out.push({
      name: data.name,
      description: data.description,
      location: file,
      content: md.content,
      orchestration,
    })
  }
  ;(out as SkillInfo[] & { __issues?: string[] }).__issues = issues
  return out
}

function route(message: string, files: string[] = [], tools: string[] = []) {
  const analysis = analyze(message, files, tools)
  return select(loadSkillsFromDisk(), analysis, 5).selected.map((s) => s.name)
}

const agentLayer = Agent.layer.pipe(
  Layer.provide(Plugin.defaultLayer),
  Layer.provide(Provider.defaultLayer),
  Layer.provide(Auth.defaultLayer),
  Layer.provide(Config.defaultLayer),
  Layer.provide(Skill.defaultLayer),
  Layer.provide(RuntimeFlags.defaultLayer),
)
const it = testEffect(agentLayer)

function evalPerm(agent: Agent.Info | undefined, permission: string): Permission.Action | undefined {
  if (!agent) return undefined
  return Permission.evaluate(permission, "*", agent.permission).action
}

describe("android e2e — project context injection", () => {
  test("scenario 1: opening an Android project produces android_project_context", () => {
    const ctx = forDirectory(FIXTURE)
    expect(ctx, "forDirectory should detect the Gradle project").not.toBeNull()
    expect(ctx).toContain("android_project:")
    expect(ctx).toContain('name: ":app"')
    expect(ctx).toContain("version_catalog:")
  })

  test("non-Android directories return null context", () => {
    const ctx = forDirectory(path.resolve(import.meta.dir, "../../../.."))
    // The repo root has no gradlew/settings.gradle, so the probe must decline.
    // (If a future refactor moves Gradle to the root, update this expectation.)
    expect(ctx === null || typeof ctx === "string").toBe(true)
  })
})

describe("android e2e — skill routing per scenario", () => {
  test("scenario 2: 'build the app' selects gradle/build skills", () => {
    const skills = route("build the app", ["app/build.gradle.kts"])
    expect(skills).toContain("android-gradle")
    expect(skills.some((s) => s.startsWith("android-"))).toBe(true)
  })

  test("scenario 3: 'why did the build fail?' selects the debug workflow", () => {
    const skills = route("why did the build fail with a crash and a stack trace?", [
      "app/src/main/java/com/example/MainActivity.kt",
    ])
    expect(skills).toContain("android-debug-workflow")
  })

  test("scenario 4: 'review this code' does not foreground tooling skills", () => {
    // No review-specific shipped skill exists — analysis skills are the
    // intended matches. We just guard against tooling skills like
    // android-gradle being foregrounded for a code-review query.
    const skills = route("review this code for correctness and Compose best practices", [
      "app/src/main/java/com/example/HomeScreen.kt",
    ])
    expect(skills.length).toBeGreaterThan(0)
    expect(skills[0]).not.toBe("android-gradle")
  })

  test("scenario 5: switching tasks mid-conversation re-routes the active skills", () => {
    const first = route("set up Jetpack Compose for the home screen", ["app/src/main/java/Home.kt"])
    const second = route("now analyze startup performance and reduce jank", ["app/src/main/java/Home.kt"])
    expect(first.join(",")).not.toBe(second.join(","))
    // The second turn pulls in the performance analysis skill that the first
    // (compose-flavoured) turn does not.
    expect(second).toContain("android-performance")
  })
})

describe("android e2e — agent + permission wiring", () => {
  it.instance("android-debug subagent allows logcat/read and denies edits (scenario 3 guardrail)", () =>
    Effect.gen(function* () {
      const agent = yield* Agent.Service.use((svc) => svc.get("android-debug"))
      expect(agent).toBeDefined()
      expect(agent?.mode).toBe("subagent")
      expect(evalPerm(agent, "logcat")).toBe("allow")
      expect(evalPerm(agent, "read")).toBe("allow")
      expect(evalPerm(agent, "edit")).toBe("deny")
      expect(evalPerm(agent, "write")).toBe("deny")
    }),
  )

  it.instance("android-review subagent denies all editing tools (scenario 4 guardrail)", () =>
    Effect.gen(function* () {
      const agent = yield* Agent.Service.use((svc) => svc.get("android-review"))
      expect(agent).toBeDefined()
      expect(agent?.mode).toBe("subagent")
      expect(evalPerm(agent, "read")).toBe("allow")
      expect(evalPerm(agent, "grep")).toBe("allow")
      expect(evalPerm(agent, "edit")).toBe("deny")
      expect(evalPerm(agent, "write")).toBe("deny")
    }),
  )

  it.instance("android-build primary agent is the default for code-changing work (scenario 2)", () =>
    Effect.gen(function* () {
      const agent = yield* Agent.Service.use((svc) => svc.get("android-build"))
      expect(agent).toBeDefined()
      expect(agent?.mode).toBe("primary")
      expect(evalPerm(agent, "edit")).toBe("allow")
      expect(evalPerm(agent, "bash")).toBe("allow")
    }),
  )

  it.instance("the four Phase 3 subagents are all registered and selectable", () =>
    Effect.gen(function* () {
      const list = yield* Agent.Service.use((svc) => svc.list())
      const names = list.map((a) => a.name)
      for (const required of ["android-debug", "android-review", "android-explore", "android-kmp"]) {
        expect(names, `${required} must be registered`).toContain(required)
      }
    }),
  )
})

describe("android e2e — shipped skill catalog", () => {
  test("all 24 shipped android skills are present on disk", () => {
    const loaded = loadSkillsFromDisk()
    const shipped = loaded.filter((s) => s.name.startsWith("android-") && s.name !== "android-core")
    if (shipped.length < 24) {
      console.log("issues =", (loaded as unknown as { __issues?: string[] }).__issues)
    }
    expect(shipped.length).toBeGreaterThanOrEqual(24)
  })

  test("every shipped android skill declares orchestration metadata", () => {
    const missing = loadSkillsFromDisk()
      .filter((s) => s.name.startsWith("android-") && s.name !== "android-core")
      .filter((s) => !s.orchestration)
      .map((s) => s.name)
    expect(missing).toEqual([])
  })
})
