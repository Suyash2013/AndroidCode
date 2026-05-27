import { Effect, Schema } from "effect"
import * as fs from "fs"
import path from "path"
import * as Tool from "../tool"
import { InstanceState } from "@/effect/instance-state"
import { scan } from "@/project/android-intelligence"
import DESCRIPTION from "./module-graph.txt" with { type: "text" }

export const Parameters = Schema.Struct({
  module: Schema.optional(Schema.String).annotate({
    description: "Limit the graph to a single module's direct dependencies (e.g. ':app').",
  }),
})

type ModuleGraphMetadata = Record<string, unknown>

// Pure helper: extract project (module) dependencies from a Gradle build script.
// Matches both Kotlin DSL `implementation(project(":foo"))` and Groovy
// `implementation project(':foo')`, across all configurations (api, ksp, etc.).
export function parseModuleDependencies(buildScript: string): string[] {
  const deps = new Set<string>()
  const re = /\bproject\s*\(\s*["'](:[^"']+)["']\s*\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(buildScript)) !== null) deps.add(m[1])
  return Array.from(deps)
}

function readBuildScript(cwd: string, relativePath: string): string {
  for (const name of ["build.gradle.kts", "build.gradle"]) {
    try {
      return fs.readFileSync(path.join(cwd, relativePath, name), "utf-8")
    } catch {
      continue
    }
  }
  return ""
}

export const ModuleGraphTool = Tool.define(
  "module-graph",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, _ctx: Tool.Context) =>
        Effect.gen(function* () {
          const { module } = params
          const cwd = (yield* InstanceState.context).directory
          const profile = yield* Effect.sync(() => scan(cwd))
          if (!profile.hasGradle || profile.modules.length === 0) {
            return {
              title: "module-graph",
              output: "No Gradle modules found (is this an Android/Gradle project?).",
              metadata: { error: true, code: "NO_MODULES" } as ModuleGraphMetadata,
            }
          }

          const targets = module ? profile.modules.filter((mod) => mod.name === module) : profile.modules
          const graph: Record<string, string[]> = {}
          for (const mod of targets) {
            const script = yield* Effect.sync(() => readBuildScript(cwd, mod.relativePath))
            graph[mod.name] = parseModuleDependencies(script)
          }

          const lines = Object.entries(graph)
            .toSorted(([a], [b]) => a.localeCompare(b))
            .map(([name, deps]) => `${name} -> ${deps.length ? deps.join(", ") : "(no module deps)"}`)

          return {
            title: module ? `module-graph ${module}` : "module-graph",
            output: lines.join("\n"),
            metadata: { graph, moduleCount: targets.length } as ModuleGraphMetadata,
          }
        }).pipe(Effect.orDie),
    }
  }),
)
